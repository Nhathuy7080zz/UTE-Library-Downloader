window.addEventListener("message", (e) => {
  if (e.source !== window || e.data?.source !== "pdf-sniffer") return;
  chrome.runtime.sendMessage({ type: "PDF_LINK", pdf: e.data.pdf, api: e.data.api });
});
