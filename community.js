import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const postList = document.getElementById("post-list");
async function loadPosts() {

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    let index = 1;

  snapshot.forEach((doc) => {
    const data = doc.data();
    const email = data.userEmail || "";
    const maskedEmail = email.replace(/(.{2}).+(@.+)/, "$1***$2");
    const date = data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "";

    postList.innerHTML += `
      <tr class="border-b">
        <td>${index++}</td>
          <td class="max-w-[200px]">
          <a href="./post.html?id=${doc.id}" class="block truncate text-blue-600 hover:underline">
            ${data.title}
          </a>
        </td>
        <td>${maskedEmail}</td>
        <td>${date}</td>
      </tr>
    `;
  });
}

loadPosts();