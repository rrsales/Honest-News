// main.js — core site functionality

document.addEventListener("DOMContentLoaded", () => {

  /* -----------------------------
     Mobile Menu Toggle
  ----------------------------- */
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  /* -----------------------------
     Back to Top Button
  ----------------------------- */
  const backTop = document.getElementById("backTop");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backTop.classList.add("show");
    } else {
      backTop.classList.remove("show");
    }
  });

  if (backTop) {
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* -----------------------------
     Hero Ken Burns Slideshow
  ----------------------------- */
  const slides = document.querySelectorAll(".hero-slide");
  let currentSlide = 0;

  function nextSlide() {
    if (slides.length === 0) return;

    slides.forEach((slide, index) => {
      slide.style.opacity = index === currentSlide ? "1" : "0";
    });

    currentSlide = (currentSlide + 1) % slides.length;
  }

  setInterval(nextSlide, 6000);
  nextSlide();
});


