function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const cuaHangId = getQueryParam("id");

import { db } from './firebaseInit.js';
import { collection,
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where} 
from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import {
  openDropMenuNav,
  changeStatusAccount,
  setAccountStatus,
  formatFirebaseDate,
  formatStatus,
  handleLockAccountClick,
  handleUnlockAccountClick
} from './common.js';

async function loadUserData(userId) {
  try {
    const userRef = doc(db, "NguoiDung", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      render(userData);
    } else {
      console.error("Không tìm thấy người dùng!");
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const userId = new URLSearchParams(window.location.search).get("id");
  if (userId) 
    loadUserData(userId);
});



function render(user) {
  const html = `
   <form>
    <div class="mb-3">
        <label for="idUser" class="form-label">ID</label>
        <input readonly value="${user.idNguoiDung}use" type="text" class="form-control" id="idUser" >
    </div>
      <div class="mb-3">
        <label for="firstName" class="form-label">Tên</label>
        <input readonly value="${user.hoTen}" type="text" class="form-control" id="firstName">
        </div>
        <div class="mb-3">
        <label for="phone" class="form-label">Số điện thoại</label>
        <input readonly value="${user.soDienThoai || '08465120305'}" type="tel" class="form-control" id="phone">
        </div>
        <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input readonly value="${user.email}" type="email" class="form-control" id="email">
        </div>
        <div class="mb-3">
        <label for="sex" class="form-label">Giới tính</label>
        <input readonly value="${user.gioiTinh || 'Nam'}Nữ" type="text" class="form-control" id="sex">
        </div>
        <div class="mb-3">
        <label for="dateResigter" class="form-label">Ngày tạo tài khoản</label>
        <input readonly value="${formatFirebaseDate(user.ngayDangKy)}" type="text" class="form-control" id="dateResigter">
        </div>
        <div class="mb-3">
        <div>
        <label for="status" class="form-label">Trạng thái</label>
        <input readonly value="${formatStatus(user.trangThai)}Đã khóa" type="text" class="form-control text-red" id="status" >
        </div>
        <div class="reason">Xem lý do</div>
        </div>
    </form>
    <div class="avatar">
      <img src="${user.avtUrl || './assest/img/ava.jpg'}"  alt="">
    </div>
  `;
  openDropMenuNav()
  document.querySelector(".form-js").insertAdjacentHTML('beforeend', html);

}
