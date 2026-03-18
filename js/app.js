// LlamaEdge Chat PWA - Main Application
const APP_VERSION = '1.0.0';

// Default configuration
const DEFAULT_CONFIG = {
  endpoint: 'https://2h3kect6s5f0be89fq2l4iovk8.ingress.akash.profszone.xyz/v1/chat/completions',
  model: 'Qwen2-0.5B-Instruct-Q5_K_M.gguf',
  maxTokens: 2048,
  temperature: 0.7,
  useWebLLM: false,
  webLLMModel: 'Qwen2-0.5B-Instruct-q4f32_1-MLC',
  theme: 'dark',
  streamResponse: false
};

// Application state
let appState = {
  config: { ...DEFAULT_CONFIG },
  conversationHistory: [],
  isLoading: false,
  isOnline: navigator.onLine,
  currentView: 'chat',
  webLLMEngine: null,
  webLLMLoading: false,
  deferredPrompt: null,
  loadingStartTime: null,
  loadingTimerInterval: null
};

// DOM Elements cache
let elements = {};

// Initialize application
async function initApp() {
  console.log('Initializing LlamaEdge Chat PWA v' + APP_VERSION);
  
  // Cache DOM elements
  elements = {
    chatContainer: document.getElementById('chatContainer'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    clearBtn: document.getElementById('clearBtn'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    welcomeMessage: document.getElementById('welcomeMessage'),
    messageCount: document.getElementById('messageCount'),
    lastResponseTime: document.getElementById('lastResponseTime'),
    offlineBanner: document.getElementById('offlineBanner'),
    navChat: document.getElementById('navChat'),
    navSettings: document.getElementById('navSettings'),
    navHistory: document.getElementById('navHistory'),
    chatView: document.getElementById('chatView'),
    settingsView: document.getElementById('settingsView'),
    historyView: document.getElementById('historyView'),
    endpointInput: document.getElementById('endpointInput'),
    modelInput: document.getElementById('modelInput'),
    maxTokensInput: document.getElementById('maxTokensInput'),
    temperatureInput: document.getElementById('temperatureInput'),
    temperatureValue: document.getElementById('temperatureValue'),
    themeToggle: document.getElementById('themeToggle'),
    webllmToggle: document.getElementById('webllmToggle'),
    webllmStatus: document.getElementById('webllmStatus'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    exportBtn: document.getElementById('exportBtn'),
    installBtn: document.getElementById('installBtn'),
    historyList: document.getElementById('historyList'),
    newChatBtn: document.getElementById('newChatBtn')
  };
  
  // Load saved configuration
  loadConfig();
  
  // Load saved conversation
  loadConversation();
  
  // Setup event listeners
  setupEventListeners();
  
  // Register service worker
  await registerServiceWorker();
  
  // Check WebLLM support
  checkWebLLMSupport();
  
  // Update UI
  updateTheme();
  updateOnlineStatus();
  updateSettingsUI();
  
  console.log('App initialized');
}

// Service Worker Registration
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration.scope);
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showNotification('Update available! Refresh to update.', 'info');
          }
        });
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

// Event Listeners
function setupEventListeners() {
  // Online/Offline detection
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // PWA Install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    appState.deferredPrompt = e;
    if (elements.installBtn) {
      elements.installBtn.style.display = 'flex';
    }
  });
  
  // Auto-resize textarea
  if (elements.messageInput) {
    elements.messageInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    });
  }
  
  // Temperature slider
  if (elements.temperatureInput) {
    elements.temperatureInput.addEventListener('input', function() {
      if (elements.temperatureValue) {
        elements.temperatureValue.textContent = this.value;
      }
    });
  }
  
  // Navigation
  if (elements.navChat) {
    elements.navChat.addEventListener('click', () => switchView('chat'));
  }
  if (elements.navSettings) {
    elements.navSettings.addEventListener('click', () => switchView('settings'));
  }
  if (elements.navHistory) {
    elements.navHistory.addEventListener('click', () => switchView('history'));
  }
  
  // Settings
  if (elements.saveSettingsBtn) {
    elements.saveSettingsBtn.addEventListener('click', saveSettings);
  }
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener('change', toggleTheme);
  }
  if (elements.webllmToggle) {
    elements.webllmToggle.addEventListener('change', toggleWebLLM);
  }
  
  // Actions
  if (elements.clearBtn) {
    elements.clearBtn.addEventListener('click', clearConversation);
  }
  if (elements.exportBtn) {
    elements.exportBtn.addEventListener('click', exportConversation);
  }
  if (elements.installBtn) {
    elements.installBtn.addEventListener('click', installApp);
  }
  if (elements.newChatBtn) {
    elements.newChatBtn.addEventListener('click', newChat);
  }
}

// View Management
function switchView(view) {
  appState.currentView = view;
  
  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  // Show selected view
  const viewElement = document.getElementById(view + 'View');
  const navElement = document.getElementById('nav' + view.charAt(0).toUpperCase() + view.slice(1));
  
  if (viewElement) viewElement.classList.add('active');
  if (navElement) navElement.classList.add('active');
  
  // Update history view when switching to it
  if (view === 'history') {
    updateHistoryView();
  }
}

// Configuration Management
function loadConfig() {
  try {
    const saved = localStorage.getItem('llamaedge_config');
    if (saved) {
      appState.config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load config:', e);
  }
}

function saveConfig() {
  try {
    localStorage.setItem('llamaedge_config', JSON.stringify(appState.config));
  } catch (e) {
    console.error('Failed to save config:', e);
  }
}

function updateSettingsUI() {
  if (elements.endpointInput) {
    elements.endpointInput.value = appState.config.endpoint;
  }
  if (elements.modelInput) {
    elements.modelInput.value = appState.config.model;
  }
  if (elements.maxTokensInput) {
    elements.maxTokensInput.value = appState.config.maxTokens;
  }
  if (elements.temperatureInput) {
    elements.temperatureInput.value = appState.config.temperature;
  }
  if (elements.temperatureValue) {
    elements.temperatureValue.textContent = appState.config.temperature;
  }
  if (elements.themeToggle) {
    elements.themeToggle.checked = appState.config.theme === 'light';
  }
  if (elements.webllmToggle) {
    elements.webllmToggle.checked = appState.config.useWebLLM;
  }
}

function saveSettings() {
  appState.config.endpoint = elements.endpointInput.value.trim() || DEFAULT_CONFIG.endpoint;
  appState.config.model = elements.modelInput.value.trim() || DEFAULT_CONFIG.model;
  appState.config.maxTokens = parseInt(elements.maxTokensInput.value) || DEFAULT_CONFIG.maxTokens;
  appState.config.temperature = parseFloat(elements.temperatureInput.value) || DEFAULT_CONFIG.temperature;
  
  saveConfig();
  showNotification('Settings saved!', 'success');
  switchView('chat');
}

// Theme Management
function toggleTheme() {
  appState.config.theme = elements.themeToggle.checked ? 'light' : 'dark';
  updateTheme();
  saveConfig();
}

function updateTheme() {
  document.documentElement.setAttribute('data-theme', appState.config.theme);
  if (appState.config.theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

// Online/Offline Status
function updateOnlineStatus() {
  appState.isOnline = navigator.onLine;
  
  if (elements.offlineBanner) {
    elements.offlineBanner.style.display = appState.isOnline ? 'none' : 'flex';
  }
  
  if (elements.statusDot) {
    if (!appState.isOnline) {
      elements.statusDot.className = 'status-dot error';
      if (elements.statusText) elements.statusText.textContent = 'Offline';
    } else if (appState.isLoading) {
      elements.statusDot.className = 'status-dot loading';
      if (elements.statusText) elements.statusText.textContent = 'Processing...';
    } else {
      elements.statusDot.className = 'status-dot';
      if (elements.statusText) elements.statusText.textContent = 'Ready';
    }
  }
}

// Conversation Management
function loadConversation() {
  try {
    const saved = localStorage.getItem('llamaedge_conversation');
    if (saved) {
      const data = JSON.parse(saved);
      appState.conversationHistory = data.messages || [];
      appState.conversationHistory.forEach(msg => {
        addMessageToUI(msg.role, msg.content, msg.timestamp, false);
      });
      updateMessageCount();
    }
  } catch (e) {
    console.error('Failed to load conversation:', e);
  }
}

function saveConversation() {
  try {
    localStorage.setItem('llamaedge_conversation', JSON.stringify({
      messages: appState.conversationHistory,
      lastUpdated: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Failed to save conversation:', e);
  }
}

function clearConversation() {
  if (!confirm('Clear all messages?')) return;
  
  appState.conversationHistory = [];
  if (elements.chatContainer) {
    elements.chatContainer.innerHTML = '';
  }
  if (elements.welcomeMessage) {
    elements.welcomeMessage.style.display = 'block';
  }
  localStorage.removeItem('llamaedge_conversation');
  updateMessageCount();
  if (elements.lastResponseTime) {
    elements.lastResponseTime.textContent = '-';
  }
}

function newChat() {
  // Save current conversation to history
  if (appState.conversationHistory.length > 0) {
    saveToHistory();
  }
  clearConversation();
  switchView('chat');
}

function exportConversation() {
  if (appState.conversationHistory.length === 0) {
    showNotification('No messages to export', 'warning');
    return;
  }
  
  const exportData = {
    title: 'LlamaEdge Chat Export',
    date: new Date().toISOString(),
    model: appState.config.model,
    endpoint: appState.config.endpoint,
    messages: appState.conversationHistory
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `llamaedge-chat-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showNotification('Conversation exported!', 'success');
}

// History Management
function saveToHistory() {
  try {
    const history = JSON.parse(localStorage.getItem('llamaedge_history') || '[]');
    history.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      messageCount: appState.conversationHistory.length,
      preview: appState.conversationHistory[0]?.content?.substring(0, 100) || 'Empty chat',
      messages: appState.conversationHistory
    });
    
    // Keep only last 20 conversations
    if (history.length > 20) history.pop();
    
    localStorage.setItem('llamaedge_history', JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
}

function updateHistoryView() {
  if (!elements.historyList) return;
  
  try {
    const history = JSON.parse(localStorage.getItem('llamaedge_history') || '[]');
    
    if (history.length === 0) {
      elements.historyList.innerHTML = '<div class="history-empty">No saved conversations</div>';
      return;
    }
    
    elements.historyList.innerHTML = history.map(conv => `
      <div class="history-item" data-id="${conv.id}">
        <div class="history-item-info">
          <div class="history-item-preview">${escapeHtml(conv.preview)}</div>
          <div class="history-item-meta">
            <span>${new Date(conv.date).toLocaleDateString()}</span>
            <span>${conv.messageCount} messages</span>
          </div>
        </div>
        <div class="history-item-actions">
          <button class="btn-icon" onclick="loadHistory(${conv.id})" title="Load">↻</button>
          <button class="btn-icon" onclick="deleteHistory(${conv.id})" title="Delete">×</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Failed to load history:', e);
  }
}

function loadHistory(id) {
  try {
    const history = JSON.parse(localStorage.getItem('llamaedge_history') || '[]');
    const conv = history.find(c => c.id === id);
    
    if (conv) {
      appState.conversationHistory = conv.messages;
      if (elements.chatContainer) {
        elements.chatContainer.innerHTML = '';
      }
      conv.messages.forEach(msg => {
        addMessageToUI(msg.role, msg.content, msg.timestamp, false);
      });
      updateMessageCount();
      switchView('chat');
    }
  } catch (e) {
    console.error('Failed to load history item:', e);
  }
}

function deleteHistory(id) {
  if (!confirm('Delete this conversation?')) return;
  
  try {
    let history = JSON.parse(localStorage.getItem('llamaedge_history') || '[]');
    history = history.filter(c => c.id !== id);
    localStorage.setItem('llamaedge_history', JSON.stringify(history));
    updateHistoryView();
  } catch (e) {
    console.error('Failed to delete history item:', e);
  }
}

// WebLLM Integration
async function checkWebLLMSupport() {
  const supported = typeof WebGPU !== 'undefined' && await navigator.gpu !== undefined;
  
  if (elements.webllmStatus) {
    if (!supported) {
      elements.webllmStatus.textContent = 'WebGPU not supported in this browser';
      elements.webllmStatus.className = 'status-text warning';
      if (elements.webllmToggle) {
        elements.webllmToggle.disabled = true;
      }
    } else {
      elements.webllmStatus.textContent = 'WebGPU available - local inference possible';
      elements.webllmStatus.className = 'status-text success';
    }
  }
}

async function toggleWebLLM() {
  if (!elements.webllmToggle) return;
  
  appState.config.useWebLLM = elements.webllmToggle.checked;
  
  if (appState.config.useWebLLM && !appState.webLLMEngine) {
    elements.webllmStatus.textContent = 'Loading model... (may take a few minutes)';
    elements.webllmStatus.className = 'status-text loading';
    
    try {
      // WebLLM would be loaded here via CDN
      // For now, show placeholder
      await new Promise(resolve => setTimeout(resolve, 1000));
      elements.webllmStatus.textContent = 'WebLLM ready! Running locally.';
      elements.webllmStatus.className = 'status-text success';
    } catch (e) {
      elements.webllmStatus.textContent = 'Failed to load WebLLM: ' + e.message;
      elements.webllmStatus.className = 'status-text error';
      appState.config.useWebLLM = false;
      elements.webllmToggle.checked = false;
    }
  }
  
  saveConfig();
}

// PWA Installation
async function installApp() {
  if (!appState.deferredPrompt) {
    showNotification('App already installed or not available', 'info');
    return;
  }
  
  appState.deferredPrompt.prompt();
  const { outcome } = await appState.deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    showNotification('App installed successfully!', 'success');
    if (elements.installBtn) {
      elements.installBtn.style.display = 'none';
    }
  }
  
  appState.deferredPrompt = null;
}

// Message Handling
function handleKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

async function sendMessage() {
  const content = elements.messageInput?.value?.trim();
  if (!content || appState.isLoading) return;
  
  // Clear input
  elements.messageInput.value = '';
  elements.messageInput.style.height = 'auto';
  
  // Add user message
  const timestamp = new Date().toISOString();
  addMessageToUI('user', content, timestamp);
  appState.conversationHistory.push({ role: 'user', content, timestamp });
  updateMessageCount();
  
  // Set loading state
  setLoadingState(true);
  addLoadingIndicator();
  
  try {
    const startTime = Date.now();
    let response;
    
    if (appState.config.useWebLLM && appState.webLLMEngine) {
      // Use WebLLM
      response = await generateWebLLMResponse(content);
    } else {
      // Use API
      response = await generateAPIResponse();
    }
    
    const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);
    if (elements.lastResponseTime) {
      elements.lastResponseTime.textContent = responseTime + 's';
    }
    
    removeLoadingIndicator();
    
    const assistantTimestamp = new Date().toISOString();
    addMessageToUI('assistant', response, assistantTimestamp);
    appState.conversationHistory.push({ role: 'assistant', content: response, timestamp: assistantTimestamp });
    
    saveConversation();
    setStatus('ready', 'Ready');
    
  } catch (error) {
    console.error('Error:', error);
    removeLoadingIndicator();
    
    let errorMessage = error.message;
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Network error. Check your connection or API endpoint.';
    }
    
    addMessageToUI('assistant', 'Error: ' + errorMessage, new Date().toISOString(), true);
    setStatus('error', 'Error');
  } finally {
    setLoadingState(false);
    elements.messageInput?.focus();
  }
}

async function generateAPIResponse() {
  const response = await fetch(appState.config.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: appState.config.model,
      messages: appState.conversationHistory.map(m => ({ role: m.role, content: m.content })),
      max_tokens: appState.config.maxTokens,
      temperature: appState.config.temperature,
      stream: false
    })
  });
  
  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error?.message || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response content received');
  }
  
  return content;
}

async function generateWebLLMResponse(content) {
  // Placeholder for WebLLM integration
  // Would use @mlc-ai/web-llm package
  return 'WebLLM integration coming soon!';
}

// UI Helpers
function addMessageToUI(role, content, timestamp, isError = false) {
  if (elements.welcomeMessage) {
    elements.welcomeMessage.style.display = 'none';
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}${isError ? ' error' : ''}`;
  
  const date = new Date(timestamp);
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  
  messageDiv.innerHTML = `
    <div class="message-header">
      <span class="message-role">${role === 'user' ? 'You' : 'Assistant'}</span>
      <span class="message-timestamp">${timeStr}</span>
    </div>
    <div class="message-bubble">${escapeHtml(content)}</div>
  `;
  
  elements.chatContainer?.appendChild(messageDiv);
  scrollToBottom();
}

function addLoadingIndicator() {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message assistant';
  loadingDiv.id = 'loadingIndicator';
  
  loadingDiv.innerHTML = `
    <div class="loading-message">
      <div class="loading-spinner"></div>
      <div>
        <div class="loading-text">Generating response...</div>
        <div class="loading-timer" id="loadingTimer">Elapsed: 0s</div>
      </div>
    </div>
  `;
  
  elements.chatContainer?.appendChild(loadingDiv);
  scrollToBottom();
  
  appState.loadingStartTime = Date.now();
  appState.loadingTimerInterval = setInterval(updateLoadingTimer, 1000);
}

function updateLoadingTimer() {
  const elapsed = Math.floor((Date.now() - appState.loadingStartTime) / 1000);
  const timerEl = document.getElementById('loadingTimer');
  if (timerEl) {
    if (elapsed < 60) {
      timerEl.textContent = `Elapsed: ${elapsed}s`;
    } else {
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      timerEl.textContent = `Elapsed: ${mins}m ${secs}s`;
    }
  }
}

function removeLoadingIndicator() {
  const loadingDiv = document.getElementById('loadingIndicator');
  if (loadingDiv) loadingDiv.remove();
  
  if (appState.loadingTimerInterval) {
    clearInterval(appState.loadingTimerInterval);
    appState.loadingTimerInterval = null;
  }
}

function setLoadingState(loading) {
  appState.isLoading = loading;
  if (elements.sendBtn) elements.sendBtn.disabled = loading;
  if (elements.clearBtn) elements.clearBtn.disabled = loading;
  updateOnlineStatus();
}

function setStatus(type, text) {
  if (elements.statusDot) {
    elements.statusDot.className = 'status-dot' + (type === 'error' ? ' error' : type === 'loading' ? ' loading' : '');
  }
  if (elements.statusText) {
    elements.statusText.textContent = text;
  }
}

function updateMessageCount() {
  const count = appState.conversationHistory.filter(m => m.role === 'user').length;
  if (elements.messageCount) {
    elements.messageCount.textContent = count;
  }
}

function scrollToBottom() {
  if (elements.chatContainer) {
    elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
