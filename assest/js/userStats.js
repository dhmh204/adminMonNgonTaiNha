import { db } from "./firebaseInit.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import {
  openDropMenuNav,
} from './common.js';

const totalUsersEl = document.getElementById("total-users");
const shipperEl = document.getElementById("shipper-count");
const storeEl = document.getElementById("store-count");
const customerEl = document.getElementById("customer-count");

async function fetchUserStats() {
  const nguoiDungRef = collection(db, "NguoiDung");
  const snapshot = await getDocs(nguoiDungRef);

  let total = 0;
  let shipper = 0;
  let store = 0;
  let customer = 0;

  snapshot.forEach(doc => {
    total++;
    const data = doc.data();
    const roles = data.danhSachQuyen || [];

    if (roles.includes("Shipper")) shipper++;
    if (roles.includes("CuaHang")) store++;
    if (roles.includes("NguoiDung")) customer++;
  });

  // Gán ra giao diện
  totalUsersEl.textContent = total;
  shipperEl.textContent = shipper;
  storeEl.textContent = store;
  customerEl.textContent = customer;
}

fetchUserStats();
openDropMenuNav()
