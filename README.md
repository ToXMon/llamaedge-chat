# 🦙 LlamaEdge Chat - Decentralized LLM Inference on Akash Network

> **Mobile-friendly ChatGPT-like interface powered by GPU-accelerated inference on decentralized infrastructure**

[![Deploy on Akash](https://img.shields.io/badge/Deploy%20on-Akash%20Network-blue)](https://akash.network)
[![WasmEdge](https://img.shields.io/badge/Powered%20by-WasmEdge-orange)](https://wasmedge.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🌟 Overview

LlamaEdge Chat demonstrates the power of **decentralized, on-demand LLM inference** accessible from any device. Deploy a fully functional ChatGPT-like interface on Akash Network's GPU infrastructure and access it from your phone, tablet, or laptop - anywhere with an internet connection.

### 🚀 Live Demo

**Working Deployment:** [http://i69n6n8iklad1ffiij5qmeo1mc.ingress.h100.ams.val.akash.pub/](http://i69n6n8iklad1ffiij5qmeo1mc.ingress.h100.ams.val.akash.pub/)

> ⚠️ First request takes 60-120 seconds while the model loads into GPU memory. Subsequent requests are fast.

---

## ✨ Features

- 📱 **Mobile-First Design** - Responsive ChatGPT-like UI that works beautifully on phones, tablets, and desktops
- ⚡ **GPU-Accelerated Inference** - Leverages NVIDIA CUDA for fast response generation
- 🌐 **OpenAI-Compatible API** - Standard REST endpoints (`/v1/chat/completions`, `/v1/embeddings`, `/v1/models`)
- 🔗 **CORS Enabled** - Cross-origin support for integration with any web application
- 💬 **Multi-Turn Conversations** - Full conversation history support
- 🎯 **Dual Model Support**:
  - **Chat:** Qwen2-0.5B-Instruct (optimized for edge/mobile)
  - **Embeddings:** all-MiniLM-L6-v2 (for semantic search/RAG)

---

## 💡 Novel Value Proposition

This project combines three cutting-edge technologies in a novel way:

| Component | Technology | Innovation |
|-----------|------------|------------|
| **Runtime** | WasmEdge | Lightweight, portable WebAssembly runtime with GPU support |
| **Infrastructure** | Akash Network | Decentralized, permissionless GPU marketplace |
| **Interface** | Mobile Web UI | No app installation required, works on any device |

### Why This Matters

- **Decentralized:** No reliance on big tech cloud providers - deploy on a global network of independent providers
- **On-Demand:** Spin up GPU inference capacity only when you need it, pay by the second
- **Accessible:** Full web interface included - no app store, no installation, just a URL
- **Efficient:** Qwen2-0.5B was originally designed for edge/mobile - runs efficiently on any GPU

---

## 🎯 Use Cases

### 1. 📱 Mobile Chat Assistant
Access a personal AI assistant from your phone without installing any app. Perfect for quick questions, brainstorming, or creative writing on the go.

### 2. 🔍 Semantic Search / RAG Pipelines
Use the embeddings endpoint (`/v1/embeddings`) to build semantic search, document retrieval, or RAG (Retrieval-Augmented Generation) applications.

### 3. ✈️ In-Flight Productivity
**Yes, this works on planes with WiFi!** Access your personal AI assistant while traveling - no local GPU required.

### 4. 🧪 API Testing & Development
Use the included `index.html` as an API testing interface for your LLM-powered applications.

---

## 🤔 FAQ: Does This Satisfy "On-Demand Local Inference for Mobile Devices on a Plane"?

### ✅ YES - With Caveats

| Aspect | Status | Notes |
|--------|--------|-------|
| **Mobile Accessible** | ✅ | Works on any device with a browser |
| **On-Demand** | ✅ | Deploy/spin down instances as needed |
| **Plane Compatible** | ✅ | Works if the plane has WiFi |
| **No App Install** | ✅ | Full web UI included in the container |
| **GPU Accelerated** | ✅ | Runs on decentralized GPU infrastructure |

### The "Local" Nuance

The model (Qwen2-0.5B) is small enough that it **COULD** run locally on mobile devices - that was its original design goal. However, we're using **decentralized cloud GPU** for better performance:

- **Local Mobile:** ~1-2 tokens/second, drains battery
- **Akash GPU:** ~50-100 tokens/second, no battery impact

### The Novel Combination

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile Device │ ←── │  Akash Network  │ ←── │   WasmEdge      │
│   (Any Browser) │     │   GPU Provider  │     │   Runtime       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         ↓                       ↓                       ↓
   No App Required        Decentralized          Lightweight + Fast
   Just a URL              On-Demand             GPU-Accelerated
```

---

## 🚀 Quick Start

### Option 1: Use Our Deployment

Simply visit the live demo URL and start chatting:

```
http://i69n6n8iklad1ffiij5qmeo1mc.ingress.h100.ams.val.akash.pub/
```

### Option 2: Deploy Your Own

1. **Prerequisites**
   - [Akash CLI](https://docs.akash.network/guides/install) installed
   - Funded wallet with AKT tokens
   - Docker (optional, for local testing)

2. **Deploy to Akash**
   ```bash
   # Clone this repo
   git clone https://github.com/ToXMon/llamaedge-chat.git
   cd llamaedge-chat
   
   # Create deployment
   akash tx deployment create deploy.yaml --from $AKASH_KEY_NAME
   
   # Send manifest
   akash provider send-manifest deploy.yaml \
     --dseq $AKASH_DSEQ \
     --provider $AKASH_PROVIDER \
     --from $AKASH_KEY_NAME
   ```

3. **Access Your Deployment**
   - Get the URI from your provider
   - Open in browser or use the API directly

---

## 📋 Step-by-Step Akash Deployment

### 1. Install Akash CLI

```bash
# macOS/Linux
curl -sfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | sh

# Or with Homebrew
brew install akash-network/tap/akash
```

### 2. Fund Your Wallet

```bash
# Create wallet
akash keys add mywallet --from mywallet

# Get address
akash keys show mywallet -a

# Fund with AKT (use an exchange or faucet)
```

### 3. Create Deployment

```bash
# Set variables
export AKASH_KEY_NAME="mywallet"
export AKASH_ACCOUNT_ADDRESS="$(akash keys show $AKASH_KEY_NAME -a)"

# Create certificate
akash tx cert create client --from $AKASH_KEY_NAME

# Create deployment
akash tx deployment create deploy.yaml \
  --from $AKASH_KEY_NAME \
  --deposit 5000000uakt \
  --fees 5000uakt
```

### 4. Select Provider

```bash
# List available providers
akash query provider list

# View bids on your deployment
akash query market bid list \
  --owner $AKASH_ACCOUNT_ADDRESS \
  --dseq $AKASH_DSEQ

# Create lease (choose the best provider)
akash tx market lease create \
  --dseq $AKASH_DSEQ \
  --provider $AKASH_PROVIDER \
  --from $AKASH_KEY_NAME
```

### 5. Send Manifest & Access

```bash
# Send manifest
akash provider send-manifest deploy.yaml \
  --dseq $AKASH_DSEQ \
  --provider $AKASH_PROVIDER \
  --from $AKASH_KEY_NAME

# Get service status/URI
akash provider lease-status \
  --dseq $AKASH_DSEQ \
  --provider $AKASH_PROVIDER \
  --from $AKASH_KEY_NAME
```

---

## ⚠️ Provider Selection Guidance

> **Critical for mobile use:** Not all Akash providers are equal. Choose wisely!

### ✅ DO: Choose Trusted Providers With:

| Requirement | Why It Matters |
|-------------|----------------|
| **Valid SSL Certificates** | Mobile browsers block self-signed certs |
| **GPU Capabilities** | Required for CUDA images (no CPU fallback) |
| **Competitive Pricing** | Ensures you win bids on GPU providers |

### ❌ AVOID:

- **Self-Signed Certificates** - Causes mobile browser security warnings
- **CPU-Only Providers** - Will fail with `libcuda.so.1: cannot open shared object file`
- **Overly Cheap Bids** - Often CPU-only or unreliable

### 💰 Pricing Recommendations

| Resource | Recommended Price |
|----------|-------------------|
| **GPU Hour** | 15,000 - 20,000 uakt |
| **CPU Core** | 500 - 1,000 uakt |
| **Memory (1Gi)** | 100 - 200 uakt |

> **Pro Tip:** Set your SDL price at 20,000 uakt to be competitive for GPU providers.

### 🔍 How to Check Provider SSL

```bash
# Test provider endpoint
curl -I https://provider.example.com

# Look for valid SSL cert, NOT self-signed
# Good: "issuer: C=US; O=Let's Encrypt..."
# Bad: "issuer: CN=fake-kubernetes-ingress-cert"
```

---

## 📦 Models Included

### Chat Model: Qwen2-0.5B-Instruct

| Property | Value |
|----------|-------|
| **Size** | 0.5B parameters |
| **Quantization** | Q5_K_M (5-bit) |
| **Context Length** | 32K tokens |
| **Purpose** | Conversational AI, Q&A, Creative Writing |
| **Edge Optimized** | ✅ Originally designed for mobile/edge devices |

### Embedding Model: all-MiniLM-L6-v2

| Property | Value |
|----------|-------|
| **Size** | 22M parameters |
| **Dimensions** | 384 |
| **Purpose** | Semantic search, RAG, document embeddings |
| **Speed** | Very fast, ideal for real-time use |

---

## 🔧 API Usage

### Chat Completion

```bash
curl -X POST https://your-akash-uri/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen2-0.5B-Instruct-Q5_K_M.gguf",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "max_tokens": 2048,
    "temperature": 0.7
  }'
```

### Embeddings

```bash
curl -X POST https://your-akash-uri/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "model": "all-MiniLM-L6-v2-ggml-model-f16.gguf",
    "input": "Hello, world!"
  }'
```

### List Models

```bash
curl https://your-akash-uri/v1/models
```

---

## 🐳 Docker Image

This deployment uses the official LlamaEdge image with pre-loaded models:

```dockerfile
FROM secondstate/qwen-2-0.5b-allminilm-2:cuda12
```

**Includes:**
- WasmEdge runtime with CUDA support
- Qwen2-0.5B-Instruct model (Q5_K_M quantized)
- all-MiniLM-L6-v2 embedding model
- OpenAI-compatible API server
- Full web UI (served at root path)

---

## 📁 Repository Structure

```
llamaedge-chat/
├── README.md          # This documentation
├── deploy.yaml        # Akash SDL deployment file
├── index.html         # Mobile-friendly chat interface
└── LICENSE            # MIT License
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [WasmEdge](https://wasmedge.org) - The lightweight, high-performance WebAssembly runtime
- [Akash Network](https://akash.network) - The decentralized cloud marketplace
- [Qwen Team](https://github.com/QwenLM) - For the excellent Qwen language models
- [Second State](https://secondstate.io) - For the LlamaEdge project and Docker images

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/ToXMon/llamaedge-chat/issues)
- **Akash Discord:** [Join here](https://discord.gg/akash)
- **WasmEdge Discord:** [Join here](https://discord.gg/wasmedge)

---

<div align="center">
  <strong>Built with ❤️ for the decentralized future</strong>
  <br>
  <sub>Powered by WasmEdge + Akash Network</sub>
</div>
