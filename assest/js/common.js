import {
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { db } from './firebaseInit.js';


const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

export function openDropMenuNav(){
    var btnOpen = $('.user-js')
    btnOpen.addEventListener("click", ()=>{
        var menu = $('.drop-menu')
        if(menu.style.display == 'block')
            menu.style.display = 'none'
        else
            menu.style.display = 'block'     
    })
}


export function changeStatusAccount(){
    const iconLocks = $$('.lock')
    const iconUnLocks = $$('.unlock')     
    var status = $$('.status')
    status.forEach((element, index) => {
        var content = element.querySelector('div')
        if(content?.innerHTML == 'Đã khóa'){
            content?.classList.add('status__lock')
            content?.classList.remove('status__active')
            iconLocks[index]?.classList.add('d-none')
            iconUnLocks[index]?.classList.remove('d-none')
        }
        else{
            content.classList.add('status__active')
            content?.classList.remove('status__lock')
            iconUnLocks[index]?.classList.add('d-none')
            iconLocks[index]?.classList.remove('d-none')

        }


    });
    
}

export function setAccountStatus(index, text) {
    const status = $$('.status');
    const element = status[index];

    if (!element) {
        console.warn(`Không tìm thấy phần tử status tại index ${index}`);
        return;
    }

    const content = element.querySelector('div');
    if (content) {
        content.innerHTML = text;
        changeStatusAccount();
    } else {
        console.warn('Không tìm thấy thẻ div bên trong .status');
    }
}



export function handleLockAccountClick(table) {
    const iconLocks = $$('.lock');

    iconLocks.forEach(lockIcon => {
        lockIcon.addEventListener('click', async () => {
            const row = lockIcon.closest('tr');
            const userId = row?.dataset.userId;

            if (!userId) {
                console.warn("Không tìm thấy ID người dùng.");
                return;
            }

            if (confirm("Bạn có chắc muốn khóa tài khoản không?")) {
                const reason = prompt("Nhập lý do muốn khóa tài khoản:");

                if (reason && reason.trim() !== "") {
                    try {
                        const userRef = doc(db, table, userId);
                        await updateDoc(userRef, {
                            trangThai: "DaKhoa"
                        });

                        const statusDiv = row.querySelector(".status div");
                        if (statusDiv) {
                            statusDiv.innerText = "Đã khóa";
                            statusDiv.classList.remove("status__active");
                            statusDiv.classList.add("status__lock");
                        }

                        row.querySelector(".lock").classList.add("d-none");
                        row.querySelector(".unlock").classList.remove("d-none");

                        alert("Khóa tài khoản thành công!");
                    } catch (error) {
                        console.error("Lỗi khi cập nhật trạng thái:", error);
                        alert("Đã xảy ra lỗi khi khóa tài khoản.");
                    }
                }
            }
        });
    });
}

export function handleUnlockAccountClick(table) {
    const iconUnLocks = $$('.unlock');

    iconUnLocks.forEach(unlockIcon => {
        unlockIcon.addEventListener('click', async () => {
            const row = unlockIcon.closest('tr');
            const userId = row?.dataset.userId;

            if (!userId) {
                console.warn("Không tìm thấy ID người dùng.");
                return;
            }

            if (confirm("Bạn có chắc muốn mở khóa tài khoản không?")) {
                try {
                    const userRef = doc(db, table, userId);
                    await updateDoc(userRef, {
                        trangThai: "DangHoatDong"
                    });

                    const statusDiv = row.querySelector(".status div");
                    if (statusDiv) {
                        statusDiv.innerText = "Hoạt động";
                        statusDiv.classList.remove("status__lock");
                        statusDiv.classList.add("status__active");
                    }

                    row.querySelector(".unlock").classList.add("d-none");
                    row.querySelector(".lock").classList.remove("d-none");

                    alert("Mở khóa tài khoản thành công!");
                } catch (error) {
                    console.error("Lỗi khi cập nhật trạng thái:", error);
                    alert("Đã xảy ra lỗi khi mở khóa tài khoản.");
                }
            }
        });
    });
}


export function setLine(){
    var line = $('.line')
    var itemActive = $('.tab-active')
    line.style.left = itemActive?.offsetLeft + 'px'
    line.style.width = itemActive?.offsetWidth + 'px'
}

 export function handleClickTabActive(){
    var tabItems = $$('.tab')
    var tabContents = $$('.content-tab')
    tabItems.forEach((item, index) => {
        item.addEventListener("click", ()=>{
           $('.tab.tab-active').classList.remove('tab-active')
           item.classList.add('tab-active')
           $('.content-tab.active').classList.remove('active')
           tabContents[index].classList.add('active')
        setLine()
        }
    )
    });
}


export function formatFirebaseDate(firebaseDate) {
  if (!firebaseDate) return 'N/A';
  
  try {
    let date;
    
    if (typeof firebaseDate.toDate === 'function') {
      date = firebaseDate.toDate();
    } 
    else if (typeof firebaseDate === 'string' || typeof firebaseDate === 'number') {
      date = new Date(firebaseDate);
    } 
    else {
      return 'N/A';
    }

    if (isNaN(date.getTime())) return 'N/A';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}


export function formatStatus(status){
    switch(status){
        case 'DangHoatDong':
            return 'Hoạt động'
        case 'DaKhoa': 
            return 'Đã khóa'
        default: 
            return 'Hoạt động'
    }
}



export function formatStatusOrder(status){
    switch(status){
        case 'DaGiaoHang':
            return 'Đã giao hàng'
        case 'DaHuy': 
            return 'Đã hủy'
        case 'DaLayHang': 
            return 'Đã lấy hàng'
        case 'DangGiaoHang': 
            return 'DangGiaoHang'
        default: 
            return 'Đã giao hàng'
    }
}



export function initPagination({
  totalItems,
  itemsPerPageSelectId,
  paginationContainerId,
  descriptionId,
  onPageChange
}) {
  let currentPage = 1;
  let itemsPerPage = parseInt(document.getElementById(itemsPerPageSelectId).value);

  function renderDescription() {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    document.getElementById(descriptionId).innerText =
      `Hiển thị ${start} đến ${end} trong tổng số ${totalItems} s`;
  }

  function goToPage(page) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderPagination();
    onPageChange(currentPage, itemsPerPage);
  }

  function renderPagination() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById(paginationContainerId);
    pagination.innerHTML = '';

    // Nút trước
    const prev = document.createElement("span");
    prev.innerText = "<";
    prev.style.cursor = "pointer";
    prev.onclick = () => goToPage(currentPage - 1);
    pagination.appendChild(prev);

    // Số trang
    for (let i = 1; i <= totalPages; i++) {
      const page = document.createElement("div");
      page.classList.add("number");
      if (i === currentPage) page.classList.add("current");
      page.innerText = i;
      page.onclick = () => goToPage(i);
      pagination.appendChild(page);
    }

    // Nút sau
    const next = document.createElement("span");
    next.innerText = ">";
    next.style.cursor = "pointer";
    next.onclick = () => goToPage(currentPage + 1);
    pagination.appendChild(next);

    renderDescription();
  }

  document.getElementById(itemsPerPageSelectId).addEventListener("change", function () {
    itemsPerPage = parseInt(this.value);
    currentPage = 1;
    renderPagination();
    onPageChange(currentPage, itemsPerPage);
  });

  // Khởi động ban đầu
  renderPagination();
  onPageChange(currentPage, itemsPerPage);
}
