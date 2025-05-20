import { db } from './firebaseInit.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

async function getAllUsers() {
  const querySnapshot = await getDocs(collection(db, "NguoiDung"));
  const list = document.getElementById("user-list");

  querySnapshot.forEach((doc) => {
    const user = doc.data();
    const li = document.createElement("li");
    li.textContent = `ID: ${doc.id} - Họ tên: ${user.hoTen}`;
    list.appendChild(li);
  });
}

getAllUsers();
