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
  bilibili: { hosts: ["www.bilibili.com"], label: "哔哩哔哩" },
  youtube: { hosts: ["www.youtube.com"], label: "YouTube" },
  weibo: { hosts: ["www.weibo.com", "s.weibo.com"], label: "微博" },
  zhihu: { hosts: ["www.zhihu.com"], label: "知乎" },
  google_scholar: { hosts: ["scholar.google.com"], label: "Google Scholar" }
};

function getPlatformByHost(host) {
  for (const [key, rule] of Object.entries(PLATFORM_RULES)) {
    if (rule.hosts.includes(host)) return key;
  }
  return null;
}

function setChip(text, ok) {
  const chip = document.getElementById("permissionChip");
  chip.textContent = text;
  chip.classList.toggle("ok", Boolean(ok));
  chip.classList.toggle("bad", !ok);
}

function normalizePlatformConfig(value) {
  if (value && typeof value === "object") return value;
  const enabled = Boolean(value);
  return { enabled, hideInput: false, hideSuggest: enabled, hideAutocomplete: false };
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function updatePlatformStatus(platformId, config) {
  const platformValue = document.getElementById("platformValue");
  if (!platformId) {
    platformValue.textContent = "当前站点未配置";
    return;
  }

  const isOn = Boolean(
    config.hideInput || config.hideSuggest || config.hideAutocomplete
  );
  platformValue.textContent = `${PLATFORM_RULES[platformId].label}：${
    isOn ? "已启用" : "已关闭"
  }`;
}

async function init() {
  const siteValue = document.getElementById("siteValue");
  const openOptions = document.getElementById("openOptions");
  const reloadTab = document.getElementById("reloadTab");
  const toggleInput = document.getElementById("toggleInput");
  const toggleSuggest = document.getElementById("toggleSuggest");
  const toggleAutocomplete = document.getElementById("toggleAutocomplete");

  let tab;
  try {
    tab = await getActiveTab();
  } catch {
    setChip("无法读取当前页", false);
    return;
  }

  if (!tab || !tab.url) {
    setChip("无法读取当前页", false);
    return;
  }

  const url = new URL(tab.url);
  const host = url.host;
  siteValue.textContent = host;

  const platformId = getPlatformByHost(host);
  setChip(platformId ? "已授权" : "未配置", Boolean(platformId));

  chrome.storage.sync.get(DEFAULT_SETTINGS, (data) => {
    const settings = { ...DEFAULT_SETTINGS, ...data };
    const cfg = normalizePlatformConfig(settings.platforms?.[platformId]);
    updatePlatformStatus(platformId, cfg);

    if (!platformId) {
      toggleInput.disabled = true;
      toggleSuggest.disabled = true;
      toggleAutocomplete.disabled = true;
      return;
    }

    toggleInput.checked = Boolean(cfg.hideInput);
    toggleSuggest.checked = Boolean(cfg.hideSuggest);
    toggleAutocomplete.checked = Boolean(cfg.hideAutocomplete);

    const applyToggle = (patch) => {
      const nextCfg = { ...cfg, ...patch, enabled: true };
      const next = {
        ...settings,
        platforms: {
          ...settings.platforms,
          [platformId]: nextCfg
        }
      };
      chrome.storage.sync.set(next, () => {
        Object.assign(settings, next);
        Object.assign(cfg, nextCfg);
        updatePlatformStatus(platformId, cfg);
      });
    };

    toggleInput.addEventListener("change", () => {
      applyToggle({ hideInput: toggleInput.checked });
    });

    toggleSuggest.addEventListener("change", () => {
      applyToggle({ hideSuggest: toggleSuggest.checked });
    });

    toggleAutocomplete.addEventListener("change", () => {
      applyToggle({ hideAutocomplete: toggleAutocomplete.checked });
    });
  });

  openOptions.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  reloadTab.addEventListener("click", () => {
    chrome.tabs.reload(tab.id);
  });
}

document.addEventListener("DOMContentLoaded", init);
