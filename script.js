/* global document */
/* exported addToCart, removeFromCart */

var PRODUCTS = [
  { id: "p1", title: "Smartphone 128GB", category: "electronique", price: 1250000, currency: "GNF", tag: "promo" },
  { id: "p2", title: "Chaussures sport", category: "mode", price: 320000, currency: "XOF", tag: "new" },
  { id: "p3", title: "Parfum premium", category: "hygiene", price: 95000, currency: "XOF", tag: "promo" },
  { id: "p4", title: "Riz local 25kg", category: "alimentation", price: 180000, currency: "XOF", tag: "best" },
  { id: "p5", title: "Sac scolaire", category: "fournitures", price: 85000, currency: "XOF", tag: "new" },
  { id: "p6", title: "Bracelet artisanal", category: "artisanat", price: 45000, currency: "XOF", tag: "best" }
];

var state = {
  query: "",
  category: "all",
  activeFilter: "all",
  cart: {}
};

function formatMoney(value, currency) {
  return value.toLocaleString("fr-FR") + " " + currency;
}

function prettyCategory(cat) {
  var map = {
    all: "Toutes catégories",
    electronique: "Électronique",
    mode: "Mode",
    hygiene: "Hygiène",
    alimentation: "Alimentation",
    fournitures: "Fournitures scolaires",
    culture: "Produits culturels",
    artisanat: "Artisanat"
  };
  return map[cat] || cat;
}

function matchesFilter(p) {
  var qOk = !state.query || p.title.toLowerCase().indexOf(state.query.toLowerCase()) !== -1;
  var catOk = state.category === "all" || p.category === state.category;
  var tagOk = state.activeFilter === "all" || p.tag === state.activeFilter;
  return qOk && catOk && tagOk;
}

function findProductById(id) {
  for (var i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].id === id) return PRODUCTS[i];
  }
  return null;
}

/* ====== PRODUITS ====== */
function renderProducts() {
  var grid = document.getElementById("productGrid");
  var empty = document.getElementById("emptyState");
  if (!grid) return;

  var html = "";
  var count = 0;

  for (var i = 0; i < PRODUCTS.length; i++) {
    var p = PRODUCTS[i];
    if (!matchesFilter(p)) continue;
    count++;

    html +=
      '<article class="product-card">' +
        '<div class="product-media">' +
          '<div class="tag">' + p.tag + '</div>' +
          '<div class="img-placeholder">Image</div>' +
        '</div>' +
        '<div class="product-body">' +
          '<div class="product-title">' + p.title + '</div>' +
          '<div class="product-meta">' + prettyCategory(p.category) + '</div>' +
          '<div class="product-price"><span class="price">' +
            formatMoney(p.price, p.currency) +
          '</span></div>' +
          '<button class="btn primary" onclick="addToCart(\'' + p.id + '\')">Ajouter au panier</button>' +
        '</div>' +
      '</article>';
  }

  grid.innerHTML = html;
  if (empty) empty.style.display = count ? "none" : "block";
}

/* ====== PANIER ====== */
function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  renderCart();
}

function removeFromCart(id) {
  delete state.cart[id];
  renderCart();
}

function renderCart() {
  var countEl = document.getElementById("cartCount");
  var totalEl = document.getElementById("cartTotal");
  var list = document.getElementById("cartDrawerList");

  var items = 0;
  var total = 0;
  var html = "";
  var hasItems = false;

  for (var id in state.cart) {
    if (!state.cart.hasOwnProperty(id)) continue;
    hasItems = true;

    var qty = state.cart[id];
    var p = findProductById(id);
    if (!p) continue;

    items += qty;
    total += p.price * qty;

    html +=
      '<div class="cart-item">' +
        '<div class="cart-item-left"><b>' + p.title + '</b><small>' +
          formatMoney(p.price, p.currency) +
        '</small></div>' +
        '<div class="cart-item-right">' +
          '<span class="qty">x' + qty + '</span>' +
          '<button class="remove-btn" onclick="removeFromCart(\'' + id + '\')">✕</button>' +
        '</div>' +
      '</div>';
  }

  if (countEl) countEl.textContent = items;
  if (totalEl) totalEl.textContent = formatMoney(total, "XOF");

  if (list) {
    list.innerHTML = hasItems ? html : '<p style="color:#aaa;margin:0;">Panier vide</p>';
  }
}

/* ====== UI / EVENTS ====== */
function doSearch() {
  var input = document.getElementById("searchInput");
  state.query = input ? (input.value || "").trim() : "";
  renderProducts();
}

function setActiveNav(category) {
  var links = document.querySelectorAll(".nav-link");
  for (var i = 0; i < links.length; i++) {
    links[i].classList.remove("active");
    if (links[i].getAttribute("data-category") === category) {
      links[i].classList.add("active");
    }
  }
}

function goToProducts() {
  var section = document.getElementById("products");
  if (section && section.scrollIntoView) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

function bindNavCategories() {
  var links = document.querySelectorAll(".nav-link[data-category]");
  for (var i = 0; i < links.length; i++) {
    (function(link){
      link.addEventListener("click", function(e){
        e.preventDefault();
        state.category = link.getAttribute("data-category") || "all";
        setActiveNav(state.category);
        renderProducts();
        goToProducts();
      });
    })(links[i]);
  }
}

function bindFilters() {
  var filters = document.querySelectorAll(".filter[data-filter]");
  for (var i = 0; i < filters.length; i++) {
    (function(btn){
      btn.addEventListener("click", function(){
        // active UI
        var all = document.querySelectorAll(".filter");
        for (var k = 0; k < all.length; k++) all[k].classList.remove("active");
        btn.classList.add("active");

        // set state
        state.activeFilter = btn.getAttribute("data-filter") || "all";
        renderProducts();
      });
    })(filters[i]);
  }
}

function bindCartDrawer() {
  var openCart = document.getElementById("openCart");
  var closeCart = document.getElementById("closeCart");
  var overlay = document.getElementById("overlay");
  var drawer = document.getElementById("cartDrawer");

  function showCart() {
    if (drawer) drawer.classList.add("open");
    if (overlay) overlay.classList.add("show");
  }
  function hideCart() {
    if (drawer) drawer.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
  }

  if (openCart) openCart.addEventListener("click", showCart);
  if (closeCart) closeCart.addEventListener("click", hideCart);
  if (overlay) overlay.addEventListener("click", hideCart);
}

/* ===== Init ===== */
document.addEventListener("DOMContentLoaded", function () {
  var searchBtn = document.getElementById("searchBtn");
  if (searchBtn) searchBtn.onclick = doSearch;

  bindNavCategories();   // ✅ active le menu
  bindFilters();         // ✅ active les filtres
  bindCartDrawer();      // ✅ ouvre/ferme le panier

  renderProducts();
  renderCart();
  setActiveNav("all");
});
