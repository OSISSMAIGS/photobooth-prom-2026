(function () {
  "use strict";

  const config = window.GALLERY_CONFIG || {
    refreshInterval: 5000,
    enableDownload: true,
    apiUrl: "/api/photos",
  };

  const grid = document.getElementById("gallery-grid");
  const empty = document.getElementById("gallery-empty");
  const skeleton = document.getElementById("gallery-skeleton");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxDownload = document.getElementById("lightbox-download");

  const knownIds = new Set();

  function photoId(photo) {
    return (photo.url || photo.thumbnail || photo.name || "").replace(/\//g, "_");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function createCard(photo) {
    const id = photoId(photo);
    const article = document.createElement("article");
    article.className = "gallery-card fade-up";
    article.dataset.photoId = id;
    article.dataset.url = photo.url || "";
    article.dataset.name = photo.name || "Photo";
    article.dataset.created = photo.createdTime || "";

    const thumb = photo.thumbnail || photo.url || "";
    const full = photo.url || thumb;
    const name = photo.name || "Photo";

    article.innerHTML =
      '<button type="button" class="gallery-card-btn w-full text-left" data-lightbox>' +
      '<div class="card-image-wrap">' +
      '<img src="' +
      escapeHtml(thumb) +
      '" alt="' +
      escapeHtml(name) +
      '" loading="lazy" class="gallery-img" data-full="' +
      escapeHtml(full) +
      '">' +
      '<div class="card-overlay">' +
      '<span class="text-cream text-sm font-medium truncate">' +
      escapeHtml(name) +
      "</span>" +
      "</div></div></button>";

    return article;
  }

  function bindLightbox(card) {
    const btn = card.querySelector("[data-lightbox]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      openLightbox(
        card.dataset.url,
        card.dataset.name
      );
    });
  }

  function openLightbox(url, name) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = url;
    lightboxImg.alt = name;
    if (lightboxTitle) lightboxTitle.textContent = name;
    if (lightboxDownload && config.enableDownload) {
      lightboxDownload.href = url;
      lightboxDownload.download = name;
    }
    lightbox.classList.remove("hidden");
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    lightbox.classList.add("hidden");
    document.body.style.overflow = "";
    if (lightboxImg) lightboxImg.src = "";
  }

  function updateVisibility(hasPhotos) {
    if (empty) empty.classList.toggle("hidden", hasPhotos);
    if (grid) grid.classList.toggle("hidden", !hasPhotos);
  }

  function prependNewPhotos(photos) {
    if (!grid) return;
    const newOnes = [];

    photos.forEach(function (photo) {
      const id = photoId(photo);
      if (!knownIds.has(id)) {
        knownIds.add(id);
        newOnes.push(photo);
      }
    });

    newOnes.reverse().forEach(function (photo) {
      const card = createCard(photo);
      bindLightbox(card);
      grid.insertBefore(card, grid.firstChild);
    });

    updateVisibility(knownIds.size > 0);
  }

  function initExistingCards() {
    if (!grid) return;
    grid.querySelectorAll(".gallery-card").forEach(function (card) {
      const id = card.dataset.photoId;
      if (id) knownIds.add(id);
      bindLightbox(card);
    });
    updateVisibility(knownIds.size > 0);
  }

  function showSkeleton(show) {
    if (skeleton) skeleton.classList.toggle("hidden", !show);
    if (grid && show) grid.classList.add("hidden");
  }

  async function fetchPhotos() {
    try {
      const res = await fetch(config.apiUrl, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (err) {
      console.warn("Gallery refresh failed:", err);
      return null;
    }
  }

  async function refresh() {
    const photos = await fetchPhotos();
    if (photos === null) return;
    if (Array.isArray(photos) && photos.length) {
      prependNewPhotos(photos);
    } else if (knownIds.size === 0) {
      updateVisibility(false);
    }
  }

  /* Lightbox controls */
  if (lightbox) {
    lightbox.querySelectorAll("[data-lightbox-close]").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  initExistingCards();

  /* Initial load skeleton on first refresh if empty */
  if (knownIds.size === 0) {
    showSkeleton(true);
    refresh().then(function () {
      showSkeleton(false);
    });
  }

  setInterval(refresh, config.refreshInterval);
})();
