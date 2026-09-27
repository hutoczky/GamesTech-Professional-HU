(() => {
  const RELEASE_TAG = 'gamestech-hu-v1.0.0';
  const REPO_URL = 'https://github.com/hutoczky/GamesTech-Professional-HU';
  const RELEASE_BASE = REPO_URL + '/releases/download/' + RELEASE_TAG + '/';
  const HUB_FILE = 'GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_V2.0.33_R6_WINDOWS_CLICK_AUTODETECT_ELITE_UI_FIX_WINDOWS_LINUX.zip';
  const MODPACK_FILE = 'GamesTech_HU_Modpack_Installer_v1.4.0_STABILITY_FIX_Windows_Linux.zip';
  const RELEASE_PAGE = REPO_URL + '/releases/tag/' + RELEASE_TAG;
  const MEMBER_KEY = 'gamestech_member_v1';

  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const actions = document.getElementById('modal-actions');
  const toast = document.querySelector('.toast');
  let toastTimer;
  let pendingProtectedUrl = '';

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[ch]);

  const getMember = () => {
    try {
      const raw = localStorage.getItem(MEMBER_KEY);
      if (!raw) return null;
      const member = JSON.parse(raw);
      if (!member?.name || !member?.email) return null;
      return member;
    } catch {
      return null;
    }
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
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

  const protectedButton = (label, url, primary = false) =>
    '<button type="button" class="' + (primary ? 'primary ' : '') +
    'protected-link" data-protected-url="' + encodeURIComponent(url) + '">' +
    escapeHtml(label) + '</button>';

  const downloadActions = () =>
    protectedButton('Professional HUB letöltése', RELEASE_BASE + HUB_FILE, true) +
    protectedButton('Modpack Installer letöltése', RELEASE_BASE + MODPACK_FILE) +
    protectedButton('GitHub Release', RELEASE_PAGE);

  const downloadsBody = () => {
    const member = getMember();
    const status = member
      ? '<div class="member-status ok">✓ Regisztrált hozzáférés aktív: <b>' + escapeHtml(member.name) + '</b></div>'
      : '<div class="member-status locked">🔒 A letöltéshez és a GitHub Release megnyitásához regisztráció szükséges.</div>';

    return status +
      '<p>A kiadások a különálló GamesTech Professional HU projektből érhetők el.</p>' +
      '<div class="download-grid">' +
        '<div class="download-item"><b>Professional Unified HUB V2.0.33 R6</b><small>Windows + Linux • univerzális játékfordítás-kezelő</small></div>' +
        '<div class="download-item"><b>Modpack Installer v1.4.0</b><small>Windows + Linux • stabilitási javítás</small></div>' +
      '</div>';
  };

  const openRegistration = (targetUrl = '') => {
    pendingProtectedUrl = targetUrl || '';
    const member = getMember();

    if (member) {
      openModal(
        'Fiók és hozzáférés',
        '<div class="member-card">' +
          '<div class="member-avatar">GT</div>' +
          '<div><b>' + escapeHtml(member.name) + '</b><small>' + escapeHtml(member.email) + '</small></div>' +
        '</div>' +
        '<p>A regisztrált hozzáférés aktív ezen az eszközön.</p>',
        (pendingProtectedUrl
          ? '<button type="button" class="primary continue-protected">Folytatás</button>'
          : '') +
        '<button type="button" class="logout-member">Kijelentkezés</button>'
      );
      return;
    }

    openModal(
      'Regisztráció szükséges',
      '<p>A letöltésekhez, a forráskódhoz és a GitHub Release oldalhoz előbb regisztrálj.</p>' +
      '<form id="registration-form" class="registration-form" novalidate>' +
        '<label for="reg-name">Megjelenített név</label>' +
        '<input id="reg-name" name="name" autocomplete="name" minlength="2" maxlength="48" required placeholder="pl. GamesTech">' +
        '<label for="reg-email">E-mail cím</label>' +
        '<input id="reg-email" name="email" type="email" autocomplete="email" maxlength="120" required placeholder="nev@pelda.hu">' +
        '<label class="consent-row"><input name="consent" type="checkbox" required> <span>Elfogadom, hogy ezen az eszközön a hozzáférési profil eltárolásra kerüljön.</span></label>' +
        '<p class="form-note">A regisztráció ezen a statikus oldalon helyi hozzáférési profilt hoz létre; jelszót nem kér és nem tárol.</p>' +
        '<p class="form-error" id="registration-error" role="alert"></p>' +
      '</form>',
      '<button type="submit" form="registration-form" class="primary">Regisztráció és folytatás</button>'
    );
  };

  const continueProtected = () => {
    if (!pendingProtectedUrl) return;
    const url = pendingProtectedUrl;
    pendingProtectedUrl = '';
    closeModal();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const requireRegistration = (url) => {
    if (!getMember()) {
      openRegistration(url);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  modal.addEventListener('click', (e) => {
    const protectedLink = e.target.closest('[data-protected-url]');
    if (protectedLink) {
      requireRegistration(decodeURIComponent(protectedLink.dataset.protectedUrl));
      return;
    }

    if (e.target.closest('.continue-protected')) {
      continueProtected();
      return;
    }

    if (e.target.closest('.logout-member')) {
      localStorage.removeItem(MEMBER_KEY);
      pendingProtectedUrl = '';
      showToast('Kijelentkezés kész');
      openRegistration();
    }
  });

  modal.addEventListener('submit', (e) => {
    if (e.target.id !== 'registration-form') return;
    e.preventDefault();

    const form = e.target;
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim().toLowerCase();
    const consent = form.elements.consent.checked;
    const error = document.getElementById('registration-error');

    if (name.length < 2) {
      error.textContent = 'Adj meg legalább 2 karakteres nevet.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error.textContent = 'Adj meg érvényes e-mail címet.';
      return;
    }
    if (!consent) {
      error.textContent = 'A helyi hozzáférési profil tárolásához szükséges a hozzájárulás.';
      return;
    }

    localStorage.setItem(MEMBER_KEY, JSON.stringify({
      name,
      email,
      registeredAt: new Date().toISOString()
    }));

    showToast('Regisztráció kész');
    if (pendingProtectedUrl) {
      continueProtected();
    } else {
      openRegistration();
    }
  });

  document.querySelectorAll('[data-game]').forEach(card => {
    card.addEventListener('click', () => {
      const game = card.dataset.game;
      openModal(
        game,
        '<p><strong>' + escapeHtml(game) + '</strong> a GamesTech Professional HU játékfordítási felület része.</p>' +
        '<p>A teljes Professional HUB kezeli a támogatott játékokat, a verziókat és a Windows/Linux telepítési folyamatot.</p>',
        downloadActions()
      );
    });
  });

  const handlers = {
    games: () => openModal('Játékfordítások és letöltések', downloadsBody(), downloadActions()),
    platforms: () => openModal(
      'Windows / Linux',
      '<p>A letölthető csomagok Windows és Linux környezetre készültek. A Professional HUB egy közös, univerzális felületet biztosít.</p>' +
      (getMember() ? '<div class="member-status ok">✓ Regisztrált hozzáférés aktív.</div>' : '<div class="member-status locked">🔒 Letöltéshez regisztráció szükséges.</div>'),
      downloadActions()
    ),
    account: () => openRegistration(),
    community: () => openModal(
      'GamesTech közösség',
      '<p>A projekt külön GitHub-repositoryban él. A forráskód és a kiadások megnyitásához regisztráció szükséges.</p>',
      protectedButton('GitHub projekt / forráskód', REPO_URL, true) +
      protectedButton('GitHub Releases', RELEASE_PAGE)
    ),
    support: () => openModal(
      'Támogatás',
      '<p>Hibajelzéshez használd a külön GamesTech Professional HU GitHub-projekt Issues felületét.</p>',
      '<a class="primary" href="' + REPO_URL + '/issues" target="_blank" rel="noopener">Hibajegy nyitása</a>'
    ),
    about: () => openModal(
      'GamesTech Professional HU',
      '<p>Prémium játékfordítások egy helyen. Ez a weboldal a FormatX/FormatXSuite projekttől teljesen különálló GamesTech projekt.</p>' +
      '<div class="member-status locked">🔒 A forráskód megnyitása regisztrációhoz kötött.</div>',
      protectedButton('Forráskód', REPO_URL, true)
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
      '<p>A Windows/Linux univerzális telepítő külön kiadásként érhető el. Letöltéshez regisztráció szükséges.</p>',
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