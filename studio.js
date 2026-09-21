document.addEventListener('DOMContentLoaded', () => {


  // drag-to-scroll on photo strip
  const strip = document.getElementById('studio-strip');
  if (strip) {
    let isDown = false;
    let startX, scrollLeft;

    strip.addEventListener('mousedown', e => {
      isDown = true;
      strip.classList.add('dragging');
      startX = e.pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
    });

    strip.addEventListener('mouseleave', () => { isDown = false; strip.classList.remove('dragging'); });
    strip.addEventListener('mouseup', () => { isDown = false; strip.classList.remove('dragging'); });
    strip.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - strip.offsetLeft;
      strip.scrollLeft = scrollLeft - (x - startX);
    });
  }
});
