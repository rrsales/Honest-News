// live.js – makes every page read data.json instantly
fetch('data.json?t=' + Date.now())
  .then(r => r.json())
  .then(d => {
    // FONT
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = d.font || 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap';
    document.head.appendChild(fontLink);
    document.body.style.fontFamily = `"${d.fontName || 'Roboto'}", sans-serif`;

    // COLORS
    document.body.style.color = d.textColor || '#333';
    document.querySelector('header').style.background = d.headerBg || '#111';
    document.querySelectorAll('.btn').forEach(b => {
      b.style.background = d.primaryColor || '#0066cc';
    });

    // BANNER
    const banner = document.getElementById('siteBanner') || document.createElement('div');
    banner.id = 'siteBanner';
    if (d.bannerOn && d.bannerText) {
      banner.textContent = d.bannerText;
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }
    if (!document.getElementById('siteBanner')) document.body.prepend(banner);

    // HERO CAROUSEL
    const carousel = document.querySelector('.hero-carousel');
    carousel.innerHTML = '<button class="arrow prev">‹</button><button class="arrow next">›</button><div class="dots"></div>';
    d.heroSlides.forEach((s, i) => {
      const slide = document.createElement('div');
      slide.className = 'slide' + (i === 0 ? ' active' : '');
      slide.style.backgroundImage = `url('${s.image}')`;
      slide.innerHTML = `
        <div class="slide-content">
          <h1>${s.title.replace(/<br>/g, '<br>')}</h1>
          <p>${s.subtitle}</p>
          <a href="${s.buttonLink}" class="btn">${s.buttonText}</a>
        </div>`;
      carousel.appendChild(slide);

      const dot = document.createElement('span');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.onclick = () => show(i);
      carousel.querySelector('.dots').appendChild(dot);
    });

    // Carousel controls
    let current = 0;
    const slides = carousel.querySelectorAll('.slide');
    const dots = carousel.querySelectorAll('.dot');
    const show = n => {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[n].classList.add('active');
      dots[n].classList.add('active');
      current = n;
    };
    carousel.querySelector('.prev').onclick = () => show((current - 1 + slides.length) % slides.length);
    carousel.querySelector('.next').onclick = () => show((current + 1) % slides.length);
    setInterval(() => carousel.querySelector('.next').click(), 7000);
  });
