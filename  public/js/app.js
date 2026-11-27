
/* =========================================
   IRANGARD - APPLICATION ENGINE
   Hirkan Develop Group
   Vanilla JavaScript ES6+
   ========================================= */

"use strict";

/* =========================================
   CONFIGURATION
   ========================================= */

const CONFIG = {
    appName: "Irangard",
    developer: "Hirkan Develop Group",
    developerUrl: "https://hdg.hirkansara.ir",

    defaultLanguage: "fa",
    defaultTheme: "light",

    supportedLanguages: ["fa", "en", "fr", "es", "pt", "ar"],

    localePath: "./locales/",

    storage: {
        language: "irangard_language",
        theme: "irangard_theme"
    }
};

/* =========================================
   APPLICATION STATE
   ========================================= */

const App = {
    language: localStorage.getItem(CONFIG.storage.language)
        || CONFIG.defaultLanguage,

    theme: localStorage.getItem(CONFIG.storage.theme)
        || CONFIG.defaultTheme,

    translations: {},

    currentRoute: null,

    previousRoutes: [],

    content: null
};

/* =========================================
   DOM ELEMENTS
   ========================================= */

const DOM = {
    app: document.getElementById("app-content"),
    backButton: document.getElementById("back-button"),
    themeToggle: document.getElementById("theme-toggle"),
    themeIcon: document.getElementById("theme-icon"),
    languageToggle: document.getElementById("language-toggle")
};

/* =========================================
   HELPERS
   ========================================= */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function translate(key) {
    const keys = key.split(".");
    let result = App.translations;

    for (const part of keys) {
        if (result && typeof result === "object") {
            result = result[part];
        } else {
            return key;
        }
    }

    return typeof result === "string" ? result : key;
}

function isRTL(language) {
    return ["fa", "ar"].includes(language);
}

/* =========================================
   LANGUAGE MANAGEMENT
   ========================================= */

async function loadLanguage(language) {
    if (!CONFIG.supportedLanguages.includes(language)) {
        language = CONFIG.defaultLanguage;
    }

    try {
        const response = await fetch(
            `${CONFIG.localePath}${language}.json`
        );

        if (!response.ok) {
            throw new Error("Could not load language file");
        }

        const translations = await response.json();

        App.language = language;
        App.translations = translations;

        localStorage.setItem(
            CONFIG.storage.language,
            language
        );

        document.documentElement.lang = language;

        document.documentElement.dir = isRTL(language)
            ? "rtl"
            : "ltr";

        updateLanguageButton();
        updateStaticTranslations();

        if (App.currentRoute) {
            renderRoute(App.currentRoute, false);
        }

    } catch (error) {
        console.error("Language loading error:", error);

        if (language !== CONFIG.defaultLanguage) {
            await loadLanguage(CONFIG.defaultLanguage);
        }
    }
}

function switchLanguage() {
    const currentIndex = CONFIG.supportedLanguages.indexOf(
        App.language
    );

    const nextIndex = (
        currentIndex + 1
    ) % CONFIG.supportedLanguages.length;

    loadLanguage(CONFIG.supportedLanguages[nextIndex]);
}

function updateLanguageButton() {
    if (!DOM.languageToggle) return;

    DOM.languageToggle.textContent =
        App.language === "fa" ? "EN" : "FA";
}

function updateStaticTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;

        element.textContent = translate(key);
    });
}

/* =========================================
   THEME MANAGEMENT
   ========================================= */

function applyTheme(theme) {
    if (!["light", "dark"].includes(theme)) {
        theme = CONFIG.defaultTheme;
    }

    App.theme = theme;

    document.documentElement.dataset.theme = theme;

    localStorage.setItem(
        CONFIG.storage.theme,
        theme
    );

    if (DOM.themeIcon) {
        DOM.themeIcon.textContent =
            theme === "dark" ? "☀" : "☾";
    }

    const themeMeta = document.querySelector(
        'meta[name="theme-color"]'
    );

    if (themeMeta) {
        themeMeta.setAttribute(
            "content",
            theme === "dark" ? "#0f172a" : "#0f766e"
        );
    }
}

function toggleTheme() {
    const nextTheme = App.theme === "light"
        ? "dark"
        : "light";

    applyTheme(nextTheme);

    if (App.currentRoute) {
        renderRoute(App.currentRoute, false);
    }
}

/* =========================================
   ROUTER
   ========================================= */

function getRoute() {
    const hash = window.location.hash || "#/home";

    const path = hash.replace(/^#\/?/, "");

    const parts = path.split("/").filter(Boolean);

    return {
        path,
        parts,
        name: parts[0] || "home",
        id: parts[1] || null
    };
}

function navigate(path) {
    const normalized = path.startsWith("#")
        ? path
        : `#/${path.replace(/^\/+/, "")}`;

    if (window.location.hash === normalized) {
        handleRoute();
        return;
    }

    if (App.currentRoute) {
        App.previousRoutes.push(
            App.currentRoute.path
        );

        if (App.previousRoutes.length > 30) {
            App.previousRoutes.shift();
        }
    }

    window.location.hash = normalized;
}

function goBack() {
    if (App.previousRoutes.length > 0) {
        const previous = App.previousRoutes.pop();

        window.location.hash = `#/${previous}`;

        return;
    }

    navigate("home");
}

function handleRoute() {
    const route = getRoute();

    App.currentRoute = route;

    renderRoute(route);

    updateNavigation(route);

    updateBackButton(route);
}

/* =========================================
   NAVIGATION UI
   ========================================= */

function updateNavigation(route) {
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.route === route.name
        );
    });
}

function updateBackButton(route) {
    if (!DOM.backButton) return;

    const showBackButton = ![
        "home",
        "provinces"
    ].includes(route.name);

    DOM.backButton.hidden = !showBackButton;
}

/* =========================================
   REUSABLE HIRKAN PROMO BANNER
   ========================================= */

function renderHirkanBanner() {
    return `
        <aside
            class="hirkan-banner"
            aria-label="${escapeHTML(translate("hirkan.title"))}"
        >
            <div class="hirkan-banner-content">

                <h3 class="hirkan-banner-title">
                    ${escapeHTML(translate("hirkan.title"))}
                </h3>

                <p class="hirkan-banner-description">
                    ${escapeHTML(translate("hirkan.description"))}
                </p>

            </div>

            <a
                class="hirkan-banner-link"
                href="${CONFIG.developerUrl}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ${escapeHTML(translate("hirkan.button"))}
            </a>

        </aside>
    `;
}

/* =========================================
   PAGE LAYOUT
   ========================================= */

function renderPage(content) {
    DOM.app.innerHTML = `
        <div class="page-content">
            ${content}
        </div>

        ${renderHirkanBanner()}
    `;
}

/* =========================================
   HOME PAGE
   ========================================= */

function renderHome() {
    return `
        <section class="home-page">

            <div class="home-hero">

                <span class="badge">
                    ${escapeHTML(translate("home.badge"))}
                </span>

                <h1 class="page-title">
                    ${escapeHTML(translate("home.title"))}
                </h1>

                <p class="page-subtitle">
                    ${escapeHTML(translate("home.description"))}
                </p>

            </div>

            <div class="search-container">

                <input
                    type="search"
                    id="home-search"
                    class="input"
                    placeholder="${escapeHTML(
                        translate("home.search")
                    )}"
                    aria-label="${escapeHTML(
                        translate("home.search")
                    )}"
                >

            </div>

            <section>

                <h2 class="section-title">
                    ${escapeHTML(translate("home.provinces"))}
                </h2>

                <div class="card">

                    <div class="card-title">
                        ${escapeHTML(translate("home.province_intro"))}
                    </div>

                    <p class="card-description">
                        ${escapeHTML(translate("home.province_description"))}
                    </p>

                    <button
                        class="button"
                        type="button"
                        data-action="provinces"
                        style="margin-top: 16px"
                    >
                        ${escapeHTML(translate("home.explore"))}
                    </button>

                </div>

            </section>

            <section>

                <h2 class="section-title">
                    ${escapeHTML(translate("home.discover"))}
                </h2>

                <div class="grid">

                    <a href="#/travel-info" class="card card-clickable">
                        <div class="card-title">✈</div>
                        <p class="card-description">
                            ${escapeHTML(translate("nav.travel_info"))}
                        </p>
                    </a>

                    <a href="#/favorites" class="card card-clickable">
                        <div class="card-title">♡</div>
                        <p class="card-description">
                            ${escapeHTML(translate("nav.favorites"))}
                        </p>
                    </a>

                </div>

            </section>

        </section>
    `;
}

/* =========================================
   PROVINCES PAGE
   ========================================= */

function renderProvinces() {
    return `
        <section>

            <h1 class="page-title">
                ${escapeHTML(translate("nav.provinces"))}
            </h1>

            <p class="page-subtitle">
                ${escapeHTML(translate("provinces.description"))}
            </p>

            <div class="empty-state">

                <div style="font-size: 40px">🗺️</div>

                <p>
                    ${escapeHTML(translate("provinces.coming_soon"))}
                </p>

            </div>

        </section>
    `;
}

/* =========================================
   GENERIC DETAIL PAGES
   ========================================= */

function renderDetailPage(type, id) {
    const labels = {
        province: "province",
        city: "city",
        attraction: "attraction"
    };

    const label = labels[type];

    return `
        <section>

            <h1 class="page-title">
                ${escapeHTML(translate(`${label}.title`))}
            </h1>

            <div class="card">

                <p class="card-description">
                    ${escapeHTML(translate("common.item_id"))}:
                    ${escapeHTML(id || "")}
                </p>

                <p>
                    ${escapeHTML(translate("common.coming_soon"))}
                </p>

            </div>

        </section>
    `;
}

/* =========================================
   TRAVEL INFO PAGE
   ========================================= */

function renderTravelInfo() {
    return `
        <section>

            <h1 class="page-title">
                ${escapeHTML(translate("nav.travel_info"))}
            </h1>

            <p class="page-subtitle">
                ${escapeHTML(translate("travel.description"))}
            </p>

            <div class="card">
                <h2 class="card-title">
                    ${escapeHTML(translate("travel.before"))}
                </h2>

                <p class="card-description">
                    ${escapeHTML(translate("travel.before_description"))}
                </p>
            </div>

            <div class="card" style="margin-top: 12px">
                <h2 class="card-title">
                    ${escapeHTML(translate("travel.during"))}
                </h2>

                <p class="card-description">
                    ${escapeHTML(translate("travel.during_description"))}
                </p>
            </div>

        </section>
    `;
}

/* =========================================
   FAVORITES PAGE
   ========================================= */

function renderFavorites() {
    return `
        <section>

            <h1 class="page-title">
                ${escapeHTML(translate("nav.favorites"))}
            </h1>

            <div class="empty-state">

                <div style="font-size: 40px">♡</div>

                <p>
                    ${escapeHTML(translate("favorites.empty"))}
                </p>

            </div>

        </section>
    `;
}

/* =========================================
   SETTINGS PAGE
   ========================================= */

function renderSettings() {
    return `
        <section>

            <h1 class="page-title">
                ${escapeHTML(translate("nav.settings"))}
            </h1>

            <div class="settings-group">

                <h2 class="section-title">
                    ${escapeHTML(translate("settings.appearance"))}
                </h2>

                <div class="card">

                    <div class="settings-item">

                        <div>
                            <span class="settings-item-label">
                                ${escapeHTML(translate("settings.theme"))}
                            </span>

                            <span class="settings-item-description">
                                ${escapeHTML(translate("settings.theme_description"))}
                            </span>
                        </div>

                        <button
                            class="button button-secondary"
                            type="button"
                            data-action="theme"
                        >
                            ${escapeHTML(
                                translate(
                                    App.theme === "dark"
                                        ? "settings.light"
                                        : "settings.dark"
                                )
                            )}
                        </button>

                    </div>

                    <div class="settings-item">

                        <div>
                            <span class="settings-item-label">
                                ${escapeHTML(translate("settings.language"))}
                            </span>

                            <span class="settings-item-description">
                                ${escapeHTML(translate("settings.language_description"))}
                            </span>
                        </div>

                        <select
                            id="settings-language"
                            class="input"
                            style="width: auto"
                            aria-label="${escapeHTML(translate("settings.language"))}"
                        >
                            <option value="fa" ${App.language === "fa" ? "selected" : ""}>فارسی</option>
                            <option value="en" ${App.language === "en" ? "selected" : ""}>English</option>
                            <option value="fr" ${App.language === "fr" ? "selected" : ""}>Français</option>
                            <option value="es" ${App.language === "es" ? "selected" : ""}>Español</option>
                            <option value="pt" ${App.language === "pt" ? "selected" : ""}>Português</option>
                            <option value="ar" ${App.language === "ar" ? "selected" : ""}>العربية</option>
                        </select>

                    </div>

                </div>

            </div>

            <div class="settings-group">

                <h2 class="section-title">
                    ${escapeHTML(translate("settings.developer"))}
                </h2>

                <div class="card">
                    <p class="card-description">
                        ${escapeHTML(CONFIG.developer)}
                    </p>
                </div>

            </div>

            <div class="settings-group">

                <h2 class="section-title">
                    ${escapeHTML(translate("settings.promotion"))}
                </h2>

                <div class="card">

                    <p class="card-description">
                        ${escapeHTML(translate("settings.promotion_description"))}
                    </p>

                    <p class="card-description">
                        ${escapeHTML(translate("settings.promotion_note"))}
                    </p>

                </div>

            </div>

        </section>
    `;
}

/* =========================================
   ABOUT PAGE
   ========================================= */

function renderAbout() {
    return `
        <section>

            <h1 class="page-title">
                ${escapeHTML(translate("about.title"))}
            </h1>

            <div class="card">

                <h2 class="card-title">
                    ایران‌گرد | Irangard
                </h2>

                <p class="card-description">
                    ${escapeHTML(translate("about.description"))}
                </p>

                <p>
                    ${escapeHTML(CONFIG.developer)}
                </p>

                <a
                    class="button"
                    href="${CONFIG.developerUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${escapeHTML(translate("about.website"))}
                </a>

            </div>

        </section>
    `;
}

/* =========================================
   ROUTE RENDERER
   ========================================= */

function renderRoute(route, focus = true) {
    let content = "";

    switch (route.name) {

        case "home":
            content = renderHome();
            break;

        case "provinces":
            content = renderProvinces();
            break;

        case "province":
            content = renderDetailPage("province", route.id);
            break;

        case "city":
            content = renderDetailPage("city", route.id);
            break;

        case "attraction":
            content = renderDetailPage("attraction", route.id);
            break;

        case "travel-info":
            content = renderTravelInfo();
            break;

        case "favorites":
            content = renderFavorites();
            break;

        case "settings":
            content = renderSettings();
            break;

        case "about":
            content = renderAbout();
            break;

        default:
            content = `
                <section class="empty-state">
                    <h1>404</h1>
                    <p>${escapeHTML(translate("common.not_found"))}</p>
                    <a href="#/home" class="button">
                        ${escapeHTML(translate("common.home"))}
                    </a>
                </section>
            `;
    }

    renderPage(content);

    updateNavigation(route);
    updateBackButton(route);

    if (focus && DOM.app) {
        DOM.app.focus({ preventScroll: true });
    }
}

/* =========================================
   EVENT HANDLING
   ========================================= */

function setupEvents() {

    window.addEventListener("hashchange", handleRoute);

    DOM.themeToggle?.addEventListener(
        "click",
        toggleTheme
    );

    DOM.languageToggle?.addEventListener(
        "click",
        switchLanguage
    );

    DOM.backButton?.addEventListener(
        "click",
        goBack
    );

    DOM.app?.addEventListener("click", event => {

        const actionButton = event.target.closest(
            "[data-action]"
        );

        if (!actionButton) return;

        const action = actionButton.dataset.action;

        switch (action) {

            case "provinces":
                navigate("provinces");
                break;

            case "theme":
                toggleTheme();
                break;

        }
    });

    DOM.app?.addEventListener("change", event => {

        if (event.target.id === "settings-language") {
            loadLanguage(event.target.value);
        }

    });
}

/* =========================================
   SERVICE WORKER
   ========================================= */

function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) {
        return;
    }

    window.addEventListener("load", async () => {

        try {
            await navigator.serviceWorker.register("./sw.js");

            console.info("Irangard: Service Worker registered.");

        } catch (error) {
            console.error(
                "Service Worker registration failed:",
                error
            );
        }

    });
}

/* =========================================
   APPLICATION INITIALIZATION
   ========================================= */

async function initApp() {

    applyTheme(App.theme);

    setupEvents();

    registerServiceWorker();

    await loadLanguage(App.language);

    handleRoute();

    console.info(
        `${CONFIG.appName} initialized successfully.`
    );
}

/* =========================================
   START APPLICATION
   ========================================= */

document.addEventListener("DOMContentLoaded", initApp);
