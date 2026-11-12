const header = document.getElementById("header");
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

function setMenuOpen(isOpen) {
  nav.classList.toggle("open", isOpen);
  menuBtn.setAttribute("aria-expanded", String(isOpen));
  menuBtn.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  menuBtn.textContent = isOpen ? "CLOSE ×" : "MENU ☰";
  document.body.style.overflow = isOpen && window.matchMedia("(max-width: 900px)").matches
    ? "hidden"
    : "";
}

// Header background on scroll
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

// Mobile hamburger menu toggle
menuBtn.addEventListener("click", () => {
  const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
});

// Close the menu after selecting a section
nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => setMenuOpen(false));
});

// Close with Escape
document.addEventListener("keydown", event => {
  if (event.key === "Escape") setMenuOpen(false);
});

// If the viewport becomes desktop-sized, reset mobile menu state
window.addEventListener("resize", () => {
  if (window.matchMedia("(min-width: 901px)").matches) setMenuOpen(false);
});

// Reveal sections as they enter the viewport
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach(element => element.classList.add("visible"));
}


document.querySelectorAll(".dr-hero").forEach((hero) => {
  const viewport = hero.querySelector(".dr-hero__viewport");
  const track = hero.querySelector(".dr-hero__track");
  const prev = hero.querySelector(".dr-hero__prev");
  const next = hero.querySelector(".dr-hero__next");
  const dots = hero.querySelector(".dr-hero__dots");

  if (!viewport || !track || !dots) return;

  const originalSlides = [...track.children];
  const count = originalSlides.length;
  if (count < 2) return;

  // 先頭・末尾に複製を配置して無限ループ
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[count - 1].cloneNode(true);
  firstClone.setAttribute("aria-hidden", "true");
  lastClone.setAttribute("aria-hidden", "true");
  track.append(firstClone);
  track.prepend(lastClone);

  const slides = [...track.children];
  let current = 1;
  let timer;
  let startX = 0;
  let deltaX = 0;
  let dragging = false;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // ページ位置を計算
  function update(animate = true) {
    track.style.transition = animate
      ? "transform 650ms cubic-bezier(.22,.61,.36,1)"
      : "none";

    const slide = slides[current];
    const offset =
      viewport.clientWidth / 2 -
      slide.offsetLeft -
      slide.offsetWidth / 2;

    track.style.transform = `translateX(${offset}px)`;

    dots.querySelectorAll("button").forEach((dot, i) => {
      dot.classList.toggle("is-active", i === realIndex());
      dot.setAttribute(
        "aria-current",
        i === realIndex() ? "true" : "false"
      );
    });
  }

  function realIndex() {
    return (current - 1 + count) % count;
  }

  function move(step) {
    current += step;
    update();
    restart();
  }

  function jumpIfClone() {
    if (current === count + 1) {
      current = 1;
      update(false);
    } else if (current === 0) {
      current = count;
      update(false);
    }
  }

  track.addEventListener("transitionend", jumpIfClone);

  // ページ送りドット
  dots.innerHTML = "";

  originalSlides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dr-hero__dot";
    dot.setAttribute("aria-label", `${i + 1}枚目を表示`);
    dot.addEventListener("click", () => {
      current = i + 1;
      update();
      restart();
    });
    dots.append(dot);
  });

  prev?.addEventListener("click", () => move(-1));
  next?.addEventListener("click", () => move(1));

  // スマホ・タッチ操作
  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startX = e.clientX;
    deltaX = 0;
    dragging = true;
    stop();
  });

  viewport.addEventListener("pointermove", (e) => {
    if (dragging) deltaX = e.clientX - startX;
  });

  function finishSwipe() {
    if (!dragging) return;
    dragging = false;

    if (Math.abs(deltaX) > 45) {
      move(deltaX < 0 ? 1 : -1);
    } else {
      update();
      restart();
    }

    startX = 0;
    deltaX = 0;
  }

  viewport.addEventListener("pointerup", finishSwipe);
  viewport.addEventListener("pointercancel", finishSwipe);
  viewport.addEventListener("pointerleave", finishSwipe);

  // 自動ループ
  function stop() {
    clearInterval(timer);
  }

  function restart() {
    stop();
    if (reduceMotion.matches) return;

    timer = setInterval(() => {
      current++;
      update();
    }, 5000);
  }

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", restart);
  hero.addEventListener("focusin", stop);
  hero.addEventListener("focusout", restart);

  window.addEventListener("resize", () => update(false));

  update(false);
  restart();
});


document.querySelectorAll(".nav-dropdown__toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const dropdown = button.closest(".nav-dropdown");
    const isOpen = dropdown.classList.toggle("is-open");

    button.setAttribute("aria-expanded", String(isOpen));
  });
});

document.addEventListener("click", (event) => {
  document.querySelectorAll(".nav-dropdown.is-open").forEach((dropdown) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("is-open");
      dropdown.querySelector(".nav-dropdown__toggle")
        .setAttribute("aria-expanded", "false");
    }
  });
});


(async function () {
  const CHANNEL_ID = "UCy3uHoPxXaPtnTCC0UquGjw";
  const container = document.getElementById("eden-video-list");

  if (!container) return;

  const feedURL =
    `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  const apiURL =
    "https://api.rss2json.com/v1/api.json?rss_url=" +
    encodeURIComponent(feedURL);

  try {
    const response = await fetch(apiURL);

    if (!response.ok) {
      throw new Error("RSS取得エラー: " + response.status);
    }

    const data = await response.json();

    if (data.status !== "ok" || !data.items?.length) {
      throw new Error("動画一覧を取得できません");
    }

    const videos = data.items.slice(0, 3);
    container.replaceChildren();

    videos.forEach(video => {
      const videoId = video.guid.split(":").pop();
      const title = video.title;

      const card = document.createElement("article");
      card.className = "eden-video__item";

      const link = document.createElement("a");
      link.href = video.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "eden-video__thumbnail";

      const image = document.createElement("img");
      image.src =
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      image.alt = title;
      image.loading = "lazy";

      const heading = document.createElement("h3");
      heading.className = "eden-video__name";
      heading.textContent = title;

      link.appendChild(image);
      card.append(link, heading);
      container.appendChild(card);
    });

  } catch (error) {
    console.error("EDEN VIDEO:", error);

    container.replaceChildren();

    const message = document.createElement("p");
    message.textContent = "動画を読み込めませんでした。";

    const link = document.createElement("a");
    link.href = "https://www.youtube.com/@EDEN__0_0__Official";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "EDEN OFFICIAL YOUTUBE ↗";

    container.append(message, link);
  }
})();
