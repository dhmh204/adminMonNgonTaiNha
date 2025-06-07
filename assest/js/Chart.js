import { db } from "./firebaseInit.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.min.js";

// Gọi hàm khởi tạo
fetchOrdersAndRenderMonthlyRevenue();

async function fetchOrdersAndRenderMonthlyRevenue() {
  const q = query(collection(db, "DonHang"), where("trangThaiDonHang", "==", "DaGiaoHang"));
  const snapshot = await getDocs(q);

  // Khởi tạo mảng doanh thu 12 tháng
  const revenuePerMonth = Array(12).fill(0);

  snapshot.forEach(doc => {
    const data = doc.data();
    const phiShip = parseFloat(data.phiShip || 0);
    const tongTien = parseFloat(data.tongTien || 0);
    const doanhThu = 0.3 * phiShip + 0.15 * (tongTien - phiShip);

    // Lấy tháng từ ngày giao hàng (nếu có)
    const ngayGiao = data.ngayGiaoHang ? new Date(data.ngayGiaoHang) : null;
    if (!ngayGiao) return;

    const monthIndex = ngayGiao.getMonth(); // 0 - 11
    revenuePerMonth[monthIndex] += doanhThu;
  });

  renderMonthlyRevenueChart(revenuePerMonth);
}

function renderMonthlyRevenueChart(data) {
  const ctx = document.getElementById("revenueBarChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
        "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
        "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
      ],
      datasets: [{
        label: "Doanh thu (VNĐ)",
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toLocaleString("vi-VN") + " VNĐ";
            }
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: "📊 Doanh thu theo tháng (Đơn đã giao)"
        }
      }
    }
  });
}
