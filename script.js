const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const html = document.documentElement;

const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');

// Theme Logic
function setTheme(theme) {
    if (theme === 'light') {
        html.setAttribute('data-theme', 'light');
        if (moonIcon) moonIcon.style.display = 'none';
        if (sunIcon) sunIcon.style.display = 'block';
        localStorage.setItem('theme', 'light');
    } else {
        html.removeAttribute('data-theme');
        if (moonIcon) moonIcon.style.display = 'block';
        if (sunIcon) sunIcon.style.display = 'none';
        localStorage.setItem('theme', 'dark');
    }
}

themeToggle.addEventListener('click', () => {
    if (html.getAttribute('data-theme') === 'light') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
});

// Language Logic
function setLanguage(lang) {
    // 改用 data-lang，避免觸發瀏覽器原生對 lang 屬性的字體替換機制
    html.setAttribute('data-lang', lang);
    if (lang === 'en') {
        langToggle.textContent = '中';
        document.title = "Alinggo Lee - Course Portal";
    } else {
        langToggle.textContent = 'EN';
        document.title = "Alinggo Lee - 課程入口";
    }
    localStorage.setItem('lang', lang);
    // 重新計算標題大小，以適應不同語言的字體縮放
    setTimeout(adjustCardTitleSizes, 10);
}

langToggle.addEventListener('click', () => {
    if (html.getAttribute('data-lang') === 'zh-TW') {
        setLanguage('en');
    } else {
        setLanguage('zh-TW');
    }
});

// Initialization
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    // Optional: check system preference
    setTheme('light');
}

const savedLang = localStorage.getItem('lang');
if (savedLang) {
    setLanguage(savedLang);
}

// Fetch Config and Render Cards
async function loadSites() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) throw new Error('Failed to load config.json');
        const data = await response.json();
        
        // Apply Settings
        if (data.settings) {
            if (data.settings.cardMinWidth) {
                document.documentElement.style.setProperty('--card-min-width', data.settings.cardMinWidth);
            }
            if (data.settings.cardMinHeight) {
                document.documentElement.style.setProperty('--card-min-height', data.settings.cardMinHeight);
            }
        }
        
        renderCards(data.sites);
        if (data.footer) {
            renderFooter(data.footer);
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// Generate a random high-quality color pair
function getRandomColorPair() {
    const hue1 = Math.floor(Math.random() * 360);
    // Analogous/adjacent hue for the second color (e.g. 30-90 degrees away)
    const hue2 = (hue1 + 30 + Math.floor(Math.random() * 60)) % 360;
    
    // Saturation and Lightness optimized for vibrant aesthetic
    const color1 = `hsl(${hue1}, 85%, 60%)`;
    const color2 = `hsl(${hue2}, 85%, 60%)`;
    const glow = `hsla(${hue1}, 85%, 60%, 0.4)`;
    const glowLight = `hsla(${hue1}, 85%, 60%, 0.2)`;
    
    return { color1, color2, glow, glowLight };
}

function renderCards(sites) {
    const cardGrid = document.getElementById('card-grid');
    if (!cardGrid) return;
    
    cardGrid.innerHTML = '';
    
    sites.forEach(site => {
        const theme = getRandomColorPair();
        const a = document.createElement('a');
        a.href = site.url;
        a.className = 'card';
        // Set dynamic CSS variables for theme colors
        a.style.setProperty('--color1', theme.color1);
        a.style.setProperty('--color2', theme.color2);
        a.style.setProperty('--glow', theme.glow);
        a.style.setProperty('--glow-light', theme.glowLight);
        
        a.innerHTML = `
            <div class="icon-wrapper">
                ${site.iconSvg}
            </div>
            <h2 class="card-title bilingual">
                <span class="lang-zh">${site.title.zh}</span>
                <span class="lang-en">${site.title.en}</span>
            </h2>
            <span class="btn-primary">
                <span class="bilingual">
                    <span class="lang-zh">進入網站</span>
                    <span class="lang-en">Enter Site</span>
                </span>
                <span class="arrow">→</span>
            </span>
        `;
        
        cardGrid.appendChild(a);
    });
    
    // Adjust title sizes after rendering
    setTimeout(adjustCardTitleSizes, 0);
}

function adjustCardTitleSizes() {
    const titles = document.querySelectorAll('.card-title.bilingual');
    titles.forEach(title => {
        // Reset dynamic scale
        title.style.setProperty('--title-fit-scale', '1');
        title.style.whiteSpace = 'nowrap';
        title.style.width = '100%'; // Constrain to parent container width
        
        let scale = 1;
        // Decrease scale if content overflows
        while (title.scrollWidth > title.clientWidth && scale > 0.4) {
            scale -= 0.02;
            title.style.setProperty('--title-fit-scale', scale);
        }
    });
}

// Re-adjust on window resize
window.addEventListener('resize', () => {
    adjustCardTitleSizes();
});

function renderFooter(footerItems) {
    const footer = document.getElementById('footer');
    if (!footer) return;
    
    footer.innerHTML = '';
    
    footerItems.forEach(item => {
        const p = document.createElement('p');
        p.className = 'footer-item';
        p.innerHTML = `
            <span class="label">
                <span class="lang-zh">${item.labelZh}</span>
                <span class="lang-en">${item.labelEn}</span>
            </span>
            <span class="divider">/</span>
            <span class="value">
                <span class="lang-zh">${item.valueZh}</span>
                <span class="lang-en">${item.valueEn}</span>
            </span>
        `;
        footer.appendChild(p);
    });
}

// Load config on init
loadSites();
