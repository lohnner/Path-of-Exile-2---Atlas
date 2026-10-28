import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

// Rastreador de lucro por sessão. A sessão começa zerada: cada Ctrl+C numa pilha de moedas no jogo é lido da área
// de transferência e o aumento da pilha entra como ganho. Tempo, zonas e mortes vêm do Client.txt do jogo.
const NINJA_BASE = "https://poe.ninja/poe2/api/economy/";
const NINJA_ICON_BASE = "https://web.poecdn.com";
const USER_AGENT = "PoE2-Local-Atlas/1.0 (ferramenta local pessoal; cache de 1 hora)";
const WORLD_AREAS_URL = "https://repoe-fork.github.io/poe2/world_areas.min.json";
const PRICE_TYPES = ["Currency", "Fragments", "Runes", "Essences", "SoulCores", "Idols", "UncutGems", "LineageSupportGems", "Ritual", "Expedition", "Delirium", "Breach", "Abyss", "Verisium"];
const PRICE_MAX_AGE_MS = 60 * 60 * 1000;
const MAX_LOG_READ_BYTES = 30 * 1024 * 1024;
const MAX_HISTORY = 200;
const MAX_EVENTS = 2000;

const ZONE_LINE = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2}) .*?Generating level (\d+) area "([^"]+)" with seed (\d+)/;
const DEATH_LINE = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2}) .*?\] : (.+?) (?:morreu|has been slain)\.\s*$/;
const LEVEL_LINE = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2}) .*?\] : (.+?) \((.+?)\) (?:chegou ao nível|is now level) (\d+)/;

// Fica de olho na área de transferência e devolve (em base64) só textos que parecem itens do PoE.
// Encerra sozinho quando o processo do Atlas (__PARENT__) deixa de existir.
const CLIPBOARD_WATCHER = `
Add-Type -AssemblyName System.Windows.Forms
$last = $null
$tick = 0
try { $last = [System.Windows.Forms.Clipboard]::GetText() } catch {}
while ($true) {
  $tick++
  if ($tick % 15 -eq 0 -and -not (Get-Process -Id __PARENT__ -ErrorAction SilentlyContinue)) { exit }
  $text = $null
  try { $text = [System.Windows.Forms.Clipboard]::GetText() } catch {}
  if ($text -and $text -ne $last) {
    $last = $text
    if ($text -match '(Raridade|Rarity):') {
      try { [Console]::Out.WriteLine([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($text))); [Console]::Out.Flush() } catch { exit }
    }
  }
  Start-Sleep -Milliseconds 350
}`;

function parseStackCopy(text) {
  const lines = String(text || "").replace(/\r/g, "").split("\n").map(line => line.trim()).filter(Boolean);
  const rarityIndex = lines.findIndex(line => /^(?:Raridade|Rarity):/i.test(line));
  if (rarityIndex < 0) return null;
  const stackLine = lines.find(line => /^(?:Tamanho da Pilha|Stack Size):/i.test(line));
  if (!stackLine) return null;
  const match = stackLine.match(/:\s*([\d.,\s]+)\s*\/\s*([\d.,\s]+)/);
  if (!match) return null;
  const count = Number(match[1].replace(/[^\d]/g, ""));
  const max = Number(match[2].replace(/[^\d]/g, ""));
  const name = lines[rarityIndex + 1] || "";
  if (!name || !Number.isFinite(count)) return null;
  return { name, count, max };
}

export function createSessionTracker({ dataDir, findGamePath, readJson, normalizeItemKey }) {
  const sessionsFile = path.join(dataDir, "sessions.json");
  const pricesFile = path.join(dataDir, "currency_prices.json");
  const areasFile = path.join(dataDir, "world_areas.json");
  let pricePromise = null;
  let leaguesCache = null;
  let areas = null;
  let watcher = null;
  let watcherError = null;
  let writeQueue = Promise.resolve();

  async function fetchJson(url, label) {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, "Accept": "application/json" }, signal: AbortSignal.timeout(45000) });
    if (!response.ok) throw new Error(label + ": HTTP " + response.status);
    return await response.json();
  }

  async function writeJson(file, value) {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(file, JSON.stringify(value), "utf8");
  }

  async function readStore() {
    const store = await readJson(sessionsFile, null);
    return { active: null, history: [], league: "", ...(store || {}) };
  }

  // Serializa as alterações no arquivo para que um Ctrl+C e um clique na página não se sobrescrevam.
  function updateStore(change) {
    const run = writeQueue.then(async () => {
      const store = await readStore();
      const result = await change(store);
      await writeJson(sessionsFile, store);
      return result;
    });
    writeQueue = run.catch(() => {});
    return run;
  }

  async function leagues() {
    if (leaguesCache && Date.now() - leaguesCache.at < 6 * PRICE_MAX_AGE_MS) return leaguesCache.list;
    try {
      const list = (await fetchJson(NINJA_BASE + "leagues", "Ligas do poe.ninja")).filter(league => league && league.id);
      if (list.length) leaguesCache = { at: Date.now(), list };
    } catch {}
    return leaguesCache ? leaguesCache.list : [];
  }

  async function currencyPrices(league) {
    const cached = await readJson(pricesFile, null);
    if (cached && cached.league === league && cached.version === 2 && Date.now() - Date.parse(cached.updatedAt) < PRICE_MAX_AGE_MS) return cached;
    if (!pricePromise) {
      pricePromise = (async () => {
        const ptItems = await readJson(path.join(dataDir, "pt_items.json"), {}) || {};
        const items = new Map();
        let exaltedPerDivine = null;
        const queue = [...PRICE_TYPES];
        await Promise.all(Array.from({ length: 2 }, async () => {
          while (queue.length) {
            const type = queue.shift();
            try {
              const json = await fetchJson(NINJA_BASE + "exchange/current/overview?league=" + encodeURIComponent(league) + "&type=" + type, "Preços (" + type + ")");
              if (!exaltedPerDivine && json.core && json.core.rates && Number(json.core.rates.exalted)) exaltedPerDivine = Number(json.core.rates.exalted);
              const meta = new Map((json.items || []).map(item => [item.id, item]));
              for (const line of json.lines || []) {
                const item = meta.get(line.id);
                if (!item || items.has(line.id) || !Number.isFinite(Number(line.primaryValue))) continue;
                items.set(line.id, {
                  id: line.id, type, name: item.name, namePt: (ptItems[normalizeItemKey(item.name)] || {}).name || "",
                  divine: Number(line.primaryValue),
                  icon: item.image ? (/^https?:/i.test(item.image) ? item.image : NINJA_ICON_BASE + item.image) : ""
                });
              }
            } catch {}
          }
        }));
        if (!items.size) throw new Error("O poe.ninja não retornou preços.");
        if (!items.has("divine")) items.set("divine", { id: "divine", type: "Currency", name: "Divine Orb", namePt: "Orbe Divino", divine: 1, icon: "" });
        const data = { version: 2, league, updatedAt: new Date().toISOString(), exaltedPerDivine, items: [...items.values()] };
        await writeJson(pricesFile, data);
        return data;
      })().finally(() => { pricePromise = null; });
    }
    try { return await pricePromise; }
    catch (error) {
      if (cached && cached.league === league) return { ...cached, stale: true };
      throw error;
    }
  }

  function findCurrency(prices, name) {
    const key = normalizeItemKey(name);
    return prices.items.find(item => normalizeItemKey(item.namePt) === key || normalizeItemKey(item.name) === key) || null;
  }

  async function worldAreas() {
    if (areas) return areas;
    const cached = await readJson(areasFile, null);
    if (cached && Object.keys(cached).length) return (areas = cached);
    try {
      const json = await fetchJson(WORLD_AREAS_URL, "Áreas do jogo");
      const compact = {};
      for (const [id, area] of Object.entries(json)) {
        const tags = [].concat(area.tags || []);
        compact[id] = { name: area.name || id, act: area.act || null, town: !!area.is_town, map: tags.includes("map") || /^Map/.test(id), hideout: /Hideout/i.test(id) };
      }
      await writeJson(areasFile, compact);
      return (areas = compact);
    } catch {
      return {};
    }
  }

  async function clientLogPath() {
    const gamePath = await findGamePath();
    const candidates = [gamePath && path.join(gamePath, "logs", "Client.txt"), "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Path of Exile 2\\logs\\Client.txt", "C:\\Program Files (x86)\\Grinding Gear Games\\Path of Exile 2\\logs\\Client.txt"].filter(Boolean);
    for (const candidate of candidates) {
      try { if ((await fs.stat(candidate)).isFile()) return candidate; } catch {}
    }
    return null;
  }

  async function readLogFrom(file, offset) {
    const stat = await fs.stat(file);
    const start = offset != null && offset <= stat.size ? offset : 0;
    const from = Math.max(start, stat.size - MAX_LOG_READ_BYTES);
    const handle = await fs.open(file, "r");
    try {
      const buffer = Buffer.alloc(stat.size - from);
      await handle.read(buffer, 0, buffer.length, from);
      return buffer.toString("utf8");
    } finally { await handle.close(); }
  }

  function lineTime(match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]), Number(match[6])).getTime();
  }

  function summarizeLog(text, startMs, endMs, areaInfo) {
    const entries = [];
    const deaths = [];
    for (const line of text.split(/\r?\n/)) {
      let match = line.match(ZONE_LINE);
      if (match) {
        const time = lineTime(match);
        if (time < startMs || time > endMs) continue;
        const id = match[8];
        const info = areaInfo[id] || {};
        entries.push({ id, seed: match[9], level: Number(match[7]), at: time, name: info.name || id, map: !!info.map, town: !!info.town || !!info.hideout });
        continue;
      }
      match = line.match(DEATH_LINE);
      if (match) {
        const time = lineTime(match);
        if (time >= startMs && time <= endMs) deaths.push({ at: time, name: match[7], zone: entries.length ? entries[entries.length - 1].name : "" });
        continue;
      }
      if (LEVEL_LINE.test(line)) continue;
    }
    let mapMs = 0;
    let townMs = 0;
    entries.forEach((entry, index) => {
      const next = index + 1 < entries.length ? entries[index + 1].at : endMs;
      entry.durationMs = Math.max(0, next - entry.at);
      if (entry.map) mapMs += entry.durationMs;
      else if (entry.town) townMs += entry.durationMs;
    });
    // Mesma instância (mesma área + seed) conta uma vez só: voltar da cidade para o mapa não é um mapa novo.
    const instances = new Set(entries.filter(entry => !entry.town).map(entry => entry.id + ":" + entry.seed));
    const maps = new Set(entries.filter(entry => entry.map).map(entry => entry.id + ":" + entry.seed));
    const current = entries.length ? entries[entries.length - 1] : null;
    return {
      zones: instances.size, maps: maps.size, deaths: deaths.length, deathList: deaths.slice(-20), mapMs, townMs,
      current: current ? { name: current.name, level: current.level, since: current.at, map: current.map, town: current.town } : null,
      recent: entries.slice(-15).reverse().map(entry => ({ name: entry.name, level: entry.level, at: entry.at, durationMs: entry.durationMs, map: entry.map, town: entry.town }))
    };
  }

  async function logSummary(session, endMs) {
    const file = await clientLogPath();
    if (!file) return { found: false };
    try {
      const text = await readLogFrom(file, session.logOffset);
      return { found: true, ...summarizeLog(text, Date.parse(session.startedAt) - 1000, endMs, await worldAreas()) };
    } catch (error) {
      return { found: false, error: error.message };
    }
  }

  // Soma os ganhos de cada moeda a partir dos eventos (Ctrl+C e ajustes manuais).
  function gains(session, prices) {
    const byId = new Map(((prices && prices.items) || []).map(item => [item.id, item]));
    const totals = new Map();
    for (const event of session.events || []) {
      const row = totals.get(event.currency) || { id: event.currency, name: event.name, amount: 0 };
      row.amount += event.delta;
      totals.set(event.currency, row);
    }
    const rows = [...totals.values()].filter(row => row.amount !== 0).map(row => {
      const item = byId.get(row.id) || {};
      const each = Number.isFinite(item.divine) ? item.divine : 0;
      return { ...row, name: item.namePt || item.name || row.name, icon: item.icon || "", each, divine: row.amount * each, stack: (session.lastSeen || {})[row.id] ?? null };
    }).sort((a, b) => b.divine - a.divine);
    const otherDivine = prices && prices.exaltedPerDivine ? (Number(session.otherExalted) || 0) / prices.exaltedPerDivine : 0;
    return { rows, totalDivine: rows.reduce((sum, row) => sum + row.divine, 0) + otherDivine };
  }

  async function handleCopy(text) {
    const stack = parseStackCopy(text);
    if (!stack) return;
    const store = await readStore();
    if (!store.active) return;
    let prices = null;
    try { prices = await currencyPrices(store.active.league); } catch {}
    const currency = prices ? findCurrency(prices, stack.name) : null;
    const id = currency ? currency.id : "item:" + normalizeItemKey(stack.name);
    await updateStore(current => {
      const session = current.active;
      if (!session) return;
      session.lastSeen = session.lastSeen || {};
      session.events = session.events || [];
      const previous = session.lastSeen[id];
      // Primeira vez que essa moeda aparece na sessão: a pilha inteira conta como ganho (a sessão começa zerada).
      const delta = previous == null ? stack.count : stack.count - previous;
      session.lastSeen[id] = stack.count;
      const event = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: new Date().toISOString(), currency: id,
        name: currency ? currency.namePt || currency.name : stack.name, stack: stack.count, previous: previous ?? null,
        delta: delta > 0 ? delta : 0, kind: delta > 0 ? "gain" : delta < 0 ? "spent" : "same"
      };
      if (delta < 0) event.spent = -delta;
      session.events.push(event);
      if (session.events.length > MAX_EVENTS) session.events = session.events.slice(-MAX_EVENTS);
    });
  }

  function startWatcher() {
    if (watcher || process.platform !== "win32") return;
    watcherError = null;
    const child = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-STA", "-ExecutionPolicy", "Bypass", "-Command", CLIPBOARD_WATCHER.replace("__PARENT__", String(process.pid))], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    watcher = child;
    let buffer = "";
    child.stdout.on("data", chunk => {
      buffer += chunk.toString("utf8");
      let index;
      while ((index = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, index).trim();
        buffer = buffer.slice(index + 1);
        if (!line) continue;
        let text = "";
        try { text = Buffer.from(line, "base64").toString("utf8"); } catch { continue; }
        handleCopy(text).catch(() => {});
      }
    });
    child.stderr.on("data", chunk => { watcherError = chunk.toString("utf8").slice(0, 300); });
    child.on("exit", () => { if (watcher === child) watcher = null; });
    child.on("error", error => { watcherError = error.message; if (watcher === child) watcher = null; });
  }

  function stopWatcher() {
    if (!watcher) return;
    const child = watcher;
    watcher = null;
    child.kill();
  }

  async function state() {
    const store = await readStore();
    if (store.active) startWatcher(); else stopWatcher();
    const leagueList = await leagues();
    const league = (store.active && store.active.league) || store.league || (leagueList[0] && leagueList[0].id) || "Standard";
    let prices = null;
    let priceError = null;
    try { prices = await currencyPrices(league); } catch (error) { priceError = error.message; }
    let active = null;
    if (store.active) {
      const session = store.active;
      active = {
        id: session.id, startedAt: session.startedAt, league: session.league, otherExalted: session.otherExalted || 0,
        log: await logSummary(session, Date.now()), gains: gains(session, prices),
        events: (session.events || []).slice(-40).reverse(), eventCount: (session.events || []).length,
        watching: !!watcher, watcherError
      };
    }
    return { league, leagues: leagueList, exaltedPerDivine: prices ? prices.exaltedPerDivine : null, priceError, stale: !!(prices && prices.stale), currencies: prices ? prices.items.filter(item => item.type === "Currency").map(item => ({ id: item.id, name: item.namePt || item.name })) : [], active, history: store.history, logFound: !!(await clientLogPath()) };
  }

  // Versão leve para a página checar novos Ctrl+C a cada 2 segundos sem reler o log do jogo.
  async function events(after) {
    const store = await readStore();
    if (!store.active) return { active: false, events: [] };
    const list = store.active.events || [];
    const index = after ? list.findIndex(event => event.id === after) : -1;
    return { active: true, last: list.length ? list[list.length - 1].id : null, events: index >= 0 ? list.slice(index + 1) : after ? list.slice(-5) : [] };
  }

  async function start(body) {
    const file = await clientLogPath();
    let logOffset = null;
    if (file) { try { logOffset = (await fs.stat(file)).size; } catch {} }
    await updateStore(store => {
      if (store.active) throw Object.assign(new Error("Já existe uma sessão em andamento."), { status: 409 });
      const league = String(body.league || store.league || "").slice(0, 80);
      store.active = { id: Date.now().toString(36), startedAt: new Date().toISOString(), league, logOffset, events: [], lastSeen: {}, otherExalted: 0 };
      store.league = league;
    });
    return await state();
  }

  async function end(body) {
    const store = await readStore();
    if (!store.active) throw Object.assign(new Error("Nenhuma sessão em andamento."), { status: 409 });
    const prices = await currencyPrices(store.active.league);
    const endMs = Date.now();
    const log = await logSummary(store.active, endMs);
    const record = await updateStore(current => {
      const session = current.active;
      if (!session) throw Object.assign(new Error("Nenhuma sessão em andamento."), { status: 409 });
      session.otherExalted = Math.max(-1e7, Math.min(1e7, Number(body.otherExalted) || 0));
      const summary = gains(session, prices);
      const record = {
        id: session.id, startedAt: session.startedAt, endedAt: new Date(endMs).toISOString(), league: session.league,
        durationMs: endMs - Date.parse(session.startedAt), otherExalted: session.otherExalted,
        profitDivine: summary.totalDivine, exaltedPerDivine: prices.exaltedPerDivine,
        changes: summary.rows.map(row => ({ id: row.id, name: row.name, delta: row.amount, divine: row.divine })),
        log: log.found ? { zones: log.zones, maps: log.maps, deaths: log.deaths, mapMs: log.mapMs, townMs: log.townMs } : null,
        note: String(body.note || "").slice(0, 200)
      };
      current.history = [record, ...current.history].slice(0, MAX_HISTORY);
      current.active = null;
      return record;
    });
    return { ...(await state()), finished: record };
  }

  async function cancel() {
    await updateStore(store => { store.active = null; });
    return await state();
  }

  async function undo(body) {
    await updateStore(store => {
      const session = store.active;
      if (!session) return;
      const events = session.events || [];
      const index = events.findIndex(event => event.id === String(body.id || ""));
      if (index < 0) return;
      const [event] = events.splice(index, 1);
      // Desfazer o último Ctrl+C daquela moeda volta a pilha de referência para o valor anterior.
      if (event.kind !== "manual" && !events.slice(index).some(later => later.currency === event.currency && later.kind !== "manual")) {
        if (event.previous == null) delete session.lastSeen[event.currency];
        else session.lastSeen[event.currency] = event.previous;
      }
    });
    return await state();
  }

  async function adjust(body) {
    const delta = Math.round(Number(body.delta) || 0);
    if (!delta || Math.abs(delta) > 100000) throw Object.assign(new Error("Quantidade inválida."), { status: 400 });
    const store = await readStore();
    if (!store.active) throw Object.assign(new Error("Nenhuma sessão em andamento."), { status: 409 });
    let prices = null;
    try { prices = await currencyPrices(store.active.league); } catch {}
    const id = String(body.currency || "").slice(0, 80);
    const currency = prices && prices.items.find(item => item.id === id);
    await updateStore(current => {
      if (!current.active) return;
      current.active.events = current.active.events || [];
      current.active.events.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: new Date().toISOString(), currency: id, name: currency ? currency.namePt || currency.name : id, delta, kind: "manual" });
    });
    return await state();
  }

  async function setOther(body) {
    await updateStore(store => { if (store.active) store.active.otherExalted = Math.max(-1e7, Math.min(1e7, Number(body.otherExalted) || 0)); });
    return await state();
  }

  async function remove(body) {
    await updateStore(store => { store.history = store.history.filter(record => record.id !== String(body.id || "")); });
    return await state();
  }

  async function setLeague(body) {
    await updateStore(store => {
      if (store.active) throw Object.assign(new Error("Encerre a sessão antes de trocar de liga."), { status: 409 });
      store.league = String(body.league || "").slice(0, 80);
    });
    return await state();
  }

  // Se o Atlas reiniciar no meio de uma sessão, volta a observar a área de transferência.
  readStore().then(store => { if (store.active) startWatcher(); }).catch(() => {});
  process.on("exit", stopWatcher);

  return { state, events, start, end, cancel, undo, adjust, setOther, remove, setLeague };
}
