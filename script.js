(function () {
    'use strict';

    const DEFAULTS = {
        ca: 'CA — coming soon',
        x: '#',
        community: '#',
        buy: '#'
    };

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    function truncate(ca, head = 6, tail = 4) {
        if (!ca || ca.length <= head + tail + 3) return ca || '';
        return `${ca.slice(0, head)}…${ca.slice(-tail)}`;
    }

    function applyConfig(cfg) {
        const c = Object.assign({}, DEFAULTS, cfg || {});
        window.__PATIENCE_CA__ = c.ca;

        const navX = $('#nav-x');
        const navCom = $('#nav-community');
        const navBuy = $('#nav-buy');
        const footerBuy = $('#footer-buy');
        if (navX) navX.href = c.x || '#';
        if (navCom) navCom.href = c.community || '#';
        if (navBuy) navBuy.href = c.buy || '#';
        if (footerBuy) footerBuy.href = c.buy || '#';

        const caNav = $('#ca-nav');
        const caFooter = $('#ca-footer');
        if (caNav) caNav.textContent = truncate(c.ca);
        if (caFooter) caFooter.textContent = c.ca;
    }

    async function fetchConfig() {
        try {
            const r = await fetch('/api/config', { cache: 'no-store' });
            if (!r.ok) throw new Error('bad response');
            const data = await r.json();
            applyConfig(data);
        } catch {
            applyConfig({});
        }
    }

    /* ---------- toast ---------- */

    let toastTimer = null;
    function showToast(text = 'patience.') {
        let el = $('#toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'toast';
            el.className = 'toast';
            document.body.appendChild(el);
        }
        el.textContent = text;
        requestAnimationFrame(() => el.classList.add('is-visible'));
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('is-visible'), 1800);
    }

    /* ---------- CA copy ---------- */

    function bindCopyHandlers() {
        $$('[data-copy-ca]').forEach(node => {
            node.addEventListener('click', async (e) => {
                e.preventDefault();
                const ca = window.__PATIENCE_CA__;
                if (!ca || ca === DEFAULTS.ca) {
                    showToast('soon.');
                    return;
                }
                try {
                    await navigator.clipboard.writeText(ca);
                } catch {
                    const ta = document.createElement('textarea');
                    ta.value = ca;
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); } catch {}
                    document.body.removeChild(ta);
                }
                showToast('patience.');
            });
        });
    }

    /* ---------- scroll reveal ---------- */

    function bindReveal() {
        const targets = $$('[data-reveal], [data-reveal-stagger]');
        if (!('IntersectionObserver' in window)) {
            targets.forEach(t => t.classList.add('is-visible'));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
        targets.forEach(t => io.observe(t));
    }

    /* ---------- boot ---------- */

    document.addEventListener('DOMContentLoaded', () => {
        bindCopyHandlers();
        bindReveal();
        fetchConfig();
    });
})();
