// live.js – now with hero height control
const page = location.pathname.split('/').pop().replace('.html','') || 'home';
if(page==='') page='home';

fetch('data.json?t='+Date.now())
  .then(r=>r.json())
  .then(d=>{
    // Font & colors (unchanged)
    const f=document.createElement('link');f.rel='stylesheet';f.href=d.font;document.head.appendChild(f);
    document.body.style.fontFamily=`"${d.fontName}",sans-serif`;
    document.body.style.color=d.textColor;
    document.querySelector('header').style.background=d.headerBg;
    document.querySelectorAll('.btn').forEach(b=>b.style.background=d.primaryColor);

    // Transparent header + scroll darken (already added by you)
    const header = document.querySelector('header');
    if(header) {
      header.style.background = 'transparent';
      header.style.transition = 'background .4s';
      window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>100));
    }

    // Hero height control
    const carousel = document.querySelector('.hero-carousel');
    if(carousel && d.heroHeight && d.heroHeight[page]){
      const h = d.heroHeight[page];
      if(h==='full')   carousel.style.height = '100vh';
      if(h==='medium') carousel.style.height = '70vh';
      if(h==='short')  carousel.style.height = '50vh';
    }

    // Rest of hero code (unchanged – same as before)
    if(carousel && d.heroSlides && d.heroSlides[page]){
      carousel.innerHTML='<button class="arrow prev">‹</button><button class="arrow next">›</button><div class="dots"></div>';
      d.heroSlides[page].forEach((s,i)=>{
        const slide=document.createElement('div');
        slide.className='slide'+(i===0?' active':'');
        if(s.image && s.image.includes('?video')){
          const vid = s.image.split('?video')[0];
          slide.innerHTML = `<video autoplay loop muted playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"><source src="${vid.replace('embed/','watch?v=').replace('player.vimeo.com','vimeo.com')}" type="video/mp4"></video>`;
        } else {
          slide.style.backgroundImage=`url('${s.image}')`;
        }
        slide.innerHTML += `<div class="slide-content"><h1>${s.title.replace(/<br>/g,'<br>')}</h1><p>${s.subtitle}</p><a href="${s.buttonLink}" class="btn">${s.buttonText}</a></div>`;
        carousel.appendChild(slide);

        const dot=document.createElement('span');
        dot.className='dot'+(i===0?' active':'');
        dot.onclick=()=>show(i);
        carousel.querySelector('.dots').appendChild(dot);
      });

      let cur=0;
      const slides=carousel.querySelectorAll('.slide');
      const dots=carousel.querySelectorAll('.dot');
      const show=n=>{slides.forEach(s=>s.classList.remove('active'));dots.forEach(d=>d.classList.remove('active'));slides[n].classList.add('active');dots[n].classList.add('active');cur=n;};
      carousel.querySelector('.prev').onclick=()=>show((cur-1+slides.length)%slides.length);
      carousel.querySelector('.next').onclick=()=>show((cur+1)%slides.length);
      setInterval(()=>carousel.querySelector('.next').click(),7000);
    }
  });
