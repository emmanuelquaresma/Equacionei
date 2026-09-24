/* Fonte única dos links de primeiro nível. O HTML existente é o fallback sem JS. */
(() => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const gameTitle = document.body.dataset.gameTitle;
    if (gameTitle) {
        const context = document.createElement('span');
        context.className = 'game-header-context';
        context.textContent = gameTitle;
        header.querySelector('.site-brand__identity').append(context);
        header.querySelector('.site-brand').setAttribute('aria-label', `Equacionei — ${gameTitle} — início`);
        const measureHeader = () => document.body.style.setProperty('--game-header-height', `${header.offsetHeight}px`);
        measureHeader();
        if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measureHeader).observe(header);
        window.addEventListener('resize', measureHeader);
    }
    const nav = header.querySelector('.site-nav');
    const toggle = header.querySelector('.site-toggle');
    const entries = [
        ['home', 'Início', '/'],
        ['activities', 'Aplicações Matemáticas', '/menu#atividades'],
        ['games', 'Jogos', '/menu#jogos'],
        ['data', 'Data Science', '/static/data-science.html'],
        ['development', 'Desenvolvimento', '/static/desenvolvimento.html'],
        ['about', 'Sobre', '/static/sobre.html']
    ];
    nav.replaceChildren(...entries.map(([area, text, href]) => {
        const link = document.createElement('a');
        link.href = href; link.textContent = text; link.dataset.area = area;
        return link;
    }));
    header.classList.add('is-enhanced');
    toggle.hidden = false;
    const close = () => {
        header.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu de navegação');
    };
    toggle.addEventListener('click', () => {
        const open = header.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    });
    header.addEventListener('keydown', event => {
        if (event.key === 'Escape' && header.classList.contains('is-open')) { close(); toggle.focus(); }
    });
    header.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    function markActive() {
        const path = location.pathname, hash = location.hash;
        let active;
        if (path.includes('/data-science/') || (path.endsWith('/python.html') && new URLSearchParams(location.search).get('trail') === 'fundamentos')) active = 'data';
        else if (/\/(desenvolvimento|python)\.html$/.test(path)) active = 'development';
        else if (path.endsWith('/data-science.html')) active = 'data';
        else if (path.endsWith('/sobre.html')) active = 'about';
        else if (path === '/menu' || path.endsWith('/pages/menu.html')) active = hash === '#jogos' ? 'games' : 'activities';
        else if (/\/(primeiro|segundo)-grau\.html$/.test(path)) active = 'activities';
        else if (/\/(dama|xadrez|queda-matematica|desafio-relampago|racha-cuca|labirinto-matematico|jogo-dos-pares)\.html$/.test(path)) active = 'games';
        else if (path === '/' || path.endsWith('/index.html')) active = 'home';
        nav.querySelectorAll('a').forEach(link => {
            if (link.dataset.area === active) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    }
    window.addEventListener('hashchange', markActive);
    const mobile = matchMedia('(max-width: 1200px)');
    mobile.addEventListener('change', close);
    markActive();
})();
