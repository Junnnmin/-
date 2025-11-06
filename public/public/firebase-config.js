// firebase-config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// TODO: 본인의 Firebase 프로젝트 웹 앱 설정 값으로 교체하세요.
const firebaseConfig = {
  apiKey: "AIzaSyBrRy2ZTTTI4I50Sl3LSTyanJqbl-Wl_Xk",
  authDomain: "pregnant-c39b0.firebaseapp.com",
  projectId: "pregnant-c39b0",
  storageBucket: "pregnant-c39b0.firebasestorage.app",
  messagingSenderId: "714300044897",
  appId: "1:714300044897:web:a5a3911425b82eb52edc20",
  measurementId: "G-WZ8M3J8K8S",
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 인증 서비스 객체 가져오기
export const auth = getAuth(app);
