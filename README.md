# 🦙 LlamaEdge Chat PWA

A production-ready **Progressive Web App** for AI chat, powered by **WasmEdge** and **Akash Network**. Chat with the Qwen2-0.5B model running on decentralized cloud infrastructure.

![LlamaEdge Chat PWA](icons/icon-512.png)

## ✨ Features

### Progressive Web App
- 📱 **Installable** - Add to home screen on iOS/Android/Desktop
- 🚀 **Offline Support** - App shell cached for offline access
- 🎨 **Standalone Mode** - Full-screen app without browser UI
- 🔄 **Auto-Update** - Service worker handles seamless updates

### User Interface
- 🌓 **Dark/Light Theme** - Toggle between themes
- 📋 **Chat History** - Persistent conversation storage
- 💾 **Export Conversations** - Download as JSON
- 📊 **Response Statistics** - Track message count and timing
- 🔔 **Offline Indicator** - Visual network status

### Configurable
- ⚙️ **Custom API Endpoint** - Point to your own Akash deployment
- 🎛️ **Model Parameters** - Adjust temperature, max tokens
- 🤖 **WebLLM Support** - Optional local inference (WebGPU)

### Mobile-First Design
- 📱 Bottom navigation bar
- 👆 Touch-optimized interface
- 📐 Responsive layout
- ⌨️ Mobile keyboard handling

## 🚀 Quick Start

### Option 1: GitHub Pages (Demo)

Visit the live demo: [https://toxmon.github.io/llamaedge-chat/](https://toxmon.github.io/llamaedge-chat/)

### Option 2: Self-Host on Akash

Deploy your own instance on Akash Network:

```bash
# Create deployment
akash tx deployment create deploy-pwa.yaml --from <your-key>

# Create lease
akash create lease --dseq <dseq> --from <your-key>

# Send manifest
akash send-manifest deploy-pwa.yaml --dseq <dseq> --provider <provider> --from <your-key>
```

### Option 3: Local Development

```bash
# Clone the repository
git clone https://github.com/ToXMon/llamaedge-chat.git
cd llamaedge-chat

# Serve locally (any static server works)
python -m http.server 8000
# or
npx serve .

# Open http://localhost:8000
```

## 📲 Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "LLM Chat" and tap "Add"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home screen" or "Install app"
4. Confirm installation

### Desktop (Chrome/Edge)
1. Visit the app URL
2. Look for install icon in address bar
3. Click "Install" when prompted
4. Or use menu → "Install LlamaEdge Chat"

## ⚙️ Configuration

### API Endpoint

Default endpoint points to the Akash deployment:
```
https://2h3kect6s5f0be89fq2l4iovk8.ingress.akash.profszone.xyz/v1/chat/completions
```

To use your own deployment:
1. Open Settings (gear icon)
2. Enter your endpoint URL
3. Adjust model name if needed
4. Click "Save Settings"

### Model Parameters

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| Max Tokens | 2048 | 100-8192 | Maximum response length |
| Temperature | 0.7 | 0.0-2.0 | Creativity level |

## 🤖 WebLLM (Local Inference)

The PWA supports optional **browser-based inference** using WebGPU:

### Requirements
- Chrome 113+ or Edge 113+ (Desktop/Android)
- WebGPU support (not available on Safari/Firefox yet)
- ~800MB VRAM for Qwen2-0.5B model

### Enabling WebLLM
1. Open Settings
2. Toggle "Enable WebLLM"
3. Wait for model download (~800MB)
4. Once loaded, all inference runs locally!

### Benefits
- ✈️ **True Offline** - Works without internet after model loads
- 🔒 **Privacy** - All processing on your device
- 💨 **No Latency** - No network round-trips

### Supported Models
| Model | VRAM | Description |
|-------|------|-------------|
| Qwen2-0.5B | ~800MB | Fast, mobile-friendly |
| Qwen2-1.5B | ~1.5GB | Better quality |
| Phi-3 Mini | ~2GB | Microsoft model |

## 🏗️ Architecture

```
llamaedge-chat/
├── index.html          # Main SPA entry
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── css/
│   └── app.css        # Styles with themes
├── js/
│   ├── app.js         # Main application
│   └── webllm.js      # WebLLM integration
├── icons/
│   ├── icon.svg       # Vector icon
│   └── icon-*.png     # PNG icons (72-512px)
├── deploy.yaml        # API server SDL
├── deploy-pwa.yaml    # PWA hosting SDL
└── nginx.conf         # Nginx configuration
```

## 🚢 Deployment

### GitHub Pages

The app automatically deploys to GitHub Pages from the `main` branch.

1. Push changes to `main`
2. GitHub Actions builds and deploys
3. Live at `https://toxmon.github.io/llamaedge-chat/`

### Akash Network

For decentralized hosting:

```yaml
# deploy-pwa.yaml - Akash SDL for PWA hosting
services:
  web:
    image: nginx:alpine
    expose:
      - port: 80
        as: 80
        to:
          - global: true
```

### API Server

Deploy the LlamaEdge API server:

```yaml
# deploy.yaml - Akash SDL for LlamaEdge API
services:
  api:
    image: secondstate/qwen-2-0.5b-allminilm-2:cuda12
    expose:
      - port: 8080
        as: 8080
        to:
          - global: true
```

## 🔧 Development

### Local Setup

```bash
# Clone repo
git clone https://github.com/ToXMon/llamaedge-chat.git
cd llamaedge-chat

# Serve locally
python -m http.server 8000

# Open http://localhost:8000
```

### Testing PWA Features

1. Chrome DevTools → Application tab
2. Check "Bypass for network" for testing
3. Use "Update" button to reload service worker
4. Test offline mode in Network tab

### Building Icons

Icons are pre-generated. To regenerate:

```bash
# Using Python
pip install cairosvg pillow
python -c "
import cairosvg
sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for s in sizes:
    cairosvg.svg2png(url='icons/icon.svg', 
                     write_to=f'icons/icon-{s}.png',
                     output_width=s, output_height=s)
"
```

## 📝 API Usage

### Chat Completion

```bash
curl -X POST https://your-endpoint/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen2-0.5B-Instruct-Q5_K_M.gguf",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 2048,
    "temperature": 0.7
  }'
```

### List Models

```bash
curl https://your-endpoint/v1/models
```

## ⚠️ Known Issues

1. **First Request Slow** - Initial API call takes 60-120s while model loads to GPU
2. **SSL Certificate** - Akash providers may use self-signed certificates
3. **WebGPU Support** - Not available in Safari/Firefox yet
4. **iOS PWA Storage** - localStorage may be cleared by iOS when low on storage

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🙏 Credits

- **WasmEdge** - WebAssembly runtime for AI
- **Akash Network** - Decentralized cloud infrastructure
- **Qwen Team** - Qwen2 language model
- **WebLLM** - In-browser LLM inference

---

**Built with ❤️ for the decentralized AI community**
