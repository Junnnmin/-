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
    const date = data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "";

    postList.innerHTML += `
      <tr class="border-b">
        <td>${index++}</td>
        <td>
          <a href="./post.html?id=${doc.id}" class="text-blue-600 hover:underline">
            ${data.title}
          </a>
        </td>
        <td>${data.userEmail}</td>
        <td>${date}</td>
      </tr>
    `;
  });
}

loadPosts();