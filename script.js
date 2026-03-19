// ===== MUTAR — Scroll Observer, Dot Navigation, Entry Animations =====

(function () {
  const container = document.querySelector('.scroll-container');
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const animElements = document.querySelectorAll('.anim');

  // ===== Intersection Observer: Animations =====
  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    {
      root: container,
      threshold: 0.3,
    }
  );

  animElements.forEach((el) => animObserver.observe(el));

  // ===== Intersection Observer: Active Slide (for dots) =====
  let currentSlide = 0;

  const slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const index = parseInt(entry.target.dataset.index, 10);
          if (index !== currentSlide) {
            currentSlide = index;
            updateDots(index);
          }
        }
      });
    },
    {
      root: container,
      threshold: 0.55,
    }
  );

  slides.forEach((slide) => slideObserver.observe(slide));

  // ===== Update Dots =====
  function updateDots(activeIndex) {
    dots.forEach((dot) => {
      dot.classList.toggle('active', parseInt(dot.dataset.slide, 10) === activeIndex);
    });
  }

  // ===== Dot Click Navigation =====
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.slide, 10);
      const target = slides[index];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== Make first slide visible immediately =====
  const firstAnim = slides[0]?.querySelector('.anim');
  if (firstAnim) {
    firstAnim.classList.add('visible');
  }
})();
