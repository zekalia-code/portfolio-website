(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Year
  $('#year').textContent = new Date().getFullYear();

  // Loader
  const loader = $('#loader');
  const loaderPercent = $('#loaderPercent');
  const loaderBar = $('#loaderBar');
  let progress = 0;
  const loaderTimer = setInterval(() => {
    progress += Math.floor(Math.random() * 10) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loaderTimer);
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => loader.remove(), 650);
        startIntro();
      }, 250);
    }
    loaderPercent.textContent = `${progress}%`;
    loaderBar.style.width = `${progress}%`;
  }, 55);

  // Navigation
  const navbar = $('#navbar');
  const menuToggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  const setMenu = (open) => {
    mobileMenu.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  };
  menuToggle.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 30), { passive: true });

  // Custom cursor + magnetic interactions on desktop
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  let mouseX = innerWidth / 2, mouseY = innerHeight / 2, ringX = mouseX, ringY = mouseY;
  if (matchMedia('(pointer:fine)').matches && !reduceMotion) {
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; dot.style.left = `${mouseX}px`; dot.style.top = `${mouseY}px`; }, { passive: true });
    const cursorLoop = () => {
      ringX += (mouseX - ringX) * .14;
      ringY += (mouseY - ringY) * .14;
      ring.style.left = `${ringX}px`; ring.style.top = `${ringY}px`;
      requestAnimationFrame(cursorLoop);
    };
    cursorLoop();
    $$('a,button,.magnetic-card').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('active'));
      el.addEventListener('mouseleave', () => { ring.classList.remove('active'); el.style.transform = ''; });
    });
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * .16;
        const y = (e.clientY - (r.top + r.height / 2)) * .16;
        el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
    $$('.magnetic-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(700px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  // Three.js hero
  function initThree() {
    const canvas = $('#heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    let scene, camera, renderer, core, inner, ring1, ring2, particles;
    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 100);
      camera.position.set(0, 0, 7);
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(innerWidth, innerHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.0, 3),
        new THREE.MeshBasicMaterial({ color: 0x9b6cff, wireframe: true, transparent: true, opacity: .38 })
      );
      inner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.35, 2),
        new THREE.MeshBasicMaterial({ color: 0x38d9ff, wireframe: true, transparent: true, opacity: .18 })
      );
      ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(2.9, .018, 8, 120),
        new THREE.MeshBasicMaterial({ color: 0x38d9ff, transparent: true, opacity: .4 })
      );
      ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(3.25, .012, 8, 120),
        new THREE.MeshBasicMaterial({ color: 0x9b6cff, transparent: true, opacity: .3 })
      );
      ring1.rotation.x = Math.PI / 2.6;
      ring2.rotation.y = Math.PI / 2.8;
      scene.add(core, inner, ring1, ring2);

      const count = innerWidth < 700 ? 350 : 750;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - .5) * 18;
        pos[i * 3 + 1] = (Math.random() - .5) * 12;
        pos[i * 3 + 2] = (Math.random() - .5) * 10;
      }
      const pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      particles = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x9b6cff, size: .022, transparent: true, opacity: .48 }));
      scene.add(particles);

      let tx = 0, ty = 0, cx = 0, cy = 0;
      window.addEventListener('mousemove', e => {
        tx = (e.clientX / innerWidth - .5) * 2;
        ty = (e.clientY / innerHeight - .5) * 2;
      }, { passive: true });

      const clock = new THREE.Clock();
      const animate = () => {
        const t = clock.getElapsedTime();
        cx += (tx - cx) * .025; cy += (ty - cy) * .025;
        core.rotation.x = t * .12 + cy * .18;
        core.rotation.y = t * .16 + cx * .22;
        inner.rotation.x = -t * .10 - cy * .12;
        inner.rotation.y = -t * .15 - cx * .15;
        ring1.rotation.z = t * .08 + cx * .15;
        ring2.rotation.x = t * .06 + cy * .15;
        particles.rotation.y = t * .012;
        camera.position.x += (cx * .28 - camera.position.x) * .025;
        camera.position.y += (-cy * .18 - camera.position.y) * .025;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();

      const resize = () => {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight, false);
      };
      addEventListener('resize', resize, { passive: true });
    } catch (err) {
      console.warn('3D animation disabled:', err);
    }
  }
  initThree();

  // Intro and scroll reveal. GSAP is optional.
  function startIntro() {
    if (reduceMotion) return;
    if (typeof gsap !== 'undefined') {
      gsap.from('.hero-title .reveal-line', { yPercent: 105, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out' });
      gsap.from('.hero-copy .reveal-up', { y: 25, opacity: 0, duration: .8, stagger: .08, delay: .25, ease: 'power3.out' });
      gsap.from('.hero-hud', { x: 25, opacity: 0, duration: 1, delay: .7, ease: 'power3.out' });
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        $$('.reveal-up').forEach(el => {
          if (el.closest('.hero')) return;
          gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
        });
        gsap.to('.hero-copy', { y: 100, opacity: .25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('#heroCanvas', { scale: 1.13, opacity: .4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      }
    } else {
      $$('.reveal-up').forEach(el => el.style.opacity = '1');
    }
  }

  // Formspree contact form.
  const form = $('#contactForm');
  const status = $('#formStatus');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const endpoint = form.getAttribute('action') || '';
    if (endpoint.includes('YOUR_FORM_ID')) {
      status.textContent = 'Add your Formspree form ID in index.html first.';
      status.className = 'form-status error';
      return;
    }
    status.textContent = 'Sending…'; status.className = 'form-status';
    const button = $('button[type="submit"]', form); button.disabled = true;
    try {
      const response = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Request failed');
      form.reset(); status.textContent = 'Message sent successfully. Thank you!'; status.className = 'form-status success';
    } catch (err) {
      status.textContent = 'Something went wrong. Please try again or email me directly.'; status.className = 'form-status error';
    } finally { button.disabled = false; }
  });
})();
