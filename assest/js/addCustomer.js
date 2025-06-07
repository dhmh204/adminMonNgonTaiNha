import { db, storage } from './firebaseInit.js';
import {
  collection,
  addDoc,
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

import { getDownloadURL, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-storage.js";

import {
  openDropMenuNav,
  changeStatusAccount,
  setAccountStatus,
  formatFirebaseDate,
  formatStatus,
  handleLockAccountClick,
  handleUnlockAccountClick
} from './common.js';

document.querySelector('.accept').addEventListener('click', async () => {
  const hoTen = document.getElementById("fullName").value.trim();
  const soDienThoai = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const ngaySinh = document.getElementById("brthday").value;
  const gioiTinh = document.getElementById("sex").value;
  const filesMap = window.selectedFilesMap || {};

  if (!hoTen || !soDienThoai || !email) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  let avtUrl = "";

  try {
    const newUser = {
      hoTen,
      soDienThoai,
      email,
      gioiTinh,
      ngayCapNhatTrangThai: new Date(),
      ngayDangKy: new Date(),
      trangThai: "DangHoatDong",
      danhSachQuyen: ["NguoiDung"],
      avtUrl: ""
    };

    const docRef = await addDoc(collection(db, "NguoiDung"), newUser);

    for (const [key, file] of Object.entries(filesMap)) {
      const imageRef = ref(storage, `uploads/${docRef.id}_${key}_${Date.now()}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);

      if (key === 'anhDaiDien') {
        avtUrl = url;
      } 
    }

    // Nếu chưa chọn ảnh đại diện thì dùng ảnh mặc định
    if (!avtUrl) {
      const encodedName = encodeURIComponent(hoTen.split(" ").pop());
      avtUrl = `https://letteravatar.com/s/avatar.png?text=${encodedName}&color=%23ffd54f&bg=%23455a64&font=JetBrains%20Mono`;
    }

    await setDoc(doc(db, "NguoiDung", docRef.id), {
      idNguoiDung: docRef.id,
      avtUrl: avtUrl,
    }, { merge: true });

    alert("Đã thêm người dùng!");

    document.querySelector("form").reset();
    window.selectedFilesMap = {};

    document.querySelectorAll('.image-wrapper').forEach(wrapper => {
      const note = wrapper.getAttribute('data-note') || '';
      wrapper.innerHTML = `
        <span class="plus-sign">+</span>
        <span class="note">${note}</span>
      `;
    });

    window.location.href = "./Customer.html";

  } catch (e) {
    console.error("Lỗi khi thêm người dùng:", e);
    alert("Có lỗi xảy ra khi thêm người dùng!");
  }
});


  openDropMenuNav()