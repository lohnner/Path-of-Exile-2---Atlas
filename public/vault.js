// Aba Cofre: o estoque do jogador. Ao informar o total atual de um item, a diferença vira um registro do dia.
(() => {
  // Caos, Exaltado e Divino sempre aparecem na busca, mesmo antes de o catálogo da Wiki carregar.
  const ORBS = [
    { id: "chaos", name: "Orbe do Caos", english: "Chaos Orb", icon: "/assets/poe2db/Art/2DItems/Currency/CurrencyRerollRare.webp" },
    { id: "exalted", name: "Orbe Exaltado", english: "Exalted Orb", icon: "/assets/poe2db/Art/2DItems/Currency/CurrencyAddModToRare.webp" },
    { id: "divine", name: "Orbe Divino", english: "Divine Orb", icon: "/assets/poe2db/Art/2DItems/Currency/CurrencyModValues.webp" }
  ];
  const view = { data: null, tab: "stock", search: "", adding: null, flash: null, openDays: new Set() };
  const byId = id => document.getElementById(id);
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const normalize = value => String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const toast = message => { if (window.showToast) window.showToast(message); };
  const qtyText = value => Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  const signed = value => (value > 0 ? "+" : value < 0 ? "−" : "") + qtyText(Math.abs(value));
  const parseQty = text => { const value = Number(String(text ?? "").trim().replace(/\./g, "").replace(",", ".")); return String(text ?? "").trim() !== "" && Number.isFinite(value) && value >= 0 ? value : null; };
  const dayKey = value => { const date = new Date(value); return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0"); };
  const timeLabel = value => new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  function dayLabel(key) {
    const [year, month, day] = key.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const today = dayKey(new Date()), yesterday = dayKey(Date.now() - 86400000);
    const full = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
    return { title: key === today ? "Hoje" : key === yesterday ? "Ontem" : weekday.charAt(0).toUpperCase() + weekday.slice(1), date: full };
  }

  async function request(url, options) {
    const response = await fetch(url, { cache: "no-store", ...(options || {}) });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Falha na requisição.");
    return json;
  }
  async function save() {
    try {
      const saved = await request("/api/economy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: view.data.items, history: view.data.history }) });
      view.data.items = saved.items; view.data.history = saved.history;
    } catch (failure) { toast("Não consegui salvar o cofre: " + failure.message); }
  }

  // ---------- Valor estimado (preços do poe.ninja guardados no Atlas) ----------
  const priceOf = item => (view.data.prices || {})[String(item.english || "").toLowerCase()] || 0;
  function valueLabel(divines) {
    if (!divines) return "";
    const perDivine = view.data.exaltedPerDivine;
    if (divines >= 1 || !perDivine) return "≈ " + divines.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " div";
    return "≈ " + Math.round(divines * perDivine).toLocaleString("pt-BR") + " ex";
  }

  // ---------- Itens que dá para escolher ----------
  let candidates = null;
  function itemCandidates() {
    if (candidates) return candidates;
    const catalog = typeof state !== "undefined" && state.catalog ? state.catalog : [];
    const seen = new Set();
    const list = catalog.filter(item => item.catalogGroup === "items" || item.kind === "unique").filter(item => {
      const key = item.kind + "|" + item.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(item => ({ id: String(item.id), name: item.name, english: item.englishName || "", icon: item.image || "" }));
    for (const orb of ORBS) if (!list.some(item => item.english === orb.english)) list.push({ ...orb });
    list.forEach(item => { item.key = normalize(item.name + " " + item.english); });
    if (catalog.length) candidates = list;
    return list;
  }
  const icon = item => item.icon ? '<img src="' + escape(item.icon) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '<i class="vault-noimg">◆</i>';

  // ---------- Página ----------
  function render() {
    const root = byId("vault");
    if (!root) return;
    if (!view.data) { root.innerHTML = '<div class="filter-empty">Abrindo o cofre…</div>'; return; }
    const today = dayKey(new Date());
    const todayIn = view.data.history.filter(entry => dayKey(entry.at) === today && entry.delta > 0);
    const todayValue = todayIn.reduce((sum, entry) => sum + entry.delta * priceOf(entry), 0);
    const stockValue = view.data.items.reduce((sum, item) => sum + item.qty * priceOf(item), 0);
    const days = new Set(view.data.history.filter(entry => entry.delta > 0).map(entry => dayKey(entry.at))).size;
    root.innerHTML =
      '<header class="vault-hero"><div><div class="eyebrow"><span class="eyebrow-line"></span> MINHA ECONOMIA</div><h1>Cofre do <em>Exílio</em></h1>' +
      "<p>Anote quanto você tem de cada item. Quando voltar do farm, digite o total novo: a diferença entra no histórico do dia.</p></div>" +
      '<div class="vault-stats">' +
      '<div class="vault-stat gain"><small>ENTROU HOJE</small><b>' + (todayIn.length ? (valueLabel(todayValue) || todayIn.length + (todayIn.length === 1 ? " registro" : " registros")) : "—") + "</b><span>" + todayIn.length + (todayIn.length === 1 ? " item farmado" : " itens farmados") + "</span></div>" +
      '<div class="vault-stat"><small>NO COFRE</small><b>' + (valueLabel(stockValue) || view.data.items.length + " itens") + "</b><span>" + view.data.items.length + (view.data.items.length === 1 ? " tipo de item" : " tipos de item") + "</span></div>" +
      '<div class="vault-stat"><small>DIAS DE FARM</small><b>' + days + "</b><span>com entrada registrada</span></div></div></header>" +
      '<nav class="vault-tabs"><button type="button" data-vault-tab="stock" class="' + (view.tab === "stock" ? "active" : "") + '">◈ Meu estoque</button><button type="button" data-vault-tab="history" class="' + (view.tab === "history" ? "active" : "") + '">☰ Histórico do farm</button></nav>' +
      '<div id="vault-body"></div>' +
      (view.data.pricesUpdatedAt ? '<p class="vault-note">Valores estimados com os preços do poe.ninja de ' + escape(new Date(view.data.pricesUpdatedAt).toLocaleDateString("pt-BR")) + ". Itens sem preço não entram na soma.</p>" : "");
    root.querySelectorAll("[data-vault-tab]").forEach(button => button.addEventListener("click", () => { view.tab = button.dataset.vaultTab; render(); }));
    if (view.tab === "stock") renderStock(); else renderHistory();
  }

  // ---------- Estoque ----------
  function renderStock() {
    const body = byId("vault-body");
    const words = normalize(view.search).split(/\s+/).filter(Boolean);
    const items = [...view.data.items].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).filter(item => words.every(word => normalize(item.name + " " + item.english).includes(word)));
    body.innerHTML =
      '<div class="vault-toolbar"><label class="filter-affix-search"><span>⌕</span><input type="search" id="vault-search" placeholder="Procurar no cofre…" value="' + escape(view.search) + '" autocomplete="off"></label>' +
      '<button type="button" class="primary-button" id="vault-add"' + (view.adding ? " hidden" : "") + ">+ Adicionar item</button></div>" +
      '<div id="vault-add-form"></div>' +
      '<div class="vault-grid">' + (items.length ? items.map(itemCard).join("") : '<div class="vault-empty"><span>◈</span><b>' + (view.data.items.length ? "Nada encontrado." : "Seu cofre está vazio") + "</b><p>" + (view.data.items.length ? "Tente outro nome." : "Clique em “Adicionar item” e diga quanto você tem de cada moeda.") + "</p></div>") + "</div>";
    body.querySelector("#vault-search").addEventListener("input", event => { view.search = event.target.value; renderStockList(); });
    body.querySelector("#vault-add").addEventListener("click", () => { view.adding = { item: null, query: "", qty: "" }; renderStock(); body.querySelector("[data-add-search]").focus(); });
    renderAddForm();
    bindCards();
  }
  function renderStockList() {
    const search = byId("vault-search");
    const cursor = search.selectionStart;
    renderStock();
    const again = byId("vault-search"); again.focus(); again.setSelectionRange(cursor, cursor);
  }

  function itemCard(item) {
    const value = valueLabel(item.qty * priceOf(item));
    const flash = view.flash && view.flash.id === item.id ? view.flash : null;
    const last = [...view.data.history].reverse().find(entry => entry.id === item.id && entry.delta !== 0);
    return '<article class="vault-item' + (flash ? (flash.delta > 0 ? " flash-up" : " flash-down") : "") + '" data-item="' + escape(item.id) + '">' +
      '<div class="vault-item-icon">' + icon(item) + "</div>" +
      '<div class="vault-item-info"><b>' + escape(item.name) + "</b>" + (item.english && item.english !== item.name ? "<small>" + escape(item.english) + "</small>" : "") +
      '<span class="vault-item-last">' + (last ? "Última mudança: <i class=\"" + (last.delta > 0 ? "up" : "down") + "\">" + signed(last.delta) + "</i> · " + escape(dayLabel(dayKey(last.at)).date) : "Ainda sem mudanças") + "</span></div>" +
      '<div class="vault-item-qty"><b>' + qtyText(item.qty) + "</b><small>" + (value || "no cofre") + "</small>" + (flash ? '<em class="' + (flash.delta > 0 ? "up" : "down") + '">' + signed(flash.delta) + "</em>" : "") + "</div>" +
      '<form class="vault-update" data-update="' + escape(item.id) + '"><label><span>TOTAL AGORA</span><input type="text" inputmode="decimal" placeholder="' + qtyText(item.qty) + '" autocomplete="off"></label><button type="submit">Atualizar</button></form>' +
      '<button type="button" class="vault-remove" data-remove="' + escape(item.id) + '" title="Tirar do cofre" aria-label="Tirar ' + escape(item.name) + ' do cofre">×</button></article>';
  }

  function bindCards() {
    const body = byId("vault-body");
    body.querySelectorAll("[data-update]").forEach(form => form.addEventListener("submit", event => {
      event.preventDefault();
      const item = view.data.items.find(entry => entry.id === form.dataset.update);
      const input = form.querySelector("input");
      const total = parseQty(input.value);
      if (!item) return;
      if (total === null) { toast("Digite o total que você tem agora (0 ou mais)."); input.focus(); return; }
      const delta = Math.round((total - item.qty) * 100) / 100;
      if (!delta) { toast("Continua " + qtyText(total) + " — nada mudou."); input.value = ""; return; }
      const now = new Date().toISOString();
      view.data.history.push({ id: item.id, name: item.name, english: item.english, icon: item.icon, entryId: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: now, before: item.qty, after: total, delta });
      item.qty = total; item.updatedAt = now;
      view.flash = { id: item.id, delta };
      save();
      render();
      toast((delta > 0 ? "Entrou " : "Saiu ") + qtyText(Math.abs(delta)) + " " + item.name + (delta > 0 ? " hoje." : "."));
      setTimeout(() => { if (view.flash && view.flash.id === item.id) view.flash = null; }, 2500);
    }));
    body.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
      const item = view.data.items.find(entry => entry.id === button.dataset.remove);
      if (!item || !confirm("Tirar " + item.name + " do cofre? O histórico desse item continua guardado.")) return;
      view.data.items = view.data.items.filter(entry => entry !== item);
      save(); render();
    }));
  }

  function renderAddForm() {
    const holder = byId("vault-add-form");
    if (!holder || !view.adding) { if (holder) holder.innerHTML = ""; return; }
    const adding = view.adding;
    holder.innerHTML = '<div class="vault-add">' +
      (adding.item
        ? '<div class="vault-add-chosen">' + icon(adding.item) + "<b>" + escape(adding.item.name) + '</b><button type="button" data-add-change>Trocar</button></div>' +
          '<label class="vault-add-qty"><span>QUANTO VOCÊ TEM AGORA</span><input type="text" inputmode="decimal" data-add-qty placeholder="Ex.: 12" value="' + escape(adding.qty) + '" autocomplete="off"></label>'
        : '<label class="filter-affix-search vault-add-search"><span>⌕</span><input type="search" data-add-search placeholder="Buscar item em português ou inglês…" value="' + escape(adding.query) + '" autocomplete="off"></label><div class="vault-add-results" data-add-results></div>') +
      '<div class="vault-add-actions">' + (adding.item ? '<button type="button" class="primary-button" data-add-save>Guardar no cofre</button>' : "") + '<button type="button" data-add-cancel>Cancelar</button></div></div>';
    const search = holder.querySelector("[data-add-search]");
    if (search) {
      const results = holder.querySelector("[data-add-results]");
      const paint = () => {
        const words = normalize(adding.query).split(/\s+/).filter(Boolean);
        if (!words.length) { results.innerHTML = '<small class="vault-hint">Ex.: caos, exaltado, divino, essência…</small>'; return; }
        const found = itemCandidates().filter(item => words.every(word => item.key.includes(word))).slice(0, 10);
        results.innerHTML = found.length ? found.map(item => '<button type="button" data-add-choose="' + escape(item.id) + '"' + (view.data.items.some(entry => entry.id === item.id) ? ' class="owned" title="Já está no cofre"' : "") + ">" + icon(item) + "<span>" + escape(item.name) + (item.english && item.english !== item.name ? "<small>" + escape(item.english) + "</small>" : "") + "</span></button>").join("") : '<small class="vault-hint">Nenhum item encontrado.</small>';
        results.querySelectorAll("[data-add-choose]").forEach(button => button.addEventListener("click", () => {
          const item = itemCandidates().find(entry => entry.id === button.dataset.addChoose);
          if (view.data.items.some(entry => entry.id === item.id)) { toast(item.name + " já está no cofre: atualize o total no card dele."); return; }
          adding.item = item; adding.query = "";
          renderAddForm();
          holder.querySelector("[data-add-qty]").focus();
        }));
      };
      search.addEventListener("input", () => { adding.query = search.value; paint(); });
      paint();
    }
    const qty = holder.querySelector("[data-add-qty]");
    if (qty) {
      qty.addEventListener("input", () => { adding.qty = qty.value; });
      qty.addEventListener("keydown", event => { if (event.key === "Enter") holder.querySelector("[data-add-save]").click(); });
    }
    holder.querySelector("[data-add-change]")?.addEventListener("click", () => { adding.item = null; renderAddForm(); holder.querySelector("[data-add-search]").focus(); });
    holder.querySelector("[data-add-cancel]").addEventListener("click", () => { view.adding = null; renderStock(); });
    holder.querySelector("[data-add-save]")?.addEventListener("click", () => {
      const total = parseQty(adding.qty);
      if (total === null) { toast("Diga quanto você tem agora (pode ser 0)."); return; }
      const { id, name, english, icon: image } = adding.item;
      // A quantidade inicial é o ponto de partida: não conta como farm do dia.
      view.data.items.push({ id, name, english, icon: image, qty: total, updatedAt: new Date().toISOString() });
      view.adding = null;
      save(); render();
      toast(name + " guardado no cofre com " + qtyText(total) + ".");
    });
  }

  // ---------- Histórico ----------
  function renderHistory() {
    const body = byId("vault-body");
    const byDay = new Map();
    for (const entry of view.data.history) {
      const key = dayKey(entry.at);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(entry);
    }
    const keys = [...byDay.keys()].sort().reverse();
    if (!keys.length) { body.innerHTML = '<div class="vault-empty"><span>☰</span><b>Nenhum farm registrado ainda</b><p>Atualize o total de um item no estoque e o que entrou aparece aqui, separado por dia.</p></div>'; return; }
    if (!view.openDays.size) view.openDays.add(keys[0]);
    body.innerHTML = '<div class="vault-days">' + keys.map(key => dayCard(key, byDay.get(key))).join("") + "</div>";
    body.querySelectorAll("[data-day-toggle]").forEach(button => button.addEventListener("click", () => {
      const key = button.dataset.dayToggle;
      if (view.openDays.has(key)) view.openDays.delete(key); else view.openDays.add(key);
      renderHistory();
    }));
    body.querySelectorAll("[data-entry-remove]").forEach(button => button.addEventListener("click", () => {
      const entry = view.data.history.find(item => item.entryId === button.dataset.entryRemove);
      if (!entry || !confirm("Apagar este registro do histórico? O total no estoque não muda.")) return;
      view.data.history = view.data.history.filter(item => item !== entry);
      save(); render();
    }));
  }

  function dayCard(key, entries) {
    const label = dayLabel(key);
    const totals = new Map();
    for (const entry of entries) {
      const total = totals.get(entry.id) || { ...entry, gained: 0, spent: 0 };
      if (entry.delta > 0) total.gained += entry.delta; else total.spent += -entry.delta;
      totals.set(entry.id, total);
    }
    const gained = [...totals.values()].filter(item => item.gained).sort((a, b) => b.gained * (priceOf(b) || 0) - a.gained * (priceOf(a) || 0) || b.gained - a.gained);
    const spent = [...totals.values()].filter(item => item.spent);
    const value = gained.reduce((sum, item) => sum + item.gained * priceOf(item), 0);
    const open = view.openDays.has(key);
    const chip = (item, amount, kind) => '<span class="vault-chip ' + kind + '">' + icon(item) + "<b>" + (kind === "up" ? "+" : "−") + qtyText(amount) + "</b><span>" + escape(item.name) + "</span>" + (priceOf(item) && kind === "up" ? "<small>" + valueLabel(amount * priceOf(item)) + "</small>" : "") + "</span>";
    return '<article class="vault-day' + (open ? " open" : "") + '">' +
      '<button type="button" class="vault-day-head" data-day-toggle="' + key + '"><span class="vault-day-date"><b>' + escape(label.title) + "</b><small>" + escape(label.date) + "</small></span>" +
      '<span class="vault-day-sum">' + (gained.length ? "<b>" + (valueLabel(value) || gained.length + " itens") + "</b><small>" + gained.length + (gained.length === 1 ? " item entrou" : " itens entraram") + "</small>" : "<small>Só saídas neste dia</small>") + '</span><i class="vault-day-arrow">⌄</i></button>' +
      '<div class="vault-day-chips">' + gained.map(item => chip(item, item.gained, "up")).join("") + spent.map(item => chip(item, item.spent, "down")).join("") + "</div>" +
      (open ? '<ol class="vault-entries">' + [...entries].reverse().map(entry => '<li><time>' + timeLabel(entry.at) + "</time>" + icon(entry) + "<span>" + escape(entry.name) + '</span><em class="' + (entry.delta > 0 ? "up" : "down") + '">' + signed(entry.delta) + "</em><small>" + qtyText(entry.before) + " → " + qtyText(entry.after) + '</small><button type="button" data-entry-remove="' + escape(entry.entryId) + '" title="Apagar registro" aria-label="Apagar registro">×</button></li>').join("") + "</ol>" : "") +
      "</article>";
  }

  window.onVaultPage = async () => {
    if (!view.data) {
      render();
      try { view.data = await request("/api/economy"); } catch { view.data = { items: [], history: [], prices: {} }; }
    }
    render();
  };
})();
