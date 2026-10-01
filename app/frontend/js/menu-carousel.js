(() => {
    function initialize(root) {
    const track = root.querySelector('.carousel-track');
    const cards = [...track.querySelectorAll('.subject-card')];
    const prev = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');
    const dots = root.querySelector('.carousel-dots');
    const status = root.querySelector('.carousel-status');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = 0;
    let frame = 0;
    let drag = null;
    let dragged = false;
    const buttons = cards.map((card, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'carousel-dot';
        button.setAttribute('aria-label', `Mostrar ${card.querySelector('h2').textContent}`);
        button.setAttribute('aria-controls', track.id);
        button.addEventListener('click', () => go(index));
        dots.append(button);
        card.draggable = false;
        return button;
    });
    function mark(index) {
        active = index;
        cards.forEach((card, i) => card.classList.toggle('is-active', i === active));
        buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
        prev.disabled = active === 0;
        next.disabled = active === cards.length - 1;
        status.textContent = `${active + 1} de ${cards.length}: ${cards[active].querySelector('h2').textContent}`;
        // Opt-in para assuntos com descrições de comprimentos diferentes.
        // A altura natural do card ativo mantém o acesso visível no celular.
        if (root.hasAttribute('data-fit-active') && root.getClientRects().length) {
            const style = getComputedStyle(track);
            const top = parseFloat(style.paddingTop);
            const height = cards[active].offsetHeight;
            track.style.height = `${top + height + parseFloat(style.paddingBottom)}px`;
            root.style.setProperty('--carousel-arrow-top', `${top + height / 2 - 22}px`);
        }
    }
    function go(index, instant = false) {
        if (!root.getClientRects().length) return;
        const i = Math.max(0, Math.min(cards.length - 1, index));
        // offsetWidth independe da escala visual aplicada ao card.
        const left = cards[i].offsetLeft + cards[i].offsetWidth / 2 - track.clientWidth / 2;
        mark(i);
        track.scrollTo({ left, behavior: instant || reducedMotion.matches ? 'instant' : 'smooth' });
    }
    function sync() {
        frame = 0;
        if (!root.getClientRects().length) return;
        const center = track.scrollLeft + track.clientWidth / 2;
        let closest = 0;
        cards.forEach((card, i) => {
            if (Math.abs(card.offsetLeft + card.offsetWidth / 2 - center) < Math.abs(cards[closest].offsetLeft + cards[closest].offsetWidth / 2 - center)) closest = i;
        });
        if (closest !== active) mark(closest);
    }
    track.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(sync); }, { passive: true });
    prev.addEventListener('click', () => go(active - 1));
    next.addEventListener('click', () => go(active + 1));
    track.addEventListener('keydown', (event) => {
        const targets = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: cards.length - 1 };
        if (!(event.key in targets)) return;
        event.preventDefault();
        const index = Math.max(0, Math.min(cards.length - 1, targets[event.key]));
        cards[index].focus({ preventScroll: true });
        go(index);
    });
    track.addEventListener('focusin', (event) => {
        const index = cards.indexOf(event.target.closest('.subject-card'));
        if (index >= 0 && !drag) go(index);
    });
    // Touch usa a rolagem nativa; o mouse recebe arraste sem seguir o link ao soltar.
    track.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        dragged = false;
        drag = { id: event.pointerId, x: event.clientX, scroll: track.scrollLeft };
    });
    track.addEventListener('pointermove', (event) => {
        if (!drag) return;
        const distance = event.clientX - drag.x;
        if (Math.abs(distance) > 6) {
            dragged = true;
            track.classList.add('is-dragging');
            track.setPointerCapture(drag.id);
        }
        if (dragged) { event.preventDefault(); track.scrollLeft = drag.scroll - distance; }
    });
    function endDrag() {
        if (!drag) return;
        if (track.hasPointerCapture(drag.id)) track.releasePointerCapture(drag.id);
        drag = null;
        track.classList.remove('is-dragging');
        if (dragged) { sync(); go(active); }
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('click', (event) => {
        if (dragged) { event.preventDefault(); event.stopPropagation(); dragged = false; }
    }, true);
    new ResizeObserver(() => go(active, true)).observe(track);
    root.querySelector('.carousel-controls').hidden = false;
    mark(0);
    return () => go(active, true);
    }
    const refresh = [...document.querySelectorAll('.activity-carousel')].map(initialize);
    function followHash() {
        const title = document.getElementById('menu-title');
        if (title) {
            const games = location.hash === '#jogos';
            document.getElementById('jogos').hidden = !games;
            document.getElementById('atividades').hidden = games;
            title.textContent = games ? 'Jogos educativos' : 'Aplicações matemáticas';
            document.getElementById('menu-description').textContent = games ? 'Escolha um jogo e desafie seu raciocínio.' : 'Entenda o conceito, veja um exemplo e experimente as funções.';
            document.title = `∑quacionei | ${games ? 'Jogos' : 'Aplicações Matemáticas'}`;
            if (location.hash === '#desafio') location.replace('/static/desafio-relampago.html');
        }
        requestAnimationFrame(() => refresh.forEach(update => update()));
    }
    window.addEventListener('hashchange', followHash);
    followHash();
})();
