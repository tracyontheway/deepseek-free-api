/**
 * DeepSeek Free API Web Application
 * 现代化的前端交互脚本
 */

// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('navMenu');
const navToggle = document.getElementById('navToggle');
const themeToggle = document.getElementById('themeToggle');
const particles = document.getElementById('particles');

// ===== Theme Management =====
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        themeToggle.addEventListener('click', () => this.toggle());
    },
    
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
};

// ===== Navigation =====
const Navigation = {
    init() {
        // Mobile menu toggle
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Close menu on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
        
        // Scroll effects
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.8)';
                navbar.style.boxShadow = 'none';
            }
        });
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
};

// ===== Particles Animation =====
const Particles = {
    init() {
        const count = 50;
        for (let i = 0; i < count; i++) {
            this.createParticle();
        }
    },
    
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random size
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random animation delay and duration
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 20 + 10) + 's';
        
        particles.appendChild(particle);
    }
};

// ===== Chat Demo =====
const ChatDemo = {
    messages: [],
    isStreaming: false,
    
    init() {
        this.container = document.getElementById('chatMessages');
        this.input = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('chatSend');
        this.endpoint = document.getElementById('apiEndpoint');
        this.token = document.getElementById('apiToken');
        this.model = document.getElementById('modelSelect');
        this.stream = document.getElementById('streamToggle');
        
        // Auto-resize textarea
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = this.input.scrollHeight + 'px';
        });
        
        // Send on Enter (Shift+Enter for new line)
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Send button
        this.sendBtn.addEventListener('click', () => this.sendMessage());
    },
    
    async sendMessage() {
        const content = this.input.value.trim();
        if (!content || this.isStreaming) return;
        
        // Validate configuration
        if (!this.endpoint.value) {
            alert('请输入 API 地址');
            return;
        }
        if (!this.token.value) {
            alert('请输入 Token');
            return;
        }
        
        // Add user message
        this.addMessage('user', content);
        this.input.value = '';
        this.input.style.height = 'auto';
        
        // Create assistant message placeholder
        const assistantMessage = this.addMessage('assistant', '', true);
        
        this.isStreaming = true;
        this.sendBtn.disabled = true;
        
        try {
            if (this.stream.checked) {
                await this.streamRequest(content, assistantMessage);
            } else {
                await this.normalRequest(content, assistantMessage);
            }
        } catch (error) {
            this.updateMessage(assistantMessage, `错误: ${error.message}`);
        } finally {
            this.isStreaming = false;
            this.sendBtn.disabled = false;
        }
    },
    
    async normalRequest(content, messageEl) {
        const response = await fetch(`${this.endpoint.value}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token.value}`
            },
            body: JSON.stringify({
                model: this.model.value,
                messages: [...this.messages, { role: 'user', content }],
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const reply = data.choices[0]?.message?.content || '无响应';
        
        this.messages.push({ role: 'user', content });
        this.messages.push({ role: 'assistant', content: reply });
        
        this.updateMessage(messageEl, reply);
    },
    
    async streamRequest(content, messageEl) {
        const response = await fetch(`${this.endpoint.value}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token.value}`
            },
            body: JSON.stringify({
                model: this.model.value,
                messages: [...this.messages, { role: 'user', content }],
                stream: true
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let reply = '';
        
        this.messages.push({ role: 'user', content });
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const json = JSON.parse(line.slice(6));
                        const delta = json.choices[0]?.delta?.content || '';
                        reply += delta;
                        this.updateMessage(messageEl, reply);
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }
        }
        
        this.messages.push({ role: 'assistant', content: reply });
    },
    
    addMessage(role, content, isEmpty = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = role === 'user' 
            ? '<svg viewBox="0 0 24 24" fill="none"><path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/></svg>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = isEmpty ? '<span class="typing">正在思考...</span>' : `<p>${this.escapeHtml(content)}</p>`;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.container.appendChild(messageDiv);
        this.container.scrollTop = this.container.scrollHeight;
        
        return contentDiv;
    },
    
    updateMessage(contentEl, content) {
        contentEl.innerHTML = `<p>${this.escapeHtml(content)}</p>`;
        this.container.scrollTop = this.container.scrollHeight;
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }
};

// ===== Documentation Tabs =====
const DocsTabs = {
    init() {
        const tabs = document.querySelectorAll('.docs-tab');
        const panels = document.querySelectorAll('.docs-panel');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked
                tab.classList.add('active');
                const panel = document.getElementById(`${tab.dataset.tab}-panel`);
                if (panel) panel.classList.add('active');
            });
        });
    }
};

// ===== Copy Buttons =====
const CopyButtons = {
    init() {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const targetId = btn.dataset.copy;
                const target = document.getElementById(targetId);
                
                if (target) {
                    const text = target.textContent;
                    
                    try {
                        await navigator.clipboard.writeText(text);
                        
                        const originalText = btn.querySelector('span').textContent;
                        btn.querySelector('span').textContent = '已复制!';
                        
                        setTimeout(() => {
                            btn.querySelector('span').textContent = originalText;
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy:', err);
                    }
                }
            });
        });
    }
};

// ===== Intersection Observer for Animations =====
const ScrollAnimations = {
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        document.querySelectorAll('.feature-card, .deploy-card, .models-table-container').forEach(el => {
            observer.observe(el);
        });
    }
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    Navigation.init();
    Particles.init();
    ChatDemo.init();
    DocsTabs.init();
    CopyButtons.init();
    ScrollAnimations.init();
    
    console.log('🚀 DeepSeek Free API Web App Initialized');
});
