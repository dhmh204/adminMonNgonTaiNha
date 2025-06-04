import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCsIyn4exh4s5aM_sMEAtVksy6FKznP7Xk",
  authDomain: "monngontainha-75d8e.firebaseapp.com",
  projectId: "monngontainha-75d8e",
  storageBucket: "monngontainha-75d8e.firebasestorage.app",
  messagingSenderId: "623705308892",
  appId: "1:623705308892:web:95e37f944352418b81fe19"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // ✅ Khởi tạo storage

export { db, storage }; // ✅ Export thêm storage
