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

  function getSavedGalleryPhotos(){
    try{ return JSON.parse(localStorage.getItem('bimasGalleryPhotos') || '[]'); }
    catch(e){ return []; }
  }
  function saveGalleryPhotos(list){
    localStorage.setItem('bimasGalleryPhotos', JSON.stringify(list));
  }

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

    figure.appendChild(photoDiv);
    figure.appendChild(figcaption);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'gallery-card-delete admin-only';
    delBtn.setAttribute('aria-label','Hapus foto');
    delBtn.textContent = '\u00D7';
    delBtn.addEventListener('click', () => {
      if(!isAdmin()) return;
      if(!confirm('Hapus foto "' + item.caption + '"?')) return;
      const list = getSavedGalleryPhotos().filter(p => p.id !== item.id);
      saveGalleryPhotos(list);
      figure.remove();
    });
    figure.appendChild(delBtn);

    return figure;
  }

  function renderSavedGalleryPhotos(){
    getSavedGalleryPhotos().forEach(item => {
      galleryGrid.appendChild(buildGalleryCard(item));
    });
  }
  renderSavedGalleryPhotos();

  addPhotoForm?.addEventListener('submit', (e) => {
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

    const reader = new FileReader();
    reader.onload = () => {
      const item = { id: 'p' + Date.now(), src: reader.result, caption, date };
      const list = getSavedGalleryPhotos();
      list.push(item);
      saveGalleryPhotos(list);
      galleryGrid.appendChild(buildGalleryCard(item));

      addPhotoForm.reset();
      addPhotoPreview.hidden = true;
      closeModal(addPhotoModal);
    };
    reader.readAsDataURL(file);
  });

  /* ---------- ganti foto struktur organisasi ---------- */
  function getSavedOrgPhotos(){
    try{ return JSON.parse(localStorage.getItem('bimasOrgPhotos') || '{}'); }
    catch(e){ return {}; }
  }
  function saveOrgPhotos(map){
    localStorage.setItem('bimasOrgPhotos', JSON.stringify(map));
  }

  const orgPhotoDivs = document.querySelectorAll('.org-photo[data-org-id]');
  const savedOrgPhotos = getSavedOrgPhotos();

  orgPhotoDivs.forEach(div => {
    const id = div.dataset.orgId;
    const img = div.querySelector('img');

    // pasang foto tersimpan (jika ada) saat halaman dibuka
    if(savedOrgPhotos[id]){
      img.src = savedOrgPhotos[id];
      div.classList.remove('org-photo-fallback');
    }

    div.addEventListener('click', () => {
      if(!isAdmin()) return;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.addEventListener('change', () => {
        const file = input.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          img.src = reader.result;
          div.classList.remove('org-photo-fallback');
          const map = getSavedOrgPhotos();
          map[id] = reader.result;
          saveOrgPhotos(map);
        };
        reader.readAsDataURL(file);
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

  function getSavedPrestasi(){
    try{ return JSON.parse(localStorage.getItem('bimasPrestasi') || '[]'); }
    catch(e){ return []; }
  }
  function savePrestasi(list){
    localStorage.setItem('bimasPrestasi', JSON.stringify(list));
  }

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
    delBtn.addEventListener('click', () => {
      if(!isAdmin()) return;
      if(!confirm('Hapus prestasi "' + item.name + '"?')) return;
      const list = getSavedPrestasi().filter(p => p.id !== item.id);
      savePrestasi(list);
      figure.remove();
    });
    figure.appendChild(delBtn);

    return figure;
  }

  function renderSavedPrestasi(){
    getSavedPrestasi().forEach(item => {
      prestasiGrid.appendChild(buildPrestasiCard(item));
    });
  }
  renderSavedPrestasi();

  addPrestasiForm?.addEventListener('submit', (e) => {
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

    const reader = new FileReader();
    reader.onload = () => {
      const item = { id: 'pr' + Date.now(), src: reader.result, name, year };
      const list = getSavedPrestasi();
      list.push(item);
      savePrestasi(list);
      prestasiGrid.appendChild(buildPrestasiCard(item));

      addPrestasiForm.reset();
      addPrestasiPreview.hidden = true;
      closeModal(addPrestasiModal);
    };
    reader.readAsDataURL(file);
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