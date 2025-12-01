import { auth, db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");

const titleEl = document.getElementById("post-title");
const contentEl = document.getElementById("post-content");
const commentList = document.getElementById("comment-list");
const commentInput = document.getElementById("comment-input");
const commentBtn = document.getElementById("comment-submit");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

async function loadPost() {
  const ref = doc(db, "posts", postId);
  const snapshot = await getDoc(ref);
  const data = snapshot.data();

  titleEl.innerHTML = `<p class="whitespace-pre-line">${data.title}</p>`;
  contentEl.innerHTML = `<p class="whitespace-pre-line">${data.content}</p>`;
}

async function loadComments() {
  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);

  commentList.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();
    const email = data.userEmail || "";
    const maskedEmail = email.replace(/(.{2}).+(@.+)/, "$1***$2");
    commentList.innerHTML += `
      <span class="border-b py-2 block">
        <p class="font-semibold">${maskedEmail}</p>
        <p class="whitespace-pre-line">${data.text}</p>
      </span>
    `;
  });
}

commentBtn.addEventListener("click", async () => {
  if (!currentUser) return alert("로그인이 필요합니다.");

  await addDoc(collection(db, "posts", postId, "comments"), {
    text: commentInput.value,
    userEmail: currentUser.email,
    createdAt: serverTimestamp(),
  });

  commentInput.value = "";
  loadComments();
});

loadPost();
loadComments();