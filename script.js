const PRODUCTS = [
  {
    id: "q-grow",
    name: "Q-Grow",
    line: "Soil Conditioner",
    price: 85,
    img: "assets/q-grow.png",
    tag: "Q-Grow",
    desc: "An eco-friendly, pectin-powered soil conditioner that utilizes slow-release technology to maximize moisture retention and naturally nourish your plants."
  },
  {
    id: "diabetic-patches",
    name: "Q-Health: Diabetic Wounds Patches",
    line: "Protective Healing Patches",
    price: 65,
    img: "assets/diabetic-patches.png",
    tag: "Q-Health",
    desc: "Advanced, biocompatible hydrogel patches engineered from orange peel extracts to provide gentle, protective healing for high-risk superficial foot wounds."
  },
  {
    id: "general-patches",
    name: "Q-Health: General Wounds Patches",
    line: "Everyday First Aid",
    price: 65,
    img: "assets/general-patches.png",
    tag: "Q-Health",
    desc: "Your everyday, plant-derived first aid solution that comfortably seals out germs and supports the skin’s natural recovery from minor scrapes."
  },
  {
    id: "edible-spray",
    name: "Q-Guard: Edible Coating Spray",
    line: "Freshness Protection",
    price: 105,
    img: "assets/edible-spray.png",
    tag: "Q-Guard",
    desc: "An invisible, 100% food-safe pectin spray that locks in freshness and extends the shelf life of produce to drastically reduce food waste."
  }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const money = (number) => `${number} LE`;

const getUsers = () => JSON.parse(localStorage.getItem("qushoorUsers") || "[]");
const setUsers = (users) => localStorage.setItem("qushoorUsers", JSON.stringify(users));

const getCurrentUser = () => JSON.parse(localStorage.getItem("qushoorCurrentUser") || "null");
const setCurrentUser = (user) => localStorage.setItem("qushoorCurrentUser", JSON.stringify(user));

const cartKey = () => `qushoorCart_${getCurrentUser()?.email || "guest"}`;

const getCart = () => JSON.parse(localStorage.getItem(cartKey()) || "[]");

const setCart = (cart) => {
  localStorage.setItem(cartKey(), JSON.stringify(cart));
  updateHeader();
};

function requireLogin() {
  if (!getCurrentUser()) {
    localStorage.setItem(
      "qushoorAfterLogin",
      location.pathname.split("/").pop() || "index.html"
    );

    location.href = "login.html";
    return false;
  }

  return true;
}

function updateHeader() {
  const user = getCurrentUser();

  const userChip = $("#userChip");
  const authLink = $("#authLink");
  const cartCount = $("#cartCount");

  if (userChip) {
    userChip.textContent = user ? `Hi, ${user.name.split(" ")[0]}` : "Guest";
  }

  if (authLink) {
    authLink.textContent = user ? "Logout" : "Login";
    authLink.href = user ? "#" : "login.html";

    authLink.onclick = user
      ? (event) => {
          event.preventDefault();
          localStorage.removeItem("qushoorCurrentUser");
          location.href = "index.html";
        }
      : null;
  }

  if (cartCount) {
    cartCount.textContent = getCart().reduce((sum, item) => sum + item.qty, 0);
  }
}

function addToCart(id, qty = 1) {
  if (!requireLogin()) return;

  const product = PRODUCTS.find((item) => item.id === id);
  const cart = getCart();

  const found = cart.find((item) => item.id === id);

  if (found) {
    found.qty += qty;
  } else {
    cart.push({ id, qty });
  }

  setCart(cart);
  toast(`${product.name} added to cart`);
}

function toast(text) {
  let toastBox = $("#toast");

  if (!toastBox) {
    toastBox = document.createElement("div");
    toastBox.id = "toast";

    toastBox.style.cssText = `
      position: fixed;
      left: 50%;
      bottom: 24px;
      transform: translateX(-50%);
      background: #1f2520;
      color: #fff;
      padding: 13px 18px;
      border-radius: 999px;
      z-index: 2000;
      font-weight: 900;
      box-shadow: 0 12px 30px rgba(0,0,0,.18);
      text-align: center;
      max-width: 90%;
    `;

    document.body.appendChild(toastBox);
  }

  toastBox.textContent = text;
  toastBox.style.display = "block";

  setTimeout(() => {
    toastBox.style.display = "none";
  }, 1800);
}

function productCard(product) {
  return `
    <article class="card">
      <img class="card-img" src="${product.img}" alt="${product.name}">

      <div class="card-body">
        <span class="tag">${product.tag}</span>
        <h3>${product.name}</h3>
        <p>${product.desc}</p>
        <div class="price">${money(product.price)}</div>

        <button class="btn block" onclick="addToCart('${product.id}')">
          Add to Cart
        </button>
      </div>
    </article>
  `;
}

function renderProducts(limit) {
  const productsGrid = $("#productsGrid");

  if (!productsGrid) return;

  productsGrid.innerHTML = PRODUCTS
    .slice(0, limit || PRODUCTS.length)
    .map(productCard)
    .join("");
}

function renderCart() {
  if (!location.pathname.endsWith("cart.html")) return;
  if (!requireLogin()) return;

  const cartItems = $("#cartItems");
  const cartSummary = $("#cartSummary");

  if (!cartItems || !cartSummary) return;

  const cart = getCart();

  if (!cart.length) {
    cartItems.innerHTML = `
      <div class="empty">
        <h3>Your cart is empty</h3>
        <p>Start adding Qushoor products to place your order.</p>
        <br>
        <a class="btn" href="products.html">Shop Products</a>
      </div>
    `;

    cartSummary.innerHTML = `
      <div class="summary-row total">
        <span>Total</span>
        <span>0 LE</span>
      </div>
    `;

    return;
  }

  let total = 0;

  cartItems.innerHTML = cart
    .map((item) => {
      const product = PRODUCTS.find((product) => product.id === item.id);
      const subtotal = product.price * item.qty;

      total += subtotal;

      return `
        <div class="cart-item">
          <img src="${product.img}" alt="${product.name}">

          <div>
            <h3>${product.name}</h3>
            <p>${money(product.price)} each</p>

            <div class="qty">
              <button onclick="changeQty('${product.id}', -1)">-</button>
              <input value="${item.qty}" readonly>
              <button onclick="changeQty('${product.id}', 1)">+</button>
            </div>
          </div>

          <div>
            <b>${money(subtotal)}</b>
            <br><br>
            <button class="remove" onclick="removeItem('${product.id}')">
              Remove
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  cartSummary.innerHTML = `
    <div class="summary-row">
      <span>Items</span>
      <span>${cart.reduce((sum, item) => sum + item.qty, 0)}</span>
    </div>

    <div class="summary-row">
      <span>Subtotal</span>
      <span>${money(total)}</span>
    </div>

    <div class="summary-row total">
      <span>Total</span>
      <span>${money(total)}</span>
    </div>

    <a class="btn block" href="checkout.html">Checkout</a>
  `;
}

function changeQty(id, number) {
  const cart = getCart();
  const item = cart.find((item) => item.id === id);

  if (!item) return;

  item.qty += number;

  const updatedCart = cart.filter((item) => item.qty > 0);

  setCart(updatedCart);
  renderCart();
  renderCheckout();
}

function removeItem(id) {
  setCart(getCart().filter((item) => item.id !== id));

  renderCart();
  renderCheckout();
}

function renderCheckout() {
  if (!location.pathname.endsWith("checkout.html")) return;
  if (!requireLogin()) return;

  const cart = getCart();
  const checkoutList = $("#checkoutList");
  const checkoutForm = $("#checkoutForm");
  const checkoutGrid = $("#checkoutGrid");

  if (!checkoutList || !checkoutForm) return;

  if (!cart.length) {
    if (checkoutGrid) {
      checkoutGrid.innerHTML = `
        <div class="empty">
          <h3>Your cart is empty.</h3>
          <p>Add products first before checkout.</p>
          <br>
          <a class="btn" href="products.html">Shop Products</a>
        </div>
      `;
    }

    return;
  }

  let total = 0;

  checkoutList.innerHTML =
    cart
      .map((item) => {
        const product = PRODUCTS.find((product) => product.id === item.id);
        const subtotal = product.price * item.qty;

        total += subtotal;

        return `
          <div class="order-line">
            <span>${product.name} × ${item.qty}</span>
            <b>${money(subtotal)}</b>
          </div>
        `;
      })
      .join("") +
    `
      <div class="order-line">
        <strong>Total</strong>
        <strong>${money(total)}</strong>
      </div>
    `;
}

function setupForms() {
  const registerForm = $("#registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = $("#regName").value.trim();
      const email = $("#regEmail").value.trim().toLowerCase();
      const password = $("#regPass").value;

      const alertBox = $("#formAlert");
      const users = getUsers();

      if (users.some((user) => user.email === email)) {
        alertBox.className = "alert err";
        alertBox.textContent = "This email is already registered.";
        return;
      }

      const user = { name, email, password };

      users.push(user);

      setUsers(users);
      setCurrentUser({ name, email });

      location.href = localStorage.getItem("qushoorAfterLogin") || "products.html";
    });
  }

  const loginForm = $("#loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = $("#loginEmail").value.trim().toLowerCase();
      const password = $("#loginPass").value;

      const alertBox = $("#formAlert");

      const user = getUsers().find(
        (item) => item.email === email && item.password === password
      );

      if (!user) {
        alertBox.className = "alert err";
        alertBox.textContent = "Wrong email or password.";
        return;
      }

      setCurrentUser({
        name: user.name,
        email: user.email
      });

      location.href = localStorage.getItem("qushoorAfterLogin") || "products.html";
    });
  }

  const checkoutForm = $("#checkoutForm");

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const order = {
        user: getCurrentUser(),
        cart: getCart(),
        customer: {
          name: $("#customerName").value.trim(),
          phone: $("#phone").value.trim(),
          city: $("#city").value.trim(),
          address: $("#address").value.trim(),
          notes: $("#notes").value.trim()
        },
        date: new Date().toISOString()
      };

      const orders = JSON.parse(localStorage.getItem("qushoorOrders") || "[]");

      orders.push(order);

      localStorage.setItem("qushoorOrders", JSON.stringify(orders));

      setCart([]);

      const checkoutGrid = $("#checkoutGrid");
      const successBox = $("#successBox");

      if (checkoutGrid) {
        checkoutGrid.style.display = "none";
      }

      if (successBox) {
        successBox.classList.add("show");

        successBox.innerHTML = `
          <div class="success-page">
            <div class="success-icon">✓</div>

            <h1>Order Confirmed</h1>

            <p>
              Your order has been placed successfully.
              Our team will contact you shortly to confirm your order.
            </p>

            <a href="products.html" class="btn">Continue Shopping</a>
          </div>
        `;
      } else {
        alert(
          "Your order has been placed successfully. Our team will contact you shortly to confirm your order."
        );
      }

      updateHeader();
    });
  }
}

function setupMobileNav() {
  const menuButton = $("#menuBtn");
  const navLinks = $("#navLinks");

  if (!menuButton || !navLinks) return;

  menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

function markActive() {
  const page = location.pathname.split("/").pop() || "index.html";

  $$("[data-page]").forEach((link) => {
    if (link.dataset.page === page) {
      link.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateHeader();
  setupMobileNav();
  markActive();
  renderProducts();
  renderCart();
  renderCheckout();
  setupForms();
});