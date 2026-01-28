// Fast typing effect for resume content
function initTypingEffect() {
    const main = document.querySelector('main');
    const elements = main.querySelectorAll('h1, h2, h3, p, span.year, span.handle, a');

    // Store original content and hide elements
    const originalData = [];
    elements.forEach((el, index) => {
        if (el.closest('.tags') || el.closest('.lang-switch') || el.tagName === 'A' && el.closest('h3')) {
            // Skip tag spans and language buttons and links inside h3
            return;
        }
        const originalHTML = el.innerHTML;
        const isLink = el.tagName === 'A';
        if (!isLink) {
            el.innerHTML = '';
        }
        el.style.opacity = '0';
        originalData.push({ el, html: originalHTML, isLink });
    });

    // Type each element very fast
    let currentIndex = 0;
    const typeSpeed = 2; // Very fast - 2ms per character
    const elementDelay = 30; // Small delay between elements

    function typeElement(data, callback) {
        const { el, html, isLink } = data;
        el.style.opacity = '1';

        if (isLink) {
            el.style.opacity = '1';
            callback();
            return;
        }

        // Parse HTML to handle tags properly
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const textContent = tempDiv.textContent || tempDiv.innerText;

        let charIndex = 0;
        el.innerHTML = '';

        function type() {
            if (charIndex < textContent.length) {
                // Add multiple characters at once for speed
                const charsToAdd = Math.min(3, textContent.length - charIndex);
                el.textContent += textContent.substring(charIndex, charIndex + charsToAdd);
                charIndex += charsToAdd;
                setTimeout(type, typeSpeed);
            } else {
                // Restore original HTML with formatting
                el.innerHTML = html;
                callback();
            }
        }
        type();
    }

    function typeNext() {
        if (currentIndex < originalData.length) {
            typeElement(originalData[currentIndex], () => {
                currentIndex++;
                setTimeout(typeNext, elementDelay);
            });
        }
    }

    // Start typing after a brief delay
    setTimeout(typeNext, 200);
}

// Floating particles background
let floatingParticles = [];
let floatingCanvas, floatingCtx;

function initFloatingParticles() {
    floatingCanvas = document.getElementById('floating-particles');
    if (!floatingCanvas) return;
    floatingCtx = floatingCanvas.getContext('2d');

    const mainWidth = 720;
    const padding = 32;

    function resize() {
        floatingCanvas.width = window.innerWidth;
        floatingCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create floating particles only on left and right sides (outside main content)
    function getRandomSideX() {
        const centerStart = (window.innerWidth - mainWidth) / 2 - padding;
        const centerEnd = (window.innerWidth + mainWidth) / 2 + padding;

        // Randomly choose left or right side
        if (Math.random() > 0.5) {
            // Left side
            return Math.random() * Math.max(0, centerStart);
        } else {
            // Right side
            return centerEnd + Math.random() * Math.max(0, window.innerWidth - centerEnd);
        }
    }

    for (let i = 0; i < 40; i++) {
        floatingParticles.push({
            x: getRandomSideX(),
            y: Math.random() * window.innerHeight,
            char: Math.random() > 0.5 ? '1' : '0',
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.5,
            alpha: 0.15 + Math.random() * 0.25
        });
    }

    function animateFloating() {
        floatingCtx.clearRect(0, 0, floatingCanvas.width, floatingCanvas.height);
        floatingCtx.font = '14px JetBrains Mono';
        floatingCtx.textAlign = 'center';

        const centerStart = (floatingCanvas.width - mainWidth) / 2 - padding;
        const centerEnd = (floatingCanvas.width + mainWidth) / 2 + padding;

        floatingParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges, but keep particles on sides
            if (p.y < 0) p.y = floatingCanvas.height;
            if (p.y > floatingCanvas.height) p.y = 0;

            // Keep particles on left or right side only
            if (p.x < centerStart) {
                // Left side - wrap within left area
                if (p.x < 0) p.x = centerStart - 10;
            } else if (p.x > centerEnd) {
                // Right side - wrap within right area
                if (p.x > floatingCanvas.width) p.x = centerEnd + 10;
            } else {
                // Particle drifted to center, push it back to nearest side
                if (p.x < floatingCanvas.width / 2) {
                    p.x = centerStart - 10;
                } else {
                    p.x = centerEnd + 10;
                }
            }

            floatingCtx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            floatingCtx.fillText(p.char, p.x, p.y);
        });

        requestAnimationFrame(animateFloating);
    }
    animateFloating();
}

// Intro Animation - 3D Binary Cube
(function() {
    const canvas = document.getElementById('cube-canvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('intro-overlay');
    const main = document.querySelector('main');

    let width, height;
    let particles = [];
    let animationId;
    let isExploding = false;
    let mouseX = 0, mouseY = 0;

    // Cube parameters - bigger cube
    const cubeSize = 220;
    const particleCount = 1200;
    let rotationX = 0, rotationY = 0, rotationZ = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            // Create particles on cube surfaces
            const face = Math.floor(Math.random() * 6);
            let x, y, z;
            const half = cubeSize / 2;

            switch(face) {
                case 0: x = half; y = (Math.random() - 0.5) * cubeSize; z = (Math.random() - 0.5) * cubeSize; break;
                case 1: x = -half; y = (Math.random() - 0.5) * cubeSize; z = (Math.random() - 0.5) * cubeSize; break;
                case 2: y = half; x = (Math.random() - 0.5) * cubeSize; z = (Math.random() - 0.5) * cubeSize; break;
                case 3: y = -half; x = (Math.random() - 0.5) * cubeSize; z = (Math.random() - 0.5) * cubeSize; break;
                case 4: z = half; x = (Math.random() - 0.5) * cubeSize; y = (Math.random() - 0.5) * cubeSize; break;
                case 5: z = -half; x = (Math.random() - 0.5) * cubeSize; y = (Math.random() - 0.5) * cubeSize; break;
            }

            particles.push({
                x, y, z,
                originalX: x, originalY: y, originalZ: z,
                char: Math.random() > 0.5 ? '1' : '0',
                vx: 0, vy: 0, vz: 0,
                alpha: 0.3 + Math.random() * 0.7
            });
        }
    }

    function rotatePoint(x, y, z) {
        // Rotate around X
        let y1 = y * Math.cos(rotationX) - z * Math.sin(rotationX);
        let z1 = y * Math.sin(rotationX) + z * Math.cos(rotationX);

        // Rotate around Y
        let x2 = x * Math.cos(rotationY) + z1 * Math.sin(rotationY);
        let z2 = -x * Math.sin(rotationY) + z1 * Math.cos(rotationY);

        // Rotate around Z
        let x3 = x2 * Math.cos(rotationZ) - y1 * Math.sin(rotationZ);
        let y3 = x2 * Math.sin(rotationZ) + y1 * Math.cos(rotationZ);

        return { x: x3, y: y3, z: z2 };
    }

    function project(x, y, z) {
        const perspective = 500;
        const scale = perspective / (perspective + z);
        return {
            x: x * scale + width / 2,
            y: y * scale + height / 2,
            scale
        };
    }

    function explode() {
        isExploding = true;
        particles.forEach(p => {
            const angle = Math.atan2(p.y, p.x);
            const angleZ = Math.atan2(p.z, Math.sqrt(p.x * p.x + p.y * p.y));
            const speed = 10 + Math.random() * 20;
            p.vx = Math.cos(angle) * Math.cos(angleZ) * speed;
            p.vy = Math.sin(angle) * speed;
            p.vz = Math.sin(angleZ) * speed;
        });

        setTimeout(() => {
            overlay.classList.add('fade-out');
            main.classList.add('visible');
            initFloatingParticles();
            initTypingEffect();
            setTimeout(() => {
                overlay.classList.add('hidden');
                cancelAnimationFrame(animationId);
            }, 800);
        }, 600);
    }

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, width, height);

        if (!isExploding) {
            // Interactive rotation based on mouse
            const targetRotY = (mouseX - width / 2) * 0.0008;
            const targetRotX = (mouseY - height / 2) * 0.0008;
            rotationY += (targetRotY - rotationY * 0.1) * 0.05;
            rotationX += (targetRotX - rotationX * 0.1) * 0.05;
            rotationZ += 0.003;
            rotationY += 0.008;
        }

        ctx.font = '14px JetBrains Mono';
        ctx.textAlign = 'center';

        // Sort particles by z for depth
        const sortedParticles = particles.map(p => {
            if (isExploding) {
                p.x += p.vx;
                p.y += p.vy;
                p.z += p.vz;
                p.alpha *= 0.96;
            }
            const rotated = rotatePoint(p.x, p.y, p.z);
            const projected = project(rotated.x, rotated.y, rotated.z);
            return { ...p, projected, rotated };
        }).sort((a, b) => a.rotated.z - b.rotated.z);

        sortedParticles.forEach(p => {
            // White color with depth-based brightness
            const brightness = Math.floor(150 + (p.rotated.z / cubeSize) * 105);
            const color = Math.min(255, brightness);
            ctx.fillStyle = `rgba(${color}, ${color}, ${color}, ${p.alpha * p.projected.scale})`;
            ctx.fillText(p.char, p.projected.x, p.projected.y);
        });

        animationId = requestAnimationFrame(animate);
    }

    // Check if intro was already seen this session
    if (sessionStorage.getItem('intro-seen')) {
        overlay.classList.add('hidden');
        main.classList.add('visible');
        // Show all elements immediately without typing effect
        main.querySelectorAll('h1, h2, h3, p, span.year, span.handle, a').forEach(el => {
            el.style.opacity = '1';
        });
        initFloatingParticles();
    } else {
        resize();
        createParticles();
        animate();

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        overlay.addEventListener('click', () => {
            if (!isExploding) {
                sessionStorage.setItem('intro-seen', 'true');
                explode();
            }
        });

        // Also trigger on any key press
        window.addEventListener('keydown', () => {
            if (!isExploding && !overlay.classList.contains('hidden')) {
                sessionStorage.setItem('intro-seen', 'true');
                explode();
            }
        });
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const btnEn = document.getElementById('btn-en');
    const btnKr = document.getElementById('btn-kr');
    let currentLang = 'en';

    // Language switching
    function setLanguage(lang) {
        currentLang = lang;

        // Update button states
        btnEn.classList.toggle('active', lang === 'en');
        btnKr.classList.toggle('active', lang === 'kr');

        // Update all translatable elements
        document.querySelectorAll('[data-en]').forEach(el => {
            el.innerHTML = el.getAttribute(`data-${lang}`);
        });

        // Update html lang attribute
        document.documentElement.lang = lang === 'kr' ? 'ko' : 'en';

        // Save preference
        localStorage.setItem('preferred-lang', lang);
    }

    // Event listeners
    btnEn.addEventListener('click', () => setLanguage('en'));
    btnKr.addEventListener('click', () => setLanguage('kr'));

    // Load saved preference
    const savedLang = localStorage.getItem('preferred-lang');
    if (savedLang) {
        setLanguage(savedLang);
    }

    // Optional: Typing effect for commands
    function typeWriter(element, text, speed = 50) {
        let i = 0;
        element.textContent = '';

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Add subtle hover effects
    document.querySelectorAll('.line').forEach(line => {
        line.addEventListener('mouseenter', () => {
            line.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
        });
        line.addEventListener('mouseleave', () => {
            line.style.backgroundColor = 'transparent';
        });
    });
});
