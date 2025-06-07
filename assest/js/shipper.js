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

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
let allDocs = [];

async function getUserById(userId) {
     try {
    const docRef = doc(db, "NguoiDung", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.warn("Không tìm thấy người dùng với ID:", userId);
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy người dùng:", error);
    return null;
  }
}


 async function getAllApprovedShipper() {
    const q = query(
      collection(db, "Shipper"),
      where("trangThaiChoDuyet", "==", "DaDuyet")
    );
    const snapshot = await getDocs(q);
    allDocs = snapshot.docs;

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

   // Dùng Promise.all để đảm bảo DOM render xong mới gọi gán sự kiện
  const renderPromises = currentDocs.map(async (docSnap) => {
     const shipper = docSnap.data();
      const user = await getUserById(shipper.idShipper);
      
      const html = `
     <tr data-user-id="${shipper.idShipper}">
            <td scope="row" class="name">
              <div class="box-avatar">
                <img src="${user.avtCuaHangUrl || './assest/img/ava.png'}" class="avatar me-3">

              </div>${user.hoTen}</td>
            <td>${user.email}</td>
            <td>${user.soDienThoai || "N/A"}</td>
            <td>${user.gioiTinh || "Nam"}</td>
            <td>${formatFirebaseDate(shipper.ngayDangKy)}</td>
            <td class="status">
                <div class="">${formatStatus(user.trangThai) }</div>
            </td>
            <td class="action text-center">
               <a href="./InformationShipper.html?id=${shipper.idShipper}">
                    <span class="material-symbols-outlined">
                    visibility
                    </span></a>
                <span class="material-symbols-outlined lock">
                    lock
                    </span>
                <span class="material-symbols-outlined unlock ">
                        lock_open
                        </span>
            </td>
          </tr>`;
    list.insertAdjacentHTML("beforeend", html);
  });

     Promise.all(renderPromises).then(() => {
    // Sau khi tất cả HTML được render xong thì mới gắn sự kiện
    handleLockAccountClick("Shipper");
    handleUnlockAccountClick("Shipper");
    openDropMenuNav();
    changeStatusAccount();
    setAccountStatus();
  });

  }



getAllApprovedShipper();



