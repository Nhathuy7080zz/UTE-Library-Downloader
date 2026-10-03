const API_BASE = "https://apiuni.dlib.vn/api/v1/congcong/get-detail-document/";
const $ = (id) => document.getElementById(id);

// Cắt đuôi kiểu " - Thư viện số HCMUTE"
const clean = (t) =>
  (t || "").replace(/\s*[-|–—]\s*[^-|–—]*(thư viện|dlib|hcmute)[^-|–—]*$/i, "").trim();
const safeName = (t) =>
  (t || "").replace(/[\\/:*?"<>|\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 150);

// Chạy TRONG trang (giống hệt request mà web tự gửi): lấy pdfFLink + các ứng viên tên sách
async function inPage(apiBase) {
  // Hỗ trợ cả /tai-lieu/<slug>.html lẫn /reader/tai-lieu/<slug>
  const m = location.pathname.match(/\/tai-lieu\/([^/]+?)(?:\.html)?\/?$/);
  const slug = m ? m[1] : "";

  const candidates = [];
  if (slug) candidates.push(apiBase + "/tai-lieu/" + slug + ".html");
  // Dự phòng: URL API thật mà trang đã gọi (lấy từ Performance timeline)
  const seen = performance.getEntriesByType("resource")
    .map((e) => e.name)
    .filter((n) => n.includes("get-detail-document") && (!slug || n.includes(slug)))
    .reverse();
  candidates.push(...seen);

  const out = {
    slug,
    pdf: null,
    titles: [
      document.title,
      document.querySelector("h1")?.textContent,
      document.querySelector('meta[property="og:title"]')?.content,
    ],
  };
  for (const url of new Set(candidates)) {
    try {
      const res = await fetch(url, { credentials: "include" });
      const pdf = (await res.json()).pdfFLink;
      if (pdf) { out.pdf = pdf; break; }
    } catch {}
  }
  return out;
}

function fail(msg) {
  $("status").textContent = msg;
  $("status").classList.add("err");
}

(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  let r;
  try {
    [{ result: r }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      func: inPage,
      args: [API_BASE],
    });
  } catch {
    return fail("Không chạy được trên tab này. Mở trang tài liệu dlib rồi thử lại.");
  }

  // Dự phòng: link mà hook bắt được, khớp đúng đường dẫn trang hiện tại
  let pdf = r.pdf;
  if (!pdf && r.slug) {
    const key = `tab_${tab.id}`;
    const list = (await chrome.storage.local.get(key))[key] || [];
    pdf = list.find((x) => x.api.includes(r.slug))?.url || null;
  }
  if (!pdf) return fail("Không lấy được link PDF. Reload trang rồi thử lại.");

  const guess = r.titles.map(clean).find(Boolean) || "tai-lieu";
  $("name").value = safeName(guess);
  $("url").textContent = pdf;
  $("status").hidden = true;
  $("box").hidden = false;

  $("dl").onclick = () =>
    chrome.downloads.download({
      url: pdf,
      filename: (safeName($("name").value) || "tai-lieu") + ".pdf",
      conflictAction: "uniquify",
    });
  $("open").onclick = () => chrome.tabs.create({ url: pdf });
  $("copy").onclick = async (e) => {
    await navigator.clipboard.writeText(pdf);
    e.target.textContent = "Đã copy ✓";
  };
})();
