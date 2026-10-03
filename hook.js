// MAIN world: nghe lỏm fetch + XHR (phương án dự phòng)
(() => {
  const KEY = "get-detail-document";

  const emit = (data, api) => {
    if (data && typeof data.pdfFLink === "string" && data.pdfFLink) {
      window.postMessage({ source: "pdf-sniffer", pdf: data.pdfFLink, api }, "*");
    }
  };

  const _fetch = window.fetch;
  window.fetch = async function (...args) {
    const res = await _fetch.apply(this, args);
    try {
      const a = args[0];
      const url = typeof a === "string" ? a : a instanceof Request ? a.url : String(a);
      if (url.includes(KEY)) res.clone().json().then((d) => emit(d, url)).catch(() => {});
    } catch {}
    return res;
  };

  const _open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    const api = String(url);
    if (api.includes(KEY)) {
      this.addEventListener("load", () => {
        try {
          const body = this.responseType === "json" ? this.response : JSON.parse(this.responseText);
          emit(body, api);
        } catch {}
      });
    }
    return _open.call(this, method, url, ...rest);
  };
})();
