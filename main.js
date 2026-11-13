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

  /* ----- Exhibitions: drop "Upcoming" once a show has ended ----- */
  const todayIso = new Date().toISOString().slice(0, 10);
  document.querySelectorAll(".exhibition-item[data-end]").forEach((item) => {
    if (item.dataset.end < todayIso) {
      item.querySelector(".award-badge--upcoming")?.remove();
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

  /* ----- Exhibition map (About) ----- */
  const mapEl = document.getElementById("exhibitionMap");
  if (mapEl) {
    const svg = mapEl.querySelector("svg");
    const layer = mapEl.querySelector(".map-markers");
    const tip = document.getElementById("mapTooltip");
    const SVGNS = "http://www.w3.org/2000/svg";

    // Equal Earth projection — must match the constants used to draw the land path.
    const S = 184.73156767339816, XMAX = 2.7066299836960748, TOP = 1.275786330596676;
    const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2;
    const project = (lon, lat) => {
      const l = (lon * Math.PI) / 180;
      const th = Math.asin(M * Math.sin((lat * Math.PI) / 180));
      const t2 = th * th, t6 = t2 * t2 * t2;
      const x = (l * Math.cos(th)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
      const y = th * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
      return [(x + XMAX) * S, (TOP - y) * S];
    };

    const today = new Date().toISOString().slice(0, 10);
    const escapeHtml = (str) => str.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    // Group exhibitions by city, reading the list below as the single source of truth.
    const cities = new Map();
    document.querySelectorAll(".exhibition-item[data-city]").forEach((li) => {
      const key = li.dataset.city;
      if (!cities.has(key)) {
        const [x, y] = project(parseFloat(li.dataset.lon), parseFloat(li.dataset.lat));
        cities.set(key, { names: [key], x, y, shows: [] });
      }
      const end = li.dataset.end || "";
      cities.get(key).shows.push({
        date: li.querySelector(".exhibition-date")?.textContent.trim() || "",
        iso: li.querySelector(".exhibition-date")?.getAttribute("datetime") || "",
        title: li.querySelector("h3")?.textContent.trim() || "",
        venue: (li.querySelector("p")?.textContent || "").split(" · ")[0].trim(),
        upcoming: end !== "" && end >= today,
      });
    });

    // Merge cities that would sit on top of each other (e.g. New York + Philadelphia).
    const markers = [];
    cities.forEach((c) => {
      const near = markers.find((m) => Math.hypot(m.x - c.x, m.y - c.y) < 9);
      if (near) {
        near.names.push(...c.names);
        near.shows.push(...c.shows);
      } else {
        markers.push({ ...c, names: [...c.names], shows: [...c.shows] });
      }
    });

    const shortName = (n) => n.split(",")[0];
    markers.forEach((m) => {
      m.shows.sort((a, b) => (a.iso < b.iso ? 1 : -1));
      const upcoming = m.shows.some((s) => s.upcoming);
      const g = document.createElementNS(SVGNS, "g");
      g.setAttribute("class", `map-marker${upcoming ? " is-upcoming" : ""}`);
      g.setAttribute("transform", `translate(${m.x.toFixed(1)} ${m.y.toFixed(1)})`);
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `${m.names.map(shortName).join(" & ")}: ${m.shows.length} exhibition${m.shows.length > 1 ? "s" : ""}`);
      const r = 3.2 + Math.min(m.shows.length - 1, 3) * 0.9;
      g.innerHTML = `<circle class="halo" r="${(r + 5).toFixed(1)}"></circle><circle class="dot" r="${r.toFixed(1)}"></circle>`;
      layer.appendChild(g);
      m.el = g;
    });

    let active = null;
    const render = (m) =>
      `<h4>${escapeHtml(m.names.map(shortName).join(" & "))}</h4>` +
      `<p class="map-tooltip-place">${escapeHtml(m.names.length > 1 ? "USA" : m.names[0].split(", ").slice(1).join(", "))}</p>` +
      `<ul>${m.shows
        .map(
          (s) =>
            `<li><span class="map-tooltip-date">${escapeHtml(s.date)}${s.upcoming ? ' · <em>Upcoming</em>' : ""}</span>` +
            `<span class="map-tooltip-title">${escapeHtml(s.title)}</span>` +
            `<span class="map-tooltip-venue">${escapeHtml(s.venue)}</span></li>`
        )
        .join("")}</ul>`;

    const show = (m) => {
      if (active === m) return;
      active?.el.classList.remove("is-active");
      active = m;
      m.el.classList.add("is-active");
      tip.innerHTML = render(m);
      tip.hidden = false;
      const box = mapEl.getBoundingClientRect();
      const pt = m.el.getBoundingClientRect();
      const cx = pt.left + pt.width / 2 - box.left;
      const cy = pt.top + pt.height / 2 - box.top;
      const w = tip.offsetWidth, h = tip.offsetHeight;
      const left = Math.max(w / 2 + 4, Math.min(box.width - w / 2 - 4, cx));
      const below = cy - h - 16 < -box.top + 70; // not enough room above (under the nav)
      tip.style.left = `${left}px`;
      tip.style.top = `${below ? cy + 16 : cy - h - 16}px`;
    };
    const hide = () => {
      active?.el.classList.remove("is-active");
      active = null;
      tip.hidden = true;
    };

    // Nearest marker to a pointer, within a radius in screen pixels.
    const nearest = (clientX, clientY, radius) => {
      let best = null, bestD = radius;
      markers.forEach((m) => {
        const r = m.el.getBoundingClientRect();
        const d = Math.hypot(r.left + r.width / 2 - clientX, r.top + r.height / 2 - clientY);
        if (d < bestD) { bestD = d; best = m; }
      });
      return best;
    };

    mapEl.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const m = nearest(e.clientX, e.clientY, 18);
      m ? show(m) : hide();
    });
    mapEl.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "mouse") hide();
    });
    mapEl.addEventListener("click", (e) => {
      const m = nearest(e.clientX, e.clientY, 30);
      if (m && m !== active) show(m);
      else hide();
    });
    document.addEventListener("click", (e) => {
      if (active && !mapEl.contains(e.target)) hide();
    });
    markers.forEach((m) => {
      m.el.addEventListener("focus", () => show(m));
      m.el.addEventListener("blur", hide);
      m.el.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { hide(); m.el.blur(); }
      });
    });
    window.addEventListener("resize", hide, { passive: true });
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

    document.querySelectorAll("a, button, .photo-item, .award-link, .platform-item, .map-marker").forEach((el) => {
      el.addEventListener("pointerenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("pointerleave", () => document.body.classList.remove("cursor-hover"));
    });
  }
})();
