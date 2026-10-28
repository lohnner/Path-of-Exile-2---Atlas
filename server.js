import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createUpdater } from "./updater.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const SETTINGS_FILE = path.join(ROOT, "settings.json");
const META_FILE = path.join(DATA_DIR, "sync.json");
const PORT = Number(process.env.POE2_WIKI_PORT || 4173);
const REPO_BASE = "https://repoe-fork.github.io/poe2/";
const WIKI_API = "https://www.poe2wiki.net/w/api.php";
const PT_ITEMS_INDEX = "https://poe2db.tw/pt/Items";
const PT_MODS_INDEX = "https://poe2database.com/pt-br/mods";
const PT_ITEM_PAGE_SKIP = new Set(["Items", "Act", "Ascendancy_class", "Crafting", "Desecrated_Modifiers", "Economy", "EndGame", "Keywords", "Modifiers", "news", "passive-skill-tree", "patreon", "privacy", "Quest"]);
const DATASETS = ["base_items", "mods", "uniques", "skill_gems", "wiki_unique_items", "pt_items", "pt_mods", "pt_runes", "pt_omens", "pt_essences", "pt_abyss"];
let syncPromise = null;
const updater = createUpdater(ROOT);

async function readJson(file, fallback = null) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch { return fallback; }
}

async function readSettings() {
  return await readJson(SETTINGS_FILE, {});
}

async function findGamePath() {
  const settings = await readSettings();
  const known = [
    settings.gamePath,
    "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Path of Exile 2",
    "C:\\Program Files\\Grinding Gear Games\\Path of Exile 2",
    "D:\\SteamLibrary\\steamapps\\common\\Path of Exile 2",
    "D:\\Steam\\steamapps\\common\\Path of Exile 2"
  ].filter(Boolean);
  for (const candidate of [...new Set(known)]) {
    try {
      const bundleDir = path.join(candidate, "Bundles2");
      const entries = await fs.readdir(bundleDir);
      if (entries.length) return candidate;
    } catch {}
  }
  return null;
}

async function gameStatus() {
  const gamePath = await findGamePath();
  if (!gamePath) return { found: false, path: null, bundlesUpdated: null };
  let bundlesUpdated = null;
  try {
    const stat = await fs.stat(path.join(gamePath, "Bundles2"));
    bundlesUpdated = stat.mtime.toISOString();
  } catch {}
  return { found: true, path: gamePath, bundlesUpdated };
}

async function getStatus() {
  const meta = await readJson(META_FILE, null);
  const game = await gameStatus();
  return {
    hasData: !!meta,
    sync: meta,
    counts: meta ? (meta.counts || null) : null,
    game,
    source: { repository: REPO_BASE, wiki: "https://www.poe2wiki.net/", portugueseItems: PT_ITEMS_INDEX }
  };
}

async function fetchJson(url, label) {
  const response = await fetch(url, {
    headers: { "User-Agent": "PoE2-Local-Atlas/1.0 (local item reference)" },
    signal: AbortSignal.timeout(90000)
  });
  if (!response.ok) throw new Error(label + ": HTTP " + response.status);
  const text = await response.text();
  try { return { json: JSON.parse(text), response }; }
  catch { throw new Error(label + ": resposta não é JSON válido"); }
}

async function fetchHtml(url, label) {
  const response = await fetch(url, {
    headers: { "User-Agent": "PoE2-Local-Atlas/1.0 (local item reference)" },
    signal: AbortSignal.timeout(45000)
  });
  if (!response.ok) throw new Error(label + ": HTTP " + response.status);
  return await response.text();
}

function normalizeItemKey(value) {
  try { value = decodeURIComponent(String(value || "")); } catch { value = String(value || ""); }
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en-US").replace(/[^a-z0-9]/g, "");
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}

function htmlText(value) {
  return decodeHtml(String(value || "").replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function modifierPlainText(value) {
  return htmlText(String(value || "")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[([^\]|]+)\|([^\]]+)\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[([^\]]+)\]/g, "$1"));
}

function modifierTextKey(value) {
  return modifierPlainText(value).toLocaleLowerCase("en-US");
}

function modifierPatternKey(value) {
  return modifierTextKey(value).replace(/\d+(?:\.\d+)?/g, "#");
}

function modifierPatternTemplate(value) {
  let index = 0;
  return modifierPlainText(value).replace(/\d+(?:\.\d+)?/g, () => "{{" + index++ + "}}");
}

function firstLocalizedNameVariant(value) {
  if (/\s/.test(value)) return value;
  const variants = value.match(/[A-ZÀÁÂÃÉÊÍÓÔÕÚÇ][^A-ZÀÁÂÃÉÊÍÓÔÕÚÇ]*/g) || [];
  return variants.length > 1 && variants.join("") === value ? variants[0] : value;
}

function modifierRows(pageHtml, localized = false) {
  return [...pageHtml.matchAll(/<tr\b[^>]*\bid=["']t\d+["'][^>]*>[\s\S]*?<\/tr>/gi)].map(match => {
    const row = match[0];
    const nameCell = row.match(/<td\b[^>]*class=["'][^"']*hidden\s+sm:table-cell[^"']*["'][^>]*>([\s\S]*?)<\/td>/i);
    const lines = [...row.matchAll(/<span\b[^>]*class=["'][^"']*\bmod-line\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi)].map(line => htmlText(line[1])).filter(Boolean);
    const name = nameCell ? htmlText(nameCell[1]) : "";
    return { name: localized ? firstLocalizedNameVariant(name) : name, lines };
  });
}

function recordCandidate(store, key, value) {
  if (!key || !value) return;
  const candidates = store[key] || (store[key] = {});
  candidates[value] = (candidates[value] || 0) + 1;
}

function chooseCandidates(store) {
  return Object.fromEntries(Object.entries(store).map(([key, candidates]) => [key,
    Object.entries(candidates).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))[0][0]
  ]));
}

async function fetchPortugueseModifierData(previous = {}, fallbackVersion = "") {
  const [indexHtml, strengthPage] = await Promise.all([
    fetchHtml(PT_MODS_INDEX, "Índice de modificadores em português"),
    fetchHtml("https://poe2database.com/pt-br/mods/strength", "Versão dos modificadores em português")
  ]);
  const patchMatch = strengthPage.match(/\bpatch\s*<!--\s*-->\s*([0-9]+(?:\.[0-9]+)*)/i);
  const patch = patchMatch ? patchMatch[1] : fallbackVersion;
  if (previous && previous.patch === patch && Object.keys(previous.texts || {}).length) return previous;
  const slugs = [...new Set([...indexHtml.matchAll(/<a\b[^>]*\bhref=["'](?:https:\/\/poe2database\.com)?\/pt-br\/mods\/([a-z0-9-]+)["']/gi)].map(match => match[1]))];
  if (!slugs.length) throw new Error("O índice em português não retornou modificadores.");

  const textCandidates = {};
  const patternCandidates = {};
  const nameCandidates = {};
  const failed = [];
  const queue = [...slugs];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const slug = queue.shift();
      try {
        const [englishHtml, portugueseHtml] = await Promise.all([
          fetchHtml("https://poe2database.com/mods/" + slug, "Modificador em inglês (" + slug + ")"),
          slug === "strength" ? Promise.resolve(strengthPage) : fetchHtml("https://poe2database.com/pt-br/mods/" + slug, "Modificador em português (" + slug + ")")
        ]);
        const englishRows = modifierRows(englishHtml);
        const portugueseRows = modifierRows(portugueseHtml, true);
        const localizedRows = new Map(portugueseRows.map((row, index) => [index, row]));
        englishRows.forEach((english, index) => {
          const portuguese = localizedRows.get(index);
          if (!portuguese) return;
          if (english.name && portuguese.name) recordCandidate(nameCandidates, english.name.toLocaleLowerCase("en-US"), portuguese.name);
          for (let lineIndex = 0; lineIndex < Math.min(english.lines.length, portuguese.lines.length); lineIndex++) {
            const englishLine = english.lines[lineIndex];
            const portugueseLine = portuguese.lines[lineIndex];
            recordCandidate(textCandidates, modifierTextKey(englishLine), portugueseLine);
            recordCandidate(patternCandidates, modifierPatternKey(englishLine), modifierPatternTemplate(portugueseLine));
          }
        });
      } catch {
        failed.push(slug);
      }
    }
  });
  await Promise.all(workers);

  const texts = chooseCandidates(textCandidates);
  const patterns = chooseCandidates(patternCandidates);
  const names = chooseCandidates(nameCandidates);
  if (!Object.keys(texts).length || !Object.keys(names).length) throw new Error("A fonte em português não retornou linhas de modificadores.");
  return { patch, updatedAt: new Date().toISOString(), pageCount: slugs.length, failedPages: failed.length, texts, patterns, names };
}

function attribute(tag, name) {
  const match = tag.match(new RegExp("\\b" + name + "\\s*=\\s*['\\\"]([^'\\\"]*)['\\\"]", "i"));
  return match ? decodeHtml(match[1]) : "";
}

function parsePortugueseItems(pageHtml) {
  const result = {};
  const starts = [...pageHtml.matchAll(/<div\s+class=["']col["']\s*>/gi)].map(match => match.index);
  for (let index = 0; index < starts.length; index++) {
    const card = pageHtml.slice(starts[index], starts[index + 1] || pageHtml.length);
    const imageMatch = card.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
    const image = imageMatch ? decodeHtml(imageMatch[1]) : "";
    const anchors = [...card.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
    for (const match of anchors) {
      const tag = match[1];
      const classes = attribute(tag, "class");
      if (!/(?:whiteitem|UniqueItem|UniqueItems|item_currency|skillgem|supportgem|gemitem)/i.test(classes)) continue;
      const href = attribute(tag, "href");
      let slug = "";
      if (href.startsWith("/pt/")) slug = href.slice(4).split(/[?#]/)[0];
      else if (/^[A-Za-z0-9_'-]+$/.test(href)) slug = href;
      if (!slug || ["Items", "Modifiers", "Keywords"].includes(slug)) continue;
      let name = "";
      const uniqueName = match[2].match(/<span\b[^>]*class=["'][^"']*\buniqueName\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
      if (uniqueName) name = htmlText(uniqueName[1]);
      else name = htmlText(match[2]);
      if (!name || name.length > 100 || /^(?:Item|Gema|Modificadores)$/i.test(name)) continue;
      const key = normalizeItemKey(slug);
      if (!key) continue;
      const statLines = [...card.matchAll(/<div\b[^>]*class=["'][^"']*\bexplicitMod\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi)].map(row => htmlText(row[1])).filter(Boolean);
      const entry = { name, slug, image, stats: /UniqueItem/i.test(classes) && statLines.length ? statLines : undefined, page: "https://poe2db.tw/pt/" + encodeURIComponent(slug) };
      if (!result[key] || (entry.stats && entry.stats.length > (result[key].stats || []).length)) result[key] = entry;
    }
  }
  for (const match of pageHtml.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const tag = match[1];
    const classes = attribute(tag, "class");
    if (!/\bgem_[a-z0-9_-]+\b/i.test(classes)) continue;
    const href = attribute(tag, "href");
    if (!href.startsWith("/pt/")) continue;
    const slug = href.slice(4).split(/[?#]/)[0];
    const key = normalizeItemKey(slug);
    const imageMatch = match[2].match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
    const image = imageMatch ? decodeHtml(imageMatch[1]) : "";
    const name = htmlText(match[2]).replace(/\s*\(\d+\)\s*$/, "");
    if (!key || !name || name.length > 100) {
      if (key && image && result[key]) result[key].image = image;
      continue;
    }
    const entry = { ...(result[key] || {}), name, slug, page: "https://poe2db.tw/pt/" + encodeURIComponent(slug) };
    if (image) entry.image = image;
    result[key] = entry;
  }
  return result;
}

async function fetchPortugueseItemData(previous = {}) {
  const indexHtml = await fetchHtml(PT_ITEMS_INDEX, "Índice de itens em português");
  const pages = new Set();
  for (const match of indexHtml.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    let href = decodeHtml(match[1]);
    if (href.startsWith("/pt/")) href = href.slice(4);
    if (!/^[A-Za-z0-9_-]+$/.test(href) || PT_ITEM_PAGE_SKIP.has(href)) continue;
    pages.add(href);
  }
  const queue = [...pages];
  const result = { ...previous };
  const failed = [];
  const workers = Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const page = queue.shift();
      try {
        const html = await fetchHtml("https://poe2db.tw/pt/" + encodeURIComponent(page), "Itens em português (" + page + ")");
        Object.assign(result, parsePortugueseItems(html));
      } catch { failed.push(page); }
    }
  });
  await Promise.all(workers);
  if (!Object.keys(result).length) throw new Error("A fonte em português não retornou itens.");
  return { items: result, pages: pages.size, failed };
}

async function fetchUniqueWikiData() {
  const url = new URL(WIKI_API);
  url.searchParams.set("action", "cargoquery");
  url.searchParams.set("tables", "items");
  url.searchParams.set("fields", "name,stat_text,rarity_id,base_item");
  url.searchParams.set("where", 'rarity_id="unique"');
  url.searchParams.set("limit", "500");
  url.searchParams.set("format", "json");
  const { json } = await fetchJson(url, "Wiki de únicos");
  if (json.error) throw new Error("API da wiki indisponível: " + (json.error.info || json.error.code));
  return (json.cargoquery || []).map(row => row.title || {}).filter(row => row.name);
}

async function performSync() {
  const fileNames = ["base_items.json", "mods.json", "uniques.json", "skill_gems.json"];
  const downloaded = {};
  let sourceUpdated = null;
  let sourceVersion = "não informada";
  const [rootPage, headResponse] = await Promise.all([
    fetch(REPO_BASE, { signal: AbortSignal.timeout(30000) }).then(r => r.ok ? r.text() : "").catch(() => ""),
    fetch(REPO_BASE + "mods.json", { method: "HEAD", signal: AbortSignal.timeout(30000) }).catch(() => null)
  ]);
  const versionMatch = rootPage.match(/RePoE\s*-\s*PoE2 version\s+([^\s<]+)/i);
  if (versionMatch) sourceVersion = versionMatch[1];
  if (headResponse) sourceUpdated = headResponse.headers.get("last-modified");

  const files = await Promise.all(fileNames.map(async name => {
    const { json } = await fetchJson(REPO_BASE + name, name);
    return [name.replace(/\.json$/, ""), json];
  }));
  for (const [name, json] of files) downloaded[name] = json;
  if (!downloaded.base_items || !downloaded.mods || !downloaded.uniques || !downloaded.skill_gems) {
    throw new Error("A exportação recebida está incompleta.");
  }

  const warnings = [];
  try { downloaded.wiki_unique_items = await fetchUniqueWikiData(); }
  catch (error) {
    downloaded.wiki_unique_items = await readJson(path.join(DATA_DIR, "wiki_unique_items.json"), []);
    warnings.push("A wiki não respondeu; mantive os dados de únicos já salvos.");
  }

  try {
    const previous = await readJson(path.join(DATA_DIR, "pt_items.json"), {});
    const localized = await fetchPortugueseItemData(previous || {});
    downloaded.pt_items = localized.items;
    if (localized.failed.length) warnings.push("Algumas páginas da fonte em português não responderam; usei os dados locais disponíveis.");
  } catch {
    downloaded.pt_items = await readJson(path.join(DATA_DIR, "pt_items.json"), {});
    warnings.push(Object.keys(downloaded.pt_items || {}).length
      ? "A fonte em português não respondeu; mantive as traduções locais salvas."
      : "A fonte em português não respondeu; nomes sem tradução aparecerão no idioma original.");
  }

  try {
    const previous = await readJson(path.join(DATA_DIR, "pt_mods.json"), null);
    downloaded.pt_mods = await fetchPortugueseModifierData(previous || {}, sourceVersion);
    if (downloaded.pt_mods.failedPages) warnings.push("Algumas páginas de modificadores em português falharam; mantive as traduções disponíveis.");
  } catch {
    downloaded.pt_mods = await readJson(path.join(DATA_DIR, "pt_mods.json"), { texts: {}, names: {} });
    warnings.push(Object.keys(downloaded.pt_mods.texts || {}).length
      ? "A fonte de modificadores em português não respondeu; mantive as traduções locais salvas."
      : "A fonte de modificadores em português não respondeu; alguns efeitos aparecerão no idioma original.");
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  for (const [name, json] of Object.entries(downloaded)) {
    await fs.writeFile(path.join(DATA_DIR, name + ".json"), JSON.stringify(json), "utf8");
  }
  const counts = {
    baseItems: Object.keys(downloaded.base_items).length,
    modifiers: Object.keys(downloaded.mods).length,
    uniques: Array.isArray(downloaded.uniques) ? downloaded.uniques.length : Object.keys(downloaded.uniques).length,
    gems: Array.isArray(downloaded.skill_gems) ? downloaded.skill_gems.length : Object.keys(downloaded.skill_gems).length,
    wikiUniqueStats: downloaded.wiki_unique_items.length,
    portugueseItems: Object.keys(downloaded.pt_items || {}).length,
    portugueseModifiers: Object.keys(downloaded.pt_mods && downloaded.pt_mods.texts || {}).length
  };
  const meta = {
    sourceVersion,
    sourceUpdated,
    syncedAt: new Date().toISOString(),
    repoUrl: REPO_BASE,
    wikiUrl: "https://www.poe2wiki.net/",
    counts,
    warnings
  };
  await fs.writeFile(META_FILE, JSON.stringify(meta, null, 2), "utf8");
  return meta;
}

async function synchronize() {
  if (!syncPromise) syncPromise = performSync().finally(() => { syncPromise = null; });
  return await syncPromise;
}

async function readBody(request) {
  return await readBodyWithLimit(request, 100000);
}

async function readBodyWithLimit(request, maxBytes) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body, "utf8") > maxBytes) throw new Error("Corpo da requisição muito grande.");
  }
  return body ? JSON.parse(body) : {};
}

function gameFilterDirectoryCandidates() {
  const profile = process.env.USERPROFILE || process.env.HOME || "";
  const roots = [process.env.OneDrive, process.env.OneDriveConsumer, path.join(profile, "OneDrive"), profile].filter(Boolean);
  return [...new Set(roots.flatMap(root => ["Documents", "Documentos"].map(folder => path.join(root, folder, "My Games", "Path of Exile 2"))))];
}

async function findGameFilterDirectory() {
  // Pasta escolhida pelo jogador no botão "Encontrar pasta do filtro" tem prioridade.
  const { filterDirectory } = await readSettings();
  if (filterDirectory) {
    try { if ((await fs.stat(filterDirectory)).isDirectory()) return { directory: filterDirectory, foundDirectory: true, chosen: true }; } catch {}
  }
  const candidates = gameFilterDirectoryCandidates();
  let existingDirectory = null;
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (!stat.isDirectory()) continue;
      existingDirectory ||= candidate;
      const entries = await fs.readdir(candidate, { withFileTypes: true });
      if (entries.some(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".filter"))) return { directory: candidate, foundDirectory: true };
    } catch {}
  }
  if (existingDirectory) return { directory: existingDirectory, foundDirectory: true };
  return { directory: candidates[0] || "", foundDirectory: false };
}

function safeFilterFilename(value) {
  const name = String(value || "");
  return name && path.basename(name) === name && name.toLowerCase().endsWith(".filter") && !/[\\/\0]/.test(name) ? name : "";
}

function safeNewFilterFilename(value) {
  let name = String(value || "").trim();
  if (!name) return "";
  if (!name.toLowerCase().endsWith(".filter")) name += ".filter";
  const stem = name.slice(0, -7);
  if (!stem || stem.length > 100 || path.basename(name) !== name || /[<>:"/\\|?*\x00-\x1f]/.test(name) || /[. ]$/.test(stem)) return "";
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(stem)) return "";
  return name;
}

// Abre a janela do Windows para escolher uma pasta; devolve "" se o jogador cancelar.
function pickFolderDialog(initial) {
  const script = path.join(ROOT, "tools", "pick-folder.ps1");
  const args = ["-NoProfile", "-STA", "-ExecutionPolicy", "Bypass", "-File", script, initial || "", "Selecione a pasta dos filtros do Path of Exile 2"];
  return new Promise((resolve, reject) => {
    execFile("powershell.exe", args, { windowsHide: true, timeout: 600_000 }, (error, stdout) => {
      if (error) return reject(new Error("Não consegui abrir a janela de seleção de pasta."));
      resolve(String(stdout || "").trim());
    });
  });
}

async function listGameFilters() {
  const location = await findGameFilterDirectory();
  let filters = [];
  if (location.directory && location.foundDirectory) {
    const entries = await fs.readdir(location.directory, { withFileTypes: true });
    const files = entries.filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".filter"));
    filters = await Promise.all(files.map(async entry => {
      const stat = await fs.stat(path.join(location.directory, entry.name));
      return { name: entry.name, size: stat.size, modifiedAt: stat.mtime.toISOString() };
    }));
    filters.sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
  }
  return { ...location, filters };
}

// ---------- Market (valores entre itens anotados à mão) ----------
const MARKET_FILE = path.join(DATA_DIR, "market.json");
// Cotações "X itens = Y itens": o item de mais valor fica sempre à esquerda.
function normalizeMarketItem(item) {
  if (!item || typeof item !== "object") return null;
  const text = (value, max) => typeof value === "string" ? value.slice(0, max) : "";
  const id = text(item.id, 200);
  const name = text(item.name, 120);
  if (!id || !name) return null;
  const icon = text(item.icon, 400);
  return { id, name, english: text(item.english, 120), icon: /^(https:\/\/|\/)/.test(icon) ? icon : "" };
}
function normalizeMarketTrades(input) {
  const positive = value => { const number = Number(value); return Number.isFinite(number) && number > 0 ? Math.min(number, 1e9) : null; };
  const trades = [];
  for (const entry of Array.isArray(input) ? input.slice(0, 1000) : []) {
    let left = normalizeMarketItem(entry && entry.left);
    let right = normalizeMarketItem(entry && entry.right);
    let leftQty = positive(entry && entry.leftQty);
    let rightQty = positive(entry && entry.rightQty);
    if (!left || !right || !leftQty || !rightQty) continue;
    // 1 do item da esquerda tem que valer pelo menos 1 do da direita.
    if (rightQty / leftQty < 1) [left, right, leftQty, rightQty] = [right, left, rightQty, leftQty];
    trades.push({ id: typeof entry.id === "string" && /^[a-z0-9-]{1,40}$/.test(entry.id) ? entry.id : Math.random().toString(36).slice(2, 12), left, leftQty, right, rightQty, updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt.slice(0, 40) : new Date().toISOString() });
  }
  return trades;
}

// ---------- Cofre (estoque do jogador e histórico do que entrou) ----------
const ECONOMY_FILE = path.join(DATA_DIR, "economy.json");
const PRICES_FILE = path.join(DATA_DIR, "currency_prices.json");
function normalizeEconomy(input) {
  const text = (value, max) => typeof value === "string" ? value.slice(0, max) : "";
  const number = value => { const parsed = Number(value); return Number.isFinite(parsed) ? Math.max(-1e9, Math.min(1e9, parsed)) : 0; };
  const item = entry => {
    if (!entry || typeof entry !== "object" || !text(entry.id, 200) || !text(entry.name, 120)) return null;
    const icon = text(entry.icon, 400);
    return { id: text(entry.id, 200), name: text(entry.name, 120), english: text(entry.english, 120), icon: /^(https:\/\/|\/)/.test(icon) ? icon : "" };
  };
  const items = [];
  for (const entry of Array.isArray(input && input.items) ? input.items.slice(0, 500) : []) {
    const base = item(entry);
    if (base && !items.some(existing => existing.id === base.id)) items.push({ ...base, qty: Math.max(0, number(entry.qty)), updatedAt: text(entry.updatedAt, 40) });
  }
  const history = [];
  for (const entry of Array.isArray(input && input.history) ? input.history.slice(-5000) : []) {
    const base = item(entry);
    const at = text(entry.at, 40);
    if (!base || !at || isNaN(new Date(at))) continue;
    history.push({ ...base, entryId: /^[a-z0-9-]{1,40}$/.test(entry.entryId) ? entry.entryId : Math.random().toString(36).slice(2, 12), at, before: number(entry.before), after: number(entry.after), delta: number(entry.delta) });
  }
  return { items, history };
}

// ---------- Build (árvore de passivas montada pelo jogador) ----------
const PLANNER_FILE = path.join(DATA_DIR, "planner_builds.json");
function normalizePlannerBuilds(input) {
  const builds = [];
  for (const entry of Array.isArray(input) ? input.slice(0, 200) : []) {
    if (!entry || typeof entry !== "object") continue;
    const text = (value, max) => typeof value === "string" ? value.slice(0, max) : "";
    const id = /^[a-z0-9-]{1,40}$/.test(entry.id) ? entry.id : Math.random().toString(36).slice(2, 12);
    const className = text(entry.className, 40);
    if (!className) continue;
    const nodes = [...new Set((Array.isArray(entry.nodes) ? entry.nodes : []).map(Number).filter(Number.isInteger))].slice(0, 400);
    const gameFile = /^[^\\/:*?"<>|]{1,120}\.build$/.test(entry.gameFile) ? entry.gameFile : "";
    builds.push({ id, name: text(entry.name, 80).trim() || "Build sem nome", className, nodes, notes: text(entry.notes, 2000), gameFile, createdAt: text(entry.createdAt, 40) || new Date().toISOString(), updatedAt: text(entry.updatedAt, 40) || new Date().toISOString() });
  }
  return builds;
}

// Planejador de builds do jogo: lê arquivos .build de "My Games/Path of Exile 2/BuildPlanner".
// O arquivo usa o nome interno das passivas (ex.: "poison18"); passive_ids.json traduz o número da árvore para ele.
const PASSIVE_IDS_FILE = path.join(DATA_DIR, "passive_ids.json");
const PLANNER_TREE_FILE = path.join(PUBLIC_DIR, "data", "passive-tree-pt.json");
let plannerGameData = null;
async function loadPlannerGameData() {
  if (!plannerGameData) {
    const [ids, tree] = await Promise.all([readJson(PASSIVE_IDS_FILE, null), readJson(PLANNER_TREE_FILE, null)]);
    if (!ids || !tree) throw new Error("Faltam os dados da árvore para gerar o arquivo do jogo.");
    const starts = new Set(Object.entries(tree.nodes).filter(([, node]) => node.k === "start").map(([id]) => Number(id)));
    // O jogo pede uma ascendência; sem nós de ascendência na lista, ela só identifica a classe.
    const ascendancy = new Map(tree.classes.map(item => [item.name, item.ascendancies[0] && item.ascendancies[0].id]));
    plannerGameData = { ids, starts, ascendancy };
  }
  return plannerGameData;
}
const gameBuildFileName = build => (build.name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || "Build") + ".build";
async function writeGameBuild(build) {
  const { ids, starts, ascendancy } = await loadPlannerGameData();
  const { directory } = await findGameFilterDirectory();
  const folder = path.join(directory, "BuildPlanner");
  await fs.mkdir(folder, { recursive: true });
  const passives = build.nodes.filter(id => !starts.has(id) && ids[id]).map(id => ({ id: ids[id] }));
  const content = { author: "Atlas de Wraeclast", name: build.name, ascendancy: ascendancy.get(build.className) || "", passives };
  const fileName = gameBuildFileName(build);
  await fs.writeFile(path.join(folder, fileName), JSON.stringify(content), "utf8");
  return { fileName, folder, passives: passives.length };
}

// Descrição em português de uma gema (página do PoE2DB), guardada em cache local.
const SKILL_GEM_INFO_FILE = path.join(DATA_DIR, "skill_gem_info_pt.json");
let skillGemInfoCache = null;
async function skillGemInfo(slug, lang = "pt") {
  if (!/^[\w%'().,-]+$/.test(slug)) throw new Error("Gema inválida");
  if (!skillGemInfoCache) skillGemInfoCache = await readJson(SKILL_GEM_INFO_FILE, {});
  // Em inglês a página é a /us/ do PoE2DB; a chave do cache leva o idioma.
  const cacheKey = lang === "en" ? "en:" + slug : slug;
  if (skillGemInfoCache[cacheKey]) return skillGemInfoCache[cacheKey];
  const html = await fetchHtml("https://poe2db.tw/" + (lang === "en" ? "us" : "pt") + "/" + slug, "Gema " + slug);
  const start = html.indexOf('class="newItemPopup GemPopup');
  if (start < 0) throw new Error("Gema não encontrada no PoE2DB");
  const next = html.indexOf('class="newItemPopup', start + 30);
  const popup = html.slice(start, next > 0 ? Math.min(next, start + 20000) : start + 20000);
  const all = (pattern) => [...popup.matchAll(pattern)].map(match => htmlText(match[1])).filter(Boolean);
  const head = popup.split('class="hybridHeader gemTabs"')[0];
  const info = {
    type: htmlText((head.match(/class="itemName typeLine"[^>]*>([\s\S]*?)<\/div>/) || [])[1]),
    properties: [...head.matchAll(/<div class="(?:property|requirements)">([\s\S]*?)<\/div>/g)].map(match => htmlText(match[1])).filter(Boolean),
    description: all(/<div class="secDescrText">([\s\S]*?)<\/div>/g).join(" "),
    effects: all(/<div class="explicitMod">([\s\S]*?)<\/div>/g)
  };
  skillGemInfoCache[cacheKey] = info;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SKILL_GEM_INFO_FILE, JSON.stringify(skillGemInfoCache), "utf8");
  return info;
}

// Ícone da habilidade na wiki comunitária, para gemas cujo ícone não existe no CDN do PoE2DB.
const SKILL_ICON_FILE = path.join(DATA_DIR, "skill_icon_wiki.json");
let skillIconCache = null;
function wikiFileUrl(fileName) {
  const file = fileName.replace(/ /g, "_").replace(/^./, char => char.toUpperCase());
  const hash = createHash("md5").update(file, "utf8").digest("hex");
  return "https://www.poe2wiki.net/images/" + hash[0] + "/" + hash.slice(0, 2) + "/" + encodeURIComponent(file).replace(/%2F/g, "/");
}
async function skillIconUrl(name, slug) {
  if (!name || name.length > 80) throw new Error("Gema inválida");
  if (!skillIconCache) skillIconCache = await readJson(SKILL_ICON_FILE, {});
  if (skillIconCache[name]) return skillIconCache[name];
  const title = "File:" + name + " skill icon.png";
  // A wiki às vezes bloqueia com Cloudflare; nesse caso segue para o PoE2DB.
  const json = await fetchJson(WIKI_API + "?action=query&prop=imageinfo&iiprop=url&format=json&titles=" + encodeURIComponent(title), "Ícone " + name).then(result => result.json).catch(() => ({}));
  const page = Object.values((json.query && json.query.pages) || {})[0];
  let iconUrl = page && page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url || "";
  // Sem ícone na wiki: usa a imagem da própria gema na página do PoE2DB.
  if (!iconUrl && slug && /^[\w%'().,-]+$/.test(slug)) {
    const html = await fetchHtml("https://poe2db.tw/pt/" + slug, "Gema " + slug).catch(() => "");
    iconUrl = (html.match(/https:\/\/cdn\.poe2db\.tw\/image\/Art\/2DItems\/Gems\/[^"' )]+\.webp/) || [])[0] || "";
    // O CDN do PoE2DB recusa (403) alguns ícones de gemas novas.
    if (iconUrl && !(await fetch(iconUrl, { method: "HEAD", signal: AbortSignal.timeout(15000) }).then(response => response.ok).catch(() => false))) iconUrl = "";
  }
  // Último recurso: ícone de inventário da wiki, cujo endereço segue o padrão de hash do MediaWiki.
  if (!iconUrl) iconUrl = wikiFileUrl(name + " inventory icon.png");
  skillIconCache[name] = iconUrl;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SKILL_ICON_FILE, JSON.stringify(skillIconCache), "utf8");
  return skillIconCache[name];
}

// Baixa o ícone uma vez e guarda em data/skill-icons: a wiki bloqueia o navegador quando recebe muitas imagens seguidas.
const SKILL_ICON_DIR = path.join(DATA_DIR, "skill-icons");
async function skillIconFile(name, slug) {
  const base = path.join(SKILL_ICON_DIR, name.replace(/[^\w'-]+/g, "_"));
  for (const [extension, type] of [[".png", "image/png"], [".webp", "image/webp"]]) {
    try { return { body: await fs.readFile(base + extension), type }; } catch {}
  }
  const iconUrl = await skillIconUrl(name, slug);
  if (!iconUrl) return null;
  const remote = await fetch(iconUrl, { headers: { "User-Agent": "Mozilla/5.0 (PoE2-Local-Atlas)" }, signal: AbortSignal.timeout(30000) }).catch(() => null);
  const type = remote && remote.ok && remote.headers.get("content-type") || "";
  if (!type.startsWith("image/")) return null;
  const body = Buffer.from(await remote.arrayBuffer());
  await fs.mkdir(SKILL_ICON_DIR, { recursive: true });
  await fs.writeFile(base + (type.includes("webp") ? ".webp" : ".png"), body);
  return { body, type };
}

function sendJson(response, status, value) {
  const body = JSON.stringify(value);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  response.end(body);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, "http://127.0.0.1:" + PORT);
  try {
    if (url.pathname === "/api/status" && request.method === "GET") {
      return sendJson(response, 200, await getStatus());
    }
    if (url.pathname === "/api/data" && request.method === "GET") {
      const data = {};
      for (const name of DATASETS) data[name] = await readJson(path.join(DATA_DIR, name + ".json"), name === "wiki_unique_items" ? [] : name === "pt_items" || name === "pt_mods" || name === "pt_runes" || name === "pt_omens" || name === "pt_essences" || name === "pt_abyss" ? {} : null);
      if (!data.base_items || !data.mods) return sendJson(response, 404, { error: "Ainda não há dados locais. Clique em Sincronizar dados." });
      return sendJson(response, 200, data);
    }
    if (url.pathname === "/api/skill-gem" && request.method === "GET") {
      return sendJson(response, 200, await skillGemInfo(url.searchParams.get("slug") || "", url.searchParams.get("lang") === "en" ? "en" : "pt"));
    }
    if (url.pathname === "/api/skill-icon" && request.method === "GET") {
      const name = url.searchParams.get("name") || "";
      const icon = await skillIconFile(name, url.searchParams.get("slug") || "");
      if (!icon) return sendJson(response, 404, { error: "Ícone não encontrado" });
      response.writeHead(200, { "Content-Type": icon.type, "Cache-Control": "max-age=604800" });
      return response.end(icon.body);
    }
    if (url.pathname === "/api/sync" && request.method === "POST") {
      const meta = await synchronize();
      return sendJson(response, 200, { ok: true, sync: meta });
    }
    if (url.pathname === "/api/game-path" && request.method === "POST") {
      const body = await readBody(request);
      const candidate = String(body.path || "").trim();
      if (!candidate) return sendJson(response, 400, { error: "Informe a pasta de instalação." });
      let valid = false;
      try {
        await fs.access(path.join(candidate, "Bundles2"));
        const names = await fs.readdir(candidate);
        valid = names.some(name => /^PathOfExile.*\.exe$/i.test(name));
      } catch {}
      if (!valid) return sendJson(response, 400, { error: "Não encontrei Bundles2 e o executável do jogo nessa pasta." });
      await fs.writeFile(SETTINGS_FILE, JSON.stringify({ ...(await readSettings()), gamePath: candidate }, null, 2), "utf8");
      return sendJson(response, 200, { ok: true, game: await gameStatus() });
    }
    if (url.pathname === "/api/update/check" && request.method === "GET") {
      return sendJson(response, 200, await updater.check(url.searchParams.get("force") === "1"));
    }
    if (url.pathname === "/api/update/apply" && request.method === "POST") {
      const result = await updater.apply();
      sendJson(response, 200, { ...result, restarting: true });
      return updater.restart(fileURLToPath(import.meta.url));
    }
    if (url.pathname === "/api/update/ping" && request.method === "GET") {
      return sendJson(response, 200, { ok: true });
    }
    if (url.pathname === "/api/loot-filters" && request.method === "GET") {
      return sendJson(response, 200, await listGameFilters());
    }
    if (url.pathname === "/api/loot-filter/folder" && request.method === "POST") {
      const current = await findGameFilterDirectory();
      const chosen = await pickFolderDialog(current.directory);
      if (!chosen) return sendJson(response, 200, { canceled: true });
      try { if (!(await fs.stat(chosen)).isDirectory()) throw new Error(); }
      catch { return sendJson(response, 400, { error: "Essa pasta não existe." }); }
      await fs.writeFile(SETTINGS_FILE, JSON.stringify({ ...(await readSettings()), filterDirectory: chosen }, null, 2), "utf8");
      return sendJson(response, 200, await listGameFilters());
    }
    if (url.pathname === "/api/loot-filter/load" && request.method === "POST") {
      const body = await readBody(request);
      const name = safeFilterFilename(body.name);
      if (!name) return sendJson(response, 400, { error: "Selecione um arquivo .filter válido." });
      const location = await findGameFilterDirectory();
      if (!location.foundDirectory) return sendJson(response, 404, { error: "A pasta de filtros do jogo não foi encontrada." });
      const filePath = path.join(location.directory, name);
      const stat = await fs.stat(filePath);
      if (!stat.isFile() || stat.size > 5_000_000) return sendJson(response, 400, { error: "O arquivo de filtro é inválido ou maior que 5 MB." });
      const text = await fs.readFile(filePath, "utf8");
      return sendJson(response, 200, { name, text, directory: location.directory });
    }
    if (url.pathname === "/api/loot-filter/save" && request.method === "POST") {
      const body = await readBodyWithLimit(request, 5_000_000);
      const name = safeFilterFilename(body.name);
      const text = typeof body.text === "string" ? body.text : "";
      if (!name || !text || text.includes("\0") || Buffer.byteLength(text, "utf8") > 4_500_000) {
        return sendJson(response, 400, { error: "O conteúdo do filtro é inválido ou muito grande." });
      }
      const location = await findGameFilterDirectory();
      if (!location.foundDirectory) return sendJson(response, 404, { error: "A pasta de filtros do jogo não foi encontrada." });
      const filePath = path.join(location.directory, name);
      let stat;
      try { stat = await fs.stat(filePath); }
      catch (error) { if (error.code === "ENOENT") return sendJson(response, 404, { error: "Esse filtro não está mais na pasta do jogo. Selecione-o novamente pela lista." }); throw error; }
      if (!stat.isFile()) return sendJson(response, 400, { error: "O filtro selecionado não é um arquivo válido." });
      await fs.writeFile(filePath, text, { encoding: "utf8" });
      const updated = await fs.stat(filePath);
      return sendJson(response, 200, { ok: true, name, path: filePath, directory: location.directory, modifiedAt: updated.mtime.toISOString() });
    }
    if (url.pathname === "/api/loot-filter/create" && request.method === "POST") {
      const body = await readBodyWithLimit(request, 5_000_000);
      const name = safeNewFilterFilename(body.name);
      const text = typeof body.text === "string" ? body.text : "";
      if (!name || !text || text.includes("\0") || Buffer.byteLength(text, "utf8") > 4_500_000) {
        return sendJson(response, 400, { error: "Informe um nome válido e um conteúdo de filtro válido." });
      }
      const location = await findGameFilterDirectory();
      const directory = location.directory || gameFilterDirectoryCandidates()[0];
      if (!directory) return sendJson(response, 404, { error: "Não encontrei a pasta de filtros do jogo." });
      await fs.mkdir(directory, { recursive: true });
      const filePath = path.join(directory, name);
      let handle;
      try { handle = await fs.open(filePath, "wx"); }
      catch (error) {
        if (error.code === "EEXIST") return sendJson(response, 409, { error: "Já existe um filtro com esse nome. Escolha outro nome para não substituir um arquivo existente." });
        throw error;
      }
      try { await handle.writeFile(text, "utf8"); }
      catch (error) { await fs.unlink(filePath).catch(() => {}); throw error; }
      finally { await handle.close(); }
      const created = await fs.stat(filePath);
      return sendJson(response, 201, { ok: true, name, path: filePath, directory, modifiedAt: created.mtime.toISOString() });
    }

    if (url.pathname === "/api/market" && request.method === "GET") {
      const market = await readJson(MARKET_FILE, {});
      return sendJson(response, 200, { trades: market.trades || [], updatedAt: market.updatedAt || null });
    }
    if (url.pathname === "/api/market" && request.method === "POST") {
      const body = await readBody(request);
      const market = { trades: normalizeMarketTrades(body.trades), updatedAt: new Date().toISOString() };
      await fs.writeFile(MARKET_FILE, JSON.stringify(market, null, 2), "utf8");
      return sendJson(response, 200, market);
    }
    if (url.pathname === "/api/economy" && request.method === "GET") {
      const [saved, prices] = await Promise.all([readJson(ECONOMY_FILE, {}), readJson(PRICES_FILE, {})]);
      // Preço em divinos pelo nome em inglês (poe.ninja), só para estimar o valor do que entrou.
      const priceMap = {};
      for (const entry of (prices && prices.items) || []) if (entry.name && Number(entry.divine) > 0) priceMap[entry.name.toLowerCase()] = Number(entry.divine);
      return sendJson(response, 200, { ...normalizeEconomy(saved), prices: priceMap, exaltedPerDivine: Number(prices && prices.exaltedPerDivine) || null, pricesUpdatedAt: (prices && prices.updatedAt) || null });
    }
    if (url.pathname === "/api/economy" && request.method === "POST") {
      const body = await readBodyWithLimit(request, 3_000_000);
      const saved = { ...normalizeEconomy(body), updatedAt: new Date().toISOString() };
      await fs.writeFile(ECONOMY_FILE, JSON.stringify(saved, null, 2), "utf8");
      return sendJson(response, 200, saved);
    }
    if (url.pathname === "/api/planner-builds" && request.method === "GET") {
      const saved = await readJson(PLANNER_FILE, {});
      return sendJson(response, 200, { builds: normalizePlannerBuilds(saved.builds) });
    }
    if (url.pathname === "/api/planner-builds" && request.method === "POST") {
      const body = await readBodyWithLimit(request, 2_000_000);
      const saved = { builds: normalizePlannerBuilds(body.builds), updatedAt: new Date().toISOString() };
      // Build ligada ao jogo: cada salvamento atualiza o arquivo .build (e troca o arquivo se o nome mudou).
      for (const build of saved.builds.filter(item => item.gameFile)) {
        try {
          const result = await writeGameBuild(build);
          if (result.fileName !== build.gameFile) await fs.unlink(path.join(result.folder, build.gameFile)).catch(() => {});
          build.gameFile = result.fileName;
        } catch {}
      }
      await fs.writeFile(PLANNER_FILE, JSON.stringify(saved, null, 2), "utf8");
      return sendJson(response, 200, saved);
    }
    if (url.pathname === "/api/planner-builds/game" && request.method === "POST") {
      const body = await readBody(request);
      const saved = await readJson(PLANNER_FILE, {});
      const builds = normalizePlannerBuilds(saved.builds);
      const build = builds.find(item => item.id === body.id);
      if (!build) return sendJson(response, 404, { error: "Build não encontrada. Salve antes de enviar." });
      const folder = path.join((await findGameFilterDirectory()).directory, "BuildPlanner");
      if (body.unlink) {
        if (build.gameFile) await fs.unlink(path.join(folder, build.gameFile)).catch(() => {});
        build.gameFile = "";
      } else {
        const result = await writeGameBuild(build);
        if (build.gameFile && build.gameFile !== result.fileName) await fs.unlink(path.join(folder, build.gameFile)).catch(() => {});
        build.gameFile = result.fileName;
      }
      await fs.writeFile(PLANNER_FILE, JSON.stringify({ builds, updatedAt: new Date().toISOString() }, null, 2), "utf8");
      return sendJson(response, 200, { build, folder });
    }
    if (url.pathname.startsWith("/api/")) return sendJson(response, 404, { error: "Rota não encontrada." });
    const decoded = decodeURIComponent(url.pathname);
    const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
    const target = path.resolve(PUBLIC_DIR, relative);
    if (target !== PUBLIC_DIR && !target.startsWith(PUBLIC_DIR + path.sep)) {
      response.writeHead(403); response.end("Forbidden"); return;
    }
    const extension = path.extname(target).toLowerCase();
    const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json; charset=utf-8" };
    const content = await fs.readFile(target);
    response.writeHead(200, { "Content-Type": types[extension] || "application/octet-stream", "Cache-Control": "no-cache" });
    response.end(content);
  } catch (error) {
    const status = error.code === "ENOENT" ? 404 : 500;
    if (!response.headersSent) sendJson(response, status, { error: error.message || "Erro inesperado." });
    else response.end();
  }
});

// Depois de uma atualização o servidor antigo ainda pode estar soltando a porta: tenta de novo por alguns segundos.
let listenAttempts = 0;
server.on("error", error => {
  if (error.code === "EADDRINUSE" && process.env.ATLAS_RESTARTED && ++listenAttempts < 30) return setTimeout(() => server.listen(PORT, "127.0.0.1"), 500);
  throw error;
});
server.listen(PORT, "127.0.0.1", () => {
  console.log("Atlas local de Path of Exile 2 em http://127.0.0.1:" + PORT);
  fs.access(META_FILE).catch(() => synchronize().then(() => console.log("Dados iniciais sincronizados.")).catch(error => console.error("Sincronização inicial falhou:", error.message)));
});
