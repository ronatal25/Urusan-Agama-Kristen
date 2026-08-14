document.addEventListener('DOMContentLoaded', () => {

  /* ---------- lightbox foto (galeri & prestasi) ---------- */
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  window.openLightbox = function(src, caption){
    lightboxImg.src = src;
    lightboxImg.alt = caption || '';
    lightboxCaption.textContent = caption || '';
    lightboxOverlay.hidden = false;
  };
  function closeLightbox(){
    lightboxOverlay.hidden = true;
    lightboxImg.src = '';
  }
  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxOverlay?.addEventListener('click', (e) => { if(e.target === lightboxOverlay) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && !lightboxOverlay.hidden) closeLightbox(); });

  /* ---------- tahun footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- toggle menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mainNav.classList.remove('open'));
  });

  /* ---------- header shadow saat scroll ---------- */
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 12 ? '0 8px 24px -16px rgba(0,0,0,0.4)' : 'none';
  });
});

/* ---------- kompres foto sebelum disimpan (biar muat di Firestore & hemat kuota) ---------- */
function compressImageFile(file, maxWidth = 900, quality = 0.6){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.addEventListener('DOMContentLoaded', () => {

  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'kemenag2026';

  const body = document.body;
  const openLoginBtn = document.getElementById('openLoginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginModal = document.getElementById('loginModal');
  const closeLoginBtn = document.getElementById('closeLoginBtn');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');

  const openAddPhotoBtn = document.getElementById('openAddPhotoBtn');
  const addPhotoModal = document.getElementById('addPhotoModal');
  const closeAddPhotoBtn = document.getElementById('closeAddPhotoBtn');
  const addPhotoForm = document.getElementById('addPhotoForm');
  const addPhotoFileReal = document.getElementById('addPhotoFileReal');
  const addPhotoPreview = document.getElementById('addPhotoPreview');
  const galleryGrid = document.getElementById('galleryGrid');

  /* ---------- status login (bertahan selama tab dibuka) ---------- */
  function isAdmin(){ return sessionStorage.getItem('bimasAdmin') === '1'; }
  function setAdminMode(active){
    body.classList.toggle('is-admin', active);
    if(active) sessionStorage.setItem('bimasAdmin','1');
    else sessionStorage.removeItem('bimasAdmin');
  }
  setAdminMode(isAdmin());

  /* ---------- modal helpers ---------- */
  function openModal(modal){ modal.hidden = false; }
  function closeModal(modal){ modal.hidden = true; }

  openLoginBtn?.addEventListener('click', () => openModal(loginModal));
  closeLoginBtn?.addEventListener('click', () => closeModal(loginModal));
  loginModal?.addEventListener('click', (e) => { if(e.target === loginModal) closeModal(loginModal); });

  logoutBtn?.addEventListener('click', () => setAdminMode(false));

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    if(user === ADMIN_USER && pass === ADMIN_PASS){
      setAdminMode(true);
      loginError.hidden = true;
      loginForm.reset();
      closeModal(loginModal);
    } else {
      loginError.hidden = false;
    }
  });

  /* ---------- tambah foto galeri ---------- */
  openAddPhotoBtn?.addEventListener('click', () => {
    if(!isAdmin()){
      openModal(loginModal);
      return;
    }
    openModal(addPhotoModal);
  });
  closeAddPhotoBtn?.addEventListener('click', () => closeModal(addPhotoModal));
  addPhotoModal?.addEventListener('click', (e) => { if(e.target === addPhotoModal) closeModal(addPhotoModal); });

  addPhotoFileReal?.addEventListener('change', () => {
    const file = addPhotoFileReal.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addPhotoPreview.src = reader.result;
      addPhotoPreview.hidden = false;
    };
    reader.readAsDataURL(file);
  });

function buildGalleryCard(item){
  const figure = document.createElement('figure');
  figure.className = 'gallery-card';
  figure.dataset.photoId = item.id;

  const photoDiv = document.createElement('div');
  photoDiv.className = 'gallery-photo';
  const img = document.createElement('img');
  img.src = item.src;
  img.alt = item.caption;
  photoDiv.appendChild(img);
  photoDiv.addEventListener('click', () => openLightbox(item.src, item.caption + (item.date ? ' — ' + item.date : '')));

  const figcaption = document.createElement('figcaption');
  const strong = document.createElement('strong');
  strong.className = 'gallery-caption';
  strong.textContent = item.caption;
  const span = document.createElement('span');
  span.className = 'gallery-date';
  span.textContent = item.date;
  figcaption.appendChild(strong);
  figcaption.appendChild(span);

  if(item.desc){
    const descEl = document.createElement('p');
    descEl.className = 'gallery-desc';
    descEl.textContent = item.desc;
    figcaption.appendChild(descEl);
  }

  figure.appendChild(photoDiv);
  figure.appendChild(figcaption);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'gallery-card-delete admin-only';
    delBtn.setAttribute('aria-label','Hapus foto');
    delBtn.textContent = '\u00D7';
    delBtn.addEventListener('click', async () => {
      if(!isAdmin()) return;
      if(!confirm('Hapus foto "' + item.caption + '"?')) return;
      try{
        await db.collection('galeri').doc(item.id).delete();
      }catch(err){
        alert('Gagal menghapus foto: ' + err.message);
      }
    });
    figure.appendChild(delBtn);

    return figure;
  }

  /* ---------- dengarkan perubahan galeri secara real-time dari Firestore ---------- */
  db.collection('galeri').orderBy('createdAt', 'asc').onSnapshot((snapshot) => {
    galleryGrid.innerHTML = '';
    snapshot.forEach((doc) => {
      const data = doc.data();
      galleryGrid.appendChild(buildGalleryCard({
        id: doc.id,
        src: data.url,
        caption: data.caption,
        date: data.date,
        desc: data.desc
      }));
    });
  }, (err) => {
    console.error('Gagal memuat galeri:', err);
  });

  addPhotoForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!isAdmin()){
      closeModal(addPhotoModal);
      openModal(loginModal);
      return;
    }
    const file = addPhotoFileReal.files[0];
    const caption = document.getElementById('addPhotoCaption').value.trim();
    const date = document.getElementById('addPhotoDate').value.trim();
    if(!file || !caption || !date) return;

    const submitBtn = addPhotoForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Mengunggah...'; }

    try{
      const dataUrl = await compressImageFile(file);

      await db.collection('galeri').add({
        url: dataUrl, caption, date,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      addPhotoForm.reset();
      addPhotoPreview.hidden = true;
      closeModal(addPhotoModal);
    }catch(err){
      alert('Gagal menyimpan foto: ' + err.message);
    }finally{
      if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
    }
  });

  /* ---------- ganti foto struktur organisasi (tersimpan di Firestore) ---------- */
  const orgPhotoDivs = document.querySelectorAll('.org-photo[data-org-id]');

  orgPhotoDivs.forEach(div => {
    const id = div.dataset.orgId;
    const img = div.querySelector('img');

    // ambil foto tersimpan (jika ada) saat halaman dibuka
    db.collection('orgPhotos').doc(id).get().then((doc) => {
      if(doc.exists && doc.data().url){
        img.src = doc.data().url;
        div.classList.remove('org-photo-fallback');
      }
    }).catch((err) => {
      console.error('Gagal memuat foto struktur:', err);
    });

    div.addEventListener('click', () => {
      if(!isAdmin()) return;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.addEventListener('change', async () => {
        const file = input.files[0];
        if(!file) return;
        try{
          const dataUrl = await compressImageFile(file, 500, 0.6);
          await db.collection('orgPhotos').doc(id).set({ url: dataUrl });
          img.src = dataUrl;
          div.classList.remove('org-photo-fallback');
        }catch(err){
          alert('Gagal menyimpan foto: ' + err.message);
        }
      });
      input.click();
    });
  });

  /* ---------- tambah prestasi ---------- */
  const openAddPrestasiBtn = document.getElementById('openAddPrestasiBtn');
  const addPrestasiModal = document.getElementById('addPrestasiModal');
  const closeAddPrestasiBtn = document.getElementById('closeAddPrestasiBtn');
  const addPrestasiForm = document.getElementById('addPrestasiForm');
  const addPrestasiFileReal = document.getElementById('addPrestasiFileReal');
  const addPrestasiPreview = document.getElementById('addPrestasiPreview');
  const prestasiGrid = document.getElementById('prestasiGrid');

  openAddPrestasiBtn?.addEventListener('click', () => {
    if(!isAdmin()){
      openModal(loginModal);
      return;
    }
    openModal(addPrestasiModal);
  });
  closeAddPrestasiBtn?.addEventListener('click', () => closeModal(addPrestasiModal));
  addPrestasiModal?.addEventListener('click', (e) => { if(e.target === addPrestasiModal) closeModal(addPrestasiModal); });

  addPrestasiFileReal?.addEventListener('change', () => {
    const file = addPrestasiFileReal.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addPrestasiPreview.src = reader.result;
      addPrestasiPreview.hidden = false;
    };
    reader.readAsDataURL(file);
  });

  function buildPrestasiCard(item){
    const figure = document.createElement('figure');
    figure.className = 'prestasi-card';
    figure.dataset.prestasiId = item.id;

    const photoDiv = document.createElement('div');
    photoDiv.className = 'prestasi-photo';
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.name;
    photoDiv.appendChild(img);
    photoDiv.addEventListener('click', () => openLightbox(item.src, item.name + (item.year ? ' — ' + item.year : '')));

    const figcaption = document.createElement('figcaption');
    const strong = document.createElement('strong');
    strong.className = 'prestasi-name';
    strong.textContent = item.name;
    const span = document.createElement('span');
    span.className = 'prestasi-year';
    span.textContent = item.year;
    figcaption.appendChild(strong);
    figcaption.appendChild(span);

    figure.appendChild(photoDiv);
    figure.appendChild(figcaption);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'prestasi-card-delete admin-only';
    delBtn.setAttribute('aria-label','Hapus prestasi');
    delBtn.textContent = '\u00D7';
    delBtn.addEventListener('click', async () => {
      if(!isAdmin()) return;
      if(!confirm('Hapus prestasi "' + item.name + '"?')) return;
      try{
        await db.collection('prestasi').doc(item.id).delete();
      }catch(err){
        alert('Gagal menghapus prestasi: ' + err.message);
      }
    });
    figure.appendChild(delBtn);

    return figure;
  }

  /* ---------- dengarkan perubahan prestasi secara real-time dari Firestore ---------- */
  db.collection('prestasi').orderBy('createdAt', 'asc').onSnapshot((snapshot) => {
    prestasiGrid.innerHTML = '';
    snapshot.forEach((doc) => {
      const data = doc.data();
      prestasiGrid.appendChild(buildPrestasiCard({
        id: doc.id,
        src: data.url,
        name: data.name,
        year: data.year
      }));
    });
  }, (err) => {
    console.error('Gagal memuat prestasi:', err);
  });

  addPrestasiForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!isAdmin()){
      closeModal(addPrestasiModal);
      openModal(loginModal);
      return;
    }
    const file = addPrestasiFileReal.files[0];
    const name = document.getElementById('addPrestasiName').value.trim();
    const year = document.getElementById('addPrestasiYear').value.trim();
    if(!file || !name || !year) return;

    const submitBtn = addPrestasiForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Mengunggah...'; }

    try{
      const dataUrl = await compressImageFile(file);

      await db.collection('prestasi').add({
        url: dataUrl, name, year,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      addPrestasiForm.reset();
      addPrestasiPreview.hidden = true;
      closeModal(addPrestasiModal);
    }catch(err){
      alert('Gagal menyimpan prestasi: ' + err.message);
    }finally{
      if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
    }
  });

  /* ---------- data gereja per kecamatan ---------- */
  const openAddGerejaBtn = document.getElementById('openAddGerejaBtn');
  const addGerejaModal = document.getElementById('addGerejaModal');
  const closeAddGerejaBtn = document.getElementById('closeAddGerejaBtn');
  const addGerejaForm = document.getElementById('addGerejaForm');
  const addGerejaFileReal = document.getElementById('addGerejaFileReal');
  const addGerejaPreview = document.getElementById('addGerejaPreview');
  const gerejaGrid = document.getElementById('gerejaGrid');
  const gerejaEmpty = document.getElementById('gerejaEmpty');
  const gerejaFilter = document.getElementById('gerejaFilter');

  let currentGerejaFilter = null;
  let allGerejaItems = [];

  openAddGerejaBtn?.addEventListener('click', () => {
    if(!isAdmin()){
      openModal(loginModal);
      return;
    }
    openModal(addGerejaModal);
  });
  closeAddGerejaBtn?.addEventListener('click', () => closeModal(addGerejaModal));
  addGerejaModal?.addEventListener('click', (e) => { if(e.target === addGerejaModal) closeModal(addGerejaModal); });

  addGerejaFileReal?.addEventListener('change', () => {
    const file = addGerejaFileReal.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addGerejaPreview.src = reader.result;
      addGerejaPreview.hidden = false;
    };
    reader.readAsDataURL(file);
  });

  function buildGerejaCard(item){
    const figure = document.createElement('figure');
    figure.className = 'gereja-card';
    figure.dataset.gerejaId = item.id;

    const photoDiv = document.createElement('div');
    photoDiv.className = 'gereja-photo';
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.name;
    photoDiv.appendChild(img);
    photoDiv.addEventListener('click', () => openLightbox(item.src, item.name + ' — Kec. ' + item.kecamatan));

    const figcaption = document.createElement('figcaption');
    const strong = document.createElement('strong');
    strong.className = 'gereja-name';
    strong.textContent = item.name;
    const span = document.createElement('span');
    span.className = 'gereja-kecamatan';
    span.textContent = 'Kec. ' + item.kecamatan;
    figcaption.appendChild(strong);
    figcaption.appendChild(span);

    figure.appendChild(photoDiv);
    figure.appendChild(figcaption);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'gereja-card-delete admin-only';
    delBtn.setAttribute('aria-label','Hapus gereja');
    delBtn.textContent = '\u00D7';
    delBtn.addEventListener('click', async () => {
      if(!isAdmin()) return;
      if(!confirm('Hapus data "' + item.name + '"?')) return;
      try{
        await db.collection('gereja').doc(item.id).delete();
      }catch(err){
        alert('Gagal menghapus data gereja: ' + err.message);
      }
    });
    figure.appendChild(delBtn);

    return figure;
  }

  function renderGerejaGrid(){
    gerejaGrid.innerHTML = '';

    if(!currentGerejaFilter){
      gerejaEmpty.textContent = 'Pilih salah satu kecamatan di atas untuk melihat data gereja.';
      gerejaEmpty.hidden = false;
      return;
    }

    const filtered = allGerejaItems.filter(item => item.kecamatan === currentGerejaFilter);
    filtered.forEach(item => gerejaGrid.appendChild(buildGerejaCard(item)));
    gerejaEmpty.textContent = 'Belum ada data gereja untuk kecamatan ini.';
    gerejaEmpty.hidden = filtered.length > 0;
  }

  gerejaFilter?.addEventListener('click', (e) => {
    const chip = e.target.closest('.gereja-filter-chip');
    if(!chip) return;
    gerejaFilter.querySelectorAll('.gereja-filter-chip').forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    currentGerejaFilter = chip.dataset.kecamatan;
    renderGerejaGrid();
  });

  /* ---------- dengarkan perubahan data gereja secara real-time dari Firestore ---------- */
  db.collection('gereja').orderBy('createdAt', 'asc').onSnapshot((snapshot) => {
    allGerejaItems = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      allGerejaItems.push({
        id: doc.id,
        src: data.url,
        name: data.name,
        kecamatan: data.kecamatan
      });
    });
    renderGerejaGrid();
  }, (err) => {
    console.error('Gagal memuat data gereja:', err);
  });

  addGerejaForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!isAdmin()){
      closeModal(addGerejaModal);
      openModal(loginModal);
      return;
    }
    const file = addGerejaFileReal.files[0];
    const name = document.getElementById('addGerejaName').value.trim();
    const kecamatan = document.getElementById('addGerejaKecamatan').value;
    if(!file || !name || !kecamatan) return;

    const submitBtn = addGerejaForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Mengunggah...'; }

    try{
      const dataUrl = await compressImageFile(file);

      await db.collection('gereja').add({
        url: dataUrl, name, kecamatan,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      addGerejaForm.reset();
      addGerejaPreview.hidden = true;
      closeModal(addGerejaModal);
    }catch(err){
      alert('Gagal menyimpan data gereja: ' + err.message);
    }finally{
      if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
    }
  });

});

/* =======================================================
   JENIS LAYANAN: daftar layanan + syarat pengurusan
   ======================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const layananData = [
    {
      id: 'sktl-gereja',
      icon: '⛪',
      nama: 'SKTL Gereja',
      syarat: [
        'Surat permohonan',
        'Fotokopi SK Pendeta',
        'Surat Rekomendasi Dari pemerintah Desa',
        'Data Jemaat',
        'AD-ART Gereja'
      ]
    },
    {
      id: 'rekomendasi-Pendirian-gereja',
      icon: '🏛️',
      nama: 'Surat Rekomendasi Pendirian Gereja',
      syarat: [
        'Surat Permohonan Panitia Pembangunan',
        'SK Panitia Pembangunan',
        'Surat Rekomendasi Dari Pemerintah Desa',
        'Daftar Nama Dan Fotocopy KTP Pengguna Gereja Dan Fotocopy KTP Masyarakat Setempat Pendukung Pendirian Gereja Yang Disahkan Oleh kepala Desa',

        
      ]
    },
    {
      id: 'berkas-n1-n5',
      icon: '📋',
      nama: 'Berkas N1 - N5',
      syarat: [
        'Fotocopy KTP Pemohon',
      ]
    },
    {
      id: 'rekomendasi-menikah-ln',
      icon: '✈️',
      nama: 'Rekomendasi Menikah Luar Negeri',
      syarat: [
        'Surat permohonan',
        'Fotocopy KTP Kedua Calon Pengantin',
        'Berkas N1-N5',
        'Surat Baptis Yang Bersangkutan',
        'Surat Rekomendasi Dari Duk Capil'
      ]
    },
    {
      id: 'keterangan-belum-menikah',
      icon: '📝',
      nama: 'Keterangan Belum Menikah untuk Melamar Pekerjaan',
      syarat: [
        'Fotocopy KTP Yang Bersangkutan',
      
      ]
    },
    {
      id: 'legalisir-akta-nikah',
      icon: '📜',
      nama: 'Legalisir Akta Nikah',
      syarat: [
        'Fotocopy KTP Yang Bersangkutan',
        'Membawa Surat Nikah Asli Dari Gereja',
      
      ]
    },
    {
      id: 'permintaan-data-gereja',
      icon: '🗂️',
      nama: 'Permintaan Data Gereja',
      syarat: [
        'Surat Permohonan',
        'Fotocopy KTP Pemohon',
      ]
    },
    {
      id: 'pelaporan-kepengurusan',
      icon: '👥',
      nama: 'Pelaporan Kepengurusan Pimpinan Sinode/Gereja',
      syarat: [
        'Surat Pengantar Dari Pemohon',
        'SK Kepengurusan Terbaru',
    
      ]
    },
    {
      id: 'kerjasama-lintas-sektoral',
      icon: '🤝',
      nama: 'Kerjasama Lintas Sektoral',
      syarat: [
        'Surat permohonan ',
        'Deskripsi Renacana Kerjasama Lintas Sektoral',
       
      ]
    },
    {
      id: 'bimbingan-penyuluhan',
      icon: '🙏',
      nama: 'Layanan Bimbingan Penyuluhan Kristen',
      syarat: [
        'Surat permohonan',
        'Identitas Pemohon',
      ]
    },
    {
      id: 'koordinasi',
      icon: '🔗',
      nama: 'Koordinasi',
      syarat: [
        'Surat permohonan ',
        'Identitas Pemohon',
        'Gambaran Maksud Dan Tujuan Koordinasi'
      ]
    },
    {
      id: 'lain-lain',
      icon: '➕',
      nama: 'Lain - Lain',
      syarat: [
        
        
      ]
    }
  ];

  const layananGrid = document.getElementById('layananGrid');
  const layananModal = document.getElementById('layananModal');
  const closeLayananBtn = document.getElementById('closeLayananBtn');
  const layananModalTitle = document.getElementById('layananModalTitle');
  const layananModalSyarat = document.getElementById('layananModalSyarat');

  function openLayananModal(item){
    layananModalTitle.textContent = item.nama;
    layananModalSyarat.innerHTML = '';
    item.syarat.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      layananModalSyarat.appendChild(li);
    });
    layananModal.hidden = false;
  }
  function closeLayananModal(){ layananModal.hidden = true; }

  layananData.forEach(item => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'layanan-card';
    card.dataset.layananId = item.id;

    const icon = document.createElement('span');
    icon.className = 'layanan-icon';
    icon.textContent = item.icon;

    const nama = document.createElement('span');
    nama.className = 'layanan-name';
    nama.textContent = item.nama;

    const hint = document.createElement('span');
    hint.className = 'layanan-hint';
    hint.textContent = 'Lihat syarat →';

    card.appendChild(icon);
    card.appendChild(nama);
    card.appendChild(hint);

    card.addEventListener('click', () => openLayananModal(item));
    layananGrid.appendChild(card);
  });

  closeLayananBtn?.addEventListener('click', closeLayananModal);
  layananModal?.addEventListener('click', (e) => { if(e.target === layananModal) closeLayananModal(); });

});