document.addEventListener('DOMContentLoaded', () => {
  const videos = [...document.querySelectorAll('.video-item video')];
  const mobile = matchMedia('(max-width: 600px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ratios = new Map(videos.map(v => [v, 0]));
  const pausedByUser = new Set();
  let active = null;
  const labels = new Map();
  const soundButtons = new Map();
  const autoplayAllowed = () => mobile.matches && !reduced.matches && !navigator.connection?.saveData;
  videos.forEach(video => {
    const label = video.getAttribute('aria-label') || 'event film';
    labels.set(video, label);
    const wrap = document.createElement('div'); wrap.className = 'event-video-wrap';
    video.before(wrap); wrap.append(video);
    video.controls = false; video.muted = true; video.tabIndex = 0; video.setAttribute('role', 'button');
    const volume = document.createElement('button'); volume.type = 'button'; volume.className = 'event-volume';
    const update = () => {
      video.setAttribute('aria-label', mobile.matches ? `${video.paused ? 'Play' : 'Pause'} ${label}` : label);
      if (mobile.matches) video.setAttribute('aria-pressed', String(!video.paused));
      else video.removeAttribute('aria-pressed');
      const muted = video.muted || video.volume === 0;
      volume.setAttribute('aria-label', `${muted ? 'Unmute' : 'Mute'} ${label}`);
      volume.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z"/>${muted ? '<path d="m16 9 6 6m0-6-6 6"/>' : '<path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>'}</svg><span>${muted ? 'Unmute' : 'Mute'}</span>`;
    };
    const togglePlayback = () => {
      if (!mobile.matches) return;
      if (video.paused) { pausedByUser.delete(video); video.play().catch(update); }
      else { pausedByUser.add(video); video.pause(); }
    };
    video.addEventListener('click', togglePlayback);
    video.addEventListener('keydown', e => { if (mobile.matches && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); togglePlayback(); } });
    volume.addEventListener('click', () => { video.muted = !(video.muted || video.volume === 0); if (!video.muted && !video.volume) video.volume = 1; update(); });
    video.addEventListener('play', () => { videos.forEach(other => { if (other !== video) other.pause(); }); update(); });
    video.addEventListener('pause', update); video.addEventListener('volumechange', update);
    soundButtons.set(video, volume);
    wrap.append(volume); update();
  });
  const choose = () => {
    if (document.hidden) { videos.forEach(v => v.pause()); return; }
    if (!autoplayAllowed()) return;
    const candidate = videos.reduce((best,v) => ratios.get(v) > (best ? ratios.get(best) : .2) ? v : best, null);
    if (candidate !== active) { if (active) active.pause(); active = candidate; }
    videos.forEach(v => { if (v !== active) v.pause(); });
    if (active && active.paused && !pausedByUser.has(active)) active.play().catch(() => {});
  };
  const configure = () => {
    videos.forEach(v => {
      v.pause(); v.controls = !mobile.matches; v.loop = mobile.matches; v.muted = mobile.matches;
      soundButtons.get(v).hidden = !mobile.matches;
      if (mobile.matches) { v.tabIndex = 0; v.setAttribute('role', 'button'); v.setAttribute('aria-pressed', 'false'); v.setAttribute('aria-label', `Play ${labels.get(v)}`); }
      else { v.removeAttribute('tabindex'); v.removeAttribute('role'); v.removeAttribute('aria-pressed'); v.setAttribute('aria-label', labels.get(v)); }
    });
    active = null; choose();
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { entries.forEach(e => ratios.set(e.target,e.intersectionRatio)); choose(); }, {threshold:Array.from({length:21},(_,i)=>i/20)});
    videos.forEach(v => observer.observe(v));
  }
  mobile.addEventListener('change', configure); reduced.addEventListener('change', configure);
  document.addEventListener('visibilitychange', choose); configure();
});
