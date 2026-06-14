document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tabs-nav .tab');
  const contents = document.querySelectorAll('.tab-content');
  const message = document.getElementById('button-message');
  const heroAction = document.getElementById('hero-action');
  const navLinks = document.querySelectorAll('.main-nav .nav-link');
  const pageLinks = document.querySelectorAll('a[data-page]');
  const pagePanels = document.querySelectorAll('.page-panel');
  const sections = document.querySelectorAll('main section[id]');
  const countdownEl = document.getElementById('race-countdown');
  const showEmailButton = document.getElementById('show-email');
  const aboutEmail = document.getElementById('about-email');
  const emailAddress = 'hawinick9@gmail.com';
  const openAuthButton = document.getElementById('open-auth');
  const authModal = document.getElementById('auth-modal');
  const authBackdrop = document.getElementById('auth-backdrop');
  const authClose = document.getElementById('auth-close');
  const authTabs = document.querySelectorAll('.auth-tab');
  const authPanels = document.querySelectorAll('.auth-panel');
  const loginForm = document.getElementById('login-panel');
  const signupForm = document.getElementById('signup-panel');
  const verifyButton = document.getElementById('verify-button');
  const verifyCodeInput = document.getElementById('verify-code');
  const authStatus = document.getElementById('auth-status');
  const adminStatus = document.getElementById('admin-status');

  async function loadAdminStatus() {
    if (!adminStatus) return;
    try {
      const response = await fetch('/admin-status');
      const data = await response.json();
      if (data && data.success) {
        adminStatus.textContent = data.online ? 'Admin online' : 'Admin offline';
        adminStatus.classList.toggle('online', data.online);
      }
    } catch (error) {
      console.error('Unable to load admin status:', error);
    }
  }

  function activateTab(tabKey) {
    tabs.forEach(button => {
      const active = button.dataset.tab === tabKey;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active);
    });

    contents.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabKey);
    });
  }

  function scrollSpy() {
    const offset = window.scrollY + window.innerHeight / 3;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.id;
      const link = document.querySelector(`.main-nav .nav-link[href='#${id}']`);

      if (link && window.getComputedStyle(section).display !== 'none') {
        if (offset >= top && offset < top + height) {
          navLinks.forEach(item => item.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }

  function updateCountdown() {
    const nextRace = new Date('2026-05-26T14:00:00');
    const now = new Date();
    const diff = Math.max(0, nextRace - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    countdownEl.textContent = `${days}d ${hours}h ${minutes}m`;
  }

  function getStoredUser() {
    const raw = localStorage.getItem('formula1-user');
    return raw ? JSON.parse(raw) : null;
  }

  function setStoredUser(user) {
    localStorage.setItem('formula1-user', JSON.stringify(user));
  }

  function setSession(email) {
    localStorage.setItem('formula1-session', email);
  }

  function clearSession() {
    localStorage.removeItem('formula1-session');
  }

  function getSession() {
    return localStorage.getItem('formula1-session');
  }

  function updateAuthStatus() {
    const email = getSession();
    if (email) {
      authStatus.textContent = `Signed in as ${email}`;
      authStatus.classList.add('logged-in');
      openAuthButton.textContent = 'Logout';
    } else {
      authStatus.textContent = 'Not signed in';
      authStatus.classList.remove('logged-in');
      openAuthButton.textContent = 'Login / Sign Up';
    }
  }

  function showMessage(text) {
    message.textContent = text;
  }

  function activatePage(pageKey) {
    pageLinks.forEach(link => {
      const active = link.dataset.page === pageKey;
      link.classList.toggle('active', active);
    });
    pagePanels.forEach(panel => {
      panel.classList.toggle('active', panel.dataset.page === pageKey);
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function initPageFromHash() {
    const pageKey = window.location.hash.slice(1) || 'home';
    const validPages = ['home', 'teams', 'drivers', 'schedule', 'news', 'chat', 'about'];
    activatePage(validPages.includes(pageKey) ? pageKey : 'home');
  }

  const chatForm = document.getElementById('chat-form');
  const chatMessages = document.getElementById('chat-messages');
  const chatNameInput = document.getElementById('chat-name');
  const chatMessageInput = document.getElementById('chat-message');

  function showVerificationPanel() {
    authPanels.forEach(panel => panel.classList.toggle('active', panel.id === 'verify-panel'));
  }

  async function loadComments() {
    try {
      const response = await fetch('/comments');
      const data = await response.json();
      if (data.success && Array.isArray(data.comments)) {
        renderComments(data.comments);
      }
    } catch (error) {
      console.error('Unable to load comments:', error);
    }
  }

  function renderComments(comments) {
    if (!chatMessages) return;
    chatMessages.innerHTML = '';
    comments.forEach(comment => {
      const messageCard = document.createElement('article');
      messageCard.className = 'chat-message';

      const authorEl = document.createElement('strong');
      authorEl.textContent = comment.author || 'Guest';

      const textEl = document.createElement('p');
      textEl.textContent = comment.message || '';

      const timeEl = document.createElement('time');
      timeEl.textContent = new Date(comment.createdAt).toLocaleString();

      messageCard.append(authorEl, textEl, timeEl);
      chatMessages.append(messageCard);
    });
  }

  async function postComment(author, message) {
    try {
      const response = await fetch('/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, message }),
      });
      const data = await response.json();
      if (!data.success) {
        showMessage(data.message || 'Unable to post comment.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Comment submit failed:', error);
      showMessage('Unable to post comment.');
      return false;
    }
  }

  function setPendingVerification(payload) {
    localStorage.setItem('formula1-pending', JSON.stringify(payload));
  }

  function getPendingVerification() {
    const raw = localStorage.getItem('formula1-pending');
    return raw ? JSON.parse(raw) : null;
  }

  function clearPendingVerification() {
    localStorage.removeItem('formula1-pending');
  }

  tabs.forEach(button => {
    button.addEventListener('click', () => {
      activateTab(button.dataset.tab);
      message.textContent = `Showing ${button.textContent} content.`;
    });
  });

  heroAction.addEventListener('click', () => {
    message.textContent = 'Live update: Monaco Grand Prix will be a strategic tyre battle.';
  });

  function openAuth() {
    authModal.classList.add('open');
    authModal.setAttribute('aria-hidden', 'false');
  }

  function closeAuth() {
    authModal.classList.remove('open');
    authModal.setAttribute('aria-hidden', 'true');
  }

  function switchAuthTab(tabKey) {
    authTabs.forEach(tab => {
      const active = tab.dataset.auth === tabKey;
      tab.classList.toggle('active', active);
    });
    authPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tabKey}-panel`);
    });
  }

  if (openAuthButton) {
    openAuthButton.addEventListener('click', () => {
      if (getSession()) {
        clearSession();
        updateAuthStatus();
        showMessage('Logged out successfully.');
      } else {
        openAuth();
      }
    });
  }
  if (authClose) {
    authClose.addEventListener('click', closeAuth);
  }
  if (authBackdrop) {
    authBackdrop.addEventListener('click', closeAuth);
  }
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => switchAuthTab(tab.dataset.auth));
  });

  if (loginForm) {
    loginForm.addEventListener('submit', event => {
      event.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const stored = getStoredUser();
      if (!email || !password) {
        showMessage('Please enter your email and password.');
        return;
      }
      if (!stored || stored.email !== email || stored.password !== password) {
        showMessage('Email or password is incorrect.');
        return;
      }
      setSession(email);
      updateAuthStatus();
      closeAuth();
      showMessage(`Login successful. Welcome back, ${email}!`);
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async event => {
      event.preventDefault();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm').value;
      if (!email || !password || !confirm) {
        showMessage('Please fill in all signup fields.');
        return;
      }
      if (password !== confirm) {
        showMessage('Passwords do not match.');
        return;
      }
      const existing = getStoredUser();
      if (existing && existing.email === email) {
        showMessage('An account already exists with that email. Please login.');
        return;
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setPendingVerification({ email, password, code });

      try {
        const response = await fetch('/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          showMessage(error?.message || 'Unable to send verification email. Please try again.');
          return;
        }

        showVerificationPanel();
        showMessage(`Verification code sent to ${email}. Check your email and enter the code.`);
      } catch (error) {
        console.error('Signup verification request failed:', error);
        showMessage('Unable to reach email service. Please try again later.');
      }
    });
  }

  if (verifyButton) {
    verifyButton.addEventListener('click', () => {
      const pending = getPendingVerification();
      const code = verifyCodeInput.value.trim();
      if (!pending) {
        showMessage('No pending signup found. Please sign up again.');
        return;
      }
      if (code !== pending.code) {
        showMessage('Verification code is incorrect.');
        return;
      }
      setStoredUser({ email: pending.email, password: pending.password });
      setSession(pending.email);
      clearPendingVerification();
      updateAuthStatus();
      closeAuth();
      showMessage(`Verification complete. Signed in as ${pending.email}.`);
    });
  }

  if (chatForm) {
    chatForm.addEventListener('submit', async event => {
      event.preventDefault();
      const author = getSession() || chatNameInput.value.trim() || 'Guest';
      const message = chatMessageInput.value.trim();
      if (!message) {
        showMessage('Please enter a comment before posting.');
        return;
      }
      const success = await postComment(author, message);
      if (success) {
        chatMessageInput.value = '';
        showMessage('Comment posted successfully.');
        loadComments();
      }
    });
  }

  if (showEmailButton) {
    showEmailButton.addEventListener('click', () => {
      aboutEmail.innerHTML = `Email: <span class="email-hidden">${emailAddress}</span>`;
      showMessage('Email address revealed on the About page.');
    });
  }

  pageLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const page = link.dataset.page;
      if (page) {
        activatePage(page);
        window.history.replaceState(null, '', `#${page}`);
      }
    });
  });

  window.addEventListener('hashchange', initPageFromHash);
  window.addEventListener('scroll', scrollSpy);
  updateCountdown();
  setInterval(updateCountdown, 60000);
  initPageFromHash();
  activateTab('overview-panel');
  updateAuthStatus();
  loadAdminStatus();
  setInterval(loadAdminStatus, 10000);
  loadComments();
  scrollSpy();
});
