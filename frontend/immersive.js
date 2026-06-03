/* 
   ResQLink Immersive Animation Suite v1.2 
   Global Motion & Interaction Layer
*/

// 1. Tactical Custom Cursor
function initCursor() {
    const cursor = document.createElement('div');
    cursor.id = 'tactical-cursor';
    cursor.style.cssText = `
        position: fixed; width: 12px; height: 12px; background: #af101a;
        border-radius: 50%; pointer-events: none; z-index: 10000;
        transition: transform 0.05s linear, opacity 0.3s ease;
        mix-blend-mode: normal; display: none;
    `;
    document.body.appendChild(cursor);

    const ring = document.createElement('div');
    ring.id = 'tactical-ring';
    ring.style.cssText = `
        position: fixed; width: 30px; height: 30px; border: 1.5px solid rgba(175, 16, 26, 0.4);
        border-radius: 50%; pointer-events: none; z-index: 9999;
        transition: transform 0.1s ease-out, opacity 0.3s ease; display: none;
    `;
    document.body.appendChild(ring);

    if (window.innerWidth > 1024) {
        cursor.style.display = 'block';
        ring.style.display = 'block';
    }

    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
        ring.style.transform = `translate(${e.clientX - 15}px, ${e.clientY - 15}px)`;
    });

    document.querySelectorAll('button, a, input, [role="button"], .premium-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(ring, { scale: 2, borderColor: '#af101a', duration: 0.3 });
            gsap.to(cursor, { scale: 0.5, opacity: 0.5, duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(ring, { scale: 1, borderColor: 'rgba(175, 16, 26, 0.4)', duration: 0.3 });
            gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3 });
        });
    });
}

// 2. Global Tactical Animations
function initGlobalAnimations() {
    // 2.1 Snappier Entry for Sections
    gsap.from('main > section, .premium-card, .login-card, .hero-content', {
        y: 20,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'all'
    });

    // 2.2 Nav Slide Down (Faster)
    gsap.from('header nav a, header .flex-1', {
        y: -15,
        opacity: 0,
        duration: 0.5,
        stagger: 0.03,
        ease: 'power2.out',
        delay: 0.1
    });

    // 2.3 Pulsing Status Indicators
    gsap.to('.animate-pulse, #gps-status, .online-dot', {
        scale: 1.05,
        opacity: 0.8,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: 'sine.inOut'
    });

    // 2.4 Button & Card Micro-interactions
    const interactive = document.querySelectorAll('.premium-card, .btn-primary, button:not(.sos-button), .conversation-item');
    interactive.forEach(el => {
        el.addEventListener('mousedown', () => gsap.to(el, { scale: 0.97, duration: 0.1 }));
        el.addEventListener('mouseup', () => gsap.to(el, { scale: 1.01, duration: 0.2, ease: 'back.out' }));
        el.addEventListener('mouseenter', () => {
            gsap.to(el, { 
                translateY: -3, 
                boxShadow: '0 15px 30px rgba(175, 16, 26, 0.08)', 
                duration: 0.3, 
                ease: 'power2.out' 
            });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(el, { 
                translateY: 0, 
                boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.02)', 
                scale: 1,
                duration: 0.3, 
                ease: 'power2.out' 
            });
        });
    });

    // 2.5 Magnetic Link Effect
    document.querySelectorAll('nav a, .text-primary').forEach(link => {
        link.addEventListener('mouseenter', () => gsap.to(link, { letterSpacing: '0.05em', duration: 0.3 }));
        link.addEventListener('mouseleave', () => gsap.to(link, { letterSpacing: 'normal', duration: 0.3 }));
    });
}

// 3. Three.js Subtle Context BG
function initThreeBG() {
    if (document.getElementById('three-bg-canvas')) return;
    const container = document.querySelector('.bg-3d-wrap');
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'three-bg-canvas';
    canvas.style.cssText = 'position: absolute; inset: 0; opacity: 0.1; pointer-events: none;';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 200; i++) {
        vertices.push(THREE.MathUtils.randFloatSpread(2000), THREE.MathUtils.randFloatSpread(2000), THREE.MathUtils.randFloatSpread(2000));
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0xaf101a, size: 3, transparent: true, opacity: 0.3 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    camera.position.z = 1000;

    function animate() {
        requestAnimationFrame(animate);
        points.rotation.y += 0.0002;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Execute
window.addEventListener('load', () => {
    initCursor();
    initThreeBG();
    if (typeof gsap !== 'undefined') {
        initGlobalAnimations();
    }
});
