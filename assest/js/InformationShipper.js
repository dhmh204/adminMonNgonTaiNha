
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


function render(shipper, user) {
  const isLocked = shipper.trangThai === 'DaKhoa' || shipper.trangThai === 'Đã khóa'; // Kiểm tra trạng thái

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
      <label for="status" class="form-label">Trạng thái</label>
      <input readonly value="${formatStatus(shipper.trangThai)}" type="text" class="form-control text-red" id="status">
    </div>
    ${isLocked ? `
      <div class="mb-3">
        <button type="button" class="btn btn-warning" id="show-reason-btn">Xem lý do</button>
      </div>
    ` : ''}
  </form>
  <div class="avatar mt-3">
    <img src="${shipper.giayToShipper?.avtShipperUrl || './assest/img/ava.png'}" alt="avatar" class="img-thumbnail">
  </div>
  `;

  document.querySelector(".form-js").insertAdjacentHTML('beforeend', html);
  openDropMenuNav();
  setLine(); 
  handleClickTabActive();

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
    const q = query(ordersRef, where("idShipper", "==", userId), orderBy("thoiGianDatHang", "desc"));
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
      <p><strong>👥 Khách hàng:</strong> ${data.tenNguoiDat}</p>
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