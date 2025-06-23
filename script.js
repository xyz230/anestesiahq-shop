// AnestesiaNetwork Store - Main JavaScript File

// Configuration
const CONFIG = {
    mcIP: "anestesia.mcpe.nl",
    discordServerID: "1013367051097739374",
    updateIntervals: {
        minecraft: 30000, // 30 seconds
        discord: 60000    // 60 seconds
    },
    communityGoal: {
        target: 50.00,
        current: 0.00
    }
};

// State management
const state = {
    currentCategory: 'home',
    cart: [],
    userBalance: 0.00,
    isLoggedIn: false,
    serverStatus: {
        minecraft: { online: false, players: 0 },
        discord: { online: false, members: 0 }
    }
};

// DOM Elements Cache
const elements = {
    mcPlayers: null,
    mcDot: null,
    discordMembers: null,
    discordDot: null,
    progressFill: null,
    progressPercentage: null,
    progressAmount: null,
    sidebarItems: null,
    giftCodeInput: null,
    verifyButton: null
};

// Initialize DOM elements
function initializeElements() {
    elements.mcPlayers = document.getElementById('mc-players');
    elements.mcDot = document.getElementById('mc-dot');
    elements.discordMembers = document.getElementById('discord-members');
    elements.discordDot = document.getElementById('discord-dot');
    elements.progressFill = document.querySelector('.progress-fill');
    elements.progressPercentage = document.querySelector('.progress-percentage');
    elements.progressAmount = document.querySelector('.progress-content small');
    elements.sidebarItems = document.querySelectorAll('.sidebar-item');
    elements.giftCodeInput = document.querySelector('.gift-code-input');
    elements.verifyButton = document.querySelector('.gift-section .btn');
}

// Server Status Functions
async function updateMinecraftStatus() {
    try {
        const response = await fetch(`https://api.mcsrvstat.us/2/${CONFIG.mcIP}`);
        const data = await response.json();
        
        if (data.online) {
            state.serverStatus.minecraft = { online: true, players: data.players.online };
            elements.mcPlayers.textContent = `${data.players.online} Giocator${data.players.online === 1 ? 'e' : 'i'} Online`;
            elements.mcDot.style.backgroundColor = "#00c853";
        } else {
            state.serverStatus.minecraft = { online: false, players: 0 };
            elements.mcPlayers.textContent = "Server Offline";
            elements.mcDot.style.backgroundColor = "#d50000";
        }
    } catch (error) {
        console.error('Error fetching Minecraft status:', error);
        elements.mcPlayers.textContent = "Errore di connessione";
        elements.mcDot.style.backgroundColor = "#ff9800";
    }
}

async function updateDiscordStatus() {
    try {
        const response = await fetch(`https://discord.com/api/guilds/${CONFIG.discordServerID}/widget.json`);
        const data = await response.json();
        
        state.serverStatus.discord = { online: true, members: data.presence_count };
        elements.discordMembers.textContent = `${data.presence_count} Membri Online`;
        elements.discordDot.style.backgroundColor = "#00c853";
    } catch (error) {
        console.error('Error fetching Discord status:', error);
        state.serverStatus.discord = { online: false, members: 0 };
        elements.discordMembers.textContent = "Offline o widget disattivato";
        elements.discordDot.style.backgroundColor = "#d50000";
    }
}

// Progress bar animation
function updateProgressBar() {
    const percentage = (CONFIG.communityGoal.current / CONFIG.communityGoal.target) * 100;
    elements.progressFill.style.width = `${Math.min(percentage, 100)}%`;
    elements.progressPercentage.textContent = `${percentage.toFixed(2)}%`;
    elements.progressAmount.textContent = `${CONFIG.communityGoal.current.toFixed(2)} / ${CONFIG.communityGoal.target.toFixed(2)} EUR`;
}

// Sidebar navigation
function initializeSidebar() {
    elements.sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            elements.sidebarItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get category from text content
            const category = this.querySelector('.sidebar-text').textContent.toLowerCase();
            state.currentCategory = category;
            
            // Update content area based on category
            updateContentArea(category);
            
            // Add click animation
            this.style.transform = 'translateX(12px) scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Content area updates
function updateContentArea(category) {
    const contentArea = document.querySelector('.content-area');
    let content = '';
    
    switch(category) {
        case 'home':
            content = getHomeContent();
            break;
        case 'generale':
            content = getGeneraleContent();
            break;
        case 'lifesteal':
            content = getLifestealContent();
            break;
        default:
            content = getHomeContent();
    }
    
    // Fade out, change content, fade in
    contentArea.style.opacity = '0.7';
    setTimeout(() => {
        contentArea.innerHTML = content;
        contentArea.style.opacity = '1';
        
        // Re-initialize gift code functionality if present
        if (category === 'home') {
            initializeGiftCode();
        }
    }, 200);
}

function getHomeContent() {
    return `
        <div class="welcome-section">
            <h2>Benvenuto nel negozio ufficiale di AnestesiaNetwork!</h2>
            <p>Per iniziare lo shopping, seleziona una categoria dalla barra laterale. Nota che i ranghi hanno un costo una tantum e sono permanenti.</p>
        </div>

        <div class="info-grid">
            <div class="info-card">
                <h3>Supporto / Domande</h3>
                <p>Hai bisogno di risposte alle tue domande prima di effettuare l'acquisto? Hai aspettato più di 20 minuti ma il tuo pacchetto non è ancora arrivato? Chiedi alla community o allo staff sul nostro server Discord! Siamo qui per aiutarti.</p>
                <p>Potrebbe volerci fino a 15 minuti per elaborare il tuo acquisto. Se non sei ancora accreditato dopo 15 minuti, contatta il nostro team di supporto su Discord.</p>
            </div>

            <div class="info-card">
                <h3>Politica di Rimborso</h3>
                <p>Abbiamo una politica di no-rimborso. Tutti gli acquisti sono definitivi e non rimborsabili. Assicurati di acquistare l'articolo corretto prima di procedere al pagamento.</p>
            </div>
        </div>

        <div class="buttons">
            <a href="#" class="btn">Discord</a>
            <a href="#" class="btn">Terms & Conditions</a>
            <a href="#" class="btn">Contact Us</a>
        </div>

        <div class="payment-methods">
            <div class="payment-method">
                <div class="payment-icon">💳</div>
                <div>
                    <div><strong>PayPal</strong></div>
                    <small style="opacity: 0.8;">Saldo PayPal, Banche, Tutte le Carte di Credito/Debito.</small>
                </div>
            </div>
            <div class="payment-method">
                <div class="payment-icon">💰</div>
                <div>
                    <div><strong>Skrill</strong></div>
                    <small style="opacity: 0.8;">Paysafecard, Amazon Pay, Pagamenti Mobili, +600 Altro</small>
                </div>
            </div>
            <div class="payment-method">
                <div class="payment-icon">💸</div>
                <div>
                    <div><strong>Stripe</strong></div>
                    <small style="opacity: 0.8;">Tutte le Carte di Credito e Debito.</small>
                </div>
            </div>
        </div>

        <div class="gift-section">
            <h3 style="color: #ff6464; margin-bottom: 15px;">Buono Regalo</h3>
            <div class="gift-input">
                <input type="text" class="gift-code-input" placeholder="Codice Carta">
                <button class="btn verify-gift-btn">Verifica</button>
            </div>
        </div>

        <div style="margin-top: 50px;">
            <h3 style="color: #ff6464; margin-bottom: 15px;">Chi Siamo</h3>
            <p style="opacity: 0.9; line-height: 1.6;">AnestesiaNetwork è una rete di Minecraft Java Edition che offre ai giocatori un gameplay coinvolgente e unico. Questo è l'unico negozio ufficiale per la rete.</p>
        </div>
    `;
}

function getGeneraleContent() {
    return `
        <div class="welcome-section">
            <h2>Generale - Ranghi e Pacchetti</h2>
            <p>Acquista ranghi permanenti e pacchetti speciali per migliorare la tua esperienza di gioco su AnestesiaNetwork.</p>
        </div>

        <div class="info-grid">
            <div class="info-card">
                <h3>🌟 Rango VIP</h3>
                <p>Accesso a comandi speciali, kit esclusivi e vantaggi unici nel server.</p>
                <div class="buttons">
                    <button class="btn">Acquista - €5.99</button>
                </div>
            </div>

            <div class="info-card">
                <h3>👑 Rango Premium</h3>
                <p>Tutti i vantaggi VIP plus priorità nella coda, homes aggiuntive e molto altro.</p>
                <div class="buttons">
                    <button class="btn">Acquista - €12.99</button>
                </div>
            </div>
        </div>

        <div class="info-card">
            <h3>💎 Rango Elite</h3>
            <p>Il rango più esclusivo con accesso completo a tutte le funzionalità premium del server.</p>
            <div class="buttons">
                <button class="btn">Acquista - €24.99</button>
            </div>
        </div>
    `;
}

function getLifestealContent() {
    return `
        <div class="welcome-section">
            <h2>Lifesteal - Modalità Survival Estrema</h2>
            <p>Pacchetti speciali per la modalità Lifesteal, dove ogni morte conta e ogni uccisione ti rende più forte.</p>
        </div>

        <div class="info-grid">
            <div class="info-card">
                <h3>⚔️ Kit Starter</h3>
                <p>Equipaggiamento di base per iniziare la tua avventura Lifesteal con il piede giusto.</p>
                <div class="buttons">
                    <button class="btn">Acquista - €3.99</button>
                </div>
            </div>

            <div class="info-card">
                <h3>🛡️ Kit Warrior</h3>
                <p>Armatura e armi avanzate per dominare il campo di battaglia Lifesteal.</p>
                <div class="buttons">
                    <button class="btn">Acquista - €8.99</button>
                </div>
            </div>
        </div>

        <div class="info-card">
            <h3>💀 Kit Assassin</h3>
            <p>Il kit più letale per i veri predatori del server Lifesteal.</p>
            <div class="buttons">
                <button class="btn">Acquista - €15.99</button>
            </div>
        </div>
    `;
}

// Gift code functionality
function initializeGiftCode() {
    const giftInput = document.querySelector('.gift-code-input');
    const verifyBtn = document.querySelector('.verify-gift-btn');
    
    if (verifyBtn && giftInput) {
        verifyBtn.addEventListener('click', handleGiftCodeVerification);
        giftInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleGiftCodeVerification();
            }
        });
    }
}

function handleGiftCodeVerification() {
    const giftInput = document.querySelector('.gift-code-input');
    const code = giftInput.value.trim();
    
    if (!code) {
        showNotification('Inserisci un codice regalo valido', 'error');
        return;
    }
    
    // Simulate API call
    showNotification('Verifica del codice in corso...', 'info');
    
    setTimeout(() => {
        // Simulate random success/failure
        const isValid = Math.random() > 0.7;
        
        if (isValid) {
            showNotification('Codice regalo valido! Credito aggiunto al tuo account.', 'success');
            giftInput.value = '';
        } else {
            showNotification('Codice regalo non valido o già utilizzato.', 'error');
        }
    }, 2000);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 100, 100, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        transform: translateX(300px);
        transition: transform 0.3s ease;
        max-width: 300px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 100, 100, 0.3);
    `;
    
    // Color variations
    if (type === 'success') {
        notification.style.background = 'rgba(0, 200, 83, 0.9)';
        notification.style.borderColor = 'rgba(0, 200, 83, 0.3)';
    } else if (type === 'error') {
        notification.style.background = 'rgba(213, 0, 0, 0.9)';
        notification.style.borderColor = 'rgba(213, 0, 0, 0.3)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(300px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Add smooth scrolling and animations
function addSmoothAnimations() {
    // Add hover effects to payment methods
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        method.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Add CSS animations
function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .sidebar-item {
            position: relative;
            overflow: hidden;
        }
        
        .sidebar-item::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 100, 100, 0.1);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.3s ease, height 0.3s ease;
        }
        
        .sidebar-item:hover::after {
            width: 100%;
            height: 100%;
        }
        
        .content-area {
            transition: opacity 0.3s ease;
        }
        
        .info-card {
            position: relative;
            overflow: hidden;
        }
        
        .info-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
            transition: left 0.5s ease;
        }
        
        .info-card:hover::before {
            left: 100%;
        }
    `;
    document.head.appendChild(style);
}

// Performance monitoring
function monitorPerformance() {
    // Monitor API call performance
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const start = performance.now();
        return originalFetch.apply(this, args)
            .then(response => {
                const end = performance.now();
                console.log(`API Call to ${args[0]} took ${end - start}ms`);
                return response;
            });
    };
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏰 AnestesiaNetwork Store - Initializing...');
    
    // Initialize DOM elements
    initializeElements();
    
    // Initialize functionality
    initializeSidebar();
    initializeGiftCode();
    
    // Start server status updates
    updateMinecraftStatus();
    updateDiscordStatus();
    
    // Update progress bar
    updateProgressBar();
    
    // Set up intervals
    setInterval(updateMinecraftStatus, CONFIG.updateIntervals.minecraft);
    setInterval(updateDiscordStatus, CONFIG.updateIntervals.discord);
    
    // Add animations and effects
    addSmoothAnimations();
    addCustomStyles();
    
    // Monitor performance in development
    if (window.location.hostname === 'localhost') {
        monitorPerformance();
    }
    
    console.log('✅ AnestesiaNetwork Store - Ready!');
});

// Handle page visibility changes to pause/resume updates
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page hidden - reducing update frequency');
        // Could implement reduced update frequency here
    } else {
        console.log('Page visible - resuming normal updates');
        updateMinecraftStatus();
        updateDiscordStatus();
    }
});

// Export functions for potential external use
window.AnestesiaStore = {
    updateMinecraftStatus,
    updateDiscordStatus,
    showNotification,
    state,
    CONFIG
};
