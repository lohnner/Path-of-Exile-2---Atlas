// Aba Build: o jogador monta a própria árvore de passivas (dados oficiais em português) e salva no Atlas.
(() => {
  const TREE_URL = "/data/passive-tree-pt.json";
  const RADIUS = { normal: 22, notable: 34, keystone: 52, jewel: 30, start: 70 };
  const KIND_LABEL = { normal: "Passiva", notable: "Notável", keystone: "Passiva-chave", jewel: "Encaixe de joia", start: "Início da classe" };
  const ATTR = {
    str: { label: "Força", color: "#d0644e" },
    dex: { label: "Destreza", color: "#6fb466" },
    int: { label: "Inteligência", color: "#5d8fe0" }
  };
  // Cada par de classes divide o mesmo ponto de partida na árvore (pelo atributo).
  const START = { str: 47175, dex: 50459, int: 54447, "str-dex": 50986, "dex-int": 44683, "str-int": 61525 };
  const CLASSES = [
    { name: "Guerreiro", attrs: ["str"], glyph: "hammer", blurb: "Força bruta e golpes que fazem a terra tremer." },
    { name: "Espoliador", attrs: ["str"], glyph: "axe", blurb: "Fúria sem freio, machados e sangue." },
    { name: "Mercenário", attrs: ["str", "dex"], glyph: "crossbow", blurb: "Bestas, munições e táticas de campo." },
    { name: "Duelista", attrs: ["str", "dex"], glyph: "swords", blurb: "Lâmina contra lâmina, sempre no ataque." },
    { name: "Patrulheira", attrs: ["dex"], glyph: "bow", blurb: "Arco certeiro e pés velozes." },
    { name: "Caçadora", attrs: ["dex"], glyph: "spear", blurb: "Lança, escudo e o instinto da caçada." },
    { name: "Monge", attrs: ["dex", "int"], glyph: "monk", blurb: "Bastão, punhos e poder interior." },
    { name: "Sombra", attrs: ["dex", "int"], glyph: "dagger", blurb: "Adagas, armadilhas e golpes pelas costas." },
    { name: "Feiticeira", attrs: ["int"], glyph: "bolt", blurb: "Raios, gelo e fogo nas pontas dos dedos." },
    { name: "Bruxa", attrs: ["int"], glyph: "moon", blurb: "Lacaios, maldições e magia proibida." },
    { name: "Templário", attrs: ["str", "int"], glyph: "sceptre", blurb: "Fé, cetro e fogo sagrado." },
    { name: "Druida", attrs: ["str", "int"], glyph: "leaf", blurb: "Formas selvagens e a fúria da natureza." }
  ];
  const GLYPHS = {
    hammer: '<path d="M50 38 V80"/><path d="M33 24 H67 V40 H33 Z"/>',
    axe: '<path d="M42 26 L60 82"/><path d="M45 32 Q72 24 70 54 Q58 46 50 47"/>',
    crossbow: '<path d="M28 42 Q50 22 72 42"/><path d="M50 30 V80"/><path d="M28 42 L50 52 L72 42"/>',
    swords: '<path d="M30 26 L70 76"/><path d="M70 26 L30 76"/><path d="M27 64 L39 76"/><path d="M73 64 L61 76"/>',
    bow: '<path d="M40 22 Q74 51 40 80"/><path d="M40 22 V80"/><path d="M30 51 H70"/><path d="M63 44 L70 51 L63 58"/>',
    spear: '<path d="M30 80 L62 34"/><path d="M58 24 L72 20 L68 36 Z"/><path d="M36 64 L46 70"/>',
    monk: '<circle cx="50" cy="51" r="25"/><path d="M50 26 C36 38 64 52 50 76"/><circle cx="50" cy="40" r="2.5"/><circle cx="50" cy="63" r="2.5"/>',
    dagger: '<path d="M50 20 L57 56 H43 Z"/><path d="M36 58 H64"/><path d="M50 58 V76"/><circle cx="50" cy="80" r="3"/>',
    bolt: '<path d="M57 20 L37 54 H52 L44 84 L67 46 H52 Z"/>',
    moon: '<path d="M60 24 A28 28 0 1 0 64 78 A22 22 0 1 1 60 24 Z"/><path d="M70 36 L72 41 L77 42 L72 44 L70 49 L68 44 L63 42 L68 41 Z"/>',
    sceptre: '<path d="M50 34 V82"/><path d="M38 46 H62"/><circle cx="50" cy="26" r="8"/>',
    leaf: '<path d="M50 82 C24 62 28 34 50 20 C72 34 76 62 50 82 Z"/><path d="M50 82 V34"/><path d="M50 58 L40 48"/><path d="M50 48 L60 40"/>'
  };

  const view = { builds: null, tree: null, prepared: null, editor: null, saveTimer: null, modal: null };
  const byId = id => document.getElementById(id);
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const normalize = value => String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const toast = message => { if (window.showToast) window.showToast(message); };
  const classInfo = name => CLASSES.find(item => item.name === name) || CLASSES[0];
  const startOf = name => START[classInfo(name).attrs.join("-")];
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const dateLabel = value => { const date = new Date(value); return isNaN(date) ? "" : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }); };

  let crestCount = 0;
  function crest(name, className = "") {
    const info = classInfo(name);
    const colors = info.attrs.map(attr => ATTR[attr].color);
    const id = "pl-crest-" + (++crestCount);
    return '<svg class="pl-crest ' + className + '" viewBox="0 0 100 100" aria-hidden="true"><defs>' +
      '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + colors[0] + '"/><stop offset="1" stop-color="' + (colors[1] || colors[0]) + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'g" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="' + colors[0] + '" stop-opacity=".32"/><stop offset="1" stop-color="#0f100e" stop-opacity="0"/></radialGradient></defs>' +
      '<path d="M50 3 L91 17 V49 C91 74 73 90 50 98 C27 90 9 74 9 49 V17 Z" fill="#131411"/>' +
      '<path d="M50 3 L91 17 V49 C91 74 73 90 50 98 C27 90 9 74 9 49 V17 Z" fill="url(#' + id + 'g)" stroke="url(#' + id + ')" stroke-width="2.5"/>' +
      '<path d="M50 11 L84 22 V49 C84 69 69 83 50 90 C31 83 16 69 16 49 V22 Z" fill="none" stroke="url(#' + id + ')" stroke-opacity=".35" stroke-width="1"/>' +
      '<g fill="none" stroke="url(#' + id + ')" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' + GLYPHS[info.glyph] + "</g></svg>";
  }
  const attrChips = name => classInfo(name).attrs.map(attr => '<i class="pl-attr" style="--attr:' + ATTR[attr].color + '">' + ATTR[attr].label + "</i>").join("");

  // ---------- Dados ----------
  async function request(url, options) {
    const response = await fetch(url, { cache: "no-store", ...(options || {}) });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Falha na requisição.");
    return json;
  }
  async function loadBuilds() {
    if (!view.builds) view.builds = (await request("/api/planner-builds")).builds || [];
    return view.builds;
  }
  async function loadTree() {
    if (!view.prepared) {
      const response = await fetch(TREE_URL, { cache: "force-cache" });
      if (!response.ok) throw new Error("Não consegui carregar a árvore de passivas.");
      view.tree = await response.json();
      view.prepared = prepareTree(view.tree);
    }
    return view.prepared;
  }
  function saveBuilds(immediate) {
    clearTimeout(view.saveTimer);
    setSaveState("saving");
    const run = async () => {
      try {
        const saved = await request("/api/planner-builds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ builds: view.builds }) });
        // O servidor renomeia o arquivo do jogo quando o nome da build muda.
        for (const item of saved.builds || []) { const local = view.builds.find(build => build.id === item.id); if (local) local.gameFile = item.gameFile; }
        setSaveState("saved");
      }
      catch (failure) { setSaveState("error"); toast("Não consegui salvar: " + failure.message); }
    };
    if (immediate) return run();
    view.saveTimer = setTimeout(run, 600);
  }
  function setSaveState(stateName) {
    const element = byId("pl-save-state");
    if (!element) return;
    element.dataset.state = stateName;
    element.textContent = { saving: "Salvando…", saved: "✓ Salvo", error: "Erro ao salvar" }[stateName] || "";
  }

  // Só a árvore principal: nós de ascendência ficam de fora.
  function prepareTree(tree) {
    const nodes = new Map();
    for (const [id, node] of Object.entries(tree.nodes)) {
      if (node.a || !RADIUS[node.k]) continue;
      nodes.set(Number(id), { id: Number(id), ...node, r: RADIUS[node.k], search: normalize((node.n || "") + " " + (node.s || []).join(" ")) });
    }
    const adj = new Map([...nodes.keys()].map(id => [id, []]));
    const edges = [];
    for (const [a, b, radius, sweep] of tree.edges) {
      const from = nodes.get(a), to = nodes.get(b);
      if (!from || !to) continue;
      adj.get(a).push(b); adj.get(b).push(a);
      edges.push({ a, b, d: radius ? "M " + from.x + " " + from.y + " A " + radius + " " + radius + " 0 0 " + sweep + " " + to.x + " " + to.y : "M " + from.x + " " + from.y + " L " + to.x + " " + to.y });
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const node of nodes.values()) { minX = Math.min(minX, node.x); minY = Math.min(minY, node.y); maxX = Math.max(maxX, node.x); maxY = Math.max(maxY, node.y); }
    const cell = 400, grid = new Map();
    for (const node of nodes.values()) {
      const key = Math.floor(node.x / cell) + ":" + Math.floor(node.y / cell);
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(node);
    }
    return { nodes, adj, edges, basePath: new Path2D(edges.map(edge => edge.d).join(" ")), bounds: { minX, minY, maxX, maxY }, grid, cell, iconBase: tree.iconBase, totalPoints: (tree.points && tree.points.totalPoints) || 123 };
  }
  function edgesPath(prepared, test) {
    const parts = prepared.edges.filter(edge => test(edge.a, edge.b)).map(edge => edge.d);
    return parts.length ? new Path2D(parts.join(" ")) : null;
  }

  // Resumo: soma as linhas iguais trocando os números por # (ex.: "+5 à força" ×3 vira "+15 à força").
  // Algumas passivas têm bônus só para uma classe ("Bruxa: ..."); o de outra classe não vale para a build.
  const lineClass = line => { const match = String(line).match(/^([^:]{3,20}):\s/); return match && CLASSES.some(info => info.name === match[1]) ? match[1] : null; };
  function summarize(prepared, ids, className) {
    const groups = new Map();
    for (const id of ids) {
      const node = prepared.nodes.get(id);
      if (!node || node.k === "start") continue;
      for (const line of node.s || []) {
        const owner = lineClass(line);
        if (owner && owner !== className) continue;
        const numbers = (line.match(/\d+(?:[.,]\d+)?/g) || []).map(value => Number(value.replace(",", ".")));
        const key = line.replace(/\d+(?:[.,]\d+)?/g, "#");
        const entry = groups.get(key) || { key, sums: numbers.map(() => 0), count: 0, mixed: false };
        if (entry.sums.length !== numbers.length) entry.mixed = true;
        else numbers.forEach((value, index) => { entry.sums[index] += value; });
        entry.count++;
        groups.set(key, entry);
      }
    }
    const format = value => Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
    return [...groups.values()].map(entry => {
      let index = 0;
      return { text: entry.mixed ? entry.key : entry.key.replace(/#/g, () => format(entry.sums[index++])), count: entry.count };
    }).sort((a, b) => b.count - a.count || a.text.localeCompare(b.text, "pt-BR"));
  }

  // ---------- Lista ----------
  function root() { return byId("planner"); }

  async function renderList() {
    view.editor && view.editor.destroy();
    view.editor = null;
    root().innerHTML = '<div class="filter-empty">Carregando builds…</div>';
    let builds;
    try { builds = await loadBuilds(); } catch (failure) { root().innerHTML = '<div class="filter-empty">' + escape(failure.message) + "</div>"; return; }
    root().innerHTML =
      '<header class="pl-hero"><div class="pl-hero-copy"><div class="eyebrow"><span class="eyebrow-line"></span> FORJA DE BUILDS</div><h1>Suas <em>builds</em></h1>' +
      "<p>Escolha uma classe, trace o caminho na árvore de passivas completa em português e guarde cada ideia com nome e brasão.</p>" +
      '<div class="pl-hero-actions"><button type="button" class="primary-button" data-pl="create">✦ Criar nova build</button><button type="button" class="pl-ghost" data-pl="load">⇪ Carregar build</button></div></div>' +
      '<div class="pl-hero-crests" aria-hidden="true">' + ["Feiticeira", "Guerreiro", "Patrulheira"].map((name, index) => crest(name, "pl-float pl-float-" + index)).join("") + "</div></header>" +
      (builds.length
        ? '<div class="pl-section-title"><span>BUILDS SALVAS</span><i></i><b>' + builds.length + "</b></div>" +
          '<div class="pl-grid">' + [...builds].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).map(cardHtml).join("") + "</div>"
        : '<div class="pl-empty">' + crest("Templário", "pl-empty-crest") + "<h3>Nenhuma build ainda</h3><p>Crie a primeira: escolha a classe e comece a traçar a árvore.</p><button type=\"button\" class=\"primary-button\" data-pl=\"create\">✦ Criar nova build</button></div>");
    bindList();
    if (builds.length) loadTree().then(prepared => drawThumbnails(prepared)).catch(() => {});
  }

  function cardHtml(build) {
    const info = classInfo(build.className);
    const points = Math.max(0, build.nodes.filter(id => id !== startOf(build.className)).length);
    return '<article class="pl-card" data-open="' + escape(build.id) + '" style="--accent:' + ATTR[info.attrs[0]].color + '">' +
      '<div class="pl-card-art"><canvas data-thumb="' + escape(build.id) + '" width="560" height="300"></canvas>' + crest(build.className, "pl-card-crest") + "</div>" +
      '<div class="pl-card-body"><small>' + escape(build.className) + "</small><h3>" + escape(build.name) + "</h3>" +
      '<div class="pl-card-meta">' + attrChips(build.className) + (build.gameFile ? '<i class="pl-game-badge" title="Aparece no planejador de builds do jogo">✓ No jogo</i>' : "") + "<span>" + points + " pontos</span><span>" + escape(dateLabel(build.updatedAt)) + "</span></div></div>" +
      '<div class="pl-card-actions"><button type="button" data-open="' + escape(build.id) + '">Abrir</button><button type="button" data-duplicate="' + escape(build.id) + '">Duplicar</button><button type="button" class="danger" data-delete="' + escape(build.id) + '">Excluir</button></div></article>';
  }

  // Miniatura: a árvore inteira apagada com o caminho da build aceso.
  function drawThumbnails(prepared) {
    document.querySelectorAll("[data-thumb]").forEach(canvas => {
      const build = view.builds.find(item => item.id === canvas.dataset.thumb);
      if (!build) return;
      const ctx = canvas.getContext("2d");
      const allocated = new Set(build.nodes);
      const { minX, minY, maxX, maxY } = prepared.bounds;
      const focus = build.nodes.length > 1 ? build.nodes.map(id => prepared.nodes.get(id)).filter(Boolean) : [prepared.nodes.get(startOf(build.className))].filter(Boolean);
      const xs = focus.map(node => node.x), ys = focus.map(node => node.y);
      const pad = 2600;
      // Enquadra o caminho da build, sem passar da árvore inteira nem aproximar demais.
      const fullScale = Math.min(canvas.width / (maxX - minX), canvas.height / (maxY - minY)) * 1.3;
      const scale = Math.max(fullScale, Math.min(0.045, canvas.width / (Math.max(...xs) - Math.min(...xs) + pad * 2), canvas.height / (Math.max(...ys) - Math.min(...ys) + pad * 2)));
      const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
      const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
      const color = ATTR[classInfo(build.className).attrs[0]].color;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.7);
      gradient.addColorStop(0, "#1a1c17"); gradient.addColorStop(1, "#0b0c0a");
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, canvas.width / 2 - cx * scale, canvas.height / 2 - cy * scale);
      ctx.lineCap = "round";
      ctx.strokeStyle = "#2c2e28"; ctx.lineWidth = 1.4 / scale; ctx.stroke(prepared.basePath);
      const path = edgesPath(prepared, (a, b) => allocated.has(a) && allocated.has(b));
      if (path) {
        ctx.strokeStyle = color; ctx.globalAlpha = 0.35; ctx.lineWidth = 9 / scale; ctx.stroke(path);
        ctx.globalAlpha = 1; ctx.strokeStyle = "#e8c77e"; ctx.lineWidth = 3 / scale; ctx.stroke(path);
      }
      for (const id of allocated) {
        const node = prepared.nodes.get(id);
        if (!node || node.k === "normal") continue;
        ctx.beginPath(); ctx.arc(node.x, node.y, (node.k === "keystone" || node.k === "start" ? 6 : 4) / scale, 0, Math.PI * 2);
        ctx.fillStyle = "#f3dca2"; ctx.fill();
      }
    });
  }

  function bindList() {
    root().querySelectorAll('[data-pl="create"]').forEach(button => button.addEventListener("click", openCreate));
    root().querySelectorAll('[data-pl="load"]').forEach(button => button.addEventListener("click", openLoad));
    root().querySelectorAll(".pl-card").forEach(card => card.addEventListener("click", event => {
      const target = event.target.closest("button");
      if (target && target.dataset.duplicate) { duplicateBuild(target.dataset.duplicate); return; }
      if (target && target.dataset.delete) { deleteBuild(target.dataset.delete); return; }
      openEditor(card.dataset.open);
    }));
  }

  function duplicateBuild(id) {
    const source = view.builds.find(item => item.id === id);
    if (!source) return;
    const now = new Date().toISOString();
    view.builds.push({ ...source, id: newId(), name: source.name + " (cópia)", nodes: [...source.nodes], createdAt: now, updatedAt: now });
    saveBuilds(true).then(renderList);
  }
  function deleteBuild(id) {
    const build = view.builds.find(item => item.id === id);
    if (!build || !confirm('Excluir a build "' + build.name + '"? Isso não pode ser desfeito.')) return;
    view.builds = view.builds.filter(item => item.id !== id);
    saveBuilds(true).then(renderList);
    toast("Build excluída.");
  }

  // ---------- Janelas ----------
  function openModal(html, className) {
    closeModal();
    const backdrop = document.createElement("div");
    backdrop.className = "pl-modal-backdrop";
    backdrop.innerHTML = '<div class="pl-modal ' + (className || "") + '" role="dialog" aria-modal="true"><button type="button" class="pl-modal-close" aria-label="Fechar">×</button>' + html + "</div>";
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", event => { if (event.target === backdrop || event.target.closest(".pl-modal-close")) closeModal(); });
    view.modal = backdrop;
    requestAnimationFrame(() => backdrop.classList.add("open"));
    return backdrop.querySelector(".pl-modal");
  }
  function closeModal() { if (view.modal) { view.modal.remove(); view.modal = null; } }
  document.addEventListener("keydown", event => { if (event.key === "Escape" && view.modal) closeModal(); });

  function openCreate() {
    let chosen = null;
    const modal = openModal(
      '<div class="pl-modal-head"><div class="eyebrow"><span class="eyebrow-line"></span> NOVA BUILD</div><h2>Escolha sua <em>classe</em></h2><p>A árvore começa no ponto de partida da classe. Classes com o mesmo atributo dividem o mesmo início.</p></div>' +
      '<div class="pl-class-grid">' + CLASSES.map(info => '<button type="button" class="pl-class" data-class="' + escape(info.name) + '" style="--accent:' + ATTR[info.attrs[0]].color + ';--accent2:' + ATTR[info.attrs[1] || info.attrs[0]].color + '">' + crest(info.name) +
        "<b>" + escape(info.name) + '</b><span class="pl-class-attrs">' + attrChips(info.name) + "</span><small>" + escape(info.blurb) + "</small></button>").join("") + "</div>" +
      '<div class="pl-create-foot"><label><span>NOME DA BUILD</span><input type="text" data-build-name maxlength="80" placeholder="Escolha uma classe primeiro" autocomplete="off"></label><button type="button" class="primary-button" data-create disabled>Forjar build ✦</button></div>',
      "pl-modal-wide");
    const input = modal.querySelector("[data-build-name]");
    const button = modal.querySelector("[data-create]");
    modal.querySelectorAll("[data-class]").forEach(card => card.addEventListener("click", () => {
      modal.querySelectorAll("[data-class]").forEach(other => other.classList.toggle("selected", other === card));
      const previousDefault = chosen ? chosen + " de " + new Date().toLocaleDateString("pt-BR") : "";
      chosen = card.dataset.class;
      if (!input.value.trim() || input.value === previousDefault) input.value = chosen + " de " + new Date().toLocaleDateString("pt-BR");
      input.placeholder = "Nome da build";
      button.disabled = false;
    }));
    modal.querySelectorAll("[data-class]").forEach(card => card.addEventListener("dblclick", () => button.click()));
    input.addEventListener("keydown", event => { if (event.key === "Enter" && !button.disabled) button.click(); });
    button.addEventListener("click", async () => {
      if (!chosen) return;
      await loadBuilds();
      const now = new Date().toISOString();
      const build = { id: newId(), name: input.value.trim() || chosen, className: chosen, nodes: [startOf(chosen)], notes: "", createdAt: now, updatedAt: now };
      view.builds.push(build);
      closeModal();
      saveBuilds(true);
      openEditor(build.id);
    });
  }

  async function openLoad() {
    const builds = await loadBuilds();
    const modal = openModal(
      '<div class="pl-modal-head"><div class="eyebrow"><span class="eyebrow-line"></span> CARREGAR</div><h2>Carregar <em>build</em></h2><p>Abra uma build salva no Atlas ou importe um arquivo exportado (.json).</p></div>' +
      '<div class="pl-load-list">' + (builds.length ? [...builds].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).map(build => '<button type="button" class="pl-load-item" data-load="' + escape(build.id) + '">' + crest(build.className) + '<span><b>' + escape(build.name) + "</b><small>" + escape(build.className) + " · " + Math.max(0, build.nodes.length - 1) + " pontos · " + escape(dateLabel(build.updatedAt)) + "</small></span><i>→</i></button>").join("") : '<div class="filter-empty">Nenhuma build salva ainda.</div>') + "</div>" +
      '<label class="pl-import"><input type="file" accept=".json,application/json" data-import><span>⇪ Importar arquivo de build</span></label>');
    modal.querySelectorAll("[data-load]").forEach(button => button.addEventListener("click", () => { closeModal(); openEditor(button.dataset.load); }));
    modal.querySelector("[data-import]").addEventListener("change", async event => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        const list = (Array.isArray(data) ? data : [data]).filter(item => item && CLASSES.some(info => info.name === item.className) && Array.isArray(item.nodes));
        if (!list.length) throw new Error("O arquivo não tem uma build válida.");
        const now = new Date().toISOString();
        const imported = list.map(item => ({ id: newId(), name: String(item.name || item.className).slice(0, 80), className: item.className, nodes: item.nodes.map(Number).filter(Number.isInteger), notes: String(item.notes || "").slice(0, 2000), createdAt: now, updatedAt: now }));
        view.builds.push(...imported);
        await saveBuilds(true);
        closeModal();
        toast(imported.length === 1 ? "Build importada." : imported.length + " builds importadas.");
        if (imported.length === 1) openEditor(imported[0].id); else renderList();
      } catch (failure) { toast(failure.message.includes("JSON") ? "Arquivo inválido." : failure.message); }
    });
  }

  // ---------- Editor ----------
  async function openEditor(id) {
    const build = view.builds && view.builds.find(item => item.id === id);
    if (!build) { renderList(); return; }
    view.editor && view.editor.destroy();
    const info = classInfo(build.className);
    root().innerHTML =
      '<div class="pl-editor" style="--accent:' + ATTR[info.attrs[0]].color + ';--accent2:' + ATTR[info.attrs[1] || info.attrs[0]].color + '">' +
      '<header class="pl-editor-head"><button type="button" class="pl-back" data-back>← Builds</button>' + crest(build.className, "pl-head-crest") +
      '<div class="pl-title"><input type="text" data-name maxlength="80" value="' + escape(build.name) + '" aria-label="Nome da build"><small>' + escape(build.className) + " " + attrChips(build.className) + "</small></div>" +
      '<div class="pl-points"><div><b data-points>0</b><span>/ <em data-total>123</em> pontos</span></div><i><em data-points-bar></em></i></div>' +
      '<div class="pl-head-actions"><span class="pl-save-state" id="pl-save-state"></span><button type="button" class="pl-game" data-game></button><button type="button" data-undo title="Desfazer (Ctrl+Z)">↶ Desfazer</button><button type="button" data-export>Exportar</button><button type="button" class="danger" data-reset>Limpar árvore</button></div></header>' +
      '<div class="pl-editor-body"><aside class="pl-side"><nav class="pl-tabs"><button type="button" class="active" data-tab="summary">Resumo</button><button type="button" data-tab="search">Buscar</button><button type="button" data-tab="notes">Anotações</button></nav>' +
      '<div class="pl-tab" data-panel="summary"></div>' +
      '<div class="pl-tab" data-panel="search" hidden><label class="pl-search"><span>⌕</span><input type="search" data-search placeholder="Ex.: crítico, gelo, lacaio…" autocomplete="off"></label><div class="pl-search-results" data-results><p class="pl-hint">Digite para acender as passivas na árvore. Clique num resultado para ir até ela.</p></div></div>' +
      '<div class="pl-tab" data-panel="notes" hidden><textarea data-notes maxlength="2000" placeholder="Ideias, ordem dos pontos, gemas que combinam…">' + escape(build.notes || "") + "</textarea></div></aside>" +
      '<div class="pl-canvas-wrap" data-canvas><div class="pl-loading">Carregando árvore…</div></div></div></div>';
    const editorRoot = root().querySelector(".pl-editor");
    editorRoot.querySelector("[data-back]").addEventListener("click", () => { saveBuilds(true); renderList(); });
    let prepared;
    try { prepared = await loadTree(); } catch (failure) { editorRoot.querySelector(".pl-loading").textContent = failure.message; return; }
    view.editor = new TreeEditor(editorRoot, prepared, build);
  }

  class TreeEditor {
    constructor(element, prepared, build) {
      this.element = element;
      this.prepared = prepared;
      this.build = build;
      this.startId = startOf(build.className);
      const valid = build.nodes.filter(id => prepared.nodes.has(id));
      this.allocated = new Set([this.startId, ...valid]);
      this.history = [];
      this.preview = { add: new Set(), remove: new Set() };
      this.matches = new Set();
      this.iconCache = new Map();
      this.pointers = new Map();
      this.wrap = element.querySelector("[data-canvas]");
      this.wrap.innerHTML = '<canvas class="pl-canvas"></canvas><div class="pl-tooltip" hidden></div>' +
        '<div class="pl-controls"><button type="button" data-zoom="in" aria-label="Aproximar">+</button><button type="button" data-zoom="out" aria-label="Afastar">−</button><button type="button" data-zoom="build">Minha build</button><button type="button" data-zoom="all">Árvore inteira</button></div>' +
        '<div class="pl-legend"><span><i class="on"></i>Alocada</span><span><i class="add"></i>Vai alocar</span><span><i class="remove"></i>Vai remover</span><span><i class="match"></i>Busca</span><span class="pl-legend-tip">Clique para alocar · clique de novo para remover · arraste para mover · roda para zoom</span></div>';
      this.canvas = this.wrap.querySelector("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.tooltip = this.wrap.querySelector(".pl-tooltip");
      this.scale = 0.1; this.tx = 0; this.ty = 0;
      this.bind();
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.wrap);
      this.rebuildPaths();
      this.updateSide();
    }

    get points() { return this.allocated.size - 1; }

    // ---- Regras de alocação ----
    pathTo(target) {
      if (this.allocated.has(target)) return [];
      const node = this.prepared.nodes.get(target);
      if (!node || node.k === "start") return null;
      const previous = new Map();
      const queue = [...this.allocated];
      for (const id of queue) previous.set(id, null);
      for (let head = 0; head < queue.length; head++) {
        const id = queue[head];
        if (id === target) break;
        for (const next of this.prepared.adj.get(id) || []) {
          if (previous.has(next)) continue;
          if (this.prepared.nodes.get(next).k === "start") continue;
          previous.set(next, id);
          queue.push(next);
        }
      }
      if (!previous.has(target)) return null;
      const path = [];
      for (let current = target; current != null && !this.allocated.has(current); current = previous.get(current)) path.push(current);
      return path;
    }
    removalOf(id) {
      if (id === this.startId || !this.allocated.has(id)) return [];
      const keep = new Set([this.startId]);
      const stack = [this.startId];
      while (stack.length) {
        const current = stack.pop();
        for (const next of this.prepared.adj.get(current) || []) if (this.allocated.has(next) && next !== id && !keep.has(next)) { keep.add(next); stack.push(next); }
      }
      return [...this.allocated].filter(other => !keep.has(other));
    }
    commit(nextSet, message) {
      this.history.push([...this.allocated]);
      if (this.history.length > 100) this.history.shift();
      this.allocated = nextSet;
      this.persist();
      this.rebuildPaths();
      this.updateSide();
      if (message) toast(message);
    }
    toggle(node) {
      if (!node || node.k === "start") return;
      if (this.allocated.has(node.id)) {
        const removed = new Set(this.removalOf(node.id));
        this.commit(new Set([...this.allocated].filter(id => !removed.has(id))));
        return;
      }
      const path = this.pathTo(node.id);
      if (!path) { toast("Essa passiva não se liga ao seu caminho."); return; }
      if (this.points + path.length > this.prepared.totalPoints) { toast("Faltam pontos: precisa de " + path.length + ", restam " + (this.prepared.totalPoints - this.points) + "."); return; }
      this.commit(new Set([...this.allocated, ...path]));
    }
    undo() {
      const previous = this.history.pop();
      if (!previous) { toast("Nada para desfazer."); return; }
      this.allocated = new Set(previous);
      this.persist(); this.rebuildPaths(); this.updateSide();
    }
    persist() {
      this.build.nodes = [...this.allocated];
      this.build.updatedAt = new Date().toISOString();
      saveBuilds();
    }

    // ---- Painel lateral ----
    updateSide() {
      const total = this.prepared.totalPoints;
      this.element.querySelector("[data-points]").textContent = this.points;
      this.element.querySelector("[data-total]").textContent = total;
      this.element.querySelector("[data-points-bar]").style.width = Math.min(100, 100 * this.points / total) + "%";
      const panel = this.element.querySelector('[data-panel="summary"]');
      const picked = [...this.allocated].map(id => this.prepared.nodes.get(id)).filter(Boolean);
      const keystones = picked.filter(node => node.k === "keystone");
      const notables = picked.filter(node => node.k === "notable");
      const counts = { normal: picked.filter(node => node.k === "normal").length, notable: notables.length, keystone: keystones.length, jewel: picked.filter(node => node.k === "jewel").length };
      const stats = summarize(this.prepared, this.allocated, this.build.className);
      const chip = node => '<button type="button" class="pl-chip ' + node.k + '" data-focus="' + node.id + '">' + escape(node.n) + "</button>";
      panel.innerHTML = this.points === 0
        ? '<div class="pl-start-hint">' + crest(this.build.className) + "<b>Comece a traçar</b><p>Clique em qualquer passiva perto do início da sua classe. O caminho mais curto é alocado sozinho.</p></div>"
        : '<div class="pl-counts"><span><b>' + counts.normal + "</b>passivas</span><span><b>" + counts.notable + "</b>notáveis</span><span><b>" + counts.keystone + "</b>chaves</span><span><b>" + counts.jewel + "</b>joias</span></div>" +
          (keystones.length ? '<h4>Passivas-chave</h4><div class="pl-chips">' + keystones.map(chip).join("") + "</div>" : "") +
          (notables.length ? '<h4>Notáveis</h4><div class="pl-chips">' + notables.map(chip).join("") + "</div>" : "") +
          '<h4>Atributos somados</h4><ul class="pl-stats">' + stats.map(stat => "<li><span>" + escape(stat.text) + "</span>" + (stat.count > 1 ? "<i>×" + stat.count + "</i>" : "") + "</li>").join("") + "</ul>";
      panel.querySelectorAll("[data-focus]").forEach(button => button.addEventListener("click", () => this.focus(Number(button.dataset.focus))));
    }
    runSearch(text) {
      const query = normalize(text);
      const results = this.element.querySelector("[data-results]");
      this.matches = new Set();
      if (query.length < 2) {
        results.innerHTML = '<p class="pl-hint">Digite para acender as passivas na árvore. Clique num resultado para ir até ela.</p>';
        this.dirty(); return;
      }
      const found = [...this.prepared.nodes.values()].filter(node => node.k !== "start" && node.search.includes(query));
      found.forEach(node => this.matches.add(node.id));
      const order = { keystone: 0, notable: 1, jewel: 2, normal: 3 };
      const shown = found.sort((a, b) => order[a.k] - order[b.k] || a.n.localeCompare(b.n, "pt-BR")).slice(0, 60);
      results.innerHTML = '<p class="pl-hint">' + found.length + (found.length === 1 ? " passiva encontrada" : " passivas encontradas") + (found.length > 60 ? " (mostrando 60)" : "") + "</p>" +
        shown.map(node => '<button type="button" class="pl-result ' + node.k + (this.allocated.has(node.id) ? " taken" : "") + '" data-focus="' + node.id + '"><b>' + escape(node.n) + "</b><small>" + escape(KIND_LABEL[node.k]) + (this.allocated.has(node.id) ? " · alocada" : "") + "</small><span>" + escape((node.s || []).join(" · ")) + "</span></button>").join("");
      results.querySelectorAll("[data-focus]").forEach(button => button.addEventListener("click", () => this.focus(Number(button.dataset.focus))));
      this.dirty();
    }

    // ---- Visão ----
    resize() {
      const rect = this.wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const ratio = window.devicePixelRatio || 1;
      const first = !this.width;
      this.width = rect.width; this.height = rect.height; this.ratio = ratio;
      this.canvas.width = Math.round(rect.width * ratio);
      this.canvas.height = Math.round(rect.height * ratio);
      if (first) this.fitBuild(); else this.dirty();
    }
    fit(nodes, maxScale = 0.4) {
      if (!nodes.length || !this.width) return;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const node of nodes) { minX = Math.min(minX, node.x); minY = Math.min(minY, node.y); maxX = Math.max(maxX, node.x); maxY = Math.max(maxY, node.y); }
      const pad = 500;
      this.scale = Math.max(0.012, Math.min(maxScale, this.width / (maxX - minX + pad * 2), this.height / (maxY - minY + pad * 2)));
      this.tx = this.width / 2 - (minX + maxX) / 2 * this.scale;
      this.ty = this.height / 2 - (minY + maxY) / 2 * this.scale;
      this.dirty();
    }
    fitBuild() {
      const start = this.prepared.nodes.get(this.startId);
      const nodes = this.points ? [...this.allocated].map(id => this.prepared.nodes.get(id)).filter(Boolean) : [...this.prepared.nodes.values()].filter(node => Math.hypot(node.x - start.x, node.y - start.y) < 3200);
      this.fit(nodes, 0.22);
    }
    focus(id) {
      const node = this.prepared.nodes.get(id);
      if (!node) return;
      this.scale = Math.max(this.scale, 0.3);
      this.tx = this.width / 2 - node.x * this.scale;
      this.ty = this.height / 2 - node.y * this.scale;
      this.focusId = id;
      this.focusUntil = performance.now() + 1800;
      const tick = () => { this.dirty(); if (performance.now() < this.focusUntil) requestAnimationFrame(tick); else { this.focusId = null; this.dirty(); } };
      tick();
    }
    zoomAt(factor, x, y) {
      const next = Math.min(1.3, Math.max(0.012, this.scale * factor));
      const worldX = (x - this.tx) / this.scale, worldY = (y - this.ty) / this.scale;
      this.scale = next; this.tx = x - worldX * next; this.ty = y - worldY * next;
      this.dirty();
    }
    nodeAt(x, y) {
      const worldX = (x - this.tx) / this.scale, worldY = (y - this.ty) / this.scale;
      const cell = this.prepared.cell;
      const cx = Math.floor(worldX / cell), cy = Math.floor(worldY / cell);
      let best = null, bestDistance = Infinity;
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        for (const node of this.prepared.grid.get((cx + i) + ":" + (cy + j)) || []) {
          const distance = Math.hypot(node.x - worldX, node.y - worldY);
          if (distance < Math.max(node.r * 1.15, 9 / this.scale) && distance < bestDistance) { best = node; bestDistance = distance; }
        }
      }
      return best;
    }
    setHover(node, x, y) {
      if (node !== this.hover) {
        this.hover = node;
        this.preview = { add: new Set(), remove: new Set() };
        if (node && node.k !== "start") {
          if (this.allocated.has(node.id)) this.preview.remove = new Set(this.removalOf(node.id));
          else this.preview.add = new Set(this.pathTo(node.id) || []);
        }
        this.previewPaths = {
          add: this.preview.add.size ? edgesPath(this.prepared, (a, b) => (this.preview.add.has(a) || this.preview.add.has(b)) && (this.preview.add.has(a) || this.allocated.has(a)) && (this.preview.add.has(b) || this.allocated.has(b))) : null,
          remove: this.preview.remove.size ? edgesPath(this.prepared, (a, b) => this.allocated.has(a) && this.allocated.has(b) && (this.preview.remove.has(a) || this.preview.remove.has(b))) : null
        };
        this.dirty();
      }
      this.showTooltip(node, x, y);
    }
    showTooltip(node, x, y) {
      if (!node) { this.tooltip.hidden = true; return; }
      let action = "";
      if (node.k === "start") action = node.id === this.startId ? "Início da sua classe" : "Início de outra classe";
      else if (this.allocated.has(node.id)) action = "Clique para remover" + (this.preview.remove.size > 1 ? " · libera " + this.preview.remove.size + " pontos" : " · libera 1 ponto");
      else if (this.preview.add.size) action = "Clique para alocar · +" + this.preview.add.size + (this.preview.add.size === 1 ? " ponto" : " pontos");
      else action = "Sem caminho até aqui";
      this.tooltip.innerHTML = '<b class="' + node.k + '">' + escape(node.n || KIND_LABEL[node.k]) + "</b><small>" + escape(KIND_LABEL[node.k]) + "</small>" +
        ((node.s || []).length ? "<ul>" + node.s.map(line => { const owner = lineClass(line); return "<li" + (owner && owner !== this.build.className ? ' class="other-class" title="Vale só para ' + escape(owner) + '"' : "") + ">" + escape(line).replace(/\n/g, "<br>") + "</li>"; }).join("") + "</ul>" : "") +
        '<em class="' + (this.allocated.has(node.id) && node.k !== "start" ? "remove" : "add") + '">' + escape(action) + "</em>";
      this.tooltip.hidden = false;
      const box = this.tooltip.getBoundingClientRect();
      const left = Math.min(Math.max(8, x + 18), this.width - box.width - 8);
      const top = y + 18 + box.height > this.height ? Math.max(8, y - box.height - 14) : y + 18;
      this.tooltip.style.transform = "translate(" + left + "px," + top + "px)";
    }
    rebuildPaths() {
      const has = id => this.allocated.has(id);
      this.allocPath = edgesPath(this.prepared, (a, b) => has(a) && has(b));
      if (this.hover) { const hover = this.hover; this.hover = null; this.setHover(hover, this.lastX || 0, this.lastY || 0); }
      this.dirty();
    }

    bind() {
      const canvas = this.canvas;
      const point = event => { const rect = canvas.getBoundingClientRect(); return { x: event.clientX - rect.left, y: event.clientY - rect.top }; };
      canvas.addEventListener("wheel", event => { event.preventDefault(); const p = point(event); this.zoomAt(Math.exp(-event.deltaY * 0.0015), p.x, p.y); }, { passive: false });
      canvas.addEventListener("pointerdown", event => { canvas.setPointerCapture(event.pointerId); this.pointers.set(event.pointerId, point(event)); this.moved = 0; });
      canvas.addEventListener("pointermove", event => {
        const p = point(event);
        this.lastX = p.x; this.lastY = p.y;
        const previous = this.pointers.get(event.pointerId);
        if (previous) {
          if (this.pointers.size === 1) { this.tx += p.x - previous.x; this.ty += p.y - previous.y; this.moved += Math.abs(p.x - previous.x) + Math.abs(p.y - previous.y); }
          else if (this.pointers.size === 2) {
            const other = [...this.pointers.entries()].find(([id]) => id !== event.pointerId)[1];
            const before = Math.hypot(previous.x - other.x, previous.y - other.y), after = Math.hypot(p.x - other.x, p.y - other.y);
            if (before > 0) this.zoomAt(after / before, (p.x + other.x) / 2, (p.y + other.y) / 2);
            this.moved += 10;
          }
          this.pointers.set(event.pointerId, p);
          if (this.moved > 4) { this.tooltip.hidden = true; canvas.style.cursor = "grabbing"; }
          this.dirty();
          return;
        }
        const node = this.nodeAt(p.x, p.y);
        canvas.style.cursor = node && node.k !== "start" ? "pointer" : "grab";
        this.setHover(node, p.x, p.y);
      });
      const release = event => {
        const p = point(event);
        if (this.pointers.size === 1 && this.moved <= 4 && event.button === 0) {
          this.toggle(this.nodeAt(p.x, p.y));
          const node = this.nodeAt(p.x, p.y);
          this.hover = null;
          this.setHover(node, p.x, p.y);
        }
        this.pointers.delete(event.pointerId);
        canvas.style.cursor = "grab";
      };
      canvas.addEventListener("pointerup", release);
      canvas.addEventListener("pointercancel", event => this.pointers.delete(event.pointerId));
      canvas.addEventListener("pointerleave", () => { if (!this.pointers.size) { this.setHover(null); } });
      this.wrap.querySelector(".pl-controls").addEventListener("click", event => {
        const action = event.target.dataset.zoom;
        if (action === "in") this.zoomAt(1.4, this.width / 2, this.height / 2);
        if (action === "out") this.zoomAt(1 / 1.4, this.width / 2, this.height / 2);
        if (action === "build") this.fitBuild();
        if (action === "all") this.fit([...this.prepared.nodes.values()]);
      });
      const element = this.element;
      element.querySelector("[data-undo]").addEventListener("click", () => this.undo());
      element.querySelector("[data-reset]").addEventListener("click", () => {
        if (!this.points || !confirm("Remover todos os pontos desta build?")) return;
        this.commit(new Set([this.startId]), "Árvore limpa. Use Desfazer para voltar.");
      });
      element.querySelector("[data-export]").addEventListener("click", () => {
        const { id, ...data } = this.build;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = (this.build.name || "build").replace(/[\\/:*?"<>|]+/g, "-") + ".json";
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      });
      // Ligar ao jogo: grava a build na pasta BuildPlanner; depois disso cada salvamento atualiza o arquivo sozinho.
      const gameButton = element.querySelector("[data-game]");
      const paintGame = () => {
        gameButton.classList.toggle("linked", !!this.build.gameFile);
        gameButton.textContent = this.build.gameFile ? "✓ Ligada ao jogo" : "⚔ Enviar para o jogo";
        gameButton.title = this.build.gameFile ? "Arquivo " + this.build.gameFile + " no planejador do jogo. Clique para desligar." : "Grava a build no planejador de builds do Path of Exile 2";
      };
      paintGame();
      gameButton.addEventListener("click", async () => {
        const unlink = !!this.build.gameFile;
        if (unlink && !confirm("Desligar esta build do jogo? O arquivo .build será apagado da pasta do jogo.")) return;
        gameButton.disabled = true;
        try {
          await saveBuilds(true);
          const result = await request("/api/planner-builds/game", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: this.build.id, unlink }) });
          this.build.gameFile = result.build.gameFile;
          paintGame();
          if (unlink) toast("Build desligada do jogo.");
          else openModal('<div class="pl-modal-head"><div class="eyebrow"><span class="eyebrow-line"></span> LIGADA AO JOGO</div><h2>Pronto, está no <em>jogo</em></h2><p>A build foi gravada como <b>' + escape(result.build.gameFile) + "</b> na pasta do planejador do Path of Exile 2. Daqui em diante, cada mudança salva aqui atualiza o arquivo.</p></div>" +
            '<ol class="pl-steps"><li>No jogo, abra a <b>Árvore de Passivas</b> (tecla P).</li><li>Clique no ícone do <b>Planejador de Builds</b>, no canto superior esquerdo.</li><li>Escolha <b>' + escape(this.build.name) + "</b> na lista.</li><li>O caminho da build aparece marcado na árvore para você seguir.</li></ol>" +
            '<p class="pl-hint">Se o jogo já estava aberto e a build não aparecer, feche e abra a árvore de passivas de novo.</p>');
        } catch (failure) { toast("Não consegui enviar: " + failure.message); }
        gameButton.disabled = false;
      });
      const nameInput = element.querySelector("[data-name]");
      nameInput.addEventListener("input", () => { this.build.name = nameInput.value.trim() || this.build.className; this.build.updatedAt = new Date().toISOString(); saveBuilds(); });
      element.querySelector("[data-notes]").addEventListener("input", event => { this.build.notes = event.target.value; this.build.updatedAt = new Date().toISOString(); saveBuilds(); });
      let searchTimer;
      element.querySelector("[data-search]").addEventListener("input", event => { clearTimeout(searchTimer); searchTimer = setTimeout(() => this.runSearch(event.target.value), 160); });
      element.querySelectorAll("[data-tab]").forEach(tab => tab.addEventListener("click", () => {
        element.querySelectorAll("[data-tab]").forEach(other => other.classList.toggle("active", other === tab));
        element.querySelectorAll("[data-panel]").forEach(panel => { panel.hidden = panel.dataset.panel !== tab.dataset.tab; });
        if (tab.dataset.tab === "search") element.querySelector("[data-search]").focus();
      }));
      this.keyHandler = event => {
        if (!document.body.contains(this.canvas)) return;
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !/INPUT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName)) { event.preventDefault(); this.undo(); }
      };
      document.addEventListener("keydown", this.keyHandler);
    }

    icon(path) {
      if (!path) return null;
      let entry = this.iconCache.get(path);
      if (!entry) {
        const image = new Image();
        image.decoding = "async";
        image.referrerPolicy = "no-referrer";
        entry = { image, ready: false };
        image.onload = () => { entry.ready = true; this.dirty(); };
        image.src = this.prepared.iconBase + path;
        this.iconCache.set(path, entry);
      }
      return entry.ready ? entry.image : null;
    }
    dirty() {
      if (this.frame || !this.width) return;
      this.frame = requestAnimationFrame(() => { this.frame = null; this.render(); });
    }

    render() {
      const ctx = this.ctx, s = this.scale;
      ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
      const glow = ctx.createRadialGradient(this.width / 2, this.height * 0.45, 0, this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.8);
      glow.addColorStop(0, "#1a1c16"); glow.addColorStop(0.6, "#10110e"); glow.addColorStop(1, "#090a08");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.setTransform(this.ratio * s, 0, 0, this.ratio * s, this.ratio * this.tx, this.ratio * this.ty);
      const px = 1 / s;
      const accent = getComputedStyle(this.element).getPropertyValue("--accent").trim() || "#c6a86b";
      ctx.lineCap = "round";

      ctx.strokeStyle = "#2b2d27";
      ctx.lineWidth = Math.max(6, px * 1.3);
      ctx.stroke(this.prepared.basePath);
      if (this.allocPath) {
        ctx.strokeStyle = accent; ctx.globalAlpha = 0.28; ctx.lineWidth = Math.max(34, px * 7); ctx.stroke(this.allocPath);
        ctx.globalAlpha = 1; ctx.strokeStyle = "#e3c27a"; ctx.lineWidth = Math.max(13, px * 2.8); ctx.stroke(this.allocPath);
      }
      if (this.previewPaths && this.previewPaths.add) {
        ctx.setLineDash([30, 22]); ctx.strokeStyle = "#cfe7ff"; ctx.globalAlpha = 0.85; ctx.lineWidth = Math.max(11, px * 2.4); ctx.stroke(this.previewPaths.add);
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
      if (this.previewPaths && this.previewPaths.remove) { ctx.strokeStyle = "#d9614c"; ctx.lineWidth = Math.max(14, px * 3); ctx.stroke(this.previewPaths.remove); }

      const margin = 140;
      const minX = -this.tx / s - margin, minY = -this.ty / s - margin, maxX = (this.width - this.tx) / s + margin, maxY = (this.height - this.ty) / s + margin;
      const showIcons = s > 0.075, showLabels = s > 0.3;
      const time = performance.now();
      for (const node of this.prepared.nodes.values()) {
        if (node.x < minX || node.x > maxX || node.y < minY || node.y > maxY) continue;
        const on = this.allocated.has(node.id);
        const adding = this.preview.add.has(node.id);
        const removing = this.preview.remove.has(node.id);
        const matched = this.matches.has(node.id);
        const own = node.k === "start" && node.id === this.startId;
        const r = Math.max(node.r, (node.k === "normal" ? 1.8 : 2.8) * px);
        if (on && node.k !== "normal") {
          ctx.beginPath(); ctx.arc(node.x, node.y, r * 1.9, 0, Math.PI * 2);
          const halo = ctx.createRadialGradient(node.x, node.y, r * 0.6, node.x, node.y, r * 1.9);
          halo.addColorStop(0, "rgba(227,194,122,.35)"); halo.addColorStop(1, "rgba(227,194,122,0)");
          ctx.fillStyle = halo; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = "#171814"; ctx.fill();
        const image = showIcons && node.k !== "start" && (node.k !== "normal" || on || adding || s > 0.16) ? this.icon(node.i) : null;
        if (image) {
          ctx.save(); ctx.clip();
          ctx.globalAlpha = on || adding ? 1 : removing ? 0.5 : 0.36;
          ctx.drawImage(image, node.x - r, node.y - r, r * 2, r * 2);
          ctx.restore();
        } else if (on || adding || own) {
          ctx.fillStyle = on || own ? "#e3c27a" : "#cfe7ff"; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
        }
        ctx.lineWidth = Math.max(node.k === "normal" ? 4 : 7, px * (on ? 2.2 : 1.1));
        ctx.strokeStyle = removing ? "#d9614c" : adding ? "#cfe7ff" : on || own ? "#e8c77e" : node.k === "keystone" ? "#8b7b55" : node.k === "notable" ? "#776f5a" : node.k === "jewel" ? "#5f7f8f" : "#55524a";
        ctx.stroke();
        if (node.k === "keystone" || node.k === "start" || node.k === "notable") {
          ctx.beginPath(); ctx.arc(node.x, node.y, r + (node.k === "notable" ? 7 : 13), 0, Math.PI * 2);
          ctx.lineWidth = Math.max(3, px);
          ctx.strokeStyle = own ? accent : on ? "#e8c77e" : "#45412f";
          ctx.stroke();
        }
        if (matched) {
          ctx.beginPath(); ctx.arc(node.x, node.y, r + 22 + 4 * Math.sin(time / 300), 0, Math.PI * 2);
          ctx.lineWidth = Math.max(6, px * 2.2); ctx.strokeStyle = "#5fd3c9"; ctx.stroke();
        }
        if (node === this.hover || node.id === this.focusId) {
          const pulse = node.id === this.focusId ? 1 + 0.25 * Math.sin(time / 110) : 1;
          ctx.beginPath(); ctx.arc(node.x, node.y, (r + 20) * pulse, 0, Math.PI * 2);
          ctx.lineWidth = Math.max(5, px * 2); ctx.strokeStyle = "#fff3cf"; ctx.stroke();
        }
        if (own) {
          ctx.font = "bold 60px Georgia, serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = "#1b1c17"; ctx.fillText(this.build.className.slice(0, 1), node.x, node.y + 3);
        }
        if (showLabels && node.n && (node.k === "notable" || node.k === "keystone")) {
          ctx.font = (node.k === "keystone" ? 30 : 22) + "px Georgia, serif"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
          ctx.fillStyle = on ? "#f1e3bd" : "#8c887a";
          ctx.fillText(node.n, node.x, node.y + r + 36);
        }
      }
      if (this.matches.size) this.dirty();
    }

    destroy() {
      this.resizeObserver.disconnect();
      document.removeEventListener("keydown", this.keyHandler);
    }
  }

  window.onPlannerPage = () => { if (!view.editor) renderList(); };
})();
