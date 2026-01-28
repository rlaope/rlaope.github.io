// Terminal-style typing effect with vim block cursor
function initTypingEffect() {
    const main = document.querySelector('main');
    const sections = main.querySelectorAll('section:not(.hero)');
    const elements = [];

    // Mark typing as started to show elements
    main.classList.add('typing-started');

    // Hide project boxes initially
    document.querySelectorAll('.project').forEach(p => p.classList.add('typing-pending'));

    // Collect all elements to type
    sections.forEach(section => {
        section.querySelectorAll('h2, h3, p, span.year').forEach(el => {
            if (el.closest('.tags') || el.closest('.lang-switch')) {
                return;
            }
            elements.push(el);
        });
    });

    // Store original content and pre-allocate space
    const originalData = [];
    elements.forEach(el => {
        const originalHTML = el.innerHTML;

        // Get the rendered height to pre-allocate space
        const height = el.offsetHeight;
        el.style.minHeight = height + 'px';

        el.setAttribute('data-original', originalHTML);
        el.innerHTML = '';
        originalData.push({ el, html: originalHTML });
    });

    // Create cursor element
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.innerHTML = '&nbsp;';

    let currentIndex = 0;
    const typeSpeed = 6; // ms per character batch (was 5, now 10% slower)
    const elementDelay = 35; // delay between elements

    function typeElement(data, callback) {
        const { el, html } = data;

        // Show project box when starting to type its content
        const projectBox = el.closest('.project');
        if (projectBox) {
            projectBox.classList.remove('typing-pending');
        }

        // Get plain text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const textContent = tempDiv.textContent || tempDiv.innerText;

        let charIndex = 0;
        el.innerHTML = '';
        el.appendChild(cursor);

        function type() {
            if (charIndex < textContent.length) {
                // Remove cursor, add chars, re-add cursor
                if (cursor.parentNode === el) {
                    el.removeChild(cursor);
                }

                // Add characters (fast - 4 at a time)
                const charsToAdd = Math.min(4, textContent.length - charIndex);
                el.insertAdjacentText('beforeend', textContent.substring(charIndex, charIndex + charsToAdd));
                charIndex += charsToAdd;

                el.appendChild(cursor);
                setTimeout(type, typeSpeed);
            } else {
                // Done - restore original HTML and remove cursor
                if (cursor.parentNode === el) {
                    el.removeChild(cursor);
                }
                el.innerHTML = html;
                el.style.minHeight = ''; // Remove min-height after done
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

    // Start typing immediately
    typeNext();
}

// Floating particles background
let floatingParticles = [];
let floatingCanvas, floatingCtx;
let particlesEnabled = true;

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

        if (!particlesEnabled) {
            requestAnimationFrame(animateFloating);
            return;
        }

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

// Effect toggle
function initEffectToggle() {
    const btn = document.getElementById('btn-effect');
    if (!btn) return;

    // Load saved preference
    const savedPref = localStorage.getItem('particles-enabled');
    if (savedPref !== null) {
        particlesEnabled = savedPref === 'true';
    }
    btn.classList.toggle('active', particlesEnabled);

    btn.addEventListener('click', () => {
        particlesEnabled = !particlesEnabled;
        btn.classList.toggle('active', particlesEnabled);
        localStorage.setItem('particles-enabled', particlesEnabled);
    });
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
    let keyRotX = 0, keyRotY = 0; // Arrow key rotation

    // Cube parameters - bigger cube
    const cubeSize = 200;
    const particleCount = 1000;
    let rotationX = 0, rotationY = 0, rotationZ = 0;

    // Spotlight particles
    let spotlightParticles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createSpotlightParticles() {
        spotlightParticles = [];
        const spotlightCount = 80;
        const cubeBottomY = height / 2 + 120 + cubeSize / 2; // Below the cube

        for (let i = 0; i < spotlightCount; i++) {
            spotlightParticles.push({
                x: width / 2 + (Math.random() - 0.5) * 60, // Start near center
                y: cubeBottomY + Math.random() * 200,
                char: Math.random() > 0.5 ? '1' : '0',
                speed: 0.5 + Math.random() * 1.5,
                spread: (Math.random() - 0.5) * 0.8,
                alpha: 0.1 + Math.random() * 0.3,
                baseY: cubeBottomY
            });
        }
    }

    function createParticles() {
        particles = [];
        const half = cubeSize / 2;

        // Create particles on cube edges (makes it look more like a wireframe cube)
        const edgeParticles = 400;
        const edges = [
            // Bottom face edges
            { start: [-half, -half, -half], end: [half, -half, -half] },
            { start: [-half, -half, -half], end: [-half, -half, half] },
            { start: [half, -half, -half], end: [half, -half, half] },
            { start: [-half, -half, half], end: [half, -half, half] },
            // Top face edges
            { start: [-half, half, -half], end: [half, half, -half] },
            { start: [-half, half, -half], end: [-half, half, half] },
            { start: [half, half, -half], end: [half, half, half] },
            { start: [-half, half, half], end: [half, half, half] },
            // Vertical edges
            { start: [-half, -half, -half], end: [-half, half, -half] },
            { start: [half, -half, -half], end: [half, half, -half] },
            { start: [-half, -half, half], end: [-half, half, half] },
            { start: [half, -half, half], end: [half, half, half] },
        ];

        // Add particles along edges
        edges.forEach(edge => {
            const count = Math.floor(edgeParticles / edges.length);
            for (let i = 0; i < count; i++) {
                const t = i / count;
                const x = edge.start[0] + (edge.end[0] - edge.start[0]) * t;
                const y = edge.start[1] + (edge.end[1] - edge.start[1]) * t;
                const z = edge.start[2] + (edge.end[2] - edge.start[2]) * t;

                particles.push({
                    x, y, z,
                    originalX: x, originalY: y, originalZ: z,
                    char: Math.random() > 0.5 ? '1' : '0',
                    vx: 0, vy: 0, vz: 0,
                    alpha: 0.7 + Math.random() * 0.3
                });
            }
        });

        // Add particles on faces (less dense)
        const faceParticles = particleCount - edgeParticles;
        for (let i = 0; i < faceParticles; i++) {
            const face = Math.floor(Math.random() * 6);
            let x, y, z;

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
                alpha: 0.2 + Math.random() * 0.4
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
        const perspective = 600; // Increased for less distortion
        const scale = perspective / (perspective + z);
        return {
            x: x * scale + width / 2,
            y: y * scale + height / 2 + 120,
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
            // Start typing effect after overlay fades
            setTimeout(() => {
                initTypingEffect();
            }, 400);
            setTimeout(() => {
                overlay.classList.add('hidden');
                cancelAnimationFrame(animationId);
            }, 800);
        }, 500);
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

            // Add keyboard rotation
            rotationX += keyRotX;
            rotationY += keyRotY;

            // Slow auto rotation
            rotationZ += 0.002;
            rotationY += 0.005;
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

        // Draw spotlight particles below cube
        if (!isExploding) {
            ctx.font = '12px JetBrains Mono';
            spotlightParticles.forEach(p => {
                // Move down and spread out
                p.y += p.speed;
                p.x += p.spread;

                // Calculate fade based on distance from cube
                const distFromCube = p.y - p.baseY;
                const maxDist = 250;
                const fade = Math.max(0, 1 - distFromCube / maxDist);

                // Reset when too far
                if (distFromCube > maxDist || p.x < 0 || p.x > width) {
                    p.y = p.baseY + Math.random() * 30;
                    p.x = width / 2 + (Math.random() - 0.5) * 80;
                    p.spread = (Math.random() - 0.5) * 1.2;
                }

                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * fade})`;
                ctx.fillText(p.char, p.x, p.y);
            });
        }

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
        createSpotlightParticles();
        animate();

        window.addEventListener('resize', () => {
            resize();
            createSpotlightParticles(); // Recreate spotlight on resize
        });
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

        // Arrow keys to rotate cube
        window.addEventListener('keydown', (e) => {
            if (isExploding) return;

            switch(e.key) {
                case 'ArrowUp':
                    keyRotX = -0.05;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    keyRotX = 0.05;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    keyRotY = -0.05;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    keyRotY = 0.05;
                    e.preventDefault();
                    break;
                default:
                    // Any other key triggers explosion
                    if (!overlay.classList.contains('hidden')) {
                        sessionStorage.setItem('intro-seen', 'true');
                        explode();
                    }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
                keyRotX = 0;
            }
            if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                keyRotY = 0;
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

    // Initialize effect toggle
    initEffectToggle();

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
