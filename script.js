document.addEventListener('DOMContentLoaded', () => {
  const mission = document.getElementById('mission-text');
  if (mission) mission.style.opacity = '.85';
  const reveals = document.querySelectorAll('.reveal, .reveal-up');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } });
    }, { threshold: .15 });
    reveals.forEach(el => revealObserver.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));
  const video = document.getElementById('hero-video');
  const toggle = document.getElementById('motion-toggle');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let inView = true;
  let userPaused = reduceMotion.matches || Boolean(navigator.connection?.saveData);
  const updateLabel = () => { if (!toggle) return; toggle.textContent = video.paused ? 'Play film' : 'Pause film'; };
  const play = () => {
    if (!video.getAttribute('src')) {
      video.src = window.matchMedia('(max-width: 760px)').matches ? 'optimized/hero-mobile.mp4' : 'optimized/hero.mp4';
    }
    video.play().catch(updateLabel);
  };
  const sync = () => {
    if (userPaused || !inView || document.hidden) video.pause();
    else play();
  };
  if (toggle) toggle.hidden = false;
  toggle?.addEventListener('click', () => { userPaused = !video.paused; sync(); });
  video.addEventListener('play', updateLabel);
  video.addEventListener('pause', updateLabel);
  reduceMotion.addEventListener('change', () => { userPaused = reduceMotion.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); });
    observer.observe(video);
  } else sync();
});
