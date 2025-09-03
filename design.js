// Interactive Chat Widget for n8n — Registrierung entfernt, CSS ergänzt
(function() {
    // Initialize widget only once
    if (window.N8nChatWidgetLoaded) return;
    window.N8nChatWidgetLoaded = true;

    // Load font resource - using Poppins for a fresh look
    const fontElement = document.createElement('link');
    fontElement.rel = 'stylesheet';
    fontElement.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontElement);

    // Apply widget styles (Basis wie Vorlage), plus dein Zusatz-CSS
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
        .chat-assist-widget {
            --chat-color-primary: var(--chat-widget-primary, #0b1f3f);
            --chat-color-secondary: var(--chat-widget-secondary, #163a6b);
            --chat-color-tertiary: var(--chat-widget-tertiary, #0f2c56);
            --chat-color-light: var(--chat-widget-light, rgba(11,31,63,0.22));
            --chat-color-surface: var(--chat-widget-surface, #ffffff);
            --chat-color-text: var(--chat-widget-text, #0b1f3f);
            --chat-color-text-light: var(--chat-widget-text-light, #163a6b);
            --chat-color-border: var(--chat-widget-border, rgba(11,31,63,0.28));
            --chat-shadow-sm: 0 1px 3px rgba(11,31,63, 0.12);
            --chat-shadow-md: 0 4px 6px rgba(11,31,63, 0.18);
            --chat-shadow-lg: 0 10px 15px rgba(11,31,63, 0.26);
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
            background: var(--chat-color-surface);
            border-radius: var(--chat-radius-lg);
            box-shadow: var(--chat-shadow-lg);
            border: 1px solid var(--chat-color-light);
            overflow: hidden;
            display: none;
            flex-direction: column;
            transition: var(--chat-transition);
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        .chat-assist-widget .chat-window.right-side { right: 20px; }
        .chat-assist-widget .chat-window.left-side { left: 20px; }
        .chat-assist-widget .chat-window.visible { display: flex; opacity: 1; transform: translateY(0) scale(1); }

        .chat-assist-widget .chat-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white;
            position: relative;
        }
        .chat-assist-widget .chat-header-logo {
            width: 32px; height: 32px; border-radius: var(--chat-radius-sm);
            object-fit: contain; background: white; padding: 4px;
        }
        .chat-assist-widget .chat-header-title { font-size: 16px; font-weight: 600; color: white; }
        .chat-assist-widget .chat-close-btn {
            position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.2); border: none; color: white; cursor: pointer;
            padding: 4px; display: flex; align-items: center; justify-content: center;
            transition: var(--chat-transition); font-size: 18px; border-radius: var(--chat-radius-full);
            width: 28px; height: 28px;
        }
        .chat-assist-widget .chat-close-btn:hover { background: rgba(255, 255, 255, 0.3); transform: translateY(-50%) scale(1.1); }

        /* Welcome-Bereich bleibt im DOM, ist aber ausgeblendet (keine Registrierung) */
        .chat-assist-widget .chat-welcome { display: none; }
        .chat-assist-widget .chat-response-time { font-size: 14px; color: var(--chat-color-text-light); margin: 0; }

        .chat-assist-widget .chat-body { display: none; flex-direction: column; height: 100%; }
        .chat-assist-widget .chat-body.active { display: flex; }

        .chat-assist-widget .chat-messages {
            flex: 1; overflow-y: auto; padding: 20px; background: #f9fafb;
            display: flex; flex-direction: column; gap: 16px; /* mehr Abstand zw. Nachrichten */
        }
        .chat-assist-widget .chat-messages::-webkit-scrollbar { width: 6px; }
        .chat-assist-widget .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-assist-widget .chat-messages::-webkit-scrollbar-thumb {
            background-color: rgba(11, 31, 63, 0.3);
            border-radius: var(--chat-radius-full);
        }

        .chat-assist-widget .chat-bubble {
            padding: 14px 18px; border-radius: var(--chat-radius-md); max-width: 85%;
            word-wrap: break-word; font-size: 14px; line-height: 1.6; position: relative; white-space: pre-line;
        }
        .chat-assist-widget .chat-bubble.user-bubble {
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white; align-self: flex-end; border-bottom-right-radius: 6px; box-shadow: var(--chat-shadow-sm);
        }
        .chat-assist-widget .chat-bubble.bot-bubble {
            background: white; color: var(--chat-color-text); align-self: flex-start;
            border-bottom-left-radius: 6px; box-shadow: var(--chat-shadow-sm); border: 1px solid var(--chat-color-light);
        }

        /* Typing animation */
        .chat-assist-widget .typing-indicator {
            display: flex; align-items: center; gap: 4px; padding: 14px 18px; background: white;
            border-radius: var(--chat-radius-md); border-bottom-left-radius: 4px; max-width: 80px; align-self: flex-start;
            box-shadow: var(--chat-shadow-sm); border: 1px solid var(--chat-color-light);
        }
        .chat-assist-widget .typing-dot { width: 8px; height: 8px; background: var(--chat-color-primary); border-radius: var(--chat-radius-full); opacity: 0.7; animation: typingAnimation 1.4s infinite ease-in-out; }
        .chat-assist-widget .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .chat-assist-widget .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingAnimation { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }

        .chat-assist-widget .chat-controls {
            padding: 16px; background: var(--chat-color-surface); border-top: 1px solid var(--chat-color-light);
            display: flex; gap: 10px;
        }
        .chat-assist-widget .chat-textarea {
            flex: 1; padding: 14px 16px; border: 1px solid var(--chat-color-light); border-radius: var(--chat-radius-md);
            background: var(--chat-color-surface); color: var(--chat-color-text); resize: none; font-family: inherit;
            font-size: 14px; line-height: 1.5; max-height: 120px; min-height: 48px; transition: var(--chat-transition);
        }
        .chat-assist-widget .chat-textarea:focus {
            outline: none; border-color: var(--chat-color-primary); box-shadow: 0 0 0 3px rgba(11, 31, 63, 0.2);
        }
        .chat-assist-widget .chat-textarea::placeholder { color: var(--chat-color-text-light); }

        .chat-assist-widget .chat-submit {
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white; border: none; border-radius: var(--chat-radius-md); width: 48px; height: 48px; cursor: pointer;
            transition: var(--chat-transition); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
            box-shadow: var(--chat-shadow-sm);
        }
        .chat-assist-widget .chat-submit:hover { transform: scale(1.05); box-shadow: var(--chat-shadow-md); }
        .chat-assist-widget .chat-submit svg { width: 22px; height: 22px; }

        .chat-assist-widget .chat-launcher {
            position: fixed; bottom: 20px; height: 56px; border-radius: var(--chat-radius-full);
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white; border: none; cursor: pointer; box-shadow: var(--chat-shadow-md); z-index: 999;
            transition: var(--chat-transition); display: flex; align-items: center; padding: 0 20px 0 16px; gap: 8px;
        }
        .chat-assist-widget .chat-launcher.right-side { right: 20px; }
        .chat-assist-widget .chat-launcher.left-side { left: 20px; }
        .chat-assist-widget .chat-launcher:hover { transform: scale(1.05); box-shadow: var(--chat-shadow-lg); }
        .chat-assist-widget .chat-launcher svg { width: 24px; height: 24px; }
        .chat-assist-widget .chat-launcher-text { font-weight: 600; font-size: 15px; white-space: nowrap; }

        .chat-assist-widget .chat-footer { padding: 10px; text-align: center; background: var(--chat-color-surface); border-top: 1px solid var(--chat-color-light); }
        .chat-assist-widget .chat-footer-link { color: var(--chat-color-primary); text-decoration: none; font-size: 12px; opacity: 0.8; transition: var(--chat-transition); font-family: inherit; }
        .chat-assist-widget .chat-footer-link:hover { opacity: 1; }

        /* Registrierung vollständig ausblenden (DOM bleiben lassen ist okay) */
        .chat-assist-widget .user-registration { display: none !important; }

        /* ===== Dein zusätzlicher CSS-Block (1:1 übernommen) ===== */
        body {
          font-family: system-ui;
          background: #f06d06;
          color: white;
          text-align: center;
        }
        /* Bot-Bubble: Weißer Hintergrund + Navy-Schrift */
        .chat-assist-widget .chat-bubble.bot-bubble {
          background: #ffffff !important;
          color: #0b1f3f !important;
          border: 1px solid #0b1f3f !important;
          border-radius: 18px !important;      /* rundere Ecken */
          border-bottom-left-radius: 4px !important; /* kleine „Sprechblasen-Optik“ */
        }
        /* User-Bubble: Navy + Weiß-Schrift + runde Bubble */
        .chat-assist-widget .chat-bubble.user-bubble {
          background: #0b1f3f !important;
          color: #ffffff !important;
          border-radius: 18px !important;
          border-bottom-right-radius: 4px !important;
        }
        .chat-assist-widget .chat-bubble {
          padding: 16px 10px !important;   /* mehr Platz innen */
          font-size: 15px !important;      /* etwas größere Schrift */
          line-height: 1.5 !important;     /* bessere Lesbarkeit */
        }
        /* Textbox unten: Weißer Hintergrund + Navy-Text */
        .chat-assist-widget .chat-textarea {
          background: #ffffff !important;
          color: #0b1f3f !important;
          border: 1px solid rgba(11,31,63,0.28) !important;
        }
        /* Placeholder in der Textbox: dunkelgrau, klar sichtbar */
        .chat-assist-widget .chat-textarea::placeholder {
          color: #6b7280 !important;
          opacity: 1 !important;
        }
        /* ===== Ende Zusatz-CSS ===== */
    `;
    document.head.appendChild(widgetStyles);

    // Default configuration (Farben auf Navy voreingestellt, kann via Window.ChatWidgetConfig überschrieben werden)
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
            primaryColor: '#0b1f3f',
            secondaryColor: '#163a6b',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#0b1f3f'
        },
        suggestedQuestions: []
    };

    // Merge user settings with defaults (Vorlagen-Logik beibehalten)
    const settings = window.ChatWidgetConfig ? 
        {
            webhook: { ...defaultSettings.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultSettings.branding, ...window.ChatWidgetConfig.branding },
            style: { 
                ...defaultSettings.style, 
                ...window.ChatWidgetConfig.style,
                // (Vorlagen-Kompatibilität) Falls jemand Lila setzt, greift die Vorlage – bleibt hier unangetastet:
                primaryColor: window.ChatWidgetConfig.style?.primaryColor === '#854fff' ? '#10b981' : (window.ChatWidgetConfig.style?.primaryColor || defaultSettings.style.primaryColor),
                secondaryColor: window.ChatWidgetConfig.style?.secondaryColor === '#6b3fd4' ? '#059669' : (window.ChatWidgetConfig.style?.secondaryColor || defaultSettings.style.secondaryColor)
            },
            suggestedQuestions: window.ChatWidgetConfig.suggestedQuestions || defaultSettings.suggestedQuestions
        } : defaultSettings;

    // Session tracking
    let conversationId = '';
    let isWaitingForResponse = false;

    // Create widget DOM structure
    const widgetRoot = document.createElement('div');
    widgetRoot.className = 'chat-assist-widget';
    
    // Apply custom colors
    widgetRoot.style.setProperty('--chat-widget-primary', settings.style.primaryColor);
    widgetRoot.style.setProperty('--chat-widget-secondary', settings.style.secondaryColor);
    widgetRoot.style.setProperty('--chat-widget-tertiary', settings.style.secondaryColor);
    widgetRoot.style.setProperty('--chat-widget-surface', settings.style.backgroundColor);
    widgetRoot.style.setProperty('--chat-widget-text', settings.style.fontColor);

    // Create chat panel
    const chatWindow = document.createElement('div');
    chatWindow.className = `chat-window ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
    
    // Header + (versteckter) Welcome
    const welcomeScreenHTML = `
        <div class="chat-header">
            <img class="chat-header-logo" src="${settings.branding.logo}" alt="${settings.branding.name}">
            <span class="chat-header-title">${settings.branding.name}</span>
            <button class="chat-close-btn">×</button>
        </div>
        <div class="chat-welcome" style="display:none">
            <h2 class="chat-welcome-title">${settings.branding.welcomeText}</h2>
            <button class="chat-start-btn" style="display:none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Start chatting
            </button>
            <p class="chat-response-time">${settings.branding.responseTimeText}</p>
        </div>
        <!-- Registrierung komplett entfernt -->
    `;

    // Chat interface (direkt aktiv)
    const chatInterfaceHTML = `
        <div class="chat-body active">
            <div class="chat-messages"></div>
            <div class="chat-controls">
                <textarea class="chat-textarea" placeholder="Schreib deine Nachricht..." rows="1"></textarea>
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
    
    // Toggle button
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

    // Get DOM elements
    const chatBody = chatWindow.querySelector('.chat-body');
    const messagesContainer = chatWindow.querySelector('.chat-messages');
    const messageTextarea = chatWindow.querySelector('.chat-textarea');
    const sendButton = chatWindow.querySelector('.chat-submit');

    // Helper
    function createSessionId() { return crypto.randomUUID(); }
    function createTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        return indicator;
    }
    function linkifyText(text) {
        const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        return text.replace(urlPattern, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`);
    }

    // Send a message to the webhook
    async function submitMessage(messageText) {
        if (isWaitingForResponse) return;
        isWaitingForResponse = true;

        // Session einmalig erzeugen (ohne Registrierung)
        if (!conversationId) conversationId = createSessionId();

        const requestData = {
            action: "sendMessage",
            sessionId: conversationId,
            route: settings.webhook.route,
            chatInput: messageText,
            metadata: { userId: "", userName: "" }
        };

        // user message
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-bubble user-bubble';
        userMessage.textContent = messageText;
        messagesContainer.appendChild(userMessage);

        const typingIndicator = createTypingIndicator();
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch(settings.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            const responseData = await response.json();

            messagesContainer.removeChild(typingIndicator);

            const botMessage = document.createElement('div');
            botMessage.className = 'chat-bubble bot-bubble';
            const responseText = Array.isArray(responseData) ? responseData[0].output : responseData.output;
            botMessage.innerHTML = linkifyText(responseText);
            messagesContainer.appendChild(botMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Message submission error:', error);
            messagesContainer.removeChild(typingIndicator);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'chat-bubble bot-bubble';
            errorMessage.textContent = "Sorry, I couldn't send your message. Please try again.";
            messagesContainer.appendChild(errorMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } finally {
            isWaitingForResponse = false;
        }
    }

    // Auto-resize textarea
    function autoResizeTextarea() {
        messageTextarea.style.height = 'auto';
        messageTextarea.style.height = (messageTextarea.scrollHeight > 120 ? 120 : messageTextarea.scrollHeight) + 'px';
    }

    // Event listeners
    sendButton.addEventListener('click', () => {
        const messageText = messageTextarea.value.trim();
        if (messageText && !isWaitingForResponse) {
            submitMessage(messageText);
            messageTextarea.value = '';
            messageTextarea.style.height = 'auto';
        }
    });
    messageTextarea.addEventListener('input', autoResizeTextarea);
    messageTextarea.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const messageText = messageTextarea.value.trim();
            if (messageText && !isWaitingForResponse) {
                submitMessage(messageText);
                messageTextarea.value = '';
                messageTextarea.style.height = 'auto';
            }
        }
    });
    launchButton.addEventListener('click', () => {
        chatWindow.classList.toggle('visible');
    });

    // Close button
    const closeButtons = chatWindow.querySelectorAll('.chat-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatWindow.classList.remove('visible');
        });
    });

    // Chat beim Laden sichtbar machen? -> optional:
    // chatWindow.classList.add('visible');

})();