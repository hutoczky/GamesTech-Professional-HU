(() => {
  const RELEASE_TAG = 'gamestech-hu-v1.0.0';
  const REPO_URL = 'https://github.com/hutoczky/GamesTech-Professional-HU';
  const RELEASE_BASE = REPO_URL + '/releases/download/' + RELEASE_TAG + '/';
  const HUB_FILE = 'GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_V2.0.33_R6_WINDOWS_CLICK_AUTODETECT_ELITE_UI_FIX_WINDOWS_LINUX.zip';
  const MODPACK_FILE = 'GamesTech_HU_Modpack_Installer_v1.4.0_STABILITY_FIX_Windows_Linux.zip';
  const RELEASE_PAGE = REPO_URL + '/releases/tag/' + RELEASE_TAG;
  const MEMBER_KEY = 'gamestech_member_v2';
  const SESSION_KEY = 'gamestech_session_v1';

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

  const getStoredAccount = () => {
    try {
      const raw = localStorage.getItem(MEMBER_KEY);
      if (!raw) return null;
      const account = JSON.parse(raw);
      if (!account?.name || !account?.email || !account?.passwordHash) return null;
      return account;
    } catch {
      return null;
    }
  };

  const getMember = () => {
    const account = getStoredAccount();
    if (!account) return null;
    const sessionEmail = sessionStorage.getItem(SESSION_KEY);
    return sessionEmail === account.email ? account : null;
  };

  const updateAccountUI = () => {
    const joinButton = document.querySelector('.top-join');
    if (!joinButton) return;

    const member = getMember();
    const label = joinButton.querySelector('span');

    if (member) {
      joinButton.classList.add('account-active');
      joinButton.dataset.account = 'Bejelentkezve';
      joinButton.setAttribute('aria-label', 'Bejelentkezve: ' + member.name + ' – fiók megnyitása');
      if (label) label.textContent = '✓ Bejelentkezve';
    } else {
      joinButton.classList.remove('account-active');
      delete joinButton.dataset.account;
      joinButton.setAttribute('aria-label', 'Regisztráció / belépés');
      if (label) label.textContent = 'Csatlakozz most';
    }
  };

  const hashPassword = async (value) => {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const isValidEmail = (value) => {
    const email = String(value ?? '').trim();
    if (!email) return false;
    const input = document.createElement('input');
    input.type = 'email';
    input.required = true;
    input.value = email;
    return input.checkValidity();
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

  const openAccountGateway = (targetUrl = '') => {
    pendingProtectedUrl = targetUrl || '';
    const member = getMember();

    if (member) {
      openModal(
        'Fiók és hozzáférés',
        '<div class="member-card">' +
          '<div class="member-avatar">GT</div>' +
          '<div><b>' + escapeHtml(member.name) + '</b><small>' + escapeHtml(member.email) + '</small></div>' +
        '</div>' +
        '<p>Be vagy jelentkezve. A védett letöltések és GitHub-hivatkozások elérhetők.</p>',
        (pendingProtectedUrl
          ? '<button type="button" class="primary continue-protected">Folytatás</button>'
          : '') +
        '<button type="button" class="logout-member">Kijelentkezés</button>'
      );
      return;
    }

    openModal(
      'Csatlakozz a GamesTech közösséghez',
      '<p>Válaszd a regisztrációt, ha még nincs fiókod, vagy lépj be a meglévő helyi fiókoddal.</p>' +
      '<div class="auth-choice-grid">' +
        '<button type="button" class="auth-choice primary-choice" data-auth-choice="register">' +
          '<span class="auth-choice-icon">✦</span><b>Regisztráció</b><small>Új hozzáférés létrehozása</small>' +
        '</button>' +
        '<button type="button" class="auth-choice" data-auth-choice="login">' +
          '<span class="auth-choice-icon">→</span><b>Belépés</b><small>Meglévő fiók használata</small>' +
        '</button>' +
      '</div>',
      ''
    );
  };

  const openRegistration = () => {
    openModal(
      'Regisztráció',
      '<p>Hozd létre a GamesTech hozzáférésedet. Ezután a letöltésekhez, a forráskódhoz és a GitHub Release oldalhoz belépés után férsz hozzá.</p>' +
      '<form id="registration-form" class="registration-form" novalidate>' +
        '<label for="reg-name">Megjelenített név</label>' +
        '<input id="reg-name" name="name" autocomplete="name" minlength="2" maxlength="48" required placeholder="pl. GamesTech">' +
        '<label for="reg-email">E-mail cím</label>' +
        '<input id="reg-email" name="email" type="email" autocomplete="email" maxlength="120" required placeholder="nev@pelda.hu">' +
        '<label for="reg-password">Jelszó</label>' +
        '<input id="reg-password" name="password" type="password" autocomplete="new-password" minlength="6" maxlength="128" required placeholder="Legalább 6 karakter">' +
        '<label class="consent-row"><input name="consent" type="checkbox" required> <span>Elfogadom, hogy ezen az eszközön a helyi fiókadatok eltárolásra kerüljenek.</span></label>' +
        '<p class="form-note">A fiók ezen a statikus oldalon helyben tárolódik. A jelszó SHA-256 lenyomatként kerül mentésre, nem olvasható szövegként.</p>' +
        '<p class="form-error" id="registration-error" role="alert"></p>' +
      '</form>',
      '<button type="button" class="back-auth">Vissza</button>' +
      '<button type="submit" form="registration-form" class="primary">Regisztráció</button>'
    );
  };

  const openLogin = () => {
    openModal(
      'Belépés',
      '<p>Lépj be a korábban ezen az eszközön létrehozott GamesTech fiókoddal.</p>' +
      '<form id="login-form" class="registration-form" novalidate>' +
        '<label for="login-email">E-mail cím</label>' +
        '<input id="login-email" name="email" type="email" autocomplete="email" required placeholder="nev@pelda.hu">' +
        '<label for="login-password">Jelszó</label>' +
        '<input id="login-password" name="password" type="password" autocomplete="current-password" required placeholder="Jelszó">' +
        '<p class="form-note">Ez a jelenlegi statikus verzió helyi fiókot használ, ezért a belépés azon a böngészőn működik, ahol a regisztráció történt.</p>' +
        '<p class="form-error" id="login-error" role="alert"></p>' +
      '</form>',
      '<button type="button" class="back-auth">Vissza</button>' +
      '<button type="submit" form="login-form" class="primary">Belépés</button>'
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
      openAccountGateway(url);
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

    const authChoice = e.target.closest('[data-auth-choice]');
    if (authChoice) {
      if (authChoice.dataset.authChoice === 'register') openRegistration();
      if (authChoice.dataset.authChoice === 'login') openLogin();
      return;
    }

    if (e.target.closest('.back-auth')) {
      openAccountGateway(pendingProtectedUrl);
      return;
    }

    if (e.target.closest('.logout-member')) {
      sessionStorage.removeItem(SESSION_KEY);
      updateAccountUI();
      pendingProtectedUrl = '';
      showToast('Kijelentkezés kész');
      openAccountGateway();
    }
  });

  modal.addEventListener('submit', async (e) => {
    if (e.target.id === 'registration-form') {
      e.preventDefault();

      const form = e.target;
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim().toLowerCase();
      const password = form.elements.password.value;
      const consent = form.elements.consent.checked;
      const error = document.getElementById('registration-error');

      if (name.length < 2) {
        error.textContent = 'Adj meg legalább 2 karakteres nevet.';
        return;
      }
      if (!isValidEmail(email)) {
        error.textContent = 'Adj meg érvényes e-mail címet.';
        return;
      }
      if (password.length < 6) {
        error.textContent = 'A jelszó legalább 6 karakter legyen.';
        return;
      }
      if (!consent) {
        error.textContent = 'A helyi fiók tárolásához szükséges a hozzájárulás.';
        return;
      }

      const passwordHash = await hashPassword(password);
      localStorage.setItem(MEMBER_KEY, JSON.stringify({
        name,
        email,
        passwordHash,
        registeredAt: new Date().toISOString()
      }));
      sessionStorage.setItem(SESSION_KEY, email);
      updateAccountUI();

      showToast('Regisztráció és belépés kész');
      if (pendingProtectedUrl) {
        continueProtected();
      } else {
        openAccountGateway();
      }
      return;
    }

    if (e.target.id === 'login-form') {
      e.preventDefault();

      const form = e.target;
      const email = form.elements.email.value.trim().toLowerCase();
      const password = form.elements.password.value;
      const error = document.getElementById('login-error');
      const account = getStoredAccount();

      if (!isValidEmail(email)) {
        error.textContent = 'Adj meg érvényes e-mail címet.';
        return;
      }

      if (!account) {
        error.textContent = 'Ezen az eszközön még nincs regisztrált fiók.';
        return;
      }
      if (email !== account.email) {
        error.textContent = 'Az e-mail cím nem egyezik a regisztrált fiókkal.';
        return;
      }

      const passwordHash = await hashPassword(password);
      if (passwordHash !== account.passwordHash) {
        error.textContent = 'Hibás jelszó.';
        return;
      }

      sessionStorage.setItem(SESSION_KEY, account.email);
      updateAccountUI();
      showToast('Sikeres belépés');
      if (pendingProtectedUrl) {
        continueProtected();
      } else {
        openAccountGateway();
      }
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
    account: () => openAccountGateway(),
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

  updateAccountUI();
})();