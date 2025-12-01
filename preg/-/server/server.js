// server/server.js
// Sample Express server that handles PDF file uploads and runs OCR with Google Vision.
// Requires GOOGLE_APPLICATION_CREDENTIALS and a configured GCS bucket.

const express = require('express');
const multer = require('multer');
const {Storage} = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: '/tmp/uploads' });
const app = express();
const port = process.env.PORT || 3000;

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const bucketName = process.env.OCR_BUCKET_NAME; // e.g., 'my-ocr-bucket'

let storageClient, visionClient;
if (projectId && process.env.GOOGLE_APPLICATION_CREDENTIALS && bucketName) {
  storageClient = new Storage();
  visionClient = new vision.ImageAnnotatorClient();
} else {
  console.warn('Google Cloud credentials or bucket not configured. Server OCR will not run Google Vision.');
}

function parseProfileFromText(text) {
  const result = {};
  // (Copy of parse function used in client)
  let ageMatch = text.match(/나이\s*[:：]?\s*(\d{1,3})/i);
  if (!ageMatch) ageMatch = text.match(/(\d{1,3})\s*세/);
  if (!ageMatch) ageMatch = text.match(/만\s*(\d{1,3})/);
  if (ageMatch) result.age = parseInt(ageMatch[1] || ageMatch[0], 10);
  let incomeMatch = text.match(/(10|[1-9])\s*분위/);
  if (incomeMatch) result.incomeBracket = String(incomeMatch[1]);
  else { let incomeNum = text.match(/소득\s*분위\s*[:：]?\s*(10|[1-9])/i); if (incomeNum) result.incomeBracket = String(incomeNum[1]); }
  const regions = ['서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','전북','전남','경북','경남','제주','기타'];
  for (const r of regions) { if (text.includes(r)) { result.region = r; break; } }
  let childrenMatch = text.match(/자녀\s*[:：]?\s*(\d+)/);
  if (!childrenMatch) childrenMatch = text.match(/자녀\s*(\d+)\s*명/);
  if (!childrenMatch) childrenMatch = text.match(/(\d+)\s*자녀/);
  if (childrenMatch) result.children = parseInt(childrenMatch[1] || childrenMatch[0], 10);
  return result;
}

// Uploads to GCS and runs async document text detection
async function runVisionDocumentTextDetection(gcsUri) {
  const request = {
    requests: [
      {
        inputConfig: {
          // Supported mimeType: application/pdf and image/tiff
          mimeType: 'application/pdf',
          gcsSource: { uri: gcsUri }
        },
        features: [ { type: 'DOCUMENT_TEXT_DETECTION' } ],
        outputConfig: { gcsDestination: { uri: `gs://${bucketName}/vision-output/` } }
      }
    ]
  };
  const [operation] = await visionClient.asyncBatchAnnotateFiles(request);
  console.log('Waiting for operation to complete...');
  const [filesResponse] = await operation.promise();
  // The API writes JSON files to the output GCS prefix. We'll list objects with prefix and read them
  const outputPrefix = 'vision-output/';
  const [files] = await storageClient.bucket(bucketName).getFiles({ prefix: outputPrefix });
  let fullText = '';
  for (const f of files) {
    // Only read JSON outputs (usually with name 'output-1-to-...' ).
    if (!f.name.endsWith('.json')) continue;
    const tmpFile = path.join('/tmp', path.basename(f.name));
    await f.download({ destination: tmpFile });
    const json = JSON.parse(fs.readFileSync(tmpFile));
    // the response structure: json.responses[0].fullTextAnnotation.text
    if (json && json.responses && json.responses[0] && json.responses[0].fullTextAnnotation) {
      fullText += json.responses[0].fullTextAnnotation.text + '\n';
    }
    fs.unlinkSync(tmpFile);
  }
  return fullText;
}

app.post('/api/ocr', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file required' });
    if (!storageClient || !visionClient) return res.status(500).json({ error: 'Google Vision not configured on server' });

    const gcsFileName = `uploads/${Date.now()}-${req.file.originalname}`;
    await storageClient.bucket(bucketName).upload(req.file.path, { destination: gcsFileName });
    const gcsUri = `gs://${bucketName}/${gcsFileName}`;
    console.log('Uploaded to GCS:', gcsUri);
    // run document text detection
    const fullText = await runVisionDocumentTextDetection(gcsUri);
    // parse
    const parsed = parseProfileFromText(fullText || '');
    // return
    res.json({ text: fullText, parsed });
  } catch (err) {
    console.error('Server OCR error:', err);
    res.status(500).json({ error: 'OCR failed', details: err.message });
  } finally {
    // cleanup uploaded file
    try { if (req.file) fs.unlinkSync(req.file.path);} catch(e){}
  }
});

app.listen(port, () => {
  console.log(`OCR server listening at http://localhost:${port}`);
});
