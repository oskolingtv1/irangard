
/* =========================================================
   IRANGARD HIRKAN
   Main Application
   Version: 0.5.0
   ========================================================= */

"use strict";

const CONFIG = {
    appName: "ایران‌گرد هیرکان",
    appNameEn: "Irangard Hirkan",
    localePath: "/locales/",
    defaultLanguage: "fa",
    fallbackLanguage: "en",
    languageTimeout: 10000,
    appVersion: "0.5.0",
    serviceWorkerPath: "/sw.js"
};

const App = {
    language: CONFIG.defaultLanguage,
    translations: {},
    isReady: false,
    isLoading: false,
    currentRoute: "home"
};

/* ---------------------------------------------------------
   DOM HELPERS
   --------------------------------------------------------- */

function $(selector) {
    return document.querySelector(selector);
}

function $all(selector) {
    return document.querySelectorAll(selector);
}

/* ---------------------------------------------------------
   LOADING SCREEN
   --------------------------------------------------------- */

function showLoading(message = "در حال بارگذاری...") {
    const loader = $("#app-loader");

    if (loader) {
        loader.hidden = false;
        loader.textContent = message;
    }
}

function hideLoading() {
    const loader = $("#app-loader");

    if (loader) {
        loader.hidden = true;
    }

    document.body.classList.remove("loading");
    document.documentElement.classList.remove("loading");
}

function showAppError(message) {
    hideLoading();

    let errorBox = $("#app-error");

    if (!errorBox) {
        errorBox = document.createElement("div");
        errorBox.id = "app-error";
        errorBox.setAttribute("role", "alert");

        const app = $("#app") || document.body;
        app.appendChild(errorBox);
    }

    errorBox.textContent = message;
    errorBox.hidden = false;
}

/* ---------------------------------------------------------
   SAFE JSON FETCH
   --------------------------------------------------------- */

async function fetchLanguageFile(language) {
    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        CONFIG.languageTimeout
    );

    const url =
        CONFIG.localePath +
        encodeURIComponent(language) +
        ".json?v=" +
        Date.now();

    try {
        const response = await fetch(url, {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json"
            },
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(
                `Language request failed: ${response.status}`
            );
        }

        const contentType =
            response.headers.get("content-type") || "";

        if (
            contentType &&
            !contentType.includes("application/json") &&
            !contentType.includes("text/json")
        ) {
            throw new Error("Invalid language response type");
        }

        const data = await response.json();

        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {
            throw new Error("Invalid language JSON structure");
        }

        if (
            typeof data.app_name !== "string" ||
            !data.app_name.trim()
        ) {
            data.app_name =
                language === "fa"
                    ? CONFIG.appName
                    : CONFIG.appNameEn;
        }

        return data;

    } finally {
        clearTimeout(timeout);
    }
}

/* ---------------------------------------------------------
   LANGUAGE LOADER WITH FALLBACK
   --------------------------------------------------------- */

async function loadLanguage(language = CONFIG.defaultLanguage) {
    if (App.isLoading) {
        return App.translations;
    }

    App.isLoading = true;

    const requestedLanguage =
        language === "en" ? "en" : "fa";

    let loadedLanguage = requestedLanguage;
    let translations = null;

    try {
        showLoading(
            requestedLanguage === "fa"
                ? "در حال بارگذاری زبان فارسی..."
                : "Loading language..."
        );

        try {
            translations = await fetchLanguageFile(
                requestedLanguage
            );

        } catch (primaryError) {
            console.warn(
                `Failed to load ${requestedLanguage}.json:`,
                primaryError
            );

            // Try English as fallback.
            if (requestedLanguage !== "en") {
                console.warn(
                    "Trying en.json as fallback..."
                );

                loadedLanguage = "en";

                translations = await fetchLanguageFile("en");

            } else {
                throw primaryError;
            }
        }

        App.language = loadedLanguage;
        App.translations = translations;

        applyLanguageSettings(loadedLanguage);
        applyTranslations();

        return translations;

    } catch (error) {
        console.error("Language loading failed:", error);

        App.translations = {};
        App.isReady = false;

        showAppError(
            "بارگذاری برنامه ناموفق بود. لطفاً اتصال اینترنت را بررسی کرده و دوباره تلاش کنید. " +
            "Could not load the application language."
        );

        throw error;

    } finally {
        App.isLoading = false;
    }
}

/* ---------------------------------------------------------
   LANGUAGE SETTINGS
   --------------------------------------------------------- */

function applyLanguageSettings(language) {
    const isPersian = language === "fa";

    document.documentElement.lang = language;
    document.documentElement.dir = isPersian ? "rtl" : "ltr";

    document.body.classList.toggle("rtl", isPersian);
    document.body.classList.toggle("ltr", !isPersian);

    document.title =
        isPersian
            ? "ایران‌گرد هیرکان | Irangard Hirkan"
            : "Irangard Hirkan";

    const brand = $("#brand-name");

    if (brand) {
        brand.textContent = CONFIG.appName;
    }
}

/* ---------------------------------------------------------
   TRANSLATION HELPER
   --------------------------------------------------------- */

function t(key, fallback = "") {
    if (!key) return fallback;

    const parts = key.split(".");
    let value = App.translations;

    for (const part of parts) {
        if (
            value === null ||
            typeof value !== "object" ||
            !Object.prototype.hasOwnProperty.call(value, part)
        ) {
            return fallback || key;
        }

        value = value[part];
    }

    return typeof value === "string"
        ? value
        : fallback || key;
}

/* ---------------------------------------------------------
   APPLY TRANSLATIONS
   --------------------------------------------------------- */

function applyTranslations() {
    $all("[data-i18n]").forEach(element => {
        const key = element.getAttribute("data-i18n");

        if (!key) return;

        const value = t(key);

        if (value !== key) {
            element.textContent = value;
        }
    });

    $all("[data-i18n-placeholder]").forEach(element => {
        const key = element.getAttribute(
            "data-i18n-placeholder"
        );

        if (!key) return;

        const value = t(key);

        if (value !== key) {
            element.setAttribute("placeholder", value);
        }
    });

    $all("[data-i18n-title]").forEach(element => {
        const key = element.getAttribute("data-i18n-title");

        if (!key) return;

        const value = t(key);

        if (value !== key) {
            element.setAttribute("title", value);
        }
    });

    const appName = $("#brand-name");

    if (appName) {
        appName.textContent = CONFIG.appName;
    }
}

/* ---------------------------------------------------------
   LANGUAGE SWITCHING
   --------------------------------------------------------- */

async function changeLanguage(language) {
    if (!["fa", "en"].includes(language)) {
        return;
    }

    try {
        localStorage.setItem("irangard_language", language);
    } catch (error) {
        console.warn("LocalStorage unavailable:", error);
    }

    await loadLanguage(language);
}

/* ---------------------------------------------------------
   ROUTER
   --------------------------------------------------------- */

function handleRoute() {
    const hash = window.location.hash.replace(/^#\/?/, "");

    App.currentRoute = hash || "home";

    window.dispatchEvent(
        new CustomEvent("irangard:route", {
            detail: {
                route: App.currentRoute
            }
        })
    );
}

window.addEventListener("hashchange", handleRoute);

/* ---------------------------------------------------------
   THEME
   --------------------------------------------------------- */

function initializeTheme() {
    let theme = "light";

    try {
        theme = localStorage.getItem("irangard_theme") || "light";
    } catch (error) {
        console.warn("Theme storage unavailable:", error);
    }

    document.documentElement.dataset.theme = theme;
}

function toggleTheme() {
    const current =
        document.documentElement.dataset.theme || "light";

    const next = current === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = next;

    try {
        localStorage.setItem("irangard_theme", next);
    } catch (error) {
        console.warn("Theme storage unavailable:", error);
    }
}

/* ---------------------------------------------------------
   SERVICE WORKER
   --------------------------------------------------------- */

async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        return;
    }

    try {
        const registration =
            await navigator.serviceWorker.register(
                CONFIG.serviceWorkerPath,
                {
                    updateViaCache: "none"
                }
            );

        console.log(
            "Irangard Service Worker registered:",
            registration.scope
        );

        // Check for an updated Service Worker.
        await registration.update();

    } catch (error) {
        console.warn(
            "Service Worker registration failed:",
            error
        );
    }
}

/* ---------------------------------------------------------
   APPLICATION INITIALIZATION
   --------------------------------------------------------- */

async function initializeApp() {
    if (App.isReady) return;

    showLoading();

    initializeTheme();

    let preferredLanguage = CONFIG.defaultLanguage;

    try {
        const savedLanguage =
            localStorage.getItem("irangard_language");

        if (savedLanguage === "fa" || savedLanguage === "en") {
            preferredLanguage = savedLanguage;
        }
    } catch (error) {
        console.warn("Language preference unavailable:", error);
    }

    try {
        await loadLanguage(preferredLanguage);

        App.isReady = true;

        handleRoute();

        const errorBox = $("#app-error");

        if (errorBox) {
            errorBox.hidden = true;
        }

        hideLoading();

        document.body.classList.add("app-ready");

        console.log(
            `${CONFIG.appNameEn} initialized successfully.`
        );

    } catch (error) {
        console.error("Application initialization failed:", error);

        showAppError(
            "برنامه بارگذاری نشد. برای تلاش مجدد، دکمه زیر را انتخاب کنید."
        );

        const errorBox = $("#app-error");

        if (errorBox && !$("#retry-loading")) {
            const retry = document.createElement("button");

            retry.id = "retry-loading";
            retry.type = "button";
            retry.textContent = "تلاش مجدد";

            retry.addEventListener("click", () => {
                errorBox.hidden = true;
                initializeApp();
            });

            errorBox.appendChild(retry);
        }
    }
}

/* ---------------------------------------------------------
   GLOBAL APP API
   --------------------------------------------------------- */

window.Irangard = {
    CONFIG,
    App,
    t,
    loadLanguage,
    changeLanguage,
    toggleTheme,
    handleRoute,
    initializeApp
};

/* ---------------------------------------------------------
   START APPLICATION
   --------------------------------------------------------- */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeApp,
        { once: true }
    );
} else {
    initializeApp();
}

/* Register SW independently so its failure cannot block startup. */
window.addEventListener("load", () => {
    registerServiceWorker();
}, { once: true });
