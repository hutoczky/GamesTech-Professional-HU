(() => {
  const RELEASE_TAG = 'gamestech-hu-v1.0.0';
  const REPO_URL = 'https://github.com/hutoczky/GamesTech-Professional-HU';
  const RELEASE_BASE = REPO_URL + '/releases/download/' + RELEASE_TAG + '/';
  const HUB_FILE = 'GamesTech_HU_PROFESSIONAL_UNIFIED_HUB_V2.0.34_R14_REFERENCE_MATCH_WINDOWS_LINUX.zip';
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
      if (label) {
        label.innerHTML =
          '<span class="login-state-line">✓ Bejelentkezve</span>' +
          '<span class="login-user-line">' + escapeHtml(member.name) + '</span>';
      }
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

  const openModal = (heading, html, actionHtml = '', mode = '') => {
    title.textContent = heading;
    body.innerHTML = html;
    actions.innerHTML = actionHtml;
    modal.classList.remove('auth-mode', 'account-mode');
    if (mode) modal.classList.add(mode);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.querySelector('input, button, a')?.focus());
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
    protectedButton('Fordító HUB letöltése', RELEASE_BASE + HUB_FILE, true) +
    protectedButton('Modpack Installer letöltése', RELEASE_BASE + MODPACK_FILE);

  const rulesButton = (label = 'Titoktartás és terjesztési szabályok') =>
    '<button type="button" class="rules-link" data-open-rules>' + escapeHtml(label) + '</button>';

  const rulesBody = () =>
    '<div class="policy-intro"><b>GamesTech Professional HU – titoktartási és terjesztési szabályok</b>' +
      '<small>Hatályos: 2026. október 4.</small></div>' +
    '<div class="policy-section"><h3>1. Engedélyezett használat</h3>' +
      '<p>A nyilvánosan kiadott GamesTech fordító HUB és fordítási csomagok letölthetők és használhatók saját célra, jogszerűen beszerzett játékpéldánnyal.</p>' +
      '<p>Másokkal az <b>eredeti GamesTech weboldal vagy hivatalos letöltési oldal linkje</b> szabadon megosztható.</p></div>' +
    '<div class="policy-section"><h3>2. Terjesztési korlátozások</h3>' +
      '<p>Írásos engedély nélkül tilos a GamesTech csomagokat más webhelyre, fájlmegosztóra vagy saját letöltési tárhelyre újrafeltölteni, tükrözni, újracsomagolni vagy módosított formában továbbterjeszteni.</p>' +
      '<p>Tilos a fordítás vagy a telepítő értékesítése, fizetős csomag részeként történő terjesztése, illetve a GamesTech név, logó, szerzői jelölések vagy frissítési információk eltávolítása vagy megtévesztő módosítása.</p></div>' +
    '<div class="policy-section"><h3>3. Titoktartás – nem nyilvános anyagok</h3>' +
      '<p>A még nem publikált tesztverziók, előzetes build-ek, privát letöltési linkek, hozzáférési adatok, kulcsok, belső dokumentumok és külön megjelölt tesztanyagok bizalmasak. Ezeket a címzett nem teheti közzé és nem adhatja tovább engedély nélkül.</p>' +
      '<p>A már nyilvánosan közzétett GamesTech kiadás önmagában nem minősül bizalmas anyagnak; arra a fenti terjesztési szabályok vonatkoznak.</p></div>' +
    '<div class="policy-section"><h3>4. Módosítás és saját kiadás</h3>' +
      '<p>Saját módosított változat GamesTech kiadásként nem terjeszthető. Javítási vagy együttműködési javaslat küldhető a projektnek, de a hivatalos kiadás megjelölését csak a GamesTech projekt használhatja.</p></div>' +
    '<div class="policy-section"><h3>5. Harmadik felek jogai</h3>' +
      '<p>A játékok, játéknevek, képek és egyéb harmadik féltől származó elemek jogai az eredeti jogosultakat illetik. A GamesTech fordítás nem ad tulajdonjogot az alapjátékhoz vagy annak védett tartalmaihoz.</p></div>' +
    '<div class="policy-section"><h3>6. Elfogadás</h3>' +
      '<p>A GamesTech csomag letöltésével vagy használatával a felhasználó tudomásul veszi ezeket a szabályokat. Külön tesztprogram vagy privát hozzáférés esetén további feltételek is érvényesek lehetnek.</p></div>';

  const openRules = () => openModal(
    'Titoktartás és terjesztési szabályok',
    rulesBody(),
    '<button type="button" class="primary" data-close>Rendben</button>'
  );

  const downloadsBody = () => {
    const member = getMember();
    const status = member
      ? '<div class="member-status ok">✓ Regisztrált hozzáférés aktív: <b>' + escapeHtml(member.name) + '</b></div>'
      : '<div class="member-status locked">🔒 A letöltéshez regisztráció szükséges.</div>';

    return status +
      '<p>A legújabb GamesTech fordító és telepítő csomagok innen közvetlenül letölthetők.</p>' +
      '<div class="download-grid">' +
        '<div class="download-item"><b>Professional Unified HUB V2.0.34 R14</b><small>Windows + Linux • referenciahű prémium UI • Dune V1.5R2 • egykattintásos frissítés</small></div>' +
        '<div class="download-item"><b>Modpack Installer v1.4.0</b><small>Windows + Linux • stabilitási javítás</small></div>' +
      '</div>' +
      '<div class="rules-notice"><span>A letöltéssel elfogadod a GamesTech terjesztési szabályait.</span>' +
        rulesButton('Szabályok megtekintése') +
      '</div>';
  };

  const openAccountGateway = (targetUrl = '') => {
    pendingProtectedUrl = targetUrl || '';
    const member = getMember();

    if (member) {
      openModal(
        'Fiók és hozzáférés',
        '<div class="account-hero">' +
          '<div class="member-avatar studio-avatar">GT</div>' +
          '<div class="account-meta">' +
            '<span class="auth-kicker">AKTÍV MUNKAMENET</span>' +
            '<b>' + escapeHtml(member.name) + '</b>' +
            '<small>' + escapeHtml(member.email) + '</small>' +
          '</div>' +
          '<span class="online-pill"><i></i> Bejelentkezve</span>' +
        '</div>' +
        '<div class="access-strip"><span>✓ Fordító HUB</span><span>✓ Letöltések</span><span>✓ Frissítések</span></div>' +
        '<p class="auth-copy">A hozzáférés aktív ezen a böngészőn. A fordító HUB és a letöltések elérhetők.</p>',
        (pendingProtectedUrl
          ? '<button type="button" class="primary continue-protected">Folytatás</button>'
          : '') +
        '<button type="button" class="logout-member danger-ghost">Kijelentkezés</button>',
        'account-mode'
      );
      return;
    }

    openModal(
      'Csatlakozz a GamesTech közösséghez',
      '<div class="auth-welcome">' +
        '<span class="auth-kicker">GAMESTECH ACCESS</span>' +
        '<p>Regisztrálj új hozzáférést, vagy lépj be a már létrehozott fiókoddal.</p>' +
      '</div>' +
      '<div class="auth-choice-grid">' +
        '<button type="button" class="auth-choice primary-choice" data-auth-choice="register">' +
          '<span class="auth-choice-icon">＋</span><b>Regisztráció</b><small>Új GamesTech hozzáférés létrehozása</small><span class="choice-arrow">→</span>' +
        '</button>' +
        '<button type="button" class="auth-choice" data-auth-choice="login">' +
          '<span class="auth-choice-icon">↳</span><b>Belépés</b><small>Meglévő hozzáférés használata</small><span class="choice-arrow">→</span>' +
        '</button>' +
      '</div>',
      '',
      'auth-mode'
    );
  };

  const openRegistration = () => {
    openModal(
      'Regisztráció',
      '<div class="auth-welcome compact">' +
        '<span class="auth-kicker">ÚJ GAMESTECH FIÓK</span>' +
        '<p>Hozd létre a hozzáférésedet a GamesTech fordító HUB és a letöltések eléréséhez.</p>' +
      '</div>' +
      '<form id="registration-form" class="registration-form studio-form" novalidate>' +
        '<div class="form-field">' +
          '<label for="reg-name"><span>Megjelenített név</span><small>Ez jelenik meg belépés után.</small></label>' +
          '<div class="input-shell"><span class="input-mark">Aa</span><input id="reg-name" name="name" autocomplete="name" minlength="2" maxlength="48" required placeholder="pl. GamesTech"></div>' +
        '</div>' +
        '<div class="form-field">' +
          '<label for="reg-email"><span>E-mail cím</span><small>A belépési azonosítód.</small></label>' +
          '<div class="input-shell"><span class="input-mark">@</span><input id="reg-email" name="email" type="email" autocomplete="email" maxlength="120" required placeholder="nev@pelda.hu"></div>' +
        '</div>' +
        '<div class="form-field">' +
          '<label for="reg-password"><span>Jelszó</span><small>Minimum 6 karakter.</small></label>' +
          '<div class="input-shell"><span class="input-mark">••</span><input id="reg-password" name="password" type="password" autocomplete="new-password" minlength="6" maxlength="128" required placeholder="Legalább 6 karakter"><button class="password-toggle" type="button" data-toggle-password="reg-password" aria-label="Jelszó megjelenítése">Mutat</button></div>' +
        '</div>' +
        '<label class="consent-card consent-row"><input name="consent" type="checkbox" required><span><b>Helyi profil és felhasználási szabályok elfogadása</b><small>A fiókadatok ezen a böngészőn kerülnek tárolásra, és elfogadod a titoktartási és terjesztési szabályokat.</small></span></label>' +
        '<div class="rules-inline-wrap">' + rulesButton('Titoktartási és terjesztési szabályok megnyitása') + '</div>' +
        '<div class="local-security-note"><span class="note-dot"></span><p>Ez a webes verzió helyi böngészőprofilt használ. A jelszó nem olvasható szövegként kerül mentésre.</p></div>' +
        '<p class="form-error" id="registration-error" role="alert"></p>' +
      '</form>',
      '<button type="button" class="back-auth secondary-action">← Vissza</button>' +
      '<button type="submit" form="registration-form" class="primary auth-submit">Regisztráció <span>→</span></button>',
      'auth-mode'
    );
  };

  const openLogin = () => {
    openModal(
      'Belépés',
      '<div class="auth-welcome compact">' +
        '<span class="auth-kicker">GAMESTECH ACCESS</span>' +
        '<p>Lépj be a korábban ezen a böngészőn létrehozott fiókoddal.</p>' +
      '</div>' +
      '<form id="login-form" class="registration-form studio-form" novalidate>' +
        '<div class="form-field">' +
          '<label for="login-email"><span>E-mail cím</span><small>A regisztrált címed.</small></label>' +
          '<div class="input-shell"><span class="input-mark">@</span><input id="login-email" name="email" type="email" autocomplete="email" required placeholder="nev@pelda.hu"></div>' +
        '</div>' +
        '<div class="form-field">' +
          '<label for="login-password"><span>Jelszó</span><small>A helyi fiókod jelszava.</small></label>' +
          '<div class="input-shell"><span class="input-mark">••</span><input id="login-password" name="password" type="password" autocomplete="current-password" required placeholder="Jelszó"><button class="password-toggle" type="button" data-toggle-password="login-password" aria-label="Jelszó megjelenítése">Mutat</button></div>' +
        '</div>' +
        '<div class="local-security-note"><span class="note-dot"></span><p>A belépés ezen a statikus verzión azon a böngészőn működik, ahol a regisztráció történt.</p></div>' +
        '<p class="form-error" id="login-error" role="alert"></p>' +
      '</form>',
      '<button type="button" class="back-auth secondary-action">← Vissza</button>' +
      '<button type="submit" form="login-form" class="primary auth-submit">Belépés <span>→</span></button>',
      'auth-mode'
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
    const closeLink = e.target.closest('[data-close]');
    if (closeLink) {
      closeModal();
      return;
    }

    const rulesLink = e.target.closest('[data-open-rules]');
    if (rulesLink) {
      openRules();
      return;
    }

    const protectedLink = e.target.closest('[data-protected-url]');
    if (protectedLink) {
      requireRegistration(decodeURIComponent(protectedLink.dataset.protectedUrl));
      return;
    }

    if (e.target.closest('.continue-protected')) {
      continueProtected();
      return;
    }

    const passwordToggle = e.target.closest('[data-toggle-password]');
    if (passwordToggle) {
      const input = document.getElementById(passwordToggle.dataset.togglePassword);
      if (input) {
        const reveal = input.type === 'password';
        input.type = reveal ? 'text' : 'password';
        passwordToggle.textContent = reveal ? 'Rejt' : 'Mutat';
        passwordToggle.setAttribute('aria-label', reveal ? 'Jelszó elrejtése' : 'Jelszó megjelenítése');
        input.focus();
      }
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

  const setFormError = (form, errorEl, message, fieldName = '') => {
    errorEl.textContent = message;
    form.querySelectorAll('.form-field').forEach(el => el.classList.remove('field-error'));
    if (fieldName) form.elements[fieldName]?.closest('.form-field')?.classList.add('field-error');
  };

  modal.addEventListener('input', (e) => {
    e.target.closest('.form-field')?.classList.remove('field-error');
    const form = e.target.closest('form');
    form?.querySelector('.form-error') && (form.querySelector('.form-error').textContent = '');
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
        setFormError(form, error, 'Adj meg legalább 2 karakteres nevet.', 'name');
        return;
      }
      if (!isValidEmail(email)) {
        setFormError(form, error, 'Adj meg érvényes e-mail címet.', 'email');
        return;
      }
      if (password.length < 6) {
        setFormError(form, error, 'A jelszó legalább 6 karakter legyen.', 'password');
        return;
      }
      if (!consent) {
        setFormError(form, error, 'A helyi profil használatához szükséges a hozzájárulás.');
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
        setFormError(form, error, 'Ezen a böngészőn még nincs regisztrált fiók.');
        return;
      }
      if (email !== account.email) {
        setFormError(form, error, 'Az e-mail cím nem egyezik a regisztrált fiókkal.', 'email');
        return;
      }

      const passwordHash = await hashPassword(password);
      if (passwordHash !== account.passwordHash) {
        setFormError(form, error, 'Hibás jelszó.', 'password');
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
      '<p>A GamesTech Professional HU projekt letöltései és frissítései egy helyen érhetők el.</p>',
      protectedButton('Fordító HUB letöltése', RELEASE_BASE + HUB_FILE, true) +
      rulesButton('Terjesztési szabályok')
    ),
    support: () => openModal(
      'GamesTech támogatása',
      '<div class="support-card">' +
        '<div class="support-copy">' +
          '<span class="auth-kicker">ÖNKÉNTES TÁMOGATÁS</span>' +
          '<h3>Köszönöm, ha támogatod a GamesTech Professional HU fejlesztését.</h3>' +
          '<p>A támogatás teljesen önkéntes. A QR-kódot telefonról beolvashatod, vagy megnyithatod közvetlenül a Revolut támogatási linket.</p>' +
          '<div class="support-revtag">@jozsefywjv</div>' +
          '<p class="support-note">A Revolut.me hivatkozással Revolut-fiókból vagy támogatott bankkártyával is küldhető támogatás.</p>' +
        '</div>' +
        '<a class="support-qr" href="https://revolut.me/jozsefywjv" target="_blank" rel="noopener" aria-label="Revolut támogatás megnyitása">' +
          '<img src="assets/revolut-support.svg" alt="Revolut támogatási QR-kód – @jozsefywjv">' +
          '<small>QR-kód beolvasása</small>' +
        '</a>' +
      '</div>' +
      '<div class="support-secondary"><b>Hibát találtál?</b><span>A támogatástól függetlenül továbbra is küldhetsz hibajegyet.</span></div>',
      '<a class="primary support-pay" href="https://revolut.me/jozsefywjv" target="_blank" rel="noopener">Támogatás Revoluton</a>' +
      rulesButton('Titoktartás és terjesztési szabályok') +
      '<a href="' + REPO_URL + '/issues" target="_blank" rel="noopener">Hibajegy nyitása</a>'
    ),
    about: () => openModal(
      'GamesTech Professional HU',
      '<p>Prémium játékfordítások egy helyen. Ez a weboldal a FormatX/FormatXSuite projekttől teljesen különálló GamesTech projekt.</p>' +
      '<div class="member-status locked">🔒 A Fordító HUB letöltéséhez regisztráció szükséges.</div>',
      protectedButton('Fordító HUB letöltése', RELEASE_BASE + HUB_FILE, true) +
      rulesButton('Titoktartás és terjesztési szabályok')
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