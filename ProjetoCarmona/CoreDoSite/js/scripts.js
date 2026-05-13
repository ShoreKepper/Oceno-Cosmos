'use strict';

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
const $ = id => document.getElementById(id);

function mostrarErro(id, msg) {
    const el = $(id);
    if (el) { el.textContent = msg; el.style.color = msg ? '#ff4d6d' : '#00e5a0'; }
}

function limparErros() {
    document.querySelectorAll('.error-msg').forEach(e => e.textContent = '');
}

// ═══════════════════════════════════════════════════
// MENU MOBILE + CANVAS INIT + CARDS ANIMADOS
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

    // Menu mobile
    const btn   = $('menu-btn');
    const links = $('nav-links');
    if (btn && links) {
        btn.addEventListener('click', () => {
            const open = links.classList.toggle('open');
            btn.setAttribute('aria-expanded', open);
        });
        links.querySelectorAll('a').forEach(a =>
            a.addEventListener('click', () => {
                links.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            })
        );
    }

    // Animação de entrada dos cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
        observer.observe(card);
    });

    // Inicializa canvas da galeria e habilita desenho livre
    const canvas = $('meuCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let drawing = false;

        // Já desenha ao carregar a página
        desenharFormas();

        // Mouse
        canvas.addEventListener('mousedown', e => {
            drawing = true;
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        });

        canvas.addEventListener('mousemove', e => {
            if (!drawing) return;
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.strokeStyle = $('canvasCor')?.value || '#00d4ff';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        });

        canvas.addEventListener('mouseup',    () => drawing = false);
        canvas.addEventListener('mouseleave', () => drawing = false);

        // Touch (celular)
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            const t = e.touches[0];
            const r = canvas.getBoundingClientRect();
            const scaleX = canvas.width  / r.width;
            const scaleY = canvas.height / r.height;
            drawing = true;
            ctx.beginPath();
            ctx.moveTo((t.clientX - r.left) * scaleX, (t.clientY - r.top) * scaleY);
        }, { passive: false });

        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            if (!drawing) return;
            const t = e.touches[0];
            const r = canvas.getBoundingClientRect();
            const scaleX = canvas.width  / r.width;
            const scaleY = canvas.height / r.height;
            ctx.lineTo((t.clientX - r.left) * scaleX, (t.clientY - r.top) * scaleY);
            ctx.strokeStyle = $('canvasCor')?.value || '#00d4ff';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }, { passive: false });

        canvas.addEventListener('touchend', () => drawing = false);
    }
});

// ═══════════════════════════════════════════════════
// CANVAS DE ESTRELAS — HERO (index.html)
// ═══════════════════════════════════════════════════
(function initStarCanvas() {
    const canvas = $('starCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];

    function resize() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        buildStars();
    }

    function buildStars() {
        stars = [];
        const count = Math.floor((canvas.width * canvas.height) / 4000);
        for (let i = 0; i < count; i++) {
            stars.push({
                x:     Math.random() * canvas.width,
                y:     Math.random() * canvas.height,
                r:     Math.random() * 1.8 + 0.3,
                speed: Math.random() * 0.005 + 0.002,
                phase: Math.random() * Math.PI * 2,
                color: Math.random() > 0.85
                            ? 'rgba(0,212,255,'
                            : Math.random() > 0.5
                            ? 'rgba(255,251,230,'
                            : 'rgba(200,180,255,'
            });
        }
    }

    function draw(t) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => {
            const a = (Math.sin(t * s.speed + s.phase) + 1) / 2 * 0.9 + 0.1;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = s.color + a.toFixed(2) + ')';
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(draw);
})();

// ═══════════════════════════════════════════════════
// VALIDAÇÃO DO FORMULÁRIO
// ═══════════════════════════════════════════════════
const form = $('mainForm');
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        limparErros();
        let valido = true;

        const nome = $('nome').value.trim();
        if (!nome) {
            mostrarErro('erro-nome', 'Nome é obrigatório.'); valido = false;
        } else if (nome.length < 3) {
            mostrarErro('erro-nome', 'Mínimo 3 caracteres.'); valido = false;
        }

        const email = $('email').value.trim();
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            mostrarErro('erro-email', 'E-mail é obrigatório.'); valido = false;
        } else if (!emailRe.test(email)) {
            mostrarErro('erro-email', 'E-mail inválido.'); valido = false;
        }

        const tel = $('tel').value.trim();
        const telRe = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        if (tel && !telRe.test(tel)) {
            mostrarErro('erro-tel', 'Formato: (11) 99999-9999'); valido = false;
        }

        const nasc = $('nascimento').value;
        if (!nasc) {
            mostrarErro('erro-nascimento', 'Data de nascimento obrigatória.'); valido = false;
        } else {
            const anos = (Date.now() - new Date(nasc)) / (365.25 * 24 * 3600 * 1000);
            if (anos < 16) {
                mostrarErro('erro-nascimento', 'Idade mínima: 16 anos.'); valido = false;
            }
        }

        const senha = $('senha').value;
        const conf  = $('confirmSenha').value;
        if (!senha || senha.length < 8) {
            mostrarErro('erro-senha', 'Mínimo 8 caracteres.'); valido = false;
        }
        if (conf !== senha) {
            mostrarErro('erro-confirmSenha', 'Senhas não coincidem.'); valido = false;
        }

        const nivel = document.querySelector('input[name="nivel"]:checked');
        if (!nivel) {
            mostrarErro('erro-nivel', 'Selecione seu nível de mergulho.'); valido = false;
        }

        const bio = $('bio').value.trim();
        if (!bio || bio.length < 20) {
            mostrarErro('erro-bio', 'Descreva-se com pelo menos 20 caracteres.'); valido = false;
        }

        if (!$('aceite').checked) {
            mostrarErro('erro-aceite', 'Você deve aceitar os termos da expedição.'); valido = false;
        }

        if (valido) {
            const sucesso = $('successMsg');
            if (sucesso) { sucesso.style.display = 'block'; }
            form.reset();
            sucesso.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { sucesso.style.display = 'none'; }, 6000);
        }
    });

    ['nome','email','tel','nascimento','senha','confirmSenha'].forEach(id => {
        const el = $(id);
        if (el) el.addEventListener('input', () => mostrarErro(`erro-${id}`, ''));
    });
}

// ═══════════════════════════════════════════════════
// CANVAS — FUNÇÕES DE DESENHO TEMÁTICO
// ═══════════════════════════════════════════════════
function getCor() { return ($('canvasCor') || { value: '#00d4ff' }).value; }

function desenharFormas() {
    const c = $('meuCanvas'); if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    const cor = getCor();

    ctx.fillStyle = '#020b18';
    ctx.fillRect(0, 0, c.width, c.height);

    for (let i = 0; i < 80; i++) {
        ctx.beginPath();
        ctx.arc(Math.random()*c.width, Math.random()*c.height, Math.random()*1.5+.3, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,251,230,${Math.random()*0.8+0.2})`;
        ctx.fill();
    }

    const grad = ctx.createRadialGradient(200, 150, 10, 200, 150, 90);
    grad.addColorStop(0, '#7c3aed');
    grad.addColorStop(0.6, '#041529');
    grad.addColorStop(1, '#020b18');
    ctx.beginPath();
    ctx.arc(200, 150, 90, 0, Math.PI*2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.save();
    ctx.translate(200, 150);
    ctx.scale(1, 0.28);
    ctx.beginPath();
    ctx.ellipse(0, 0, 130, 130, 0, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(0,212,255,0.6)';
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.restore();

    const waveGrad = ctx.createLinearGradient(0, 300, 0, 400);
    waveGrad.addColorStop(0, 'rgba(0,212,255,0.5)');
    waveGrad.addColorStop(1, 'rgba(0,180,204,0.2)');
    ctx.beginPath();
    ctx.moveTo(0, 340);
    for (let x = 0; x <= c.width; x += 5) {
        ctx.lineTo(x, 340 + Math.sin(x * 0.02) * 20);
    }
    ctx.lineTo(c.width, c.height);
    ctx.lineTo(0, c.height);
    ctx.closePath();
    ctx.fillStyle = waveGrad;
    ctx.fill();

    ctx.fillStyle = cor;
    ctx.font = 'bold 22px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Oceano & Cosmos', c.width / 2, c.height - 20);
}

function desenharGradiente() {
    const c = $('meuCanvas'); if (!c) return;
    const ctx = c.getContext('2d');

    const g = ctx.createLinearGradient(0, 0, c.width, c.height);
    g.addColorStop(0,   '#020b18');
    g.addColorStop(0.3, '#041529');
    g.addColorStop(0.6, 'rgba(0,212,255,0.4)');
    g.addColorStop(0.8, 'rgba(124,58,237,0.5)');
    g.addColorStop(1,   '#020b18');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);

    for (let i = 0; i < 6; i++) {
        const x = Math.random() * c.width;
        const y = 250 + Math.random() * 120;
        const r = 20 + Math.random() * 50;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
        glow.addColorStop(0, 'rgba(0,229,160,0.6)');
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2);
        ctx.fillStyle = glow;
        ctx.fill();
    }

    for (let i = 0; i < 100; i++) {
        ctx.beginPath();
        ctx.arc(Math.random()*c.width, Math.random()*200, Math.random()*1.5+.2, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,251,230,${Math.random()})`;
        ctx.fill();
    }

    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 26px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 20;
    ctx.fillText('Aurora Abissal', c.width / 2, c.height / 2);
    ctx.shadowBlur = 0;
}

function limparCanvas() {
    const c = $('meuCanvas'); if (!c) return;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#020b18';
    ctx.fillRect(0, 0, c.width, c.height);
}

// ═══════════════════════════════════════════════════
// GEOLOCALIZAÇÃO
// ═══════════════════════════════════════════════════
function obterLocalizacao() {
    const el = $('geo-resultado'); if (!el) return;
    if (!navigator.geolocation) {
        el.innerHTML = '🚫 Geolocalização não suportada neste browser.'; return;
    }
    el.innerHTML = '🔭 Calculando coordenadas...';
    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
            el.innerHTML =
                `🌊 <strong>Latitude:</strong> ${lat.toFixed(5)}<br>
                 ⭐ <strong>Longitude:</strong> ${lng.toFixed(5)}<br>
                 🎯 <strong>Precisão:</strong> ±${Math.round(acc)}m`;
        },
        err => { el.innerHTML = `❌ Erro: ${err.message}`; }
    );
}

// ═══════════════════════════════════════════════════
// WEB STORAGE
// ═══════════════════════════════════════════════════
function salvarStorage() {
    const v = ($('storageInput') || { value: '' }).value.trim();
    if (!v) { alert('Digite uma observação para salvar!'); return; }
    localStorage.setItem('oceano_astros_nota', v);
    const el = $('storage-resultado');
    if (el) el.innerHTML = '✅ Observação salva no localStorage!';
}

function carregarStorage() {
    const v = localStorage.getItem('oceano_astros_nota');
    const el = $('storage-resultado');
    if (el) el.innerHTML = v
        ? `📖 Carregado: "<em>${v}</em>"`
        : '🌑 Nenhuma observação salva ainda.';
}

// ═══════════════════════════════════════════════════
// DRAG & DROP
// ═══════════════════════════════════════════════════
const dragSrc = $('drag-source');
const dragTgt = $('drop-target');
if (dragSrc && dragTgt) {
    dragSrc.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', dragSrc.innerHTML);
        e.dataTransfer.effectAllowed = 'move';
        dragSrc.style.opacity = '.4';
    });
    dragSrc.addEventListener('dragend', () => dragSrc.style.opacity = '1');

    dragTgt.addEventListener('dragover', e => {
        e.preventDefault();
        dragTgt.style.background = 'rgba(0,212,255,.1)';
        dragTgt.style.borderColor = '#00e5a0';
    });
    dragTgt.addEventListener('dragleave', () => {
        dragTgt.style.background = '';
        dragTgt.style.borderColor = 'var(--clr-primary)';
    });
    dragTgt.addEventListener('drop', e => {
        e.preventDefault();
        dragTgt.innerHTML = e.dataTransfer.getData('text/plain');
        dragTgt.style.background = 'rgba(0,229,160,.1)';
        dragTgt.style.borderColor = 'var(--clr-success)';
        dragTgt.style.borderStyle = 'solid';
        dragTgt.style.color = 'var(--clr-light)';
    });
}

// ═══════════════════════════════════════════════════
// CLIPBOARD API
// ═══════════════════════════════════════════════════
async function copiarTexto() {
    const texto = ($('clipboardText') || { textContent: '' }).textContent.trim();
    const msg   = $('clipboard-msg');
    try {
        await navigator.clipboard.writeText(texto);
        if (msg) msg.innerHTML = '✅ Copiado para a área de transferência!';
    } catch {
        if (msg) msg.innerHTML = '❌ Erro ao copiar (permissão negada).';
    }
}
