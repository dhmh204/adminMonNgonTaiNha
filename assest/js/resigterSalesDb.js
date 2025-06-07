import { db } from './firebaseInit.js';
import {
  collection,
  getDocs, 
  query, 
  where, 
  doc,
  getDoc
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




// Lấy tất cả user có trạng thái "đang chờ duyệt"
async function fetchUsersFromCollection(collectionName, role) {
  try {
    console.log(`Đang tải dữ liệu từ collection: ${collectionName}`);
    const q = query(
      collection(db, collectionName), 
      where("trangThaiChoDuyet", "==", "DangChoDuyet")
    );
    const snapshot = await getDocs(q);
    console.log(`Tìm thấy ${snapshot.size} bản ghi trong ${collectionName}`);

    const users = [];
    
    for (const docSnap of snapshot.docs) {
      try {
        const data = docSnap.data();
        const uid = collectionName === "CuaHang" ? data.idCuaHang :
             collectionName === "Shipper" ? data.idShipper : null;

        
        if (!uid) {
          console.warn(`Document ${docSnap.id} không có trường uid`);
          continue;
        }

        console.log(`Đang xử lý UID: ${uid}`);
        const userRef = doc(db, "NguoiDung", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.warn(`Không tìm thấy người dùng với UID: ${uid}`);
          continue;
        }

        const userInfo = userSnap.data();
        const ngaydangky = data.ngayDangKy ? formatFirebaseDate(data.ngayDangKy) : "Không xác định";
        const ngaysinh = userInfo.ngaysinh ? formatFirebaseDate(userInfo.ngaysinh) : "Không xác định";

        users.push({
          id: docSnap.id,
          uid: uid,
          ten: userInfo.hoTen || "Không có tên",
          email: userInfo.email || "Không có email",
          sdt: userInfo.soDienThoai || "Không có SĐT",
          gioitinh: userInfo.gioiTinh || "Nam",
          ngaysinh: ngaysinh,
          ngaydangky: ngaydangky,
          type: role
        });

      } catch (error) {
        console.error(`Lỗi khi xử lý document ${docSnap.id}:`, error);
      }
    }

    return users;

  } catch (error) {
    console.error(`Lỗi khi tải collection ${collectionName}:`, error);
    return [];
  }
}

async function getAllUsersWithType() {
  try {
    const [cuahang, shipper] = await Promise.all([
      fetchUsersFromCollection("CuaHang", "Bán hàng"),
      fetchUsersFromCollection("Shipper", "Shipper")
    ]);
    return [...cuahang, ...shipper];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return [];
  }
}

function renderUserRow(user) {
  const typeClass = user.type === "Bán hàng" ? "shop" : "shipper";
  const destinationPage = user.type === "Shipper" 
    ? `infomationResigterShipper.html?id=${user.id}` 
    : `infomationResigterSales.html?id=${user.id}`;

  const html = `
    <tr onclick="window.location.href='${destinationPage}'" style="cursor: pointer;">
      <td scope="row" class="name">
        <div class="box-avatar">
          <img src="${user.avtCuaHangUrl || './assest/img/ava.png'}"  alt="" class="avatar me-3">
        </div>${user.ten}
      </td>
      <td>${user.email}</td>
      <td>${user.sdt}</td>
      <td>${user.gioitinh}</td>
      <td>${user.ngaydangky}</td>
      <td class="rule">
        <div class="${typeClass}">${user.type}</div>
      </td>
    </tr>
  `;

  document.querySelector(".list").insertAdjacentHTML('beforeend', html);
  
}

document.querySelector(".list").innerHTML = `
  <tr>
    <td colspan="6" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Đang tải dữ liệu...</p>
    </td>
  </tr>
`;

getAllUsersWithType()
  .then(users => {
    document.querySelector(".list").innerHTML = '';
    
    if (users.length === 0) {
      document.querySelector(".list").innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4">
            <i class="bi bi-exclamation-circle fs-4"></i>
            <p class="mt-2">Không có người dùng nào đang chờ duyệt</p>
          </td>
        </tr>
      `;
    } else {
      users.forEach(renderUserRow);
      console.log("Đã tải xong danh sách người dùng:", users);
    }
      openDropMenuNav()

  })
  .catch(err => {
    console.error("Lỗi khi tải người dùng:", err);
    document.querySelector(".list").innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4 text-danger">
          <i class="bi bi-x-circle fs-4"></i>
          <p class="mt-2">Có lỗi xảy ra khi tải dữ liệu</p>
          <button onclick="location.reload()" class="btn btn-sm btn-outline-primary mt-2">
            Thử lại
          </button>
        </td>
      </tr>
    `;
  });