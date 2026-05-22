// src/lib/chatbase.ts
//
// One-time loader for the Chatbase embed.
// Extracted from App.tsx so the inline IIFE doesn't pollute the component file.

const REMOTE_SCRIPT_ID = 'f_w0Zlu5trRGKUknyahcR';
const LOADER_ID = 'chatbase-inline-loader';
const STYLE_ID = 'chatbase-hero-polish';

const LOADER_BODY = `
(function () {
  if (!window.chatbase || window.chatbase("getState") !== "initialized") {
    window.chatbase = (...arguments) => {
      if (!window.chatbase.q) { window.chatbase.q = []; }
      window.chatbase.q.push(arguments);
    };
    window.chatbase = new Proxy(window.chatbase, {
      get(target, prop) {
        if (prop === "q") return target.q;
        return (...args) => target(prop, ...args);
      }
    });
  }
  const injectWidget = function () {
    if (document.getElementById("${REMOTE_SCRIPT_ID}")) return;
    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = "${REMOTE_SCRIPT_ID}";
    script.domain = "www.chatbase.co";
    document.body.appendChild(script);
  };
  const onLoad = function () {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(injectWidget, { timeout: 4000 });
    } else {
      window.setTimeout(injectWidget, 2500);
    }
  };
  if (document.readyState === "complete") {
    onLoad();
  } else {
    window.addEventListener("load", onLoad, { once: true });
  }
})();
`;

/**
 * Inject the Chatbase widget script into the page exactly once.
 * Safe to call multiple times — guards against duplicate loaders.
 */
export function loadChatbaseWidget(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (document.getElementById(REMOTE_SCRIPT_ID)) return;
  if (document.getElementById(LOADER_ID)) return;

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '#chatbase-message-bubbles{display:none!important;}';
    document.head.appendChild(style);
  }

  const loader = document.createElement('script');
  loader.id = LOADER_ID;
  loader.type = 'text/javascript';
  loader.text = LOADER_BODY;
  document.body.appendChild(loader);
  loader.remove();
}
