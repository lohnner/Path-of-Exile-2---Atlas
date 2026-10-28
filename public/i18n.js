// Interface em inglês (bandeira dos EUA): troca os textos da tela por um dicionário PT→EN.
// Os dados do jogo (nomes, modificadores, atributos) já vêm em inglês do próprio app.js; aqui ficam só os textos da interface.
(() => {
  const DICT = {
    // Topo e navegação
    "ATLAS DE ITENS": "ITEM ATLAS", "Início": "Home", "Equipamentos": "Equipment", "Armas": "Weapons", "Itens": "Items", "Gemas": "Gems",
    "Filtro": "Filter", "Build": "Build", "Cofre": "Vault", "Biblioteca local": "Local library", "Sincronizar": "Sync", "Conectando": "Connecting",
    "Atlas de Wraeclast, início": "Wraeclast Atlas, home", "Navegação principal": "Main navigation", "Idioma dos nomes dos itens": "Item name language",
    "Nomes dos itens em português": "Item names in Portuguese", "Nomes originais do jogo (inglês)": "Original game names (English)",
    // Cabeçalho da Wiki
    "CÓDICE DE EXÍLIO": "CODEX OF EXILE", "Wiki de": "Wiki of", "equipamentos": "equipment", "armas": "weapons", "itens": "items",
    "Consulte armaduras, acessórios e demais equipamentos do jogo.": "Browse armour, accessories and other equipment in the game.",
    "Explore todas as armas e opções de mão secundária, com imagens, níveis e informações do jogo.": "Explore every weapon and off-hand option, with images, levels and game information.",
    "Explore orbes, poções, patuás e runas com imagens, níveis e informações do jogo.": "Explore orbs, flasks, charms and runes with images, levels and game information.",
    "Catálogo PT-BR": "PT-BR catalog", "Wiki comunitária": "Community wiki", "Wiki comunitária ↗": "Community wiki ↗",
    // Filtro compartilhado
    "Filtro compartilhado": "Shared filter", "Use o perfil para limitar os itens exibidos na Wiki.": "Use the profile to limit the items shown in the Wiki.",
    "Todos os equipamentos": "All equipment", "Abrir editor completo ↗": "Open full editor ↗", "Selecionar filtro do jogo": "Select game filter",
    "Criar novo filtro do zero": "Create new filter from scratch", "Importar filtro": "Import filter", "Nenhum filtro carregado": "No filter loaded",
    "Salvar por cima do arquivo": "Overwrite file", "Nome do novo filtro": "New filter name", "Criar e salvar filtro": "Create and save filter", "Cancelar": "Cancel",
    "O arquivo será criado na pasta de filtros do jogo. A extensão .filter será adicionada automaticamente.": "The file will be created in the game's filter folder. The .filter extension is added automatically.",
    "arquivo selecionado": "file selected", "Filtro da Wiki": "Wiki filter", "Ex.: Meu filtro de evasão": "E.g. My evasion filter",
    // Busca, tipo, defesa, ordenação
    "Buscar item, classe ou atributo…": "Search item, class or attribute…", "Ocultar únicos": "Hide uniques", "Ocultar itens únicos dos resultados": "Hide unique items from the results",
    "TIPO": "TYPE", "Todos os tipos": "All types", "DEFESA": "DEFENCE", "Todas as defesas": "All defences", "Armadura": "Armour", "Evasão": "Evasion",
    "Escudo de Energia": "Energy Shield", "Armadura + Evasão": "Armour + Evasion", "Armadura + Escudo de Energia": "Armour + Energy Shield",
    "Evasão + Escudo de Energia": "Evasion + Energy Shield", "Armadura + Evasão + Escudo de Energia": "Armour + Evasion + Energy Shield",
    "Filtrar por tipo de item": "Filter by item type", "Filtrar por combinação de defesas": "Filter by defence combination", "Filtros": "Filters",
    "CATEGORIAS": "CATEGORIES", "Categorias": "Categories", "ORDENAR": "SORT", "Ordenar itens": "Sort items",
    "Nível do item · menor": "Item level · lowest", "Nível do item · maior": "Item level · highest", "Nome · A–Z": "Name · A–Z", "Nome · Z–A": "Name · Z–A",
    "Nível requerido · maior": "Required level · highest", "Nível requerido · menor": "Required level · lowest", "Tipo de equipamento": "Equipment type",
    "Categoria e raridade": "Category and rarity", "Carregar mais": "Load more", "Carregando catálogo…": "Loading catalog…", "Sincronizando dados locais": "Syncing local data",
    // Categorias
    "Todos": "All", "Todas as armas": "All weapons", "Todos os itens": "All items", "Únicos": "Uniques", "Orbes": "Orbs", "Poções": "Flasks", "Patuás": "Charms",
    "Runas": "Runes", "Presságios": "Omens", "Essências": "Essences", "Ossos do Abismo": "Abyssal Bones", "Pedras-guia": "Waystones", "Provações": "Trials",
    "Tábuas": "Tablets", "Gemas brutas": "Uncut Gems", "Gemas de linhagem": "Lineage Gems", "Outros": "Others", "Gema de suporte": "Support Gem",
    // Cards
    "Único": "Unique", "Equipamento base": "Base item", "Item": "Item", "Moeda": "Currency", "Orbe": "Orb", "Runa": "Rune", "Ídolo": "Idol", "Presságio": "Omen",
    "Essência": "Essence", "Osso do Abismo": "Abyssal Bone", "Pedra-guia": "Waystone", "Provação": "Trial", "Gema bruta": "Uncut Gem", "Gema": "Gem", "Patuá": "Charm",
    "Poção de vida": "Life Flask", "Poção de mana": "Mana Flask", "Sempre visível": "Always visible", "Oculto no jogo": "Hidden in game",
    "Único valioso: todo filtro gerado pelo Atlas sempre mostra este item": "Valuable unique: every filter generated by the Atlas always shows this item",
    "Oculto no filtro do jogo (continua aqui na Wiki)": "Hidden by the game filter (still listed in the Wiki)", "Destacado no filtro": "Highlighted in the filter",
    "Buscar no mercado oficial (Trade)": "Search the official trade site", "Buscar no mercado oficial": "Search the official trade site",
    "Adicionar aos favoritos": "Add to favourites", "Remover dos favoritos": "Remove from favourites", "Nível mínimo para o item aparecer como drop": "Minimum level for the item to drop",
    // Painel de detalhes
    "REGISTRO DO CÓDICE": "CODEX ENTRY", "Fechar": "Close", "Nome no outro idioma": "Name in the other language", "Abrir ficha em português ↗": "Open Portuguese page ↗",
    "ATRIBUTOS DO ÚNICO": "UNIQUE ATTRIBUTES", "Dados de atributos são fornecidos pela wiki comunitária e podem estar incompletos para itens recém-adicionados.": "Attribute data comes from the community wiki and may be incomplete for newly added items.",
    "Não encontrei os atributos deste item na exportação atual da wiki. Abra a página comunitária para consultar os dados mais recentes.": "This item's attributes are not in the current wiki export. Open the community page for the latest data.",
    "PROPRIEDADES DA BASE": "BASE PROPERTIES", "REQUISITOS": "REQUIREMENTS", "TAGS DA BASE": "BASE TAGS", "MODIFICADORES COMPATÍVEIS": "COMPATIBLE MODIFIERS",
    "IMPLÍCITOS DA BASE": "BASE IMPLICITS", "CARACTERÍSTICAS": "CHARACTERISTICS", "DETALHES DA GEMA": "GEM DETAILS", "EFEITO": "EFFECT", "EFEITO NO ITEM": "EFFECT ON ITEM",
    "EFEITOS AO ENCAIXAR": "SOCKETED EFFECTS", "VINCULADO": "BONDED", "COMO USAR": "HOW TO USE",
    "Prefixos": "Prefixes", "Sufixos": "Suffixes", "Prefixo": "Prefix", "Sufixo": "Suffix", "Corrompido": "Corrupted", "Implícito": "Implicit", "Outro": "Other",
    "Tempo de ataque": "Attack time", "Chance crítica": "Critical chance", "Dano físico mínimo": "Minimum physical damage", "Dano físico máximo": "Maximum physical damage",
    "Alcance": "Range", "Cargas": "Charges", "Tamanho da pilha": "Stack size", "Escudo de energia": "Energy shield", "Proteção": "Ward", "Velocidade": "Movement speed", "Bloqueio": "Block",
    "Nível": "Level", "Força": "Strength", "Destreza": "Dexterity", "Inteligência": "Intelligence", "Tipo": "Type", "Nível de criação": "Crafting level",
    "Suporte": "Support", "Habilidade ativa": "Active skill", "Descrição indisponível nesta exportação.": "Description not available in this export.",
    "Nenhum modificador encontrado.": "No modifier found.",
    "Lista calculada pelas tags da base e pelos pesos positivos de geração exportados. Os afixos marcados aparecem como bloqueados no filtro.": "List computed from the base tags and the exported positive spawn weights. Marked affixes show as blocked in the filter.",
    // Gemas
    "Gemas de": "Skill", "habilidade": "gems", "Escolha o tipo de arma e passe o mouse sobre uma gema para ver o que ela faz.": "Pick a weapon type and hover a gem to see what it does.",
    "Arco": "Bow", "Lança": "Spear", "Adaga": "Dagger", "Bastão": "Quarterstaff", "Oculto": "Occult", "Elemental": "Elemental", "Mangual": "Flail", "Primal": "Primal",
    "Machado": "Axe", "Maça": "Mace", "Espada": "Sword", "Besta": "Crossbow", "Todas as gemas": "All gems", "Habilidades": "Skills",
    "Caos": "Chaos", "Fogo": "Fire", "Gelo": "Cold", "Raio": "Lightning", "Físico": "Physical", "Lacaios": "Minions", "Buscar gema…": "Search gem…",
    "Dano de caos / veneno": "Chaos / poison damage", "Dano de fogo": "Fire damage", "Dano de gelo": "Cold damage", "Dano de raio": "Lightning damage", "Dano físico": "Physical damage",
    "Usa lacaios": "Uses minions", "Arautos, auras, montarias e espírito": "Heralds, auras, mounts and spirit", "Nenhuma gema encontrada.": "No gem found.",
    "Carregando gemas…": "Loading gems…", "Carregando descrição…": "Loading description…", "Causa dano de caos": "Deals chaos damage"
  };
  const PATTERNS = [
    [/^(\d[\d.]*) resultados?$/, "$1 results"], [/^Nv\. (\d+)$/, "Lv. $1"], [/^Nível de drop (\d+)$/, "Drop level $1"],
    [/^personagem Nv\. (\d+)$/, "character Lv. $1"], [/^(\d+) gemas$/, "$1 gems"], [/^(.+) no catálogo$/, (_, what) => translate(what) + " in the catalog"],
    [/^Para “(.+)” em (.+)$/, (_, query, rest) => "For “" + query + "” in " + translate(rest)], [/^Base: (.+)$/, "Base: $1"],
    [/^Descrição indisponível\. ?(.*)$/, "Description unavailable. $1"], [/^Tier (\w+)$/, "Tier $1"]
  ];
  function translate(text) {
    if (DICT[text]) return DICT[text];
    for (const [pattern, replacement] of PATTERNS) if (pattern.test(text)) return text.replace(pattern, replacement);
    if (text.includes(" · ")) {
      const parts = text.split(" · ");
      const translated = parts.map(translate);
      if (translated.some((part, index) => part !== parts[index])) return translated.join(" · ");
    }
    return text;
  }
  // Mantém espaços nas pontas (o texto do DOM costuma vir com quebras e recuo).
  function translateKeepingSpace(value) {
    const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(value);
    if (!match[2]) return value;
    const result = translate(match[2]);
    return result === match[2] ? value : match[1] + result + match[3];
  }

  const ATTRIBUTES = ["placeholder", "title", "aria-label"];
  const textOriginals = new WeakMap();   // nó de texto → texto em português
  const textApplied = new WeakMap();     // nó de texto → texto em inglês que colocamos
  const attrOriginals = new WeakMap();   // elemento → { atributo: texto em português }
  let english = false;
  let observer = null;

  function translateTextNode(node) {
    if (node.parentElement && node.parentElement.closest("script,style,svg,input,textarea")) return;
    const current = node.nodeValue;
    if (textApplied.get(node) === current) return;
    const result = translateKeepingSpace(current);
    if (result === current) return;
    textOriginals.set(node, current);
    textApplied.set(node, result);
    node.nodeValue = result;
  }
  function translateAttributes(element) {
    for (const attribute of ATTRIBUTES) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const saved = attrOriginals.get(element) || {};
      if (saved[attribute] && saved[attribute].en === value) continue;
      const result = translate(value);
      if (result === value) continue;
      saved[attribute] = { pt: value, en: result };
      attrOriginals.set(element, saved);
      element.setAttribute(attribute, result);
    }
  }
  function translateTree(root) {
    if (root.nodeType === Node.TEXT_NODE) { translateTextNode(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    translateAttributes(root);
    root.querySelectorAll("[placeholder],[title],[aria-label]").forEach(translateAttributes);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateTextNode(node);
  }
  function restoreTree(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (textOriginals.has(node) && textApplied.get(node) === node.nodeValue) node.nodeValue = textOriginals.get(node);
      textOriginals.delete(node); textApplied.delete(node);
    }
    root.querySelectorAll("*").forEach(element => {
      const saved = attrOriginals.get(element);
      if (!saved) return;
      for (const [attribute, { pt, en }] of Object.entries(saved)) if (element.getAttribute(attribute) === en) element.setAttribute(attribute, pt);
      attrOriginals.delete(element);
    });
  }

  window.atlasSetInterfaceLanguage = lang => {
    english = lang === "en";
    document.documentElement.lang = english ? "en" : "pt-BR";
    if (observer) { observer.disconnect(); observer = null; }
    if (!english) { restoreTree(document.body); return; }
    translateTree(document.body);
    observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") translateTextNode(mutation.target);
        else if (mutation.type === "attributes") translateAttributes(mutation.target);
        else mutation.addedNodes.forEach(translateTree);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES });
  };
  window.atlasTranslate = text => english ? translate(text) : text;
})();
