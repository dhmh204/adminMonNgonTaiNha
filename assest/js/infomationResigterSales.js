import { db } from './firebaseInit.js';
import {
  collection,
  getDocs, 
  query, 
  where, 
  doc,
  getDoc, 
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

import {
  openDropMenuNav,
  changeStatusAccount,
  setAccountStatus,
  formatFirebaseDate,
  formatStatus,
  handleLockAccountClick,
  handleUnlockAccountClick
} from './common.js';




async function getAccountCreatedDate(userId) {
  try {
    const userRef = doc(db, "NguoiDung", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const createdAt = data.ngayDangKy;

      if (createdAt && createdAt.toDate) {
        return formatFirebaseDate(createdAt); 
      } else {
        return "Không có thông tin ngày tạo";
      }
    } else {
      return "Không tìm thấy người dùng";
    }
  } catch (error) {
    console.error("Lỗi khi lấy ngày tạo tài khoản:", error);
    return "Lỗi khi truy xuất";
  }
}
async function loadUserData(userId) {
  try {
    const userRef = doc(db, "CuaHang", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const ngayDangKy = await getAccountCreatedDate(userId); // Gọi bất đồng bộ
      render(userData, ngayDangKy); // Truyền vào hàm render
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



function render(user, ngayDangKy) {
  const html = `
    <form>
        <div class="mb-3">
            <label for="idUser" class="form-label">ID</label>
            <input readonly value="${user.idCuaHang}" type="text" class="form-control" id="idUser" >
        </div>
        <div class="mb-3">
            <label for="nameShop" class="form-label">Tên cửa hàng</label>
            <input readonly value="${user.tenCuaHang}" type="text" class="form-control" id="nameShop">
        </div>
        <div class="mb-3">
            <label for="address" class="form-label">Địa chỉ cửa hàng</label>
            <input readonly value="${user.diaChiCuaHang}" type="text" class="form-control" id="address">
        </div>
        <div class="mb-3">
            <label for="phone" class="form-label">Số điện thoại cửa hàng</label>
            <input readonly value="${user.soDienThoaiCuaHang}" type="tel" class="form-control" id="phone">
        </div>
        <div class="mb-3">
            <label for="email" class="form-label">Email cửa hàng</label>
            <input readonly value="${user.emailCuaHang}" type="email" class="form-control" id="email">
        </div>
        <div class="mb-3">
            <label for="storeOwnerName" class="form-label">Tên chủ pháp lý cửa hàng</label>
            <input readonly value="${user.tenChuCuaHang}" type="text" class="form-control" id="storeOwnerName">
        </div>
        <div class="mb-3">
            <label for="storeOwnerEmail" class="form-label">Email của chủ cửa hàng</label>
            <input readonly value="${user.emaiChuCuaHang}" type="email" class="form-control" id="storeOwnerEmail">
        </div>

        <div class="papers mb-3">
            <div class="papers-item citizen-identification">
                <div class="label">Căn cước công dân</div>
                <div class="imgs d-flex">
                    <img src="${user.giayToCuaHang?.canCuocCongDanMatTruocUrl || './assest/img/example.png'}" alt="">
                    <img src="${user.giayToCuaHang?.canCuocCongDanMatSauUrl || './assest/img/example.png'}" alt="">
                </div>
            </div> 
            <div class="papers-item">
                <div class="label">Giấy phép đăng ký kinh doanh</div>
                <div class="imgs d-flex">
                    <img src="${user.giayToCuaHang?.giayPhepKinhDoanhUrl || './assest/img/example.png'}" alt="">
                </div>
            </div> 
            <div class="papers-item">
                <div class="label">Giấy an toàn vệ sinh thực phẩm</div>
                <div class="imgs d-flex">
                    <img src="${user.giayToCuaHang?.anToanVeSinhThucPhamUrl || './assest/img/example.png'}" alt="">
                </div>
            </div> 
        </div>

        <div class="mb-3">
            <label for="dateResigter" class="form-label">Ngày tạo tài khoản</label>
            <input readonly value="${ngayDangKy}" type="text" class="form-control" id="dateResigter">
        </div>

        <div class="mb-3">
            <label for="status" class="form-label">Trạng thái</label>
            <input readonly value="Chờ duyệt" type="text" class="form-control text-red" id="status" >
        </div>
    </form>

    <div class="avatar">
    <img src="${user.avtCuaHangUrl || './assest/img/ava.jpg'}"  alt="">
    </div>
  `;
  openDropMenuNav()
  document.querySelector(".form-js").insertAdjacentHTML('beforeend', html);

}



async function approveUser(userId) {
  try {
    console.log("Đang duyệt user ID:", userId);

    await updateDoc(doc(db, "CuaHang", userId), {
      trangThaiChoDuyet: "DaDuyet", 
      tinhTrangQuan: "HetBan", 
      trangThai: "DangHoatDong", 

    });

    // Cập nhật quyền trong bảng NguoiDung
    const userDocRef = doc(db, "NguoiDung", userId);
    await updateDoc(userDocRef, {
      danhSachQuyen: arrayUnion("CuaHang")
    });

    alert("Duyệt thành công!");
    window.history.back();
  } catch (error) {
    alert("Duyệt thất bại: " + error.message);
  }
}
async function refuseUser(userId) {
  try {
    await updateDoc(doc(db, "CuaHang", userId), {
      trangThaiChoDuyet: "TuChoi"
    });

    alert("Đã từ chối cửa hàng.");
    window.history.back();
  } catch (error) {
    console.error("Lỗi khi từ chối:", error);
    alert("Từ chối thất bại!");
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const userId = new URLSearchParams(window.location.search).get("id");

  if (!userId) return;

  document.getElementById("btn-accept").addEventListener("click", () => {
    console.log("Duyệt user có ID:", userId);
    approveUser(userId);
  });

  document.getElementById("btn-refuse").addEventListener("click", () => {
    console.log("Duyệt user có ID:", userId);
    refuseUser(userId);
  });
});