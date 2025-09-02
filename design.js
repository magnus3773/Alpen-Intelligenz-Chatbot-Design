// Interactive Chat Widget for n8n — Vorlage beibehalten, NUR Design (Navy/Weiß + BG-Image) angepasst
(function() {
    // Initialize widget only once
    if (window.N8nChatWidgetLoaded) return;
    window.N8nChatWidgetLoaded = true;

    // Load font resource - using Poppins for a fresh look
    const fontElement = document.createElement('link');
    fontElement.rel = 'stylesheet';
    fontElement.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontElement);

    // Apply widget styles mit Navy-Theme & sichtbaren Buttons
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
        .chat-assist-widget {
            --chat-color-primary: var(--chat-widget-primary, #0b1f3f); /* NAVY: Header & Bot */
            --chat-color-secondary: var(--chat-widget-secondary, #163a6b); /* User & Buttons */
            --chat-color-tertiary: var(--chat-widget-tertiary, #0f2c56);
            --chat-color-light: var(--chat-widget-light, rgba(255,255,255,0.18));
            --chat-color-surface: var(--chat-widget-surface, #0b1f3f);
            --chat-color-text: var(--chat-widget-text, #ffffff);
            --chat-color-text-light: var(--chat-widget-text-light, rgba(255,255,255,0.8));
            --chat-color-border: var(--chat-widget-border, rgba(255,255,255,0.25));
            --chat-shadow-sm: 0 1px 3px rgba(0,0,0, 0.25);
            --chat-shadow-md: 0 6px 16px rgba(0,0,0, 0.28);
            --chat-shadow-lg: 0 12px 28px rgba(0,0,0, 0.35);
            --chat-radius-sm: 8px;
            --chat-radius-md: 12px;
            --chat-radius-lg: 20px;
            --chat-radius-full: 9999px;
            --chat-transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Poppins', sans-serif;
        }

        .chat-assist-widget .chat-window {
            position: fixed;
            bottom: 90px;
            z-index: 1000;
            width: 380px;
            height: 580px;
            background: #0a1120;
            border-radius: var(--chat-radius-lg);
            box-shadow: var(--chat-shadow-lg);
            border: 1px solid rgba(255,255,255,0.06);
            overflow: hidden;
            display: none;
            flex-direction: column;
            transition: var(--chat-transition);
            opacity: 0;
            transform: translateY(20px) scale(0.96);
        }
        .chat-assist-widget .chat-window.right-side { right: 20px; }
        .chat-assist-widget .chat-window.left-side { left: 20px; }
        .chat-assist-widget .chat-window.visible { display: flex; opacity: 1; transform: translateY(0) scale(1); }

        /* Header wie WhatsApp: Navy-Balken + Logo */
        .chat-assist-widget .chat-header {
            padding: 16px;
            display: flex; align-items: center; gap: 12px;
            background: var(--chat-color-primary);
            color: #fff; position: relative;
        }
        .chat-assist-widget .chat-header-logo { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: #fff; padding: 2px; }
        .chat-assist-widget .chat-header-title { font-size: 16px; font-weight: 600; color: #fff; }
        .chat-assist-widget .chat-close-btn { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.18); border: none; color: white; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; transition: var(--chat-transition); font-size: 18px; border-radius: var(--chat-radius-full); width: 28px; height: 28px; }
        .chat-assist-widget .chat-close-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-50%) scale(1.06); }

        /* Welcome */
        .chat-assist-widget .chat-welcome { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 24px; text-align: center; width: 100%; max-width: 320px; }
        .chat-assist-widget .chat-welcome-title { font-size: 22px; font-weight: 700; color: var(--chat-color-text); margin-bottom: 24px; line-height: 1.3; }
        .chat-assist-widget .chat-start-btn {
            display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 14px 20px;
            background: linear-gradient(135deg, var(--chat-color-secondary) 0%, var(--chat-color-primary) 100%);
            color: white; border: none; border-radius: var(--chat-radius-md); cursor: pointer; font-size: 15px; transition: var(--chat-transition); font-weight: 600; font-family: inherit; margin-bottom: 16px; box-shadow: var(--chat-shadow-md);
        }
        .chat-assist-widget .chat-start-btn:hover { transform: translateY(-2px); box-shadow: var(--chat-shadow-lg); }
        .chat-assist-widget .chat-response-time { font-size: 14px; color: var(--chat-color-text-light); margin: 0; }

        /* Body */
        .chat-assist-widget .chat-body { display: none; flex-direction: column; height: 100%; }
        .chat-assist-widget .chat-body.active { display: flex; }

        /* Nachrichtenbereich mit Bild + leichter Abdunklung */
        .chat-assist-widget .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; position: relative; background: var(--chat-color-primary); background-image: var(--chat-widget-bg-image, none); background-size: cover; background-position: center; background-repeat: no-repeat; }
        .chat-assist-widget .chat-messages::before { content: ''; position: absolute; inset: 0; background: rgba(0,0,0, var(--chat-widget-bg-overlay, 0.25)); pointer-events: none; }
        .chat-assist-widget .chat-messages > * { position: relative; }
        .chat-assist-widget .chat-messages::-webkit-scrollbar { width: 6px; }
        .chat-assist-widget .chat-messages::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.25); border-radius: var(--chat-radius-full); }

        /* Bubbles Navy + Weiß */
        .chat-assist-widget .chat-bubble { padding: 14px 18px; border-radius: var(--chat-radius-md); max-width: 85%; word-wrap: break-word; font-size: 14px; line-height: 1.6; box-shadow: var(--chat-shadow-sm); color: #fff; }
        .chat-assist-widget .chat-bubble.user-bubble { background: var(--chat-color-secondary); align-self: flex-end; border-bottom-right-radius: 6px; }
        .chat-assist-widget .chat-bubble.bot-bubble { background: var(--chat-color-primary); align-self: flex-start; border-bottom-left-radius: 6px; }

        /* Typing */
        .chat-assist-widget .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 14px 18px; background: rgba(255,255,255,0.08); border-radius: var(--chat-radius-md); border: 1px solid rgba(255,255,255,0.12); align-self: flex-start; }
        .chat-assist-widget .typing-dot { width: 8px; height: 8px; background: #fff; border-radius: 50%; opacity: 0.8; animation: typingAnimation 1.4s infinite ease-in-out; }
        .chat-assist-widget .typing-dot:nth-child(2) { animation-delay: .2s; }
        .chat-assist-widget .typing-dot:nth-child(3) { animation-delay: .4s; }
        @keyframes typingAnimation { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }

        /* Controls */
        .chat-assist-widget .chat-controls { padding: 16px; background: rgba(0,0,0,0.12); border-top: 1px solid rgba(255,255,255,0.08); display: flex; gap: 10px; backdrop-filter: blur(4px); }
        .chat-assist-widget .chat-textarea { flex: 1; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.22); border-radius: var(--chat-radius-full); background: var(--chat-color-secondary); color: #fff; resize: none; font-family: inherit; font-size: 14px; line-height: 1.5; max-height: 120px; min-height: 48px; transition: var(--chat-transition); }
        .chat-assist-widget .chat-textarea::placeholder { color: rgba(255,255,255,0.75); }
        .chat-assist-widget .chat-textarea:focus { outline: none; border-color: rgba(255,255,255,0.35); box-shadow: 0 0 0 3px rgba(255,255,255,0.14); }
        .chat-assist-widget .chat-submit { background: linear-gradient(135deg, var(--chat-color-secondary) 0%, var(--chat-color-primary) 100%); color: white; border: none; border-radius: var(--chat-radius-full); width: 48px; height: 48px; cursor: pointer; transition: var(--chat-transition); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: var(--chat-shadow-sm); }
        .chat-assist-widget .chat-submit:hover { transform: scale(1.06); box-shadow: var(--chat-shadow-md); }
        .chat-assist-widget .chat-submit svg { width: 22px; height: 22px; }

        /* Launcher */
        .chat-assist-widget .chat-launcher { position: fixed; bottom: 20px; height: 56px; border-radius: var(--chat-radius-full); background: linear-gradient(135deg, var(--chat-color-secondary) 0%, var(--chat-color-primary) 100%); color: white; border: none; cursor: pointer; box-shadow: var(--chat-shadow-md); z-index: 999; transition: var(--chat-transition); display: flex; align-items: center; padding: 0 20px 0 16px; gap: 8px; }
        .chat-assist-widget .chat-launcher.right-side { right: 20px; }
        .chat-assist-widget .chat-launcher.left-side { left: 20px; }
        .chat-assist-widget .chat-launcher:hover { transform: scale(1.05); box-shadow: var(--chat-shadow-lg); }
        .chat-assist-widget .chat-launcher svg { width: 24px; height: 24px; }
        .chat-assist-widget .chat-launcher-text { font-weight: 600; font-size: 15px; white-space: nowrap; }

        /* Footer */
        .chat-assist-widget .chat-footer { padding: 10px; text-align: center; background: transparent; border-top: 1px solid rgba(255,255,255,0.08); }
        .chat-assist-widget .chat-footer-link { color: #fff; text-decoration: none; font-size: 12px; opacity: 0.85; transition: var(--chat-transition); font-family: inherit; }
        .chat-assist-widget .chat-footer-link:hover { opacity: 1; }

        @media (max-width: 480px) {
            .chat-assist-widget .chat-window { width: calc(100vw - 24px); height: calc(100vh - 120px); left: 12px; right: 12px; bottom: 80px; }
            .chat-assist-widget .chat-launcher { bottom: 16px; }
        }
    `;
    document.head.appendChild(widgetStyles);

    // Default configuration (UNVERÄNDERT, nur Farben vorausgewählt)
    const defaultSettings = {
        webhook: {
            url: '',
            route: ''
        },
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
            primaryColor: '#0b1f3f', // Navy
            secondaryColor: '#163a6b', // helleres Navy
            position: 'right',
            backgroundColor: '#0b1f3f',
            fontColor: '#ffffff'
        },
        suggestedQuestions: []
    };

    // Merge user settings with defaults (TECHNIK AUS VORLAGE GELASSEN)
    const settings = window.ChatWidgetConfig ? 
        {
            webhook: { ...defaultSettings.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultSettings.branding, ...window.ChatWidgetConfig.branding },
            style: { 
                ...defaultSettings.style, 
                ...window.ChatWidgetConfig.style,
                // Force green colors if user provided purple (aus deiner Vorlage beibehalten)
                primaryColor: window.ChatWidgetConfig.style?.primaryColor === '#854fff' ? '#10b981' : (window.ChatWidgetConfig.style?.primaryColor || '#0b1f3f'),
                secondaryColor: window.ChatWidgetConfig.style?.secondaryColor === '#6b3fd4' ? '#059669' : (window.ChatWidgetConfig.style?.secondaryColor || '#163a6b')
            },
            suggestedQuestions: window.ChatWidgetConfig.suggestedQuestions || defaultSettings.suggestedQuestions
        } : defaultSettings;

    // Session tracking
    let conversationId = '';
    let isWaitingForResponse = false;

    // Create widget DOM structure
    const widgetRoot = document.createElement('div');
    widgetRoot.className = 'chat-assist-widget';
    
    // Apply custom colors & optional BG image via Config (keine Logikänderung)
    widgetRoot.style.setProperty('--chat-widget-primary', settings.style.primaryColor);
    widgetRoot.style.setProperty('--chat-widget-secondary', settings.style.secondaryColor);
    widgetRoot.style.setProperty('--chat-widget-tertiary', settings.style.secondaryColor);
    widgetRoot.style.setProperty('--chat-widget-surface', settings.style.backgroundColor);
    widgetRoot.style.setProperty('--chat-widget-text', settings.style.fontColor);
    if (settings.style.backgroundImage) {
        widgetRoot.style.setProperty('--chat-widget-bg-image', `url('${settings.style.backgroundImage}')`);
        widgetRoot.style.setProperty('--chat-widget-bg-overlay', String(settings.style.backgroundOverlay ?? 0.25));
    }

    // Create chat panel
    const chatWindow = document.createElement('div');
    chatWindow.className = `chat-window ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
    
    // Welcome + Header (UNVERÄNDERTER MARKUP-FLOW)
    const welcomeScreenHTML = `
        <div class="chat-header">
            <img class="chat-header-logo" src="${settings.branding.logo}" alt="${settings.branding.name}">
            <span class="chat-header-title">${settings.branding.name}</span>
            <button class="chat-close-btn">×</button>
        </div>
        <div class="chat-welcome">
            <h2 class="chat-welcome-title">${settings.branding.welcomeText}</h2>
            <button class="chat-start-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Start chatting
            </button>
            <p class="chat-response-time">${settings.branding.responseTimeText}</p>
        </div>
        <div class="user-registration">
            <h2 class="registration-title">Please enter your details to start chatting</h2>
            <form class="registration-form">
                <div class="form-field">
                    <label class="form-label" for="chat-user-name">Name</label>
                    <input type="text" id="chat-user-name" class="form-input" placeholder="Your name" required>
                    <div class="error-text" id="name-error"></div>
                </div>
                <div class="form-field">
                    <label class="form-label" for="chat-user-email">Email</label>
                    <input type="email" id="chat-user-email" class="form-input" placeholder="Your email address" required>
                    <div class="error-text" id="email-error"></div>
                </div>
                <button type="submit" class="submit-registration">Continue to Chat</button>
            </form>
        </div>
    `;

    // Chat interface (UNVERÄNDERT)
    const chatInterfaceHTML = `
        <div class="chat-body">
            <div class="chat-messages"></div>
            <div class="chat-controls">
                <textarea class="chat-textarea" placeholder="Type your message here..." rows="1"></textarea>
                <button class="chat-submit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 2L11 13"></path>
                        <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                    </svg>
                </button>
            </div>
            <div class="chat-footer">
                <a class="chat-footer-link" href="${settings.branding.poweredBy.link}" target="_blank">${settings.branding.poweredBy.text}</a>
            </div>
        </div>
    `;
    
    chatWindow.innerHTML = welcomeScreenHTML + chatInterfaceHTML;
    
    // Toggle-Button (UNVERÄNDERT)
    const launchButton = document.createElement('button');
    launchButton.className = `chat-launcher ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
    launchButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        <span class="chat-launcher-text">Need help?</span>`;
    
    // Add elements to DOM
    widgetRoot.appendChild(chatWindow);
    widgetRoot.appendChild(launchButton);
    document.body.appendChild(widgetRoot);

    // Get DOM elements (UNVERÄNDERT)
    const startChatButton = chatWindow.querySelector('.chat-start-btn');
    const chatBody = chatWindow.querySelector('.chat-body');
    const messagesContainer = chatWindow.querySelector('.chat-messages');
    const messageTextarea = chatWindow.querySelector('.chat-textarea');
    const sendButton = chatWindow.querySelector('.chat-submit');
    
    // Registration form elements
    const registrationForm = chatWindow.querySelector('.registration-form');
    const userRegistration = chatWindow.querySelector('.user-registration');
    const chatWelcome = chatWindow.querySelector('.chat-welcome');
    const nameInput = chatWindow.querySelector('#chat-user-name');
    const emailInput = chatWindow.querySelector('#chat-user-email');
    const nameError = chatWindow.querySelector('#name-error');
    const emailError = chatWindow.querySelector('#email-error');

    // Helper (UNVERÄNDERT)
    function createSessionId() { return crypto.randomUUID(); }
    function createTypingIndicator() { const el = document.createElement('div'); el.className = 'typing-indicator'; el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>'; return el; }
    function linkifyText(text) { const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim; return text.replace(urlPattern, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`); }

    function showRegistrationForm() { chatWelcome.style.display = 'none'; userRegistration.classList.add('active'); }
    function isValidEmail(email) { const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return re.test(email); }

    // Registrierung (UNVERÄNDERT)
    async function handleRegistration(event) {
        event.preventDefault();
        nameError.textContent = ''; emailError.textContent = '';
        nameInput.classList.remove('error'); emailInput.classList.remove('error');
        const name = nameInput.value.trim(); const email = emailInput.value.trim();
        let ok = true;
        if (!name) { nameError.textContent = 'Please enter your name'; nameInput.classList.add('error'); ok = false; }
        if (!email) { emailError.textContent = 'Please enter your email'; emailInput.classList.add('error'); ok = false; }
        else if (!isValidEmail(email)) { emailError.textContent = 'Please enter a valid email address'; emailInput.classList.add('error'); ok = false; }
        if (!ok) return;

        conversationId = createSessionId();

        const sessionData = [{
            action: 'loadPreviousSession',
            sessionId: conversationId,
            route: settings.webhook.route,
            metadata: { userId: email, userName: name }
        }];

        try {
            // Wechsel zur Chat-Ansicht (war bei dir hängen geblieben -> CSS oben stellt sicher: .chat-body.active {display:flex})
            userRegistration.classList.remove('active');
            chatBody.classList.add('active');

            const typing = createTypingIndicator();
            messagesContainer.appendChild(typing);

            const sessionResponse = await fetch(settings.webhook.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sessionData) });
            const _sessionData = await sessionResponse.json();

            const userInfo = { action: 'sendMessage', sessionId: conversationId, route: settings.webhook.route, chatInput: `Name: ${name}\nEmail: ${email}`, metadata: { userId: email, userName: name, isUserInfo: true } };
            const infoResp = await fetch(settings.webhook.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userInfo) });
            const infoData = await infoResp.json();

            messagesContainer.removeChild(typing);
            const botMessage = document.createElement('div');
            botMessage.className = 'chat-bubble bot-bubble';
            const messageText = Array.isArray(infoData) ? infoData[0].output : infoData.output;
            botMessage.innerHTML = linkifyText(messageText);
            messagesContainer.appendChild(botMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Registration error:', error);
            const indicator = messagesContainer.querySelector('.typing-indicator');
            if (indicator) messagesContainer.removeChild(indicator);
            const errMsg = document.createElement('div'); errMsg.className = 'chat-bubble bot-bubble'; errMsg.textContent = "Sorry, I couldn't connect to the server. Please try again later."; messagesContainer.appendChild(errMsg);
        }
    }

    // Nachricht senden (UNVERÄNDERT)
    async function submitMessage(messageText) {
        if (isWaitingForResponse) return;
        isWaitingForResponse = true;

        const email = nameInput ? nameInput.value.trim() : "";
        const name = emailInput ? emailInput.value.trim() : "";

        const payload = { action: 'sendMessage', sessionId: conversationId, route: settings.webhook.route, chatInput: messageText, metadata: { userId: email, userName: name } };

        const userMessage = document.createElement('div');
        userMessage.className = 'chat-bubble user-bubble';
        userMessage.textContent = messageText;
        messagesContainer.appendChild(userMessage);

        const typing = createTypingIndicator();
        messagesContainer.appendChild(typing);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const resp = await fetch(settings.webhook.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await resp.json();

            messagesContainer.removeChild(typing);
            const botMessage = document.createElement('div');
            botMessage.className = 'chat-bubble bot-bubble';
            const responseText = Array.isArray(data) ? data[0].output : data.output;
            botMessage.innerHTML = linkifyText(responseText);
            messagesContainer.appendChild(botMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Message submission error:', error);
            messagesContainer.removeChild(typing);
            const errMsg = document.createElement('div'); errMsg.className = 'chat-bubble bot-bubble'; errMsg.textContent = "Sorry, I couldn't send your message. Please try again."; messagesContainer.appendChild(errMsg);
        } finally { isWaitingForResponse = false; }
    }

    // Auto-resize (UNVERÄNDERT)
    function autoResizeTextarea() {
        messageTextarea.style.height = 'auto';
        messageTextarea.style.height = (messageTextarea.scrollHeight > 120 ? 120 : messageTextarea.scrollHeight) + 'px';
    }

    // Events (UNVERÄNDERT)
    startChatButton.addEventListener('click', showRegistrationForm);
    registrationForm.addEventListener('submit', handleRegistration);
    sendButton.addEventListener('click', () => { const v = messageTextarea.value.trim(); if (v && !isWaitingForResponse) { submitMessage(v); messageTextarea.value=''; messageTextarea.style.height='auto'; } });
    messageTextarea.addEventListener('input', autoResizeTextarea);
    messageTextarea.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const v = messageTextarea.value.trim(); if (v && !isWaitingForResponse) { submitMessage(v); messageTextarea.value=''; messageTextarea.style.height='auto'; } } });
    
    const closeButtons = chatWindow.querySelectorAll('.chat-close-btn');
    closeButtons.forEach(btn => btn.addEventListener('click', () => { chatWindow.classList.remove('visible'); }));

    const launchButton = document.createElement('button');
    launchButton.className = `chat-launcher ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
    launchButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        <span class="chat-launcher-text">Need help?</span>`;
    widgetRoot.appendChild(chatWindow);
    widgetRoot.appendChild(launchButton);
    document.body.appendChild(widgetRoot);

    launchButton.addEventListener('click', () => { chatWindow.classList.toggle('visible'); });

})();
