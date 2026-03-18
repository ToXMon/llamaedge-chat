/**
 * WebLLM Integration Module for LlamaEdge Chat
 * Enables local browser-based inference using WebGPU
 * 
 * Requirements:
 * - Chrome 113+ (Android/Desktop) or Edge 113+
 * - WebGPU support (not available on Safari/Firefox yet)
 * - ~800MB VRAM for Qwen2-0.5B model
 * 
 * Usage:
 *   const webllm = new WebLLMIntegration();
 *   await webllm.initialize();
 *   const response = await webllm.generate(messages);
 */

class WebLLMIntegration {
    constructor() {
        this.engine = null;
        this.isLoading = false;
        this.isReady = false;
        this.loadProgress = 0;
        this.modelId = 'Qwen2-0.5B-Instruct-q4f32_1-MLC';
        this.onProgress = null;
        this.onStatus = null;
    }

    /**
     * Check if WebGPU is available in this browser
     */
    async checkSupport() {
        // Check for WebGPU
        if (!navigator.gpu) {
            return {
                supported: false,
                reason: 'WebGPU not available. Use Chrome 113+ or Edge 113+.'
            };
        }

        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                return {
                    supported: false,
                    reason: 'No WebGPU adapter found. Ensure GPU is available.'
                };
            }

            const device = await adapter.requestDevice();
            if (!device) {
                return {
                    supported: false,
                    reason: 'Could not get WebGPU device.'
                };
            }

            return {
                supported: true,
                reason: 'WebGPU available!'
            };
        } catch (e) {
            return {
                supported: false,
                reason: `WebGPU error: ${e.message}`
            };
        }
    }

    /**
     * Initialize WebLLM engine
     * This loads the model into GPU memory (~800MB for Qwen2-0.5B)
     */
    async initialize(modelId = null) {
        if (this.isReady) return true;
        if (this.isLoading) return false;

        const support = await this.checkSupport();
        if (!support.supported) {
            throw new Error(support.reason);
        }

        this.isLoading = true;
        this.modelId = modelId || this.modelId;
        
        this.updateStatus('Loading WebLLM library...');
        
        try {
            // Load WebLLM library from CDN
            if (typeof webllm === 'undefined') {
                await this.loadScript('https://cdn.jsdelivr.net/npm/@anthropic-ai/webllm@0.2.0/dist/webllm.bundle.js');
            }
            
            this.updateStatus('Initializing model (this may take a few minutes)...');
            
            // Create WebLLM engine
            const { CreateMLCEngine } = webllm;
            
            this.engine = await CreateMLCEngine(this.modelId, {
                initProgressCallback: (progress) => {
                    this.loadProgress = Math.round(progress.progress * 100);
                    this.updateProgress(this.loadProgress, progress.text);
                }
            });
            
            this.isReady = true;
            this.isLoading = false;
            this.updateStatus('WebLLM ready!');
            
            return true;
            
        } catch (e) {
            this.isLoading = false;
            this.updateStatus(`Error: ${e.message}`);
            throw e;
        }
    }

    /**
     * Generate response using local model
     */
    async generate(messages, options = {}) {
        if (!this.isReady) {
            throw new Error('WebLLM not initialized. Call initialize() first.');
        }

        const defaultOptions = {
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.9,
            stream: false
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await this.engine.chat.completions.create({
                messages: messages,
                ...config
            });

            return response.choices[0].message.content;
        } catch (e) {
            throw new Error(`WebLLM generation error: ${e.message}`);
        }
    }

    /**
     * Stream response using local model
     */
    async *generateStream(messages, options = {}) {
        if (!this.isReady) {
            throw new Error('WebLLM not initialized. Call initialize() first.');
        }

        const defaultOptions = {
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.9,
            stream: true
        };

        const config = { ...defaultOptions, ...options };

        try {
            const stream = await this.engine.chat.completions.create({
                messages: messages,
                ...config
            });

            for await (const chunk of stream) {
                if (chunk.choices[0]?.delta?.content) {
                    yield chunk.choices[0].delta.content;
                }
            }
        } catch (e) {
            throw new Error(`WebLLM stream error: ${e.message}`);
        }
    }

    /**
     * Reset chat context
     */
    async reset() {
        if (this.engine) {
            await this.engine.resetChat();
        }
    }

    /**
     * Unload model and free GPU memory
     */
    async unload() {
        if (this.engine) {
            await this.engine.unload();
            this.engine = null;
            this.isReady = false;
        }
    }

    /**
     * Get available models
     */
    getAvailableModels() {
        return [
            {
                id: 'Qwen2-0.5B-Instruct-q4f32_1-MLC',
                name: 'Qwen2 0.5B (Recommended)',
                vram: '~800MB',
                description: 'Fast and efficient for mobile devices'
            },
            {
                id: 'Qwen2-1.5B-Instruct-q4f32_1-MLC',
                name: 'Qwen2 1.5B',
                vram: '~1.5GB',
                description: 'Better quality, needs more memory'
            },
            {
                id: 'Phi-3-mini-4k-instruct-q4f32_1-MLC',
                name: 'Phi-3 Mini (4K)',
                vram: '~2GB',
                description: 'Microsoft model, good quality'
            }
        ];
    }

    // Helper methods
    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }

    updateStatus(status) {
        if (this.onStatus) {
            this.onStatus(status);
        }
        console.log('[WebLLM]', status);
    }

    updateProgress(percent, text) {
        if (this.onProgress) {
            this.onProgress(percent, text);
        }
        console.log(`[WebLLM] ${percent}% - ${text}`);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebLLMIntegration;
}

// Make globally available
window.WebLLMIntegration = WebLLMIntegration;
