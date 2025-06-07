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

  async function fetchAllApprovedShops() {
    const q = query(
      collection(db, "CuaHang"),
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

    const list = document.querySelector(".list-shop");
    list.innerHTML = "";

  const renderPromises = currentDocs.map(async (docSnap) => {
    const user = docSnap.data();
    const gender = await getUserGenderById(user.idCuaHang);
    const html = `
      <tr data-user-id="${user.idCuaHang}">
        <td class="name">
          <div class="box-avatar">
            <img src="${user.avtCuaHangUrl || './assest/img/ava.png'}" class="avatar me-3">
            ${user.tenCuaHang}
          </div>
        </td>
        <td>${user.tenChuCuaHang || 'N/A'}</td>
        <td>${user.emailChuCuaHang || 'N/A'}</td>
        <td>${user.soDienThoaiChuCuaHang || 'N/A'}</td>
        <td>${gender}</td>
        <td>${formatFirebaseDate(user.ngayDangKy) || 'N/A'}</td>
        <td class="status">
          <div>${formatStatus(user.trangThai)}</div>
        </td>
        <td class="action text-center">
          <a href="./InformationShop.html?id=${user.idCuaHang}">
            <span class="material-symbols-outlined">visibility</span>
          </a>
          <span class="material-symbols-outlined lock">lock</span>
          <span class="material-symbols-outlined unlock d-none">lock_open</span>
        </td>
      </tr>`;
    list.insertAdjacentHTML("beforeend", html);
  });

     Promise.all(renderPromises).then(() => {
    // Sau khi tất cả HTML được render xong thì mới gắn sự kiện
    openDropMenuNav();
    handleLockAccountClick("CuaHang");
    handleUnlockAccountClick("CuaHang");
    changeStatusAccount();
    setAccountStatus();
  });

  }
    fetchAllApprovedShops();
 

