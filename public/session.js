(() => {
  const STATE_POLL_MS = 15000;
  const EVENT_POLL_MS = 2000;
  const session = { data: null, mode: "", pageActive: false, statePoll: null, eventPoll: null, tickTimer: null, busy: false, lastEvent: null, otherTimer: null };
  const byId = id => document.getElementById(id);
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const number = (value, digits = 0) => Number(value).toLocaleString("pt-BR", { maximumFractionDigits: digits });

  function duration(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor(total % 3600 / 60);
    const seconds = total % 60;
    return (hours ? hours + "h " : "") + String(minutes).padStart(hours ? 2 : 1, "0") + "min " + String(seconds).padStart(2, "0") + "s";
  }

  function shortDuration(ms) {
    const minutes = Math.round(ms / 60000);
    return minutes >= 60 ? Math.floor(minutes / 60) + "h" + String(minutes % 60).padStart(2, "0") : minutes + " min";
  }

  function rate() {
    return session.data ? session.data.exaltedPerDivine : null;
  }

  function money(divine, exaltedPerDivine = rate()) {
    if (divine == null || !Number.isFinite(divine)) return "—";
    const sign = divine < 0 ? "−" : "";
    const value = Math.abs(divine);
    if (value >= 1 || !exaltedPerDivine) return sign + number(value, value >= 100 ? 0 : 2) + " div";
    return sign + number(value * exaltedPerDivine, value * exaltedPerDivine >= 10 ? 0 : 1) + " ex";
  }

  function signed(divine, exaltedPerDivine) {
    return (divine > 0 ? "+" : "") + money(divine, exaltedPerDivine);
  }

  function gainRow(currency) {
    const active = session.data && session.data.active;
    return active ? active.gains.rows.find(row => row.id === currency) : null;
  }

  function eventText(event) {
    if (event.kind === "manual") return "Ajuste manual: " + (event.delta > 0 ? "+" : "") + number(event.delta) + " " + event.name;
    if (event.kind === "gain") return "Pegou " + number(event.delta) + " " + event.name;
    if (event.kind === "spent") return event.name + ": a pilha caiu de " + number(event.previous) + " para " + number(event.stack) + " (gastou ou guardou; não conta como perda)";
    return event.name + ": nada novo (pilha com " + number(event.stack) + ")";
  }

  // ---------- Avisos de Ctrl+C: toast, som e notificação do Windows ----------
  let audio = null;
  function chime(good) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const now = audio.currentTime;
      (good ? [660, 990] : [440]).forEach((frequency, index) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.25);
        oscillator.connect(gain).connect(audio.destination);
        oscillator.start(now + index * 0.12);
        oscillator.stop(now + index * 0.12 + 0.3);
      });
    } catch {}
  }

  function announce(event) {
    const row = gainRow(event.currency);
    const value = event.kind === "gain" && row && row.each ? " (" + signed(event.delta * row.each) + ")" : "";
    const text = eventText(event) + value;
    const stack = byId("session-toasts");
    const toast = document.createElement("div");
    toast.className = "session-toast " + event.kind;
    toast.innerHTML = (row && row.icon ? '<img src="' + escape(row.icon) + '" alt="" referrerpolicy="no-referrer">' : '<span class="session-toast-glyph">✦</span>') + "<span>" + escape(text) + "</span>";
    stack.prepend(toast);
    setTimeout(() => toast.classList.add("leaving"), 4500);
    setTimeout(() => toast.remove(), 5000);
    if (event.kind === "gain" || event.kind === "manual") chime(true);
    else chime(false);
    if (document.hidden && "Notification" in window && Notification.permission === "granted" && event.kind === "gain") {
      try { new Notification("Atlas · " + text, { silent: true, tag: "atlas-session" }); } catch {}
    }
  }

  // ---------- Telas ----------
  function renderIdle() {
    const notifications = "Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied";
    return '<section class="panel-card session-card session-intro">' +
      '<div class="panel-title"><span class="panel-glyph">▶</span><div><h3>Começar uma sessão zerada</h3><p>Você não precisa contar nada. Inicie a sessão e vá jogando.</p></div></div>' +
      '<ol class="session-steps">' +
      "<li><b>Pegou um orb?</b> No inventário, passe o mouse em cima da pilha e aperte <kbd>Ctrl</kbd>+<kbd>C</kbd>. O Atlas conta sozinho e avisa com um som: “Pegou 3 Orbe do Caos”.</li>" +
      "<li><b>Copie sempre a mesma pilha</b> de cada moeda (a que ainda não está cheia). O Atlas compara com o último número que viu dela.</li>" +
      "<li><b>Tempo, mapas e mortes</b> vêm sozinhos do log do jogo. No fim, clique em Encerrar para salvar o lucro.</li>" +
      "</ol>" +
      '<div class="session-form-footer"><p class="session-privacy">Enquanto a sessão estiver ativa, o Atlas olha a área de transferência e só usa textos de itens do PoE. Nada é salvo além das moedas.</p>' +
      '<div class="session-form-actions">' + (notifications ? '<button class="text-button" id="session-notify" type="button">Ativar notificações do Windows</button>' : "") +
      '<button class="primary-button" id="session-start" type="button">Iniciar sessão <span>▶</span></button></div></div>' +
      "</section>";
  }

  function renderActive() {
    const active = session.data.active;
    const currencies = session.data.currencies || [];
    return '<div id="session-live"></div>' +
      '<div class="session-columns">' +
      '<section class="panel-card session-card"><div class="session-card-head"><h3>Ganhos da sessão</h3><span class="session-listening' + (active.watching ? " on" : "") + '" id="session-listening">' + (active.watching ? "Ouvindo Ctrl+C" : "Ctrl+C desligado") + "</span></div>" +
      '<div id="session-gains"></div>' +
      '<div class="session-manual"><select id="session-manual-currency" aria-label="Moeda para ajuste manual"><option value="">Adicionar à mão…</option>' + currencies.map(item => '<option value="' + escape(item.id) + '">' + escape(item.name) + "</option>").join("") + '</select><button class="text-button" id="session-manual-add" type="button">+1</button></div>' +
      '<label class="session-other"><span>OUTROS GANHOS (EM EXALTED)</span><input type="number" step="1" id="session-other" value="' + escape(active.otherExalted || "") + '" placeholder="0"><small>Itens que você vendeu ou que não são moedas.</small></label>' +
      "</section>" +
      '<section class="panel-card session-card"><div class="session-card-head"><h3>Últimos Ctrl+C</h3><span class="session-muted" id="session-event-count"></span></div><div id="session-events"></div></section>' +
      "</div>" +
      '<section class="panel-card session-card session-end"><label class="session-note"><span>ANOTAÇÃO <i>opcional</i></span><input type="text" id="session-note" maxlength="200" placeholder="Ex.: mapas de Breach, estratégia nova…"></label>' +
      '<div class="session-form-actions"><button class="text-button" id="session-cancel" type="button">Descartar sessão</button><button class="primary-button" id="session-end" type="button">Encerrar e salvar <span>■</span></button></div></section>';
  }

  function renderLive() {
    const live = byId("session-live");
    if (!live) return;
    const active = session.data.active;
    const log = active.log || {};
    const hours = (Date.now() - Date.parse(active.startedAt)) / 3600000;
    const total = active.gains.totalDivine;
    const stat = (label, value, id, note, extra = "") => '<div class="session-stat' + extra + '"><span>' + label + "</span><b" + (id ? ' id="' + id + '"' : "") + ">" + value + "</b>" + (note ? "<small>" + note + "</small>" : "") + "</div>";
    let html = '<div class="session-stats">' +
      stat("LUCRO", escape(signed(total)), "", hours > 0.05 ? escape(money(total / hours)) + " por hora" : "calculando…", " gold") +
      stat("TEMPO DE SESSÃO", duration(Date.now() - Date.parse(active.startedAt)), "session-timer", "desde " + new Date(active.startedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })) +
      stat("MAPAS", log.found ? number(log.maps) : "—", "", log.found ? shortDuration(log.mapMs || 0) + " dentro de mapas · " + number(log.zones) + " zonas" : "") +
      stat("MORTES", log.found ? number(log.deaths) : "—", "", log.found && log.deaths ? "última em " + escape(log.deathList[log.deathList.length - 1].zone || "—") : "") +
      "</div>";
    if (!log.found) html += '<p class="session-warning">Não encontrei o Client.txt do jogo: mapas, zonas e mortes não serão contados. Os ganhos por Ctrl+C funcionam normalmente.</p>';
    else if (log.current) html += '<div class="session-current"><span class="session-pulse"></span><div><small>VOCÊ ESTÁ EM</small><b>' + escape(log.current.name) + '</b></div><span class="session-current-meta">Nível ' + escape(log.current.level) + ' · há <b id="session-zone-timer">' + duration(Date.now() - log.current.since) + "</b></span></div>";
    if (active.watcherError && !active.watching) html += '<p class="session-warning">Não consegui observar a área de transferência: ' + escape(active.watcherError) + "</p>";
    live.innerHTML = html;
  }

  function renderGains() {
    const holder = byId("session-gains");
    if (!holder) return;
    const rows = session.data.active.gains.rows;
    if (!rows.length) { holder.innerHTML = '<div class="session-empty">Nada ainda. Pegue um orb, passe o mouse na pilha do inventário e aperte <kbd>Ctrl</kbd>+<kbd>C</kbd>.</div>'; return; }
    holder.innerHTML = rows.map(row => '<div class="session-gain">' +
      (row.icon ? '<img src="' + escape(row.icon) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '<span class="session-currency-blank">✦</span>') +
      '<span class="session-gain-name"><b>' + escape(row.name) + "</b><small>" + escape((row.each ? money(row.each) + " cada" : "sem preço no poe.ninja") + (row.stack != null ? " · pilha " + number(row.stack) : "")) + "</small></span>" +
      '<span class="session-gain-amount">' + (row.amount > 0 ? "+" : "") + escape(number(row.amount)) + "</span>" +
      '<span class="session-gain-value">' + escape(row.each ? signed(row.divine) : "—") + "</span>" +
      '<span class="session-gain-buttons"><button type="button" data-adjust="' + escape(row.id) + '" data-delta="-1" aria-label="Tirar 1">−</button><button type="button" data-adjust="' + escape(row.id) + '" data-delta="1" aria-label="Adicionar 1">+</button></span>' +
      "</div>").join("");
    holder.querySelectorAll("[data-adjust]").forEach(button => button.addEventListener("click", () => send("/api/session/adjust", { currency: button.dataset.adjust, delta: Number(button.dataset.delta) }, false)));
  }

  function renderEvents() {
    const holder = byId("session-events");
    if (!holder) return;
    const active = session.data.active;
    byId("session-event-count").textContent = active.eventCount ? number(active.eventCount) + " registros" : "";
    if (!active.events.length) { holder.innerHTML = '<div class="session-empty">Os Ctrl+C aparecem aqui com a hora e um botão para desfazer.</div>'; return; }
    holder.innerHTML = active.events.map(event => '<div class="session-event ' + escape(event.kind) + '"><time>' + escape(new Date(event.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })) + "</time><span>" + escape(eventText(event)) + '</span><button type="button" data-undo="' + escape(event.id) + '" title="Desfazer" aria-label="Desfazer">↺</button></div>').join("");
    holder.querySelectorAll("[data-undo]").forEach(button => button.addEventListener("click", () => send("/api/session/undo", { id: button.dataset.undo }, false)));
  }

  function renderHistory() {
    const holder = byId("session-history");
    const history = session.data.history || [];
    if (!history.length) { holder.innerHTML = '<div class="filter-empty">Nenhuma sessão salva ainda.</div>'; return; }
    const totalProfit = history.reduce((sum, record) => sum + record.profitDivine, 0);
    const totalHours = history.reduce((sum, record) => sum + record.durationMs, 0) / 3600000;
    holder.innerHTML = '<div class="session-history-summary"><span>' + number(history.length) + " sessões</span><span>Lucro total <b>" + escape(money(totalProfit)) + "</b></span><span>Média <b>" + escape(money(totalHours ? totalProfit / totalHours : 0)) + " por hora</b></span></div>" +
      history.map(record => {
        const hours = record.durationMs / 3600000;
        const recordRate = record.exaltedPerDivine || rate();
        const changes = (record.changes || []).slice(0, 6).map(change => '<span class="' + (change.delta < 0 ? "down" : "up") + '">' + (change.delta > 0 ? "+" : "") + escape(number(change.delta, 1) + " " + change.name) + "</span>").join("");
        return '<article class="session-record">' +
          '<div class="session-record-main"><b>' + escape(new Date(record.startedAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })) + "</b><small>" + escape([shortDuration(record.durationMs), record.log ? number(record.log.maps) + " mapas" : "", record.log ? number(record.log.deaths) + " mortes" : "", record.league].filter(Boolean).join(" · ")) + "</small>" + (record.note ? '<small class="session-record-note">' + escape(record.note) + "</small>" : "") + "</div>" +
          '<div class="session-record-changes">' + changes + "</div>" +
          '<div class="session-record-value"><b class="' + (record.profitDivine < 0 ? "negative" : "") + '">' + escape(signed(record.profitDivine, recordRate)) + "</b><small>" + escape(hours > 0.05 ? money(record.profitDivine / hours, recordRate) + "/hora" : "") + "</small></div>" +
          '<button class="session-record-delete" data-delete-session="' + escape(record.id) + '" type="button" title="Apagar esta sessão do histórico" aria-label="Apagar sessão">×</button>' +
          "</article>";
      }).join("");
    holder.querySelectorAll("[data-delete-session]").forEach(button => button.addEventListener("click", () => {
      if (confirm("Apagar esta sessão do histórico?")) send("/api/session/delete", { id: button.dataset.deleteSession });
    }));
  }

  function renderLeagues() {
    const select = byId("session-league");
    const leagues = session.data.leagues || [];
    const list = leagues.length ? leagues : [{ id: session.data.league, name: session.data.league }];
    select.innerHTML = list.map(league => '<option value="' + escape(league.id) + '">' + escape(league.name || league.id) + "</option>").join("");
    select.value = session.data.league;
    select.disabled = !!session.data.active;
  }

  function bindMain() {
    if (session.mode === "idle") {
      byId("session-start").addEventListener("click", () => { chime(true); send("/api/session/start", { league: byId("session-league").value }); });
      const notify = byId("session-notify");
      if (notify) notify.addEventListener("click", async () => { try { await Notification.requestPermission(); } catch {} render(true); });
      return;
    }
    byId("session-end").addEventListener("click", () => send("/api/session/end", { otherExalted: Number(byId("session-other").value) || 0, note: byId("session-note").value }));
    byId("session-cancel").addEventListener("click", () => { if (confirm("Descartar esta sessão sem salvar?")) send("/api/session/cancel", {}); });
    byId("session-manual-add").addEventListener("click", () => {
      const currency = byId("session-manual-currency").value;
      if (currency) send("/api/session/adjust", { currency, delta: 1 }, false);
    });
    byId("session-other").addEventListener("input", event => {
      clearTimeout(session.otherTimer);
      session.otherTimer = setTimeout(() => send("/api/session/other", { otherExalted: Number(event.target.value) || 0 }, false), 600);
    });
  }

  function render(full) {
    const data = session.data;
    const warning = byId("session-warning");
    const messages = [];
    if (data.priceError) messages.push("Não consegui buscar os preços no poe.ninja (" + data.priceError + "). Os valores aparecem quando a conexão voltar.");
    if (data.stale) messages.push("Preços do poe.ninja desatualizados: mostrando os últimos salvos.");
    warning.hidden = !messages.length;
    warning.textContent = messages.join(" ");
    renderLeagues();
    const mode = data.active ? "active" : "idle";
    if (full || mode !== session.mode) {
      session.mode = mode;
      byId("session-main").innerHTML = mode === "active" ? renderActive() : renderIdle();
      bindMain();
    }
    if (mode === "active") {
      renderLive();
      renderGains();
      renderEvents();
      const listening = byId("session-listening");
      listening.textContent = data.active.watching ? "Ouvindo Ctrl+C" : "Ctrl+C desligado";
      listening.classList.toggle("on", !!data.active.watching);
    }
    renderHistory();
  }

  async function load(full = false) {
    try {
      const response = await fetch("/api/session", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Falha ao carregar a sessão.");
      session.data = json;
      render(full);
    } catch (error) {
      if (!session.data) byId("session-main").innerHTML = '<div class="filter-empty">' + escape(error.message) + "</div>";
    }
  }

  async function pollEvents() {
    try {
      const response = await fetch("/api/session/events?after=" + encodeURIComponent(session.lastEvent || ""), { cache: "no-store" });
      const json = await response.json();
      if (!json.active) return;
      const fresh = session.lastEvent ? json.events : [];
      session.lastEvent = json.last;
      if (!fresh.length) return;
      await load(false);
      fresh.forEach(announce);
    } catch {}
  }

  async function send(url, body, full = true) {
    if (session.busy) return;
    session.busy = true;
    try {
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Falha na operação.");
      session.data = json;
      render(full);
      if (json.finished) showFinished(json.finished);
      schedule();
    } catch (error) {
      alert(error.message);
    } finally {
      session.busy = false;
    }
  }

  function showFinished(record) {
    const hours = record.durationMs / 3600000;
    const box = document.createElement("div");
    box.className = "session-finished";
    box.innerHTML = "<small>SESSÃO SALVA</small><b class=\"" + (record.profitDivine < 0 ? "negative" : "") + "\">" + escape(signed(record.profitDivine, record.exaltedPerDivine)) + "</b><span>" + escape(shortDuration(record.durationMs) + (hours > 0.05 ? " · " + money(record.profitDivine / hours, record.exaltedPerDivine) + " por hora" : "") + (record.log ? " · " + record.log.maps + " mapas" : "")) + "</span>";
    byId("session-main").prepend(box);
  }

  function tick() {
    if (!session.data || !session.data.active) return;
    const timer = byId("session-timer");
    if (timer) timer.textContent = duration(Date.now() - Date.parse(session.data.active.startedAt));
    const zone = byId("session-zone-timer");
    const log = session.data.active.log;
    if (zone && log && log.current) zone.textContent = duration(Date.now() - log.current.since);
  }

  // Com sessão ativa, a página continua avisando dos Ctrl+C mesmo em outra aba do Atlas ou minimizada.
  function schedule() {
    clearInterval(session.statePoll);
    clearInterval(session.eventPoll);
    clearInterval(session.tickTimer);
    if (!session.data || !session.data.active) { session.lastEvent = null; return; }
    session.eventPoll = setInterval(pollEvents, EVENT_POLL_MS);
    pollEvents();
    if (session.pageActive) {
      session.statePoll = setInterval(() => load(false), STATE_POLL_MS);
      session.tickTimer = setInterval(tick, 1000);
    }
  }

  window.setSessionPageActive = async active => {
    session.pageActive = active;
    if (active) await load(!session.data);
    schedule();
  };

  document.addEventListener("DOMContentLoaded", () => {
    const toasts = document.createElement("div");
    toasts.id = "session-toasts";
    toasts.className = "session-toasts";
    toasts.setAttribute("aria-live", "polite");
    document.body.appendChild(toasts);
    // O navegador só libera som depois de um clique na página.
    document.addEventListener("pointerdown", () => {
      try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === "suspended") audio.resume(); } catch {}
    }, { once: true });
    byId("session-league").addEventListener("change", event => send("/api/session/league", { league: event.target.value }));
    // Retoma os avisos se uma sessão já estiver em andamento quando o Atlas abrir.
    fetch("/api/session/events", { cache: "no-store" }).then(response => response.json()).then(json => {
      if (json.active) { session.data = session.data || { active: { gains: { rows: [] } } }; schedule(); }
    }).catch(() => {});
  });
})();
