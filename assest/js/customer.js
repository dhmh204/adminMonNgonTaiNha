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
  handleUnlockAccountClick, 
  initPagination
} from './common.js';

let allDocs = [];
async function getAllUsers() {
   
  const querySnapshot = await getDocs(collection(db, "NguoiDung"));

  allDocs = querySnapshot.docs;

  initPagination({
    totalItems: allDocs.length,
    itemsPerPageSelectId: "itemsPerPageSelect",
    paginationContainerId: "pagination",
    descriptionId: "description",
    onPageChange: renderPageData
  });
       
}

function renderPageData(currentPage, itemsPerPage) {
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentDocs = allDocs.slice(startIdx, endIdx);

  const list = document.querySelector(".list");
  list.innerHTML = "";

  const renderPromises = currentDocs.map(async (docSnap) => {
  const user = docSnap.data();
  // const gender = await getUserGenderById(user.idCuaHang);
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
    list.insertAdjacentHTML("beforeend", html);
  });

     Promise.all(renderPromises).then(() => {
    // Sau khi tất cả HTML được render xong thì mới gắn sự kiện
    openDropMenuNav();
    handleLockAccountClick("NguoiDung");
    handleUnlockAccountClick("NguoiDung");
    changeStatusAccount();
    setAccountStatus();
  });

  }

  getAllUsers()
