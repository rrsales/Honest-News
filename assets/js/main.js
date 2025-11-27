// main.js
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Utilities ---------- */
  function getSiteData() {
    try {
      const raw = localStorage.getItem(SITE_CONFIG.storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      if (SITE_CONFIG.debug) console.warn("main: invalid siteData", e);
      return null;
    }
  }

  function escapeHtml(s=""){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* ---------- Dynamic Nav ---------- */
  function generateNav() {
    const sd = getSiteData();
    const navItems = (sd && sd.menu && sd.menu.length) ? sd.menu : (sd && sd.pages ? sd.pages : SitePages.getPages());
    const navs = document.querySelectorAll(".nav-menu");
    navs.forEach(nav => {
      nav.innerHTML = "";
      navItems.forEach(item => {
        const a = document.createElement("a");
        a.href = item.url;
        a.textContent = item.title;
        // mark active
        const current = location.pathname.split("/").pop() || "index.html";
        if (current === item.url || (current === "" && item.url === "index.html")) a.classList.add("active");
        nav.appendChild(a);
      });
      // add small ARIA enhancements
      nav.setAttribute("role", "navigation");
    });
  }

  /* ---------- Mobile menu toggle ---------- */
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  menuToggle && menuToggle.addEventListener("click", () => {
    const nav = document.querySelector(".nav-menu");
    if (nav) nav.classList.toggle("active");
  });

  /* ---------- Back to top ---------- */
  const backTop = document.getElementById("backTop");
  if (backTop) {
    window.addEventListener("scroll", () => {
      backTop.style.display = (window.scrollY > 300) ? "block" : "none";
    });
    backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Products & Posts renderers ---------- */
  // product grid
  window.SiteProducts && SiteProducts.renderProductGrid(".product-grid");

  /* ---------- Hero initialization (per-page, reads admin settings) ---------- */
  function initHero() {
    const heroSection = document.querySelector(".hero, .podcast-hero, .page-hero");
    if (!heroSection) return;

    // find page file name
    const pageUrl = location.pathname.split("/").pop() || "index.html";
    const sd = getSiteData() || {};
    const heroSettings = (sd.heroes && sd.heroes[pageUrl]) ? sd.heroes[pageUrl] : null;

    // If admin didn't set hero, use defaults or fallback to existing HTML
    if (!heroSettings) {
      // leave HTML as-is (developer-provided) or use defaults
      return;
    }

    // map admin behavior keys to our code values (admin uses 'still','parallax','slider','video','none')
    const behavior = heroSettings.behavior || "none";

    // clear existing content inside heroSection and apply chosen behavior
    heroSection.innerHTML = "";
    heroSection.style.height = heroSettings.height ? {
      small: "40vh",
      medium: "60vh",
      large: "100vh"
    }[heroSettings.height] || heroSettings.height : SITE_CONFIG.heroDefaults.height;

    // helper to append overlay
    function appendOverlay(title, subtitle, overlayColor, textColor, transparent) {
      const overlay = document.createElement("div");
      overlay.className = "hero-overlay";
      overlay.style.position = "absolute";
      overlay.style.left = 0;
      overlay.style.top = 0;
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.justifyContent = "center";
      overlay.style.alignItems = "center";
      overlay.style.pointerEvents = "none";
      overlay.style.background = transparent ? "transparent" : (overlayColor || "rgba(0,0,0,0.35)");
      overlay.style.color = textColor || "#fff";
      overlay.innerHTML = `<div style="pointer-events:auto;text-align:center;padding:0 1rem;">
        <h1 style="margin:0 0 .5rem 0;">${escapeHtml(title || sd.settings.siteName || "Honest News")}</h1>
        ${subtitle ? `<p style="margin:0;">${escapeHtml(subtitle)}</p>` : ""}
      </div>`;
      heroSection.appendChild(overlay);
    }

    if (behavior === "still") {
      const img = document.createElement("img");
      img.src = heroSettings.mediaUrl || SITE_CONFIG.heroDefaults.slides[0];
      img.alt = "Hero image";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      heroSection.appendChild(img);
      appendOverlay(heroSettings.title, heroSettings.subtitle, heroSettings.overlayColor, heroSettings.textColor, heroSettings.transparent);
    } else if (behavior === "parallax") {
      heroSection.style.backgroundImage = `url(${heroSettings.mediaUrl || SITE_CONFIG.heroDefaults.slides[0]})`;
      heroSection.style.backgroundAttachment = "fixed";
      heroSection.style.backgroundSize = "cover";
      heroSection.style.backgroundPosition = "center";
      appendOverlay(heroSettings.title, heroSettings.subtitle, heroSettings.overlayColor, heroSettings.textColor, heroSettings.transparent);
    } else if (behavior === "slider" || behavior === "slides") {
      const slides = (heroSettings.slides && heroSettings.slides.length) ? heroSettings.slides : SITE_CONFIG.heroDefaults.slides;
      let idx = 0;
      const img = document.createElement("img");
      img.src = slides[idx];
      img.alt = "Slide";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      heroSection.appendChild(img);
      appendOverlay(heroSettings.title, heroSettings.subtitle, heroSettings.overlayColor, heroSettings.textColor, heroSettings.transparent);
      setInterval(() => {
        idx = (idx + 1) % slides.length;
        img.src = slides[idx];
      }, (heroSettings.slideInterval || 6000));
    } else if (behavior === "video") {
      // accept mp4 URL or youtube/vimeo (admin should provide embeddable link or mp4)
      // If youtube/vimeo: render iframe; if mp4: render <video>
      const url = heroSettings.mediaUrl || "";
      if (/youtube\.com|youtu\.be|vimeo\.com/.test(url)) {
        // build embedded iframe
        let src = url;
        // translate youtube watch to embed
        if (url.includes("watch?v=")) {
          src = url.replace("watch?v=", "embed/");
        } else if (url.includes("youtu.be/")) {
          src = url.replace("youtu.be/", "www.youtube.com/embed/");
        }
        if (url.includes("vimeo.com") && !url.includes("player.vimeo.com")) {
          src = url.replace("vimeo.com", "player.vimeo.com/video");
        }
        const iframe = document.createElement("iframe");
        iframe.src = src + "?autoplay=1&mute=1&loop=1&controls=0&playlist=1";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "0";
        heroSection.appendChild(iframe);
        appendOverlay(heroSettings.title, heroSettings.subtitle, heroSettings.overlayColor, heroSettings.textColor, heroSettings.transparent);
      } else {
        const video = document.createElement("video");
        video.src = url;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
        heroSection.appendChild(video);
        appendOverlay(heroSettings.title, heroSettings.subtitle, heroSettings.overlayColor, heroSettings.textColor, heroSettings.transparent);
      }
    } else {
      // none => hide hero
      heroSection.style.display = "none";
    }
  }

  // run generation
  generateNav();
  initHero();

  // expose small API to refresh nav / hero from console
  window.__HONESTNEWS = {
    refresh: () => { generateNav(); initHero(); }
  };

});


