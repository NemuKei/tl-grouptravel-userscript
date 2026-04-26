const SCRIPT_NAME = typeof GM_info === "undefined"
    ? "TL-GroupTravel Userscript"
    : (GM_info.script?.name ?? "TL-GroupTravel Userscript");
const ROOT_ATTRIBUTE = "data-tl-grouptravel-userscript-root";
const BADGE_ID = "tl-grouptravel-userscript-badge";
const STYLE_ID = "tl-grouptravel-userscript-style";

boot();

function boot(): void {
    if (document.documentElement.hasAttribute(ROOT_ATTRIBUTE)) {
        return;
    }

    document.documentElement.setAttribute(ROOT_ATTRIBUTE, "1");
    injectStyle();
    renderBadge();

    console.info(`[${SCRIPT_NAME}] initialized`, {
        href: window.location.href,
        dev: __DEV__
    });
}

function injectStyle(): void {
    if (document.getElementById(STYLE_ID) !== null) {
        return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        #${BADGE_ID} {
            position: fixed;
            right: 16px;
            bottom: 16px;
            z-index: 2147483647;
            padding: 6px 10px;
            border-radius: 9999px;
            background: rgba(15, 23, 42, 0.9);
            color: #f8fafc;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.02em;
            pointer-events: none;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.24);
        }
    `;

    document.head.append(style);
}

function renderBadge(): void {
    if (document.getElementById(BADGE_ID) !== null) {
        return;
    }

    const badge = document.createElement("div");
    badge.id = BADGE_ID;
    badge.textContent = __DEV__
        ? "TL-GroupTravel userscript dev"
        : "TL-GroupTravel userscript ready";

    document.body.append(badge);
}
