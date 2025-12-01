import { auth, db } from "./firebase-config.js";
import {
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const title = document.getElementById("title");
const content = document.getElementById("content");
const submitBtn = document.getElementById("submit");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("로그인이 필요합니다");
    location.href = "./login.html";
  }
  currentUser = user;
  console.log(user);
  console.log(currentUser.email);
});
console.log(title, content, submitBtn);
submitBtn.addEventListener("click", async () => {
  if (!title.value || !content.value) {
    return alert("제목과 내용을 작성해주세요.");
  }
  console.log("enable");  
  console.log(addDoc);
  console.log(db);
  try {
    await addDoc(collection(db, "posts"), {
      title: title.value,
      content: content.value,
      userEmail: currentUser.email,
      createdAt: serverTimestamp(),
    });
    alert("글이 작성되었습니다.");
    window.location.href = "./community.html";
  } catch (error) {
    console.error(error);
    alert("글 작성 중 오류가 발생했습니다.");
    
  }
});