const FAVORITES_STORAGE_KEY = "atlas-poe2-wiki-favorites-v1";
const LOOT_FILTER_STORAGE_KEY = "atlas-poe2-loot-filter-v1";
const LOOT_FILTER_DRAFT_BACKUP_KEY = "atlas-poe2-loot-filter-draft-backup-v1";
const LOOT_FILTER_RARITIES = [{ value: "Normal", label: "Normal" }, { value: "Magic", label: "Mágica" }, { value: "Rare", label: "Rara" }, { value: "Unique", label: "Única" }];
const ALWAYS_VISIBLE_LOOT_RARITIES = new Set();
const HIDEABLE_LOOT_RARITIES = LOOT_FILTER_RARITIES.filter(option => !ALWAYS_VISIBLE_LOOT_RARITIES.has(option.value));
const FILTER_DEFENSES = ["armour", "evasion", "energy_shield"];
// Combinações de defesa que aparecem como caixinhas na ocultação de equipamentos.
const HIDE_DEFENSE_OPTIONS = [["armour", "Somente armadura"], ["evasion", "Somente evasão"], ["energy_shield", "Somente escudo de energia"], ["armour,evasion", "Armadura + evasão"], ["armour,energy_shield", "Armadura + escudo de energia"], ["evasion,energy_shield", "Evasão + escudo de energia"], ["armour,evasion,energy_shield", "Armadura + evasão + escudo de energia"]];
const WEAPON_ITEM_CLASSES = new Set(["Bow", "Crossbow", "Claw", "Dagger", "Flail", "One Hand Axe", "One Hand Mace", "One Hand Sword", "Sceptre", "Spear", "Staff", "Talisman", "Two Hand Axe", "Two Hand Mace", "Two Hand Sword", "Wand", "Warstaff", "Quarterstaff"]);
const OFFHAND_ITEM_CLASSES = new Set(["Buckler", "Focus", "Quiver", "Shield", "TrapTool"]);
const ITEM_NAME_OVERRIDES = { "Fishing Rod": "Vara de pesca", "Chain Mail": "Cota de Malha", "Lavish Wombgift": "Dádiva do Ventre Generosa" };
const HIDDEN_CATALOG_ITEM_CLASSES = new Set(["skillgemtoken", "uniquefragment", "heistobjective", "fishingrod", "sanctumspecialrelic"]);
// Cores e formas aceitas pelo jogo em MinimapIcon e PlayEffect.
const FILTER_EFFECT_COLORS = [
  { value: "Red", label: "Vermelho", hex: "#e0453a" }, { value: "Orange", label: "Laranja", hex: "#f08a24" }, { value: "Yellow", label: "Amarelo", hex: "#f2d43b" },
  { value: "Green", label: "Verde", hex: "#4cc75a" }, { value: "Cyan", label: "Ciano", hex: "#3fd3e0" }, { value: "Blue", label: "Azul", hex: "#3f74e8" },
  { value: "Purple", label: "Roxo", hex: "#9b5de5" }, { value: "Pink", label: "Rosa", hex: "#ee6fb8" }, { value: "Brown", label: "Marrom", hex: "#9a6a3c" },
  { value: "White", label: "Branco", hex: "#f4f4f4" }, { value: "Grey", label: "Cinza", hex: "#8b8b8b" }
];
const FILTER_ICON_SHAPES = [
  { value: "Circle", label: "Círculo", glyph: "●" }, { value: "Diamond", label: "Losango", glyph: "◆" }, { value: "Hexagon", label: "Hexágono", glyph: "⬢" },
  { value: "Square", label: "Quadrado", glyph: "■" }, { value: "Star", label: "Estrela", glyph: "★" }, { value: "Triangle", label: "Triângulo", glyph: "▲" },
  { value: "Cross", label: "Cruz", glyph: "✚" }, { value: "Moon", label: "Lua", glyph: "☾" }, { value: "Raindrop", label: "Gota", glyph: "💧" },
  { value: "Kite", label: "Pipa", glyph: "⬥" }, { value: "Pentagon", label: "Pentágono", glyph: "⬟" }, { value: "UpsideDownHouse", label: "Casa invertida", glyph: "⯆" }
];
const FILTER_ICON_SIZES = [{ value: 0, label: "Grande" }, { value: 1, label: "Médio" }, { value: 2, label: "Pequeno" }];
const LOOT_HIGHLIGHT_PRESETS = [
  { id: "gold", label: "Dourado", textColor: "#ffd27a", borderColor: "#ffd27a", backgroundColor: "#3a2a0c", effectColor: "Yellow" },
  { id: "red", label: "Vermelho", textColor: "#ffffff", borderColor: "#ffffff", backgroundColor: "#c0201a", effectColor: "Red" },
  { id: "white", label: "Branco", textColor: "#c0201a", borderColor: "#c0201a", backgroundColor: "#f4f4f4", effectColor: "White" },
  { id: "blue", label: "Azul", textColor: "#ffffff", borderColor: "#7fb4ff", backgroundColor: "#1b3f8f", effectColor: "Blue" },
  { id: "green", label: "Verde", textColor: "#d9ffd2", borderColor: "#4cc75a", backgroundColor: "#13401a", effectColor: "Green" },
  { id: "purple", label: "Roxo", textColor: "#f1dcff", borderColor: "#b77cff", backgroundColor: "#3e1c63", effectColor: "Purple" },
  { id: "cyan", label: "Ciano", textColor: "#0d2a2e", borderColor: "#0d2a2e", backgroundColor: "#3fd3e0", effectColor: "Cyan" },
  { id: "pink", label: "Rosa", textColor: "#ffffff", borderColor: "#ffc2e5", backgroundColor: "#a3326f", effectColor: "Pink" },
  { id: "divine", label: "Divino", textColor: "#fff6d8", borderColor: "#ffe08a", backgroundColor: "#b8860b", effectColor: "Yellow", iconShape: "Star" },
  { id: "inferno", label: "Inferno", textColor: "#ffe14d", borderColor: "#ffb000", backgroundColor: "#7a1205", effectColor: "Orange", iconShape: "Triangle" },
  { id: "ice", label: "Gelo", textColor: "#e8fbff", borderColor: "#9fe8ff", backgroundColor: "#1d5f86", effectColor: "Cyan", iconShape: "Diamond" },
  { id: "abyss", label: "Abismo", textColor: "#b6ff6a", borderColor: "#6dff3a", backgroundColor: "#0b0f0a", effectColor: "Green", iconShape: "Moon" },
  { id: "void", label: "Vazio", textColor: "#e2c6ff", borderColor: "#e2c6ff", backgroundColor: "#0a0614", effectColor: "Purple", iconShape: "Hexagon" },
  { id: "blood", label: "Sangue", textColor: "#ff9a9a", borderColor: "#ff3b3b", backgroundColor: "#2a0303", effectColor: "Red", iconShape: "Raindrop" },
  { id: "emerald", label: "Esmeralda", textColor: "#0a2b1a", borderColor: "#0a2b1a", backgroundColor: "#3ddc84", effectColor: "Green", iconShape: "Pentagon" },
  { id: "sunset", label: "Pôr do sol", textColor: "#3a0d2e", borderColor: "#3a0d2e", backgroundColor: "#ff8a5c", effectColor: "Orange", iconShape: "Circle" },
  { id: "royal", label: "Real", textColor: "#ffd27a", borderColor: "#ffd27a", backgroundColor: "#2a1458", effectColor: "Purple", iconShape: "Kite" },
  { id: "obsidian", label: "Obsidiana", textColor: "#ffffff", borderColor: "#ffffff", backgroundColor: "#000000", effectColor: "White", iconShape: "Cross" }
];
const DEFAULT_LOOT_HIGHLIGHT_STYLE = {
  textColor: "#ffd27a", borderColor: "#ffd27a", backgroundColor: "#3a2a0c", backgroundOpacity: 240, fontSize: 40,
  minimapIcon: true, iconSize: 1, iconColor: "Yellow", iconShape: "Star",
  beam: true, beamColor: "Yellow", beamTemporary: false,
  sound: false, soundId: 1, soundVolume: 200
};
// Perfis de destaque gravados pelo usuário: o mesmo visual (cores, ícone, feixe, som e raridades) aplicado em vários itens.
const LOOT_HIGHLIGHT_PROFILES_KEY = "atlas-poe2-loot-highlight-profiles-v1";
const LOOT_HIGHLIGHT_PROFILE_FIELDS = [...Object.keys(DEFAULT_LOOT_HIGHLIGHT_STYLE), "rarities"];
function highlightProfileStyle(entry) { return Object.fromEntries(LOOT_HIGHLIGHT_PROFILE_FIELDS.map(field => [field, entry[field]])); }
function loadHighlightProfiles() {
  try {
    const list = JSON.parse(localStorage.getItem(LOOT_HIGHLIGHT_PROFILES_KEY) || "[]");
    return Array.isArray(list) ? list.filter(profile => profile && profile.name && profile.style).map(profile => ({ name: String(profile.name).slice(0, 40), style: highlightProfileStyle(normalizeHighlightEntry({ ...profile.style, id: "perfil", baseType: "perfil" })) })) : [];
  } catch { return []; }
}
function saveHighlightProfiles(list) {
  try { localStorage.setItem(LOOT_HIGHLIGHT_PROFILES_KEY, JSON.stringify(list)); return true; } catch { return false; }
}
function normalizeHexColor(value, fallback) { return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value).toLowerCase() : fallback; }
function clampInteger(value, min, max, fallback) { const number = Math.round(Number(value)); return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback; }
function normalizeHighlightEntry(item) {
  if (!item || !item.id || !item.baseType || /["\r\n]/.test(String(item.baseType))) return null;
  const defaults = DEFAULT_LOOT_HIGHLIGHT_STYLE;
  const effectColor = (input, fallback) => FILTER_EFFECT_COLORS.some(option => option.value === input) ? input : fallback;
  return {
    id: String(item.id), baseType: String(item.baseType),
    rarities: Array.isArray(item.rarities) ? [...new Set(item.rarities.filter(rarity => LOOT_FILTER_RARITIES.some(option => option.value === rarity)))] : [],
    textColor: normalizeHexColor(item.textColor, defaults.textColor), borderColor: normalizeHexColor(item.borderColor, defaults.borderColor),
    backgroundColor: normalizeHexColor(item.backgroundColor, defaults.backgroundColor), backgroundOpacity: clampInteger(item.backgroundOpacity, 0, 255, defaults.backgroundOpacity),
    fontSize: clampInteger(item.fontSize, 18, 45, defaults.fontSize),
    minimapIcon: item.minimapIcon !== false, iconSize: clampInteger(item.iconSize, 0, 2, defaults.iconSize),
    iconColor: effectColor(item.iconColor, defaults.iconColor), iconShape: FILTER_ICON_SHAPES.some(option => option.value === item.iconShape) ? item.iconShape : defaults.iconShape,
    beam: item.beam !== false, beamColor: effectColor(item.beamColor, defaults.beamColor), beamTemporary: item.beamTemporary === true,
    sound: item.sound === true, soundId: clampInteger(item.soundId, 1, 16, defaults.soundId), soundVolume: clampInteger(item.soundVolume, 0, 300, defaults.soundVolume)
  };
}
// Acessórios e patuás que também podem ser ocultados por classe inteira.
const ACCESSORY_HIDE_CLASSES = ["Amulet", "Ring", "Belt", "UtilityFlask"];
function normalizeLootFilterConfig(value = {}) {
  const level = input => input == null || input === "" || !Number.isFinite(Number(input)) ? null : Math.max(1, Math.min(100, Number(input)));
  const excludedModifiers = Array.isArray(value.excludedModifiers) ? value.excludedModifiers.filter(mod => mod && mod.id && mod.name && String(mod.itemClass || "all") !== "FishingRod").map(mod => ({ id: String(mod.id), name: String(mod.name), type: ["prefix", "suffix"].includes(mod.type) ? mod.type : "", itemClass: String(mod.itemClass || "all"), baseType: String(mod.baseType || "") })) : [];
  return {
    name: String(value.name || ""), text: String(value.text || ""), inGameFile: value.inGameFile === true,
    newFilterDraft: value.newFilterDraft === true, newFilterName: String(value.newFilterName || ""),
    hiddenBaseItems: Array.isArray(value.hiddenBaseItems) ? value.hiddenBaseItems.reduce((entries, item) => {
      if (!item || !item.id || !item.baseType) return entries;
      const rarities = Array.isArray(item.rarities) ? item.rarities.filter(rarity => LOOT_FILTER_RARITIES.some(option => option.value === rarity)) : [];
      const hideableRarities = rarities.filter(rarity => !ALWAYS_VISIBLE_LOOT_RARITIES.has(rarity));
      if (rarities.length && !hideableRarities.length) return entries;
      entries.push({ id: String(item.id), baseType: String(item.baseType), rarities: hideableRarities });
      return entries;
    }, []) : [],
    hiddenClassRarities: Array.isArray(value.hiddenClassRarities) ? value.hiddenClassRarities.reduce((entries, item) => {
      if (!item || !item.itemClass || ![...WEAPON_ITEM_CLASSES, ...OFFHAND_ITEM_CLASSES, ...ACCESSORY_HIDE_CLASSES].includes(item.itemClass)) return entries;
      const rarities = Array.isArray(item.rarities) ? [...new Set(item.rarities.filter(rarity => HIDEABLE_LOOT_RARITIES.some(option => option.value === rarity)))] : [];
      if (rarities.length) entries.push({ itemClass: String(item.itemClass), rarities });
      return entries;
    }, []) : [],
    hiddenEquipmentProfiles: Array.isArray(value.hiddenEquipmentProfiles) ? value.hiddenEquipmentProfiles.reduce((entries, item) => {
      if (!item) return entries;
      const defenses = [...new Set((Array.isArray(item.defenses) ? item.defenses : []).filter(defense => FILTER_DEFENSES.includes(defense)))].sort((a, b) => FILTER_DEFENSES.indexOf(a) - FILTER_DEFENSES.indexOf(b));
      const rarities = [...new Set((Array.isArray(item.rarities) ? item.rarities : []).filter(rarity => HIDEABLE_LOOT_RARITIES.some(option => option.value === rarity)))];
      if (!defenses.length || !rarities.length) return entries;
      entries.push({ itemClass: String(item.itemClass || "all"), defenses, rarities });
      return entries;
    }, []) : [],
    hiddenRarities: Array.isArray(value.hiddenRarities) ? value.hiddenRarities.filter(rarity => LOOT_FILTER_RARITIES.some(option => option.value === rarity) && !ALWAYS_VISIBLE_LOOT_RARITIES.has(rarity)) : [],
    filterClass: String(value.filterClass || "all"), filterBaseId: String(value.filterBaseId || "all"),
    requiredDefenses: Array.isArray(value.requiredDefenses) ? [...new Set(value.requiredDefenses.filter(defense => FILTER_DEFENSES.includes(defense)))] : [],
    minDropLevel: level(value.minDropLevel), maxDropLevel: level(value.maxDropLevel), excludedModifiers,
    minShowTier: [2, 3, 4, 5].includes(Number(value.minShowTier)) ? Number(value.minShowTier) : null,
    highlightedItems: Array.isArray(value.highlightedItems) ? value.highlightedItems.map(normalizeHighlightEntry).filter(Boolean) : []
  };
}
function loadSavedLootFilter() {
  try {
    const value = JSON.parse(localStorage.getItem(LOOT_FILTER_STORAGE_KEY) || "null");
    return normalizeLootFilterConfig(value && typeof value === "object" ? value : {});
  } catch { return normalizeLootFilterConfig(); }
}
function loadSavedFavorites() {
  try { const value = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]"); return Array.isArray(value) ? [...new Set(value.map(String))] : []; }
  catch { return []; }
}
const state = { data: null, status: null, catalog: [], catalogMode: "equipment", itemsClassFilter: "all", weaponsClassFilter: "all", category: "all", classFilter: "all", defenseFilter: "all", sortOrder: "item_level_asc", search: "", shown: 60, activeModFilter: "all", activeModSearch: "", filterModifierSearch: "", filterModifierType: "all", hideChecks: { equipDefense: new Set(), weaponClass: new Set(), accessoryClass: new Set() }, lootFilter: loadSavedLootFilter(), favorites: loadSavedFavorites() };
const byId = id => document.getElementById(id);
const htmlEscape = value => String(value == null ? "" : value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
function favoriteKey(item) { return String(item.kind) + "|" + String(item.id); }
function isFavorite(item) { return state.favorites.includes(favoriteKey(item)); }
function isEquipmentFavorite(item) { return item.kind === "gear" || item.kind === "unique" && classify({ ...item, item_class: item.item_class }) === "gear"; }
function saveFavorites() { try { localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state.favorites)); } catch { showToast("Não foi possível salvar os favoritos neste navegador."); } }
function toggleFavorite(item) {
  const key = favoriteKey(item);
  state.favorites = isFavorite(item) ? state.favorites.filter(value => value !== key) : [...state.favorites, key];
  saveFavorites(); renderCatalog();
  showToast(isFavorite(item) ? "Adicionado aos favoritos da Wiki." : "Removido dos favoritos da Wiki.");
}
const numberFormat = value => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(value);
const dateFormat = value => { if (!value) return "—"; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }); };
function showToast(message) { const el = byId("toast"); el.textContent = message; el.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => el.classList.remove("show"), 3300); }
function sourceText(text) {
  return String(text || "")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[([^\]|]+)\|([^\]]+)\]/g, "$2")
    .replace(/\[([^\]]+)\]/g, "$1")
    .replace(/\s+/g, " ").trim();
}
function decodeWikiText(value) {
  let text = String(value || "");
  text = text.replace(/&lt;br\s*\/?&gt;/gi, "\n").replace(/<br\s*\/?\s*>/gi, "\n");
  // Separadores da wiki (<span class=&quot;...&quot;>) têm &quot; dentro, que o padrão seguinte não pega.
  text = text.replace(/&lt;\/?span\b[\s\S]*?&gt;/gi, "\n");
  text = text.replace(/&lt;[^&]*?&gt;/g, "").replace(/<[^>]*>/g, "");
  text = text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0*39;/g, "'").replace(/&#x0*27;/gi, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  text = text.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([^\]]+)\]\]/g, "$1");
  text = text.replace(/\[([^\]|]+)\|([^\]]+)\]/g, "$2");
  return text.split("\n").map(line => line.trim()).filter(Boolean).join("\n");
}
// Chamada milhares de vezes por clique (compara\u00e7\u00f5es do filtro com o cat\u00e1logo); o resultado de cada texto fica em cache.
const ITEM_KEY_CACHE = new Map();
function normalizeItemKey(value) {
  const text = String(value || "");
  let key = ITEM_KEY_CACHE.get(text);
  if (key === undefined) {
    key = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en-US").replace(/[^a-z0-9]/g, "");
    if (ITEM_KEY_CACHE.size > 50000) ITEM_KEY_CACHE.clear();
    ITEM_KEY_CACHE.set(text, key);
  }
  return key;
}
function isHiddenCatalogItemClass(value) {
  const key = normalizeItemKey(value);
  return HIDDEN_CATALOG_ITEM_CLASSES.has(key) || key.startsWith("uncut") || key === "vaultkey";
}
function itemTranslation(name) { return state.data && state.data.pt_items && state.data.pt_items[normalizeItemKey(name)] || null; }
function imageUrlFor(source) {
  const visual = source && (source.visual_identity || source.base_item && source.base_item.visual_identity);
  const path = visual && visual.dds_file;
  if (!path) return "";
  const webPath = path.replace(/\\/g, "/").replace(/\.dds$/i, ".webp");
  if (["Currency", "StackableCurrency"].includes(source.item_class || source.base_item && source.base_item.item_class) && /orb/i.test(source.name || source.base_item && source.base_item.name || "")) {
    return "/assets/poe2db/" + webPath;
  }
  return "https://cdn.poe2db.tw/image/" + webPath;
}
const ITEM_CLASS_LABELS = {
  "Active Skill Gem": "Gema de habilidade ativa", "Support Skill Gem": "Gema de suporte", "Meta Skill Gem": "Gema meta",
  Amulet: "Amuleto", Belt: "Cinto", "Body Armour": "Peitoral", Boots: "Botas", Bow: "Arcos", Buckler: "Broquel",
  Claw: "Garras", Crossbow: "Bestas", Currency: "Orbes", Dagger: "Adagas", Flail: "Mangual", Focus: "Foco",
  Gloves: "Luvas", Helmet: "Elmo", Jewel: "Joia", LifeFlask: "Poções de vida", ManaFlask: "Poções de mana",
  "One Hand Axe": "Machado de uma mão", "One Hand Mace": "Maça de uma mão", "One Hand Sword": "Espada de uma mão",
  Quiver: "Aljava", Relic: "Relíquia", Ring: "Anel", Sceptre: "Cetro", Shield: "Escudo", Spear: "Lanças",
  Staff: "Cajado", StackableCurrency: "Orbes", Talisman: "Talismã", FishingRod: "Vara de pesca", "Two Hand Axe": "Machado de duas mãos",
  "Two Hand Mace": "Maça de duas mãos", "Two Hand Sword": "Espada de duas mãos", UtilityFlask: "Patuás",
  Wand: "Varinhas", Warstaff: "Bastão de guerra", TrapTool: "Armadilha", SoulCore: "Runas", Omen: "Presságios", UncutSupportGemStackable: "Gemas de reforço brutas", UncutSkillGemStackable: "Gemas de habilidade brutas", UncutReservationGemStackable: "Gemas de espírito brutas", Map: "Pedras-guia", MiscMapItem: "Item de mapa genérico", ItemisedSanctum: "Item de mapa genérico",
  MapFragment: "Fragmentos de mapa", VaultKey: "Chaves de Relicário", Breachstone: "Pedra de Fenda", AtlasCurrency: "Fragmentos do Atlas", PinnacleKeyStackable: "Fragmentos de chefe",
  TowerAugmentation: "Tábuas", BrequelFruit: "Dádivas do Ventre", ExpeditionLogbook: "Diário da Expedição", Expedition2Logbooks: "Diário da Expedição", IncubatorStackable: "Incursão"
};
// Base do único (no catálogo ou no CDN), usada quando o ícone do próprio único não existe.
function baseImageUrl(base) { return base && (itemImageOverride(base.name) || imageUrlFor(base) || itemTranslation(base.name)?.image) || ""; }
function itemImageFallbackAttrs(item) {
  if (!item.fallbackImage || item.fallbackImage === item.image) return "";
  return ' data-fallback="' + htmlEscape(item.fallbackImage) + '" onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.removeAttribute(\'data-fallback\');}"';
}
// Em inglês (bandeira dos EUA) a classe aparece com o nome do jogo; só as internas ganham um nome legível.
const ITEM_CLASS_LABELS_EN = { StackableCurrency: "Currency", UtilityFlask: "Charms", LifeFlask: "Life Flasks", ManaFlask: "Mana Flasks", SoulCore: "Runes", Map: "Waystones", TowerAugmentation: "Tablets", MiscMapItem: "Map Item", ItemisedSanctum: "Map Item", PinnacleKeyStackable: "Boss Fragments", AtlasCurrency: "Atlas Fragments", IncubatorStackable: "Incursion", UncutSkillGemStackable: "Uncut Skill Gems", UncutSupportGemStackable: "Uncut Support Gems", UncutReservationGemStackable: "Uncut Spirit Gems", BrequelFruit: "Wombgifts", TrapTool: "Trap" };
function itemClassLabel(value) {
  const readable = String(value || "Item").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ");
  if (typeof state !== "undefined" && state.nameLang === "en") return ITEM_CLASS_LABELS_EN[value] || readable;
  return ITEM_CLASS_LABELS[value] || readable;
}
const TAG_LABELS = { weapon: "arma", bow: "arco", crossbow: "besta", armour: "armadura", str_dex_armour: "armadura + evasão", str_int_armour: "armadura + escudo de energia", dex_int_armour: "evasão + escudo de energia", str_dex_int_armour: "armadura + evasão + escudo de energia", body_armour: "peitoral", helmet: "elmo", gloves: "luvas", boots: "botas", shield: "escudo", quiver: "aljava", ring: "anel", amulet: "amuleto", belt: "cinto", wand: "varinha", staff: "cajado", currency: "moeda", gem: "gema", life_flask: "poção de vida", mana_flask: "poção de mana", utility_flask: "patuá", flask: "frasco", ultimatum_trial: "provação do caos", sanctum_key: "provação das sekhemas", not_for_sale: "não vendável", default: "geral" };
function tagLabel(tag) {
  if (typeof state !== "undefined" && state.nameLang === "en") return String(tag || "").replace(/_/g, " ");
  return TAG_LABELS[tag] || String(tag || "").replace(/_/g, " ");
}
function classify(item, unique = false, gem = false) {
  if (unique) return "unique";
  if (gem) return "gem";
  const cls = String(item.item_class || "").toLowerCase();
  const tags = item.tags || [];
  if (cls.includes("gem") || tags.includes("skill_gem") || tags.includes("support_gem")) return "gem";
  if (cls.includes("currency") || tags.includes("currency")) return "currency";
  if (tags.some(tag => ["weapon", "armour", "armour_evasion", "armour_energy_shield", "evasion", "shield", "quiver"].includes(tag)) || /weapon|armour|shield|quiver|body|helmet|gloves|boots|bow|mace|staff|sceptre|crossbow|spear|flail|talisman|focus|ring|amulet|belt|charm|flask/i.test(cls)) return "gear";
  return "other";
}
function isEquippableBaseItem(item) {
  const itemClass = String(item.item_class || "");
  if (["LifeFlask", "ManaFlask", "UtilityFlask"].includes(itemClass)) return false;
  if (itemClass === "HiddenItem" || itemClass.startsWith("HeistEquipment")) return false;
  return classify(item) === "gear" || ["Jewel", "Relic", "SanctumSpecialRelic", "TrapTool"].includes(item.item_class);
}
// Moedas sem "Orb" no nome que também entram no catálogo de itens.
const EXTRA_CATALOG_CURRENCIES = new Set(["Gemcutter's Prism", "Blacksmith's Whetstone", "Armourer's Scrap", "Regal Shard", "Verisium",
  "Mirror of Kalandra", "Mirror Shard", "Hinekora's Lock", "Ancient Infuser", "Core Destabiliser", "Crystallised Corruption", "Cryptic Key", "Artificer's Shard", "Chance Shard", "Scroll of Wisdom"]);
// Demais itens que caem no chão (fragmentos, núcleos d'alma, tábuas, dádivas do ventre...): entram como "Outros" se tiverem ficha em português.
const EXTRA_CATALOG_CLASSES = new Set(["VaultKey", "MapFragment", "SoulCore", "Breachstone", "AtlasCurrency", "PinnacleKeyStackable", "TowerAugmentation", "BrequelFruit", "ExpeditionLogbook", "Expedition2Logbooks", "Omen", "IncubatorStackable"]);
// Chaves de Relicário do PoE 2 (VaultKeyBreach...); as Uber*/Classic são do PoE 1 e continuam fora.
function isPoe2ReliquaryKey(id) { return /\/MapFragments\/VaultKey[A-Z]/.test(String(id || "")); }
// Gemas de linhagem (Abraço de Uul-Netol...) são itens de mercado: entram no catálogo de itens.
function lineageGemData(id) { const gem = state.data && state.data.skill_gems && state.data.skill_gems[id]; return gem && gem.is_lineage ? gem : null; }
// Runas ficam na classe SoulCore junto de núcleos de alma, ídolos e legados.
// Outros encaixáveis da mesma classe que entram junto com as runas.
const EXTRA_CATALOG_SOCKETABLES = new Set(["Cat Idol"]);
function isRuneBase(item) { return item.item_class === "SoulCore" && (EXTRA_CATALOG_SOCKETABLES.has(String(item.name || "")) || /\bRune\b/.test(String(item.name || "")) && !/^Legacy of /i.test(String(item.name || ""))); }
// A classe Omen também tem as Sagas da Expedição; só os presságios entram no catálogo.
// Gemas brutas que caem no chão: entram no catálogo com o nome do jogo em português.
const UNCUT_GEM_CLASSES = {
  UncutSkillGemStackable: { name: "Gema de Habilidade Bruta", directions: "Clique com o botão direito para escolher e gravar uma gema de habilidade." },
  UncutReservationGemStackable: { name: "Gema de Espírito Bruta", directions: "Clique com o botão direito para escolher e gravar uma gema de espírito." },
  UncutSupportGemStackable: { name: "Gema de Reforço Bruta", directions: "Clique com o botão direito para gravar uma gema de reforço." }
};
function uncutGemName(base) { const info = UNCUT_GEM_CLASSES[base.item_class]; const level = (String(base.name || "").match(/Level (\d+)/) || [])[1]; return info ? info.name + (level ? " (Nível " + level + ")" : "") : ""; }
// No filtro do jogo cada nível de gema bruta é uma base própria: "Uncut Support Gem (Level 5)".
// (O ItemLevel não é o nível da gema; regras antigas com ItemLevel são convertidas ao gerar o filtro.)
function uncutGemLevel(id) { const match = String(id || "").match(/GemUncut(\d+)$/); return match ? Number(match[1]) : null; }
function uncutFilterBaseType(entry) { return String(entry.baseType || "").replace(/ \(Level \d+\)$/, "") + " (Level " + uncutGemLevel(entry.id) + ")"; }
// Entrada do filtro (ocultar/destacar) e item do catálogo são a mesma base? Gemas brutas comparam pelo ID, porque cada nível é uma regra.
function isUniqueCatalogId(id) { return String(id || "").startsWith("Unique/"); }
function sameFilterBase(entry, item) {
  // Únicos compartilham a base com o item comum (Tremor de Taryn é um Cajado Gélido): cada um tem a própria entrada.
  if (uncutGemLevel(entry.id) || uncutGemLevel(item.id) || isUniqueCatalogId(entry.id) || isUniqueCatalogId(item.id)) return entry.id === String(item.id);
  return entry.id === String(item.id) || normalizeItemKey(entry.baseType) === filterBaseKey(item);
}
// Chave de base do item no filtro, guardada no próprio item do catálogo.
function filterBaseKey(item) {
  if (item._filterBaseKey === undefined) item._filterBaseKey = normalizeItemKey(filterBaseTypeForItem(item));
  return item._filterBaseKey;
}
// Índice do catálogo para achar o item de uma entrada do filtro sem varrer a lista inteira.
let filterCatalogIndex = null;
function catalogItemForFilterEntry(entry) {
  if (!filterCatalogIndex || filterCatalogIndex.catalog !== state.catalog) {
    const byId = new Map();
    const byBase = new Map();
    for (const item of state.catalog) {
      if (!byId.has(String(item.id))) byId.set(String(item.id), item);
      if (!uncutGemLevel(item.id) && !byBase.has(filterBaseKey(item))) byBase.set(filterBaseKey(item), item);
    }
    filterCatalogIndex = { catalog: state.catalog, byId, byBase };
  }
  return filterCatalogIndex.byId.get(String(entry.id)) || (uncutGemLevel(entry.id) ? null : filterCatalogIndex.byBase.get(normalizeItemKey(entry.baseType))) || null;
}
// Ossos do Abismo (Clavícula, Costelas, Mandíbula, Crânio, Vértebra): o ID interno é AbyssalBenchTicket*.
function isAbyssBoneId(id) { return /\/AbyssalBenchTicket/.test(String(id || "")); }
// Pedras-guia: no filtro do jogo cada tier é uma base própria ("Waystone (Tier 15)"), então ocultar/destacar funciona por tier.
function waystoneTier(item) { const match = item.item_class === "Map" && String(item.name || "").match(/^Waystone \(Tier (\d+)\)$/); return match ? Number(match[1]) : null; }
function isEssenceBase(item) { return item.item_class === "StackableCurrency" && (item.tags || []).includes("essence"); }
function isOmenBase(item) { return item.item_class === "Omen" && /^Omen of /.test(String(item.name || "")); }
// Textos em português (efeitos, vinculado, descrição) baixados por tools/gerar-runas.mjs.
function itemTextData(item, kind) { const source = state.data && state.data[({ omen: "pt_omens", essence: "pt_essences", abyss: "pt_abyss" })[kind] || "pt_runes"]; return source && source[item.id] || null; }
// Itens de provação: Ultimato Inscrito (Provação do Caos) e os Baryas (Provação das Sekhemas: Djinn e os de cada andar).
function isTrialItemBase(item) {
  const tags = item.tags || [];
  return item.item_class === "MiscMapItem" && tags.includes("ultimatum_trial") || item.item_class === "ItemisedSanctum";
}
function catalogGroupForBaseItem(item, id) {
  if (isAbyssBoneId(id) || waystoneTier(item) || isTrialItemBase(item)) return "items";
  const itemClass = String(item.item_class || "");
  if (["LifeFlask", "ManaFlask", "UtilityFlask"].includes(itemClass)) return "items";
  if (isRuneBase(item) || isOmenBase(item) || isEssenceBase(item) || UNCUT_GEM_CLASSES[itemClass]) return "items";
  // Moedas de qualidade (Gravador do Arcanista, infusores Vaal...) entram todas; as que não existem no PoE 2 caem em existsInGame.
  const isQualityCurrency = (item.tags || []).includes("quality_currency");
  if (["Currency", "StackableCurrency"].includes(itemClass) && (/\borb\b/i.test(String(item.name || "")) || EXTRA_CATALOG_CURRENCIES.has(String(item.name || "")) || isQualityCurrency)) return "items";
  // Demais moedas e itens de liga: os que não existem no PoE 2 (sem ficha em português) caem em existsInGame.
  if (["Currency", "StackableCurrency"].includes(itemClass) || EXTRA_CATALOG_CLASSES.has(itemClass)) return "items";
  if (WEAPON_ITEM_CLASSES.has(itemClass) || OFFHAND_ITEM_CLASSES.has(itemClass)) return "weapons";
  return isEquippableBaseItem(item) ? "equipment" : "";
}
function isRuneforgedEquipment(item, kind, translatedName = "") {
  const itemClass = item.item_class || item.base_item && item.base_item.item_class;
  const isEquipment = kind === "gear" || kind === "unique" && classify({ ...item, item_class: itemClass }) === "gear";
  const baseName = item.base_item && item.base_item.name;
  const baseTranslation = baseName && itemTranslation(baseName);
  const hasRuneforgedTag = (item.tags || []).some(tag => /runeforged/i.test(String(tag)));
  return isEquipment && (hasRuneforgedTag || /runeforged|runemastered|runiforjad[oa]s?|runimor/i.test([item.name, item.id, baseName, translatedName, baseTranslation && baseTranslation.name].filter(Boolean).join(" ")));
}
function categoryLabel(category) { return ({ all: "Todos", gear: "Equipamentos", unique: "Únicos", currency: "Orbes", potion: "Poções", charm: "Patuás", rune: "Runas", omen: "Presságios", essence: "Essências", abyss: "Ossos do Abismo", waystone: "Pedras-guia", trial: "Provações", tablet: "Tábuas", uncut: "Gemas brutas", gem: "Gemas", other: "Outros" })[category] || category; }
function catalogCategoryLabel(category) {
  if (state.catalogMode === "equipment") return "Equipamentos";
  if (state.catalogMode === "weapons") return "Armas";
  return ({ all: "Todos os itens", currency: "Orbes", potion: "Poções", charm: "Patuás", rune: "Runas", omen: "Presságios", essence: "Essências", abyss: "Ossos do Abismo", waystone: "Pedras-guia", trial: "Provações", tablet: "Tábuas", uncut: "Gemas brutas", gem: "Gemas de linhagem" })[category] || categoryLabel(category);
}
function itemCategoryName(category, item) {
  if (category === "currency") return item && !/\borb\b/i.test(String(item.englishName || item.name || "")) ? "Moeda" : "Orbe";
  if (category === "charm") return "Patuá";
  if (category === "omen") return "Presságio";
  if (category === "essence") return "Essência";
  if (category === "abyss") return "Osso do Abismo";
  if (category === "waystone") return "Pedra-guia";
  if (category === "trial") return "Provação";
  if (category === "uncut") return "Gema bruta";
  if (category === "rune") return item && /\bIdol\b/.test(String(item.englishName || "")) ? "Ídolo" : "Runa";
  if (category === "potion") return item && item.item_class === "ManaFlask" ? "Poção de mana" : "Poção de vida";
  return ({ gear: "Equipamento base", unique: "Único", gem: "Gema", other: "Item" })[category] || "Item";
}
// A exportação traz itens internos ([DNT]), antigos, não lançados e moedas
// herdadas do PoE 1. Moedas sem ficha no PoE2DB não existem no PoE 2.
function existsInGame(base, englishName, translation) {
  if (/^\[DNT/i.test(englishName)) return false;
  if (["legacy", "unreleased"].includes(base.release_state)) return false;
  const hasTranslations = state.data.pt_items && Object.keys(state.data.pt_items).length > 0;
  if (hasTranslations && !translation && (["Currency", "StackableCurrency"].includes(base.item_class) || EXTRA_CATALOG_CLASSES.has(base.item_class))) return false;
  return true;
}
function buildCatalog() {
  if (!state.data) return;
  const map = new Map();
  const bases = state.data.base_items || {};
  for (const [id, base] of Object.entries(bases)) {
    if (isHiddenCatalogItemClass(base.item_class) && !UNCUT_GEM_CLASSES[base.item_class] && !isPoe2ReliquaryKey(id)) continue;
    // A gema bruta da missão repete a de Nível 1 sem nível no ID.
    if (UNCUT_GEM_CLASSES[base.item_class] && !uncutGemLevel(id)) continue;
    const lineageGem = lineageGemData(id);
    const group = lineageGem ? "items" : catalogGroupForBaseItem(base, id);
    if (!group) continue;
    const englishName = base.name || id.split("/").pop();
    const translation = itemTranslation(englishName);
    if (!existsInGame(base, englishName, translation)) continue;
    const kind = lineageGem ? "gem" : ["equipment", "weapons"].includes(group) ? "gear" : isRuneBase(base) ? "rune" : isOmenBase(base) ? "omen" : isEssenceBase(base) ? "essence" : isAbyssBoneId(id) ? "abyss" : waystoneTier(base) ? "waystone" : isTrialItemBase(base) ? "trial" : base.item_class === "TowerAugmentation" ? "tablet" : UNCUT_GEM_CLASSES[base.item_class] ? "uncut" : ["Currency", "StackableCurrency"].includes(base.item_class) ? "currency" : base.item_class === "UtilityFlask" ? "charm" : EXTRA_CATALOG_CLASSES.has(base.item_class) ? "other" : "potion";
    if (["equipment", "weapons"].includes(group) && isRuneforgedEquipment({ ...base, id }, kind, translation && translation.name)) continue;
    const item = { id, name: ITEM_NAME_OVERRIDES[englishName] || translation && translation.name || uncutGemName(base) || (waystoneTier(base) ? "Pedra-guia (Nível " + waystoneTier(base) + ")" : "") || englishName, englishName, translation, image: itemImageOverride(englishName) || translation && translation.image || imageUrlFor(base), item_class: base.item_class || "Item", tags: base.tags || [], kind, catalogGroup: group, release_state: base.release_state || "", source: base, gemData: lineageGem };
    // Distinct English bases can share the same Portuguese display name
    // (for example, Chain Mail and Ring Mail both translate to Cota de Malha).
    // Keep each base by its stable game ID instead of overwriting by label.
    if (["rune", "omen", "essence", "abyss"].includes(kind)) {
      item.itemText = itemTextData(item, kind);
      if (item.itemText && item.itemText.level) item.source = { ...base, requirements: { level: item.itemText.level } };
    }
    const key = item.kind + "|" + id;
    map.set(key, item);
  }
  // Únicos de armas e equipamentos: a exportação não traz a base, então ela vem
  // da wiki comunitária ("base item"). No filtro, o único é a base com Rarity Unique.
  const basesByName = new Map();
  for (const [id, base] of Object.entries(bases)) if (base.name && !basesByName.has(base.name)) basesByName.set(base.name, { id, base });
  const wikiMap = getWikiUniqueMap();
  const exportedUniques = Array.isArray(state.data.uniques) ? state.data.uniques : Object.values(state.data.uniques || {});
  // A exportação do jogo não traz alguns únicos novos (Redbeak, tábuas, relíquias...): eles vêm só da wiki comunitária.
  const exportedNames = new Set(exportedUniques.filter(unique => unique && unique.name).map(unique => unique.name.toLocaleLowerCase()));
  const wikiOnly = [...wikiMap.values()].filter(wiki => wiki && wiki.name && !exportedNames.has(decodeWikiText(wiki.name).toLocaleLowerCase()))
    .map(wiki => ({ id: decodeWikiText(wiki.name), name: decodeWikiText(wiki.name) }));
  for (const unique of [...exportedUniques, ...wikiOnly]) {
    if (!unique || !unique.name || unique.is_alternate_art) continue;
    const wiki = wikiMap.get(unique.name.toLocaleLowerCase());
    const found = wiki && basesByName.get(wiki["base item"]);
    if (!found) continue;
    const group = catalogGroupForBaseItem(found.base, found.id);
    // Frascos, patuás e tábuas únicos ficam na aba Itens; armas e equipamentos nas abas deles.
    if (!["equipment", "weapons", "items"].includes(group)) continue;
    const id = "Unique/" + unique.id;
    const translation = itemTranslation(unique.name);
    map.set("unique|" + id, { id, name: translation && translation.name || unique.name, englishName: unique.name, translation, image: itemImageOverride(unique.name) || imageUrlFor(unique) || translation && translation.image || imageUrlFor(found.base), fallbackImage: baseImageUrl(found.base), item_class: found.base.item_class || "Item", tags: found.base.tags || [], kind: "unique", catalogGroup: group, release_state: found.base.release_state === "unique_only" ? "released" : found.base.release_state || "", source: { base_item: found.base, requirements: found.base.requirements }, gemData: null });
  }
  state.catalog = [...map.values()];
  if (state.lootFilter.filterClass !== "all" && isHiddenCatalogItemClass(state.lootFilter.filterClass)) {
    state.lootFilter.filterClass = "all";
    state.lootFilter.filterBaseId = "all";
    saveLootFilter();
  }
}
function changePage(page, catalogMode) {
  if (page === "wiki" && catalogMode && catalogMode !== state.catalogMode) {
    state.catalogMode = catalogMode;
    state.category = "all";
    state.search = "";
    state.shown = 60;
    const search = byId("search-input");
    if (search) search.value = "";
  }
  document.querySelectorAll(".page").forEach(el => el.classList.toggle("active", el.id === "page-" + page));
  document.querySelectorAll(".nav-link").forEach(el => el.classList.toggle("active", el.dataset.page === page && (page !== "wiki" || (el.dataset.catalogMode || "equipment") === state.catalogMode)));
  if (page === "wiki") renderCatalog();
  if (page === "filter") renderLootFilterPanel();
  if (page === "market" && window.onMarketPage) window.onMarketPage();
  if (page === "planner" && window.onPlannerPage) window.onPlannerPage();
  if (page === "vault" && window.onVaultPage) window.onVaultPage();
  if (page === "gems" && window.onGemsPage) window.onGemsPage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function bindNavigation() {
  document.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => changePage(button.dataset.page, button.dataset.catalogMode)));
  document.querySelectorAll("[data-name-lang]").forEach(button => button.addEventListener("click", () => setNameLang(button.dataset.nameLang)));
  setNameLang(loadNameLang());
}
function updateWikiModePresentation() {
  const equipment = state.catalogMode === "equipment";
  const weapons = state.catalogMode === "weapons";
  const title = byId("wiki-mode-title");
  const description = byId("wiki-mode-description");
  if (title) title.textContent = equipment ? "equipamentos" : weapons ? "armas" : "itens";
  if (description) description.textContent = equipment
    ? "Consulte armaduras, acessórios e demais equipamentos do jogo."
    : weapons
      ? "Explore todas as armas e opções de mão secundária, com imagens, níveis e informações do jogo."
      : "Explore orbes, poções, patuás e runas com imagens, níveis e informações do jogo.";
  const lootTools = byId("wiki-loot-filter-tools");
  if (lootTools) lootTools.style.display = "";
  const defenseFilter = document.querySelector(".defense-type-filter");
  if (defenseFilter) defenseFilter.style.display = equipment ? "" : "none";
  const filterToggle = byId("filter-toggle");
  if (filterToggle) filterToggle.style.display = "none";
}
function updateHome() {
  const status = state.status || {};
  const sync = status.sync || {};
  const counts = sync.counts || {};
  byId("home-base-count").textContent = counts.baseItems ? numberFormat(counts.baseItems) : "—";
  byId("home-mod-count").textContent = counts.modifiers ? numberFormat(counts.modifiers) : "—";
  byId("home-unique-count").textContent = counts.uniques ? numberFormat(counts.uniques) : "—";
  byId("home-gem-count").textContent = counts.gems ? numberFormat(counts.gems) : "—";
  byId("localized-item-count").textContent = counts.portugueseItems ? numberFormat(counts.portugueseItems) : "—";
  byId("source-version").textContent = sync.sourceVersion || "—";
  byId("sync-date").textContent = sync.syncedAt ? dateFormat(sync.syncedAt) : "Aguardando dados";
  const game = status.game || {};
  byId("game-state").textContent = game.found ? "Detectado" : "Não localizado";
  byId("game-path").textContent = game.found ? game.path + (game.bundlesUpdated ? " · Bundles2 alterado em " + dateFormat(game.bundlesUpdated) : "") : "Informe a pasta do jogo abaixo para associar a instalação local.";
  const connection = byId("connection-dot");
  connection.classList.toggle("online", !!status.hasData);
  byId("connection-label").textContent = status.hasData ? "Biblioteca local" : "Sem dados locais";
  const warnings = (sync.warnings || []).slice();
  if (sync.sourceUpdated) warnings.push("Exportação do RePoE publicada em " + dateFormat(sync.sourceUpdated) + ".");
  const warningBox = byId("source-warning");
  warningBox.hidden = warnings.length === 0;
  warningBox.textContent = warnings.join(" ");
}
function getWikiUniqueMap() {
  const map = new Map();
  // A wiki manda nomes com entidades HTML ("Kaom&#039;s Heart").
  for (const row of (state.data && state.data.wiki_unique_items) || []) if (row.name) map.set(decodeWikiText(row.name).toLocaleLowerCase(), { ...row, "base item": decodeWikiText(row["base item"]) });
  return map;
}
function catalogModeItems() {
  const group = state.catalogMode === "equipment" ? "equipment" : state.catalogMode === "weapons" ? "weapons" : "items";
  return state.catalog.filter(item => item.catalogGroup === group);
}
function selectedCatalogClass() { return state.catalogMode === "equipment" ? state.lootFilter.filterClass : state.catalogMode === "weapons" ? state.weaponsClassFilter : state.itemsClassFilter; }
function categoryCounts() {
  const items = catalogModeItems();
  const counts = { all: items.length, gear: 0, currency: 0, potion: 0, charm: 0 };
  for (const item of items) counts[item.kind] = (counts[item.kind] || 0) + 1;
  return counts;
}
function selectCatalogClass(itemClass) {
  if (state.catalogMode === "equipment") {
    setLootFilterClass(itemClass);
    saveLootFilter();
    renderLootFilterPanel();
  } else if (state.catalogMode === "weapons") state.weaponsClassFilter = itemClass;
  else state.itemsClassFilter = itemClass;
  state.shown = 60;
  renderCatalog();
}
function renderCategories() {
  const rail = byId("category-rail");
  if (state.catalogMode === "equipment" || state.catalogMode === "weapons") {
    const classCounts = new Map();
    for (const item of catalogModeItems()) classCounts.set(item.item_class, (classCounts.get(item.item_class) || 0) + 1);
    const classes = [...classCounts.keys()].sort((a, b) => itemClassLabel(a).localeCompare(itemClassLabel(b), "pt-BR"));
    const selected = selectedCatalogClass();
    const allLabel = state.catalogMode === "equipment" ? "Todos" : "Todas as armas";
    const options = [["all", allLabel, catalogModeItems().length], ...classes.map(itemClass => [itemClass, itemClassLabel(itemClass), classCounts.get(itemClass)])].map(([value, label, count]) => {
      const active = selected === value;
      return '<button class="category-button ' + (active ? "active" : "") + '" data-class-category="' + htmlEscape(value) + '" aria-pressed="' + active + '"><span>' + htmlEscape(label) + '</span><span class="category-count">' + numberFormat(count) + '</span></button>';
    }).join("");
    rail.innerHTML = '<div class="rail-label">CATEGORIAS</div>' + options;
    rail.querySelectorAll("[data-class-category]").forEach(button => button.addEventListener("click", () => selectCatalogClass(button.dataset.classCategory)));
    return;
  }
  const counts = categoryCounts();
  const categories = ["all", "unique", "currency", "potion", "charm", "rune", "omen", "essence", "abyss", "waystone", "trial", "tablet", "uncut", "gem", "other"].filter(category => category === "all" || counts[category] > 0);
  if (!categories.includes(state.category)) state.category = "all";
  const options = categories.map(category => '<button class="category-button ' + (state.category === category ? "active" : "") + '" data-category="' + category + '"><span>' + htmlEscape(catalogCategoryLabel(category)) + '</span><span class="category-count">' + numberFormat(counts[category] || 0) + '</span></button>').join("");
  rail.innerHTML = '<div class="rail-label">CATEGORIAS</div>' + options;
  rail.querySelectorAll("[data-category]").forEach(button => button.addEventListener("click", () => { state.category = button.dataset.category; state.shown = 60; renderCatalog(); }));
}
function renderClassFilter() {
  const select = byId("item-class-filter");
  if (!select) return;
  const scopedItems = catalogModeItems().filter(item => state.category === "all" || item.kind === state.category);
  const classes = [...new Set(scopedItems.map(item => item.item_class).filter(Boolean))]
    .sort((a, b) => itemClassLabel(a).localeCompare(itemClassLabel(b), "pt-BR"));
  const selected = selectedCatalogClass();
  if (selected !== "all" && !classes.includes(selected)) {
    if (state.catalogMode === "equipment") {
      state.lootFilter.filterClass = "all";
      state.lootFilter.filterBaseId = "all";
      saveLootFilter();
    } else if (state.catalogMode === "weapons") state.weaponsClassFilter = "all";
    else state.itemsClassFilter = "all";
  }
  select.innerHTML = '<option value="all">Todos os tipos</option>' + classes.map(value => '<option value="' + htmlEscape(value) + '">' + htmlEscape(itemClassLabel(value)) + '</option>').join("");
  select.value = selectedCatalogClass();
}
function catalogLevel(item) {
  const source = item.source || {};
  const value = source.drop_level ?? (source.base_item && source.base_item.drop_level);
  if (value == null || value === "") return null;
  return Number.isFinite(Number(value)) ? Number(value) : null;
}
function characterRequirement(item) {
  const source = item.source || {};
  const gem = item.gemData || {};
  const requirement = source.requirements || source.base_item && source.base_item.requirements || gem.requirements || gem.base_item && gem.base_item.requirements;
  const value = requirement && requirement.level;
  if (value == null || value === "") return null;
  return Number.isFinite(Number(value)) ? Number(value) : null;
}
function defenseProfile(item) {
  const source = item.source || {};
  const properties = source.properties || source.base_item && source.base_item.properties || {};
  return ["armour", "evasion", "energy_shield"].filter(key => {
    const value = properties[key];
    if (value == null) return false;
    if (typeof value === "number") return value > 0;
    return typeof value === "object" && (Number(value.max || 0) > 0 || Number(value.min || 0) > 0);
  }).join(",");
}
function setLootFilterClass(itemClass) {
  state.lootFilter.filterClass = itemClass;
  state.lootFilter.filterBaseId = "all";
  if (itemClass !== "all" && !state.catalog.some(item => item.item_class === itemClass && defenseProfile(item))) {
    state.lootFilter.requiredDefenses = [];
  }
}
function filterProfileIsActive() {
  const filter = state.lootFilter;
  return filter.filterClass !== "all" || filter.requiredDefenses.length > 0 || filter.minDropLevel != null || filter.maxDropLevel != null;
}
function matchesSharedFilterProfile(item) {
  const filter = state.lootFilter;
  if (!filterProfileIsActive()) return true;
  if (!isEquipmentFavorite(item)) return false;
  if (filter.filterClass !== "all" && item.item_class !== filter.filterClass) return false;
  const defenses = defenseProfile(item).split(",").filter(Boolean);
  if (filter.requiredDefenses.length && defenses.join(",") !== filter.requiredDefenses.join(",")) return false;
  const level = catalogLevel(item);
  if ((filter.minDropLevel != null || filter.maxDropLevel != null) && level == null) return false;
  if (filter.minDropLevel != null && level < filter.minDropLevel) return false;
  if (filter.maxDropLevel != null && level > filter.maxDropLevel) return false;
  return true;
}
function compareAvailableNumbers(a, b, direction) {
  if (a == null) return b == null ? 0 : 1;
  if (b == null) return -1;
  return (a - b) * direction;
}
function sortCatalog(items) {
  const nameOrder = (a, b) => displayName(a).localeCompare(displayName(b), "pt-BR") || String(a.id).localeCompare(String(b.id), "en");
  const kindOrder = { gear: 0, unique: 1, currency: 2, potion: 3, charm: 4, rune: 5, omen: 6, essence: 7, abyss: 8, waystone: 9, trial: 9.5, tablet: 9.7, uncut: 10, gem: 11, other: 12 };
  return items.sort((a, b) => {
    if (state.sortOrder === "name_desc") return nameOrder(b, a);
    if (state.sortOrder === "item_level_desc" || state.sortOrder === "item_level_asc") {
      const level = compareAvailableNumbers(catalogLevel(a), catalogLevel(b), state.sortOrder === "item_level_desc" ? -1 : 1);
      return level || nameOrder(a, b);
    }
    if (state.sortOrder === "required_level_desc" || state.sortOrder === "required_level_asc") {
      const level = compareAvailableNumbers(characterRequirement(a), characterRequirement(b), state.sortOrder === "required_level_desc" ? -1 : 1);
      return level || nameOrder(a, b);
    }
    if (state.sortOrder === "type") return itemClassLabel(a.item_class).localeCompare(itemClassLabel(b.item_class), "pt-BR") || nameOrder(a, b);
    if (state.sortOrder === "category") return (kindOrder[a.kind] ?? 5) - (kindOrder[b.kind] ?? 5) || itemClassLabel(a.item_class).localeCompare(itemClassLabel(b.item_class), "pt-BR") || nameOrder(a, b);
    return nameOrder(a, b);
  });
}
function visibleItems() {
  const query = state.search.trim().toLocaleLowerCase();
  const wikiMap = getWikiUniqueMap();
  const classFilter = selectedCatalogClass();
  return sortCatalog(catalogModeItems().filter(item => {
    if (state.category !== "all" && item.kind !== state.category) return false;
    if (state.hideUniques && item.kind === "unique") return false;
    if (state.catalogMode === "equipment") {
      if (!matchesSharedFilterProfile(item)) return false;
    } else if (classFilter !== "all" && item.item_class !== classFilter) return false;
    // Ocultar uma base vale só para o filtro do jogo: na Wiki o item continua aparecendo.
    if (!query) return true;
    const wiki = wikiMap.get(String(item.englishName || item.name).toLocaleLowerCase());
    return [item.name, item.englishName, itemCategoryName(item.kind, item), itemClassLabel(item.item_class), item.item_class, (item.tags || []).map(tagLabel).join(" "), item.release_state, wiki && wiki["stat text"], item.itemText && [...item.itemText.effects, ...item.itemText.bonded].join(" ")].join(" ").toLocaleLowerCase().includes(query);
  }));
}
// Idioma dos nomes de itens (bandeiras no topo): "pt" usa a tradução, "en" o nome original do jogo.
const NAME_LANG_KEY = "atlas-poe2-name-lang";
function loadNameLang() { try { return localStorage.getItem(NAME_LANG_KEY) === "en" ? "en" : "pt"; } catch { return "pt"; } }
function displayName(item) { return state.nameLang === "en" ? item.englishName || item.name : item.name; }
function otherNameLabel(item) { return state.nameLang === "en" ? "Português: " + item.name : "Inglês: " + (item.englishName || item.name); }
function setNameLang(lang) {
  state.nameLang = lang === "en" ? "en" : "pt";
  try { localStorage.setItem(NAME_LANG_KEY, state.nameLang); } catch {}
  if (window.atlasSetInterfaceLanguage) window.atlasSetInterfaceLanguage(state.nameLang);
  document.querySelectorAll("[data-name-lang]").forEach(button => {
    const active = button.dataset.nameLang === state.nameLang;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (byId("page-wiki").classList.contains("active")) renderCatalog();
  if (byId("page-gems").classList.contains("active") && window.onGemsPage) window.onGemsPage();
  closeDetail();
}
// Mercado oficial: a busca vai no link como JSON gzip em base64url, igual ao que o site gera.
// Em português usa br.pathofexile.com com os nomes traduzidos; em inglês, o site internacional.
const TRADE_LEAGUE = "Forbidden Rites";
async function tradeSearchUrl(item) {
  const english = state.nameLang === "en";
  const baseName = englishName => english ? englishName : (itemTranslation(englishName) || {}).name || englishName;
  const query = item.kind === "unique"
    ? { status: { option: "securable" }, name: displayName(item), type: baseName(filterBaseTypeForItem(item)), stats: [{ type: "and", filters: [] }] }
    : { status: { option: "securable" }, type: displayName(item), stats: [{ type: "and", filters: [] }] };
  const stream = new Blob([JSON.stringify(query)]).stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = "";
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  const encoded = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return "https://" + (english ? "www" : "br") + ".pathofexile.com/trade2/search/poe2/" + encodeURIComponent(TRADE_LEAGUE) + "/" + encoded;
}
function openTradeSearch(item) {
  // Abre a aba já no clique (senão o navegador bloqueia o pop-up) e preenche o endereço depois.
  const tab = window.open("about:blank", "_blank");
  tradeSearchUrl(item).then(url => { if (tab) tab.location.href = url; else window.open(url, "_blank"); });
}
function renderCatalog() {
  updateWikiModePresentation();
  renderCategories();
  renderClassFilter();
  if (byId("defense-filter")) byId("defense-filter").value = state.lootFilter.requiredDefenses.join(",") || "all";
  if (byId("sort-select")) byId("sort-select").value = state.sortOrder;
  if (!state.data) {
    byId("results-count").textContent = "Aguardando sincronização";
    byId("results-subtitle").textContent = "Clique em Sincronizar para carregar a biblioteca.";
    byId("item-grid").innerHTML = '<div class="empty-state">A biblioteca local ainda não foi carregada.<br>Use o botão Sincronizar no topo da página.</div>';
    byId("load-more").hidden = true;
    return;
  }
  const items = visibleItems();
  const shownItems = items.slice(0, state.shown);
  byId("results-count").textContent = numberFormat(items.length) + " " + (items.length === 1 ? "resultado" : "resultados");
  const profileSummary = state.catalogMode === "equipment" && filterProfileIsActive() ? filterProfileLabel() + " · " : "";
  byId("results-subtitle").textContent = (state.search ? 'Para “' + state.search + '” em ' : "") + profileSummary + catalogCategoryLabel(state.category) + " no catálogo";
  if (!shownItems.length) byId("item-grid").innerHTML = '<div class="empty-state">Nenhum item encontrado.<br>Tente outro nome ou categoria.</div>';
  else byId("item-grid").innerHTML = shownItems.map(item => {
    const tags = (item.tags || []).slice(0, 3).map(tag => '<span>' + htmlEscape(tagLabel(tag)) + '</span>').join("");
    const badge = itemCategoryName(item.kind, item);
    const release = item.release_state && item.release_state !== "released" ? " · " + item.release_state.replace(/_/g, " ") : "";
    const image = item.image ? '<img class="item-thumb" src="' + htmlEscape(item.image) + '" alt="" loading="lazy"' + itemImageFallbackAttrs(item) + '>' : "";
    const level = catalogLevel(item);
    const levelBadge = level == null ? "" : '<span class="item-level" title="Nível mínimo para o item aparecer como drop">Nv. ' + numberFormat(level) + '</span>';
    const favorite = isFavorite(item);
    const favoriteButton = '<button type="button" class="item-favorite-button' + (favorite ? ' is-favorite' : '') + '" data-favorite-toggle="' + htmlEscape(item.id) + '" data-favorite-kind="' + item.kind + '" aria-pressed="' + favorite + '" aria-label="' + (favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos') + '" title="' + (favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos') + '">' + (favorite ? '★' : '☆') + '</button>';
    const tradeButton = '<button type="button" class="item-trade-button" data-trade-open aria-label="Buscar no mercado oficial" title="Buscar no mercado oficial (Trade)">🛒</button>';
    const highlight = state.lootFilter.text ? highlightEntryFor(item) : null;
    const highlightMark = highlight ? '<span class="item-highlight-mark" title="Destacado no filtro" style="' + highlightLabelStyle({ ...highlight, fontSize: 26 }) + '">Aa</span>' : "";
    const hiddenMark = isProtectedUnique(item) ? '<span class="item-protected-mark" title="Único valioso: todo filtro gerado pelo Atlas sempre mostra este item" style="' + highlightLabelStyle({ ...DEFAULT_LOOT_HIGHLIGHT_STYLE, ...protectedUniqueStyleFor(item), fontSize: 26 }) + '">Sempre visível</span>'
      : !highlight && state.lootFilter.text && favoriteHiddenEntry(item) ? '<span class="item-hidden-mark" title="Oculto no filtro do jogo (continua aqui na Wiki)">Oculto no jogo</span>' : "";
    return '<article class="item-card" title="' + htmlEscape(otherNameLabel(item)) + '" data-item-id="' + htmlEscape(item.id) + '" data-item-kind="' + item.kind + '" tabindex="0" role="button">' + image + '<div class="item-card-top"><span class="item-badge ' + item.kind + '">' + htmlEscape(badge) + '</span><div class="item-card-actions">' + highlightMark + tradeButton + favoriteButton + '<span class="item-arrow">↗</span></div></div><h3>' + htmlEscape(displayName(item)) + '</h3><div class="item-meta">' + htmlEscape(itemClassLabel(item.item_class) + release) + hiddenMark + '</div>' + (tags ? '<div class="item-tags">' + tags + '</div>' : "") + levelBadge + '</article>';
  }).join("");
  byId("load-more").hidden = items.length <= state.shown;
  byId("item-grid").querySelectorAll("[data-item-id]").forEach(card => {
    const open = () => openDetail(card.dataset.itemId, card.dataset.itemKind);
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => { if (event.target === card && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); open(); } });
    card.querySelector("[data-trade-open]").addEventListener("click", event => {
      event.stopPropagation();
      const item = state.catalog.find(entry => String(entry.id) === card.dataset.itemId && entry.kind === card.dataset.itemKind);
      if (item) openTradeSearch(item);
    });
    card.querySelector("[data-favorite-toggle]").addEventListener("click", event => {
      event.stopPropagation();
      const item = state.catalog.find(entry => String(entry.id) === card.dataset.itemId && entry.kind === card.dataset.itemKind);
      if (item) toggleFavorite(item);
    });
  });
}
function detailUrl(name) { return "https://www.poe2wiki.net/wiki/" + encodeURIComponent(String(name).replace(/ /g, "_")); }
function displayProperties(source) {
  const props = source && source.properties;
  if (!props || typeof props !== "object") return "";
  const labels = { armour: "Armadura", energy_shield: "Escudo de energia", evasion: "Evasão", ward: "Proteção", movement_speed: "Velocidade", block: "Bloqueio", stack_size: "Tamanho da pilha", attack_time: "Tempo de ataque", critical_strike_chance: "Chance crítica", physical_damage_min: "Dano físico mínimo", physical_damage_max: "Dano físico máximo", range: "Alcance", charges_max: "Cargas" };
  const cells = Object.entries(labels).filter(([key]) => props[key] !== null && props[key] !== undefined).map(([key, label]) => '<div class="property-chip"><span>' + label + '</span><b>' + htmlEscape(formatProperty(key, props[key])) + '</b></div>');
  return cells.length ? '<section class="detail-section"><h3>PROPRIEDADES DA BASE</h3><div class="property-grid">' + cells.join("") + '</div></section>' : "";
}
function renderBaseImplicits(source) {
  const mods = state.data && state.data.mods || {};
  const implicitMods = (Array.isArray(source && source.implicits) ? source.implicits : []).map(value => {
    const id = typeof value === "string" ? value : value && (value.id || value.mod);
    return id && mods[id] ? { id, mod: mods[id] } : null;
  }).filter(Boolean);
  if (!implicitMods.length) return "";
  return '<section class="detail-section base-implicit-section"><h3>BÔNUS IMPLÍCITO DA BASE</h3>' + implicitMods.map(({ mod }) => '<article class="base-implicit-card"><span class="mod-kind">Implícito</span>' + displayStatLines(mod) + '</article>').join("") + '</section>';
}
function formatProperty(key, value) {
  if (key === "attack_time" && Number(value)) return numberFormat(1000 / Number(value)) + " ataques/s";
  if (key === "critical_strike_chance" && Number(value)) return numberFormat(Number(value) / 100) + "%";
  return numberFormat(value);
}
function displayRequirements(source) {
  const requirements = source && source.requirements;
  if (!requirements) return "";
  const labels = { level: "Nível", strength: "Força", dexterity: "Destreza", intelligence: "Inteligência" };
  const cells = Object.entries(labels).filter(([key]) => requirements[key] != null && Number(requirements[key]) > 0).map(([key, label]) => '<div class="property-chip"><span>' + label + '</span><b>' + numberFormat(requirements[key]) + '</b></div>');
  return cells.length ? '<section class="detail-section"><h3>REQUISITOS</h3><div class="property-grid">' + cells.join("") + '</div></section>' : "";
}
function possibleMods(item) {
  const tags = new Set(item.tags || []);
  const mods = state.data && state.data.mods || {};
  return Object.entries(mods).filter(([, mod]) => mod.domain === "item" && Array.isArray(mod.spawn_weights) && mod.spawn_weights.some(entry => Number(entry.weight) > 0 && tags.has(entry.tag))).map(([id, mod]) => ({ id, mod })).sort((a, b) => {
    const order = { prefix: 0, suffix: 1, corrupted: 2, unique: 3 };
    return (order[a.mod.generation_type] ?? 5) - (order[b.mod.generation_type] ?? 5) || Number(a.mod.required_level || 0) - Number(b.mod.required_level || 0) || String(a.mod.name || "").localeCompare(String(b.mod.name || ""), "pt-BR");
  });
}
function modifierTextKey(text) { return sourceText(text).toLocaleLowerCase("en-US"); }
function modifierPatternKey(text) { return modifierTextKey(text).replace(/\d+(?:\.\d+)?/g, "#"); }
function applyModifierPattern(template, englishText) {
  const numbers = sourceText(englishText).match(/\d+(?:\.\d+)?/g) || [];
  return String(template || "").replace(/\{\{(\d+)\}\}/g, (_, index) => numbers[Number(index)] == null ? "" : numbers[Number(index)]);
}
function localizedModName(mod) {
  if (state.nameLang === "en") return mod.name || mod.type || "Modifier";
  const names = state.data && state.data.pt_mods && state.data.pt_mods.names || {};
  return names[String(mod.name || "").toLocaleLowerCase("en-US")] || mod.name || mod.type || "Modificador";
}
function localizedModText(mod) {
  const translations = state.data && state.data.pt_mods && state.data.pt_mods.texts || {};
  const patterns = state.data && state.data.pt_mods && state.data.pt_mods.patterns || {};
  const lines = String(mod.text || "").split(/\r?\n/).map(sourceText).filter(Boolean);
  if (!lines.length) return "";
  if (state.nameLang === "en") return lines.join(" · ");
  const joined = lines.join(" / ");
  const key = modifierTextKey(joined);
  const exact = translations[key];
  const pattern = patterns[modifierPatternKey(joined)];
  const translated = exact || (pattern && applyModifierPattern(pattern, joined));
  if (translated) return translated.replace(/\s+\/\s+/g, " · ");
  const simpleAddedDamage = localizeSimpleAddedDamage(joined);
  if (simpleAddedDamage) return simpleAddedDamage;
  return lines.map(line => {
    const lineKey = modifierTextKey(line);
    const lineTranslation = translations[lineKey];
    const linePattern = patterns[modifierPatternKey(line)];
    return lineTranslation || (linePattern && applyModifierPattern(linePattern, line)) || line;
  }).join(" · ");
}
function localizeSimpleAddedDamage(text) {
  const match = sourceText(text).match(/^adds\s+(\d+(?:\.\d+)?)\s+to\s+(\d+(?:\.\d+)?)\s+(physical|fire|cold|lightning|chaos)\s+damage\s+to\s+attacks?$/i);
  if (!match) return "";
  const damageType = { physical: "físico", fire: "de fogo", cold: "de frio", lightning: "elétrico", chaos: "de caos" }[match[3].toLowerCase()];
  return "Adiciona de " + match[1] + " a " + match[2] + " de dano " + damageType + " aos ataques";
}
function displayStatLines(mod) {
  const text = localizedModText(mod);
  if (text) return '<div class="mod-text">' + htmlEscape(text) + '</div>';
  const stats = (mod.stats || []).map(stat => stat.id + ": " + (stat.min === stat.max ? stat.min : stat.min + "–" + stat.max));
  return stats.length ? '<div class="mod-text">' + htmlEscape(stats.join(" · ")) + '</div>' : '<div class="mod-text">Descrição indisponível nesta exportação.</div>';
}
function modTypeLabel(type) { return ({ prefix: "Prefixo", suffix: "Sufixo", corrupted: "Corrompido", unique: "Único", implicit: "Implícito" })[type] || type || "Outro"; }
function renderModList(item) {
  const mods = possibleMods(item);
  const filtered = mods.filter(({ id, mod }) => {
    if (state.activeModFilter === "prefix" && mod.generation_type !== "prefix") return false;
    if (state.activeModFilter === "suffix" && mod.generation_type !== "suffix") return false;
    if (state.activeModFilter === "other" && ["prefix", "suffix"].includes(mod.generation_type)) return false;
    const q = state.activeModSearch.toLocaleLowerCase();
    const name = localizedModName(mod);
    const text = localizedModText(mod);
    return !q || [id, name, text, mod.name, mod.text, mod.type, mod.generation_type, ...(mod.stats || []).map(s => s.id)].join(" ").toLocaleLowerCase().includes(q);
  });
  const excludedIds = new Set(excludedModifiersForItem(item).map(entry => entry.id));
  const cards = filtered.length ? filtered.map(({ id, mod }) => {
    const excluded = excludedIds.has(id);
    return '<article class="mod-card' + (excluded ? ' is-filter-blocked' : '') + '"><div class="mod-card-top"><span class="mod-name" title="Nome em inglês: ' + htmlEscape(mod.name || mod.type || id) + '">' + htmlEscape(localizedModName(mod)) + '</span><span class="mod-kind">' + htmlEscape(modTypeLabel(mod.generation_type)) + (mod.required_level ? " · personagem Nv. " + numberFormat(mod.required_level) : "") + (excluded ? ' · bloqueado no filtro' : '') + '</span></div>' + displayStatLines(mod) + '</article>';
  }).join("") : '<div class="mod-empty">Nenhum modificador corresponde a este filtro. Os resultados seguem as tags e os pesos de geração presentes na exportação.</div>';
  return '<section class="detail-section"><h3>MODIFICADORES COMPATÍVEIS <span style="color:#777;margin-left:5px">' + numberFormat(filtered.length) + '</span></h3><div class="mod-toolbar">' + [["all", "Todos"], ["prefix", "Prefixos"], ["suffix", "Sufixos"], ["other", "Outros"]].map(([value, label]) => '<button class="mod-filter ' + (state.activeModFilter === value ? "active" : "") + '" data-mod-filter="' + value + '">' + label + '</button>').join("") + '</div><input id="mod-search" class="mod-search" type="search" placeholder="Filtrar modificadores por nome ou efeito…" value="' + htmlEscape(state.activeModSearch) + '"><div class="mod-list">' + cards + '</div><p class="detail-hint">Lista calculada pelas tags da base e pelos pesos positivos de geração exportados. Os afixos marcados aparecem como bloqueados no filtro.</p></section>';
}
function saveLootFilter() {
  try { localStorage.setItem(LOOT_FILTER_STORAGE_KEY, JSON.stringify(state.lootFilter)); }
  catch { showToast("Filtro ativo nesta sessão; o navegador não conseguiu salvar os dados locais."); }
}
function discardLootFilterDraftBackup() {
  try { localStorage.removeItem(LOOT_FILTER_DRAFT_BACKUP_KEY); } catch {}
}
function startNewLootFilterDraft() {
  try { localStorage.setItem(LOOT_FILTER_DRAFT_BACKUP_KEY, JSON.stringify(state.lootFilter)); } catch {}
  state.lootFilter = normalizeLootFilterConfig({ text: "Show\n", newFilterDraft: true });
  saveLootFilter();
  renderLootFilterPanel();
  const input = [...document.querySelectorAll("[data-new-filter-name]")].find(element => !element.closest("[hidden]"));
  if (input) input.focus();
  showToast("Filtro novo iniciado do zero. Configure as regras e dê um nome para salvar.");
}
function cancelNewLootFilterDraft() {
  let previous = null;
  try { previous = JSON.parse(localStorage.getItem(LOOT_FILTER_DRAFT_BACKUP_KEY) || "null"); } catch {}
  state.lootFilter = normalizeLootFilterConfig(previous && typeof previous === "object" ? previous : {});
  discardLootFilterDraftBackup();
  saveLootFilter();
  renderLootFilterPanel();
  showToast("Criação cancelada. Selecione um arquivo para voltar a editar um filtro existente.");
}
function filterProfileLabel() {
  const filter = state.lootFilter;
  const parts = [];
  if (filter.filterClass !== "all") parts.push(itemClassLabel(filter.filterClass));
  if (filter.requiredDefenses.length) parts.push(filter.requiredDefenses.map(defense => ({ armour: "Armadura", evasion: "Evasão", energy_shield: "Escudo de energia" })[defense]).join(" + "));
  if (filter.minDropLevel != null || filter.maxDropLevel != null) parts.push("drop Nv. " + (filter.minDropLevel ?? "1") + "–" + (filter.maxDropLevel ?? "100"));
  return parts.length ? parts.join(" · ") : "Todos os equipamentos";
}
function filterScopeItems() {
  const filter = state.lootFilter;
  return state.catalog.filter(item => item.kind === "gear" && (filter.filterClass === "all" || item.item_class === filter.filterClass) && (filter.filterBaseId === "all" || String(item.id) === filter.filterBaseId));
}
function filterModifierCandidates() {
  if (!state.data || !state.data.mods) return [];
  const tags = new Set(filterScopeItems().flatMap(item => item.tags || []));
  if (!tags.size) return [];
  return Object.entries(state.data.mods).filter(([, mod]) => mod.domain === "item" && ["prefix", "suffix"].includes(mod.generation_type) && mod.name && Array.isArray(mod.spawn_weights) && mod.spawn_weights.some(entry => Number(entry.weight) > 0 && tags.has(entry.tag))).map(([id, mod]) => ({ id, mod }));
}
function filterModifierAlreadyExcluded(id, itemClass, baseType) {
  return state.lootFilter.excludedModifiers.some(entry => entry.id === id && entry.itemClass === itemClass && entry.baseType === baseType);
}
function searchFilterModifiers() {
  const query = state.filterModifierSearch.trim().toLocaleLowerCase("pt-BR");
  const searchTerms = query.includes("espinh") ? [query, "thorn", "thorns", "spiny", "thorny", "barbed", "spiked"] : [query];
  return filterModifierCandidates().filter(({ mod }) => state.filterModifierType === "all" || mod.generation_type === state.filterModifierType).filter(({ id, mod }) => {
    if (!query) return true;
    const searchable = [id, mod.name, localizedModName(mod), localizedModText(mod), mod.text, mod.generation_type].join(" ").toLocaleLowerCase("pt-BR");
    return searchTerms.some(term => term && searchable.includes(term));
  }).sort((a, b) => {
    const order = { prefix: 0, suffix: 1 };
    return order[a.mod.generation_type] - order[b.mod.generation_type] || String(localizedModName(a.mod)).localeCompare(String(localizedModName(b.mod)), "pt-BR") || a.id.localeCompare(b.id, "en");
  });
}
function renderFilterModifierOptions() {
  const holder = byId("filter-affix-results");
  if (!holder) return;
  const query = state.filterModifierSearch.trim().toLocaleLowerCase("pt-BR");
  const matching = searchFilterModifiers();
  const limit = 80;
  const displayed = matching.slice(0, limit);
  const itemClass = state.lootFilter.filterClass;
  const base = state.catalog.find(item => item.kind === "gear" && String(item.id) === state.lootFilter.filterBaseId);
  const baseType = base ? filterBaseTypeForItem(base) : "";
  const bulkButton = byId("filter-block-matches");
  const available = matching.filter(({ id }) => !filterModifierAlreadyExcluded(id, itemClass, baseType)).length;
  if (bulkButton) {
    bulkButton.disabled = query.length < 2 || !available || matching.length > 200;
    bulkButton.textContent = matching.length > 200 ? "Refine a busca" : "Bloquear " + numberFormat(available) + (available === 1 ? " resultado" : " resultados");
    bulkButton.title = matching.length > 200 ? "A busca encontrou muitos afixos. Refine o termo para aplicar o bloqueio em segurança." : "Bloqueia todos os resultados desta busca dentro do escopo selecionado.";
  }
  const resultCount = byId("filter-affix-result-count");
  if (resultCount) resultCount.textContent = query.length < 2 ? numberFormat(matching.length) + " afixos compatíveis · digite para pesquisar" : numberFormat(matching.length) + " resultado(s) · " + numberFormat(available) + " ainda não bloqueado(s)";
  if (!displayed.length) {
    holder.innerHTML = '<div class="filter-empty">' + (state.data ? "Nenhum prefixo ou sufixo compatível com esta base e busca." : "Sincronize os dados do jogo para carregar prefixos e sufixos.") + '</div>';
    return;
  }
  holder.innerHTML = displayed.map(({ id, mod }) => {
    const blocked = filterModifierAlreadyExcluded(id, itemClass, baseType);
    return '<article class="filter-affix-option' + (blocked ? ' is-selected' : '') + '"><div><div class="filter-affix-name" title="Nome original: ' + htmlEscape(mod.name) + '">' + htmlEscape(localizedModName(mod)) + '<span class="filter-affix-kind ' + mod.generation_type + '">' + htmlEscape(modTypeLabel(mod.generation_type)) + '</span></div><p>' + htmlEscape(localizedModText(mod) || sourceText(mod.text) || "Efeito sem descrição") + '</p></div><button type="button" data-add-excluded-mod="' + htmlEscape(id) + '"' + (blocked ? ' disabled' : '') + '>' + (blocked ? 'Bloqueado' : 'Bloquear') + '</button></article>';
  }).join("") + (matching.length > limit ? '<div class="filter-affix-more">Mostrando ' + numberFormat(limit) + ' de ' + numberFormat(matching.length) + ' resultados. Refine a busca para encontrar um afixo específico.</div>' : "");
  holder.querySelectorAll("[data-add-excluded-mod]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.addExcludedMod;
    const mod = state.data.mods[id];
    if (!mod || filterModifierAlreadyExcluded(id, itemClass, baseType)) return;
    state.lootFilter.excludedModifiers.push({ id, name: String(mod.name), type: mod.generation_type, itemClass, baseType });
    saveLootFilter();
    renderFilterManager();
    renderLootFilterPanel();
    showToast(localizedModName(mod) + " será ocultado pelo filtro.");
  }));
}
function renderExcludedModifierList() {
  const holder = byId("filter-excluded-list");
  if (!holder) return;
  const entries = state.lootFilter.excludedModifiers;
  byId("filter-excluded-count").textContent = numberFormat(entries.length);
  byId("filter-blocked-mod-count").textContent = numberFormat(entries.length);
  if (!entries.length) {
    holder.innerHTML = '<span class="filter-empty-inline">Nenhum modificador bloqueado.</span>';
    return;
  }
  holder.innerHTML = entries.map((entry, index) => {
    const mod = state.data && state.data.mods && state.data.mods[entry.id];
    const label = mod ? localizedModName(mod) : entry.name;
    const effect = mod ? localizedModText(mod) : "";
    const scope = [entry.itemClass !== "all" ? itemClassLabel(entry.itemClass) : "Todos os equipamentos", entry.baseType].filter(Boolean).join(" · ");
    return '<article class="filter-excluded-mod"><div><b title="Nome original: ' + htmlEscape(entry.name) + '">' + htmlEscape(label) + '</b><small>' + htmlEscape(modTypeLabel(entry.type)) + ' · ' + htmlEscape(scope) + '</small>' + (effect ? '<p>' + htmlEscape(effect) + '</p>' : "") + '</div><button type="button" data-remove-excluded-mod="' + index + '" aria-label="Remover ' + htmlEscape(label) + ' dos bloqueios" title="Desbloquear modificador">×</button></article>';
  }).join("");
  holder.querySelectorAll("[data-remove-excluded-mod]").forEach(button => button.addEventListener("click", () => {
    state.lootFilter.excludedModifiers.splice(Number(button.dataset.removeExcludedMod), 1);
    saveLootFilter();
    renderFilterManager();
    renderLootFilterPanel();
  }));
}
function renderHiddenBaseList() {
  const holder = byId("filter-hidden-base-list");
  const entries = state.lootFilter.hiddenBaseItems;
  if (byId("filter-hidden-base-count")) byId("filter-hidden-base-count").textContent = numberFormat(entries.length);
  if (!holder) return;
  byId("filter-hidden-base-list-count").textContent = numberFormat(entries.length) + (entries.length === 1 ? " base" : " bases");
  if (!entries.length) {
    holder.innerHTML = '<div class="filter-empty">Nenhuma base foi marcada para ocultação. Abra um item na Wiki e escolha “Ocultar esta base no filtro”.</div>';
    return;
  }
  holder.innerHTML = entries.map((entry, index) => {
    const item = catalogItemForFilterEntry(entry);
    const label = item ? item.name : entry.baseType;
    const rarities = entry.rarities && entry.rarities.length ? entry.rarities.map(value => LOOT_FILTER_RARITIES.find(option => option.value === value)?.label || value).join(", ") : HIDEABLE_LOOT_RARITIES.map(option => option.label).join(", ");
    return '<article class="filter-hidden-base"><span class="filter-hidden-base-icon">⌁</span><div><b title="Nome original: ' + htmlEscape(entry.baseType) + '">' + htmlEscape(label) + '</b><small>' + htmlEscape(rarities) + '</small></div><button type="button" data-remove-hidden-base="' + index + '" aria-label="Remover ocultação de ' + htmlEscape(label) + '" title="Mostrar esta base novamente">Mostrar</button></article>';
  }).join("");
  holder.querySelectorAll("[data-remove-hidden-base]").forEach(button => button.addEventListener("click", () => {
    state.lootFilter.hiddenBaseItems.splice(Number(button.dataset.removeHiddenBase), 1);
    saveLootFilter();
    renderLootFilterPanel();
  }));
}
function renderHighlightedBaseList() {
  const holder = byId("filter-highlight-base-list");
  const entries = state.lootFilter.highlightedItems;
  if (byId("filter-highlight-base-count")) byId("filter-highlight-base-count").textContent = numberFormat(entries.length);
  if (!holder) return;
  byId("filter-highlight-base-list-count").textContent = numberFormat(entries.length) + (entries.length === 1 ? " base" : " bases");
  if (!entries.length) {
    holder.innerHTML = '<div class="filter-empty">Nenhuma base destacada. Abra um item na Wiki e marque “Destacar esta base no filtro”.</div>';
    return;
  }
  // Agrupa por categoria da Wiki (Essências, Runas...) para a lista não virar uma parede de itens.
  const groups = new Map();
  entries.forEach((entry, index) => {
    const item = catalogItemForFilterEntry(entry);
    const kind = item ? item.kind : "other";
    if (!groups.has(kind)) groups.set(kind, []);
    groups.get(kind).push({ entry, index, item });
  });
  holder.innerHTML = [...groups.entries()].map(([kind, rows]) => '<details class="filter-highlight-group"' + (groups.size <= 2 ? " open" : "") + '><summary><b>' + htmlEscape(bulkCategoryLabel(kind)) + '</b><small>' + numberFormat(rows.length) + (rows.length === 1 ? " item" : " itens") + '</small><button type="button" data-remove-highlight-kind="' + htmlEscape(kind) + '">Remover todos</button></summary><div class="filter-hidden-base-list">' + rows.map(({ entry, index, item }) => {
    const label = item ? item.name : entry.baseType;
    const extras = [entry.minimapIcon ? "ícone" : "", entry.beam ? "feixe" : "", entry.sound ? "som" : ""].filter(Boolean).join(" + ");
    return '<article class="filter-hidden-base filter-highlight-base"><span class="filter-highlight-sample" style="' + highlightLabelStyle({ ...entry, fontSize: 26 }) + '">Aa</span><div><b title="Nome original: ' + htmlEscape(entry.baseType) + '">' + htmlEscape(label) + '</b><small>' + htmlEscape(highlightRarityLabel(entry) + (extras ? " · " + extras : "")) + '</small></div>' + (item ? '<button type="button" data-edit-highlight-base="' + index + '" title="Abrir a ficha para mudar as cores">Editar</button>' : "") + '<button type="button" data-remove-highlight-base="' + index + '" aria-label="Remover destaque de ' + htmlEscape(label) + '" title="Remover destaque">Remover</button></article>';
  }).join("") + '</div></details>').join("");
  holder.querySelectorAll("[data-remove-highlight-kind]").forEach(button => button.addEventListener("click", event => {
    event.preventDefault();
    const kind = button.dataset.removeHighlightKind;
    if (!confirm("Remover o destaque de todos os itens de " + bulkCategoryLabel(kind) + "?")) return;
    state.lootFilter.highlightedItems = state.lootFilter.highlightedItems.filter(entry => ((catalogItemForFilterEntry(entry) || {}).kind || "other") !== kind);
    saveLootFilter();
    renderLootFilterPanel();
  }));
  holder.querySelectorAll("[data-edit-highlight-base]").forEach(button => button.addEventListener("click", () => {
    const entry = state.lootFilter.highlightedItems[Number(button.dataset.editHighlightBase)];
    const item = entry && catalogItemForFilterEntry(entry);
    if (item) openDetail(item.id, item.kind);
  }));
  holder.querySelectorAll("[data-remove-highlight-base]").forEach(button => button.addEventListener("click", () => {
    state.lootFilter.highlightedItems.splice(Number(button.dataset.removeHighlightBase), 1);
    saveLootFilter();
    renderLootFilterPanel();
  }));
}
// ---------- Destaque em grupo (aba Filtro) ----------
// Categorias da Wiki que dá para destacar de uma vez; equipamentos e únicos continuam pela ficha de cada item.
const BULK_HIGHLIGHT_KINDS = ["essence", "rune", "currency", "omen", "abyss", "gem", "uncut", "charm", "potion", "waystone", "trial", "tablet", "other"];
function bulkCategoryLabel(kind) { return ({ currency: "Orbes e moedas", gem: "Gemas de linhagem", other: "Outros", unique: "Únicos", gear: "Equipamentos" })[kind] || categoryLabel(kind); }
function bulkHighlightState() {
  if (!state.bulkHighlight) state.bulkHighlight = { kind: "essence", search: "", excluded: new Set(), style: normalizeHighlightEntry({ ...DEFAULT_LOOT_HIGHLIGHT_STYLE, id: "grupo", baseType: "grupo" }), preset: "" };
  return state.bulkHighlight;
}
function bulkCategoryItems(kind) {
  return state.catalog.filter(item => item.kind === kind && item.catalogGroup === "items").sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}
function renderBulkHighlight() {
  const holder = byId("filter-bulk");
  if (!holder || !state.data) return;
  const bulk = bulkHighlightState();
  const kinds = BULK_HIGHLIGHT_KINDS.filter(kind => bulkCategoryItems(kind).length);
  if (!kinds.includes(bulk.kind)) bulk.kind = kinds[0];
  const items = bulkCategoryItems(bulk.kind);
  // As caixas mostram o que já está destacado: desmarcar e salvar tira o destaque.
  // Categoria sem nenhum destaque começa com tudo marcado, pronta para destacar.
  if (bulk.syncedKind !== bulk.kind) {
    const current = items.map(item => highlightEntryFor(item)).filter(Boolean);
    bulk.excluded = new Set(current.length ? items.filter(item => !highlightEntryFor(item)).map(item => String(item.id)) : []);
    if (current.length) { bulk.style = normalizeHighlightEntry({ ...current[0], rarities: [], id: "grupo", baseType: "grupo" }); bulk.preset = ""; }
    bulk.syncedKind = bulk.kind;
  }
  const query = normalizeItemKey(bulk.search);
  const visible = query ? items.filter(item => normalizeItemKey(item.name).includes(query) || normalizeItemKey(item.englishName).includes(query)) : items;
  const selected = items.filter(item => !bulk.excluded.has(String(item.id)));
  const highlighted = item => !!highlightEntryFor(item);
  const style = bulk.style;
  const shapes = FILTER_ICON_SHAPES.map(option => '<option value="' + option.value + '"' + (style.iconShape === option.value ? " selected" : "") + '>' + option.glyph + " " + option.label + '</option>').join("");
  const sounds = Array.from({ length: 16 }, (_, index) => '<option value="' + (index + 1) + '"' + (style.soundId === index + 1 ? " selected" : "") + '>Som ' + (index + 1) + '</option>').join("");
  const presets = SELECTABLE_HIGHLIGHT_PRESETS.map(preset => '<button type="button" class="loot-highlight-preset' + (bulk.preset === "p:" + preset.id ? " is-selected" : "") + '" data-bulk-preset="' + preset.id + '" style="' + highlightLabelStyle({ ...preset, backgroundOpacity: 255, fontSize: 30 }) + '">' + htmlEscape(preset.label) + '</button>').join("");
  const profiles = loadHighlightProfiles().map((profile, index) => '<button type="button" class="loot-highlight-preset' + (bulk.preset === "u:" + index ? " is-selected" : "") + '" data-bulk-profile="' + index + '" style="' + highlightLabelStyle({ ...profile.style, fontSize: 30 }) + '">' + htmlEscape(profile.name) + '</button>').join("");
  const sizes = FILTER_ICON_SIZES.map(option => '<option value="' + option.value + '"' + (style.iconSize === option.value ? " selected" : "") + '>' + option.label + '</option>').join("");
  const swatches = (field, label, enabled) => '<div class="loot-highlight-swatches filter-bulk-swatches" role="radiogroup" aria-label="' + label + '">' + FILTER_EFFECT_COLORS.map(option => '<button type="button" role="radio" data-bulk-swatch="' + field + '" data-value="' + option.value + '" title="' + option.label + '" aria-label="' + option.label + '" aria-checked="' + (style[field] === option.value) + '" class="' + (style[field] === option.value ? "is-selected" : "") + '" style="background:' + option.hex + '"' + (enabled ? "" : " disabled") + '></button>').join("") + '</div>';
  const shape = FILTER_ICON_SHAPES.find(option => option.value === style.iconShape);
  const sample = (visible[0] || items[0] || {}).englishName || "Item";
  holder.innerHTML =
    '<div class="filter-bulk-kinds" role="tablist">' + kinds.map(kind => '<button type="button" role="tab" data-bulk-kind="' + kind + '" class="' + (kind === bulk.kind ? "active" : "") + '">' + htmlEscape(bulkCategoryLabel(kind)) + '<i>' + numberFormat(bulkCategoryItems(kind).length) + '</i></button>').join("") + '</div>'
    + '<div class="filter-bulk-body"><div class="filter-bulk-items">'
    + '<div class="filter-bulk-toolbar"><label class="filter-affix-search"><span>⌕</span><input type="search" data-bulk-search placeholder="Buscar em ' + htmlEscape(bulkCategoryLabel(bulk.kind)) + '…" value="' + htmlEscape(bulk.search) + '" autocomplete="off"></label><button type="button" data-bulk-select="all">Marcar todos</button><button type="button" data-bulk-select="none">Desmarcar todos</button></div>'
    + '<div class="filter-bulk-list">' + (visible.length ? visible.map(item => '<label class="filter-bulk-item' + (highlighted(item) ? " is-highlighted" : "") + '" title="' + htmlEscape(item.englishName) + (highlighted(item) ? " · já destacado" : "") + '"><input type="checkbox" data-bulk-item="' + htmlEscape(item.id) + '"' + (bulk.excluded.has(String(item.id)) ? "" : " checked") + '>' + (item.image ? '<img src="' + htmlEscape(item.image) + '" alt="" loading="lazy" referrerpolicy="no-referrer"' + itemImageFallbackAttrs(item) + '>' : "") + '<span>' + htmlEscape(item.name) + '</span></label>').join("") : '<div class="filter-empty">Nada encontrado.</div>') + '</div>'
    + '<small class="filter-bulk-count">' + numberFormat(selected.length) + ' de ' + numberFormat(items.length) + ' marcados · ' + numberFormat(items.filter(highlighted).length) + ' já destacados (marcados em dourado)</small></div>'
    + '<div class="filter-bulk-style">'
    + '<div class="loot-highlight-preview"><div class="loot-highlight-ground"><span class="loot-highlight-beam' + (style.beamTemporary ? " is-temporary" : "") + '"' + (style.beam ? "" : " hidden") + ' style="--beam-color:' + effectColorHex(style.beamColor) + '"></span><span class="loot-highlight-label" data-bulk-label style="' + highlightLabelStyle(style) + '">' + htmlEscape(sample) + '</span></div><div class="loot-highlight-minimap"><span>MINIMAPA</span><b style="--icon-color:' + (style.minimapIcon ? effectColorHex(style.iconColor) : "#555") + ';font-size:' + (style.minimapIcon ? [22, 17, 12][style.iconSize] + "px" : "") + '">' + (style.minimapIcon ? shape.glyph : "—") + '</b></div></div>'
    + '<span class="loot-highlight-heading">ESTILO</span><div class="loot-highlight-presets">' + presets + '</div>'
    + (profiles ? '<span class="loot-highlight-heading">MEUS PERFIS</span><div class="loot-highlight-presets">' + profiles + '</div>' : "")
    + '<span class="loot-highlight-heading">TEXTO DO ITEM</span><div class="filter-bulk-text">'
    + '<label class="loot-highlight-color"><span>Cor do texto</span><span class="loot-highlight-color-input"><input type="color" data-bulk-field="textColor" value="' + style.textColor + '"><code data-bulk-hex="textColor">' + style.textColor.toUpperCase() + '</code></span></label>'
    + '<label class="loot-highlight-range"><span>Tamanho da fonte</span><input type="range" min="18" max="45" step="1" data-bulk-field="fontSize" value="' + style.fontSize + '"><output data-bulk-output="fontSize">' + style.fontSize + '</output></label>'
    + '</div>'
    + '<div class="filter-bulk-switches">'
    + '<label><input type="checkbox" data-bulk-field="minimapIcon"' + (style.minimapIcon ? " checked" : "") + '>Ícone no minimapa</label><select data-bulk-field="iconShape"' + (style.minimapIcon ? "" : " disabled") + '>' + shapes + '</select>'
    + '<label class="filter-bulk-indent">Tamanho do ícone</label><select data-bulk-field="iconSize"' + (style.minimapIcon ? "" : " disabled") + '>' + sizes + '</select>'
    + '<label class="filter-bulk-indent">Cor do ícone</label>' + swatches("iconColor", "Cor do ícone", style.minimapIcon)
    + '<label><input type="checkbox" data-bulk-field="beam"' + (style.beam ? " checked" : "") + '>Feixe de luz</label><label><input type="checkbox" data-bulk-field="beamTemporary"' + (style.beamTemporary ? " checked" : "") + (style.beam ? "" : " disabled") + '>Só quando cai</label>'
    + '<label class="filter-bulk-indent">Cor do feixe</label>' + swatches("beamColor", "Cor do feixe", style.beam)
    + '<label><input type="checkbox" data-bulk-field="sound"' + (style.sound ? " checked" : "") + '>Som de alerta</label><select data-bulk-field="soundId"' + (style.sound ? "" : " disabled") + '>' + sounds + '</select>'
    + '</div>'
    + '<div class="filter-bulk-actions"><button type="button" class="primary-button" data-bulk-apply>Salvar · ' + (selected.length ? "destacar " + numberFormat(selected.length) + (selected.length === 1 ? " item" : " itens") : "sem destaque") + '</button>'
    + '<button type="button" class="filter-bulk-clear" data-bulk-clear' + (items.some(highlighted) ? "" : " disabled") + '>✕ Retirar destaque de ' + htmlEscape(bulkCategoryLabel(bulk.kind)) + '</button></div>'
    + '<small>Marcados ficam destacados com este visual; desmarcados perdem o destaque. Depois, use “Salvar por cima do arquivo”.</small>'
    + '</div></div>';
  const rerender = () => renderBulkHighlight();
  holder.querySelectorAll("[data-bulk-kind]").forEach(button => button.addEventListener("click", () => { bulk.kind = button.dataset.bulkKind; bulk.search = ""; bulk.syncedKind = null; rerender(); }));
  const search = holder.querySelector("[data-bulk-search]");
  search.addEventListener("input", () => { bulk.search = search.value; rerender(); const again = byId("filter-bulk").querySelector("[data-bulk-search]"); again.focus(); again.setSelectionRange(again.value.length, again.value.length); });
  holder.querySelectorAll("[data-bulk-select]").forEach(button => button.addEventListener("click", () => {
    // Age só sobre o que a busca mostra.
    for (const item of visible) button.dataset.bulkSelect === "all" ? bulk.excluded.delete(String(item.id)) : bulk.excluded.add(String(item.id));
    rerender();
  }));
  holder.querySelectorAll("[data-bulk-item]").forEach(input => input.addEventListener("change", () => { input.checked ? bulk.excluded.delete(input.dataset.bulkItem) : bulk.excluded.add(input.dataset.bulkItem); rerender(); }));
  holder.querySelectorAll("[data-bulk-preset]").forEach(button => button.addEventListener("click", () => {
    const preset = LOOT_HIGHLIGHT_PRESETS.find(option => option.id === button.dataset.bulkPreset);
    bulk.style = normalizeHighlightEntry({ ...bulk.style, textColor: preset.textColor, borderColor: preset.borderColor, backgroundColor: preset.backgroundColor, backgroundOpacity: 255, iconColor: preset.effectColor, beamColor: preset.effectColor, ...(preset.iconShape ? { iconShape: preset.iconShape } : {}) });
    bulk.preset = "p:" + preset.id;
    rerender();
  }));
  holder.querySelectorAll("[data-bulk-profile]").forEach(button => button.addEventListener("click", () => {
    const profile = loadHighlightProfiles()[Number(button.dataset.bulkProfile)];
    if (!profile) return;
    bulk.style = normalizeHighlightEntry({ ...profile.style, rarities: [], id: "grupo", baseType: "grupo" });
    bulk.preset = "u:" + button.dataset.bulkProfile;
    rerender();
  }));
  const readField = input => {
    const field = input.dataset.bulkField;
    bulk.style[field] = input.type === "checkbox" ? input.checked : input.type === "range" || ["iconSize", "soundId"].includes(field) ? Number(input.value) : input.value;
    bulk.style = normalizeHighlightEntry(bulk.style);
    // Cor própria deixa de ser o estilo pronto escolhido.
    if (field === "textColor") bulk.preset = "";
  };
  holder.querySelectorAll("[data-bulk-field]").forEach(input => {
    // "input" atualiza a prévia enquanto arrasta ou escolhe a cor; "change" redesenha o painel.
    if (input.type === "range" || input.type === "color") input.addEventListener("input", () => {
      readField(input);
      holder.querySelector("[data-bulk-label]").setAttribute("style", highlightLabelStyle(bulk.style));
      holder.querySelectorAll("[data-bulk-output]").forEach(output => { output.textContent = String(bulk.style[output.dataset.bulkOutput]); });
      holder.querySelectorAll("[data-bulk-hex]").forEach(code => { code.textContent = bulk.style[code.dataset.bulkHex].toUpperCase(); });
    });
    input.addEventListener("change", () => { readField(input); rerender(); });
  });
  holder.querySelectorAll("[data-bulk-swatch]").forEach(button => button.addEventListener("click", () => {
    bulk.style = normalizeHighlightEntry({ ...bulk.style, [button.dataset.bulkSwatch]: button.dataset.value });
    bulk.preset = "";
    rerender();
  }));
  holder.querySelector("[data-bulk-clear]").addEventListener("click", () => {
    const count = items.filter(highlighted).length;
    if (!count || !confirm("Retirar o destaque de " + numberFormat(count) + " itens de " + bulkCategoryLabel(bulk.kind) + "?")) return;
    state.lootFilter.highlightedItems = state.lootFilter.highlightedItems.filter(entry => !items.some(item => sameFilterBase(entry, item)));
    bulk.syncedKind = null;
    saveLootFilter();
    renderLootFilterPanel();
    showToast("Destaque retirado de " + numberFormat(count) + " itens. Clique em “Salvar por cima do arquivo” para valer no jogo.");
  });
  holder.querySelector("[data-bulk-apply]").addEventListener("click", () => {
    // A categoria inteira passa a ser exatamente o que está marcado.
    const removed = items.filter(item => highlighted(item) && bulk.excluded.has(String(item.id))).length;
    state.lootFilter.highlightedItems = state.lootFilter.highlightedItems.filter(entry => !items.some(item => sameFilterBase(entry, item)));
    for (const item of selected) {
      const entry = normalizeHighlightEntry({ ...bulk.style, rarities: [], id: String(item.id), baseType: filterBaseTypeForItem(item) });
      if (entry) state.lootFilter.highlightedItems.push(entry);
    }
    saveLootFilter();
    renderLootFilterPanel();
    showToast(bulkCategoryLabel(bulk.kind) + ": " + numberFormat(selected.length) + " destacados" + (removed ? ", " + numberFormat(removed) + " sem destaque" : "") + ". Salve o arquivo para usar no jogo.");
  });
}
function renderFilterManager() {
  const classSelect = byId("filter-class-select");
  if (!classSelect) return;
  const equipment = state.catalog.filter(item => item.kind === "gear");
  const classes = [...new Set(equipment.map(item => item.item_class).filter(Boolean))].sort((a, b) => itemClassLabel(a).localeCompare(itemClassLabel(b), "pt-BR"));
  // Preserve a type chosen in the Wiki even when it has no base item in the
  // equipment-only list (for example, a type represented only by uniques).
  if (state.lootFilter.filterClass !== "all" && !classes.includes(state.lootFilter.filterClass)) classes.push(state.lootFilter.filterClass);
  classes.sort((a, b) => itemClassLabel(a).localeCompare(itemClassLabel(b), "pt-BR"));
  classSelect.innerHTML = '<option value="all">Todos os equipamentos</option>' + classes.map(value => '<option value="' + htmlEscape(value) + '">' + htmlEscape(itemClassLabel(value)) + '</option>').join("");
  classSelect.value = state.lootFilter.filterClass;
  const scopeItems = filterScopeItems().sort((a, b) => (catalogLevel(a) ?? Infinity) - (catalogLevel(b) ?? Infinity) || a.name.localeCompare(b.name, "pt-BR"));
  if (state.data && state.lootFilter.filterBaseId !== "all" && !scopeItems.some(item => String(item.id) === state.lootFilter.filterBaseId)) state.lootFilter.filterBaseId = "all";
  const baseSelect = byId("filter-base-select");
  baseSelect.innerHTML = '<option value="all">Todas as bases do tipo</option>' + scopeItems.map(item => '<option value="' + htmlEscape(item.id) + '">' + htmlEscape(item.name + (catalogLevel(item) == null ? "" : " · Nv. " + numberFormat(catalogLevel(item)))) + '</option>').join("");
  baseSelect.value = state.lootFilter.filterBaseId;
  document.querySelectorAll("[data-required-defense]").forEach(input => { input.checked = state.lootFilter.requiredDefenses.includes(input.dataset.requiredDefense); });
  byId("filter-min-drop-level").value = state.lootFilter.minDropLevel == null ? "" : state.lootFilter.minDropLevel;
  byId("filter-max-drop-level").value = state.lootFilter.maxDropLevel == null ? "" : state.lootFilter.maxDropLevel;
  const profile = filterProfileLabel();
  const matching = equipment.filter(matchesSharedFilterProfile);
  byId("filter-profile-title").textContent = state.lootFilter.filterClass === "all" ? (filterProfileIsActive() ? "Perfil personalizado" : "Todos os equipamentos") : itemClassLabel(state.lootFilter.filterClass);
  const secondary = [profile !== byId("filter-profile-title").textContent ? profile : "", state.lootFilter.excludedModifiers.length ? numberFormat(state.lootFilter.excludedModifiers.length) + " afixo(s) bloqueado(s)" : "", state.lootFilter.name || "Nenhum arquivo de jogo selecionado"].filter(Boolean);
  byId("filter-profile-summary").textContent = secondary.length ? secondary.join(" · ") : "Sem restrições de classe ou defesa.";
  byId("filter-match-count").textContent = numberFormat(matching.length);
  const scope = state.lootFilter.filterBaseId !== "all" ? scopeItems.find(item => String(item.id) === state.lootFilter.filterBaseId)?.name : state.lootFilter.filterClass === "all" ? "todos os equipamentos" : itemClassLabel(state.lootFilter.filterClass);
  byId("filter-affix-scope").textContent = "Escopo dos novos bloqueios: " + (scope || "todos os equipamentos") + ".";
  renderFilterModifierOptions();
  renderExcludedModifierList();
  renderHiddenBaseList();
  renderHighlightedBaseList();
  renderFilterOutputPreview();
}
function renderLootFilterPanel() {
  const loaded = !!(state.lootFilter && state.lootFilter.text);
  document.querySelectorAll("[data-filter-file-name]").forEach(name => { name.textContent = state.lootFilter.newFilterDraft ? "Novo filtro · ainda não salvo" : loaded ? state.lootFilter.name + (state.lootFilter.inGameFile ? " · arquivo selecionado" : " · importado, somente leitura") : "Nenhum filtro carregado"; });
  document.querySelectorAll("[data-filter-settings]").forEach(settings => { settings.hidden = !loaded; });
  document.querySelectorAll("[data-filter-needs-file]").forEach(note => { note.hidden = loaded; });
  if (byId("filter-bulk")) { byId("filter-bulk").hidden = !loaded; if (loaded) renderBulkHighlight(); }
  document.querySelectorAll("[data-filter-save]").forEach(button => { button.disabled = !loaded || !state.lootFilter.inGameFile || state.lootFilter.newFilterDraft; });
  document.querySelectorAll("[data-filter-new]").forEach(button => { button.disabled = state.lootFilter.newFilterDraft; });
  document.querySelectorAll("[data-new-filter-form]").forEach(form => { form.hidden = !state.lootFilter.newFilterDraft; });
  document.querySelectorAll("[data-new-filter-name]").forEach(input => { if (input.value !== state.lootFilter.newFilterName) input.value = state.lootFilter.newFilterName; });
  document.querySelectorAll("[data-filter-create-save]").forEach(button => { button.disabled = !state.lootFilter.newFilterDraft || !state.lootFilter.newFilterName.trim(); });
  document.querySelectorAll("[data-filter-base-count]").forEach(count => { count.textContent = numberFormat(state.lootFilter.hiddenBaseItems.length) + (state.lootFilter.hiddenBaseItems.length === 1 ? " base marcada" : " bases marcadas"); });
  document.querySelectorAll("[data-filter-hidden-count]").forEach(count => { count.textContent = numberFormat(state.lootFilter.hiddenBaseItems.length) + (state.lootFilter.hiddenBaseItems.length === 1 ? " base" : " bases") + " e " + numberFormat(state.lootFilter.hiddenClassRarities.length) + (state.lootFilter.hiddenClassRarities.length === 1 ? " classe marcada" : " classes marcadas"); });
  document.querySelectorAll("[data-hide-rarity]").forEach(input => {
    input.disabled = ALWAYS_VISIBLE_LOOT_RARITIES.has(input.dataset.hideRarity);
    input.title = input.disabled ? "Itens Raros e Únicos sempre aparecem no filtro." : "";
    input.checked = state.lootFilter.hiddenRarities.includes(input.dataset.hideRarity);
  });
  const weaponClasses = [...new Set(state.catalog.filter(item => item.catalogGroup === "weapons").map(item => item.item_class).filter(Boolean))]
    .sort((a, b) => itemClassLabel(a).localeCompare(itemClassLabel(b), "pt-BR"));
  const equipmentClasses = [...new Set(state.catalog.filter(item => item.catalogGroup === "equipment" && defenseProfile(item)).map(item => item.item_class).filter(Boolean))]
    .sort((a, b) => itemClassLabel(a).localeCompare(itemClassLabel(b), "pt-BR"));
  // Acessórios e patuás não têm defesa, então ficam fora da regra por defesa e entram na ocultação por tipo.
  const accessoryClasses = ACCESSORY_HIDE_CLASSES.filter(itemClass => state.catalog.some(item => ["gear", "charm"].includes(item.kind) && item.item_class === itemClass));
  const checkOptions = {
    equipClass: equipmentClasses.map(value => [value, itemClassLabel(value)]),
    equipDefense: HIDE_DEFENSE_OPTIONS,
    weaponClass: weaponClasses.map(value => [value, itemClassLabel(value)]),
    accessoryClass: accessoryClasses.map(value => [value, itemClassLabel(value)])
  };
  // Tipos de equipamento começam todos marcados; o resto começa desmarcado.
  if (!state.hideChecks.equipClass && equipmentClasses.length) state.hideChecks.equipClass = new Set(equipmentClasses);
  document.querySelectorAll("[data-check-list]").forEach(holder => {
    const key = holder.dataset.checkList;
    const selected = state.hideChecks[key] || new Set();
    holder.innerHTML = (checkOptions[key] || []).map(([value, label]) => '<label><input type="checkbox" data-check-item="' + key + '" value="' + htmlEscape(value) + '"' + (selected.has(value) ? " checked" : "") + '>' + htmlEscape(label) + '</label>').join("");
  });
  document.querySelectorAll("[data-equipment-hide-rules]").forEach(holder => {
    if (!state.lootFilter.hiddenEquipmentProfiles.length) {
      holder.innerHTML = '<span class="filter-empty-inline">Nenhuma regra de equipamento por defesa.</span>';
      return;
    }
    holder.innerHTML = state.lootFilter.hiddenEquipmentProfiles.map((profile, index) => {
      const defense = profile.defenses.map(value => ({ armour: "armadura", evasion: "evasão", energy_shield: "escudo de energia" })[value]).join(" + ");
      const rarities = profile.rarities.map(value => LOOT_FILTER_RARITIES.find(option => option.value === value)?.label || value).join(" e ");
      return '<div class="loot-filter-equipment-rule"><span><b>' + htmlEscape(profile.itemClass === "all" ? "Todos os equipamentos" : itemClassLabel(profile.itemClass)) + ' · ' + htmlEscape(defense) + '</b><small>Ocultar: ' + htmlEscape(rarities) + '</small></span><button type="button" data-remove-equipment-profile="' + index + '" aria-label="Remover regra">Remover</button></div>';
    }).join("");
  });
  document.querySelectorAll("[data-min-show-tier]").forEach(select => { select.value = state.lootFilter.minShowTier ? String(state.lootFilter.minShowTier) : ""; });
  document.querySelectorAll("[data-class-hide-rules]").forEach(holder => {
    if (!state.lootFilter.hiddenClassRarities.length) {
      holder.innerHTML = '<span class="filter-empty-inline">Nenhuma arma ou acessório ocultado.</span>';
      return;
    }
    holder.innerHTML = state.lootFilter.hiddenClassRarities.map((entry, index) => {
      const rarities = entry.rarities.map(value => LOOT_FILTER_RARITIES.find(option => option.value === value)?.label || value).join(" e ");
      return '<div class="loot-filter-equipment-rule"><span><b>' + htmlEscape(itemClassLabel(entry.itemClass)) + '</b><small>Ocultar: ' + htmlEscape(rarities) + '</small></span><button type="button" data-remove-class-hide="' + index + '" aria-label="Remover regra">Remover</button></div>';
    }).join("");
  });
  document.querySelectorAll("[data-hide-class-rarity]").forEach(input => {
    input.disabled = ALWAYS_VISIBLE_LOOT_RARITIES.has(input.dataset.hideClassRarity);
    if (input.disabled) input.checked = false;
  });
  const fileState = byId("filter-file-state");
  if (fileState) { fileState.textContent = state.lootFilter.newFilterDraft ? "NOVO FILTRO" : !loaded ? "SEM ARQUIVO" : state.lootFilter.inGameFile ? "CONECTADO AO JOGO" : "ARQUIVO IMPORTADO"; fileState.classList.toggle("is-connected", loaded && state.lootFilter.inGameFile && !state.lootFilter.newFilterDraft); }
  const characterFileName = byId("character-filter-file-name");
  if (characterFileName) characterFileName.textContent = state.lootFilter.newFilterDraft ? "Novo filtro (não salvo)" : loaded ? state.lootFilter.name : "Nenhum filtro selecionado";
  const profile = filterProfileLabel();
  document.querySelectorAll("[data-filter-profile-display]").forEach(element => { element.textContent = profile; });
  const characterProfile = byId("character-filter-profile");
  if (characterProfile) characterProfile.textContent = "Perfil: " + profile + ". Classe, defesas e nível filtram as duas listas; ocultações e afixos seguem o arquivo.";
  renderFilterManager();
  if (state.data) renderCatalog();
}
async function showLootFilterFiles(target = "filter-loot-file-list") {
  const list = byId(target);
  if (!list) return;
  list.hidden = false;
  list.innerHTML = '<div class="loot-filter-file-message">Procurando arquivos na pasta do Path of Exile 2…</div>';
  try {
    const response = await fetch("/api/loot-filters");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Não consegui acessar a pasta de filtros.");
    const folder = htmlEscape(result.directory || "Pasta de filtros do jogo não encontrada");
    const files = result.filters || [];
    list.innerHTML = '<div class="loot-filter-directory">Pasta do jogo: <code>' + folder + '</code></div>' + (files.length ? '<div class="loot-filter-file-options">' + files.map(file => '<button type="button" class="loot-filter-file-option" data-loot-filter-file="' + htmlEscape(file.name) + '" data-filter-list-target="' + htmlEscape(target) + '"><span>▤</span><span><b>' + htmlEscape(file.name) + '</b><small>' + dateFormat(file.modifiedAt) + ' · ' + numberFormat(Math.max(1, Math.round(file.size / 1024))) + ' KB</small></span><i>Carregar</i></button>').join("") + '</div>' : '<div class="loot-filter-file-message">Nenhum arquivo <code>.filter</code> foi encontrado nesta pasta. Você ainda pode importar um arquivo de outra pasta.</div>');
    list.querySelectorAll("[data-loot-filter-file]").forEach(button => button.addEventListener("click", () => loadLootFilterFile(button.dataset.lootFilterFile, button.dataset.filterListTarget)));
  } catch (error) {
    list.innerHTML = '<div class="loot-filter-file-message">' + htmlEscape(error.message || "Não consegui listar os filtros do jogo.") + '</div>';
  }
}
// Em outro PC a pasta "My Games" pode estar em outro lugar: o jogador escolhe e o servidor guarda.
async function pickLootFilterFolder(button) {
  const target = button.dataset.filterList || "filter-loot-file-list";
  button.disabled = true;
  showToast("Escolha a pasta dos filtros na janela que abriu.");
  try {
    const response = await fetch("/api/loot-filter/folder", { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Não consegui usar essa pasta.");
    if (result.canceled) return;
    await showLootFilterFiles(target);
    showToast((result.filters || []).length ? "Pasta salva. Escolha o seu filtro na lista." : "Pasta salva, mas não tem nenhum arquivo .filter nela.");
  } catch (error) { showToast(error.message || "Não consegui usar essa pasta."); }
  finally { button.disabled = false; }
}
async function loadLootFilterFile(name, listTarget = "filter-loot-file-list") {
  try {
    const response = await fetch("/api/loot-filter/load", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Não consegui abrir esse filtro.");
    const sameFile = state.lootFilter.name === result.name;
    state.lootFilter.name = result.name;
    state.lootFilter.text = result.text;
    state.lootFilter.inGameFile = true;
    state.lootFilter.newFilterDraft = false;
    state.lootFilter.newFilterName = "";
    discardLootFilterDraftBackup();
    if (!sameFile) restoreLootFilterOptionsFromText(result.text);
    saveLootFilter(); renderLootFilterPanel();
    if (byId(listTarget)) byId(listTarget).hidden = true;
    showToast("Filtro carregado da pasta do jogo.");
  } catch (error) { showToast(error.message || "Não consegui abrir esse filtro."); }
}
async function importLootFilterFile(file) {
  if (!file) return;
  try {
    const text = await file.text();
    if (!text.trim()) throw new Error("O arquivo selecionado está vazio.");
    const sameFile = state.lootFilter.name === file.name;
    state.lootFilter.name = file.name;
    state.lootFilter.text = text;
    state.lootFilter.inGameFile = false;
    state.lootFilter.newFilterDraft = false;
    state.lootFilter.newFilterName = "";
    discardLootFilterDraftBackup();
    if (!sameFile) restoreLootFilterOptionsFromText(text);
    saveLootFilter(); renderLootFilterPanel();
    showToast("Filtro importado. Para salvar por cima, selecione-o pela lista da pasta do jogo.");
  } catch (error) { showToast(error.message || "Não consegui ler esse filtro."); }
}
// Classes do jogo (nome do filtro) de armas, mãos secundárias, armaduras, acessórios e patuás; joias e relíquias ficam de fora.
function equipmentFilterClassNames() {
  const classes = new Set();
  for (const item of state.catalog) {
    if (!["gear", "charm"].includes(item.kind) ||["Jewel", "Relic", "SanctumSpecialRelic", "TrapTool"].includes(item.item_class)) continue;
    const name = filterGameClassName(item.item_class);
    if (name && !/["\r\n]/.test(name)) classes.add(name);
  }
  return [...classes].sort();
}
// Os 20 únicos mais caros (poe.ninja, liga Forbidden Rites, 28/10/2026). Nunca ficam ocultos:
// todo filtro gerado pelo Atlas começa com um Show deles, no visual pronto Inferno (fonte 30).
const PROTECTED_UNIQUES = [
  "Temporalis", "Runeseeker's Call", "Voices", "Mageblood", "Eshtera's Path", "Grand Spectrum", "Death Articulated",
  "Tabula Rasa", "Alpha's Howl", "Against the Darkness", "Headhunter", "Forgotten Warden", "Silks of Veneration",
  "Olroth's Resolve", "The Ordained", "Rathpith Globe", "Rite of Passage", "The Taming", "Atziri's Step", "Morior Invictus"
];
// Do 21º ao 50º lugar (mesma consulta): também sempre visíveis, no visual "Real" com fonte 30.
const PROTECTED_UNIQUES_TIER2 = [
  "The Adorned", "Controlled Metamorphosis", "The Grand Project", "Decree of Flight", "Decree of Acuity", "Skin of the Loyal",
  "Myris Uxor", "Queen of the Forest", "Brutus' Lead Sprinkler", "Rampart Raptor", "Twisted Empyrean", "Maligaro's Virtuosity",
  "Hyrri's Ire", "The Mutable Star", "Prism Guardian", "Loreweave", "Dream Fragments", "Mjölner", "Sandstorm Visage",
  "Cloak of Defiance", "The Vertex", "Sacrosanctum", "Atziri's Splendour", "Choir of the Storm", "Safrin's Resolve",
  "Svalinn", "The Flesh Poppet", "Kalandra's Touch", "The Coming Calamity", "Visions of Paradise"
];
// Visuais prontos reservados aos únicos valiosos: Inferno no top 20, Real do 21º ao 50º (fonte 30).
// Por isso não aparecem na escolha de estilo dos outros itens.
const PROTECTED_UNIQUE_PRESET_IDS = new Set(["inferno", "royal"]);
const SELECTABLE_HIGHLIGHT_PRESETS = LOOT_HIGHLIGHT_PRESETS.filter(preset => !PROTECTED_UNIQUE_PRESET_IDS.has(preset.id));
function protectedPresetStyle(id) {
  const preset = LOOT_HIGHLIGHT_PRESETS.find(option => option.id === id);
  return { textColor: preset.textColor, borderColor: preset.borderColor, backgroundColor: preset.backgroundColor, backgroundOpacity: 255, fontSize: 30, minimapIcon: true, iconSize: 1, iconColor: preset.effectColor, iconShape: preset.iconShape, beam: true, beamColor: preset.effectColor };
}
const PROTECTED_UNIQUE_STYLE = protectedPresetStyle("inferno");
const PROTECTED_UNIQUE_TIER2_STYLE = protectedPresetStyle("royal");
// Bases que o poe.ninja registra além da base do catálogo (o Espectro Grandioso aparece em três joias).
const PROTECTED_UNIQUE_EXTRA_BASES = { "Grand Spectrum": ["Ruby", "Emerald", "Sapphire"] };
function protectedUniqueTier(item) {
  if (!item || item.kind !== "unique") return 0;
  return PROTECTED_UNIQUES.includes(item.englishName) ? 1 : PROTECTED_UNIQUES_TIER2.includes(item.englishName) ? 2 : 0;
}
function isProtectedUnique(item) { return protectedUniqueTier(item) > 0; }
function protectedUniqueStyleFor(item) { return protectedUniqueTier(item) === 2 ? PROTECTED_UNIQUE_TIER2_STYLE : PROTECTED_UNIQUE_STYLE; }
function protectedUniqueLines() {
  const baseNames = new Set(Object.values((state.data && state.data.base_items) || {}).filter(base => base.release_state !== "unreleased").map(base => base.name));
  const basesFor = names => {
    const baseTypes = new Set();
    for (const name of names) {
      const item = state.catalog.find(entry => isProtectedUnique(entry) && entry.englishName === name);
      const bases = [...(item ? [filterBaseTypeForItem(item)] : []), ...(PROTECTED_UNIQUE_EXTRA_BASES[name] || [])];
      // Versões rúnicas da mesma base também podem vir únicas (ex.: Temporalis em Runemastered Silk Robe).
      for (const base of bases) for (const variant of [base, "Runeforged " + base, "Runemastered " + base]) if (baseNames.has(variant) && !/["\r\n]/.test(variant)) baseTypes.add(variant);
    }
    return baseTypes;
  };
  const top = basesFor(PROTECTED_UNIQUES);
  // Base já coberta pelo top 20 fica só lá: a primeira regra que casa vence.
  const tier2 = [...basesFor(PROTECTED_UNIQUES_TIER2)].filter(base => !top.has(base));
  const lines = [];
  for (const [title, style, list] of [["# Únicos valiosos (top 20): sempre visíveis", PROTECTED_UNIQUE_STYLE, [...top]], ["# Únicos valiosos (21º ao 50º): sempre visíveis", PROTECTED_UNIQUE_TIER2_STYLE, tier2]]) {
    if (!list.length) continue;
    const entry = normalizeHighlightEntry({ ...DEFAULT_LOOT_HIGHLIGHT_STYLE, ...style, id: "Unique/protegidos", baseType: "protegidos" });
    list.sort();
    lines.push(title);
    for (let index = 0; index < list.length; index += 30) lines.push(...highlightRuleLines(entry, list.slice(index, index + 30)), "");
  }
  return lines;
}
function generatedLootFilterBlock() {
  const rarities = state.lootFilter.hiddenRarities.filter(rarity => !ALWAYS_VISIBLE_LOOT_RARITIES.has(rarity));
  const validBaseItems = state.lootFilter.hiddenBaseItems.filter(item => item.baseType && !/["\r\n]/.test(item.baseType));
  const usesRarity = entry => { const item = catalogItemForFilterEntry(entry); return !item || RARITY_FILTER_KINDS.has(item.kind); };
  const baseItems = validBaseItems.filter(item => !uncutGemLevel(item.id) && usesRarity(item));
  const plainItems = validBaseItems.filter(item => !uncutGemLevel(item.id) && !usesRarity(item)).map(item => item.baseType);
  const uncutItems = validBaseItems.filter(item => uncutGemLevel(item.id));
  const config = encodeURIComponent(JSON.stringify({
    filterClass: state.lootFilter.filterClass, filterBaseId: state.lootFilter.filterBaseId,
    requiredDefenses: state.lootFilter.requiredDefenses, minDropLevel: state.lootFilter.minDropLevel,
    maxDropLevel: state.lootFilter.maxDropLevel, excludedModifiers: state.lootFilter.excludedModifiers,
    hiddenClassRarities: state.lootFilter.hiddenClassRarities,
    hiddenEquipmentProfiles: state.lootFilter.hiddenEquipmentProfiles,
    highlightedItems: state.lootFilter.highlightedItems, minShowTier: state.lootFilter.minShowTier
  }));
  const lines = ["# BEGIN ATLAS WRAECLAST CUSTOM RULES", "# ATLAS_CONFIG " + config, ""];
  // Únicos valiosos vêm antes de tudo, em qualquer filtro: nenhuma regra de ocultar chega neles.
  lines.push(...protectedUniqueLines());
  // Os destaques vêm antes de todas as ocultações (raridade, base, classe,
  // perfil, modificador): a primeira regra que casa vence, então o que está
  // destacado sempre aparece.
  // Destaques de únicos (Rarity Unique na mesma base) vêm antes do destaque da base comum.
  const highlights = [...state.lootFilter.highlightedItems].sort((a, b) => Number(isUniqueCatalogId(b.id)) - Number(isUniqueCatalogId(a.id)));
  // Itens com o mesmo visual viram um bloco só (ex.: todas as essências), em vez de um bloco por item.
  const highlightGroups = new Map();
  for (const entry of highlights) {
    const key = JSON.stringify([isUniqueCatalogId(entry.id), !!uncutGemLevel(entry.id), highlightProfileStyle(entry)]);
    if (!highlightGroups.has(key)) highlightGroups.set(key, []);
    highlightGroups.get(key).push(entry);
  }
  for (const group of highlightGroups.values()) {
    const baseTypes = [...new Set(group.map(entry => uncutGemLevel(entry.id) ? uncutFilterBaseType(entry) : entry.baseType))];
    for (let index = 0; index < baseTypes.length; index += 30) lines.push(...highlightRuleLines(group[0], baseTypes.slice(index, index + 30)), "");
  }
  for (const rarity of HIDEABLE_LOOT_RARITIES) {
    const matchingBases = baseItems.filter(item => !item.rarities || !item.rarities.length || item.rarities.includes(rarity.value)).map(item => item.baseType);
    for (let index = 0; index < matchingBases.length; index += 20) {
      const group = matchingBases.slice(index, index + 20);
      lines.push("Hide", "\tRarity " + rarity.value, "\tBaseType == " + group.map(name => '"' + name + '"').join(" "), "");
    }
  }
  for (let index = 0; index < plainItems.length; index += 20) lines.push("Hide", "\tBaseType == " + plainItems.slice(index, index + 20).map(name => '"' + name + '"').join(" "), "");
  // Gemas brutas não têm raridade Normal/Mágica no filtro: a regra usa a base e o nível.
  for (const entry of uncutItems) lines.push("Hide", '\tBaseType == "' + uncutFilterBaseType(entry) + '"', "");
  for (const entry of state.lootFilter.hiddenClassRarities) {
    const className = filterGameClassName(entry.itemClass);
    if (!className || /["\r\n]/.test(className)) continue;
    for (const rarity of entry.rarities.filter(value => !ALWAYS_VISIBLE_LOOT_RARITIES.has(value))) {
      lines.push("Hide", "\tRarity " + rarity, '\tClass "' + className + '"', "");
    }
  }
  for (const profile of state.lootFilter.hiddenEquipmentProfiles) {
    const matchingBases = state.catalog
      .filter(item => item.kind === "gear" && item.catalogGroup === "equipment" && (profile.itemClass === "all" || item.item_class === profile.itemClass) && defenseProfile(item) === profile.defenses.join(","))
      .map(filterBaseTypeForItem)
      .filter(baseType => baseType && !/["\r\n]/.test(baseType));
    for (const rarity of profile.rarities.filter(value => !ALWAYS_VISIBLE_LOOT_RARITIES.has(value))) {
      for (let index = 0; index < matchingBases.length; index += 20) {
        const group = matchingBases.slice(index, index + 20);
        if (group.length) lines.push("Hide", "\tRarity " + rarity, "\tBaseType == " + group.map(name => '"' + name + '"').join(" "), "");
      }
    }
  }
  // Itens não identificados mostram o nível (Tier 2–5) no nome: a partir do escolhido, aparecem mesmo
  // com a ocultação geral por raridade. Fica depois das ocultações por base, tipo e defesa, que são
  // escolhas explícitas e vencem (varinha oculta não volta só por ser nível 5).
  if (state.lootFilter.minShowTier) lines.push("Show", "\tUnidentifiedItemTier >= " + state.lootFilter.minShowTier, "");
  // No filtro do jogo orbes, runas, poções e pedras-guia também são "Normal":
  // a ocultação geral por raridade fica limitada às classes de armas e equipamentos.
  const equipmentClasses = equipmentFilterClassNames();
  if (equipmentClasses.length) for (const rarity of rarities) lines.push("Hide", "\tRarity " + rarity, "\tClass == " + equipmentClasses.map(name => '"' + name + '"').join(" "), "");
  lines.push("# ATLAS_PROFILE_BASES_BEGIN");
  lines.push("# O perfil limita a Wiki e Meu personagem; bases só são ocultadas quando marcadas explicitamente.");
  lines.push("# ATLAS_PROFILE_BASES_END");
  for (const entry of state.lootFilter.excludedModifiers) {
    if (!entry.name || /["\r\n]/.test(entry.name)) continue;
    const scope = [];
    if (entry.baseType && !/["\r\n]/.test(entry.baseType)) scope.push('\tBaseType == "' + entry.baseType + '"');
    else if (entry.itemClass !== "all") scope.push('\tClass "' + filterGameClassName(entry.itemClass) + '"');
    for (const rarity of HIDEABLE_LOOT_RARITIES) lines.push("Hide", "\tRarity " + rarity.value, ...scope, '\tHasExplicitMod "' + entry.name + '"', "");
  }
  lines.push("# END ATLAS WRAECLAST CUSTOM RULES");
  const hasProfile = filterProfileIsActive();
  return (rarities.length || validBaseItems.length || state.lootFilter.hiddenClassRarities.length || state.lootFilter.hiddenEquipmentProfiles.length || state.lootFilter.excludedModifiers.length || state.lootFilter.highlightedItems.length || state.lootFilter.minShowTier || hasProfile) ? lines.join("\n") : "";
}
function hexToFilterRgb(hex) {
  const value = parseInt(String(hex).slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].join(" ");
}
function highlightRuleLines(entry, baseTypes) {
  const lines = ["Show"];
  const uncutLevel = uncutGemLevel(entry.id);
  // Destaque de único casa só com Rarity Unique; sem isso, a base inteira (normal, mágica, rara) fica destacada.
  if (isUniqueCatalogId(entry.id)) lines.push("\tRarity Unique");
  else if (!uncutLevel && entry.rarities.length && entry.rarities.length < LOOT_FILTER_RARITIES.length) lines.push("\tRarity " + entry.rarities.join(" "));
  lines.push("\tBaseType == " + (baseTypes || [uncutLevel ? uncutFilterBaseType(entry) : entry.baseType]).map(name => '"' + name + '"').join(" "));
  lines.push("\tSetFontSize " + entry.fontSize);
  lines.push("\tSetTextColor " + hexToFilterRgb(entry.textColor) + " 255");
  lines.push("\tSetBorderColor " + hexToFilterRgb(entry.borderColor) + " 255");
  lines.push("\tSetBackgroundColor " + hexToFilterRgb(entry.backgroundColor) + " " + entry.backgroundOpacity);
  if (entry.minimapIcon) lines.push("\tMinimapIcon " + entry.iconSize + " " + entry.iconColor + " " + entry.iconShape);
  if (entry.beam) lines.push("\tPlayEffect " + entry.beamColor + (entry.beamTemporary ? " Temp" : ""));
  if (entry.sound) lines.push("\tPlayAlertSound " + entry.soundId + " " + entry.soundVolume);
  return lines;
}
function filterGameClassName(itemClass) {
  const names = {
    "Body Armour": "Body Armours", Helmet: "Helmets", Bow: "Bows", Crossbow: "Crossbows", Ring: "Rings", Amulet: "Amulets", Belt: "Belts", Glove: "Gloves", Gloves: "Gloves", Boot: "Boots", Boots: "Boots", Shield: "Shields", Buckler: "Bucklers", Quiver: "Quivers", Focus: "Foci", Sceptre: "Sceptres", Staff: "Staves", Wand: "Wands", Spear: "Spears", Flail: "Flails", Claw: "Claws", Dagger: "Daggers", Talisman: "Talismans", TrapTool: "Traps", UtilityFlask: "Charms", Quarterstaff: "Quarterstaves", "One Hand Axe": "One Hand Axes", "Two Hand Axe": "Two Hand Axes", "One Hand Mace": "One Hand Maces", "Two Hand Mace": "Two Hand Maces", "One Hand Sword": "One Hand Swords", "Two Hand Sword": "Two Hand Swords", Warstaff: "Quarterstaves"
  };
  return names[itemClass] || itemClass;
}
function prepareLootFilterForExport(originalText) {
  const hadBom = originalText.startsWith("\uFEFF");
  const lineEnding = originalText.includes("\r\n") ? "\r\n" : "\n";
  const original = stripGeneratedLootFilterBlock(originalText);
  const block = generatedLootFilterBlock().replace(/\n/g, lineEnding);
  const content = block ? block + lineEnding + original.replace(/^\r?\n+/, "") : original;
  return (hadBom ? "\uFEFF" : "") + content;
}
function renderFilterOutputPreview() {
  const preview = byId("filter-output-preview");
  if (!preview) return;
  const block = generatedLootFilterBlock();
  preview.textContent = block ? block.replace(/^# ATLAS_CONFIG .*$/m, "# Perfil salvo junto às regras")
    .replace(/^# ATLAS_PROFILE_BASES_BEGIN$/m, "# Perfil da Wiki e de Meu personagem; não oculta bases no jogo")
    .replace(/^# ATLAS_PROFILE_BASES_END$/m, "")
    .replace(/\n{3,}/g, "\n\n") : "# Nenhuma regra personalizada ativa.\n# Selecione uma classe, defesa, raridade ou modificador para começar.";
}
function blockSearchedModifiers() {
  const query = state.filterModifierSearch.trim();
  if (query.length < 2) return;
  const matches = searchFilterModifiers();
  if (matches.length > 200) { showToast("Refine a busca para aplicar o bloqueio a menos afixos."); return; }
  const itemClass = state.lootFilter.filterClass;
  const base = state.catalog.find(item => item.kind === "gear" && String(item.id) === state.lootFilter.filterBaseId);
  const baseType = base ? filterBaseTypeForItem(base) : "";
  const available = matches.filter(({ id }) => !filterModifierAlreadyExcluded(id, itemClass, baseType));
  if (!available.length) return;
  for (const { id, mod } of available) state.lootFilter.excludedModifiers.push({ id, name: String(mod.name), type: mod.generation_type, itemClass, baseType });
  saveLootFilter();
  renderLootFilterPanel();
  showToast(numberFormat(available.length) + " modificador(es) bloqueado(s) no escopo selecionado.");
}
function stripGeneratedLootFilterBlock(text) {
  return String(text || "").replace(/^\uFEFF/, "").replace(/^# BEGIN ATLAS WRAECLAST CUSTOM RULES\r?\n[\s\S]*?^# END ATLAS WRAECLAST CUSTOM RULES(?:\r?\n)?/m, "");
}
async function saveLootFilterFile() {
  if (!state.lootFilter.inGameFile) { showToast("Selecione o filtro pela lista da pasta do jogo para salvar por cima dele."); return; }
  const text = prepareLootFilterForExport(state.lootFilter.text);
  try {
    const response = await fetch("/api/loot-filter/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: state.lootFilter.name, text }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Não consegui salvar o filtro selecionado.");
    state.lootFilter.text = text;
    state.lootFilter.inGameFile = true;
    saveLootFilter(); renderLootFilterPanel();
    showToast("Alterações salvas por cima de " + result.name + ".");
  } catch (error) { showToast(error.message || "Não consegui salvar o filtro selecionado."); }
}
async function createLootFilterFile() {
  if (!state.lootFilter.newFilterDraft) return;
  const requestedName = state.lootFilter.newFilterName.trim();
  if (!requestedName) { showToast("Digite o nome do novo filtro antes de salvar."); return; }
  const name = requestedName.toLowerCase().endsWith(".filter") ? requestedName : requestedName + ".filter";
  const text = prepareLootFilterForExport(state.lootFilter.text || "Show\n");
  document.querySelectorAll("[data-filter-create-save]").forEach(button => { button.disabled = true; });
  try {
    const response = await fetch("/api/loot-filter/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, text }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Não consegui criar o novo filtro.");
    state.lootFilter.name = result.name;
    state.lootFilter.text = text;
    state.lootFilter.inGameFile = true;
    state.lootFilter.newFilterDraft = false;
    state.lootFilter.newFilterName = "";
    discardLootFilterDraftBackup();
    saveLootFilter(); renderLootFilterPanel();
    showToast("Novo filtro salvo na pasta do jogo como " + result.name + ".");
  } catch (error) {
    renderLootFilterPanel();
    showToast(error.message || "Não consegui criar o novo filtro.");
  }
}
function bindLootFilterItemControl(item) {
  const control = byId("loot-filter-base-toggle");
  if (!control) return;
  const id = String(item.id);
  const rarityControls = [...byId("loot-filter-base-rarities").querySelectorAll("[data-base-hide-rarity]")];
  const selectedEntry = () => state.lootFilter.hiddenBaseItems.find(entry => sameFilterBase(entry, item));
  const newEntryBaseType = String(item.englishName || item.name);
  const entry = selectedEntry();
  control.checked = !!entry;
  rarityControls.forEach(input => {
    input.disabled = ALWAYS_VISIBLE_LOOT_RARITIES.has(input.dataset.baseHideRarity);
    input.title = input.disabled ? "Itens Raros e Únicos sempre aparecem no filtro." : "";
    input.checked = !!entry && (entry.rarities || []).includes(input.dataset.baseHideRarity);
  });
  control.addEventListener("change", () => {
    if (control.checked) {
      if (!selectedEntry()) state.lootFilter.hiddenBaseItems.push({ id, baseType: newEntryBaseType, rarities: [] });
    } else state.lootFilter.hiddenBaseItems = state.lootFilter.hiddenBaseItems.filter(entry => !sameFilterBase(entry, item));
    saveLootFilter(); renderLootFilterPanel();
    rarityControls.forEach(input => { input.checked = control.checked && (selectedEntry()?.rarities || []).includes(input.dataset.baseHideRarity); });
  });
  rarityControls.forEach(input => input.addEventListener("change", () => {
    if (ALWAYS_VISIBLE_LOOT_RARITIES.has(input.dataset.baseHideRarity)) { input.checked = false; return; }
    let selected = selectedEntry();
    if (!selected) {
      selected = { id, baseType: newEntryBaseType, rarities: [] };
      state.lootFilter.hiddenBaseItems.push(selected);
    }
    selected.rarities = rarityControls.filter(option => option.checked).map(option => option.dataset.baseHideRarity);
    control.checked = true;
    saveLootFilter(); renderLootFilterPanel();
  }));
}
// Equipamentos, poções, patuás e afins são ocultados por raridade; moedas, runas, gemas e itens de liga só pela base.
const RARITY_FILTER_KINDS = new Set(["gear", "potion", "charm", "waystone", "trial"]);
function renderLootFilterBaseControl(item) {
  // Ocultar um único ocultaria a base comum inteira: únicos só têm destaque.
  if (item.kind === "unique" || !state.lootFilter.text) return "";
  const rarities = LOOT_FILTER_RARITIES.map(option => {
    const alwaysVisible = ALWAYS_VISIBLE_LOOT_RARITIES.has(option.value);
    return '<label><input type="checkbox" data-base-hide-rarity="' + option.value + '"' + (alwaysVisible ? ' disabled title="Itens Raros e Únicos sempre aparecem no filtro."' : '') + '>' + option.label + (alwaysVisible ? ' · sempre visível' : '') + '</label>';
  }).join("");
  return '<section class="detail-section loot-filter-base-control"><h3>FILTRO DE ITENS DO JOGO</h3><label class="loot-filter-base-toggle-label"><input id="loot-filter-base-toggle" type="checkbox"><span><b>Ocultar esta base no filtro</b><small>Nome original: ' + htmlEscape(item.englishName || item.name) + '</small></span></label><div id="loot-filter-base-rarities" class="loot-filter-base-rarities"' + (RARITY_FILTER_KINDS.has(item.kind) ? "" : " hidden") + '><span>RARIDADES PARA OCULTAR</span><div>' + rarities + '</div><small>Marque as raridades que deseja ocultar.</small></div></section>';
}

function highlightEntryFor(item) {
  return state.lootFilter.highlightedItems.find(entry => sameFilterBase(entry, item)) || null;
}
function hexToRgba(hex, alpha) {
  const value = parseInt(String(hex).slice(1), 16);
  return "rgba(" + ((value >> 16) & 255) + "," + ((value >> 8) & 255) + "," + (value & 255) + "," + (alpha / 255).toFixed(3) + ")";
}
function effectColorHex(value) { return (FILTER_EFFECT_COLORS.find(option => option.value === value) || FILTER_EFFECT_COLORS[0]).hex; }
function highlightLabelStyle(style) {
  return "color:" + style.textColor + ";border-color:" + style.borderColor + ";background:" + hexToRgba(style.backgroundColor, style.backgroundOpacity) + ";font-size:" + (style.fontSize * 0.36).toFixed(1) + "px";
}
function highlightRarityLabel(entry) {
  return entry.rarities.length && entry.rarities.length < LOOT_FILTER_RARITIES.length ? entry.rarities.map(value => LOOT_FILTER_RARITIES.find(option => option.value === value)?.label || value).join(", ") : "Todas as raridades";
}
function renderLootFilterHighlightControl(item) {
  if (!state.lootFilter.text) return "";
  const englishName = item.englishName || item.name;
  const rarities = LOOT_FILTER_RARITIES.map(option => '<label><input type="checkbox" data-highlight-rarity="' + option.value + '">' + option.label + '</label>').join("");
  const presets = SELECTABLE_HIGHLIGHT_PRESETS.map(preset => '<button type="button" class="loot-highlight-preset" data-highlight-preset="' + preset.id + '" title="' + htmlEscape(preset.label) + '" style="' + highlightLabelStyle({ ...preset, backgroundOpacity: 255, fontSize: 30 }) + '">' + htmlEscape(preset.label) + '</button>').join("");
  const colorField = (field, label) => '<label class="loot-highlight-color"><span>' + label + '</span><span class="loot-highlight-color-input"><input type="color" data-highlight-field="' + field + '"><code data-highlight-hex="' + field + '"></code></span></label>';
  const swatches = field => '<div class="loot-highlight-swatches" role="radiogroup">' + FILTER_EFFECT_COLORS.map(option => '<button type="button" role="radio" data-highlight-swatch="' + field + '" data-value="' + option.value + '" title="' + option.label + '" aria-label="' + option.label + '" style="background:' + option.hex + '"></button>').join("") + '</div>';
  const shapes = FILTER_ICON_SHAPES.map(option => '<option value="' + option.value + '">' + option.glyph + " " + option.label + '</option>').join("");
  const sizes = FILTER_ICON_SIZES.map(option => '<option value="' + option.value + '">' + option.label + '</option>').join("");
  const sounds = Array.from({ length: 16 }, (_, index) => '<option value="' + (index + 1) + '">Som ' + (index + 1) + '</option>').join("");
  return '<section class="detail-section loot-filter-base-control loot-highlight-control"><label class="loot-filter-base-toggle-label"><input id="loot-highlight-toggle" type="checkbox"><span><b>Destacar esta base no filtro</b><small>Muda a cor do nome no chão, e opcionalmente adiciona ícone no minimapa, feixe de luz e som.</small></span></label>'
    + '<div id="loot-highlight-settings" class="loot-highlight-settings" hidden>'
    + '<div class="loot-highlight-group loot-highlight-profiles" id="loot-highlight-profiles"></div>'
    + '<div class="loot-highlight-preview" aria-label="Prévia do destaque"><div class="loot-highlight-ground"><span class="loot-highlight-beam" id="loot-highlight-beam"></span><span class="loot-highlight-label" id="loot-highlight-label">' + htmlEscape(englishName) + '</span></div><div class="loot-highlight-minimap"><span>MINIMAPA</span><b id="loot-highlight-icon"></b></div></div>'
    + '<div class="loot-highlight-group"' + (["uncut", "gem"].includes(item.kind) ? " hidden" : "") + '><span class="loot-highlight-heading">RARIDADES PARA DESTACAR</span><div class="loot-highlight-row">' + rarities + '</div><small id="loot-highlight-hidden-note" hidden>O destaque vence a ocultação: as raridades marcadas aqui aparecem mesmo se estiverem ocultas.</small></div>'
    + '<div class="loot-highlight-group"><span class="loot-highlight-heading">ESTILOS PRONTOS</span><div class="loot-highlight-presets">' + presets + '</div></div>'
    + '<div class="loot-highlight-group"><span class="loot-highlight-heading">CORES DO NOME</span><div class="loot-highlight-colors">' + colorField("textColor", "Texto") + colorField("borderColor", "Borda") + colorField("backgroundColor", "Fundo") + '</div>'
    + '<label class="loot-highlight-range"><span>Opacidade do fundo</span><input type="range" min="0" max="255" step="1" data-highlight-field="backgroundOpacity"><output data-highlight-output="backgroundOpacity"></output></label>'
    + '<label class="loot-highlight-range"><span>Tamanho da fonte</span><input type="range" min="18" max="45" step="1" data-highlight-field="fontSize"><output data-highlight-output="fontSize"></output></label></div>'
    + '<div class="loot-highlight-group"><label class="loot-highlight-switch"><input type="checkbox" data-highlight-field="minimapIcon"><span class="loot-highlight-heading">ÍCONE NO MINIMAPA</span></label><div class="loot-highlight-sub" data-highlight-sub="minimapIcon">' + swatches("iconColor") + '<div class="loot-highlight-row"><label class="loot-highlight-select"><span>Forma</span><select data-highlight-field="iconShape">' + shapes + '</select></label><label class="loot-highlight-select"><span>Tamanho</span><select data-highlight-field="iconSize">' + sizes + '</select></label></div></div></div>'
    + '<div class="loot-highlight-group"><label class="loot-highlight-switch"><input type="checkbox" data-highlight-field="beam"><span class="loot-highlight-heading">FEIXE DE LUZ</span></label><div class="loot-highlight-sub" data-highlight-sub="beam">' + swatches("beamColor") + '<label class="loot-highlight-inline"><input type="checkbox" data-highlight-field="beamTemporary">Só no momento em que o item cai</label></div></div>'
    + '<div class="loot-highlight-group"><label class="loot-highlight-switch"><input type="checkbox" data-highlight-field="sound"><span class="loot-highlight-heading">SOM DE ALERTA</span></label><div class="loot-highlight-sub" data-highlight-sub="sound"><div class="loot-highlight-row"><label class="loot-highlight-select"><span>Som do jogo</span><select data-highlight-field="soundId">' + sounds + '</select></label><label class="loot-highlight-range"><span>Volume</span><input type="range" min="0" max="300" step="10" data-highlight-field="soundVolume"><output data-highlight-output="soundVolume"></output></label></div></div></div>'
    + '<div class="loot-highlight-footer"><small>Use Salvar na aba Filtro para gravar no arquivo do jogo. Prévia aproximada: o jogo desenha o nome em inglês.</small><button type="button" id="loot-highlight-reset">Restaurar padrão</button></div>'
    + '</div></section>';
}
function bindLootFilterHighlightControl(item) {
  const toggle = byId("loot-highlight-toggle");
  if (!toggle) return;
  const settings = byId("loot-highlight-settings");
  const root = settings.closest(".loot-highlight-control");
  // Mantém o último estilo usado mesmo se a caixa for desmarcada e marcada de novo.
  // Único novo: destaca só a raridade Única da base (o filtro não diferencia únicos pelo nome).
  let draft = normalizeHighlightEntry({ ...DEFAULT_LOOT_HIGHLIGHT_STYLE, ...(item.kind === "unique" ? { rarities: ["Unique"] } : {}), ...(highlightEntryFor(item) || {}), id: String(item.id), baseType: filterBaseTypeForItem(item) });
  const current = () => highlightEntryFor(item);
  const commit = (refreshPanel) => {
    draft = normalizeHighlightEntry(draft);
    const entry = current();
    if (entry) Object.assign(entry, draft);
    saveLootFilter();
    paint();
    if (refreshPanel) renderLootFilterPanel();
  };
  const paint = () => {
    const enabled = !!current();
    toggle.checked = enabled;
    settings.hidden = !enabled;
    root.querySelectorAll("[data-highlight-field]").forEach(input => {
      const value = draft[input.dataset.highlightField];
      if (input.type === "checkbox") input.checked = !!value;
      else if (document.activeElement !== input || input.type !== "range") input.value = String(value);
    });
    root.querySelectorAll("[data-highlight-hex]").forEach(code => { code.textContent = draft[code.dataset.highlightHex].toUpperCase(); });
    root.querySelectorAll("[data-highlight-output]").forEach(output => {
      const field = output.dataset.highlightOutput;
      output.textContent = field === "backgroundOpacity" ? Math.round(draft[field] / 255 * 100) + "%" : String(draft[field]);
    });
    root.querySelectorAll("[data-highlight-sub]").forEach(sub => { sub.classList.toggle("is-off", !draft[sub.dataset.highlightSub]); });
    root.querySelectorAll("[data-highlight-swatch]").forEach(button => {
      const selected = draft[button.dataset.highlightSwatch] === button.dataset.value;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-checked", String(selected));
    });
    root.querySelectorAll("[data-highlight-rarity]").forEach(input => { input.checked = !draft.rarities.length || draft.rarities.includes(input.dataset.highlightRarity); });
    const hiddenEntry = favoriteHiddenEntry(item);
    byId("loot-highlight-hidden-note").hidden = !hiddenEntry && !state.lootFilter.hiddenRarities.length;
    const label = byId("loot-highlight-label");
    label.setAttribute("style", highlightLabelStyle(draft));
    const beam = byId("loot-highlight-beam");
    beam.hidden = !draft.beam;
    beam.style.setProperty("--beam-color", effectColorHex(draft.beamColor));
    beam.classList.toggle("is-temporary", draft.beamTemporary);
    const icon = byId("loot-highlight-icon");
    const shape = FILTER_ICON_SHAPES.find(option => option.value === draft.iconShape);
    icon.textContent = draft.minimapIcon ? shape.glyph : "—";
    icon.style.setProperty("--icon-color", draft.minimapIcon ? effectColorHex(draft.iconColor) : "#555");
    icon.style.fontSize = draft.minimapIcon ? [22, 17, 12][draft.iconSize] + "px" : "";
  };
  toggle.addEventListener("change", () => {
    state.lootFilter.highlightedItems = state.lootFilter.highlightedItems.filter(entry => !sameFilterBase(entry, item));
    if (toggle.checked) state.lootFilter.highlightedItems.push({ ...draft });
    commit(true);
  });
  root.querySelectorAll("[data-highlight-field]").forEach(input => {
    const field = input.dataset.highlightField;
    const read = () => {
      if (input.type === "checkbox") draft[field] = input.checked;
      else if (input.type === "range" || field === "iconSize" || field === "soundId") draft[field] = Number(input.value);
      else draft[field] = input.value;
    };
    // "input" atualiza a prévia enquanto arrasta; "change" grava e atualiza o resto da tela.
    input.addEventListener("input", () => { read(); draft = normalizeHighlightEntry(draft); const entry = current(); if (entry) Object.assign(entry, draft); paint(); });
    input.addEventListener("change", () => { read(); commit(true); });
  });
  root.querySelectorAll("[data-highlight-swatch]").forEach(button => button.addEventListener("click", () => {
    draft[button.dataset.highlightSwatch] = button.dataset.value;
    commit(true);
  }));
  root.querySelectorAll("[data-highlight-preset]").forEach(button => button.addEventListener("click", () => {
    const preset = LOOT_HIGHLIGHT_PRESETS.find(option => option.id === button.dataset.highlightPreset);
    if (!preset) return;
    Object.assign(draft, { textColor: preset.textColor, borderColor: preset.borderColor, backgroundColor: preset.backgroundColor, backgroundOpacity: 255, iconColor: preset.effectColor, beamColor: preset.effectColor }, preset.iconShape ? { iconShape: preset.iconShape } : {});
    commit(true);
  }));
  root.querySelectorAll("[data-highlight-rarity]").forEach(input => input.addEventListener("change", () => {
    const checked = [...root.querySelectorAll("[data-highlight-rarity]")].filter(option => option.checked).map(option => option.dataset.highlightRarity);
    if (!checked.length) { input.checked = true; showToast("Escolha pelo menos uma raridade para destacar."); return; }
    draft.rarities = checked.length === LOOT_FILTER_RARITIES.length ? [] : checked;
    commit(true);
  }));
  byId("loot-highlight-reset").addEventListener("click", () => {
    draft = normalizeHighlightEntry({ ...DEFAULT_LOOT_HIGHLIGHT_STYLE, id: draft.id, baseType: draft.baseType, rarities: draft.rarities });
    commit(true);
  });
  const profilesHolder = byId("loot-highlight-profiles");
  const renderProfiles = () => {
    const profiles = loadHighlightProfiles();
    const enabled = !!current();
    const chips = profiles.map((profile, index) => {
      const style = profile.style;
      const shape = FILTER_ICON_SHAPES.find(option => option.value === style.iconShape);
      const extras = (style.minimapIcon ? '<i style="color:' + effectColorHex(style.iconColor) + '">' + shape.glyph + '</i>' : "") + (style.beam ? '<i class="loot-highlight-profile-beam" style="background:' + effectColorHex(style.beamColor) + '"></i>' : "") + (style.sound ? "<i>♪</i>" : "");
      return '<span class="loot-highlight-profile"><button type="button" data-profile-apply="' + index + '" title="Aplicar o perfil “' + htmlEscape(profile.name) + '” neste item"><span class="loot-highlight-profile-label" style="' + highlightLabelStyle({ ...style, fontSize: 30 }) + '">' + htmlEscape(profile.name) + '</span>' + extras + '</button><button type="button" class="loot-highlight-profile-delete" data-profile-delete="' + index + '" title="Apagar perfil" aria-label="Apagar perfil ' + htmlEscape(profile.name) + '">×</button></span>';
    }).join("");
    profilesHolder.innerHTML = '<span class="loot-highlight-heading">MEUS PERFIS</span>'
      + (chips ? '<div class="loot-highlight-presets">' + chips + '</div>' : '<small>Monte as cores, o ícone, o feixe e o som, e clique em “Gravar perfil” para usar o mesmo visual em outros itens.</small>')
      + '<div class="loot-highlight-row"><button type="button" id="loot-highlight-profile-save"' + (enabled ? "" : ' disabled title="Marque “Destacar esta base” e monte o visual primeiro."') + '>Gravar perfil</button></div>';
    profilesHolder.querySelectorAll("[data-profile-apply]").forEach(button => button.addEventListener("click", () => {
      const profile = profiles[Number(button.dataset.profileApply)];
      if (!profile) return;
      draft = normalizeHighlightEntry({ ...draft, ...profile.style, id: draft.id, baseType: draft.baseType });
      if (!current()) state.lootFilter.highlightedItems.push({ ...draft });
      commit(true);
      renderProfiles();
      showToast("Perfil “" + profile.name + "” aplicado.");
    }));
    profilesHolder.querySelectorAll("[data-profile-delete]").forEach(button => button.addEventListener("click", () => {
      const profile = profiles[Number(button.dataset.profileDelete)];
      if (!profile || !confirm("Apagar o perfil “" + profile.name + "”? Os itens que já usam esse visual não mudam.")) return;
      saveHighlightProfiles(profiles.filter(entry => entry !== profile));
      renderProfiles();
    }));
    byId("loot-highlight-profile-save").addEventListener("click", () => {
      const name = (prompt("Nome do perfil:", "Perfil " + (profiles.length + 1)) || "").trim().slice(0, 40);
      if (!name) return;
      const existing = profiles.findIndex(profile => profile.name.toLocaleLowerCase() === name.toLocaleLowerCase());
      if (existing >= 0 && !confirm("Já existe um perfil “" + profiles[existing].name + "”. Substituir pelo visual atual?")) return;
      const next = profiles.slice();
      const profile = { name, style: highlightProfileStyle(normalizeHighlightEntry(draft)) };
      if (existing >= 0) next[existing] = profile; else next.push(profile);
      if (!saveHighlightProfiles(next)) { showToast("Não consegui gravar o perfil neste navegador."); return; }
      renderProfiles();
      showToast("Perfil “" + name + "” gravado.");
    });
  };
  toggle.addEventListener("change", renderProfiles);
  renderProfiles();
  paint();
}

const FILTER_RARITY_ORDER = { Normal: 0, Magic: 1, Rare: 2, Unique: 3 };
const FILTER_CONDITIONS = new Set(["ItemLevel", "DropLevel", "Quality", "Rarity", "Class", "BaseType", "Sockets", "LinkedSockets", "SocketGroup", "Height", "Width", "Identified", "Corrupted", "HasExplicitMod"]);
const FILTER_EFFECT_COMMAND = /^(?:Set[A-Z]|Play[A-Z]|MinimapIcon\b|DisableDropSound\b|CustomAlertSound\b|Continue\b)/;
function parseLootFilterRules(text) {
  const rules = [];
  let current = null;
  for (const sourceLine of String(text || "").split(/\r?\n/)) {
    const line = sourceLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const action = line.match(/^(Show|Hide)\b(?:\s+(.*))?$/i);
    if (action) {
      if (current) rules.push(current);
      current = { show: action[1].toLowerCase() === "show", conditions: [] };
      if (action[2]) appendLootFilterCondition(current, action[2]);
      continue;
    }
    if (current) appendLootFilterCondition(current, line);
  }
  if (current) rules.push(current);
  return rules;
}
function appendLootFilterCondition(rule, line) {
  const match = String(line || "").match(/^([A-Za-z]+)\b\s*(.*)$/);
  if (!match || FILTER_EFFECT_COMMAND.test(match[1])) return;
  const name = match[1];
  let rest = match[2].trim();
  const operatorMatch = rest.match(/^(==|!=|>=|<=|>|<|=)\s*/);
  const operator = operatorMatch ? operatorMatch[1] : "contains";
  if (operatorMatch) rest = rest.slice(operatorMatch[0].length);
  const values = [...rest.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"|'([^']*)'|([^\s]+)/g)].map(value => (value[1] ?? value[2] ?? value[3] ?? "").replace(/\\(["'\\])/g, "$1"));
  if (values.length) rule.conditions.push({ name, operator, values, supported: FILTER_CONDITIONS.has(name) });
}
function conditionValue(condition, item, rarity) {
  const { name, operator, values } = condition;
  if (condition.supported === false) return null;
  if (name === "Rarity") {
    const current = FILTER_RARITY_ORDER[rarity];
    const ranks = values.map(value => FILTER_RARITY_ORDER[value]).filter(value => value != null);
    if (current == null || !ranks.length) return null;
    if (operator === ">=" || operator === ">" || operator === "<=" || operator === "<") return ranks.some(rank => operator === ">=" ? current >= rank : operator === ">" ? current > rank : operator === "<=" ? current <= rank : current < rank);
    return operator === "!=" ? !values.some(value => value.toLowerCase() === rarity.toLowerCase()) : values.some(value => value.toLowerCase() === rarity.toLowerCase());
  }
  if (name === "BaseType" || name === "Class") {
    const actual = name === "BaseType" ? filterBaseTypeForItem(item) : String(item.item_class || "");
    if (!actual) return null;
    const left = actual.toLocaleLowerCase("en-US");
    const matches = values.map(value => {
      const right = value.toLocaleLowerCase("en-US");
      if (operator === "==" || operator === "=") return left === right;
      if (operator === "!=") return left !== right;
      if (operator !== "contains") return null;
      return name === "Class" ? left.includes(right) || right.includes(left) : left.includes(right);
    });
    if (operator === "!=") return matches.every(Boolean);
    if (matches.includes(true)) return true;
    if (matches.includes(null)) return null;
    return false;
  }
  if (name === "DropLevel") {
    const actual = catalogLevel(item);
    if (actual == null) return null;
    const expected = Number(values[0]);
    if (!Number.isFinite(expected)) return null;
    if (operator === ">=") return actual >= expected;
    if (operator === ">") return actual > expected;
    if (operator === "<=") return actual <= expected;
    if (operator === "<") return actual < expected;
    if (operator === "!=" ) return actual !== expected;
    return actual === expected;
  }
  if (name === "HasExplicitMod") {
    if (!state.data || !state.data.mods) return null;
    const threshold = Number(values[0]);
    const hasThreshold = values.length > 1 && Number.isFinite(threshold);
    const names = (hasThreshold ? values.slice(1) : values).map(value => value.toLocaleLowerCase("en-US"));
    const compatibleNames = possibleMods(item).map(({ mod }) => String(mod.name || "").toLocaleLowerCase("en-US"));
    const count = names.filter(name => name && compatibleNames.some(candidate => candidate === name || candidate.includes(name))).length;
    if (count === 0) return false;
    if (hasThreshold && [">=", ">", "<=", "<", "==", "="].includes(operator)) return null;
    return null;
  }
  // Estes critérios dependem da instância que cai no chão, como qualidade,
  // sockets, identificação ou corrupção; a base sozinha não resolve o resultado.
  return null;
}
function filterBaseTypeForItem(item) {
  const source = item.source || {};
  const base = source.base_item;
  const name = String(base && typeof base === "object" && (base.name || base.display_name) || typeof base === "string" && base || source.base_type || item.englishName || item.name || "");
  return name;
}
function restoreLootFilterOptionsFromText(text) {
  const marker = String(text || "").match(/^\uFEFF?# BEGIN ATLAS WRAECLAST CUSTOM RULES\r?\n([\s\S]*?)^# END ATLAS WRAECLAST CUSTOM RULES/m);
  if (!marker) {
    Object.assign(state.lootFilter, { hiddenBaseItems: [], hiddenClassRarities: [], hiddenEquipmentProfiles: [], hiddenRarities: [], filterClass: "all", filterBaseId: "all", requiredDefenses: [], minDropLevel: null, maxDropLevel: null, excludedModifiers: [], highlightedItems: [] });
    return;
  }
  const configLine = marker[1].match(/^# ATLAS_CONFIG ([^\r\n]+)$/m);
  let profileConfig = null;
  if (configLine) {
    try {
      profileConfig = normalizeLootFilterConfig(JSON.parse(decodeURIComponent(configLine[1])));
    } catch {}
  }
  const manualRulesText = marker[1].replace(/^# ATLAS_PROFILE_BASES_BEGIN\r?\n[\s\S]*?^# ATLAS_PROFILE_BASES_END(?:\r?\n)?/m, "");
  const rules = parseLootFilterRules(manualRulesText);
  const hiddenRarities = new Set();
  const bases = new Map();
  for (const rule of rules) {
    if (rule.show) continue;
    const rarityCondition = rule.conditions.find(condition => condition.name === "Rarity");
    const baseCondition = rule.conditions.find(condition => condition.name === "BaseType");
    const levelCondition = rule.conditions.find(condition => condition.name === "ItemLevel" && condition.operator === "==");
    // Gema bruta: base com o nível no nome, ou o formato antigo (base sem nível + ItemLevel).
    const uncutMatch = baseCondition && state.catalog.find(candidate => candidate.kind === "uncut" && baseCondition.values.some(value => normalizeItemKey(value) === filterBaseKey(candidate) || !!levelCondition && uncutGemLevel(candidate.id) === Number(levelCondition.values[0]) && normalizeItemKey(value) === normalizeItemKey(filterBaseTypeForItem(candidate).replace(/ \(Level \d+\)$/, ""))));
    if (uncutMatch) { bases.set("uncut|" + uncutMatch.id, { baseType: filterBaseTypeForItem(uncutMatch), rarities: [], id: String(uncutMatch.id) }); continue; }
    if (!baseCondition) {
      // Formato antigo: só Rarity. Atual: Rarity + Class com a lista de equipamentos (a ocultação por classe tem um só valor).
      const classCondition = rule.conditions.find(condition => condition.name === "Class");
      const generalRarityRule = rarityCondition && (rule.conditions.length === 1 || rule.conditions.length === 2 && classCondition && classCondition.values.length > 1);
      if (generalRarityRule) rarityCondition.values.filter(value => !ALWAYS_VISIBLE_LOOT_RARITIES.has(value)).forEach(value => hiddenRarities.add(value));
      continue;
    }
    const sourceRarities = rarityCondition ? rarityCondition.values.filter(value => LOOT_FILTER_RARITIES.some(option => option.value === value)) : [];
    const rarities = sourceRarities.filter(value => !ALWAYS_VISIBLE_LOOT_RARITIES.has(value));
    if (rarityCondition && sourceRarities.length && !rarities.length) continue;
    for (const baseType of baseCondition.values) {
      const key = normalizeItemKey(baseType);
      const previous = bases.get(key);
      if (!rarities.length || previous && !previous.rarities.length) bases.set(key, { baseType, rarities: [] });
      else bases.set(key, { baseType, rarities: [...new Set([...(previous && previous.rarities || []), ...rarities])] });
    }
  }
  state.lootFilter.hiddenRarities = [...hiddenRarities].filter(value => LOOT_FILTER_RARITIES.some(option => option.value === value) && !ALWAYS_VISIBLE_LOOT_RARITIES.has(value));
  state.lootFilter.hiddenClassRarities = profileConfig ? profileConfig.hiddenClassRarities : [];
  state.lootFilter.hiddenEquipmentProfiles = profileConfig ? profileConfig.hiddenEquipmentProfiles : [];
  state.lootFilter.hiddenBaseItems = [...bases.values()].map(({ baseType, rarities, id }) => {
    if (id) return { id, baseType, rarities };
    const item = state.catalog.find(candidate => isEquipmentFavorite(candidate) && normalizeItemKey(filterBaseTypeForItem(candidate)) === normalizeItemKey(baseType));
    return { id: item ? String(item.id) : "filter-base|" + normalizeItemKey(baseType), baseType, rarities };
  });
  state.lootFilter.filterClass = profileConfig ? profileConfig.filterClass : "all";
  state.lootFilter.filterBaseId = profileConfig ? profileConfig.filterBaseId : "all";
  state.lootFilter.requiredDefenses = profileConfig ? profileConfig.requiredDefenses : [];
  state.lootFilter.minDropLevel = profileConfig ? profileConfig.minDropLevel : null;
  state.lootFilter.maxDropLevel = profileConfig ? profileConfig.maxDropLevel : null;
  state.lootFilter.excludedModifiers = profileConfig ? profileConfig.excludedModifiers : [];
  state.lootFilter.minShowTier = profileConfig ? profileConfig.minShowTier : null;
  state.lootFilter.highlightedItems = profileConfig ? profileConfig.highlightedItems : [];
}
function lootRuleMatch(rule, item, rarity) {
  let uncertain = false;
  for (const condition of rule.conditions) {
    const result = conditionValue(condition, item, rarity);
    if (result === false) return false;
    if (result == null) uncertain = true;
  }
  return uncertain ? null : true;
}
function lootFilterMayShow(item, rarity, rules = null) {
  let pending = true;
  const possibleVisibility = new Set();
  for (const rule of rules || parseLootFilterRules(state.lootFilter.text)) {
    if (!pending) break;
    const match = lootRuleMatch(rule, item, rarity);
    if (match === false) continue;
    possibleVisibility.add(rule.show);
    if (match === true) pending = false;
  }
  return possibleVisibility.has(true);
}
function favoriteHiddenEntry(item) {
  return state.lootFilter.hiddenBaseItems.find(entry => sameFilterBase(entry, item));
}
function isFavoriteHiddenAtRarity(item, rarity) {
  if (ALWAYS_VISIBLE_LOOT_RARITIES.has(rarity)) return false;
  const entry = favoriteHiddenEntry(item);
  return state.lootFilter.hiddenRarities.includes(rarity) || !!entry && (!(entry.rarities || []).length || entry.rarities.includes(rarity));
}
function excludedModifiersForItem(item) {
  const tags = new Set(item.tags || []);
  const baseType = normalizeItemKey(filterBaseTypeForItem(item));
  return state.lootFilter.excludedModifiers.filter(entry => {
    if (entry.itemClass !== "all" && entry.itemClass !== item.item_class) return false;
    if (entry.baseType && normalizeItemKey(entry.baseType) !== baseType) return false;
    const mod = state.data && state.data.mods && state.data.mods[entry.id];
    return !!mod && Array.isArray(mod.spawn_weights) && mod.spawn_weights.some(weight => Number(weight.weight) > 0 && tags.has(weight.tag));
  });
}
function favoriteAppearsInFilter(item, rules = null) {
  if (!state.lootFilter.text) return false;
  const effectiveRules = rules || parseLootFilterRules(stripGeneratedLootFilterBlock(state.lootFilter.text));
  return LOOT_FILTER_RARITIES.some(({ value }) => !isFavoriteHiddenAtRarity(item, value) && lootFilterMayShow(item, value, effectiveRules));
}
function favoriteCanAppearInFilter(item, rules) {
  return LOOT_FILTER_RARITIES.some(({ value }) => lootFilterMayShow(item, value, rules));
}
function setFavoriteHidden(item, hidden) {
  const id = String(item.id);
  const baseType = filterBaseTypeForItem(item);
  state.lootFilter.hiddenBaseItems = state.lootFilter.hiddenBaseItems.filter(entry => !sameFilterBase(entry, item));
  if (hidden) state.lootFilter.hiddenBaseItems.push({ id, baseType, rarities: [] });
  saveLootFilter();
  renderLootFilterPanel();
}
function openDetail(id, kind) {
  const item = state.catalog.find(entry => String(entry.id) === String(id) && entry.kind === kind);
  if (!item) return;
  state.activeModFilter = "all";
  state.activeModSearch = "";
  const wikiMap = getWikiUniqueMap();
  const wiki = wikiMap.get(String(item.englishName || item.name).toLocaleLowerCase());
  const source = item.source || {};
  const detailImage = item.image ? '<img class="detail-item-image" src="' + htmlEscape(item.image) + '" alt="' + htmlEscape(item.name) + '" title="Nome em inglês: ' + htmlEscape(item.englishName || item.name) + '" onerror="this.hidden=true">' : "";
  const englishLabel = '<div class="english-item-name" title="Nome no outro idioma">' + htmlEscape(otherNameLabel(item)) + '</div>';
  const links = (item.translation && item.translation.page ? '<a class="detail-wiki-link" href="' + htmlEscape(item.translation.page) + '" target="_blank" rel="noreferrer">Abrir ficha em português ↗</a>' : "") + '<a class="detail-wiki-link" href="' + htmlEscape(detailUrl(item.englishName || item.name)) + '" target="_blank" rel="noreferrer">Wiki comunitária ↗</a>';
  const title = '<div class="detail-title-block">' + detailImage + '<span class="item-badge ' + item.kind + '">' + htmlEscape(itemCategoryName(item.kind, item)) + '</span><h2 id="detail-title" title="' + htmlEscape(otherNameLabel(item)) + '">' + htmlEscape(displayName(item)) + '</h2>' + englishLabel + '<div class="detail-subtitle">' + htmlEscape(itemClassLabel(item.item_class)) + (source.drop_level ? " · Nível de drop " + numberFormat(source.drop_level) : "") + (wiki && wiki["base item"] ? " · Base: " + htmlEscape(wiki["base item"]) : "") + '</div><div class="detail-links">' + links + '</div></div>';
  let body = title;
  if (item.kind === "unique") {
    const translatedStats = state.nameLang !== "en" && item.translation && item.translation.stats && item.translation.stats.length ? item.translation.stats.join("\n") : "";
    const uniqueText = translatedStats || (wiki ? decodeWikiText(wiki["stat text"]) : "");
    body += '<section class="detail-section"><h3>ATRIBUTOS DO ÚNICO</h3>' + (uniqueText ? '<div class="unique-stats">' + htmlEscape(uniqueText) + '</div>' : '<div class="detail-hint">Não encontrei os atributos deste item na exportação atual da wiki. Abra a página comunitária para consultar os dados mais recentes.</div>') + '</section>';
    body += '<p class="detail-hint">Dados de atributos são fornecidos pela wiki comunitária e podem estar incompletos para itens recém-adicionados.</p>';
    body += displayRequirements(source) + renderLootFilterHighlightControl(item);
  } else if (item.kind === "gem") {
    const gem = item.gemData || {};
    const tags = (gem.tags || item.tags || []).map(tag => '<span class="tag-pill">' + htmlEscape(tagLabel(tag)) + '</span>').join("");
    const type = gem.gem_type === "support" ? "Suporte" : gem.gem_type === "active" ? "Habilidade ativa" : "Gema";
    body += '<section class="detail-section"><h3>DETALHES DA GEMA</h3><div class="property-grid"><div class="property-chip"><span>Tipo</span><b>' + type + '</b></div>' + (gem.crafting_level != null ? '<div class="property-chip"><span>Nível de criação</span><b>' + numberFormat(gem.crafting_level) + '</b></div>' : "") + '</div>' + (tags ? '<div class="tag-list" style="margin-top:10px">' + tags + '</div>' : "") + '</section>';
    if (gem.support_text) body += '<section class="detail-section"><h3>EFEITO</h3><div class="detail-hint">' + htmlEscape(sourceText(gem.support_text)) + '</div></section>';
    body += renderLootFilterBaseControl(item) + renderLootFilterHighlightControl(item);
  } else if (["rune", "omen", "essence", "abyss"].includes(item.kind)) {
    const rune = item.itemText;
    const heading = item.kind === "omen" ? "EFEITO" : ["essence", "abyss"].includes(item.kind) ? "EFEITO NO ITEM" : "EFEITOS AO ENCAIXAR";
    const lines = values => '<div class="unique-stats">' + htmlEscape(values.join("\n")) + '</div>';
    body += displayProperties(source) + displayRequirements(item.source);
    body += rune && rune.effects.length
      ? '<section class="detail-section"><h3>' + heading + '</h3>' + lines(rune.effects) + '</section>'
      : '<section class="detail-section"><h3>' + heading + '</h3><div class="detail-hint">Efeito não disponível nos dados atuais. Rode tools/gerar-runas.mjs ou abra a ficha em português.</div></section>';
    if (rune && rune.bonded.length) body += '<section class="detail-section"><h3>VINCULADO</h3>' + lines(rune.bonded) + '</section>';
    if (rune && rune.description) body += '<p class="detail-hint">' + htmlEscape(rune.description) + '</p>';
    body += renderLootFilterBaseControl(item) + renderLootFilterHighlightControl(item);
  } else if (["currency", "potion", "charm", "uncut", "waystone", "trial", "tablet", "other"].includes(item.kind)) {
    body += displayProperties(source) + displayRequirements(source);
    if (item.kind === "waystone") body += '<section class="detail-section"><h3>COMO USAR</h3><div class="detail-hint">Coloque no Mapa do Atlas para abrir um mapa de nível de área ' + (64 + waystoneTier(source)) + '. No filtro, cada nível de Pedra-guia é uma base separada; raras e únicas sempre aparecem.</div></section>';
    if (item.kind === "trial") body += '<section class="detail-section"><h3>COMO USAR</h3><div class="detail-hint">' + (item.item_class !== "ItemisedSanctum"
      ? "Leve ao Templo do Caos para participar da Provação do Caos (Provação de Ascendência). O nível de área e o número de provações variam em cada item."
      : (item.tags || []).includes("sanctum_key")
        ? "Coloque no meio do Altar de Relíquias da Provação das Sekhemas (Ato 2, pela Passagem do Traidor). Os andares são feitos em sequência; com 3 provações (nível de área 62) vale para a terceira Ascendência. O nível de área e o número de provações variam em cada item."
        : "Barya de um andar específico da Provação das Sekhemas. Coloque no Altar de Relíquias para jogar só esse andar; não dá pontos de Ascendência.") + '</div></section>';
    if (item.kind === "uncut") body += '<section class="detail-section"><h3>COMO USAR</h3><div class="detail-hint">' + htmlEscape(UNCUT_GEM_CLASSES[item.item_class].directions) + '</div></section>';
    if (item.tags && item.tags.length) body += '<section class="detail-section"><h3>CARACTERÍSTICAS</h3><div class="tag-list">' + item.tags.map(tag => '<span class="tag-pill">' + htmlEscape(tagLabel(tag)) + '</span>').join("") + '</div></section>';
    body += renderLootFilterBaseControl(item) + renderLootFilterHighlightControl(item);
  } else {
    body += renderBaseImplicits(source) + displayProperties(source) + displayRequirements(source);
    if (item.tags && item.tags.length) body += '<section class="detail-section"><h3>TAGS DA BASE</h3><div class="tag-list">' + item.tags.map(tag => '<span class="tag-pill">' + htmlEscape(tagLabel(tag)) + '</span>').join("") + '</div></section>';
    body += renderLootFilterBaseControl(item) + renderLootFilterHighlightControl(item);
    body += renderModList(item);
  }
  byId("detail-content").innerHTML = body;
  byId("detail-backdrop").hidden = false;
  document.body.style.overflow = "hidden";
  byId("detail-close").focus();
  bindModControls(item);
  bindLootFilterItemControl(item);
  bindLootFilterHighlightControl(item);
}
function bindModControls(item) {
  byId("detail-content").querySelectorAll("[data-mod-filter]").forEach(button => button.addEventListener("click", () => { state.activeModFilter = button.dataset.modFilter; refreshDetailMods(item); }));
  const modSearch = byId("mod-search");
  if (modSearch) modSearch.addEventListener("input", () => {
    state.activeModSearch = modSearch.value;
    const position = modSearch.selectionStart;
    refreshDetailMods(item);
    const next = byId("mod-search");
    next.focus(); next.setSelectionRange(position, position);
  });
}
function refreshDetailMods(item) {
  const holder = document.createElement("div");
  holder.innerHTML = renderModList(item);
  const current = [...byId("detail-content").querySelectorAll(".detail-section")].find(element => element.querySelector(".mod-list"));
  if (current && holder.firstElementChild) current.replaceWith(holder.firstElementChild);
  bindModControls(item);
}
function closeDetail() { byId("detail-backdrop").hidden = true; document.body.style.overflow = ""; }
async function refreshStatus() {
  const response = await fetch("/api/status", { cache: "no-store" });
  state.status = await response.json();
  updateHome();
  if (state.status.hasData) {
    const dataResponse = await fetch("/api/data", { cache: "no-store" });
    if (dataResponse.ok) { state.data = await dataResponse.json(); buildCatalog(); renderLootFilterPanel(); }
  }
}
async function synchronize() {
  const button = byId("sync-button");
  button.classList.add("busy"); button.disabled = true;
  const oldText = button.innerHTML; button.innerHTML = '<span class="sync-icon">↻</span> Sincronizando';
  try {
    const response = await fetch("/api/sync", { method: "POST" });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Não foi possível sincronizar.");
    await refreshStatus();
    showToast("Biblioteca atualizada: " + numberFormat(result.sync.counts.baseItems) + " bases e " + numberFormat(result.sync.counts.modifiers) + " modificadores.");
  } catch (error) { showToast(error.message || "Falha ao sincronizar. Confira sua conexão."); }
  finally { button.classList.remove("busy"); button.disabled = false; button.innerHTML = oldText; }
}
async function saveGamePath() {
  const path = window.prompt("Cole o caminho da pasta do Path of Exile 2. Ela deve conter Bundles2 e o executável do jogo.", state.status && state.status.game && state.status.game.path || "");
  if (path === null) return;
  try {
    const response = await fetch("/api/game-path", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Não foi possível salvar a pasta.");
    await refreshStatus(); showToast("Pasta do jogo associada.");
  } catch (error) { showToast(error.message); }
}
function bindUI() {
  bindNavigation();
  byId("sync-button").addEventListener("click", synchronize);
  byId("home-sync").addEventListener("click", synchronize);
  byId("game-path").addEventListener("click", saveGamePath);
  byId("game-path").title = "Clique para escolher a pasta de instalação";
  byId("game-path").style.cursor = "pointer";
  byId("search-input").addEventListener("input", event => { state.search = event.target.value; state.shown = 60; renderCatalog(); });
  byId("hide-uniques-toggle").addEventListener("click", event => { state.hideUniques = !state.hideUniques; event.currentTarget.classList.toggle("active", state.hideUniques); event.currentTarget.setAttribute("aria-pressed", String(state.hideUniques)); state.shown = 60; renderCatalog(); });
  byId("item-class-filter").addEventListener("change", event => {
    if (state.catalogMode === "equipment") {
      setLootFilterClass(event.target.value);
      saveLootFilter();
      renderLootFilterPanel();
    } else if (state.catalogMode === "weapons") {
      state.weaponsClassFilter = event.target.value;
      state.shown = 60;
      renderCatalog();
    } else {
      state.itemsClassFilter = event.target.value;
      state.shown = 60;
      renderCatalog();
    }
  });
  byId("defense-filter").addEventListener("change", event => { state.lootFilter.requiredDefenses = event.target.value === "all" ? [] : event.target.value.split(",").filter(defense => FILTER_DEFENSES.includes(defense)); saveLootFilter(); state.shown = 60; renderLootFilterPanel(); });
  byId("sort-select").addEventListener("change", event => { state.sortOrder = event.target.value; state.shown = 60; renderCatalog(); });
  byId("load-more").addEventListener("click", () => { state.shown += 60; renderCatalog(); });
  byId("filter-toggle").addEventListener("click", () => { state.category = state.category === "all" ? "gear" : "all"; renderCatalog(); });
  document.querySelectorAll("[data-filter-open]").forEach(button => button.addEventListener("click", () => showLootFilterFiles(button.dataset.filterList)));
  document.querySelectorAll("[data-filter-new]").forEach(button => button.addEventListener("click", startNewLootFilterDraft));
  document.querySelectorAll("[data-new-filter-name]").forEach(input => input.addEventListener("input", event => {
    state.lootFilter.newFilterName = event.target.value;
    document.querySelectorAll("[data-new-filter-name]").forEach(other => { if (other !== event.target) other.value = event.target.value; });
    document.querySelectorAll("[data-filter-create-save]").forEach(button => { button.disabled = !event.target.value.trim(); });
    saveLootFilter();
  }));
  document.querySelectorAll("[data-filter-create-save]").forEach(button => button.addEventListener("click", createLootFilterFile));
  document.querySelectorAll("[data-filter-new-cancel]").forEach(button => button.addEventListener("click", cancelNewLootFilterDraft));
  document.querySelectorAll("[data-filter-import]").forEach(input => input.addEventListener("change", event => { importLootFilterFile(event.target.files && event.target.files[0]); event.target.value = ""; }));
  document.querySelectorAll("[data-filter-save]").forEach(button => button.addEventListener("click", saveLootFilterFile));
  document.querySelectorAll("[data-filter-folder]").forEach(button => button.addEventListener("click", () => pickLootFilterFolder(button)));
  document.querySelectorAll("[data-hide-rarity]").forEach(input => input.addEventListener("change", () => {
    const rarity = input.dataset.hideRarity;
    if (ALWAYS_VISIBLE_LOOT_RARITIES.has(rarity)) { input.checked = false; return; }
    if (input.checked && !state.lootFilter.hiddenRarities.includes(rarity)) state.lootFilter.hiddenRarities.push(rarity);
    else if (!input.checked) state.lootFilter.hiddenRarities = state.lootFilter.hiddenRarities.filter(value => value !== rarity);
    saveLootFilter(); renderLootFilterPanel();
  }));
  document.querySelectorAll("[data-min-show-tier]").forEach(select => select.addEventListener("change", event => {
    state.lootFilter.minShowTier = event.target.value ? Number(event.target.value) : null;
    saveLootFilter(); renderLootFilterPanel();
  }));
  // Caixinhas de ocultação: a seleção fica no state para sobreviver aos re-renders do painel.
  document.addEventListener("change", event => {
    const input = event.target.closest("[data-check-item]");
    if (!input) return;
    const selected = state.hideChecks[input.dataset.checkItem] || (state.hideChecks[input.dataset.checkItem] = new Set());
    if (input.checked) selected.add(input.value); else selected.delete(input.value);
  });
  document.querySelectorAll("[data-check-all], [data-check-none]").forEach(button => button.addEventListener("click", () => {
    const key = button.dataset.checkAll || button.dataset.checkNone;
    const inputs = [...document.querySelectorAll('[data-check-list="' + key + '"] [data-check-item]')];
    state.hideChecks[key] = new Set(button.dataset.checkAll ? inputs.map(input => input.value) : []);
    inputs.forEach(input => { input.checked = !!button.dataset.checkAll; });
  }));
  const checkedRarities = (panel, attribute) => [...panel.querySelectorAll("[" + attribute + "]:checked")].map(input => input.getAttribute(attribute)).filter(value => HIDEABLE_LOOT_RARITIES.some(option => option.value === value));
  document.querySelectorAll("[data-add-class-hide]").forEach(button => button.addEventListener("click", () => {
    const classes = [...(state.hideChecks.weaponClass || []), ...(state.hideChecks.accessoryClass || [])];
    const rarities = checkedRarities(button.closest(".loot-filter-class-hide"), "data-hide-class-rarity");
    if (!classes.length) { showToast("Marque ao menos um tipo de arma ou acessório."); return; }
    if (!rarities.length) { showToast("Marque ao menos uma raridade para ocultar."); return; }
    for (const itemClass of classes) {
      let entry = state.lootFilter.hiddenClassRarities.find(item => item.itemClass === itemClass);
      if (!entry) state.lootFilter.hiddenClassRarities.push(entry = { itemClass, rarities: [] });
      entry.rarities = [...new Set([...entry.rarities, ...rarities])];
    }
    state.hideChecks.weaponClass = new Set(); state.hideChecks.accessoryClass = new Set();
    saveLootFilter(); renderLootFilterPanel();
    showToast(classes.length + (classes.length === 1 ? " tipo ocultado." : " tipos ocultados."));
  }));
  document.querySelectorAll("[data-class-hide-rules]").forEach(holder => holder.addEventListener("click", event => {
    const button = event.target.closest("[data-remove-class-hide]");
    if (!button) return;
    state.lootFilter.hiddenClassRarities.splice(Number(button.dataset.removeClassHide), 1);
    saveLootFilter(); renderLootFilterPanel();
  }));
  document.querySelectorAll("[data-add-equipment-profile]").forEach(button => button.addEventListener("click", () => {
    const classes = [...(state.hideChecks.equipClass || [])];
    const defenseOptions = [...(state.hideChecks.equipDefense || [])];
    const rarities = checkedRarities(button.closest(".loot-filter-equipment-hide"), "data-hide-equipment-rarity");
    if (!classes.length) { showToast("Marque ao menos um tipo de equipamento."); return; }
    if (!defenseOptions.length) { showToast("Marque ao menos uma defesa."); return; }
    if (!rarities.length) { showToast("Marque ao menos uma raridade para ocultar."); return; }
    let bases = 0;
    for (const itemClass of classes) for (const defenseKey of defenseOptions) {
      const matching = state.catalog.filter(item => item.kind === "gear" && item.catalogGroup === "equipment" && item.item_class === itemClass && defenseProfile(item) === defenseKey);
      if (!matching.length) continue;
      bases += matching.length;
      const defenses = defenseKey.split(",");
      let profile = state.lootFilter.hiddenEquipmentProfiles.find(item => item.itemClass === itemClass && item.defenses.join(",") === defenseKey);
      if (!profile) state.lootFilter.hiddenEquipmentProfiles.push(profile = { itemClass, defenses, rarities: [] });
      profile.rarities = [...new Set([...profile.rarities, ...rarities])];
    }
    if (!bases) { showToast("Não encontrei bases com esses tipos e defesas."); return; }
    saveLootFilter(); renderLootFilterPanel();
    showToast(bases + " base(s) serão ocultadas.");
  }));
  document.querySelectorAll("[data-equipment-hide-rules]").forEach(holder => holder.addEventListener("click", event => {
    const button = event.target.closest("[data-remove-equipment-profile]");
    if (!button) return;
    state.lootFilter.hiddenEquipmentProfiles.splice(Number(button.dataset.removeEquipmentProfile), 1);
    saveLootFilter(); renderLootFilterPanel();
  }));
  document.querySelectorAll("[data-filter-clear-bases]").forEach(button => button.addEventListener("click", () => {
    state.lootFilter.hiddenBaseItems = [];
    saveLootFilter(); renderLootFilterPanel();
    const control = byId("loot-filter-base-toggle"); if (control) control.checked = false;
    document.querySelectorAll("[data-base-hide-rarity]").forEach(input => { input.checked = false; });
    showToast("Ocultações por base removidas do filtro.");
  }));
  document.querySelectorAll("[data-filter-clear-all]").forEach(button => button.addEventListener("click", () => {
    state.lootFilter.hiddenBaseItems = [];
    state.lootFilter.hiddenClassRarities = [];
    state.lootFilter.hiddenEquipmentProfiles = [];
    saveLootFilter(); renderLootFilterPanel();
    const control = byId("loot-filter-base-toggle"); if (control) control.checked = false;
    document.querySelectorAll("[data-base-hide-rarity]").forEach(input => { input.checked = false; });
    showToast("Ocultações por base e classe removidas do filtro.");
  }));
  byId("filter-class-select").addEventListener("change", event => {
    setLootFilterClass(event.target.value);
    saveLootFilter(); renderLootFilterPanel();
  });
  byId("filter-base-select").addEventListener("change", event => {
    state.lootFilter.filterBaseId = event.target.value;
    saveLootFilter(); renderFilterManager();
  });
  document.querySelectorAll("[data-required-defense]").forEach(input => input.addEventListener("change", () => {
    state.lootFilter.requiredDefenses = [...document.querySelectorAll("[data-required-defense]")].filter(control => control.checked).map(control => control.dataset.requiredDefense);
    saveLootFilter(); renderLootFilterPanel();
  }));
  document.querySelectorAll("[data-filter-preset]").forEach(button => button.addEventListener("click", () => {
    const presets = {
      "body-evasion": { filterClass: "Body Armour", requiredDefenses: ["evasion"] },
      "body-hybrid": { filterClass: "Body Armour", requiredDefenses: ["armour", "evasion"] },
      armour: { filterClass: "all", requiredDefenses: ["armour"] },
      clear: { filterClass: "all", requiredDefenses: [] }
    };
    const preset = presets[button.dataset.filterPreset];
    if (!preset) return;
    Object.assign(state.lootFilter, preset, { filterBaseId: "all", minDropLevel: null, maxDropLevel: null });
    saveLootFilter(); renderLootFilterPanel();
  }));
  const updateDropLevelRange = () => {
    const min = byId("filter-min-drop-level").value;
    const max = byId("filter-max-drop-level").value;
    if (min !== "" && max !== "" && Number(min) > Number(max)) {
      showToast("O nível mínimo não pode ser maior que o máximo.");
      renderFilterManager();
      return;
    }
    state.lootFilter.minDropLevel = min === "" ? null : Number(min);
    state.lootFilter.maxDropLevel = max === "" ? null : Number(max);
    saveLootFilter(); renderLootFilterPanel();
  };
  byId("filter-min-drop-level").addEventListener("change", updateDropLevelRange);
  byId("filter-max-drop-level").addEventListener("change", updateDropLevelRange);
  byId("filter-affix-search").addEventListener("input", event => { state.filterModifierSearch = event.target.value; renderFilterModifierOptions(); });
  byId("filter-block-matches").addEventListener("click", blockSearchedModifiers);
  document.querySelectorAll("[data-affix-type]").forEach(button => button.addEventListener("click", () => {
    state.filterModifierType = button.dataset.affixType;
    document.querySelectorAll("[data-affix-type]").forEach(option => option.classList.toggle("active", option === button));
    renderFilterModifierOptions();
  }));
  byId("detail-close").addEventListener("click", closeDetail);
  byId("detail-backdrop").addEventListener("click", event => { if (event.target === byId("detail-backdrop")) closeDetail(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeDetail(); if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); changePage("wiki"); byId("search-input").focus(); } });
}
async function init() {
  bindUI();
  renderLootFilterPanel();
  try { await refreshStatus(); }
  catch { byId("connection-label").textContent = "Servidor local indisponível"; byId("game-state").textContent = "Servidor parado"; }
  setInterval(() => { if (!state.data) refreshStatus().catch(() => {}); }, 5000);
}
init();
