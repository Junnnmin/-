// auth.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase-config.js";

// --- 인증 기능 ---

// 1. 이메일로 회원가입
export const signUpWithEmail = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// 2. 이메일로 로그인
export const signInWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// 3. 로그아웃
export const signOutUser = () => {
  return signOut(auth);
};

// --- UI 관리 ---

/**
 * 모든 페이지 상단 네비게이션 바의 UI를 현재 로그인 상태에 맞게 업데이트합니다.
 * @param {object | null} user - Firebase Auth 사용자 객체
 */
const setupAuthUI = (user) => {
  const loginNav = document.getElementById("login-nav");
  const profileNav = document.getElementById("profile-nav");

  if (user) {
    // 사용자가 로그인한 경우
    loginNav.style.display = "none";    // '로그인' 탭 숨기기
    profileNav.style.display = "flex";  // '프로필' 아이콘 보이기
  } else {
    // 사용자가 로그아웃한 경우
    loginNav.style.display = "flex";    // '로그인' 탭 보이기
    profileNav.style.display = "none";  // '프로필' 아이콘 숨기기
  }
};

// 4. 인증 상태 변경 감지
// 페이지가 로드될 때마다 실행되어 사용자의 로그인 상태를 확인하고 UI를 업데이트합니다.
onAuthStateChanged(auth, (user) => {
  setupAuthUI(user);
});