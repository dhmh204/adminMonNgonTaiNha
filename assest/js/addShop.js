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
      if (!file || !file.type.startsWith('image/')) return;

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
      this.value = ''; 
    });
  });
