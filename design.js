// Interactive Chat Widget for n8n — Navy WhatsApp Style (navy bubbles, white text, bg image)
(function() {
    // Initialize widget only once
    if (window.N8nChatWidgetLoaded) return;
    window.N8nChatWidgetLoaded = true;
  
    // Load font resource - using Poppins for a clean look
    const fontElement = document.createElement('link');
    fontElement.rel = 'stylesheet';
    fontElement.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontElement);
  
    // Default configuration (navy-first palette)
    const defaultSettings = {
      webhook: { url: '', route: '' },
      branding: {
        logo: '',
        name: '',
        welcomeText: '',
        responseTimeText: '',
        poweredBy: {
          text: 'Powered by n8n',
          link: 'https://n8n.partnerlinks.io/fabimarkl'
        }
      },
      style: {
        // Navy palette
        primaryColor: '#0b1f3f',   // deep navy (bot bubbles + header)
        secondaryColor: '#163a6b', // lighter navy (user bubbles + buttons)
        position: 'right',
        backgroundColor: '#0b1f3f', // used for inputs and accents in dark mode
        fontColor: '#ffffff',
        // New optional fields for this design
        backgroundImage: '', // e.g. 'https://your-cdn.com/bg.jpg'
        backgroundOverlay: 0.25 // 0..1 overlay darkness for readability
      },
      suggestedQuestions: [] // none by default
    };
  
    // Merge user settings with defaults
    const settings = window.ChatWidgetConfig ? {
      webhook: { ...defaultSettings.webhook, ...window.ChatWidgetConfig.webhook },
      branding: { ...defaultSettings.branding, ...window.ChatWidgetConfig.branding },
      style: { ...defaultSettings.style, ...(window.ChatWidgetConfig.style || {}) },
      suggestedQuestions: window.ChatWidgetConfig.suggestedQuestions || defaultSettings.suggestedQuestions
    } : defaultSettings;
  
    // Normalize and derive colors
    const COLORS = {
      primary: settings.style.primaryColor || '#0b1f3f', // bot bubble + header
      secondary: settings.style.secondaryColor || '#163a6b', // user bubble
      textOnNavy: settings.style.fontColor || '#ffffff',
      inputBg: settings.style.backgroundColor || '#0b1f3f'
    };
  
    // Session tracking
    let conversationId = '';
    let isWaitingForResponse = false;
  
    // Create widget DOM root
    const widgetRoot = document.createElement('div');
    widgetRoot.className = 'chat-assist-widget';
  
    // Apply CSS variables
    widgetRoot.style.setProperty('--chat-widget-primary', COLORS.primary);
    widgetRoot.style.setProperty('--chat-widget-secondary', COLORS.secondary);
    widgetRoot.style.setProperty('--chat-widget-text', COLORS.textOnNavy);
    widgetRoot.style.setProperty('--chat-widget-input-bg', COLORS.inputBg);
    widgetRoot.style.setProperty('--chat-widget-bg-image', settings.style.backgroundImage ? `url(${settings.style.backgroundImage})` : 'none');
    widgetRoot.style.setProperty('--chat-widget-bg-overlay', String(settings.style.backgroundOverlay ?? 0.25));
  
    // Styles
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
    .chat-assist-widget { 
      --chat-color-primary: var(--chat-widget-primary, #0b1f3f);
      --chat-color-secondary: var(--chat-widget-secondary, #163a6b);
      --chat-color-text: var(--chat-widget-text, #ffffff);
      --chat-input-bg: var(--chat-widget-input-bg, #0b1f3f);
      --chat-shadow-sm: 0 2px 6px rgba(0,0,0,0.15);
      --chat-shadow-md: 0 8px 20px rgba(0,0,0,0.25);
      --chat-shadow-lg: 0 12px 32px rgba(0,0,0,0.35);
      --chat-radius-sm: 10px;
      --chat-radius-md: 16px;
      --chat-radius-lg: 22px;
      --chat-radius-full: 9999px;
      --chat-transition: all .25s cubic-bezier(.2,.7,.2,1);
      font-family: 'Poppins', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    }
  
    /* Window */
    .chat-assist-widget .chat-window {
      position: fixed;
      bottom: 90px;
      z-index: 1000;
      width: 380px;
      height: 580px;
      background: #0c1220; /* subtle dark shell so navy pops */
      border-radius: var(--chat-radius-lg);
      box-shadow: var(--chat-shadow-lg);
      border: 1px solid rgba(255,255,255,0.06);
      overflow: hidden;
      display: none;
      flex-direction: column;
      transition: var(--chat-transition);
      opacity: 0;
      transform: translateY(16px) scale(.96);
    }
    .chat-assist-widget .chat-window.right-side { right: 20px; }
    .chat-assist-widget .chat-window.left-side { left: 20px; }
    .chat-assist-widget .chat-window.visible { display: flex; opacity: 1; transform: translateY(0) scale(1); }
  
    /* WhatsApp-like header: flat navy bar */
    .chat-assist-widget .chat-header {
      padding: 14px 16px;
      display: flex; align-items: center; gap: 12px;
      background: var(--chat-color-primary);
      color: #fff; position: relative;
    }
    .chat-assist-widget .chat-header-logo {
      width: 34px; height: 34px; border-radius: 50%;
      object-fit: cover; background: #fff; padding: 2px;
    }
    .chat-assist-widget .chat-header-title { font-size: 15px; font-weight: 600; color: #fff; }
    .chat-assist-widget .chat-close-btn {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: rgba(255,255,255,0.16); border: none; color: #fff; cursor: pointer;
      padding: 4px; display: flex; align-items: center; justify-content: center;
      border-radius: var(--chat-radius-full); width: 28px; height: 28px; transition: var(--chat-transition);
    }
    .chat-assist-widget .chat-close-btn:hover { background: rgba(255,255,255,0.26); transform: translateY(-50%) scale(1.06); }
  
    /* Welcome + Registration */
    .chat-assist-widget .chat-welcome { display: none; }
    .chat-assist-widget .user-registration { position: relative; padding: 20px; text-align: left; }
    .chat-assist-widget .user-registration.active { display: block; }
    .chat-assist-widget .registration-title { font-size: 16px; font-weight: 600; color: #fff; margin: 12px 16px; }
    .chat-assist-widget .registration-form { display: flex; flex-direction: column; gap: 12px; padding: 0 16px 12px; }
    .chat-assist-widget .form-field { display: flex; flex-direction: column; gap: 6px; }
    .chat-assist-widget .form-label { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.9); }
    .chat-assist-widget .form-input {
      padding: 12px 14px; border: 1px solid rgba(255,255,255,0.2); border-radius: var(--chat-radius-md);
      font-family: inherit; font-size: 14px; background: rgba(255,255,255,0.06); color: #fff;
      transition: var(--chat-transition);
    }
    .chat-assist-widget .form-input::placeholder { color: rgba(255,255,255,0.65); }
    .chat-assist-widget .form-input:focus { outline: none; border-color: rgba(255,255,255,0.35); box-shadow: 0 0 0 3px rgba(255,255,255,0.14); }
    .chat-assist-widget .form-input.error { border-color: #ef4444; }
    .chat-assist-widget .error-text { font-size: 12px; color: #ff6b6b; margin-top: 2px; }
    .chat-assist-widget .submit-registration {
      display: flex; align-items: center; justify-content: center; width: calc(100% - 32px); margin: 6px 16px 12px;
      padding: 14px 20px; background: var(--chat-color-secondary); color: #fff; border: none; border-radius: var(--chat-radius-md);
      cursor: pointer; font-size: 15px; font-weight: 600; box-shadow: var(--chat-shadow-sm); transition: var(--chat-transition);
    }
    .chat-assist-widget .submit-registration:hover { transform: translateY(-1px); box-shadow: var(--chat-shadow-md); }
    .chat-assist-widget .submit-registration:disabled { opacity: .7; cursor: not-allowed; transform: none; }
  
    /* Chat body */
    .chat-assist-widget .chat-body { display: none; flex-direction: column; height: 100%; }
    .chat-assist-widget .chat-body.active { display: flex; }
  
    /* Messages area with background image + dark overlay */
    .chat-assist-widget .chat-messages {
      position: relative; flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 12px;
      background: var(--chat-color-primary); /* fallback */
      background-image: var(--chat-widget-bg-image);
      background-size: cover; background-position: center; background-repeat: no-repeat;
    }
    .chat-assist-widget .chat-messages::before {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      background: rgba(0,0,0, calc(var(--chat-widget-bg-image) != 'none' ? var(--chat-widget-bg-overlay) : 0));
    }
    .chat-assist-widget .chat-messages > * { position: relative; }
    .chat-assist-widget .chat-messages::-webkit-scrollbar { width: 6px; }
    .chat-assist-widget .chat-messages::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.25); border-radius: var(--chat-radius-full); }
  
    /* Bubbles: full navy + white text */
    .chat-assist-widget .chat-bubble {
      padding: 14px 16px; border-radius: 18px; max-width: 85%; word-wrap: break-word; font-size: 14px; line-height: 1.55; white-space: pre-line; box-shadow: var(--chat-shadow-sm);
    }
    .chat-assist-widget .chat-bubble.user-bubble { background: var(--chat-color-secondary); color: #fff; align-self: flex-end; border-bottom-right-radius: 6px; }
    .chat-assist-widget .chat-bubble.bot-bubble { background: var(--chat-color-primary); color: #fff; align-self: flex-start; border-bottom-left-radius: 6px; }
  
    /* Typing indicator */
    .chat-assist-widget .typing-indicator { display: flex; align-items: center; gap: 5px; padding: 12px 14px; background: rgba(255,255,255,0.08); border-radius: 14px; align-self: flex-start; }
    .chat-assist-widget .typing-dot { width: 7px; height: 7px; background: #fff; border-radius: 50%; opacity: .75; animation: typingAnim 1.4s infinite ease-in-out; }
    .chat-assist-widget .typing-dot:nth-child(2) { animation-delay: .18s; }
    .chat-assist-widget .typing-dot:nth-child(3) { animation-delay: .36s; }
    @keyframes typingAnim { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
  
    /* Controls: dark navy input + white text */
    .chat-assist-widget .chat-controls { padding: 12px; background: rgba(0,0,0,0.12); display: flex; gap: 10px; border-top: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(4px); }
    .chat-assist-widget .chat-textarea {
      flex: 1; padding: 12px 14px; border: 1px solid rgba(255,255,255,0.18); border-radius: var(--chat-radius-full);
      background: var(--chat-input-bg); color: #fff; resize: none; font-family: inherit; font-size: 14px; line-height: 1.5; max-height: 120px; min-height: 44px; transition: var(--chat-transition);
    }
    .chat-assist-widget .chat-textarea::placeholder { color: rgba(255,255,255,0.65); }
    .chat-assist-widget .chat-textarea:focus { outline: none; border-color: rgba(255,255,255,0.32); box-shadow: 0 0 0 3px rgba(255,255,255,0.12); }
    .chat-assist-widget .chat-submit {
      background: var(--chat-color-secondary); color: #fff; border: none; border-radius: var(--chat-radius-full);
      width: 46px; height: 46px; cursor: pointer; transition: var(--chat-transition); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: var(--chat-shadow-sm);
    }
    .chat-assist-widget .chat-submit:hover { transform: scale(1.05); box-shadow: var(--chat-shadow-md); }
    .chat-assist-widget .chat-submit svg { width: 20px; height: 20px; }
  
    /* Footer */
    .chat-assist-widget .chat-footer { padding: 10px; text-align: center; background: transparent; border-top: 1px solid rgba(255,255,255,0.06); }
    .chat-assist-widget .chat-footer-link { color: #fff; text-decoration: none; font-size: 12px; opacity: 0.8; transition: var(--chat-transition); }
    .chat-assist-widget .chat-footer-link:hover { opacity: 1; text-decoration: underline; }
  
    /* Launcher */
    .chat-assist-widget .chat-launcher {
      position: fixed; bottom: 20px; height: 56px; border-radius: var(--chat-radius-full); background: var(--chat-color-secondary);
      color: white; border: none; cursor: pointer; box-shadow: var(--chat-shadow-md); z-index: 999;
      transition: var(--chat-transition); display: flex; align-items: center; padding: 0 18px 0 14px; gap: 8px;
    }
    .chat-assist-widget .chat-launcher.right-side { right: 20px; }
    .chat-assist-widget .chat-launcher.left-side { left: 20px; }
    .chat-assist-widget .chat-launcher:hover { transform: scale(1.05); box-shadow: var(--chat-shadow-lg); }
    .chat-assist-widget .chat-launcher svg { width: 22px; height: 22px; }
    .chat-assist-widget .chat-launcher-text { font-weight: 600; font-size: 15px; white-space: nowrap; }
  
    /* Links inside bubbles */
    .chat-assist-widget .chat-link { color: #fff; text-decoration: underline; word-break: break-word; }
  
    /* Responsive */
    @media (max-width: 480px) {
      .chat-assist-widget .chat-window { width: calc(100vw - 24px); height: calc(100vh - 120px); left: 12px; right: 12px; bottom: 80px; }
      .chat-assist-widget .chat-launcher { bottom: 16px; }
    }
    `;
    document.head.appendChild(widgetStyles);
  
    // Create chat panel
    const chatWindow = document.createElement('div');
    chatWindow.className = `chat-window ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
  
    // Header
    const headerHTML = `
      <div class="chat-header">
        <img class="chat-header-logo" src="${settings.branding.logo}" alt="${settings.branding.name}">
        <span class="chat-header-title">${settings.branding.name || ''}</span>
        <button class="chat-close-btn" aria-label="Close">×</button>
      </div>
    `;
  
    // Welcome (hidden in this design) + Registration (shown first)
    const introHTML = `
      <div class="chat-welcome"></div>
      <div class="user-registration active">
        <h2 class="registration-title">Bitte gib deinen Namen und deine E-Mail ein</h2>
        <form class="registration-form">
          <div class="form-field">
            <label class="form-label" for="chat-user-name">Name</label>
            <input type="text" id="chat-user-name" class="form-input" placeholder="Dein Name" required>
            <div class="error-text" id="name-error"></div>
          </div>
          <div class="form-field">
            <label class="form-label" for="chat-user-email">E-Mail</label>
            <input type="email" id="chat-user-email" class="form-input" placeholder="deine@mail.com" required>
            <div class="error-text" id="email-error"></div>
          </div>
          <button type="submit" class="submit-registration">Weiter zum Chat</button>
        </form>
      </div>
    `;
  
    // Chat interface
    const chatInterfaceHTML = `
      <div class="chat-body">
        <div class="chat-messages"></div>
        <div class="chat-controls">
          <textarea class="chat-textarea" placeholder="Nachricht schreiben…" rows="1"></textarea>
          <button class="chat-submit" aria-label="Senden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 2L11 13"></path>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
            </svg>
          </button>
        </div>
        <div class="chat-footer">
          <a class="chat-footer-link" href="${settings.branding.poweredBy.link}" target="_blank" rel="noopener noreferrer">${settings.branding.poweredBy.text}</a>
        </div>
      </div>
    `;
  
    chatWindow.innerHTML = headerHTML + introHTML + chatInterfaceHTML;
  
    // Launcher
    const launchButton = document.createElement('button');
    launchButton.className = `chat-launcher ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
    launchButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
      <span class="chat-launcher-text">Chat</span>`;
  
    // Add elements to DOM
    widgetRoot.appendChild(chatWindow);
    widgetRoot.appendChild(launchButton);
    document.body.appendChild(widgetRoot);
  
    // Grab DOM elements
    const chatBody = chatWindow.querySelector('.chat-body');
    const messagesContainer = chatWindow.querySelector('.chat-messages');
    const messageTextarea = chatWindow.querySelector('.chat-textarea');
    const sendButton = chatWindow.querySelector('.chat-submit');
    const registrationForm = chatWindow.querySelector('.registration-form');
    const userRegistration = chatWindow.querySelector('.user-registration');
    const nameInput = chatWindow.querySelector('#chat-user-name');
    const emailInput = chatWindow.querySelector('#chat-user-email');
    const nameError = chatWindow.querySelector('#name-error');
    const emailError = chatWindow.querySelector('#email-error');
  
    // Header buttons
    const closeButtons = chatWindow.querySelectorAll('.chat-close-btn');
    closeButtons.forEach(btn => btn.addEventListener('click', () => chatWindow.classList.remove('visible')));
  
    // Helpers
    function createSessionId() { return (crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2); }
    function createTypingIndicator() {
      const indicator = document.createElement('div');
      indicator.className = 'typing-indicator';
      indicator.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
      return indicator;
    }
    function linkifyText(text) {
      const urlPattern = /(\b(https?|ftp):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/gim;
      return String(text || '').replace(urlPattern, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`);
    }
    function autoResizeTextarea() {
      messageTextarea.style.height = 'auto';
      const h = Math.min(messageTextarea.scrollHeight, 120);
      messageTextarea.style.height = h + 'px';
    }
  
    async function handleRegistration(event) {
      event.preventDefault();
      nameError.textContent = '';
      emailError.textContent = '';
      nameInput.classList.remove('error');
      emailInput.classList.remove('error');
  
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
  
      let valid = true;
      if (!name) { nameError.textContent = 'Bitte gib deinen Namen ein'; nameInput.classList.add('error'); valid = false; }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) { emailError.textContent = 'Bitte gib deine E-Mail ein'; emailInput.classList.add('error'); valid = false; }
      else if (!emailRegex.test(email)) { emailError.textContent = 'Bitte gib eine gültige E-Mail ein'; emailInput.classList.add('error'); valid = false; }
      if (!valid) return;
  
      conversationId = createSessionId();
  
      // Show chat body
      userRegistration.classList.remove('active');
      chatBody.classList.add('active');
  
      // Typing indicator
      const typingIndicator = createTypingIndicator();
      messagesContainer.appendChild(typingIndicator);
  
      // Load previous session (optional)
      const sessionData = [{
        action: 'loadPreviousSession',
        sessionId: conversationId,
        route: settings.webhook.route,
        metadata: { userId: email, userName: name }
      }];
  
      try {
        if (settings.webhook.url) {
          await fetch(settings.webhook.url, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData)
          });
        }
  
        // Send user info as first message to backend
        const userInfoData = {
          action: 'sendMessage',
          sessionId: conversationId,
          route: settings.webhook.route,
          chatInput: `Name: ${name}\nEmail: ${email}`,
          metadata: { userId: email, userName: name, isUserInfo: true }
        };
  
        let initialText = settings.branding.welcomeText || 'Hi! Wie kann ich dir helfen?';
        if (settings.webhook.url) {
          const resp = await fetch(settings.webhook.url, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userInfoData)
          });
          const data = await resp.json();
          initialText = Array.isArray(data) ? (data[0]?.output || initialText) : (data?.output || initialText);
        }
  
        // Remove typing, show bot message
        messagesContainer.removeChild(typingIndicator);
        const botMessage = document.createElement('div');
        botMessage.className = 'chat-bubble bot-bubble';
        botMessage.innerHTML = linkifyText(initialText);
        messagesContainer.appendChild(botMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
      } catch (err) {
        console.error('Registration error:', err);
        const indicator = messagesContainer.querySelector('.typing-indicator');
        if (indicator) messagesContainer.removeChild(indicator);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'chat-bubble bot-bubble';
        errorMessage.textContent = 'Sorry, Verbindung fehlgeschlagen. Bitte später erneut versuchen.';
        messagesContainer.appendChild(errorMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  
    async function submitMessage(messageText) {
      if (isWaitingForResponse) return;
      isWaitingForResponse = true;
  
      const email = emailInput ? emailInput.value.trim() : '';
      const name = nameInput ? nameInput.value.trim() : '';
  
      const requestData = {
        action: 'sendMessage',
        sessionId: conversationId,
        route: settings.webhook.route,
        chatInput: messageText,
        metadata: { userId: email, userName: name }
      };
  
      // Show user message
      const userMessage = document.createElement('div');
      userMessage.className = 'chat-bubble user-bubble';
      userMessage.textContent = messageText;
      messagesContainer.appendChild(userMessage);
  
      // Typing indicator
      const typingIndicator = createTypingIndicator();
      messagesContainer.appendChild(typingIndicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
      try {
        let responseText = '…';
        if (settings.webhook.url) {
          const response = await fetch(settings.webhook.url, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
          });
          const data = await response.json();
          responseText = Array.isArray(data) ? (data[0]?.output || '') : (data?.output || '');
        } else {
          responseText = 'Webhook-URL fehlt in der Konfiguration.';
        }
  
        // Remove typing, show bot response
        messagesContainer.removeChild(typingIndicator);
        const botMessage = document.createElement('div');
        botMessage.className = 'chat-bubble bot-bubble';
        botMessage.innerHTML = linkifyText(responseText);
        messagesContainer.appendChild(botMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } catch (err) {
        console.error('Message submission error:', err);
        messagesContainer.removeChild(typingIndicator);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'chat-bubble bot-bubble';
        errorMessage.textContent = 'Senden fehlgeschlagen. Bitte erneut versuchen.';
        messagesContainer.appendChild(errorMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } finally {
        isWaitingForResponse = false;
      }
    }
  
    // Events
    registrationForm.addEventListener('submit', handleRegistration);
    sendButton.addEventListener('click', () => {
      const messageText = messageTextarea.value.trim();
      if (messageText && !isWaitingForResponse) {
        submitMessage(messageText);
        messageTextarea.value = '';
        messageTextarea.style.height = 'auto';
      }
    });
    messageTextarea.addEventListener('input', autoResizeTextarea);
    messageTextarea.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const messageText = messageTextarea.value.trim();
        if (messageText && !isWaitingForResponse) {
          submitMessage(messageText);
          messageTextarea.value = '';
          messageTextarea.style.height = 'auto';
        }
      }
    });
  
    // Toggle window
    launchButton.addEventListener('click', () => {
      chatWindow.classList.toggle('visible');
    });
  
    // Mount
    document.body.appendChild(widgetRoot);
  })();
  