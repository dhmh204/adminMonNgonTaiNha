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



async function getAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "NguoiDung"));
    
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("Danh sách người dùng:", users);

    users.forEach(user => render(user));
  } catch (error) {
    console.error("Lỗi khi lấy người dùng:", error);
  }

    openDropMenuNav()
    changeStatusAccount()
    handleLockAccountClick("CuaHang")
    handleUnlockAccountClick("CuaHang")
    setAccountStatus()
}
getAllUsers()

function render(user) {
  const html = `
    <tr>
        <td scope="row" class="name">
            <div class="box-avatar">
               <img src="${user.avtUrl || './assest/img/ava.jpg'}" class="avatar me-3">
                </div>${user.hoTen}</td>
        <td>${user.email}</td>
        <td>${user.soDienThoai}</td>
        <td>${user.gioiTinh || 'Nam'}</td>
        <td>${formatFirebaseDate(user.ngayDangKy)}</td>
        <td class="status">
            <div class="">${formatStatus(user.trangThai)}</div>
        </td>
        <td class="action text-center ">
            <a href="./InfomationCustomer.html?id=${user.idNguoiDung}">
              <span class="material-symbols-outlined">visibility</span>
            </a>
            <span class="material-symbols-outlined lock">
                lock
                </span>
            <span class="material-symbols-outlined unlock ">
                    lock_open
                    </span>
          </td>
    </tr>

  `;
  openDropMenuNav()
  document.querySelector(".list").insertAdjacentHTML('beforeend', html);

}
