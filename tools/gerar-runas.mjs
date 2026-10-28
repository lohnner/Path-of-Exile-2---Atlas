// Baixa do poe2db (em português) os efeitos das runas e dos presságios e salva em
// data/pt_runes.json e data/pt_omens.json, indexados pelo ID da base. Uso: node tools/gerar-runas.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "data");

function decodeHtml(value) {
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&([a-z]+);/gi, (match, name) => ({ oacute: "ó", aacute: "á", eacute: "é", iacute: "í", uacute: "ú", atilde: "ã", otilde: "õ", ccedil: "ç", ecirc: "ê", ocirc: "ô", acirc: "â", agrave: "à", Aacute: "Á", Eacute: "É", Oacute: "Ó" })[name] || match);
}
function htmlText(value) {
  return decodeHtml(String(value || "").replace(/<br\s*\/?\s*>/gi, "\n").replace(/<[^>]*>/g, "")).replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").trim();
}
function normalizeItemKey(value) {
  return String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("en-US").replace(/[^a-z0-9]/g, "");
}
// Mesma regra do app (public/app.js): runas e os encaixáveis extras listados lá.
const EXTRA_SOCKETABLES = new Set(["Cat Idol"]);
export function isRuneBase(base) {
  return base.item_class === "SoulCore" && (EXTRA_SOCKETABLES.has(base.name) || /\bRune\b/.test(base.name || "") && !/^\[DNT|^Legacy of /i.test(base.name || ""));
}
const GROUPS = [
  { label: "Runas", file: "pt_runes.json", match: isRuneBase },
  // A classe Omen também tem as Sagas da Expedição; só os presságios entram aqui.
  { label: "Presságios", file: "pt_omens.json", match: base => base.item_class === "Omen" && /^Omen of /.test(base.name || "") },
  { label: "Essências", file: "pt_essences.json", match: base => base.item_class === "StackableCurrency" && (base.tags || []).includes("essence") },
  // Ossos do Abismo (Clavícula, Costelas, Mandíbula...): o ID interno é AbyssalBenchTicket*.
  { label: "Ossos do Abismo", file: "pt_abyss.json", match: (base, id) => /\/AbyssalBenchTicket/.test(id) }
];

function parseItemPage(html) {
  const start = html.indexOf('class="newItemPopup');
  if (start < 0) return null;
  const end = html.indexOf('<div class="default fst-italic">', start);
  const popup = html.slice(start, end < 0 ? start + 20000 : end + 2000);
  // O poe2db quebra frases longas com <br>; aqui cada efeito vira uma linha só.
  const lines = cls => [...popup.matchAll(new RegExp('<div class="' + cls + '">([\\s\\S]*?)</div>', "g"))].map(m => htmlText(m[1]).replace(/\s+/g, " ")).filter(Boolean);
  const level = (popup.match(/Requer:[\s\S]*?N[ií]vel\s*(\d+)/i) || [])[1];
  const bonded = lines("bondedMod").filter(line => !/^Vinculado:?$/i.test(line));
  const description = end < 0 ? "" : htmlText((html.slice(end).match(/<div class="default fst-italic">([\s\S]*?)<\/div>/) || [])[1]);
  const implicit = lines("implicitMod");
  return { level: level ? Number(level) : null, effects: implicit.length ? implicit : lines("explicitMod"), bonded, description };
}

async function scrapeGroup(group, bases, ptItems) {
  const entries = Object.entries(bases).filter(([id, base]) => group.match(base, id));
  const result = {};
  const failed = [];
  const queue = [...entries];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const [id, base] = queue.shift();
      const translation = ptItems[normalizeItemKey(base.name)];
      const slug = translation && translation.slug || base.name.replace(/ /g, "_");
      try {
        const response = await fetch("https://poe2db.tw/pt/" + encodeURIComponent(slug), { headers: { "User-Agent": "PoE2-Local-Atlas/1.0 (local item reference)" }, signal: AbortSignal.timeout(45000) });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const parsed = parseItemPage(await response.text());
        if (!parsed) throw new Error("página sem ficha do item");
        if (!parsed.effects.length) failed.push(base.name + " (sem efeitos na ficha; salvo sem efeitos)");
        result[id] = { name: translation && translation.name || base.name, englishName: base.name, ...parsed };
      } catch (error) { failed.push(base.name + " (" + error.message + ")"); }
    }
  }));
  await fs.writeFile(path.join(DATA_DIR, group.file), JSON.stringify(result, null, 1));
  console.log(group.label + ": " + Object.keys(result).length + " de " + entries.length + " salvos");
  if (failed.length) console.log("Falharam:\n" + failed.join("\n"));
}

async function main() {
  const bases = JSON.parse(await fs.readFile(path.join(DATA_DIR, "base_items.json"), "utf8"));
  const ptItems = JSON.parse(await fs.readFile(path.join(DATA_DIR, "pt_items.json"), "utf8"));
  for (const group of GROUPS) await scrapeGroup(group, bases, ptItems);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
