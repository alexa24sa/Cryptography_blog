// ========================================
// SISTEMA DE BURBUJAS INTERACTIVAS
// ========================================

class BubbleSystem {
    constructor() {
        this.container = document.getElementById('bubblesContainer');
        this.bubbles = [];
        this.maxBubbles = 20; // Límite optimizado
        this.createInterval = null;
    }

    init() {
        // Crear burbujas iniciales
        for (let i = 0; i < 8; i++) {
            setTimeout(() => this.createBubble(), i * 300);
        }
        
        // Crear burbujas continuas
        this.createInterval = setInterval(() => {
            if (this.bubbles.length < this.maxBubbles) {
                this.createBubble();
            }
        }, 2000);
        
        // Limpiar burbujas viejas
        setInterval(() => this.cleanup(), 5000);
    }

    createBubble() {
        const bubble = document.createElement('div');
        const sizes = ['small', 'medium', 'large'];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        
        bubble.className = `bubble ${size}`;
        
        // Posición horizontal aleatoria
        const leftPosition = Math.random() * 100;
        bubble.style.left = `${leftPosition}%`;
        
        // Duración aleatoria de subida
        const duration = 8 + Math.random() * 8; // 8-16 segundos
        bubble.style.animationDuration = `${duration}s`;
        
        // Oscilación horizontal (movimiento sinusoidal)
        const wobble = 30 + Math.random() * 40; // 30-70px
        bubble.style.setProperty('--wobble', `${wobble}px`);
        
        // Agregar microinteracción con el cursor
        bubble.addEventListener('mouseenter', (e) => {
            bubble.style.transform = 'scale(1.2) translateX(20px)';
            bubble.style.boxShadow = '0 0 30px rgba(77, 240, 255, 0.8)';
        });
        
        bubble.addEventListener('mouseleave', (e) => {
            bubble.style.transform = '';
            bubble.style.boxShadow = '';
        });
        
        // Agregar al contenedor
        this.container.appendChild(bubble);
        this.bubbles.push(bubble);
        
        // Eliminar cuando termine la animación
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.remove();
                this.bubbles = this.bubbles.filter(b => b !== bubble);
            }
        }, duration * 1000);
    }

    cleanup() {
        // Eliminar burbujas que ya terminaron
        this.bubbles = this.bubbles.filter(bubble => {
            if (!bubble.parentNode) {
                return false;
            }
            return true;
        });
    }

    destroy() {
        if (this.createInterval) {
            clearInterval(this.createInterval);
        }
        this.bubbles.forEach(bubble => bubble.remove());
        this.bubbles = [];
    }
}

// ========================================
// EFECTO PARALLAX
// ========================================

class ParallaxEffect {
    constructor() {
        this.layers = {
            lightRays: document.querySelector('.light-rays'),
            seaweedLeft: document.querySelector('.seaweed-layer.left'),
            seaweedRight: document.querySelector('.seaweed-layer.right'),
            particles: document.querySelector('.floating-particles'),
            corals: document.querySelectorAll('.coral-decoration')
        };
        this.scrollY = 0;
    }

    init() {
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => this.update());
        });
    }

    update() {
        this.scrollY = window.pageYOffset;
        
        // Rayos de luz - movimiento muy lento
        if (this.layers.lightRays) {
            this.layers.lightRays.style.transform = 
                `translateY(${this.scrollY * 0.1}px) rotate(${this.scrollY * 0.01}deg)`;
        }
        
        // Algas - movimiento medio
        if (this.layers.seaweedLeft) {
            this.layers.seaweedLeft.style.transform = 
                `translateY(${this.scrollY * 0.3}px) skewX(${Math.sin(this.scrollY * 0.01) * 2}deg)`;
        }
        if (this.layers.seaweedRight) {
            this.layers.seaweedRight.style.transform = 
                `translateY(${this.scrollY * 0.25}px) skewX(${Math.sin(this.scrollY * 0.01) * -2}deg)`;
        }
        
        // Partículas - movimiento rápido
        if (this.layers.particles) {
            this.layers.particles.style.transform = 
                `translateY(${this.scrollY * 0.5}px)`;
        }
        
        // Corales - movimiento suave
        this.layers.corals.forEach((coral, index) => {
            const speed = 0.2 + (index * 0.1);
            coral.style.transform = 
                `translateY(${this.scrollY * speed}px) rotate(${Math.sin(this.scrollY * 0.005) * 3}deg)`;
        });
    }
}

// ========================================
// ANIMACIÓN DE ENTRADA
// ========================================

class EntryAnimation {
    constructor() {
        this.overlay = document.getElementById('entryAnimation');
        this.duration = 2500; // 2.5 segundos
    }

    init() {
        // Crear burbujas de explosión adicionales
        this.createBurstBubbles();
        
        // Ocultar después de la animación
        setTimeout(() => {
            if (this.overlay) {
                this.overlay.style.display = 'none';
            }
        }, this.duration + 500);
    }

    createBurstBubbles() {
        const burstContainer = this.overlay.querySelector('.bubble-burst');
        if (!burstContainer) return;
        
        // Crear 12 burbujas que explotan en diferentes direcciones
        for (let i = 0; i < 12; i++) {
            const bubble = document.createElement('div');
            bubble.style.position = 'absolute';
            bubble.style.width = '20px';
            bubble.style.height = '20px';
            bubble.style.borderRadius = '50%';
            bubble.style.background = 'radial-gradient(circle, rgba(77, 240, 255, 0.8), rgba(0, 212, 255, 0.3))';
            bubble.style.boxShadow = '0 0 20px rgba(77, 240, 255, 0.8)';
            
            const angle = (i / 12) * Math.PI * 2;
            const distance = 150 + Math.random() * 100;
            
            bubble.style.animation = `burstFly 1.5s ease-out forwards`;
            bubble.style.setProperty('--angle', `${angle}rad`);
            bubble.style.setProperty('--distance', `${distance}px`);
            
            burstContainer.appendChild(bubble);
        }
        
        // Añadir la animación CSS dinámica
        const style = document.createElement('style');
        style.textContent = `
            @keyframes burstFly {
                0% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(
                        calc(-50% + cos(var(--angle)) * var(--distance)),
                        calc(-50% + sin(var(--angle)) * var(--distance))
                    ) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========================================
// EFECTOS DE CURSOR (MICROINTERACCIONES)
// ========================================

class CursorEffects {
    constructor() {
        this.cards = document.querySelectorAll('.glass-card');
        this.buttons = document.querySelectorAll('.main-btn, .social-btn, .nav-links a');
    }

    init() {
        // Efecto de brillo en tarjetas siguiendo el cursor
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                const glow = card.querySelector('.card-glow');
                if (glow) {
                    glow.style.background = `radial-gradient(circle at ${x}% ${y}%, 
                        rgba(77, 240, 255, 0.25) 0%, 
                        transparent 50%)`;
                }
            });
        });
        
        // Efecto de ondas en botones
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.className = 'ripple-effect';
                
                button.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
        
        // Añadir estilos para el efecto ripple
        const style = document.createElement('style');
        style.textContent = `
            .ripple-effect {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            }
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========================================
// NAVEGACIÓN SMOOTH CON OFFSET
// ========================================

class SmoothNavigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
        this.navbar = document.querySelector('.navbar');
    }

    init() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const navbarHeight = this.navbar ? this.navbar.offsetHeight : 0;
                    const targetPosition = targetSection.offsetTop - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ========================================
// OBSERVADOR DE SECCIONES (ANIMACIONES AL SCROLL)
// ========================================

class SectionObserver {
    constructor() {
        this.sections = document.querySelectorAll('.section-container');
        this.options = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, this.options);
        
        this.sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(50px)';
            section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(section);
        });
    }
}

// ========================================
// OPTIMIZACIÓN DE RENDIMIENTO
// ========================================

class PerformanceOptimizer {
    constructor() {
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    init() {
        // Pausar animaciones cuando no son visibles
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
        
        // Reducir calidad en dispositivos de bajo rendimiento
        if (this.isLowEndDevice()) {
            this.reducedQualityMode();
        }
    }

    pauseAnimations() {
        document.body.style.animationPlayState = 'paused';
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        document.body.style.animationPlayState = 'running';
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }

    isLowEndDevice() {
        // Detectar dispositivos de bajo rendimiento
        return navigator.hardwareConcurrency <= 4 || 
               navigator.deviceMemory <= 4;
    }

    reducedQualityMode() {
        // Reducir número de burbujas
        if (window.bubbleSystem) {
            window.bubbleSystem.maxBubbles = 10;
        }
        
        // Simplificar efectos de blur
        const glassCards = document.querySelectorAll('.glass-card');
        glassCards.forEach(card => {
            card.style.backdropFilter = 'blur(5px)';
        });
    }
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar animación de entrada
    const entryAnimation = new EntryAnimation();
    entryAnimation.init();
    
    // Esperar a que termine la animación de entrada
    setTimeout(() => {
        // Sistema de burbujas
        window.bubbleSystem = new BubbleSystem();
        window.bubbleSystem.init();
        
        // Efecto parallax
        const parallax = new ParallaxEffect();
        parallax.init();
        
        // Efectos de cursor
        const cursorEffects = new CursorEffects();
        cursorEffects.init();
        
        // Navegación suave
        const smoothNav = new SmoothNavigation();
        smoothNav.init();
        
        // Observador de secciones
        const sectionObserver = new SectionObserver();
        sectionObserver.init();
        
        // Optimizador de rendimiento
        const optimizer = new PerformanceOptimizer();
        optimizer.init();
        
    }, 2500);
});

// Limpiar al salir de la página
window.addEventListener('beforeunload', () => {
    if (window.bubbleSystem) {
        window.bubbleSystem.destroy();
    }
});

// ========================================
// UTILIDADES ADICIONALES
// ========================================

// Función para detectar si el usuario está en un dispositivo móvil
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Ajustar efectos para móviles
if (isMobile()) {
    // Reducir animaciones en móviles
    document.documentElement.style.setProperty('--animation-speed', '0.5');
    
    // Desactivar parallax en móviles para mejor rendimiento
    window.addEventListener('scroll', (e) => {
        // Solo en móvil, desactivar parallax
    }, { passive: true });
}

console.log('🌊 Ambiente submarino inicializado correctamente');

// ========================================
// MODAL DE FUN FACTS
// ========================================

class FunFactsModal {
    constructor() {
        this.modal = document.getElementById('funFactsModal');
        this.btn = document.getElementById('funFactsBtn');
        this.closeBtn = document.getElementById('modalClose');
        this.overlay = document.getElementById('modalOverlay');
    }

    init() {
        // Abrir modal
        this.btn.addEventListener('click', () => {
            this.open();
        });

        // Cerrar modal con botón X
        this.closeBtn.addEventListener('click', () => {
            this.close();
        });

        // Cerrar modal haciendo clic en el overlay
        this.overlay.addEventListener('click', () => {
            this.close();
        });

        // Cerrar modal con la tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    open() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar scroll
    }
}

// Inicializar modal de Fun Facts cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const funFactsModal = new FunFactsModal();
    funFactsModal.init();

    // ========================================
    // MENÚ HAMBURGUESA MÓVIL
    // ========================================
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.querySelector('.nav-links');

    if (hamburgerBtn && navLinks) {
        // Abrir/cerrar menú al pulsar el botón
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburgerBtn.classList.toggle('active');
            navLinks.classList.toggle('mobile-open');
        });

        // Cerrar menú al hacer clic en un enlace
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                navLinks.classList.remove('mobile-open');
            });
        });

        // Cerrar menú al hacer clic fuera de él
        document.addEventListener('click', (e) => {
            if (!hamburgerBtn.contains(e.target) && !navLinks.contains(e.target)) {
                hamburgerBtn.classList.remove('active');
                navLinks.classList.remove('mobile-open');
            }
        });
    }
});
