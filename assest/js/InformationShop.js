import { db } from './firebaseInit.js';
import { collection,
  getDocs, 
  doc, 
  getDoc,  
  query,
  where, 
  orderBy  }
from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

import {
  openDropMenuNav,
  setLine, 
  handleClickTabActive,
  changeStatusAccount,
  formatFirebaseDate,
  formatStatus,
  formatStatusOrder
} from './common.js';

async function loadUserData(userId) {
  try {
    const userRef = doc(db, "CuaHang", userId);
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



function render(user) {
  const isLocked = user.trangThai === 'DaKhoa' || user.trangThai === 'Đã khóa'; // Kiểm tra trạng thái

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
        <input readonly value="${user.soDienThoaiCuaHang}" type="tel" class="form-control" id="lastName">
        </div>
        <div class="mb-3">
        <label for="email" class="form-label">Email cửa hàng</label>
        <input readonly value="${user.emailCuaHang}l.com" type="email" class="form-control" id="email">
        </div>
        <div class="mb-3">
        <label for="storeOwnerName" class="form-label">Tên chủ pháp lý cửa hàng</label>
        <input readonly value="${user.tenChuCuaHang}c Chinh" type="text" class="form-control" id="storeOwnerName">
        </div>
        <div class="mb-3">
        <label for="storeOwnerEmail" class="form-label">Email của chủ cửa hàng</label>
        <input readonly value="${user.emaiChuCuaHang}il.com" type="email" class="form-control" id="storeOwnerEmail">
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
                <img src="${user.giayToCuaHang?.giayPhepKinhDoanhUrl || './assest/img/example.png'}"  alt="">
            </div>
        </div> 
        <div class="papers-item ">
            <div class="label">Giấy an toàn vệ sinh thực phẩm</div>
            <div class="imgs d-flex">
                <img  src="${user.giayToCuaHang?.anToanVeSinhThucPhamUrl || './assest/img/example.png'}"  alt="">
            </div>
        </div> 
                              
    </div>
    <div class="mb-3">
        <label for="dateResigter" class="form-label">Ngày tạo tài khoản</label>
        <input readonly value="${formatFirebaseDate(user.ngayDangKy)}" type="text" class="form-control" id="dateResigter">
        </div>
       <div class="mb-3">
      <label for="status" class="form-label">Trạng thái</label>
      <input readonly value="${formatStatus(user.trangThai)}" type="text" class="form-control text-red" id="status">
    </div>

    ${isLocked ? `
      <div class="mb-3">
        <button type="button" class="btn btn-warning" id="show-reason-btn">Xem lý do</button>
      </div>
    ` : ''}
    
  </form>
  <div class="avatar mt-3">
    <img src="${user.avtUrl || './assest/img/ava.png'}" alt="avatar" class="img-thumbnail">
  </div>
  `;

  document.querySelector(".form-js").insertAdjacentHTML('beforeend', html);
  openDropMenuNav();
  setLine(); 
  handleClickTabActive()

  // Optional: xử lý sự kiện "Xem lý do"
  if (isLocked) {
    document.getElementById('show-reason-btn').addEventListener('click', () => {
      alert(user.lyDoKhongDuyet || 'Không có lý do được cung cấp');
    });
  }
}

async function loadUserOrders(userId) {
  const orderList = document.getElementById("orderList");
  orderList.innerHTML = `<p class="text-center text-muted">Đang tải...</p>`;

  try {
    const ordersRef = collection(db, "DonHang");
    const q = query(ordersRef, where("idCuaHang", "==", userId), orderBy("thoiGianDatHang", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      orderList.innerHTML = `<p class="text-center text-muted">Không có đơn hàng nào.</p>`;
      return;
    }

    orderList.innerHTML = ""; // Clear loading text

    snapshot.forEach(doc => {
      const data = doc.data();
      const date = formatFirebaseDate(data.thoiGianDatHang)
      const statusClass = data.trangThaiDonHang;

      const card = document.createElement("div");
      card.className = "order-card";

      const chiTiet = data.chiTietDonHangList || [];

      let monAnHTML = "";
      chiTiet.forEach(mon => {
        let tuyChon = (mon.danhSachTuyChon || []).map(tc => `(${tc.tenTuyChon} +${tc.gia.toLocaleString('vi-VN')}đ)`).join(", ");
        monAnHTML += `
          <div class="mon-an">
            <img src="${mon.urlHinhMonAn}" alt="${mon.tenMonAn}" />
            <div class="mon-an-info">
              <strong>${mon.tenMonAn}</strong><br>
              Tuỳ chọn: ${tuyChon || 'Không'}<br>
              Số lượng: ${mon.soLuong}, Giá: ${mon.giaTien.toLocaleString('vi-VN')}đ<br>
              Ghi chú: ${mon.ghiChu || 'Không có'}
            </div>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="order-header">
          <h5>🧾 Đơn #${doc.id}</h5>
          <span class="status ${statusClass}">${formatStatusOrder(data.trangThaiDonHang)}</span>
        </div>
        <div class="order-body">
          <p><strong>👤 Khách hàng:</strong> ${data.tenNguoiDat}</p>
          <p><strong>🕒 Ngày đặt:</strong> ${date}</p>
          <p><strong>🚚 Phí ship:</strong> ${data.phiShip.toLocaleString("vi-VN")}đ</p>
          <p><strong>💰 Tổng tiền:</strong> ${data.tongTien.toLocaleString("vi-VN")}đ</p>
          <div class="order-details" style="display: none">${monAnHTML}</div>
        </div>
      `;

      card.addEventListener("click", () => {
        const details = card.querySelector(".order-details");
        details.style.display = details.style.display === "none" ? "block" : "none";
      });

      orderList.appendChild(card);
    });
  } catch (error) {
    orderList.innerHTML = `<p class="text-danger text-center">Lỗi khi tải đơn hàng: ${error.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const userId = new URLSearchParams(window.location.search).get("id");
  if (userId) {
    loadUserData(userId);
    loadUserOrders(userId); // <== Gọi hàm lấy đơn hàng của user
  }
});