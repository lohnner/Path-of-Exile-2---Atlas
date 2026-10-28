(() => {
  // Aba "Market": cotações entre itens anotadas à mão, salvas em data/market.json.
  // Caos e Divino sempre aparecem na busca, mesmo antes de o catálogo da Wiki carregar.
  const ORBS = [
    { id: "chaos", name: "Orbe do Caos", english: "Chaos Orb", icon: "/assets/poe2db/Art/2DItems/Currency/CurrencyRerollRare.webp" },
    { id: "divine", name: "Orbe Divino", english: "Divine Orb", icon: "/assets/poe2db/Art/2DItems/Currency/CurrencyModValues.webp" }
  ];
  const view = { trades: null, search: "", form: null, formError: "" };
  const byId = id => document.getElementById(id);
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const normalize = value => String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const formatDate = value => value ? new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
  const formatValue = value => Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 4 });
  const parseQty = text => { const value = Number(String(text || "").trim().replace(",", ".")); return Number.isFinite(value) && value > 0 ? value : null; };

  async function request(url, options) {
    const response = await fetch(url, { cache: "no-store", ...(options || {}) });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Falha na requisição.");
    return json;
  }

  // ---------- Cotações entre itens ----------
  // Itens que dá para escolher: tudo da aba Itens da Wiki (moedas, essências, runas...) e os únicos.
  let candidates = null;
  function itemCandidates() {
    if (candidates) return candidates;
    const catalog = typeof state !== "undefined" && state.catalog ? state.catalog : [];
    if (!catalog.length) return [];
    const seen = new Set();
    candidates = catalog.filter(item => item.catalogGroup === "items" || item.kind === "unique").filter(item => {
      const key = item.kind + "|" + item.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(item => ({ id: String(item.id), name: item.name, english: item.englishName || "", icon: item.image || "", key: normalize(item.name + " " + (item.englishName || "")) }));
    for (const orb of ORBS) if (!candidates.some(item => item.english === orb.english)) candidates.push({ id: orb.id, name: orb.name, english: orb.english, icon: orb.icon, key: normalize(orb.name + " " + orb.english) });
    return candidates;
  }

  function itemBadge(item, qty) {
    return '<span class="market-trade-item">' + (item.icon ? '<img src="' + escape(item.icon) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '<i class="market-trade-noimg">◆</i>') +
      '<span><b>' + formatValue(qty) + "×</b> " + escape(item.name) + (item.english && item.english !== item.name ? "<small>" + escape(item.english) + "</small>" : "") + "</span></span>";
  }

  function tradeRowHtml(trade) {
    const rate = trade.rightQty / trade.leftQty;
    return '<article class="market-trade" data-trade="' + escape(trade.id) + '">' +
      itemBadge(trade.left, trade.leftQty) + '<span class="market-trade-eq">=</span>' + itemBadge(trade.right, trade.rightQty) +
      '<div class="market-trade-meta"><small>1 ' + escape(trade.left.name) + " ≈ " + formatValue(rate) + " " + escape(trade.right.name) + "</small><small>" + escape(formatDate(trade.updatedAt)) + "</small></div>" +
      '<div class="market-trade-actions"><button type="button" data-trade-edit="' + escape(trade.id) + '">Editar</button><button type="button" data-trade-remove="' + escape(trade.id) + '">Remover</button></div>' +
      "</article>";
  }

  function pickerHtml(side) {
    const slot = view.form[side];
    return '<div class="market-picker" data-picker="' + side + '">' +
      '<span class="market-picker-label">' + (side === "a" ? "PRIMEIRO ITEM" : "SEGUNDO ITEM") + "</span>" +
      (slot.item
        ? '<div class="market-picker-selected">' + (slot.item.icon ? '<img src="' + escape(slot.item.icon) + '" alt="" referrerpolicy="no-referrer">' : "") + "<b>" + escape(slot.item.name) + '</b><button type="button" data-picker-clear="' + side + '" aria-label="Trocar item">Trocar</button></div>'
        : '<label class="filter-affix-search market-picker-search"><span>⌕</span><input type="search" data-picker-search="' + side + '" placeholder="Buscar item…" value="' + escape(slot.query) + '" autocomplete="off"></label><div class="market-picker-results" data-picker-results="' + side + '"></div>') +
      '<label class="market-picker-qty"><span>Quantidade</span><input type="number" min="0" step="any" inputmode="decimal" data-picker-qty="' + side + '" value="' + escape(slot.qty) + '"></label>' +
      "</div>";
  }

  function pickerResultsHtml(side) {
    const query = normalize(view.form[side].query);
    if (!query) return '<small class="market-picker-hint">Digite o nome em português ou em inglês.</small>';
    const words = query.split(/\s+/);
    const found = itemCandidates().filter(item => words.every(word => item.key.includes(word))).slice(0, 8);
    if (!found.length) return '<small class="market-picker-hint">Nenhum item encontrado.</small>';
    return found.map(item => '<button type="button" data-picker-choose="' + side + '" data-item-id="' + escape(item.id) + '">' + (item.icon ? '<img src="' + escape(item.icon) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : "") + "<span>" + escape(item.name) + (item.english && item.english !== item.name ? "<small>" + escape(item.english) + "</small>" : "") + "</span></button>").join("");
  }

  function formHtml() {
    if (!view.form) return "";
    return '<div class="market-form">' + pickerHtml("a") + '<span class="market-form-eq">=</span>' + pickerHtml("b") +
      '<div class="market-form-footer"><small>Ex.: 1 Orbe Divino = 150 Orbes Exaltados. Ao salvar, o item de maior valor vai para a esquerda.</small>' +
      (view.formError ? '<p class="build-character-error">' + escape(view.formError) + "</p>" : "") +
      '<div class="market-form-actions"><button type="button" class="primary-button" data-form-save>Salvar valor</button><button type="button" data-form-cancel>Cancelar</button></div></div></div>';
  }

  function renderTrades() {
    const holder = byId("market-trade-list");
    if (!holder) return;
    const query = normalize(view.search);
    const words = query ? query.split(/\s+/) : [];
    const list = view.trades.filter(trade => !words.length || words.every(word => normalize([trade.left.name, trade.left.english, trade.right.name, trade.right.english].join(" ")).includes(word)));
    byId("market-trade-count").textContent = view.trades.length === 1 ? "1 item" : view.trades.length + " itens";
    holder.innerHTML = list.length ? list.map(tradeRowHtml).join("") : '<div class="filter-empty">' + (view.trades.length ? "Nada encontrado para essa busca." : "Nenhum valor anotado ainda. Clique em “Adicionar item”.") + "</div>";
    holder.querySelectorAll("[data-trade-edit]").forEach(button => button.addEventListener("click", () => {
      const trade = view.trades.find(entry => entry.id === button.dataset.tradeEdit);
      view.form = { id: trade.id, a: { item: trade.left, query: "", qty: String(trade.leftQty) }, b: { item: trade.right, query: "", qty: String(trade.rightQty) } };
      view.formError = "";
      renderForm();
      byId("market-form").scrollIntoView({ behavior: "smooth", block: "center" });
    }));
    holder.querySelectorAll("[data-trade-remove]").forEach(button => button.addEventListener("click", () => {
      const trade = view.trades.find(entry => entry.id === button.dataset.tradeRemove);
      if (!trade || !confirm("Remover " + trade.left.name + " = " + trade.right.name + "?")) return;
      saveTrades(view.trades.filter(entry => entry !== trade));
    }));
  }

  function renderForm() {
    const holder = byId("market-form");
    if (!holder) return;
    holder.innerHTML = formHtml();
    byId("market-add").hidden = !!view.form;
    if (!view.form) return;
    for (const side of ["a", "b"]) {
      const search = holder.querySelector('[data-picker-search="' + side + '"]');
      if (!search) continue;
      const results = holder.querySelector('[data-picker-results="' + side + '"]');
      const paint = () => {
        results.innerHTML = pickerResultsHtml(side);
        results.querySelectorAll("[data-picker-choose]").forEach(button => button.addEventListener("click", () => {
          view.form[side].item = itemCandidates().find(item => item.id === button.dataset.itemId);
          view.form[side].query = "";
          renderForm();
        }));
      };
      search.addEventListener("input", () => { view.form[side].query = search.value; paint(); });
      paint();
    }
    holder.querySelectorAll("[data-picker-clear]").forEach(button => button.addEventListener("click", () => {
      view.form[button.dataset.pickerClear].item = null;
      renderForm();
      holder.querySelector('[data-picker-search="' + button.dataset.pickerClear + '"]').focus();
    }));
    holder.querySelectorAll("[data-picker-qty]").forEach(input => input.addEventListener("input", () => { view.form[input.dataset.pickerQty].qty = input.value; }));
    holder.querySelector("[data-form-cancel]").addEventListener("click", () => { view.form = null; view.formError = ""; renderForm(); });
    holder.querySelector("[data-form-save]").addEventListener("click", submitForm);
  }

  function submitForm() {
    const { a, b, id } = view.form;
    const qtyA = parseQty(a.qty);
    const qtyB = parseQty(b.qty);
    const error = !a.item || !b.item ? "Escolha os dois itens." : a.item.id === b.item.id ? "Escolha dois itens diferentes." : !qtyA || !qtyB ? "Coloque uma quantidade maior que zero nos dois lados." : "";
    if (error) { view.formError = error; renderForm(); return; }
    const strip = item => ({ id: item.id, name: item.name, english: item.english, icon: item.icon });
    // O servidor também ordena; aqui é só para a lista já aparecer certa.
    const [left, leftQty, right, rightQty] = qtyB / qtyA >= 1 ? [a.item, qtyA, b.item, qtyB] : [b.item, qtyB, a.item, qtyA];
    const entry = { id: id || Math.random().toString(36).slice(2, 12), left: strip(left), leftQty, right: strip(right), rightQty, updatedAt: new Date().toISOString() };
    const trades = id ? view.trades.map(trade => trade.id === id ? entry : trade) : [entry, ...view.trades];
    view.form = null;
    view.formError = "";
    saveTrades(trades);
  }

  async function saveTrades(trades) {
    try {
      const saved = await request("/api/market", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trades }) });
      view.trades = saved.trades || [];
      if (window.showToast) window.showToast("Valores salvos.");
    } catch (failure) {
      if (window.showToast) window.showToast("Não foi possível salvar: " + failure.message);
    }
    renderForm();
    renderTrades();
  }

  // ---------- Página ----------
  function render() {
    const root = byId("market");
    if (!root) return;
    if (!view.trades) { root.innerHTML = '<div class="filter-empty">Carregando valores…</div>'; return; }
    root.innerHTML =
      '<div class="wiki-heading market-heading"><div><div class="eyebrow"><span class="eyebrow-line"></span> MERCADO</div><h1>Valor das <em>moedas</em></h1><p>Anote quanto vale cada item no comércio. Os valores ficam salvos aqui no Atlas.</p></div></div>' +
      '<section class="market-trades"><div class="market-trades-head"><div><h2>Valores entre itens</h2><small id="market-trade-count"></small></div>' +
      '<label class="filter-affix-search market-trade-search"><span>⌕</span><input type="search" id="market-search" placeholder="Pesquisar pelo nome…" value="' + escape(view.search) + '" autocomplete="off"></label>' +
      '<button type="button" class="primary-button" id="market-add">+ Adicionar item</button></div>' +
      '<div id="market-form"></div><div class="market-trade-list" id="market-trade-list"></div></section>';
    byId("market-search").addEventListener("input", event => { view.search = event.target.value; renderTrades(); });
    byId("market-add").addEventListener("click", () => {
      view.form = { id: null, a: { item: null, query: "", qty: "1" }, b: { item: null, query: "", qty: "" } };
      view.formError = "";
      renderForm();
      const first = document.querySelector('[data-picker-search="a"]');
      if (first) first.focus();
    });
    renderForm();
    renderTrades();
  }

  window.onMarketPage = async () => {
    if (!view.trades) {
      render();
      try { view.trades = (await request("/api/market")).trades || []; } catch { view.trades = []; }
    }
    render();
  };
})();
