(() => {
  const DEFAULT_SETTINGS = {
    platforms: {
      bilibili: { enabled: true, hideInput: true, hideSuggest: true, hideAutocomplete: true },
      youtube: { enabled: false, hideInput: false, hideSuggest: false, hideAutocomplete: false },
      weibo: { enabled: false, hideInput: false, hideSuggest: false, hideAutocomplete: false },
      zhihu: { enabled: false, hideInput: false, hideSuggest: false, hideAutocomplete: false },
      google_scholar: { enabled: true, hideInput: true, hideSuggest: true, hideAutocomplete: true }
    },
    version: 3
  };

  const PLATFORM_RULES = {
    bilibili: {
      hosts: ["www.bilibili.com"],
      inputSelectors: ["#nav-searchform .nav-search-input"],
      suggestSelectors: [
        ".center-search__bar .search-panel",
        ".center-search-container .search-panel",
        ".center-search__bar [class*=\"suggest\"]",
        ".center-search-container [class*=\"suggest\"]",
        "#app .bili-header__bar [class*=\"suggest\"]",
        "#app .bili-header__bar [class*=\"recommend\"]",
        "#app .bili-header__bar [class*=\"dropdown\"]",
        "#app .bili-header__bar [role=\"listbox\"]",
        "#nav-searchform .nav-search-result",
        "#nav-searchform [class*=\"suggest\"]",
        "#nav-searchform [class*=\"recommend\"]",
        "#nav-searchform [class*=\"dropdown\"]",
        "#nav-searchform [role=\"listbox\"]",
        ".search-panel",
        ".search-suggest",
        ".search-suggestion",
        ".suggest",
        ".suggestion",
        ".suggestions",
        ".suggest-wrap",
        ".suggest-content",
        ".search-dropdown",
        ".nav-search-result",
        ".nav-search-list",
        ".bili-search .search-panel",
        ".bili-search .search-suggest"
      ]
    },
    youtube: {
      hosts: ["www.youtube.com"],
      inputSelectors: [],
      suggestSelectors: []
    },
    weibo: {
      hosts: ["www.weibo.com", "s.weibo.com"],
      inputSelectors: [],
      suggestSelectors: []
    },
    zhihu: {
      hosts: ["www.zhihu.com"],
      inputSelectors: [],
      suggestSelectors: []
    },
    google_scholar: {
      hosts: ["scholar.google.com"],
      inputSelectors: ["#gs_hdr_tsi"],
      suggestSelectors: ["#gs_hdr_tsa", ".gs_hdr_tsd", "#gs_hdr_frm_ac > div > ul"]
    }
  };

  const STYLE_ID = "__boundary_search_suggest_blocker__";
  const INPUT_STYLE_ID = "__boundary_search_input_mask__";

  function getPlatformByHost(host) {
    for (const [key, rule] of Object.entries(PLATFORM_RULES)) {
      if (rule.hosts.includes(host)) return key;
    }
    return null;
  }

  function injectStyle(selectors) {
    if (!selectors.length) return;
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      ${selectors.join(",")} {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.documentElement.appendChild(style);
  }

  function injectInputMaskStyle(selectors) {
    if (!selectors || selectors.length === 0) return;
    if (document.getElementById(INPUT_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = INPUT_STYLE_ID;
    style.textContent = `
      ${selectors.join(",")}::placeholder {
        color: transparent !important;
        opacity: 0 !important;
      }
    `;
    document.documentElement.appendChild(style);
  }

  function disableAutocomplete() {
    const inputs = Array.from(document.querySelectorAll("input"));
    for (const input of inputs) {
      const name = (input.getAttribute("name") || "").toLowerCase();
      const id = (input.getAttribute("id") || "").toLowerCase();
      const placeholder = (input.getAttribute("placeholder") || "").toLowerCase();
      const isSearchy =
        input.type === "search" ||
        name.includes("search") ||
        name.includes("keyword") ||
        id.includes("search") ||
        id.includes("keyword") ||
        placeholder.includes("搜索");

      if (isSearchy) {
        input.setAttribute("autocomplete", "off");
        input.setAttribute("autocorrect", "off");
        input.setAttribute("autocapitalize", "off");
        input.setAttribute("spellcheck", "false");
      }
    }
  }

  function hideExisting(selectors) {
    if (!selectors.length) return;
    const selector = selectors.join(",");
    document.querySelectorAll(selector).forEach((el) => {
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("opacity", "0", "important");
      el.style.setProperty("height", "0", "important");
      el.style.setProperty("pointer-events", "none", "important");
    });
  }

  function shouldHide(node) {
    if (!(node instanceof HTMLElement)) return false;
    const cls = (node.className || "").toString().toLowerCase();
    if (cls.includes("suggest")) return true;
    if (cls.includes("search") && (cls.includes("panel") || cls.includes("dropdown"))) return true;
    return false;
  }

  function observe(selectors) {
    if (!selectors.length) return;
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              if (shouldHide(node)) {
                node.style.setProperty("display", "none", "important");
              }
              if (node.querySelectorAll) {
                node.querySelectorAll(selectors.join(",")).forEach((el) => {
                  el.style.setProperty("display", "none", "important");
                });
              }
            }
          });
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function applySuggestRules(selectors) {
    injectStyle(selectors);
    disableAutocomplete();
    hideExisting(selectors);
    observe(selectors);
  }

  function bilibiliExtraGuards() {
    const input = document.querySelector(
      "#nav-searchform > div.nav-search-content > input"
    );
    const form = document.querySelector("#nav-searchform");
    const root =
      document.querySelector(".center-search__bar") ||
      document.querySelector(".center-search-container") ||
      form;
    if (!input || !root) return;

    const hideCandidates = () => {
      const candidates = root.querySelectorAll("div, ul");
      candidates.forEach((el) => {
        if (el === input || el.contains(input)) return;
        const cls = (el.className || "").toString().toLowerCase();
        const role = (el.getAttribute("role") || "").toLowerCase();
        const hasListItems = el.querySelector("li");
        if (
          role === "listbox" ||
          hasListItems ||
          cls.includes("suggest") ||
          cls.includes("recommend") ||
          cls.includes("dropdown")
        ) {
          el.style.setProperty("display", "none", "important");
          el.style.setProperty("visibility", "hidden", "important");
          el.style.setProperty("opacity", "0", "important");
          el.style.setProperty("pointer-events", "none", "important");
        }
      });
    };

    input.addEventListener("focus", hideCandidates, true);
    input.addEventListener("input", hideCandidates, true);
    input.addEventListener("click", hideCandidates, true);
    hideCandidates();
  }

  function applyInputRules(platformKey, cfg) {
    const selectors = PLATFORM_RULES[platformKey]?.inputSelectors || [];
    if (cfg.hideInput) {
      injectInputMaskStyle(selectors);
      // 清空 placeholder，避免加载闪现
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((input) => {
          input.setAttribute("placeholder", "");
        });
      });
    }
    if (cfg.hideAutocomplete) {
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((input) => {
          const form = input.closest("form");
          if (form) {
            form.setAttribute("autocomplete", "off");
          }
          input.setAttribute("autocomplete", "off");
          input.setAttribute("autocorrect", "off");
          input.setAttribute("autocapitalize", "off");
          input.setAttribute("spellcheck", "false");
          input.setAttribute("name", `boundary_${Math.random().toString(36).slice(2)}`);
          input.setAttribute("aria-autocomplete", "none");

          // 强制禁用浏览器历史补全（常见绕过）
          const disableHistoryHack = () => {
            input.setAttribute("readonly", "readonly");
            requestAnimationFrame(() => {
              input.removeAttribute("readonly");
            });
          };
          input.addEventListener("focus", disableHistoryHack, true);
        });
      });
    }
  }

  function normalizePlatformConfig(platformKey, value) {
    if (value && typeof value === "object") return value;
    const enabled = Boolean(value);
    return {
      enabled,
      hideInput: false,
      hideSuggest: enabled,
      hideAutocomplete: false
    };
  }

  function init() {
    const host = window.location.host;
    const platform = getPlatformByHost(host);
    if (!platform) return;

    chrome.storage.sync.get(DEFAULT_SETTINGS, (data) => {
      const raw = data?.platforms?.[platform];
      const cfg = normalizePlatformConfig(platform, raw);
      if (!cfg.enabled) return;

      if (cfg.hideInput || cfg.hideAutocomplete) {
        applyInputRules(platform, cfg);
      }

      if (cfg.hideSuggest) {
        const selectors = PLATFORM_RULES[platform]?.suggestSelectors || [];
        if (selectors.length) {
          applySuggestRules(selectors);
        }
        if (platform === "bilibili") {
          bilibiliExtraGuards();
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
