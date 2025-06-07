function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// const cuaHangId = getQueryParam("id");

import { db } from './firebaseInit.js';

import { 
  doc,
  getDoc, 
  updateDoc,
  arrayUnion
} 
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
    const shipperRef = doc(db, "Shipper", userId);
    const userRef = doc(db, "NguoiDung", userId);

    const shipperSnap = await getDoc(shipperRef);
    const userSnap = await getDoc(userRef);


    if (shipperSnap.exists() && userSnap.exists()) {
      const shipperData = shipperSnap.data();
      const userData = userSnap.data();

      render(shipperData, userData);
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



function render(shipper, user) {
  const html = `
  <form>
    <div class="mb-3">
        <label for="idUser" class="form-label">ID</label>
        <input readonly value="${shipper.idShipper}" type="text" class="form-control" id="idUser" >
    </div>
    <div class="mb-3">
        <label for="fullName" class="form-label">Họ và tên</label>
        <input readonly value="${user.hoTen}" type="text" class="form-control" id="fullName">
    </div>
      <div class="mb-3">
        <label for="phone" class="form-label">Số điện thoại</label>
        <input readonly value="${user.soDienThoai || "N/A"}" type="tel" class="form-control" id="lastName">
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input readonly value="${user.email}" type="email" class="form-control" id="email">
      </div>
        <div class="mb-3">
        <label for="sex" class="form-label">Giới tính</label>
        <input readonly value="${user.gioiTinh || "Nam"}" type="text" class="form-control" id="sex">
        </div>
    <div class="papers mb-3">
        <div class="papers-item citizen-identification">
            <div class="label">Căn cước công dân</div>
            <div class="imgs d-flex">
                <img src="${shipper.giayToShipper?.canCuocCongDanMatTruocUrl || './assest/img/example.png'}" alt="">
                <img src="${shipper.giayToShipper?.canCuocCongDanMatSauUrl || './assest/img/example.png'}" alt="">
            </div>
        </div> 
        <div class="papers-item driving-license">
            <div class="label">Giấy phép lái xe</div>
            <div class="imgs d-flex">
                <img src="${shipper.giayToShipper?.giayPhepLaiXeUrl || './assest/img/example.png'}" alt="">
            </div>
        </div> 
        <div class="papers-item judicial-record">
            <div class="label">Lý lịch tư pháp</div>
            <div class="imgs d-flex">
                <img src="${shipper.giayToShipper?.giayLyLichTuPhapUrl || './assest/img/example.png'}" alt="">
            </div>
        </div> 
        <div class=" papers-item driving-license">
            <div class="label">Giấy đăng ký xe mô tô</div>
            <div class="imgs d-flex">
                <img src="${shipper.giayToShipper?.canCuocCongDanMatTruocUrl || './assest/img/example.png'}" alt="">
            </div>

        </div>  
        <div class=" papers-item ">
            <div class="label">Bảo hiểm trách nhiệm dân sự</div>
            <div class="imgs d-flex">
                <img src="${shipper.giayToShipper?.baoHiemTrachNhiemDanSuUrl || './assest/img/example.png'}" alt="">
            </div>
        </div> 
    </div>
     <div class="mb-3">
        <label for="dateResigter" class="form-label">Ngày tạo tài khoản</label>
        <input readonly value="${formatFirebaseDate(shipper.ngayDangKy)}" type="text" class="form-control" id="dateResigter">
        </div>
        <div class="mb-3">
        <div>
        <label for="status" class="form-label">Trạng thái</label>
        <input readonly value="Chờ duyệt" type="text" class="form-control text-red" id="status" >
        </div>
        </div>
    </form>
   <div class="avatar mt-3">
    <img src="${shipper.giayToShipper?.avtShipperUrl || './assest/img/ava.png'}" alt="avatar" class="img-thumbnail">
  </div>
  `;
  openDropMenuNav()
  document.querySelector(".form-js").insertAdjacentHTML('beforeend', html);

}



async function approveUser(userId) {
  try {
    console.log("Đang duyệt user ID:", userId);

    await updateDoc(doc(db, "Shipper", userId), {
      trangThaiChoDuyet: "DaDuyet", 
      trangThai: "DangHoatDong", 

    });

    // Cập nhật quyền trong bảng NguoiDung
    const userDocRef = doc(db, "NguoiDung", userId);
    await updateDoc(userDocRef, {
      danhSachQuyen: arrayUnion("Shipper")
    });

    alert("Duyệt thành công!");
    window.history.back();
  } catch (error) {
    alert("Duyệt thất bại: " + error.message);
  }
}
async function refuseUser(userId) {
  try {
    const lyDo = prompt("Nhập lý do từ chối shipper:");
    if (!lyDo) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }
    await updateDoc(doc(db, "Shipper", userId), {
      trangThaiChoDuyet: "TuChoi",
      lyDoKhongDuyet: lyDo
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