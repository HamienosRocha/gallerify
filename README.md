# Gallerify — Page Media Gallery

A Chrome extension that collects images and videos from the current page into a searchable gallery. Use the extension button to open the whole page, or hover a media item and click its small corner button to jump straight to it.

## Install in Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select this folder.
4. Open a webpage and click the Gallerify extension button.

The extension reads media elements in the page you choose to use it on. Chrome blocks extensions on some internal pages, the Chrome Web Store, and certain protected pages.

## Use

- Click the toolbar button, then choose **Open page gallery** to view all detected media.
- Toggle **Enable on this site** in the popup to turn gallery buttons and overlays on or off for the current website. Each hostname has its own saved setting.
- Hover an image or video and click the gallery icon in its upper-right corner to open that item in the viewer.
- Use the gear in the popup to ignore small images. This is enabled by default and hides images smaller than both 32px wide and 32px high; adjust or disable the filter there. Videos are not affected.
- Use **Save changes** in the image settings to save the filter and refresh an open gallery. **Back** discards pending edits.
- Search by media URL or alt text, use the arrows or left/right keys to move through items, and press Escape to close the viewer or gallery.
- In the image viewer, scroll over an image to zoom toward the pointer. Drag a zoomed image to pan around it. Videos use their native controls.
- Use the refresh button if the page loads more media after the gallery is open.
- Some sites lazy-load images only as you scroll. Close the gallery, scroll through the page to let those images load, then reopen the gallery and use refresh.
- In the full-size viewer, choose **Show on page** to close the gallery and scroll to the original media, or **Close gallery** to dismiss the gallery completely.
- Choose **Auto**, **Light**, or **Dark** from the gallery theme menu. **Auto** follows your system appearance and is the default.
- To inspect Gallerify in Chrome Task Manager, press **Shift + Esc** and find **Extension: Gallerify — Page Media Gallery**.

## AI assistance

This project was developed with assistance from OpenAI Codex, an AI coding assistant.

