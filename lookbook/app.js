(() => {
  const $ = id => document.getElementById(id);
  let data, current = 0, busy = false, motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let wheelAt = 0, wheelSum = 0, touchY = null;
  const notesOpen = () => location.hash === '#collection-notes';
  function paint() {
    const s = data.scenes[current];
    $('frame').src = s.image; $('next-frame').style.opacity = '0';
    $('product-name').textContent = s.name; $('product-description').textContent = s.description;
    $('count').textContent = String(current + 1).padStart(2, '0');
    const end = current === data.scenes.length - 1;
    $('caption').style.opacity = end ? '0' : '1'; $('ending').style.opacity = end ? '1' : '0';
    $('scroll-hint').textContent = end ? 'SCROLL UP TO RETURN ↑' : 'SCROLL TO NEXT PIECE ↓';
    $('progress').style.width = ((current + 1) / data.scenes.length * 100) + '%';
    document.querySelectorAll('.rail a').forEach((a, i) => {
      if (i === current) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
  }
  async function go(target) {
    if (!data || busy || target === current || target < 0 || target >= data.scenes.length) return;
    busy = true;
    const origin = current;
    const poster = new Image(); poster.src = data.scenes[target].image;
    try { await poster.decode(); } catch (_) {}
    $('next-frame').src = poster.src;
    const source = Math.abs(target - origin) === 1 ? data.videos?.[Math.min(origin, target)] : null;
    let video = null;
    if (motion && source) {
      video = document.createElement('video'); video.muted = true; video.playsInline = true; video.preload = 'auto';
      video.src = source.src; $('video-layer').append(video);
      $('loading').textContent = 'Loading motion…';
      const loaded = await new Promise(resolve => {
        const timer = setTimeout(() => resolve(false), 5000);
        video.addEventListener('loadeddata', () => { clearTimeout(timer); resolve(true); }, {once:true});
        video.addEventListener('error', () => { clearTimeout(timer); resolve(false); }, {once:true});
      });
      $('loading').textContent = '';
      if (!loaded) { video.remove(); video = null; }
    }
    const duration = !motion ? 0 : video ? (video.duration || 5) * 1000 : 900;
    if (video) video.classList.add('ready');
    await new Promise(resolve => {
      let started;
      function tick(now) {
        if (started === undefined) started = now;
        const p = duration ? Math.min(1, (now - started) / duration) : 1;
        if (video) {
          const position = target > origin ? p : 1 - p;
          if (!video.seeking) video.currentTime = Math.min(position * video.duration, Math.max(0, video.duration - .04));
        } else $('next-frame').style.opacity = String(p * p * (3 - 2 * p));
        if (p < 1) requestAnimationFrame(tick); else resolve();
      }
      requestAnimationFrame(tick);
    });
    current = target; paint(); if (video) video.remove();
    wheelSum = 0; wheelAt = performance.now(); busy = false;
  }
  window.addEventListener('wheel', e => {
    if (notesOpen() || e.ctrlKey) return;
    e.preventDefault();
    const now = performance.now(), gap = now - wheelAt; wheelAt = now;
    if (busy) { wheelSum = 0; return; }
    if (gap > 220) wheelSum = 0;
    else if (!wheelSum) return;
    const delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
    if (wheelSum && Math.sign(delta) !== Math.sign(wheelSum)) wheelSum = 0;
    wheelSum += delta;
    if (Math.abs(wheelSum) >= 30) { go(current + Math.sign(wheelSum)); wheelSum = 0; }
  }, {passive:false});
  window.addEventListener('touchstart', e => { touchY = !busy && !notesOpen() ? e.touches[0].clientY : null; }, {passive:true});
  window.addEventListener('touchmove', e => { if (!notesOpen()) e.preventDefault(); }, {passive:false});
  window.addEventListener('touchend', e => {
    if (touchY === null) return;
    const delta = touchY - e.changedTouches[0].clientY; touchY = null;
    if (Math.abs(delta) > 45) go(current + Math.sign(delta));
  }, {passive:true});
  window.addEventListener('keydown', e => {
    if (notesOpen() || /INPUT|TEXTAREA|SELECT|BUTTON|A/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
    const dir = ['ArrowDown','PageDown',' '].includes(e.key) ? (e.shiftKey ? -1 : 1) : ['ArrowUp','PageUp'].includes(e.key) ? -1 : 0;
    if (dir) { e.preventDefault(); go(current + dir); }
  });
  $('motion-toggle').addEventListener('click', () => {
    if (busy) return; motion = !motion; updateMotion();
  });
  function updateMotion() { $('motion-toggle').textContent = motion ? 'Motion on' : 'Motion off'; $('motion-toggle').setAttribute('aria-pressed', String(motion)); }
  document.querySelector('.wordmark').addEventListener('click', () => { go(0); });
  fetch('collection.json').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(d => {
    data = d; $('scroll-space').style.height = '100dvh';
    d.scenes.forEach((s, i) => {
      const a = document.createElement('a'); a.href = '#piece-' + (i + 1); a.textContent = String(i + 1).padStart(2, '0');
      a.setAttribute('aria-label', s.name || 'Skate ramp finale');
      a.addEventListener('click', e => { e.preventDefault(); go(i); }); $('rail').append(a);
      if (s.name) { const article = document.createElement('article'), h = document.createElement('h3'), p = document.createElement('p'); h.textContent = s.name; p.textContent = s.description; article.append(h,p); $('text-collection').append(article); }
      const img = new Image(); img.src = s.image;
    });
    updateMotion(); paint();
  }).catch(() => { $('loading').textContent = 'The collection could not load. Please refresh.'; });
})();
