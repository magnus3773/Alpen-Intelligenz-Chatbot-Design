// Interactive Chat Widget for n8n — Navy WhatsApp Style (nochmals komplett)
(function() {
  if (window.N8nChatWidgetLoaded) return;
  window.N8nChatWidgetLoaded = true;

  const fontElement = document.createElement('link');
  fontElement.rel = 'stylesheet';
  fontElement.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
  document.head.appendChild(fontElement);

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
      primaryColor: '#0b1f3f',
      secondaryColor: '#163a6b',
      position: 'right',
      backgroundColor: '#0b1f3f',
      fontColor: '#ffffff',
      backgroundImage: '',
      backgroundOverlay: 0.25
    },
    suggestedQuestions: []
  };

  const settings = window.ChatWidgetConfig ? {
    webhook: { ...defaultSettings.webhook, ...window.ChatWidgetConfig.webhook },
    branding: { ...defaultSettings.branding, ...window.ChatWidgetConfig.branding },
    style: { ...defaultSettings.style, ...(window.ChatWidgetConfig.style || {}) },
    suggestedQuestions: window.ChatWidgetConfig.suggestedQuestions || defaultSettings.suggestedQuestions
  } : defaultSettings;

  let conversationId = '';
  let isWaitingForResponse = false;

  const widgetRoot = document.createElement('div');
  widgetRoot.className = 'chat-assist-widget';

  const widgetStyles = document.createElement('style');
  widgetStyles.textContent = `
    .chat-assist-widget { font-family: 'Poppins', sans-serif; }
    .chat-assist-widget .chat-window { width: 380px; height: 580px; background:#0c1220; border-radius:20px; display:none; flex-direction:column; position:fixed; bottom:90px; right:20px; z-index:1000; box-shadow:0 12px 32px rgba(0,0,0,0.35); overflow:hidden; }
    .chat-assist-widget .chat-window.visible { display:flex; }
    .chat-assist-widget .chat-header { background:#0b1f3f; color:#fff; display:flex; align-items:center; padding:14px 16px; position:relative; }
    .chat-assist-widget .chat-header-logo { width:34px; height:34px; border-radius:50%; object-fit:cover; margin-right:10px; background:#fff; padding:2px; }
    .chat-assist-widget .chat-header-title { font-weight:600; }
    .chat-assist-widget .chat-close-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.2); border:none; border-radius:50%; color:#fff; width:26px; height:26px; cursor:pointer; }
    .chat-assist-widget .user-registration { padding:20px; }
    .chat-assist-widget .registration-title { color:#fff; font-weight:600; margin-bottom:12px; }
    .chat-assist-widget .form-input { width:100%; padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.1); color:#fff; }
    .chat-assist-widget .submit-registration { margin-top:10px; width:100%; padding:12px; border:none; border-radius:12px; background:#163a6b; color:#fff; cursor:pointer; }
    .chat-assist-widget .chat-body { display:none; flex-direction:column; height:100%; }
    .chat-assist-widget .chat-body.active { display:flex; }
    .chat-assist-widget .chat-messages { flex:1; padding:16px; display:flex; flex-direction:column; gap:10px; overflow-y:auto; background:#0b1f3f url('${settings.style.backgroundImage}') center/cover no-repeat; position:relative; }
    .chat-assist-widget .chat-messages::before { content:''; position:absolute; inset:0; background:rgba(0,0,0,${settings.style.backgroundOverlay}); }
    .chat-assist-widget .chat-messages>*{position:relative;}
    .chat-assist-widget .chat-bubble { padding:12px 16px; border-radius:16px; color:#fff; max-width:80%; }
    .chat-assist-widget .chat-bubble.user-bubble { background:#163a6b; align-self:flex-end; }
    .chat-assist-widget .chat-bubble.bot-bubble { background:#0b1f3f; align-self:flex-start; }
    .chat-assist-widget .chat-controls { display:flex; padding:10px; gap:8px; background:rgba(0,0,0,0.2); }
    .chat-assist-widget .chat-textarea { flex:1; padding:10px; border-radius:20px; border:1px solid rgba(255,255,255,0.2); background:#163a6b; color:#fff; resize:none; }
    .chat-assist-widget .chat-submit { width:40px; height:40px; border-radius:50%; background:#0b1f3f; border:none; color:#fff; cursor:pointer; }
    .chat-assist-widget .chat-launcher { position:fixed; bottom:20px; right:20px; background:#163a6b; color:#fff; border:none; border-radius:30px; padding:10px 16px; display:flex; align-items:center; gap:8px; cursor:pointer; }
  `;
  document.head.appendChild(widgetStyles);

  const chatWindow = document.createElement('div');
  chatWindow.className = 'chat-window';

  chatWindow.innerHTML = `
    <div class="chat-header">
      <img class="chat-header-logo" src="${settings.branding.logo}" alt="${settings.branding.name}">
      <span class="chat-header-title">${settings.branding.name}</span>
      <button class="chat-close-btn">×</button>
    </div>
    <div class="user-registration active">
      <h2 class="registration-title">Bitte Name und E-Mail eingeben</h2>
      <form class="registration-form">
        <input id="chat-user-name" class="form-input" type="text" placeholder="Dein Name" required>
        <input id="chat-user-email" class="form-input" type="email" placeholder="deine@mail.com" required>
        <button type="submit" class="submit-registration">Weiter</button>
      </form>
    </div>
    <div class="chat-body">
      <div class="chat-messages"></div>
      <div class="chat-controls">
        <textarea class="chat-textarea" placeholder="Nachricht schreiben…"></textarea>
        <button class="chat-submit">➤</button>
      </div>
    </div>`;

  const launchButton = document.createElement('button');
  launchButton.className = 'chat-launcher';
  launchButton.innerHTML = '💬 Chat';

  widgetRoot.appendChild(chatWindow);
  widgetRoot.appendChild(launchButton);
  document.body.appendChild(widgetRoot);

  const chatBody = chatWindow.querySelector('.chat-body');
  const messagesContainer = chatWindow.querySelector('.chat-messages');
  const messageTextarea = chatWindow.querySelector('.chat-textarea');
  const sendButton = chatWindow.querySelector('.chat-submit');
  const registrationForm = chatWindow.querySelector('.registration-form');
  const userRegistration = chatWindow.querySelector('.user-registration');
  const nameInput = chatWindow.querySelector('#chat-user-name');
  const emailInput = chatWindow.querySelector('#chat-user-email');

  registrationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!nameInput.value || !emailInput.value) return;
    conversationId = Math.random().toString(36).slice(2);
    userRegistration.classList.remove('active');
    chatBody.classList.add('active');
  });

  sendButton.addEventListener('click', () => {
    const text = messageTextarea.value.trim();
    if(!text) return;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user-bubble';
    bubble.textContent = text;
    messagesContainer.appendChild(bubble);
    messageTextarea.value = '';
  });

  launchButton.addEventListener('click',()=>{chatWindow.classList.toggle('visible');});
  chatWindow.querySelector('.chat-close-btn').addEventListener('click',()=>chatWindow.classList.remove('visible'));
})();

  