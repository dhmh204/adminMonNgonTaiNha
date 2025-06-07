import { db, storage } from './firebaseInit.js';
import {
  collection,
  addDoc,
  setDoc,
  doc,
  query,
  where,
  getDocs, 
  updateDoc, 
    arrayUnion
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

import {
  getDownloadURL,
  ref,
  uploadBytes
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-storage.js";
import { openDropMenuNav } from './common.js';

document.querySelector('.accept').addEventListener('click', async () => {
  const tenCuaHang = document.getElementById('nameShop').value.trim();
  const diaChiCuaHang = document.getElementById('address').value.trim();
  const soDienThoaiCuaHang = document.getElementById('phoneShop').value.trim();
  const emailCuaHang = document.getElementById('emailCuaHang').value.trim();
  const tenChuCuaHang = document.getElementById('storeOwnerName').value.trim();
  const emailChuCuaHang = document.getElementById('storeOwnerEmail').value.trim();
 const ngaySinh = document.getElementById("brthday").value;
  const gioiTinh = document.getElementById("sex").value;

  const filesMap = window.selectedFilesMap || {};

  if (!tenCuaHang || !diaChiCuaHang || !soDienThoaiCuaHang || !emailCuaHang ||
      !tenChuCuaHang || !emailChuCuaHang) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  let avtUrl = "";
  const giayToUrls = {};
  let userId = null;

  try {
    // Bước 1: Kiểm tra người dùng đã tồn tại chưa
    const q = query(collection(db, "NguoiDung"), where("email", "==", emailChuCuaHang));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const newUser = {
        hoTen: tenChuCuaHang,
        soDienThoai: soDienThoaiCuaHang,
        email: emailChuCuaHang,
        ngayCapNhatTrangThai: new Date(),
        ngayDangKy: new Date(),
        trangThai: "DangHoatDong",
        danhSachQuyen: ["NguoiDung", "CuaHang"],
        gioiTinh,
        avtUrl: ""
      };

      const userRef = await addDoc(collection(db, "NguoiDung"), newUser);
      userId = userRef.id;

      await setDoc(doc(db, "NguoiDung", userId), {
        idNguoiDung: userId
      }, { merge: true });

    } else {
      userId = querySnapshot.docs[0].id;
    }

    for (const [key, file] of Object.entries(filesMap)) {
      const imageRef = ref(storage, `giayToCuaHang/${userId}_${key}_${Date.now()}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);

      if (key === 'anhDaiDien') {
        avtUrl = url;
      } else {
        giayToUrls[`${key}Url`] = url;
      }
    }

    if (!avtUrl) {
      const encodedName = encodeURIComponent(tenChuCuaHang.split(" ").pop());
      avtUrl = `https://letteravatar.com/s/avatar.png?text=${encodedName}&color=%23ffd54f&bg=%23455a64&font=JetBrains%20Mono`;
    }

    await setDoc(doc(db, "CuaHang", userId), {
      idCuaHang: userId,
      tenCuaHang,
      diaChiCuaHang,
      soDienThoaiCuaHang,
      tenChuCuaHang,
      emailCuaHang,
      emailChuCuaHang,
      ngayDangKy: new Date(),
      avtUrl,
      giayToCuaHang: {
        ...giayToUrls,
        ngayDangTai: new Date()
      }, 
      trangThai: "DangHoatDong", 
      tinhTrangQuan: "HetBan", 
      trangThaiChoDuyet: "DaDuyet"
    });

    const userDocRef = doc(db, "NguoiDung", userId);
    await updateDoc(userDocRef, {
      danhSachQuyen: arrayUnion("CuaHang")
    });

    alert("Thêm cửa hàng thành công!");
    window.location.href = "./Shop.html";

  } catch (error) {
    console.error("Lỗi khi thêm dữ liệu: ", error);
    alert("Có lỗi xảy ra khi thêm cửa hàng!");
  }
});
openDropMenuNav();
