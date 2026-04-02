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

const PLATFORMS = [
  {
    id: "bilibili",
    name: "哔哩哔哩",
    desc: "可分别隐藏搜索框内容与下拉推荐",
    status: "available",
    features: ["input", "suggest", "autocomplete"]
  },
  {
    id: "youtube",
    name: "YouTube",
    desc: "准备支持：搜索推荐下拉",
    status: "soon",
    features: []
  },
  {
    id: "weibo",
    name: "微博",
    desc: "准备支持：搜索推荐下拉",
    status: "soon",
    features: []
  },
  {
    id: "zhihu",
    name: "知乎",
    desc: "准备支持：搜索推荐下拉",
    status: "soon",
    features: []
  },
  {
    id: "google_scholar",
    name: "Google Scholar",
    desc: "可分别隐藏搜索框内容与下拉推荐",
    status: "available",
    features: ["input", "suggest", "autocomplete"]
  }
];

function normalizePlatformConfig(value) {
  if (value && typeof value === "object") return value;
  const enabled = Boolean(value);
  return { enabled, hideInput: false, hideSuggest: enabled, hideAutocomplete: false };
}

function createToggleRow(label, checked, disabled, onChange) {
  const row = document.createElement("label");
  row.className = "toggle";

  const switchWrap = document.createElement("span");
  switchWrap.className = "switch";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = Boolean(checked);
  input.disabled = Boolean(disabled);

  const slider = document.createElement("span");
  slider.className = "slider";

  switchWrap.appendChild(input);
  switchWrap.appendChild(slider);

  const labelText = document.createElement("span");
  labelText.className = "toggle-label";
  labelText.textContent = label;

  input.addEventListener("change", () => onChange(input.checked));

  row.appendChild(switchWrap);
  row.appendChild(labelText);

  return row;
}

function createPlatformCard(platform, config, onChange) {
  const card = document.createElement("div");
  card.className = "card";

  const header = document.createElement("div");
  header.className = "card-header";

  const title = document.createElement("h2");
  title.textContent = platform.name;

  const tag = document.createElement("span");
  tag.className = `tag ${platform.status === "available" ? "active" : "soon"}`;
  tag.textContent = platform.status === "available" ? "可用" : "规划中";

  header.appendChild(title);
  header.appendChild(tag);

  const desc = document.createElement("p");
  desc.textContent = platform.desc;

  card.appendChild(header);
  card.appendChild(desc);

  const disabled = platform.status !== "available";

  if (platform.features.includes("input")) {
    card.appendChild(
      createToggleRow(
        "隐藏搜索框内容",
        config.hideInput,
        disabled,
        (value) => onChange(platform.id, { ...config, hideInput: value, enabled: true })
      )
    );
  }

  if (platform.features.includes("suggest")) {
    card.appendChild(
      createToggleRow(
        "隐藏下拉推荐",
        config.hideSuggest,
        disabled,
        (value) => onChange(platform.id, { ...config, hideSuggest: value, enabled: true })
      )
    );
  }

  if (platform.features.includes("autocomplete")) {
    card.appendChild(
      createToggleRow(
        "关闭浏览器补全",
        config.hideAutocomplete,
        disabled,
        (value) =>
          onChange(platform.id, { ...config, hideAutocomplete: value, enabled: true })
      )
    );
  }

  if (!platform.features.length) {
    card.appendChild(
      createToggleRow("暂未开放", false, true, () => {})
    );
  }

  return card;
}

function render(settings) {
  const container = document.getElementById("platforms");
  container.innerHTML = "";

  const available = PLATFORMS.filter((p) => p.status === "available");
  const enabledCount = available.reduce((sum, p) => {
    const cfg = normalizePlatformConfig(settings.platforms?.[p.id]);
    const isOn = Boolean(cfg.hideInput || cfg.hideSuggest || cfg.hideAutocomplete);
    return sum + (isOn ? 1 : 0);
  }, 0);
  const statusText = document.getElementById("statusText");
  statusText.textContent = `已开启 ${enabledCount}/${available.length} 个平台`;

  PLATFORMS.forEach((platform) => {
    const config = normalizePlatformConfig(settings.platforms?.[platform.id]);
    const card = createPlatformCard(platform, config, (id, nextConfig) => {
      const next = {
        ...settings,
        platforms: {
          ...settings.platforms,
          [id]: nextConfig
        }
      };
      chrome.storage.sync.set(next);
      Object.assign(settings, next);
      render(settings);
    });
    container.appendChild(card);
  });
}

function init() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (data) => {
    const settings = { ...DEFAULT_SETTINGS, ...data };
    render(settings);

    const enableAll = document.getElementById("enableAll");
    const disableAll = document.getElementById("disableAll");

    const availableIds = PLATFORMS.filter((p) => p.status === "available").map(
      (p) => p.id
    );

    enableAll.addEventListener("click", () => {
      const nextPlatforms = { ...settings.platforms };
      availableIds.forEach((id) => {
        const cfg = normalizePlatformConfig(nextPlatforms[id]);
        nextPlatforms[id] = {
          ...cfg,
          enabled: true,
          hideInput: true,
          hideSuggest: true,
          hideAutocomplete: true
        };
      });
      const next = { ...settings, platforms: nextPlatforms };
      chrome.storage.sync.set(next, () => {
        Object.assign(settings, next);
        render(settings);
      });
    });

    disableAll.addEventListener("click", () => {
      const nextPlatforms = { ...settings.platforms };
      availableIds.forEach((id) => {
        const cfg = normalizePlatformConfig(nextPlatforms[id]);
        nextPlatforms[id] = {
          ...cfg,
          enabled: true,
          hideInput: false,
          hideSuggest: false,
          hideAutocomplete: false
        };
      });
      const next = { ...settings, platforms: nextPlatforms };
      chrome.storage.sync.set(next, () => {
        Object.assign(settings, next);
        render(settings);
      });
    });

    const resetBtn = document.getElementById("reset");
    resetBtn.addEventListener("click", () => {
      chrome.storage.sync.set(DEFAULT_SETTINGS, () => render(DEFAULT_SETTINGS));
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
