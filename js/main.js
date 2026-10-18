// Joshua Anrico portfolio. Plain JavaScript, no dependencies.
// The theme is set earlier by the inline script in <head> so the page never flashes.
(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Theme toggle ----------
  var themeBtn = document.querySelector('.theme-btn');
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function labelThemeBtn() {
    if (!themeBtn) return;
    themeBtn.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  if (themeBtn) {
    labelThemeBtn();
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      labelThemeBtn();
    });
    // Follow the system if the visitor has not picked a theme
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', labelThemeBtn);
  }

  // ---------- Mobile menu ----------
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('open', open);
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !e.target.closest('.site-head')) setMenu(false);
    });
  }

  // ---------- Header border + back-to-top button ----------
  var head = document.querySelector('.site-head');
  var toTop = document.querySelector('.to-top');
  function onScroll() {
    var y = window.scrollY;
    if (head) head.classList.toggle('scrolled', y > 8);
    if (toTop) toTop.classList.toggle('show', y > 900);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  // ---------- Highlight the nav link for the section on screen ----------
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // ---------- Reveal blocks and draw illustrations once, on scroll ----------
  var revealEls = document.querySelectorAll('.reveal, .figure');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('in', 'in-view'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in', 'in-view');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // ---------- Galleries: arrows, dots and captions, only when a figure has 2+ slides ----------
  var arrowSvg = function (d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  };
  document.querySelectorAll('[data-gallery]').forEach(function (fig, g) {
    var track = fig.querySelector('.slides');
    var slides = track ? Array.prototype.slice.call(track.querySelectorAll('.slide')) : [];
    if (slides.length < 2) return;
    var caption = fig.querySelector('figcaption');
    var current = 0;

    track.setAttribute('role', 'region');
    track.setAttribute('aria-roledescription', 'carousel');
    track.setAttribute('aria-label', 'Screenshots');
    track.tabIndex = 0;

    var bar = document.createElement('div');
    bar.className = 'gallery-bar';
    var dots = document.createElement('div');
    dots.className = 'dots';
    slides.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show slide ' + (i + 1) + ' of ' + slides.length);
      b.addEventListener('click', function () { go(i); });
      dots.appendChild(b);
    });
    var arrows = document.createElement('div');
    arrows.className = 'arrows';
    arrows.innerHTML =
      '<button class="icon-btn" type="button" aria-label="Previous slide">' + arrowSvg('M15 6l-6 6 6 6') + '</button>' +
      '<button class="icon-btn" type="button" aria-label="Next slide">' + arrowSvg('M9 6l6 6-6 6') + '</button>';
    arrows.children[0].addEventListener('click', function () { go(current - 1); });
    arrows.children[1].addEventListener('click', function () { go(current + 1); });
    bar.appendChild(dots);
    bar.appendChild(arrows);
    track.insertAdjacentElement('afterend', bar);

    function go(i) {
      i = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    function setCurrent(i) {
      current = i;
      Array.prototype.forEach.call(dots.children, function (b, j) {
        if (j === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      });
      if (caption && slides[i].getAttribute('data-caption')) caption.textContent = slides[i].getAttribute('data-caption');
      // Clips play only while their slide is showing, and never when the visitor prefers less motion
      slides.forEach(function (s, j) {
        var v = s.querySelector('video');
        if (!v) return;
        if (j === i && !reduceMotion) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }
    track.addEventListener('scroll', function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== current) setCurrent(i);
    }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    });
    // Videos keep native controls off; a reduced-motion visitor gets controls instead of autoplay
    if (reduceMotion) slides.forEach(function (s) { var v = s.querySelector('video'); if (v) v.controls = true; });
    setCurrent(0);
  });

  // ---------- Copy email ----------
  var toast = document.querySelector('.toast');
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      function fallback() {
        var t = document.createElement('textarea');
        t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(t);
        showToast(ok ? 'Email copied' : text);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { showToast('Email copied'); }, fallback);
      } else {
        fallback();
      }
    });
  });

  // ---------- Footer year ----------
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
