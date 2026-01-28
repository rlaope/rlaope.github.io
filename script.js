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
            el.textContent = el.getAttribute(`data-${lang}`);
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
