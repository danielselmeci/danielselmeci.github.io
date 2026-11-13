(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  document.documentElement.classList.add("js");

  /* ----- Keep photos from being dragged out (light touch) ----- */
  document.addEventListener("dragstart", (e) => {
    if (e.target && e.target.closest && e.target.closest("img, .photo-item, .hero-media")) {
      e.preventDefault();
    }
  });

  /* ----- Page enter ----- */
  window.requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });

  /* ----- Ambient pointer glow ----- */
  if (finePointer && !reduceMotion) {
    let glowX = window.innerWidth / 2;
    let glowY = window.innerHeight / 2;
    let targetX = glowX;
    let targetY = glowY;
    let ticking = false;

    const updateGlow = () => {
      glowX += (targetX - glowX) * 0.12;
      glowY += (targetY - glowY) * 0.12;
      document.documentElement.style.setProperty("--glow-x", `${glowX}px`);
      document.documentElement.style.setProperty("--glow-y", `${glowY}px`);
      ticking = false;
    };

    window.addEventListener(
      "pointermove",
      (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateGlow);
        }
      },
      { passive: true }
    );
  }

  /* ----- Nav ----- */
  const nav = document.querySelector(".nav");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  const setMenuOpen = (open, { restoreFocus = true } = {}) => {
    if (!navMenu || !navToggle) return;
    navMenu.classList.toggle("active", open);
    navToggle.classList.toggle("active", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    if (open) {
      navMenu.querySelector("a")?.focus();
    } else if (restoreFocus) {
      navToggle.focus();
    }
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      setMenuOpen(!navMenu.classList.contains("active"));
    });

    document.addEventListener("click", (e) => {
      if (!navMenu.classList.contains("active")) return;
      if (navMenu.contains(e.target) || navToggle.contains(e.target)) return;
      setMenuOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false, { restoreFocus: false }));
    });
  }

  const onScrollNav = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ----- Smooth in-page anchors ----- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      setMenuOpen(false);
    });
  });

  /* ----- Image hooks ----- */
  const heroMedia = document.getElementById("heroMedia");
  if (heroMedia) {
    const heroSrc = window.innerWidth > 1100
      ? "images/daniel-selmeci-moss-and-mushrooms-1920.webp"
      : "images/daniel-selmeci-moss-and-mushrooms-1080.webp";
    const heroImage = new Image();
    heroImage.onload = () => {
      heroMedia.style.setProperty("--hero-image", `url("${heroSrc}")`);
      heroMedia.classList.add("has-image");
    };
    heroImage.src = heroSrc;
  }

  document.querySelectorAll(".photo-item[data-image]").forEach((item) => {
    const src = item.getAttribute("data-image");
    const img = new Image();
    img.onload = () => {
      item.style.backgroundImage = `linear-gradient(180deg, transparent 35%, rgba(15,18,16,0.8)), url("${src}")`;
      item.classList.add("has-image");
    };
    img.src = src;
  });

  const bioImage = document.getElementById("bioImage");
  if (bioImage) {
    bioImage.classList.add("has-image");
  }

  /* ----- Scroll reveal + stagger ----- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${Math.min(i % 4, 3) * 80}ms`);
      observer.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ----- Magnetic buttons ----- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".btn").forEach((el) => {
      el.classList.add("magnetic");
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate3d(${x * 0.22}px, ${y * 0.28}px, 0)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ----- Photo tilt ----- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".photo-item").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotY = (x - 0.5) * 6;
        const rotX = (0.5 - y) * 6;
        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.015)`;
        card.style.setProperty("--spot-x", `${x * 100}%`);
        card.style.setProperty("--spot-y", `${y * 100}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ----- Work visual shine on enter ----- */
  document.querySelectorAll(".work-visual").forEach((visual) => {
    visual.addEventListener("pointerenter", () => {
      visual.classList.remove("shine");
      void visual.offsetWidth;
      visual.classList.add("shine");
    });
  });

  /* ----- Split hero title letters for fancy load ----- */
  if (!reduceMotion) {
    document.querySelectorAll(".hero-title .line").forEach((line) => {
      const text = line.textContent || "";
      line.textContent = "";
      line.classList.add("is-split");
      [...text].forEach((char, i) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.setProperty("--char-delay", `${i * 30}ms`);
        line.appendChild(span);
      });
    });
  }

  /* ----- Custom cursor (desktop) ----- */
  if (finePointer && !reduceMotion) {
    const cursor = document.createElement("div");
    cursor.className = "cursor-dot";
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.append(cursor, ring);
    document.body.classList.add("has-custom-cursor");

    let cx = 0;
    let cy = 0;
    let rx = 0;
    let ry = 0;

    let cursorRunning = false;

    // Only animate while the ring is catching up; idle = no work.
    const moveCursor = () => {
      rx += (cx - rx) * 0.18;
      ry += (cy - ry) * 0.18;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (Math.abs(cx - rx) > 0.3 || Math.abs(cy - ry) > 0.3) {
        window.requestAnimationFrame(moveCursor);
      } else {
        cursorRunning = false;
      }
    };

    window.addEventListener(
      "pointermove",
      (e) => {
        cx = e.clientX;
        cy = e.clientY;
        if (!cursorRunning) {
          cursorRunning = true;
          window.requestAnimationFrame(moveCursor);
        }
      },
      { passive: true }
    );

    document.querySelectorAll("a, button, .photo-item, .award-link, .platform-item").forEach((el) => {
      el.addEventListener("pointerenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("pointerleave", () => document.body.classList.remove("cursor-hover"));
    });
  }
})();
