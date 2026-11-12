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
  const UPLOADS_ID = "UU" + CHANNEL_ID.slice(2);
  const container = document.getElementById("eden-video-list");

  if (!container) return;

  const FEED_URL =
    `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  // 動画カードを作成
  function renderVideos(videos) {
    container.replaceChildren();

    videos.slice(0, 3).forEach(video => {
      const card = document.createElement("article");
      card.className = "eden-video__item";

      const link = document.createElement("a");
      link.className = "eden-video__thumbnail";
      link.href = video.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const image = document.createElement("img");
      image.src =
        `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
      image.alt = video.title;
      image.loading = "lazy";

      const heading = document.createElement("h3");
      heading.className = "eden-video__name";
      heading.textContent = video.title;

      link.appendChild(image);
      card.append(link, heading);
      container.appendChild(card);
    });
  }

  // RSS2JSONで取得
  async function getFromRSS2JSON() {
    const url =
      "https://api.rss2json.com/v1/api.json?rss_url=" +
      encodeURIComponent(FEED_URL);

    const response = await fetch(url);
    if (!response.ok) throw new Error("RSS2JSON error");

    const data = await response.json();

    if (data.status !== "ok" || !data.items?.length) {
      throw new Error("RSS2JSON data error");
    }

    return data.items.slice(0, 3).map(item => {
      const id = item.guid.split(":").pop();

      return {
        id,
        title: item.title,
        link: `https://www.youtube.com/watch?v=${id}`
      };
    });
  }

  // 別経路でRSS取得
  async function getFromAlternative() {
    const url =
      "https://api.allorigins.win/raw?url=" +
      encodeURIComponent(FEED_URL);

    const response = await fetch(url);
    if (!response.ok) throw new Error("Alternative RSS error");

    const xml = await response.text();
    const doc = new DOMParser().parseFromString(
      xml,
      "application/xml"
    );

    if (doc.querySelector("parsererror")) {
      throw new Error("XML parse error");
    }

    const entries = [...doc.querySelectorAll("entry")];

    const videos = entries.slice(0, 3).map(entry => {
      const id =
        entry.getElementsByTagNameNS(
          "http://www.youtube.com/xml/schemas/2015",
          "videoId"
        )[0]?.textContent;

      const title = entry.querySelector("title")?.textContent;

      if (!id || !title) return null;

      return {
        id,
        title,
        link: `https://www.youtube.com/watch?v=${id}`
      };
    }).filter(Boolean);

    if (!videos.length) {
      throw new Error("No videos found");
    }

    return videos;
  }

  // 最終手段：YouTube公式アップロード一覧
  function showYouTubePlaylist() {
    container.replaceChildren();

    const player = document.createElement("iframe");

    player.className = "eden-video__player";
    player.src =
      `https://www.youtube.com/embed?listType=playlist&list=${UPLOADS_ID}`;

    player.title = "EDEN 最新アップロード動画";
    player.loading = "lazy";
    player.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    player.allowFullscreen = true;

    player.style.width = "100%";
    player.style.aspectRatio = "16 / 9";
    player.style.border = "0";

    container.appendChild(player);
  }

  // 実行
  try {
    const videos = await getFromRSS2JSON();
    renderVideos(videos);
    console.log("EDEN VIDEO: RSS2JSON success");

  } catch (error1) {
    console.warn("EDEN VIDEO: RSS2JSON failed", error1);

    try {
      const videos = await getFromAlternative();
      renderVideos(videos);
      console.log("EDEN VIDEO: Alternative RSS success");

    } catch (error2) {
      console.warn("EDEN VIDEO: Alternative RSS failed", error2);

      // 取得サービスが両方失敗した場合
      showYouTubePlaylist();
      console.log("EDEN VIDEO: YouTube playlist fallback");
    }
  }
})();
