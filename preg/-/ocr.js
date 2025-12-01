// ocr.js - client-side OCR for PDFs using pdf.js + Tesseract.js
// Expects pdf.js loaded as global `pdfjsLib` and tesseract loaded as global `Tesseract`.

// Heuristics to parse Korean text for profile fields
const regions = [
  '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '전북', '전남', '경북', '경남', '제주', '기타'
];

const fileInput = document.getElementById('profile-pdf');
const extractButton = document.getElementById('extract-pdf-button');
const previewButton = document.getElementById('preview-pdf-button');
const statusEl = document.getElementById('pdf-ocr-status');
const cancelButton = document.getElementById('ocr-cancel-button');
const autoSaveCheckbox = document.getElementById('ocr-auto-save');
const spinnerEl = document.getElementById('ocr-spinner');
const progressBarEl = document.getElementById('ocr-progress-bar');
const progressTextEl = document.getElementById('ocr-progress-text');
const previewContainer = document.getElementById('ocr-preview-large');

let currentWorker = null;
let isCanceled = false;

if (!fileInput || !extractButton) {
  console.warn('OCR: 필수 UI 요소를 찾을 수 없습니다. `profile-pdf` 또는 `extract-pdf-button` 없습니다.');
}

// PDF 파일을 받아, 첫 n 페이지를 캔버스 이미지로 렌더링합니다.
// Ensure pdf worker src is set up
try {
  if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';
  }
} catch (e) {
  // ignore if pdfjsLib isn't defined yet - will error later if missing
}
async function pdfToCanvases(file, maxPages = 2, scale = 1.5) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const canvases = [];
  const numPages = Math.min(pdf.numPages, maxPages);
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    const renderContext = { canvasContext: ctx, viewport };
    await page.render(renderContext).promise;
    canvases.push(canvas);
  }
  return canvases;
}

// Tesseract.js로 캔버스에서 텍스트를 추출합니다.
async function ocrCanvases(canvases, lang = 'kor+eng', onProgress) {
  // 합쳐서 텍스트 반환
  let fullText = '';
  for (let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    if (isCanceled) throw new Error('OCR 작업이 취소되었습니다.');

    // If worker is created, use it for per-page recognition (supports cancel)
    if (currentWorker) {
      const res = await currentWorker.recognize(canvas);
      fullText += '\n--- PAGE ' + (i + 1) + ' ---\n';
      fullText += res.data.text || '';
      // call a small progress update
      if (onProgress) onProgress({ status: 'done', progress: 1 }, i, canvases.length);
    } else {
      const result = await Tesseract.recognize(canvas, lang, {
        logger: (m) => onProgress && onProgress(m, i, canvases.length)
      });
      fullText += '\n--- PAGE ' + (i + 1) + ' ---\n';
      fullText += result.data.text || '';
    }
  }
  return fullText;
}

// OCR로 얻은 텍스트에서 프로필 필드를 추출합니다.
function parseProfileFromText(text) {
  const result = {};

  // 나이: look for '나이 30', '나이 : 30', '만 30', '30세'
  let ageMatch = text.match(/나이\s*[:：]?\s*(\d{1,3})/i);
  if (!ageMatch) ageMatch = text.match(/(\d{1,3})\s*세/);
  if (!ageMatch) ageMatch = text.match(/만\s*(\d{1,3})/);
  if (ageMatch) {
    result.age = parseInt(ageMatch[1] || ageMatch[0], 10);
  }

  // 소득 분위: match '1분위' ~ '10분위'
  let incomeMatch = text.match(/(10|[1-9])\s*분위/);
  if (incomeMatch) {
    result.incomeBracket = String(incomeMatch[1]);
  } else {
    // 혹시 '소득분위: 3' 같이 숫자만 있는 케이스
    let incomeNum = text.match(/소득\s*분위\s*[:：]?\s*(10|[1-9])/i);
    if (incomeNum) result.incomeBracket = String(incomeNum[1]);
  }

  // 거주 지역: simple match from regions list
  for (const r of regions) {
    if (text.includes(r)) { result.region = r; break; }
  }

  // 자녀 수: '자녀 2명', '자녀수: 1', '자녀 수 1'
  let childrenMatch = text.match(/자녀\s*[:：]?\s*(\d+)/);
  if (!childrenMatch) childrenMatch = text.match(/자녀\s*(\d+)\s*명/);
  if (!childrenMatch) childrenMatch = text.match(/(\d+)\s*자녀/);
  if (childrenMatch) result.children = parseInt(childrenMatch[1] || childrenMatch[0], 10);

  return result;
}

function showPreview(canvases) {
  previewContainer.innerHTML = '';
  canvases.forEach((canvas) => {
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.className = 'max-w-full border';
    previewContainer.appendChild(img);
  });
}

async function handleExtract() {
  if (!fileInput || fileInput.files.length === 0) return alert('PDF 파일을 업로드해주세요.');
  const file = fileInput.files[0];
  statusEl.textContent = 'PDF 읽는 중...';

    try {
      isCanceled = false;
      if (cancelButton) cancelButton.disabled = false;
      // Disable buttons, show spinner
      if (extractButton) extractButton.disabled = true;
      if (previewButton) previewButton.disabled = true;
      if (spinnerEl) spinnerEl.classList.remove('hidden');
      if (progressBarEl) progressBarEl.style.width = '0%';
      if (progressTextEl) progressTextEl.textContent = '0%';
      // Also disable the profile save submit button to avoid race
      const infoForm = document.getElementById('info-form');
      const submitBtn = infoForm ? infoForm.querySelector('button[type="submit"]') : null;
      if (submitBtn) submitBtn.disabled = true;
    const canvases = await pdfToCanvases(file, 2, 1.5);
    // show preview
    showPreview(canvases);
    statusEl.textContent = 'OCR 수행 중... 잠시 기다려주세요.';

    // Client side worker-based OCR only
      // Client side worker-based OCR
      // ensure a worker exists for better performance and cancellation
      try {
        await ensureWorkerLoaded();
      } catch (err) {
        console.warn('Worker 준비 실패, fallback할 수 있습니다.', err);
      }
      const text = await ocrCanvases(canvases, 'kor+eng', (m, pageIndex, totalPages) => {
      // Tesseract logger returns progress [0..1] for current page; aggregate across pages
      const pageProgress = m.progress || 0;
      const total = ((pageIndex) + pageProgress) / totalPages;
      const percent = Math.round(total * 100);
      if (progressBarEl) progressBarEl.style.width = percent + '%';
      if (progressTextEl) progressTextEl.textContent = percent + '%';
      if (m.status) statusEl.textContent = `OCR: ${m.status} ${percent}%`;
      });
      const parsed = parseProfileFromText(text);
      await handleParsedAndMaybeSave(parsed, text);

    // already handled via handleParsedAndMaybeSave

  } catch (err) {
    console.error('OCR 에러:', err);
    statusEl.textContent = 'OCR 처리 중 오류가 발생했습니다. 콘솔을 확인하세요.';
  }
  finally {
    // cleanup: hide spinner, re-enable UI
    if (spinnerEl) spinnerEl.classList.add('hidden');
    if (extractButton) extractButton.disabled = false;
    if (previewButton) previewButton.disabled = false;
    const infoForm = document.getElementById('info-form');
    const submitBtn = infoForm ? infoForm.querySelector('button[type="submit"]') : null;
    if (submitBtn) submitBtn.disabled = false;
    if (progressBarEl) progressBarEl.style.width = '100%';
    if (progressTextEl) progressTextEl.textContent = '100%';
    if (cancelButton) cancelButton.disabled = true;
  }
}

// preview button shows the first 2 pages as images; if no file selected, show a message
previewButton?.addEventListener('click', async () => {
  if (!fileInput || fileInput.files.length === 0) return alert('PDF 파일을 업로드해주세요.');
  const file = fileInput.files[0];
  statusEl.textContent = '미리보기 로딩 중...';
  try {
    const canvases = await pdfToCanvases(file, 2, 1);
    showPreview(canvases);
    statusEl.textContent = '미리보기 생성 완료.';
  } catch (err) {
    console.error('미리보기 오류:', err);
    statusEl.textContent = '미리보기 생성 중 오류가 발생했습니다.';
  }
});

extractButton?.addEventListener('click', handleExtract);

export { pdfToCanvases, ocrCanvases, parseProfileFromText, handleExtract };

// --- Helper functions for worker and server upload/cancel ---
async function ensureWorkerLoaded() {
  if (currentWorker) return currentWorker;
  try {
    currentWorker = Tesseract.createWorker({
      logger: (m) => {
        // propagate logs to status
        if (m.status && progressTextEl) {
          // do nothing here, page-level aggregation handles percent
        }
      }
    });
    await currentWorker.load();
    await currentWorker.loadLanguage('kor+eng');
    await currentWorker.initialize('kor+eng');
    // optionally set worker parameters here
    return currentWorker;
  } catch (err) {
    console.error('Worker 로드 중 오류:', err);
    currentWorker = null;
    throw err;
  }
}

// server upload removed: client-side OCR only

async function handleParsedAndMaybeSave(parsed, text) {
  // show parsed in status
  let msg = '추출 결과: ';
  msg += Object.keys(parsed).length ? JSON.stringify(parsed) : '필드가 감지되지 않았습니다.';
  statusEl.textContent = msg;
  // Fill the form fields (if available)
  if (parsed.age) document.getElementById('age').value = parsed.age;
  if (parsed.incomeBracket) document.getElementById('income-bracket').value = parsed.incomeBracket;
  if (parsed.region) document.getElementById('region').value = parsed.region;
  if (typeof parsed.children !== 'undefined') document.getElementById('children').value = parsed.children;
  // Auto-save if enabled
  const shouldAutoSave = autoSaveCheckbox && autoSaveCheckbox.checked;
  if (shouldAutoSave) {
    const form = document.getElementById('info-form');
    if (form && typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else if (form) {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn && submitBtn.click();
    }
  }
}

// Cancel handler
cancelButton?.addEventListener('click', () => {
  isCanceled = true;
  if (currentWorker) {
    currentWorker.terminate().then(() => { currentWorker = null; });
  }
  statusEl.textContent = '작업이 취소되었습니다.';
  if (spinnerEl) spinnerEl.classList.add('hidden');
  if (extractButton) extractButton.disabled = false;
  if (previewButton) previewButton.disabled = false;
  cancelButton.disabled = true;
});