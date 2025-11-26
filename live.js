// live.js – page-specific hero + everything else
const page = location.pathname.split('/').pop().replace('.html','') || 'home';
if(page==='') page='home';

fetch('data.json?t='+Date.now())
  .then(r=>r.json())
  .then(d=>{
    // Font & colors
    const f=document.createElement('link');f.rel='stylesheet';f.href=d.font;document.head.appendChild(f);
    document.body.style.fontFamily=`"${d.fontName}",sans-serif`;
    document.body.style.color=d.textColor;
    document.querySelector('header').style.background=d.headerBg;
    document.querySelectorAll('.btn').forEach(b=>b.style.background=d.primaryColor);

    // Banner
    let banner=document.getElementById('siteBanner')||document.createElement('div');
    banner.id='siteBanner';banner.textContent=d.bannerText||'';
    banner.style.cssText='background:#c00;color:white;padding:12px;text-align:center;font-weight:bold;display:none;position:fixed;top:60px;left:0;width:100%;z-index:999';
    if(d.bannerOn)banner.style.display='block';
    if(!document.getElementById('siteBanner'))document.body.prepend(banner);

    // Page-specific hero
    const carousel=document.querySelector('.hero-carousel');
    if(carousel && d.heroSlides && d.heroSlides[page]){
      carousel.innerHTML='<button class="arrow prev">‹</button><button class="arrow next">›</button><div class="dots"></div>';
      d.heroSlides[page].forEach((s,i)=>{
        const slide=document.createElement('div');
        slide.className='slide'+(i===0?' active':'');
        slide.style.backgroundImage=`url('${s.image}')`;
        slide.innerHTML=`<div class="slide-content"><h1>${s.title.replace(/<br>/g,'<br>')}</h1><p>${s.subtitle}</p><a href="${s.buttonLink}" class="btn">${s.buttonText}</a></div>`;
        carousel.appendChild(slide);

        const dot=document.createElement('span');
        dot.className='dot'+(i===0?' active':'');
        dot.onclick=()=>show(i);
        carousel.querySelector('.dots').appendChild(dot);
      });

      let cur=0;
      const slides=carousel.querySelectorAll('.slide');
      const dots=carousel.querySelectorAll('.dot');
      const show=n=>{
        slides.forEach(s=>s.classList.remove('active'));
        dots.forEach(d=>d.classList.remove('active'));
        slides[n].classList.add('active');
        dots[n].classList.add('active');
        cur=n;
      };
      carousel.querySelector('.prev').onclick=()=>show((cur-1+slides.length)%slides.length);
      carousel.querySelector('.next').onclick=()=>show((cur+1)%slides.length);
      setInterval(()=>carousel.querySelector('.next').click(),7000);
    }
  });
