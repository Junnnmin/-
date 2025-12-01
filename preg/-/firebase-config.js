// firebase-config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// TODO: 본인의 Firebase 프로젝트 웹 앱 설정 값으로 교체하세요.
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDA8vJ90ySuLMA3RXT4EzORmeqUTPP0T7A",
  authDomain: "oddsmyn.firebaseapp.com",
  projectId: "oddsmyn",
  storageBucket: "oddsmyn.firebasestorage.app",
  messagingSenderId: "443715102078",
  appId: "1:443715102078:web:7c5c3dbeb207ecde5d7f2f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase 인증 서비스 객체 가져오기
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase Config:", firebaseConfig);
