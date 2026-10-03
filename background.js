const keyOf = (tabId) => `tab_${tabId}`;

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== "PDF_LINK" || !sender.tab) return;
  const tabId = sender.tab.id;
  const key = keyOf(tabId);

  chrome.storage.local.get(key).then((store) => {
    const list = store[key] || [];
    if (!list.some((x) => x.url === msg.pdf)) {
      list.unshift({ url: msg.pdf, api: msg.api || "", time: Date.now() });
    }
    chrome.storage.local.set({ [key]: list });
    chrome.action.setBadgeText({ text: String(list.length), tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#16a34a", tabId });
  });
});

chrome.tabs.onRemoved.addListener((tabId) => chrome.storage.local.remove(keyOf(tabId)));
