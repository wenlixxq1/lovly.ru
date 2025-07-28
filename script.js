// Language switching
const translations = {
    ru: { title: 'Lovly.dev - Разработчик', description: 'Веб-разработчик, создающий современные приложения на JavaScript, React, Node.js' },
    en: { title: 'Lovly.dev - Developer', description: 'Web developer creating modern applications with JavaScript, React, Node.js' }
};

let currentLang = 'ru';

function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.title = translations[lang].title;
    document.querySelector('meta[name="description"]').content = translations[lang].description;
    
    document.querySelectorAll('[data-ru][data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });
    
    const questionInput = document.getElementById('question-input');
    if (questionInput) {
        questionInput.placeholder = questionInput.getAttribute(`data-${lang}-placeholder`);
    }
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

// Progress bar
function updateProgressBar() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    document.querySelector('.progress-bar').style.width = scrollPercent + '%';
}

// Particles Animation
function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// API Configuration
const API_BASE = 'http://localhost:3000/api';

// Analytics tracking
function trackSection(section) {
    const analytics = JSON.parse(localStorage.getItem('analytics')) || {};
    analytics[section] = (analytics[section] || 0) + 1;
    localStorage.setItem('analytics', JSON.stringify(analytics));
}

// GitHub API integration
async function loadGitHubStats() {
    try {
        const response = await fetch(`${API_BASE}/github`);
        const data = await response.json();
        
        // Update stats on page
        const statsMap = {
            'Коммитов': data.total_stars || 127,
            'Репозиториев': data.public_repos || 23,
            'Языков': data.languages || 8
        };
        
        document.querySelectorAll('.stat-number').forEach(stat => {
            const label = stat.nextElementSibling.textContent;
            if (statsMap[label]) {
                stat.textContent = statsMap[label];
            }
        });
    } catch (error) {
        console.log('GitHub API error:', error);
    }
}

// Load analytics from localStorage
function loadAnalytics() {
    const analytics = JSON.parse(localStorage.getItem('analytics')) || {};
    const analyticsDiv = document.getElementById('admin-analytics');
    
    if (analyticsDiv) {
        const entries = Object.entries(analytics).sort((a, b) => b[1] - a[1]);
        
        if (entries.length === 0) {
            analyticsDiv.innerHTML = '<h4>Популярные разделы:</h4><p>Нет данных</p>';
        } else {
            analyticsDiv.innerHTML = '<h4>Популярные разделы:</h4>' + 
                entries.map(([section, visits]) => `
                    <div class="analytics-item">
                        <span class="section-name">${section}</span>
                        <span class="section-visits">${visits} просмотров</span>
                    </div>
                `).join('');
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
    });

    // Progress bar
    window.addEventListener('scroll', updateProgressBar);

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(10, 10, 10, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = 'transparent';
                header.style.backdropFilter = 'none';
            }
        }
    });

    // Tooltips
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        document.querySelectorAll('[data-tooltip]').forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                tooltip.textContent = e.target.dataset.tooltip;
                tooltip.classList.add('visible');
                
                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            });
            
            el.addEventListener('mouseleave', () => {
                tooltip.classList.remove('visible');
            });
        });
    }

    // Copy buttons
    document.querySelectorAll('.copy-btn, .copy-donate-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.dataset.email || btn.dataset.address;
            navigator.clipboard.writeText(text).then(() => {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = btn.classList.contains('copy-btn') ? 
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg>' :
                    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg>';
                btn.style.background = '#22c55e';
                btn.style.borderColor = '#22c55e';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '#1a1a1a';
                    btn.style.borderColor = '#333';
                }, 2000);
            });
        });
    });

    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    
    // Track section views
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                if (sectionId) {
                    trackSection(sectionId);
                }
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('section[id]').forEach(section => {
        observer.observe(section);
    });

    // Admin panel
    const adminToggle = document.getElementById('admin-toggle');
    const adminPanel = document.getElementById('admin-panel');
    const adminClose = document.getElementById('admin-close');
    
    if (adminToggle && adminPanel) {
        adminToggle.addEventListener('click', () => {
            adminPanel.classList.add('active');
            loadAnalytics();
        });
    }
    
    if (adminClose && adminPanel) {
        adminClose.addEventListener('click', () => {
            adminPanel.classList.remove('active');
        });
        
        adminPanel.addEventListener('click', (e) => {
            if (e.target.id === 'admin-panel') {
                adminPanel.classList.remove('active');
            }
        });
    }

    // Initialize data
    loadGitHubStats();
    
    // Initialize 3D elements
    init3D();
    
    // Initialize matrix rain
    initMatrixRain();
});

// Matrix Rain Effect
function initMatrixRain() {
    const matrixContainer = document.querySelector('.matrix-rain');
    if (!matrixContainer) return;
    
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    
    function createRainDrop() {
        const drop = document.createElement('div');
        drop.style.position = 'absolute';
        drop.style.color = '#00ff00';
        drop.style.fontSize = Math.random() * 10 + 10 + 'px';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.top = '-20px';
        drop.style.opacity = Math.random() * 0.5 + 0.3;
        drop.style.fontFamily = 'monospace';
        drop.style.pointerEvents = 'none';
        drop.textContent = chars[Math.floor(Math.random() * chars.length)];
        
        matrixContainer.appendChild(drop);
        
        const fallDuration = Math.random() * 3000 + 2000;
        const startTime = Date.now();
        
        function animateDrop() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / fallDuration;
            
            if (progress >= 1) {
                drop.remove();
                return;
            }
            
            drop.style.top = (progress * (window.innerHeight + 20)) + 'px';
            drop.style.opacity = (1 - progress) * 0.7;
            
            requestAnimationFrame(animateDrop);
        }
        
        animateDrop();
    }
    
    // Create drops periodically
    setInterval(createRainDrop, 100);
}

// 3D Hologram Avatar
function init3D() {
    initHologram();
    initSkills3D();
}

function initHologram() {
    const canvas = document.getElementById('hologram-canvas');
    if (!canvas) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Create hologram avatar
    const geometry = new THREE.ConeGeometry(1, 2, 8);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, 
        wireframe: true,
        transparent: true,
        opacity: 0.7
    });
    const avatar = new THREE.Mesh(geometry, material);
    scene.add(avatar);
    
    // Add floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 100;
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ 
        color: 0x00ffff, 
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    camera.position.z = 5;
    
    function animate() {
        requestAnimationFrame(animate);
        
        avatar.rotation.x += 0.01;
        avatar.rotation.y += 0.02;
        avatar.position.y = Math.sin(Date.now() * 0.001) * 0.5;
        
        particles.rotation.y += 0.005;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    });
}

function initSkills3D() {
    const canvas = document.getElementById('skills-canvas');
    if (!canvas) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Create floating cubes for skills
    const cubes = [];
    const colors = [0x4ecdc4, 0xff6b6b, 0x45b7d1, 0xfeca57];
    
    for (let i = 0; i < 4; i++) {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshBasicMaterial({ 
            color: colors[i], 
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        const cube = new THREE.Mesh(geometry, material);
        
        cube.position.x = (i - 2) * 2;
        cube.position.y = Math.random() * 2 - 1;
        cube.position.z = Math.random() * 2 - 1;
        
        scene.add(cube);
        cubes.push(cube);
    }
    
    camera.position.z = 5;
    
    function animate() {
        requestAnimationFrame(animate);
        
        cubes.forEach((cube, index) => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            cube.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    });
}

// QR Code functions
function showQR() {
    document.getElementById('qr-modal').classList.add('active');
}

function closeQR() {
    document.getElementById('qr-modal').classList.remove('active');
}

// Close QR on outside click
document.addEventListener('click', (e) => {
    const qrModal = document.getElementById('qr-modal');
    if (e.target === qrModal) {
        closeQR();
    }
});

// Load event
window.addEventListener('load', () => {
    // Preloader
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 300);
        }, 300);
    }
    
    // Typing effect
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        setTimeout(typeWriter, 500);
    }
    
    // Animate stats
    setTimeout(() => {
        document.querySelectorAll('.stat-number').forEach(stat => {
            const target = parseInt(stat.textContent);
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 30);
        });
    }, 800);
    
    // Initialize particles
    initParticles();
    
    // Section animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});