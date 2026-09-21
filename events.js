document.addEventListener('DOMContentLoaded', () => {
  const videos = [...document.querySelectorAll('.video-item video')];
  const mobile = matchMedia('(max-width: 600px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ratios = new Map(videos.map(video => [video, 0]));
  const pausedByUser = new Set();
  let active = null;
  const buttons = new Map();
  const autoplayAllowed = () => mobile.matches && !reduced.matches && !navigator.connection?.saveData;
  videos.forEach(video => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'event-playback';
    const label = video.getAttribute('aria-label') || 'event film';
    const update = () => {
      button.textContent = video.paused ? 'Play film' : 'Pause film';
      button.setAttribute('aria-label', `${video.paused ? 'Play' : 'Pause'} ${label}`);
    };
    button.addEventListener('click', () => {
      if (video.paused) { pausedByUser.delete(video); video.play().catch(update); }
      else { pausedByUser.add(video); video.pause(); }
    });
    video.addEventListener('play', () => {
      videos.forEach(other => { if (other !== video) other.pause(); });
      update();
    });
    video.addEventListener('pause', update);
    video.parentElement.appendChild(button);
    buttons.set(video, button);
    update();
  });
  const choose = () => {
    if (document.hidden) { videos.forEach(video => video.pause()); return; }
    if (!autoplayAllowed()) return;
    const candidate = videos.reduce((best, video) => ratios.get(video) > (best ? ratios.get(best) : .2) ? video : best, null);
    if (candidate !== active) {
      if (active) { active.pause(); pausedByUser.delete(active); }
      active = candidate;
    }
    videos.forEach(video => { if (video !== active) video.pause(); });
    if (active && active.paused && !pausedByUser.has(active)) active.play().catch(() => {});
  };
  const configure = () => {
    videos.forEach(video => {
      video.pause();
      video.controls = !mobile.matches;
      video.muted = mobile.matches;
      video.loop = mobile.matches;
      buttons.get(video).hidden = !mobile.matches;
    });
    active = null;
    choose();
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => ratios.set(entry.target, entry.intersectionRatio));
      choose();
    }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) });
    videos.forEach(video => observer.observe(video));
  }
  mobile.addEventListener('change', configure);
  reduced.addEventListener('change', configure);
  document.addEventListener('visibilitychange', choose);
  configure();
});
