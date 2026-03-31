// Lazy load craft images after intro
function loadCraftImages() {
    document.querySelectorAll('.craft-item img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
    });
}

// Global typing state for language switching during animation
let typingState = null;

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
    const typeSpeed = 2; // ms per character batch - faster
    const elementDelay = 15; // delay between elements

    let typingCancelled = false;

    // Expose typing state globally for language switching
    typingState = {
        originalData,
        getCurrentIndex: () => currentIndex,
        cancelAndFinish(lang) {
            typingCancelled = true;
            // Remove cursor
            if (cursor.parentNode) {
                cursor.parentNode.removeChild(cursor);
            }
            // Show all remaining elements immediately in the correct language
            for (let i = currentIndex; i < originalData.length; i++) {
                const d = originalData[i];
                const langAttr = d.el.getAttribute(`data-${lang}`);
                d.el.innerHTML = langAttr || d.html;
                d.el.style.minHeight = '';
                const projectBox = d.el.closest('.project');
                if (projectBox) {
                    projectBox.classList.remove('typing-pending');
                }
            }
            typingState = null;
        }
    };

    function typeElement(data, callback) {
        // Show project box when starting to type its content
        const projectBox = data.el.closest('.project');
        if (projectBox) {
            projectBox.classList.remove('typing-pending');
        }

        // Get plain text from current html (may be updated by language switch)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.html;
        const textContent = tempDiv.textContent || tempDiv.innerText;

        let charIndex = 0;
        data.el.innerHTML = '';
        data.el.appendChild(cursor);

        function type() {
            if (typingCancelled) return;
            if (charIndex < textContent.length) {
                // Remove cursor, add chars, re-add cursor
                if (cursor.parentNode === data.el) {
                    data.el.removeChild(cursor);
                }

                // Add characters (fast - 4 at a time)
                const charsToAdd = Math.min(8, textContent.length - charIndex);
                data.el.insertAdjacentText('beforeend', textContent.substring(charIndex, charIndex + charsToAdd));
                charIndex += charsToAdd;

                data.el.appendChild(cursor);
                setTimeout(type, typeSpeed);
            } else {
                // Done - restore original HTML and remove cursor
                if (cursor.parentNode === data.el) {
                    data.el.removeChild(cursor);
                }
                data.el.innerHTML = data.html;
                data.el.style.minHeight = ''; // Remove min-height after done
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
        } else {
            typingState = null;
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

    function resize() {
        floatingCanvas.width = window.innerWidth;
        floatingCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create floating particles spread across the entire screen
    for (let i = 0; i < 50; i++) {
        floatingParticles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            char: Math.random() > 0.5 ? '1' : '0',
            // Gentle base velocity
            baseVx: (Math.random() - 0.5) * 0.2,
            baseVy: -0.3 - Math.random() * 0.3, // Slowly rise upward
            // Sine wave parameters for organic movement
            amplitude: 20 + Math.random() * 30,
            frequency: 0.005 + Math.random() * 0.01,
            phase: Math.random() * Math.PI * 2,
            alpha: 0.08 + Math.random() * 0.15,
            size: 12 + Math.random() * 6
        });
    }

    let time = 0;

    function animateFloating() {
        floatingCtx.clearRect(0, 0, floatingCanvas.width, floatingCanvas.height);

        if (!particlesEnabled) {
            requestAnimationFrame(animateFloating);
            return;
        }

        time += 1;

        floatingParticles.forEach(p => {
            // Organic sine wave movement
            const sineOffset = Math.sin(time * p.frequency + p.phase) * p.amplitude * 0.02;

            p.x += p.baseVx + sineOffset;
            p.y += p.baseVy;

            // Wrap around edges smoothly
            if (p.y < -20) {
                p.y = floatingCanvas.height + 20;
                p.x = Math.random() * floatingCanvas.width;
            }
            if (p.x < -20) p.x = floatingCanvas.width + 20;
            if (p.x > floatingCanvas.width + 20) p.x = -20;

            floatingCtx.font = `${p.size}px JetBrains Mono`;
            floatingCtx.textAlign = 'center';
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

// Terminal Animation
function initTerminalAnimation() {
    // [plain text, highlighted HTML]
    const codeSnippets = [
        [
            ['$ cargo build --release', '<span class="terminal-prompt">$</span> <span class="terminal-command">cargo build</span> --release'],
            ['   Compiling airml-core v0.1.0', '   <span class="terminal-comment">Compiling</span> airml-core v0.1.0'],
            ['   Compiling airml-providers v0.1.0', '   <span class="terminal-comment">Compiling</span> airml-providers v0.1.0'],
            ['    Finished release [optimized]', '    <span class="terminal-comment">Finished</span> release [optimized]'],
            ['$ ./airml run --model resnet50.onnx', '<span class="terminal-prompt">$</span> ./airml <span class="terminal-command">run</span> --model resnet50.onnx'],
            ['✓ Model loaded in 0.02s', '<span class="terminal-string">✓ Model loaded in 0.02s</span>'],
        ],
        [
            ['fn infer(input: Tensor) -> Result {', '<span class="terminal-keyword">fn</span> <span class="terminal-command">infer</span>(input: Tensor) -> Result {'],
            ['    let session = Session::builder()', '    <span class="terminal-keyword">let</span> session = Session::builder()'],
            ['        .with_provider(CoreML::new())', '        .with_provider(CoreML::new())'],
            ['        .build()?;', '        .build()?;'],
            ['    let output = session.run(input)?;', '    <span class="terminal-keyword">let</span> output = session.<span class="terminal-command">run</span>(input)?;'],
            ['    Ok(output.into())', '    <span class="terminal-keyword">Ok</span>(output.into())'],
        ],
        [
            ['$ git add .', '<span class="terminal-prompt">$</span> <span class="terminal-command">git add</span> .'],
            ['$ git commit -m "feat: call khope"', '<span class="terminal-prompt">$</span> <span class="terminal-command">git commit</span> -m <span class="terminal-string">"feat: call khope"</span>'],
            ['[main 7f3a2b1] feat: call khope', '<span class="terminal-comment">[main 7f3a2b1]</span> feat: call khope'],
            ['$ git push origin main', '<span class="terminal-prompt">$</span> <span class="terminal-command">git push</span> origin main'],
            ['Enumerating objects: 12, done.', '<span class="terminal-comment">Enumerating objects: 12, done.</span>'],
            ['✓ Pushed to origin/main', '<span class="terminal-string">✓ Pushed to origin/main</span>'],
        ],
        [
            ['export class InferenceEngine {', '<span class="terminal-keyword">export class</span> InferenceEngine {'],
            ['    constructor(config) {', '    <span class="terminal-keyword">constructor</span>(config) {'],
            ['        this.model = loadModel(config);', '        this.model = <span class="terminal-command">loadModel</span>(config);'],
            ['    }', '    }'],
            ['    async predict(input) {', '    <span class="terminal-keyword">async</span> <span class="terminal-command">predict</span>(input) {'],
            ['        return this.model.forward(input);', '        <span class="terminal-keyword">return</span> this.model.<span class="terminal-command">forward</span>(input);'],
        ],
        [
            ['$ kubectl get pods -n ml-serving', '<span class="terminal-prompt">$</span> <span class="terminal-command">kubectl get</span> pods -n ml-serving'],
            ['NAME                    READY   STATUS', 'NAME                    READY   STATUS'],
            ['airml-7f8d9c-x2k4p     1/1     Running', 'airml-7f8d9c-x2k4p     1/1     <span class="terminal-string">Running</span>'],
            ['$ kubectl logs airml-7f8d9c-x2k4p', '<span class="terminal-prompt">$</span> <span class="terminal-command">kubectl logs</span> airml-7f8d9c-x2k4p'],
            ['[INFO] Server listening on :8080', '<span class="terminal-comment">[INFO]</span> Server listening on :8080'],
            ['[INFO] Model ready to serve', '<span class="terminal-comment">[INFO]</span> Model ready to serve'],
        ],
        [
            ['$ git commit -m "fix: plz work"', '<span class="terminal-prompt">$</span> <span class="terminal-command">git commit</span> -m <span class="terminal-string">"fix: plz work"</span>'],
            ['[main 2c4d6e8] fix: plz work', '<span class="terminal-comment">[main 2c4d6e8]</span> fix: plz work'],
            ['$ npm run test', '<span class="terminal-prompt">$</span> <span class="terminal-command">npm run</span> test'],
            ['PASS  src/engine.test.ts', '<span class="terminal-string">PASS</span>  src/engine.test.ts'],
            ['PASS  src/model.test.ts', '<span class="terminal-string">PASS</span>  src/model.test.ts'],
            ['✓ All tests passed (42 total)', '<span class="terminal-string">✓ All tests passed (42 total)</span>'],
        ],
        [
            ['$ docker build -t airml:latest .', '<span class="terminal-prompt">$</span> <span class="terminal-command">docker build</span> -t airml:latest .'],
            ['Step 1/8 : FROM rust:alpine', '<span class="terminal-comment">Step 1/8</span> : FROM rust:alpine'],
            ['Step 5/8 : RUN cargo build', '<span class="terminal-comment">Step 5/8</span> : RUN <span class="terminal-command">cargo build</span>'],
            ['Successfully built a3f2c1d9e8b7', '<span class="terminal-string">Successfully built</span> a3f2c1d9e8b7'],
            ['$ docker push registry/airml', '<span class="terminal-prompt">$</span> <span class="terminal-command">docker push</span> registry/airml'],
            ['✓ Pushed to registry', '<span class="terminal-string">✓ Pushed to registry</span>'],
        ],
        [
            ['$ git commit -m "fix: cant fix it"', '<span class="terminal-prompt">$</span> <span class="terminal-command">git commit</span> -m <span class="terminal-string">"fix: cant fix it"</span>'],
            ['[main 9a8b7c6] fix: cant fix it', '<span class="terminal-comment">[main 9a8b7c6]</span> fix: cant fix it'],
            ['$ git commit -m "plz call khope"', '<span class="terminal-prompt">$</span> <span class="terminal-command">git commit</span> -m <span class="terminal-string">"plz call khope"</span>'],
            ['[main 5d4e3f2] plz call khope', '<span class="terminal-comment">[main 5d4e3f2]</span> plz call khope'],
            ['$ git push origin main', '<span class="terminal-prompt">$</span> <span class="terminal-command">git push</span> origin main'],
            ['✓ Finally it works!', '<span class="terminal-string">✓ Finally it works!</span>'],
        ],
    ];

    const terminals = document.querySelectorAll('.terminal-container');

    terminals.forEach((terminal, index) => {
        const snippetIndex = index % codeSnippets.length;
        const snippet = codeSnippets[snippetIndex];
        let currentLine = 0;
        let lines = [];
        const maxLines = 5;
        let isTyping = false;

        function typeLine(lineEl, plainText, htmlText, callback) {
            let charIndex = 0;
            isTyping = true;

            function typeChar() {
                if (charIndex < plainText.length) {
                    lineEl.textContent += plainText[charIndex];
                    charIndex++;
                    setTimeout(typeChar, 25 + Math.random() * 35);
                } else {
                    lineEl.innerHTML = htmlText;
                    isTyping = false;
                    if (callback) callback();
                }
            }
            typeChar();
        }

        function addLine() {
            if (isTyping) return;

            const [plainText, htmlText] = snippet[currentLine % snippet.length];
            const lineEl = document.createElement('div');
            lineEl.className = 'terminal-line';

            if (lines.length >= maxLines) {
                const oldLine = lines.shift();
                oldLine.classList.add('fade-out');
                setTimeout(() => oldLine.remove(), 300);
            }

            terminal.appendChild(lineEl);
            lines.push(lineEl);
            currentLine++;

            typeLine(lineEl, plainText, htmlText);
        }

        // Initial delay based on terminal position
        setTimeout(() => {
            addLine();
            setInterval(addLine, 2000 + index * 400);
        }, index * 500);
    });
}

// Skip intro and show main content directly
(function() {
    const overlay = document.getElementById('intro-overlay');
    const main = document.querySelector('main');

    if (overlay) overlay.classList.add('hidden');
    if (main) {
        main.classList.add('visible');
        main.classList.add('typing-started');
    }
    initFloatingParticles();
    loadCraftImages();
    initTypingEffect();
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

        // If typing animation is in progress, cancel it and show everything immediately
        if (typingState) {
            typingState.cancelAndFinish(lang);
        }

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

    // Replay intro button
    const replayBtn = document.getElementById('replay-intro');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            sessionStorage.removeItem('intro-seen');
            location.reload();
        });
    }

    // Initialize effect toggle
    initEffectToggle();

    // Carousel toggle
    const carouselBtn = document.getElementById('btn-carousel');
    const craftsSection = document.querySelector('.crafts');

    if (carouselBtn && craftsSection) {
        // Load saved preference (default: carousel on)
        const savedCarousel = localStorage.getItem('carousel-enabled');
        const carouselEnabled = savedCarousel === null ? true : savedCarousel === 'true';

        if (!carouselEnabled) {
            craftsSection.classList.add('grid-mode');
            carouselBtn.classList.remove('active');
        }

        carouselBtn.addEventListener('click', () => {
            const isCarousel = !craftsSection.classList.contains('grid-mode');
            if (isCarousel) {
                craftsSection.classList.add('grid-mode');
                carouselBtn.classList.remove('active');
                localStorage.setItem('carousel-enabled', 'false');
            } else {
                craftsSection.classList.remove('grid-mode');
                carouselBtn.classList.add('active');
                localStorage.setItem('carousel-enabled', 'true');
            }
        });
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
