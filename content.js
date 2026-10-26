(() => {
  if (window.__gallerifyInstalled) return;
  window.__gallerifyInstalled = true;

  const host = document.createElement("div");
  host.id = "gallerify-extension-root";
  Object.assign(host.style, { all: "initial", fontFamily: "system-ui, sans-serif", position: "fixed", inset: "0", zIndex: "2147483647", pointerEvents: "none" });
  (document.documentElement || document.body).append(host);
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      :host { all: initial; color-scheme: light; font-family: system-ui, sans-serif; }
      * { box-sizing: border-box; }
      button { font: inherit; }
      #quick { display:none; position:absolute; width:38px; height:38px; padding:0; border:1px solid #1677ff; border-radius:7px; background:#1677ff; color:#fff; box-shadow:0 2px 0 rgba(5,145,255,.1); cursor:pointer; pointer-events:auto; place-items:center; transition:background .2s,border-color .2s; }
      #quick:hover { background:#4096ff; border-color:#4096ff; }
      #quick svg { width:var(--quick-icon-width,21px); height:var(--quick-icon-height,21px); }
      #gallery { display:none; position:fixed; inset:0; z-index:2; pointer-events:auto; background:rgba(0,0,0,.45); color:rgba(0,0,0,.88); }
      #shell { display:flex; flex-direction:column; width:min(1440px,100%); height:100%; margin:auto; background:#f5f5f5; box-shadow:0 6px 16px rgba(0,0,0,.08),0 3px 6px -4px rgba(0,0,0,.12),0 9px 28px 8px rgba(0,0,0,.05); }
      header { flex:none; min-height:64px; display:flex; align-items:center; gap:12px; padding:12px 20px; background:#fff; border-bottom:1px solid #f0f0f0; }
      .brand { display:flex; align-items:center; gap:10px; margin-right:auto; font-size:16px; font-weight:600; }
      .mark { width:30px; height:30px; display:grid; place-items:center; border-radius:6px; color:white; background:#1677ff; }
      #count { color:rgba(0,0,0,.45); font-size:12px; white-space:nowrap; }
      .tool { min-width:34px; height:32px; display:grid; place-items:center; padding:0 10px; color:rgba(0,0,0,.88); background:#fff; border:1px solid #d9d9d9; border-radius:6px; cursor:pointer; box-shadow:0 2px 0 rgba(0,0,0,.02); transition:color .2s,border-color .2s,background .2s; }
      .tool:hover { color:#4096ff; border-color:#4096ff; }
      #search { width:min(250px,30vw); height:32px; padding:4px 11px; color:rgba(0,0,0,.88); background:#fff; border:1px solid #d9d9d9; border-radius:6px; outline:none; font:inherit; transition:border-color .2s,box-shadow .2s; }
      #search::placeholder { color:rgba(0,0,0,.25); }
      #search:focus { border-color:#4096ff; box-shadow:0 0 0 2px rgba(5,145,255,.1); }
      #theme { height:32px; padding:4px 25px 4px 9px; color:rgba(0,0,0,.88); background:#fff; border:1px solid #d9d9d9; border-radius:6px; font:inherit; cursor:pointer; }
      #grid { flex:1; overflow:auto; overscroll-behavior:contain; display:grid; align-content:start; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:16px; padding:20px; }
      .card { position:relative; overflow:hidden; min-width:0; padding:0; color:inherit; text-align:left; background:#fff; border:1px solid #f0f0f0; border-radius:8px; cursor:pointer; transition:border-color .2s,box-shadow .2s; }
      .card:hover { border-color:#91caff; box-shadow:0 2px 8px rgba(0,0,0,.09); }
      .preview { position:relative; aspect-ratio:4/3; display:grid; place-items:center; overflow:hidden; background:#fafafa; }
      .preview img,.preview video { width:100%; height:100%; object-fit:contain; }
      .video-tag { position:absolute; left:9px; top:9px; padding:2px 7px; color:#1677ff; background:#e6f4ff; border:1px solid #91caff; border-radius:4px; font-size:10px; }
      .card-label { overflow:hidden; padding:9px 12px 11px; color:rgba(0,0,0,.65); font-size:12px; text-overflow:ellipsis; white-space:nowrap; border-top:1px solid #f5f5f5; }
      #empty { display:none; grid-column:1/-1; align-self:center; justify-self:center; max-width:340px; padding:50px 20px; color:rgba(0,0,0,.45); text-align:center; }
      #empty strong { display:block; margin-bottom:8px; color:rgba(0,0,0,.88); font-size:16px; font-weight:500; }
      #viewer { display:none; position:absolute; inset:0; z-index:3; align-items:center; justify-content:center; min-width:0; min-height:0; overflow:hidden; padding:70px 76px; background:#090b0aec; }
      #viewer.open { display:flex; }
      #media-slot { position:relative; display:flex; flex:1 1 0%; align-self:stretch; align-items:center; justify-content:center; width:100%; min-width:0; min-height:0; overflow:hidden; }
      #large { display:block; width:auto; height:auto; max-width:100%; max-height:100%; object-fit:contain; box-shadow:0 10px 50px #0009; }
      #large.zoomable { position:absolute; flex:none; max-width:none; max-height:none; }
      #large.zoomable.is-zoomed { cursor:grab; }
      #large.zoomable.is-dragging { cursor:grabbing; user-select:none; }
      #viewer video { width:auto; height:auto; max-width:min(100%,1200px); max-height:100%; background:#000; }
      #viewer-actions { position:absolute; top:16px; right:18px; display:flex; flex-wrap:wrap; align-items:center; justify-content:flex-end; gap:8px; width:max-content; max-width:calc(100vw - 24px); box-sizing:border-box; padding:7px; border:1px solid rgba(255,255,255,.12); border-radius:12px; background:rgba(20,20,20,.76); box-shadow:0 8px 28px rgba(0,0,0,.3); backdrop-filter:blur(14px); }
      #viewer-actions .tool { display:flex; align-items:center; justify-content:center; gap:8px; min-width:36px; height:40px; padding:0 14px; color:#fff; border:1px solid transparent; border-radius:8px; box-shadow:none; font:600 14px/1 system-ui,sans-serif; white-space:nowrap; transition:background .16s,border-color .16s,transform .16s,box-shadow .16s; }
      #viewer-actions .tool:focus-visible { outline:2px solid #fff; outline-offset:2px; }
      #viewer-actions .tool:active { transform:translateY(1px); }
      #viewer-actions #locate { background:#1677ff; border-color:#1677ff; box-shadow:0 2px 0 rgba(5,145,255,.18); }
      #viewer-actions #locate:hover { color:#fff; background:#4096ff; border-color:#4096ff; box-shadow:0 4px 12px rgba(22,119,255,.32); }
      #viewer-actions #close-viewer { color:#fff; background:#3f3f46; border-color:#52525b; }
      #viewer-actions #close-viewer:hover { color:#fff; background:#52525b; border-color:#71717a; }
      #viewer-actions #close-media { color:#fff; background:#ff4d4f; border-color:#ff4d4f; box-shadow:0 2px 0 rgba(0,0,0,.12); }
      #viewer-actions #close-media:hover { color:#fff; background:#ff7875; border-color:#ff7875; box-shadow:0 4px 12px rgba(255,77,79,.28); }
      #viewer-actions svg { width:16px; height:16px; }
      #lazy-advice { flex:none; padding:8px 20px; color:#0958d9; background:#e6f4ff; border-bottom:1px solid #91caff; font-size:12px; }
      #gallery[data-theme="dark"] { color-scheme:dark; color:rgba(255,255,255,.88); }
      #gallery[data-theme="dark"] #shell { background:#141414; }
      #gallery[data-theme="dark"] header { color:rgba(255,255,255,.88); background:#1f1f1f; border-bottom-color:#303030; }
      #gallery[data-theme="dark"] #count { color:rgba(255,255,255,.45); }
      #gallery[data-theme="dark"] .tool, #gallery[data-theme="dark"] #theme { color:rgba(255,255,255,.88); background:#1f1f1f; border-color:#434343; }
      #gallery[data-theme="dark"] .tool:hover, #gallery[data-theme="dark"] #theme:hover { color:#69b1ff; border-color:#1668dc; }
      #gallery[data-theme="dark"] #search { color:rgba(255,255,255,.88); background:#141414; border-color:#434343; }
      #gallery[data-theme="dark"] #search::placeholder { color:rgba(255,255,255,.3); }
      #gallery[data-theme="dark"] #search:focus { border-color:#1668dc; box-shadow:0 0 0 2px rgba(22,104,220,.2); }
      #gallery[data-theme="dark"] #grid { background:#141414; }
      #gallery[data-theme="dark"] .card { color:rgba(255,255,255,.88); background:#1f1f1f; border-color:#303030; }
      #gallery[data-theme="dark"] .card:hover { border-color:#1668dc; box-shadow:0 2px 8px rgba(0,0,0,.35); }
      #gallery[data-theme="dark"] .preview { background:#262626; }
      #gallery[data-theme="dark"] .card-label { color:rgba(255,255,255,.65); border-top-color:#303030; }
      #gallery[data-theme="dark"] #empty { color:rgba(255,255,255,.45); }
      #gallery[data-theme="dark"] #empty strong { color:rgba(255,255,255,.88); }
      #gallery[data-theme="dark"] #lazy-advice { color:#91caff; background:#111d2c; border-bottom-color:#15395b; }
      .nav { position:absolute; top:50%; width:42px; height:48px; transform:translateY(-50%); font-size:22px; }
      #prev { left:18px; } #next { right:18px; }
      @media(max-width:600px) { header { gap:8px; padding:10px; } .brand span:last-child { display:none; } #search { width:32vw; } #grid { grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:9px; padding:10px; } #viewer { padding:60px 48px; } #viewer-actions { top:10px; right:10px; gap:5px; padding:5px; } #viewer-actions .tool { height:36px; padding:0 10px; } #viewer-actions #locate span, #viewer-actions #close-viewer span, #viewer-actions #close-media span { display:none; } }
    </style>
    <button id="quick" title="Open this media in Gallerify" aria-label="Open this media in Gallerify">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="13" height="13" rx="2"/><path d="M8 8h13v13H8z"/><path d="m10 17 3-3 2 2 2-2 2 3"/></svg>
    </button>
    <section id="gallery" aria-label="Page media gallery">
      <div id="shell">
        <header><div class="brand"><span class="mark">G</span><span>Page gallery</span></div><span id="count"></span><input id="search" type="search" placeholder="Filter media…" aria-label="Filter media"/><select id="theme" aria-label="Gallery theme" title="Gallery theme"><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select><button class="tool" id="refresh" title="Rescan page">↻</button><button class="tool" id="close" title="Close gallery" aria-label="Close gallery">✕</button></header>
        <div id="lazy-advice">Some sites lazy-load off-screen images. Close the gallery, scroll the page, then reopen it and press ↻ to rescan.</div>
        <div id="grid"><div id="empty"><strong>No media found</strong>This page has no images or videos to show yet.</div></div>
      </div>
      <div id="viewer"><button class="tool nav" id="prev" aria-label="Previous media">‹</button><div id="viewer-actions"><button class="tool" id="locate" title="Show this media on the page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg><span>Show on page</span></button><button class="tool" id="close-viewer" title="Close the entire gallery" aria-label="Close the entire gallery">✕ <span>Close gallery</span></button>
      <button class="tool" id="close-media" title="Close only this media" aria-label="Close this media">✕ <span>Close media</span></button>
      </div><div id="media-slot"></div><button class="tool nav" id="next" aria-label="Next media">›</button></div>
    </section>`;

  const quick = shadow.querySelector("#quick");
  const gallery = shadow.querySelector("#gallery");
  const grid = shadow.querySelector("#grid");
  const count = shadow.querySelector("#count");
  const search = shadow.querySelector("#search");
  const themeSelect = shadow.querySelector("#theme");
  const viewer = shadow.querySelector("#viewer");
  const slot = shadow.querySelector("#media-slot");
  const empty = shadow.querySelector("#empty");
  const locateButton = shadow.querySelector("#locate");
  let hovered = null;
  let quickHideTimer = 0;
  let quickPositionFrame = 0;
  let extensionEnabled = true;
  let observer = null;
  let items = [];
  let shownItems = [];
  let viewerIndex = -1;
  let viewerZoom = 1;
  let viewerBaseWidth = 0;
  let viewerBaseHeight = 0;
  let themeMode = "auto";
  let ignoreSmallImages = true;
  let minimumImageWidth = 32;
  let minimumImageHeight = 32;
  let savedScrollStyles = null;
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

  function lockPageScroll() {
    if (savedScrollStyles) return;
    const properties = ["overflow-y", "overscroll-behavior"];
    const elements = [document.documentElement, document.body].filter(Boolean);
    savedScrollStyles = elements.map((element) => ({
      element,
      properties: properties.map((property) => ({
        property,
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property),
      })),
    }));
    elements.forEach((element) => {
      element.style.setProperty("overflow-y", "hidden", "important");
      element.style.setProperty("overscroll-behavior", "none", "important");
    });
  }

  function unlockPageScroll() {
    if (!savedScrollStyles) return;
    savedScrollStyles.forEach(({ element, properties }) => properties.forEach(({ property, value, priority }) => {
      if (value) element.style.setProperty(property, value, priority);
      else element.style.removeProperty(property);
    }));
    savedScrollStyles = null;
  }

  function applyTheme(mode) {
    themeMode = mode;
    gallery.dataset.theme = mode === "auto" ? (colorScheme.matches ? "dark" : "light") : mode;
    themeSelect.value = mode;
  }
  applyTheme("auto");
  chrome.storage.local.get({ gallerifyTheme: "auto" }, ({ gallerifyTheme }) => {
    applyTheme(["auto", "light", "dark"].includes(gallerifyTheme) ? gallerifyTheme : "auto");
  });
  themeSelect.addEventListener("change", () => {
    applyTheme(themeSelect.value);
    chrome.storage.local.set({ gallerifyTheme: themeMode });
  });
  colorScheme.addEventListener("change", () => { if (themeMode === "auto") applyTheme("auto"); });

  const mediaElement = (node) => node instanceof HTMLImageElement || node instanceof HTMLVideoElement;
  function isIgnoredSmallImage(node) {
    if (!ignoreSmallImages || !(node instanceof HTMLImageElement)) return false;
    const rect = node.getBoundingClientRect();
    const width = rect.width || node.width || node.naturalWidth || 0;
    const height = rect.height || node.height || node.naturalHeight || 0;
    return width < minimumImageWidth && height < minimumImageHeight;
  }

  function applyImageFilterSettings(settings) {
    ignoreSmallImages = settings.gallerifyIgnoreSmallImages !== false;
    const width = Number(settings.gallerifyMinimumImageWidth);
    const height = Number(settings.gallerifyMinimumImageHeight);
    minimumImageWidth = Number.isFinite(width) && width >= 0 ? width : 32;
    minimumImageHeight = Number.isFinite(height) && height >= 0 ? height : 32;
    if (hovered && isIgnoredSmallImage(hovered)) {
      cancelQuickHide();
      hovered = null;
      quick.style.display = "none";
    }
    if (gallery.style.display === "block") {
      closeViewer();
      collect();
      render("");
    }
  }

  const imageFilterDefaults = {
    gallerifyIgnoreSmallImages: true,
    gallerifyMinimumImageWidth: 32,
    gallerifyMinimumImageHeight: 32,
  };
  chrome.storage.local.get(imageFilterDefaults, applyImageFilterSettings);
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (Object.keys(imageFilterDefaults).some((key) => key in changes)) {
      chrome.storage.local.get(imageFilterDefaults, applyImageFilterSettings);
    }
    if ("gallerifySiteEnabled" in changes || "gallerifyExtensionEnabled" in changes) {
      chrome.storage.local.get({ gallerifySiteEnabled: {}, gallerifyExtensionEnabled: true }, (settings) => {
        const states = settings.gallerifySiteEnabled || {};
        const siteKey = location.hostname.toLowerCase();
        const enabled = Object.prototype.hasOwnProperty.call(states, siteKey)
          ? states[siteKey] !== false
          : settings.gallerifyExtensionEnabled !== false;
        applyExtensionEnabled(enabled);
      });
    }
  });
  chrome.storage.local.get({ gallerifySiteEnabled: {}, gallerifyExtensionEnabled: true }, (settings) => {
    const states = settings.gallerifySiteEnabled || {};
    const siteKey = location.hostname.toLowerCase();
    const enabled = Object.prototype.hasOwnProperty.call(states, siteKey)
      ? states[siteKey] !== false
      : settings.gallerifyExtensionEnabled !== false;
    applyExtensionEnabled(enabled);
  });

  function applyExtensionEnabled(enabled) {
    extensionEnabled = enabled;
    if (!extensionEnabled) {
      cancelQuickHide();
      stopQuickPositionTracking();
      hovered = null;
      quick.style.display = "none";
      hideGallery();
      observer?.disconnect();
    } else if (observer) {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  function mediaInfo(node) {
    if (node instanceof HTMLImageElement) {
      const lazySet = node.getAttribute("data-srcset") || node.getAttribute("data-lazy-srcset");
      const lazySetUrl = lazySet?.split(",").map((entry) => entry.trim().split(/\s+/)[0]).filter(Boolean).pop();
      const loadedUrl = node.complete && node.naturalWidth > 0 ? node.currentSrc : "";
      const url = loadedUrl || node.getAttribute("data-lazy-src") || node.getAttribute("data-src") || node.getAttribute("data-original") || lazySetUrl || node.currentSrc || node.src;
      return url ? { type: "image", url, poster: "", alt: node.alt || "Image", referrerPolicy: node.referrerPolicy || "", crossOrigin: node.crossOrigin || "", node } : null;
    }
    if (node instanceof HTMLVideoElement) {
      const source = node.getAttribute("data-src") || node.currentSrc || node.src || node.querySelector("source")?.getAttribute("data-src") || node.querySelector("source")?.src || node.poster;
      return source ? { type: "video", url: source, poster: node.poster || "", alt: node.getAttribute("aria-label") || "Video", node } : null;
    }
    return null;
  }
  function collect() {
    const found = [];
    const seen = new Map();
    document.querySelectorAll("img, video").forEach((node) => {
      if (host.contains(node)) return;
      const info = mediaInfo(node);
      if (!info || isIgnoredSmallImage(node)) return;
      const rect = node.getBoundingClientRect();
      if (node instanceof HTMLVideoElement && rect.width < 32 && rect.height < 32 && !node.complete) return;
      const key = `${info.type}:${info.url}`;
      if (seen.has(key)) found[seen.get(key)].nodes.push(node);
      else { info.nodes = [node]; seen.set(key, found.length); found.push(info); }
    });
    items = found;
    return found;
  }
  function labelFor(item) {
    try { return new URL(item.url, location.href).hostname || item.alt; } catch { return item.alt; }
  }
  function render(query = search.value) {
    const normalized = query.trim().toLowerCase();
    shownItems = items.filter((item) => !normalized || `${item.alt} ${item.url}`.toLowerCase().includes(normalized));
    grid.querySelectorAll(".card").forEach((card) => card.remove());
    shownItems.forEach((item, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.setAttribute("aria-label", `Open ${item.type}: ${item.alt}`);
      const preview = document.createElement("div");
      preview.className = "preview";
      if (item.type === "image") {
        const image = document.createElement("img");
        image.src = item.url; image.alt = item.alt; image.loading = "lazy"; image.referrerPolicy = "no-referrer-when-downgrade";
        preview.append(image);
      } else {
        const video = document.createElement("video");
        video.src = item.url; video.poster = item.poster; video.muted = true; video.playsInline = true; video.preload = "metadata";
        preview.append(video);
        const tag = document.createElement("span"); tag.className = "video-tag"; tag.textContent = "VIDEO"; preview.append(tag);
      }
      const label = document.createElement("div"); label.className = "card-label"; label.textContent = item.alt || labelFor(item); label.title = item.url;
      card.append(preview, label);
      card.addEventListener("click", () => openViewer(index));
      grid.append(card);
    });
    count.textContent = `${shownItems.length} item${shownItems.length === 1 ? "" : "s"}`;
    empty.style.display = shownItems.length ? "none" : "block";
  }
  function openViewer(index) {
    if (!shownItems.length) return;
    viewerIndex = (index + shownItems.length) % shownItems.length;
    const item = shownItems[viewerIndex];
    viewerZoom = 1;
    viewerBaseWidth = 0;
    viewerBaseHeight = 0;
    slot.scrollTop = 0;
    slot.scrollLeft = 0;
    slot.replaceChildren();
    let media;
    if (item.type === "image") {
      media = document.createElement("img"); media.id = "large"; media.alt = item.alt; media.loading = "eager"; media.decoding = "async";
      media.classList.add("zoomable");
      if (item.referrerPolicy) media.referrerPolicy = item.referrerPolicy;
      if (item.crossOrigin) media.crossOrigin = item.crossOrigin;
      media.src = item.node?.currentSrc || item.url;
      const setImageSize = () => {
        if (!media.naturalWidth || !media.naturalHeight) return;
        const availableWidth = Math.max(1, slot.clientWidth);
        const availableHeight = Math.max(1, slot.clientHeight);
        const fitScale = Math.min(1, availableWidth / media.naturalWidth, availableHeight / media.naturalHeight);
        viewerBaseWidth = media.naturalWidth * fitScale;
        viewerBaseHeight = media.naturalHeight * fitScale;
        media.style.width = `${viewerBaseWidth}px`;
        media.style.height = `${viewerBaseHeight}px`;
        media.style.left = `${Math.max(0, (slot.clientWidth - viewerBaseWidth) / 2)}px`;
        media.style.top = `${Math.max(0, (slot.clientHeight - viewerBaseHeight) / 2)}px`;
      };
      media.addEventListener("load", setImageSize, { once: true });
      if (media.complete) setImageSize();
    } else {
      media = document.createElement("video"); media.id = "large"; media.src = item.url; media.poster = item.poster; media.controls = true; media.autoplay = true; media.playsInline = true;
    }
    slot.append(media);
    viewer.classList.add("open");
    shadow.querySelector("#prev").classList.add("nav");
    shadow.querySelector("#next").classList.add("nav");
  }
  function closeViewer() {
    viewer.classList.remove("open");
    slot.replaceChildren();
    viewerIndex = -1;
    viewerZoom = 1;
    viewerBaseWidth = 0;
    viewerBaseHeight = 0;
  }
  function openGallery(target) {
    if (!extensionEnabled) return;
    stopQuickPositionTracking();
    collect();
    render("");
    gallery.style.display = "block";
    lockPageScroll();
    if (target) {
      const info = mediaInfo(target);
      let index = shownItems.findIndex((item) => item.url === info?.url && item.type === info?.type);
      if (index < 0 && info) {
        info.nodes = [target];
        items.push(info);
        render("");
        index = shownItems.findIndex((item) => item.url === info.url && item.type === info.type);
      }
      if (index >= 0) { Object.assign(shownItems[index], info); shownItems[index].node = target; openViewer(index); }
    }
  }
  function locateCurrentMedia() {
    const node = shownItems[viewerIndex]?.node;
    if (!node?.isConnected) return;
    hideGallery();
    requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      const oldOutline = node.style.getPropertyValue("outline");
      const oldOutlinePriority = node.style.getPropertyPriority("outline");
      const oldOffset = node.style.getPropertyValue("outline-offset");
      const oldOffsetPriority = node.style.getPropertyPriority("outline-offset");
      node.style.setProperty("outline", "3px solid #1677ff", "important");
      node.style.setProperty("outline-offset", "3px", "important");
      window.setTimeout(() => {
        if (oldOutline) node.style.setProperty("outline", oldOutline, oldOutlinePriority); else node.style.removeProperty("outline");
        if (oldOffset) node.style.setProperty("outline-offset", oldOffset, oldOffsetPriority); else node.style.removeProperty("outline-offset");
      }, 1800);
    });
  }
  function hideGallery() { gallery.style.display = "none"; closeViewer(); unlockPageScroll(); }
  function updateQuickPosition() {
    if (!extensionEnabled || !hovered?.isConnected || isIgnoredSmallImage(hovered)) {
      quick.style.display = "none";
      hovered = null;
      stopQuickPositionTracking();
      return;
    }
    const rect = hovered.getBoundingClientRect();
    const size = Math.min(38, rect.width - 8, rect.height - 8);
    if (size < 18 || rect.bottom < 0 || rect.right < 0 || rect.top > innerHeight || rect.left > innerWidth) {
      quick.style.display = "none";
      hovered = null;
      stopQuickPositionTracking();
      return;
    }
    const inset = Math.min(5, Math.max(2, (Math.min(rect.width, rect.height) - size) / 2));
    const minLeft = Math.max(2, rect.left + inset);
    const maxLeft = Math.min(innerWidth - size - 2, rect.right - size - inset);
    const minTop = Math.max(2, rect.top + inset);
    const maxTop = Math.min(innerHeight - size - 2, rect.bottom - size - inset);
    if (maxLeft < minLeft || maxTop < minTop) {
      quick.style.display = "none";
      hovered = null;
      stopQuickPositionTracking();
      return;
    }
    const hostRect = host.getBoundingClientRect();
    const scaleX = hostRect.width / (host.offsetWidth || innerWidth) || 1;
    const scaleY = hostRect.height / (host.offsetHeight || innerHeight) || 1;
    quick.style.width = `${size / scaleX}px`;
    quick.style.height = `${size / scaleY}px`;
    quick.style.setProperty("--quick-icon-width", `${Math.min(21, size * 0.56) / scaleX}px`);
    quick.style.setProperty("--quick-icon-height", `${Math.min(21, size * 0.56) / scaleY}px`);
    quick.style.display = "grid";
    quick.style.left = `${(maxLeft - hostRect.left) / scaleX}px`;
    quick.style.top = `${(minTop - hostRect.top) / scaleY}px`;
  }
  function stopQuickPositionTracking() {
    if (quickPositionFrame) window.cancelAnimationFrame(quickPositionFrame);
    quickPositionFrame = 0;
  }
  function startQuickPositionTracking() {
    if (quickPositionFrame || !extensionEnabled || !hovered) return;
    const frame = () => {
      quickPositionFrame = 0;
      if (!extensionEnabled || !hovered || gallery.style.display === "block") return;
      updateQuickPosition();
      if (hovered) quickPositionFrame = window.requestAnimationFrame(frame);
    };
    quickPositionFrame = window.requestAnimationFrame(frame);
  }
  function cancelQuickHide() {
    if (quickHideTimer) window.clearTimeout(quickHideTimer);
    quickHideTimer = 0;
  }
  function scheduleQuickHide() {
    cancelQuickHide();
    quickHideTimer = window.setTimeout(() => {
      quickHideTimer = 0;
      if (hovered && !hovered.matches(":hover") && !quick.matches(":hover")) {
        hovered = null;
        quick.style.display = "none";
        stopQuickPositionTracking();
      }
    }, 500);
  }
  document.addEventListener("pointerover", (event) => {
    const node = event.target;
    if (extensionEnabled && mediaElement(node) && !host.contains(node)) {
      cancelQuickHide();
      if (isIgnoredSmallImage(node)) { hovered = null; quick.style.display = "none"; return; }
      hovered = node;
      updateQuickPosition();
      startQuickPositionTracking();
    }
  }, true);
  document.addEventListener("pointerout", (event) => {
    if (hovered === event.target) scheduleQuickHide();
  }, true);
  document.addEventListener("focusin", (event) => {
    if (extensionEnabled && mediaElement(event.target) && !host.contains(event.target)) {
      cancelQuickHide();
      if (isIgnoredSmallImage(event.target)) { hovered = null; quick.style.display = "none"; return; }
      hovered = event.target;
      updateQuickPosition();
      startQuickPositionTracking();
    }
  }, true);
  quick.addEventListener("pointerover", () => { cancelQuickHide(); if (hovered) { quick.style.display = "grid"; startQuickPositionTracking(); } });
  quick.addEventListener("pointerout", scheduleQuickHide);
  quick.addEventListener("click", (event) => { cancelQuickHide(); stopQuickPositionTracking(); event.preventDefault(); event.stopPropagation(); const target = hovered; quick.style.display = "none"; openGallery(target); });
  window.addEventListener("scroll", updateQuickPosition, true);
  window.addEventListener("resize", updateQuickPosition);
  shadow.querySelector("#close").addEventListener("click", hideGallery);
  shadow.querySelector("#refresh").addEventListener("click", () => { collect(); render(); });
  shadow.querySelector("#close-viewer").addEventListener("click", hideGallery);
  shadow.querySelector("#close-media").addEventListener("click", closeViewer);
  locateButton.addEventListener("click", locateCurrentMedia);
  viewer.addEventListener("wheel", (event) => {
    const image = slot.querySelector("img.zoomable");
    if (!image || !viewer.classList.contains("open") || !viewerBaseWidth || !slot.contains(event.target)) return;
    event.preventDefault();
    const previousZoom = viewerZoom;
    viewerZoom = Math.max(1, Math.min(8, viewerZoom * (event.deltaY < 0 ? 1.2 : 1 / 1.2)));
    if (viewerZoom === previousZoom) return;

    const imageRect = image.getBoundingClientRect();
    const pointerX = event.clientX - imageRect.left;
    const pointerY = event.clientY - imageRect.top;
    const imagePointX = pointerX / imageRect.width;
    const imagePointY = pointerY / imageRect.height;
    const slotRect = slot.getBoundingClientRect();
    image.style.width = `${viewerBaseWidth * viewerZoom}px`;
    image.style.height = `${viewerBaseHeight * viewerZoom}px`;
    image.classList.toggle("is-zoomed", viewerZoom > 1);
    const left = event.clientX - slotRect.left - imagePointX * viewerBaseWidth * viewerZoom;
    const top = event.clientY - slotRect.top - imagePointY * viewerBaseHeight * viewerZoom;
    image.style.left = `${viewerZoom === 1 ? Math.max(0, (slot.clientWidth - viewerBaseWidth) / 2) : left}px`;
    image.style.top = `${viewerZoom === 1 ? Math.max(0, (slot.clientHeight - viewerBaseHeight) / 2) : top}px`;
  }, { passive: false });
  let dragState = null;
  viewer.addEventListener("pointerdown", (event) => {
    const image = slot.querySelector("img.zoomable.is-zoomed");
    if (!image || event.button !== 0 || event.target !== image) return;
    dragState = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: Number.parseFloat(image.style.left) || 0, top: Number.parseFloat(image.style.top) || 0, image };
    image.classList.add("is-dragging");
    image.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  viewer.addEventListener("pointermove", (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    dragState.image.style.left = `${dragState.left + event.clientX - dragState.startX}px`;
    dragState.image.style.top = `${dragState.top + event.clientY - dragState.startY}px`;
  });
  function finishImageDrag(event) {
    if (!dragState || (event && event.pointerId !== dragState.pointerId)) return;
    dragState.image.classList.remove("is-dragging");
    dragState = null;
  }
  viewer.addEventListener("pointerup", finishImageDrag);
  viewer.addEventListener("pointercancel", finishImageDrag);
  shadow.querySelector("#prev").addEventListener("click", () => openViewer(viewerIndex - 1));
  shadow.querySelector("#next").addEventListener("click", () => openViewer(viewerIndex + 1));
  search.addEventListener("input", () => render());
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer || event.target === slot) closeViewer();
  });
  gallery.addEventListener("click", (event) => { if (event.target === gallery) hideGallery(); });
  document.addEventListener("keydown", (event) => {
    if (gallery.style.display !== "block") return;
    if (event.key === "Escape") { if (viewer.classList.contains("open")) closeViewer(); else hideGallery(); }
    if (viewer.classList.contains("open") && event.key === "ArrowLeft") openViewer(viewerIndex - 1);
    if (viewer.classList.contains("open") && event.key === "ArrowRight") openViewer(viewerIndex + 1);
  });
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "GALLERIFY_TOGGLE") {
      if (!extensionEnabled) { sendResponse({ ok: false, disabled: true }); return; }
      gallery.style.display === "block" ? hideGallery() : openGallery();
      sendResponse({ ok: true });
    } else if (message?.type === "GALLERIFY_REFRESH") {
      if (gallery.style.display === "block") {
        closeViewer();
        collect();
        render("");
      }
      sendResponse({ ok: true });
    }
  });
  observer = new MutationObserver(() => { if (extensionEnabled && gallery.style.display === "block") { collect(); render(); } });
  if (extensionEnabled) observer.observe(document.documentElement, { childList: true, subtree: true });
})();
