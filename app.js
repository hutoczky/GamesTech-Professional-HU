(() => {
  const RELEASE_TAG = 'gamestech-hu-v1.0.0';
  const RELEASE_BASE = 'https://github.com/hutoczky/GamesTech-Professional-HU/releases/download/' + RELEASE_TAG + '/';
  const HUB_FILE = 'GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_V2.0.33_R6_WINDOWS_CLICK_AUTODETECT_ELITE_UI_FIX_WINDOWS_LINUX.zip';
  const MODPACK_FILE = 'GamesTech_HU_Modpack_Installer_v1.4.0_STABILITY_FIX_Windows_Linux.zip';
  const RELEASE_PAGE = 'https://github.com/hutoczky/GamesTech-Professional-HU/releases/tag/' + RELEASE_TAG;

  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const actions = document.getElementById('modal-actions');
  const toast = document.querySelector('.toast');
  let toastTimer;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1900);
  };

  const openModal = (heading, html, actionHtml = '') => {
    title.textContent = heading;
    body.innerHTML = html;
    actions.innerHTML = actionHtml;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.querySelector('.modal-close')?.focus());
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const downloadActions = () =>
    '<a class="primary" href="' + RELEASE_BASE + HUB_FILE + '">Professional HUB letöltése</a>' +
    '<a href="' + RELEASE_BASE + MODPACK_FILE + '">Modpack Installer letöltése</a>' +
    '<a href="' + RELEASE_PAGE + '" target="_blank" rel="noopener">GitHub Release</a>';

  const downloadsBody = () =>
    '<p>A kiadások közvetlenül a különálló GamesTech Professional HU GitHub Release-ből tölthetők le.</p>' +
    '<div class="download-grid">' +
      '<div class="download-item"><b>Professional Unified HUB V2.0.33 R6</b><small>Windows + Linux • univerzális játékfordítás-kezelő</small></div>' +
      '<div class="download-item"><b>Modpack Installer v1.4.0</b><small>Windows + Linux • stabilitási javítás</small></div>' +
    '</div>';

  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  document.querySelectorAll('[data-game]').forEach(card => {
    card.addEventListener('click', () => {
      const game = card.dataset.game;
      openModal(
        game,
        '<p><strong>' + game + '</strong> a GamesTech Professional HU játékfordítási felület része.</p>' +
        '<p>A teljes Professional HUB kezeli a támogatott játékokat, a verziókat és a Windows/Linux telepítési folyamatot.</p>',
        downloadActions()
      );
    });
  });

  const handlers = {
    games: () => openModal('Játékfordítások és letöltések', downloadsBody(), downloadActions()),
    platforms: () => openModal(
      'Windows / Linux',
      '<p>A letölthető csomagok Windows és Linux környezetre készültek. A Professional HUB egy közös, univerzális felületet biztosít.</p>',
      downloadActions()
    ),
    community: () => openModal(
      'GamesTech közösség',
      '<p>A projekt külön GitHub-repositoryban él. A kiadások és frissítések ugyanitt követhetők.</p>',
      '<a class="primary" href="https://github.com/hutoczky/GamesTech-Professional-HU" target="_blank" rel="noopener">GitHub projekt</a>'
    ),
    support: () => openModal(
      'Támogatás',
      '<p>Hibajelzéshez és kiadási információkhoz használd a külön GamesTech Professional HU GitHub-projektet.</p>',
      '<a class="primary" href="https://github.com/hutoczky/GamesTech-Professional-HU/issues" target="_blank" rel="noopener">Hibajegy nyitása</a>'
    ),
    about: () => openModal(
      'GamesTech Professional HU',
      '<p>Prémium játékfordítások egy helyen. Ez a weboldal a FormatX/FormatXSuite projekttől teljesen különálló GamesTech projekt.</p>',
      '<a class="primary" href="https://github.com/hutoczky/GamesTech-Professional-HU" target="_blank" rel="noopener">Forráskód</a>'
    ),
    screenshots: () => openModal(
      'Képernyőképek',
      '<p>A referencia szerinti galéria interaktív területe aktív. A projekt következő iterációjában további valós játékbeli képek köthetők hozzá.</p>'
    ),
    previous: () => showToast('Előző galériakép'),
    next: () => showToast('Következő galériakép'),
    'news-dune': () => openModal(
      'Dune: Awakening magyarítás',
      '<p>A Dune: Awakening a GamesTech Professional HU kiemelt fordításai között szerepel.</p>',
      downloadActions()
    ),
    'news-installer': () => openModal(
      'Új telepítő rendszer',
      '<p>A Windows/Linux univerzális telepítő külön kiadásként tölthető le a GitHub Release oldalról.</p>',
      downloadActions()
    ),
    language: () => showToast('Magyar nyelv aktív'),
    search: () => {
      openModal(
        'Keresés',
        '<label for="site-search">Keresés a játékfordítások között</label>' +
        '<input id="site-search" autocomplete="off" placeholder="pl. Dune, Starfield, S.T.A.L.K.E.R.">'
      );
      const input = document.getElementById('site-search');
      input?.focus();
      input?.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const q = input.value.trim().toLowerCase();
        if (!q) return;
        const games = ['Dune: Awakening','Starfield','Helldivers II','S.T.A.L.K.E.R. 2','The Last of Us Part I'];
        const hit = games.find(g => g.toLowerCase().includes(q));
        showToast(hit ? 'Találat: ' + hit : 'Nincs találat: ' + input.value.trim());
      });
    }
  };

  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => handlers[el.dataset.action]?.());
  });
})();