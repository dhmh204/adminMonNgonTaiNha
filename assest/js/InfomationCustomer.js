import { db } from './firebaseInit.js';

  import { collection,
    getDocs, 
    doc, 
    getDoc,  
    query, where, 
      orderBy  }
  from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

  import {
    openDropMenuNav,
    formatStatusOrder,
    formatFirebaseDate,
    formatStatus,
    setLine, 
    handleClickTabActive
  } from './common.js';




async function getNameShop(id) {
  try {
    const userRef = doc(db, "CuaHang", id);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return data.tenCuaHang
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

function render(user) {
  const isLocked = user.trangThai === 'DaKhoa' || user.trangThai === 'Đã khóa'; // Kiểm tra trạng thái

  const html = `
    <form>
      <div class="mb-3">
          <label for="idUser" class="form-label">ID</label>
          <input readonly value="${user.idNguoiDung || ''}" type="text" class="form-control" id="idUser" >
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
        <input readonly value="${user.gioiTinh || 'Nam'}" type="text" class="form-control" id="sex">
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
  handleClickTabActive();

  if (isLocked) {
      document.getElementById('show-reason-btn').addEventListener('click', () => {
        alert(user.lyDoKhoa || 'Không có lý do được cung cấp');
      });
    }
  }
async function loadUserOrders(userId) {
  const orderList = document.getElementById("orderList");
  orderList.innerHTML = `<p class="text-center text-muted">Đang tải...</p>`;

  try {
    const ordersRef = collection(db, "DonHang");
    const q = query(ordersRef, where("idNguoiDat", "==", userId), orderBy("thoiGianDatHang", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      orderList.innerHTML = `<p class="text-center text-muted">Không có đơn hàng nào.</p>`;
      return;
    }

    orderList.innerHTML = ""; // Clear loading text

   for (const docSnap of snapshot.docs) {
  const data = docSnap.data();
  const date = formatFirebaseDate(data.thoiGianDatHang);
  const statusClass = data.trangThaiDonHang;
  const chiTiet = data.chiTietDonHangList || [];

  let monAnHTML = "";
  chiTiet.forEach(mon => {
    let tuyChon = (mon.danhSachTuyChon || [])
      .map(tc => `(${tc.tenTuyChon} +${tc.gia.toLocaleString('vi-VN')}đ)`)
      .join(", ");
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

  const tenShop = await getNameShop(data.idCuaHang);

  const card = document.createElement("div");
  card.className = "order-card";
  card.innerHTML = `
    <div class="order-header">
      <h5>🧾 Đơn #${docSnap.id}</h5>
      <span class="status ${statusClass}">${formatStatusOrder(data.trangThaiDonHang)}</span>
    </div>
    <div class="order-body">
      <p><strong>🍴 Quán:</strong> ${tenShop}</p>
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
}
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