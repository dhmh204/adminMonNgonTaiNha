  // document.addEventListener('DOMContentLoaded', () => {
  //   const fileInput = document.getElementById('fileInputMaster');
  //   let currentTarget = null;

  //   document.querySelectorAll('.image-wrapper').forEach(wrapper => {
  //     wrapper.addEventListener('click', () => {
  //       currentTarget = wrapper;
  //       fileInput.click();
  //     });
  //   });

  //   fileInput.addEventListener('change', function () {
  //     const file = this.files[0];
  //     if (!file || !file.type.startsWith('image/')) return;

  //     const reader = new FileReader();
  //     reader.onload = function (e) {
  //       currentTarget.innerHTML = '';
  //       const img = document.createElement('img');
  //       img.src = e.target.result;
  //       img.className = 'preview-img';
  //       currentTarget.appendChild(img);

  //       const noteText = currentTarget.getAttribute('data-note') || '';
  //       const note = document.createElement('span');
  //       note.className = 'note';
  //       note.innerText = noteText;
  //       currentTarget.appendChild(note);
  //     };

  //     reader.readAsDataURL(file);
  //     this.value = ''; 
  //   });
  // });

  window.selectedAvatarFile = null; // ✅ Biến toàn cục lưu file ảnh

  document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInputMaster');
    let currentTarget = null;

    document.querySelectorAll('.image-wrapper').forEach(wrapper => {
      wrapper.addEventListener('click', () => {
        currentTarget = wrapper;
        fileInput.click();
      });
    });

    fileInput.addEventListener('change', function () {
      const file = this.files[0];
        console.log("File đã chọn:", file); // ✅ kiểm tra log
      if (!file || !file.type.startsWith('image/')) return;

      window.selectedAvatarFile = file; // ✅ Lưu file vào biến toàn cục

      const reader = new FileReader();
      reader.onload = function (e) {
        currentTarget.innerHTML = '';
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview-img';
        currentTarget.appendChild(img);

        const noteText = currentTarget.getAttribute('data-note') || '';
        const note = document.createElement('span');
        note.className = 'note';
        note.innerText = noteText;
        currentTarget.appendChild(note);
      };

      reader.readAsDataURL(file);
      this.value = ''; // ✅ Có thể reset safely
    });
  });