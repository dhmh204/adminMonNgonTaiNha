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




const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

async function getUserGenderById(userId) {
    try {
        const userRef = doc(db, "NguoiDung", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            var gender = data.gioiTinh; 
            if(gender === null){
                gender = 'Nam'
            }
            return gender;
        } else {
            console.log("Không tìm thấy người dùng với ID:", userId);
            return null;
        }
    } catch (error) {
        console.error("Lỗi khi lấy giới tính:", error);
        return null;
    }
}
async function getAllApprovedShops() {
  const list = $('.list-shop');
  list.innerHTML = '<tr><td colspan="8">Đang tải dữ liệu...</td></tr>';

  try {
    if (!db) throw new Error("Không kết nối được với Firestore");
    
    const q = query(
      collection(db, "CuaHang"),
      where("trangThaiChoDuyet", "==", "DaDuyet")
    );
    
    const querySnapshot = await getDocs(q);
    console.log("Dữ liệu nhận được:", querySnapshot.docs.map(doc => doc.data()));
    
    list.innerHTML = '';
    
    if (querySnapshot.empty) {
      list.innerHTML = '<tr><td colspan="8" class="text-center">Không có cửa hàng nào đã duyệt</td></tr>';
      return;
    }

    for (const docSnap of querySnapshot.docs) {
      const user = docSnap.data();
      const gender = await getUserGenderById(user.idCuaHang).catch(() => 'Nam');
      
      const html = `
        <tr data-user-id="${user.idCuaHang}">
          <td class="name">
            <div class="box-avatar">
              <img src="${user.avtCuaHangUrl || './assest/img/ava.jpg'}" class="avatar me-3">
              ${user.tenCuaHang}
            </div>
          </td>
          <td>${user.tenChuCuaHang || 'N/A'}</td>
          <td>${user.emailChuCuaHang || 'N/A'}</td>
          <td>${user.soDienThoaiChuCuaHang || 'N/A'}</td>
          <td>${gender}</td>
          <td>${formatFirebaseDate(user.ngayDangKy) || 'N/A'}</td>
          <td class="status">
            <div  class="">${formatStatus(user.trangThai)}</div>
          </td>
         <td class="action text-center ">
            <a href="./InfomationCustomer.html?id=${user.idCuaHang}">
              <span class="material-symbols-outlined">visibility</span>
            </a>
            <span class="material-symbols-outlined lock">
                lock
                </span>
            <span class="material-symbols-outlined unlock ">
                    lock_open
                    </span>
          </td>
        </tr>`;
      
      list.insertAdjacentHTML('beforeend', html);
      
  
    }
  } catch (error) {
    console.error("Lỗi chi tiết:", error);
    list.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-danger">
          Lỗi khi tải dữ liệu: ${error.message}<br>
          <button onclick="getAllApprovedShops()" class="btn btn-sm btn-primary mt-2">
            Thử lại
          </button>
        </td>
      </tr>`;
  }

    openDropMenuNav()
    changeStatusAccount()
    handleLockAccountClick("CuaHang")
    handleUnlockAccountClick("CuaHang")
    setAccountStatus()

}
getAllApprovedShops();


async function checkUserRole(userId) {
  const storeRef = doc(db, "CuaHang", userId);
  const storeSnap = await getDoc(storeRef);
  if (storeSnap.exists()) {
    return "Bán Hàng";
  }

  const shipperRef = doc(db, "shipper", userId);
  const shipperSnap = await getDoc(shipperRef);
  if (shipperSnap.exists()) {
    return "Shipper";
  }

  return "không xác định";
}
