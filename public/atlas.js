(() => {
  // Aba "Atlas": versão instalada, verificar e aplicar atualização do GitHub.
  const view = { info: null, error: "", busy: "" };
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  const when = value => { const date = new Date(value); return isNaN(date) ? "—" : date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }); };
  const toast = message => { if (typeof showToast === "function") showToast(message); };
  const label = version => version && version.message ? version.message : version && version.sha ? version.sha.slice(0, 7) : "desconhecida";

  async function check(force) {
    view.busy = "check"; view.error = ""; render();
    try {
      const response = await fetch("/api/update/check" + (force ? "?force=1" : ""));
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não consegui verificar a atualização.");
      view.info = result;
    } catch (error) { view.error = error.message || "Não consegui verificar a atualização."; }
    view.busy = ""; render(); markNav();
    return view.info;
  }

  async function apply() {
    view.busy = "apply"; view.error = ""; render(); closePrompt();
    try {
      const response = await fetch("/api/update/apply", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "A atualização falhou.");
      view.busy = "restart"; render();
      await waitForRestart();
      location.reload();
    } catch (error) { view.busy = ""; view.error = error.message || "A atualização falhou."; render(); }
  }

  // O servidor reinicia com o código novo; espera ele voltar antes de recarregar a página.
  async function waitForRestart() {
    await new Promise(resolve => setTimeout(resolve, 1500));
    for (let i = 0; i < 40; i++) {
      try { if ((await fetch("/api/update/ping", { cache: "no-store" })).ok) return; } catch {}
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  function markNav() {
    const dot = document.getElementById("nav-update-dot");
    if (dot) dot.hidden = !(view.info && view.info.available);
  }

  function render() {
    const root = document.getElementById("atlas");
    if (!root) return;
    const info = view.info;
    let status;
    if (view.busy === "apply") status = '<div class="atlas-status is-working">Baixando a atualização do GitHub…</div>';
    else if (view.busy === "restart") status = '<div class="atlas-status is-working">Atualização instalada. Reiniciando o Atlas…</div>';
    else if (view.busy === "check") status = '<div class="atlas-status is-working">Verificando no GitHub…</div>';
    else if (view.error) status = '<div class="atlas-status is-error">' + esc(view.error) + '</div>';
    else if (!info) status = '<div class="atlas-status">Clique em “Verificar atualização”.</div>';
    else if (info.devCopy) status = '<div class="atlas-status">' + (info.available ? "O GitHub tem uma versão diferente da sua cópia. " : "Sua cópia está igual ao GitHub. ") + 'Esta é a cópia de quem desenvolve: atualize e envie pelo GitHub Desktop.</div>';
    else if (info.available) status = '<div class="atlas-status is-new">Nova versão disponível: <b>' + esc(label(info.latest)) + '</b> · ' + info.files + (info.files === 1 ? " arquivo" : " arquivos") + ' para baixar.</div>';
    else status = '<div class="atlas-status is-ok">Você já está com a versão mais nova.</div>';
    const busy = Boolean(view.busy);
    root.innerHTML = '<div class="atlas-page">'
      + '<header class="atlas-head"><span class="atlas-kicker">PROGRAMA</span><h2>Atlas de <em>Wraeclast</em></h2><p>Mantenha o programa igual à versão publicada no GitHub. Seus filtros, cofre, market, builds e configurações não são apagados.</p></header>'
      + '<section class="atlas-card">'
      + '<div class="atlas-versions"><div><small>Versão instalada</small><b>' + esc(info && !info.devCopy ? label(info.current) : info && info.devCopy ? "cópia de desenvolvimento" : "—") + '</b></div>'
      + '<div><small>Versão no GitHub</small><b>' + esc(info ? label(info.latest) : "—") + '</b><span>' + esc(info && info.latest ? when(info.latest.date) : "") + '</span></div>'
      + '<div><small>Última verificação</small><b>' + esc(info ? when(info.checkedAt) : "—") + '</b></div></div>'
      + status
      + '<div class="atlas-actions"><button type="button" class="atlas-button" data-atlas-check ' + (busy ? "disabled" : "") + '>⟳ Verificar atualização</button>'
      + '<button type="button" class="atlas-button is-primary" data-atlas-apply ' + (busy || !info || !info.available || info.devCopy ? "disabled" : "") + '>⬇ Atualizar o programa</button></div>'
      + (info && info.repoUrl ? '<a class="atlas-repo" href="' + esc(info.repoUrl) + '" target="_blank" rel="noopener">Ver o projeto no GitHub ↗</a>' : "")
      + '</section></div>';
    root.querySelector("[data-atlas-check]").addEventListener("click", () => check(true));
    root.querySelector("[data-atlas-apply]").addEventListener("click", apply);
  }

  function closePrompt() { const prompt = document.getElementById("atlas-update-prompt"); if (prompt) prompt.remove(); }
  function showPrompt(info) {
    closePrompt();
    const prompt = document.createElement("div");
    prompt.id = "atlas-update-prompt";
    prompt.className = "atlas-prompt-backdrop";
    prompt.innerHTML = '<div class="atlas-prompt" role="dialog" aria-modal="true"><span class="atlas-kicker">ATUALIZAÇÃO</span><h3>Nova versão do Atlas</h3>'
      + '<p>Saiu a versão <b>' + esc(label(info.latest)) + '</b>. Quer atualizar agora? O programa baixa tudo do GitHub e reinicia sozinho.</p>'
      + '<div class="atlas-actions"><button type="button" class="atlas-button is-primary" data-prompt-apply>⬇ Atualizar agora</button><button type="button" class="atlas-button" data-prompt-later>Depois</button></div></div>';
    document.body.appendChild(prompt);
    prompt.querySelector("[data-prompt-apply]").addEventListener("click", () => { if (typeof changePage === "function") changePage("atlas"); apply(); });
    prompt.querySelector("[data-prompt-later]").addEventListener("click", closePrompt);
  }

  window.onAtlasPage = () => { render(); if (!view.info && !view.busy) check(false); };

  // Ao abrir o programa: verifica sozinho e pergunta se quer atualizar.
  setTimeout(async () => {
    const info = await check(false);
    if (info && info.available && !info.devCopy) showPrompt(info);
  }, 1500);
})();
