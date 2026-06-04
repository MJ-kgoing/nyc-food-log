/**
 * Optional photos per place:
 * - One photo: `image: "./images/your-photo.jpg"`
 * - Multiple photos: `images: ["./images/photo-1.jpg", "./images/photo-2.jpg"]`
 * Omit both if you do not have a photo yet.
 *
 * `cuisine`, `borough`, `neighborhood`: used only for filters/tabs—not shown on the receipt.
 *
 * `recommendedDishes`: array of { dish, note? } — `note` appears on the right (receipt-style line).
 */
const places = [
  {
    name: "Osamil",
    type: "restaurant",
    cuisine: "Korean",
    borough: "Manhattan",
    neighborhood: "Midtown",
    price: "50-100",
    needsReservation: true,
    recommendedDishes: [
      { dish: "Beef Tartar", note: "" },
      { dish: "Kimchi Fried Rice with Steak", note: "" },
    ],
    images: [
      "images/Osamil/beef tartar.jpg",
      "images/Osamil/osamil2.jpg",
      "images/Osamil/osamil3.jpg",
    ],
  },
  {
    name: "Laser Wolf",
    type: "restaurant",
    cuisine: "Israeli",
    borough: "Brooklyn",
    neighborhood: "Williamsburg",
    price: "$$$",
    needsReservation: true,
    recommendedDishes: [
      { dish: "Salatim spread", note: "" },
      { dish: "Skirt steak skewer", note: "" },
    ],
    notes: "Amazing salatim spread and skyline view.",
  },
  {
    name: "Double Chicken Please",
    type: "bar",
    cuisine: "Cocktail Bar",
    borough: "Manhattan",
    neighborhood: "Lower East Side",
    price: "$$$",
    needsReservation: true,
    recommendedDishes: [
      { dish: "Cold Pizza", note: "" },
      { dish: "French toast", note: "" },
      { dish: "Key lime pie martini", note: "" },
    ],
    notes: "Creative drinks that taste like full dishes.",
  },
  {
    name: "Golden Diner",
    type: "restaurant",
    cuisine: "Diner",
    borough: "Manhattan",
    neighborhood: "Chinatown",
    price: "$$",
    needsReservation: false,
    recommendedDishes: [{ dish: "Maple hazelnut pancake", note: "" }, { dish: "Egg sandwich", note: "" }],
    notes: "The pancake was worth the hype.",
  },
  {
    name: "Clover Club",
    type: "bar",
    cuisine: "Cocktail Bar",
    borough: "Brooklyn",
    neighborhood: "Cobble Hill",
    price: "$$",
    needsReservation: true,
    recommendedDishes: [{ dish: "Aviation", note: "" }, { dish: "Bee's knees", note: "" }],
    notes: "Classic cocktails and cozy low-light vibe.",
  },
];

const cardsEl = document.querySelector("#cards");
const statsEl = document.querySelector("#stats");
const cuisineTabsEl = document.querySelector("#cuisineTabs");
const neighborhoodFilter = document.querySelector("#neighborhoodFilter");
const typeFilter = document.querySelector("#typeFilter");
const searchInput = document.querySelector("#searchInput");
const photoModal = document.querySelector("#photoModal");
const photoModalImage = document.querySelector("#photoModalImage");
const photoModalCaption = document.querySelector("#photoModalCaption");
const photoModalThumbs = document.querySelector("#photoModalThumbs");
const photoModalPrev = document.querySelector(".photo-modal__nav--prev");
const photoModalNext = document.querySelector(".photo-modal__nav--next");

let selectedCuisine = "all";
let activePhotoList = [];
let activePhotoTitle = "";
let activePhotoIndex = 0;

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function reservationLabel(needsReservation) {
  return needsReservation ? "Reservation recommended" : "Walk-ins welcome";
}

function dishesSearchText(entry) {
  const list = Array.isArray(entry.recommendedDishes) ? entry.recommendedDishes : [];
  return list
    .map((row) =>
      typeof row === "string" ? row : [row.dish, row.note].filter(Boolean).join(" ")
    )
    .join(" ");
}

function entryImages(entry) {
  if (Array.isArray(entry.images) && entry.images.length) {
    return entry.images.filter(Boolean);
  }
  return entry.image ? [entry.image] : [];
}

function populateNeighborhoods() {
  const neighborhoods = [...new Set(places.map((entry) => entry.neighborhood))].sort();
  neighborhoods.forEach((neighborhood) => {
    const option = document.createElement("option");
    option.value = neighborhood.toLowerCase();
    option.textContent = neighborhood;
    neighborhoodFilter.append(option);
  });
}

function populateCuisineTabs() {
  const cuisines = [
    ...new Set(
      places.filter((entry) => entry.type === "restaurant").map((entry) => entry.cuisine)
    ),
  ].sort((a, b) => a.localeCompare(b));

  const list = document.createElement("div");
  list.className = "cuisine-tabs__list";
  list.setAttribute("role", "tablist");

  function addTab(label, value) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cuisine-tab";
    btn.setAttribute("role", "tab");
    btn.dataset.cuisine = value;
    btn.textContent = label;
    const isActive = value === selectedCuisine;
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
    if (isActive) btn.classList.add("cuisine-tab--active");
    list.append(btn);
  }

  addTab("All", "all");
  cuisines.forEach((cuisine) => addTab(cuisine, cuisine));

  cuisineTabsEl.append(list);

  cuisineTabsEl.addEventListener("click", (event) => {
    const tab = event.target.closest(".cuisine-tab");
    if (!tab || !cuisineTabsEl.contains(tab)) return;

    selectedCuisine = tab.dataset.cuisine || "all";

    cuisineTabsEl.querySelectorAll(".cuisine-tab").forEach((btn) => {
      const active = btn.dataset.cuisine === selectedCuisine;
      btn.setAttribute("aria-selected", active ? "true" : "false");
      btn.classList.toggle("cuisine-tab--active", active);
    });

    applyFilters();
  });
}

function updateCuisineTabsVisibility() {
  cuisineTabsEl.hidden = typeFilter.value !== "restaurant";
}

function updatePageTheme() {
  document.body.classList.remove("theme-all", "theme-restaurant", "theme-bar");
  document.body.classList.add(`theme-${typeFilter.value}`);
}

function renderDishRows(entry) {
  const rows = Array.isArray(entry.recommendedDishes) ? entry.recommendedDishes : [];
  if (!rows.length) {
    return `<p class="receipt__empty-dishes">— add recommended dishes in script.js —</p>`;
  }
  return rows
    .map((row) => {
      const dish = typeof row === "string" ? row : row.dish;
      const note = typeof row === "string" ? "" : row.note || "";
      const left = escapeHtml(dish.trim());
      const right = note ? escapeHtml(note.trim()) : "";
      return `<div class="receipt__line"><span class="receipt__line-left">${left}</span><span class="receipt__line-right">${right}</span></div>`;
    })
    .join("");
}

function render(entries) {
  if (!entries.length) {
    cardsEl.innerHTML = `<div class="empty">No places found for this filter.</div>`;
    statsEl.textContent = "0 places shown";
    return;
  }

  const restaurants = entries.filter((entry) => entry.type === "restaurant").length;
  const bars = entries.filter((entry) => entry.type === "bar").length;

  statsEl.textContent = `${entries.length} places shown (${restaurants} restaurants, ${bars} bars)`;

  cardsEl.innerHTML = entries
    .map((entry) => {
      const name = escapeHtml(entry.name);
      const price = escapeHtml(entry.price ?? "—");
      const resText = escapeHtml(reservationLabel(entry.needsReservation));
      const imageList = entryImages(entry);
      const imageSrc = imageList.length ? escapeHtml(imageList[0]) : "";
      const imagePayload = imageList.length ? escapeHtml(JSON.stringify(imageList)) : "";
      const imageCount = imageList.length;
      const hasNote = Boolean(entry.notes && String(entry.notes).trim());
      const noteText = hasNote ? escapeHtml(String(entry.notes).trim()) : "";

      const media = imageList.length
        ? `<button class="receipt__photo" type="button" data-photo-list="${imagePayload}" data-photo-title="${name}" aria-label="View ${imageCount} photo${imageCount === 1 ? "" : "s"} for ${name}"><img src="${imageSrc}" alt="" loading="lazy" width="120" height="160" />${imageCount > 1 ? `<span class="receipt__photo-count">${imageCount}</span>` : ""}</button>`
        : "";

      const cardClass = imageList.length
        ? `receipt-card receipt-card--${entry.type} receipt-card--photo`
        : `receipt-card receipt-card--${entry.type} receipt-card--plain`;

      return `
        <article class="${cardClass}">
          ${media}
          <div class="receipt">
            <div class="receipt__tear" aria-hidden="true"></div>
            <h2 class="receipt__title">${name}</h2>
            <div class="receipt__meta">
              <div class="receipt__meta-row"><span>Price range</span><span>${price}</span></div>
              <div class="receipt__meta-row"><span>Reservation</span><span>${resText}</span></div>
            </div>
            <div class="receipt__divider receipt__divider--heavy" aria-hidden="true">${"*".repeat(28)}</div>
            <p class="receipt__section-title">Recommended Dishes</p>
            <div class="receipt__lines">${renderDishRows(entry)}</div>
            ${
              hasNote
                ? `<p class="receipt__note-title">Note</p><p class="receipt__note-body">${noteText}</p>`
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");
}

function renderPhotoModal() {
  if (!photoModalImage || !photoModalCaption || !photoModalThumbs) return;

  const src = activePhotoList[activePhotoIndex] || "";
  photoModalImage.src = src;
  photoModalImage.alt = activePhotoTitle ? `${activePhotoTitle} photo ${activePhotoIndex + 1}` : "Place photo";
  photoModalCaption.textContent =
    activePhotoList.length > 1
      ? `${activePhotoTitle} · ${activePhotoIndex + 1} / ${activePhotoList.length}`
      : activePhotoTitle;

  photoModalThumbs.innerHTML = activePhotoList
    .map((photo, index) => {
      const escapedPhoto = escapeHtml(photo);
      const active = index === activePhotoIndex;
      return `<button class="photo-modal__thumb${active ? " photo-modal__thumb--active" : ""}" type="button" data-photo-index="${index}" aria-label="Show photo ${index + 1}"><img src="${escapedPhoto}" alt="" /></button>`;
    })
    .join("");

  const hasMany = activePhotoList.length > 1;
  if (photoModalPrev) photoModalPrev.hidden = !hasMany;
  if (photoModalNext) photoModalNext.hidden = !hasMany;
  photoModalThumbs.hidden = !hasMany;
}

function openPhotoModal(images, title, index = 0) {
  if (!photoModal || !photoModalImage || !photoModalCaption) return;

  activePhotoList = images;
  activePhotoTitle = title || "";
  activePhotoIndex = Math.min(Math.max(index, 0), Math.max(images.length - 1, 0));
  renderPhotoModal();
  photoModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function showPhotoAt(index) {
  if (!activePhotoList.length) return;
  activePhotoIndex = (index + activePhotoList.length) % activePhotoList.length;
  renderPhotoModal();
}

function closePhotoModal() {
  if (!photoModal || !photoModalImage || !photoModalCaption) return;

  photoModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  activePhotoList = [];
  activePhotoTitle = "";
  activePhotoIndex = 0;
  photoModalImage.src = "";
  photoModalImage.alt = "";
  photoModalCaption.textContent = "";
  if (photoModalThumbs) photoModalThumbs.innerHTML = "";
}

function applyFilters() {
  const typeValue = typeFilter.value;
  const neighborhoodValue = neighborhoodFilter.value;
  const searchValue = searchInput.value.trim().toLowerCase();

  const filtered = places.filter((entry) => {
    const matchesType = typeValue === "all" || entry.type === typeValue;
    const matchesNeighborhood =
      neighborhoodValue === "all" || entry.neighborhood.toLowerCase() === neighborhoodValue;
    const matchesCuisine =
      typeValue !== "restaurant" ||
      selectedCuisine === "all" ||
      entry.cuisine === selectedCuisine;
    const dishBlob = dishesSearchText(entry).toLowerCase();
    const searchable = `${entry.name} ${entry.cuisine} ${entry.neighborhood} ${entry.borough} ${entry.notes} ${entry.price} ${reservationLabel(entry.needsReservation)} ${dishBlob} ${entryImages(entry).join(" ")}`
      .toLowerCase();
    const matchesSearch = !searchValue || searchable.includes(searchValue);

    return matchesType && matchesNeighborhood && matchesCuisine && matchesSearch;
  });

  updatePageTheme();
  updateCuisineTabsVisibility();
  render(filtered);
}

[typeFilter, neighborhoodFilter, searchInput].forEach((control) => {
  control.addEventListener("input", applyFilters);
  control.addEventListener("change", applyFilters);
});

cardsEl.addEventListener("click", (event) => {
  const photoButton = event.target.closest(".receipt__photo");
  if (!photoButton || !cardsEl.contains(photoButton)) return;

  const images = JSON.parse(photoButton.dataset.photoList || "[]");
  openPhotoModal(images, photoButton.dataset.photoTitle || "");
});

photoModal?.addEventListener("click", (event) => {
  if (event.target.closest(".photo-modal__close") || event.target.closest(".photo-modal__backdrop")) {
    closePhotoModal();
    return;
  }

  if (event.target.closest(".photo-modal__nav--prev")) {
    showPhotoAt(activePhotoIndex - 1);
    return;
  }

  if (event.target.closest(".photo-modal__nav--next")) {
    showPhotoAt(activePhotoIndex + 1);
    return;
  }

  const thumb = event.target.closest(".photo-modal__thumb");
  if (thumb && photoModal.contains(thumb)) {
    showPhotoAt(Number(thumb.dataset.photoIndex || 0));
  }
});

document.addEventListener("keydown", (event) => {
  if (photoModal?.getAttribute("aria-hidden") !== "false") return;

  if (event.key === "Escape") {
    closePhotoModal();
  } else if (event.key === "ArrowLeft") {
    showPhotoAt(activePhotoIndex - 1);
  } else if (event.key === "ArrowRight") {
    showPhotoAt(activePhotoIndex + 1);
  }
});

populateNeighborhoods();
populateCuisineTabs();
applyFilters();
