const button = document.querySelector<HTMLButtonElement>("#open-gallery")!;
const message = document.querySelector<HTMLElement>("#message")!;
const settingsToggle = document.querySelector<HTMLButtonElement>("#settings-toggle")!;
const settingsPanel = document.querySelector<HTMLElement>("#settings-panel")!;
const mainContent = document.querySelector<HTMLElement>("#main-content")!;
const ignoreSmallImages = document.querySelector<HTMLInputElement>("#ignore-small-images")!;
const minimumWidth = document.querySelector<HTMLInputElement>("#minimum-width")!;
const minimumHeight = document.querySelector<HTMLInputElement>("#minimum-height")!;
const extensionEnabled = document.querySelector<HTMLInputElement>("#extension-enabled")!;
const siteLabel = document.querySelector<HTMLElement>("#site-label")!;
const backButton = document.querySelector<HTMLButtonElement>("#settings-back")!;
const saveButton = document.querySelector<HTMLButtonElement>("#settings-save")!;
const settingsMessage = document.querySelector<HTMLElement>("#settings-message")!;
button.disabled = true;
saveButton.disabled = true;

const imageFilterDefaults = {
  gallerifyIgnoreSmallImages: true,
  gallerifyMinimumImageWidth: 32,
  gallerifyMinimumImageHeight: 32,
};

function updateDimensionInputs() {
  minimumWidth.disabled = !ignoreSmallImages.checked;
  minimumHeight.disabled = !ignoreSmallImages.checked;
}

function loadImageFilterSettings(onLoaded: () => void = () => {}) {
  saveButton.disabled = true;
  chrome.storage.local.get(imageFilterDefaults, (settings) => {
    ignoreSmallImages.checked = settings.gallerifyIgnoreSmallImages !== false;
    minimumWidth.value = String(settings.gallerifyMinimumImageWidth);
    minimumHeight.value = String(settings.gallerifyMinimumImageHeight);
    updateDimensionInputs();
    saveButton.disabled = false;
    onLoaded?.();
  });
}
loadImageFilterSettings();

function showMainArea() {
  settingsPanel.hidden = true;
  mainContent.hidden = false;
  settingsToggle.setAttribute("aria-expanded", "false");
  settingsToggle.setAttribute("aria-label", "Image settings");
  settingsToggle.title = "Image settings";
}

let currentSite = "";
function getSiteKey(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:" ? url.hostname.toLowerCase() : "";
  } catch {
    return "";
  }
}

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  currentSite = getSiteKey(tab?.url || "");
  if (!currentSite) {
    extensionEnabled.disabled = true;
    button.disabled = true;
    siteLabel.textContent = "Unavailable on this page";
    return;
  }
  siteLabel.textContent = `Gallery controls for ${currentSite}`;
  chrome.storage.local.get({ gallerifySiteEnabled: {} }, (settings) => {
    const states = (settings.gallerifySiteEnabled || {}) as Record<string, boolean>;
    const enabled = states[currentSite] === true;
    extensionEnabled.checked = enabled;
    extensionEnabled.disabled = false;
    button.disabled = !enabled;
  });
});

settingsToggle.addEventListener("click", () => {
  const isOpen = settingsPanel.hidden;
  settingsPanel.hidden = !isOpen;
  mainContent.hidden = isOpen;
  settingsToggle.setAttribute("aria-expanded", String(isOpen));
  settingsToggle.setAttribute("aria-label", isOpen ? "Close image settings" : "Image settings");
  settingsToggle.title = isOpen ? "Close image settings" : "Image settings";
});

function getImageFilterSettings() {
  const parseDimension = (input) => {
    const parsed = Number.parseInt(input.value, 10);
    const value = Number.isFinite(parsed) ? Math.max(0, Math.min(4096, parsed)) : 32;
    input.value = value;
    return value;
  };
  return {
    gallerifyIgnoreSmallImages: ignoreSmallImages.checked,
    gallerifyMinimumImageWidth: parseDimension(minimumWidth),
    gallerifyMinimumImageHeight: parseDimension(minimumHeight),
  };
}

ignoreSmallImages.addEventListener("change", () => {
  updateDimensionInputs();
});
minimumWidth.addEventListener("input", () => { settingsMessage.textContent = ""; });
minimumHeight.addEventListener("input", () => { settingsMessage.textContent = ""; });
ignoreSmallImages.addEventListener("input", () => { settingsMessage.textContent = ""; });
backButton.addEventListener("click", () => {
  settingsMessage.textContent = "";
  loadImageFilterSettings(showMainArea);
});
saveButton.addEventListener("click", () => {
  saveButton.disabled = true;
  backButton.disabled = true;
  settingsMessage.textContent = "Saving changes…";
  chrome.storage.local.set(getImageFilterSettings(), async () => {
    if (chrome.runtime.lastError) {
      settingsMessage.textContent = "Could not save settings. Please try again.";
      saveButton.disabled = false;
      backButton.disabled = false;
      return;
    }
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id && currentSite) {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
        await chrome.tabs.sendMessage(tab.id, { type: "GALLERIFY_REFRESH" });
      }
      settingsMessage.textContent = "Settings saved.";
    } catch {
      // Storage changes apply to already-running content scripts automatically.
      // Restricted pages cannot be refreshed by the extension, so report save success.
      settingsMessage.textContent = "Settings saved. Reopen the gallery to apply them.";
    }
    saveButton.disabled = false;
    backButton.disabled = false;
  });
});
extensionEnabled.addEventListener("change", () => {
  if (!currentSite) return;
  button.disabled = !extensionEnabled.checked;
  chrome.storage.local.get({ gallerifySiteEnabled: {} }, (settings) => {
    const states = { ...((settings.gallerifySiteEnabled || {}) as Record<string, boolean>), [currentSite]: extensionEnabled.checked };
    chrome.storage.local.set({ gallerifySiteEnabled: states });
  });
});

button.addEventListener("click", async () => {
  button.disabled = true;
  message.textContent = "";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab");
    // Ensure the receiver exists even on tabs that were already open when the
    // extension was installed or reloaded. content.js guards against duplicates.
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    await chrome.tabs.sendMessage(tab.id, { type: "GALLERIFY_TOGGLE" });
    window.close();
  } catch (error) {
    message.textContent = error?.message?.includes("Cannot access") || error?.message?.includes("cannot be scripted")
      ? "Chrome restricts extensions on this page. Try a regular website."
      : "Could not open the gallery. Reload the page and try again.";
    button.disabled = false;
  }
});
