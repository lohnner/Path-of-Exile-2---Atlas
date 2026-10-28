// Aba Gemas: habilidades por tipo de arma, organizadas por tier como no jogo. A descrição vem do PoE2DB ao passar o mouse.
(() => {
  const CATEGORIES = [
    { id: "Bow", label: "Arco", icon: "🏹" }, { id: "Spear", label: "Lança", icon: "⟋" }, { id: "Dagger", label: "Adaga", icon: "🗡" },
    { id: "Quarterstaff", label: "Bastão", icon: "⚚" }, { id: "Occult", label: "Oculto", icon: "☠" }, { id: "Elemental", label: "Elemental", icon: "✺" },
    { id: "Flail", label: "Mangual", icon: "⛓" }, { id: "Primal", label: "Primal", icon: "❦" }, { id: "Axe", label: "Machado", icon: "🪓" },
    { id: "Mace", label: "Maça", icon: "⚒" }, { id: "Sword", label: "Espada", icon: "⚔" }, { id: "Crossbow", label: "Besta", icon: "✛" },
    { id: "all", label: "Todas as gemas", icon: "✦" }
  ];
  const ELEMENTS = [
    { id: "chaos", label: "Caos", title: "Dano de caos / veneno" }, { id: "fire", label: "Fogo", title: "Dano de fogo" },
    { id: "cold", label: "Gelo", title: "Dano de gelo" }, { id: "lightning", label: "Raio", title: "Dano de raio" },
    { id: "physical", label: "Físico", title: "Dano físico" }, { id: "minion", label: "Lacaios", title: "Usa lacaios" }
  ];
  const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];
  const view = { category: "Bow", kind: "active", element: "", search: "", info: new Map(), hoverId: null };
  const byId = id => document.getElementById(id);
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  // Segue as bandeiras do topo: em inglês mostra o nome original, e o outro idioma vai para a linha de baixo do tooltip.
  const english = () => typeof state !== "undefined" && state.nameLang === "en";
  const shownName = gem => english() ? gem.english : gem.name;
  const otherName = gem => english() ? gem.name : gem.english;
  const normalize = value => String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  function gemList() {
    if (typeof state === "undefined" || !state.data || !state.data.skill_gems) return [];
    return Object.values(state.data.skill_gems).filter(gem => gem && gem.base_item && gem.base_item.release_state === "released" && gem.base_item.display_name && !/^\[|^Coming Soon$|^Playtest|^Removed Skill$/i.test(gem.base_item.display_name)).map(gem => {
      const english = gem.base_item.display_name;
      const translation = typeof itemTranslation === "function" ? itemTranslation(english) : null;
      return {
        id: gem.base_item.id, english, name: translation && translation.name || english,
        slug: translation && translation.slug || english.replace(/ /g, "_").replace(/[^\w'().,-]/g, ""),
        level: gem.crafting_level || 0, types: gem.crafting_types || [], tags: gem.tags || [], color: gem.color,
        kind: gem.gem_type === "support" ? "support" : "active", spirit: gem.gem_type === "spirit",
        icon: gem.icon_dds_file ? "https://cdn.poe2db.tw/image/" + gem.icon_dds_file.replace(/\\/g, "/").replace(/\/4k\//g, "/").replace(/\.dds$/i, ".webp") : ""
      };
    });
  }

  function filteredGems() {
    const query = normalize(view.search);
    return gemList().filter(gem => gem.kind === view.kind
      && (view.category === "all" || gem.types.includes(view.category))
      && (!view.element || gem.tags.includes(view.element))
      && (!query || normalize(gem.name + " " + gem.english).includes(query)))
      .sort((a, b) => a.level - b.level || shownName(a).localeCompare(shownName(b), "pt-BR"));
  }

  // Alguns ícones não existem no CDN do PoE2DB: nesse caso a imagem vem da wiki comunitária.
  function gemIcon(gem) {
    const wiki = "/api/skill-icon?name=" + encodeURIComponent(gem.english) + "&slug=" + encodeURIComponent(gem.slug) + "&v=3";
    if (!gem.icon) return '<img src="' + escape(wiki) + '" alt="" loading="lazy" onerror="this.remove()">';
    return '<img src="' + escape(gem.icon) + '" alt="" loading="lazy" data-fallback="' + escape(wiki) + '" onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.removeAttribute(\'data-fallback\');}else{this.remove();}">';
  }

  // Uma bolinha colorida para cada tipo de dano (ou lacaio) da gema, no canto do card.
  function elementDots(gem) {
    const dots = ELEMENTS.filter(item => gem.tags.includes(item.id));
    if (!dots.length) return "";
    return '<span class="gem-dots" aria-label="' + escape(dots.map(item => item.label).join(", ")) + '">' + dots.map(item => '<i class="gem-dot gem-dot-' + item.id + '" title="' + escape(item.title) + '"></i>').join("") + '</span>';
  }

  function gemCard(gem) {
    return '<button class="gem-card gem-' + escape(gem.color || "w") + '" type="button" data-gem="' + escape(gem.id) + '">'
      + '<span class="gem-icon">' + gemIcon(gem) + '</span>'
      + '<b>' + escape(shownName(gem)) + '</b>'
      + elementDots(gem)
      + '</button>';
  }

  function tierRows(gems) {
    const tiers = new Map();
    gems.forEach(gem => { if (!tiers.has(gem.level)) tiers.set(gem.level, []); tiers.get(gem.level).push(gem); });
    return [...tiers].map(([level, list]) => '<div class="gem-tier"><span class="gem-tier-mark">' + (ROMAN[level] || level || "—") + '</span><div class="gem-tier-grid">' + list.map(gemCard).join("") + '</div></div>').join("");
  }

  function render() {
    const root = byId("gems");
    if (!root) return;
    if (typeof state === "undefined" || !state.data) { root.innerHTML = '<div class="filter-empty">Carregando gemas…</div>'; setTimeout(render, 800); return; }
    const gems = filteredGems();
    // No jogo, os tiers ímpares são as habilidades principais; os demais (arautos, auras, espírito) ficam à parte.
    const main = view.kind === "active" ? gems.filter(gem => !gem.spirit && gem.level % 2 === 1) : gems;
    const extra = view.kind === "active" ? gems.filter(gem => !main.includes(gem)) : [];
    const category = CATEGORIES.find(item => item.id === view.category);
    root.innerHTML = '<div class="wiki-heading"><div><div class="eyebrow"><span class="eyebrow-line"></span> CÓDICE DE EXÍLIO</div><h1>Gemas de <em>habilidade</em></h1><p>Escolha o tipo de arma e passe o mouse sobre uma gema para ver o que ela faz.</p></div></div>'
      + '<div class="gems-layout"><aside class="gems-rail">' + CATEGORIES.map(item => '<button type="button" class="' + (item.id === view.category ? "active" : "") + '" data-gem-category="' + item.id + '"><span>' + item.icon + '</span>' + item.label + '</button>').join("") + '</aside>'
      + '<div class="gems-main"><div class="gems-toolbar">'
      + '<div class="gems-kind"><button type="button" data-gem-kind="active" class="' + (view.kind === "active" ? "active" : "") + '">Habilidades</button><button type="button" data-gem-kind="support" class="' + (view.kind === "support" ? "active" : "") + '">Suporte</button></div>'
      + '<label class="search-box gems-search"><span>⌕</span><input id="gems-search" type="search" placeholder="Buscar gema…" autocomplete="off" value="' + escape(view.search) + '"></label>'
      + '<div class="gems-elements">' + ELEMENTS.map(item => '<button type="button" data-gem-element="' + item.id + '" title="' + escape(item.title) + '" class="gem-el-' + item.id + (view.element === item.id ? " active" : "") + '"><i class="gem-dot gem-dot-' + item.id + '"></i>' + item.label + '</button>').join("") + '</div></div>'
      + '<div class="gems-count">' + gems.length + ' gemas · ' + escape(category ? category.label : "") + '</div>'
      + (gems.length ? '<div class="gems-board">' + tierRows(main) + '</div>' : '<div class="filter-empty">Nenhuma gema encontrada.</div>')
      + (extra.length ? '<h3 class="gems-extra-title">Arautos, auras, montarias e espírito</h3><div class="gems-board">' + tierRows(extra) + '</div>' : "")
      + '</div></div><div class="gem-tooltip" id="gem-tooltip" hidden></div>';
    bind(root);
  }

  const infoKey = gem => (english() ? "en:" : "") + gem.id;
  async function loadInfo(gem) {
    const key = infoKey(gem);
    if (view.info.has(key)) return view.info.get(key);
    const promise = fetch("/api/skill-gem?slug=" + encodeURIComponent(gem.slug) + (english() ? "&lang=en" : "")).then(response => response.ok ? response.json() : null).catch(() => null);
    view.info.set(key, promise);
    const info = await promise;
    if (!info) view.info.delete(key);
    else view.info.set(key, info);
    return info;
  }

  function tooltipHtml(gem, info) {
    const tags = gem.tags.filter(tag => !["grants_active_skill", "support", "dexterity", "strength", "intelligence"].includes(tag)).map(tag => typeof tagLabel === "function" ? tagLabel(tag) : tag);
    let body = '<div class="gem-tip-head gem-' + escape(gem.color || "w") + '"><b>' + escape(shownName(gem)) + '</b><small>' + escape(otherName(gem)) + ' · Tier ' + (ROMAN[gem.level] || gem.level) + '</small></div>';
    if (info === undefined) return body + '<div class="gem-tip-loading">Carregando descrição…</div>';
    if (!info) return body + '<div class="gem-tip-loading">Descrição indisponível. ' + (tags.length ? escape(tags.join(", ")) : "") + '</div>';
    const tidy = line => escape(String(line).replace(/\s+([,.)])/g, "$1").replace(/\(\s+/g, "(").replace(/\s—\s/g, "–"));
    const properties = (info.properties || []).filter(line => !/^(Nível|Level): \d+$/.test(line));
    if (info.description) body += '<p class="gem-tip-desc">' + tidy(info.description) + '</p>';
    if (properties.length) body += '<ul class="gem-tip-props">' + properties.map(line => '<li>' + tidy(line) + '</li>').join("") + '</ul>';
    if (info.effects && info.effects.length) body += '<ul class="gem-tip-effects">' + info.effects.map(line => '<li>' + tidy(line) + '</li>').join("") + '</ul>';
    return body;
  }

  function placeTooltip(tip, card) {
    const rect = card.getBoundingClientRect();
    const width = tip.offsetWidth, height = tip.offsetHeight;
    let left = rect.right + 10;
    if (left + width > window.innerWidth - 12) left = Math.max(12, rect.left - width - 10);
    const top = Math.min(Math.max(12, rect.top), window.innerHeight - height - 12);
    tip.style.left = left + "px";
    tip.style.top = Math.max(12, top) + "px";
  }

  async function showTooltip(card) {
    const tip = byId("gem-tooltip");
    const gem = gemList().find(item => item.id === card.dataset.gem);
    if (!tip || !gem) return;
    view.hoverId = gem.id;
    const cached = view.info.get(infoKey(gem));
    tip.innerHTML = tooltipHtml(gem, cached instanceof Promise ? undefined : cached);
    tip.hidden = false;
    placeTooltip(tip, card);
    const info = await loadInfo(gem);
    if (view.hoverId !== gem.id) return;
    tip.innerHTML = tooltipHtml(gem, info);
    placeTooltip(tip, card);
  }

  function bind(root) {
    root.querySelectorAll("[data-gem-category]").forEach(button => button.addEventListener("click", () => { view.category = button.dataset.gemCategory; render(); }));
    root.querySelectorAll("[data-gem-kind]").forEach(button => button.addEventListener("click", () => { view.kind = button.dataset.gemKind; render(); }));
    root.querySelectorAll("[data-gem-element]").forEach(button => button.addEventListener("click", () => { view.element = view.element === button.dataset.gemElement ? "" : button.dataset.gemElement; render(); }));
    const search = byId("gems-search");
    search.addEventListener("input", () => {
      view.search = search.value;
      const position = search.selectionStart;
      render();
      const next = byId("gems-search");
      next.focus();
      next.setSelectionRange(position, position);
    });
    root.querySelectorAll("[data-gem]").forEach(card => {
      card.addEventListener("mouseenter", () => showTooltip(card));
      card.addEventListener("focus", () => showTooltip(card));
      card.addEventListener("click", () => showTooltip(card));
      card.addEventListener("mouseleave", () => { view.hoverId = null; const tip = byId("gem-tooltip"); if (tip) tip.hidden = true; });
      card.addEventListener("blur", () => { view.hoverId = null; const tip = byId("gem-tooltip"); if (tip) tip.hidden = true; });
    });
  }

  window.onGemsPage = render;
})();
