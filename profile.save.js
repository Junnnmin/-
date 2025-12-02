// profile.save.js
// 프로필 저장/불러오기 로직 (ES module)
import { onAuthChange } from './auth.js';
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

const userEmailEl = document.getElementById("user-email");
// In HTML the form id is `info-form` (profile.html) — match it here.
const profileForm = document.getElementById("info-form");
const snackbarEl = document.getElementById('snackbar');
const snackbarMessageEl = document.getElementById('snackbar-message');

let currentUser = null;

// auth 상태 감지
// Listen to auth state via auth.js to avoid duplicating onAuthStateChanged
onAuthChange(async (user) => {
    if (!user) {
      // 로그인 안 된 사용자 처리: 로그인 페이지로 이동
      userEmailEl.textContent = "로그인 필요";
      window.location.href = "./login.html";
      return;
    }
  currentUser = user;
  userEmailEl.textContent = user.email || "";

  // Firestore에서 프로필 불러오기
  try {
    const profileRef = doc(db, "profiles", user.uid);
    const snapshot = await getDoc(profileRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      // 폼 필드에 채우기(필드 이름은 profile.html의 input id와 맞춰서 수정)
      // Map stored fields to the inputs used in profile.html
      if (typeof data.age !== 'undefined') document.getElementById("age").value = data.age;
      if (typeof data.incomeBracket !== 'undefined') document.getElementById("income-bracket").value = data.incomeBracket;
      if (typeof data.region !== 'undefined') document.getElementById("region").value = data.region;
      if (typeof data.children !== 'undefined') document.getElementById("children").value = data.children;
      // ... 필요하면 추가 필드 채우기
    } else {
      // 문서 없음 = 새 프로필
      console.log("프로필 문서가 없습니다. 새로 작성하세요.");
    }
  } catch (err) {
    console.error("프로필 불러오기 실패:", err);
  }
});

// 폼 제출(저장)
  if (profileForm) {
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("로그인 후 이용하세요.");

    // 폼 값 읽기 (profile.html의 input id에 맞춰서 읽음)
    // Read profile fields from profile.html inputs
    const age = parseInt(document.getElementById("age").value || "0", 10);
    const incomeBracket = document.getElementById("income-bracket").value;
    const region = document.getElementById("region").value;
    const children = parseInt(document.getElementById("children").value || "0", 10);

    // 검증(간단)
    if (!age || age <= 0) return alert("나이를 올바르게 입력하세요.");
    if (!incomeBracket) return alert("소득 분위를 선택하세요.");
    if (!region) return alert("거주 지역을 선택하세요.");
    if (children < 0) return alert("자녀수는 0보다 작을 수 없습니다.");

    const dataToSave = {
      age: isNaN(age) ? null : age,
      incomeBracket: incomeBracket || null,
      region: region || null,
      children: isNaN(children) ? 0 : children,
      email: currentUser.email || null,
      uid: currentUser.uid,
      updatedAt: serverTimestamp()
    };

    // UI: 저장 중 표시
    const submitBtn = profileForm.querySelector('button[type="submit"]');
    const statusEl = document.getElementById('profile-save-status');
    if (submitBtn) submitBtn.disabled = true;
    if (statusEl) { statusEl.textContent = "저장 중..."; statusEl.classList.remove('text-green-600', 'text-red-600'); }

    try {
      // profiles 컬렉션에 uid를 문서 ID로 사용
      await setDoc(doc(db, "profiles", currentUser.uid), dataToSave, { merge: true });
      // 저장 성공 시 UI 피드백
      if (statusEl) { statusEl.textContent = "프로필이 저장되었습니다."; statusEl.classList.add('text-green-600'); }
      // show snackbar briefly
      if (snackbarEl && snackbarMessageEl) {
        snackbarMessageEl.textContent = '방금 저장됨';
        snackbarEl.classList.remove('hidden');
        snackbarEl.classList.add('opacity-100');
        setTimeout(() => {
          snackbarEl.classList.add('hidden');
          snackbarEl.classList.remove('opacity-100');
        }, 3000);
      }
      if (submitBtn) submitBtn.disabled = false;
    } catch (err) {
      console.error("프로필 저장 실패:", err);
      if (statusEl) { statusEl.textContent = "프로필 저장 중 오류가 발생했습니다."; statusEl.classList.add('text-red-600'); }
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
