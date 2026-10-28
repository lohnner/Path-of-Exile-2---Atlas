// Atualização do Atlas pelo GitHub: compara os arquivos daqui com os do repositório e baixa só o que mudou.
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const REPO = "lohnner/Path-of-Exile-2---Atlas";
const BRANCH = "main";
const API = "https://api.github.com/repos/" + REPO;
const RAW = "https://raw.githubusercontent.com/" + REPO + "/";
const CHECK_CACHE_MS = 5 * 60 * 1000;
// Arquivos de cada pessoa: nunca são substituídos, mesmo que apareçam no repositório.
const PERSONAL = new Set(["settings.json", "atlas-version.json", "data/sessions.json", "data/market.json", "data/economy.json", "data/planner_builds.json"]);
const CRLF_EXTENSIONS = new Set([".bat", ".cmd", ".ps1"]);

export function createUpdater(root) {
  const versionFile = path.join(root, "atlas-version.json");
  let cached = null;

  const github = async url => {
    const response = await fetch(url, { headers: { "User-Agent": "Atlas-Wraeclast-Updater", Accept: "application/vnd.github+json" } });
    if (response.status === 404) throw new Error("Repositório do Atlas não encontrado no GitHub (ele precisa ser público).");
    if (response.status === 403) throw new Error("O GitHub limitou as consultas por agora. Tente de novo em alguns minutos.");
    if (!response.ok) throw new Error("O GitHub respondeu com erro " + response.status + ".");
    return response.json();
  };
  const readInstalled = async () => { try { return JSON.parse(await fs.readFile(versionFile, "utf8")); } catch { return null; } };
  const isDevCopy = async () => { try { return (await fs.stat(path.join(root, ".git"))).isDirectory(); } catch { return false; } };
  const devHead = async () => {
    try { return (await fs.readFile(path.join(root, ".git", "refs", "heads", BRANCH), "utf8")).trim(); }
    catch {
      try { return ((await fs.readFile(path.join(root, ".git", "packed-refs"), "utf8")).match(new RegExp("^([0-9a-f]{40}) refs/heads/" + BRANCH + "$", "m")) || [])[1] || ""; }
      catch { return ""; }
    }
  };
  const safePath = file => {
    if (!file || file.includes("\\") || file.split("/").some(part => !part || part === "." || part === "..")) return null;
    const full = path.resolve(root, file);
    return full.startsWith(path.resolve(root) + path.sep) ? full : null;
  };
  // Mesmo hash que o Git usa; quebras de linha do Windows contam como do Linux, igual ao Git faz com texto.
  const localBlobSha = async full => {
    let buffer;
    try { buffer = await fs.readFile(full); } catch { return null; }
    if (!buffer.subarray(0, 8000).includes(0)) buffer = Buffer.from(buffer.toString("latin1").replace(/\r\n/g, "\n"), "latin1");
    return createHash("sha1").update("blob " + buffer.length + "\0").update(buffer).digest("hex");
  };
  const treeFiles = async treeSha => {
    const tree = await github(API + "/git/trees/" + treeSha + "?recursive=1");
    return new Map(tree.tree.filter(entry => entry.type === "blob" && !PERSONAL.has(entry.path) && safePath(entry.path)).map(entry => [entry.path, entry.sha]));
  };

  async function latest() {
    const commit = await github(API + "/commits/" + BRANCH);
    return { sha: commit.sha, treeSha: commit.commit.tree.sha, message: String(commit.commit.message || "").split("\n")[0], date: commit.commit.committer && commit.commit.committer.date };
  }

  // Quais arquivos precisam ser baixados para chegar na versão mais nova.
  async function pendingFiles(target, installed) {
    const next = await treeFiles(target.treeSha);
    const pending = [];
    if (installed && installed.treeSha) {
      // Já instalado por aqui: só o que mudou entre as duas versões (não mexe nos dados que a pessoa sincronizou).
      const previous = await treeFiles(installed.treeSha).catch(() => null);
      if (previous) {
        for (const [file, sha] of next) if (previous.get(file) !== sha) pending.push(file);
        return pending;
      }
    }
    for (const [file, sha] of next) if (await localBlobSha(safePath(file)) !== sha) pending.push(file);
    return pending;
  }

  async function check(force = false) {
    if (!force && cached && Date.now() - cached.at < CHECK_CACHE_MS) return cached.result;
    const [target, installed, dev] = await Promise.all([latest(), readInstalled(), isDevCopy()]);
    let result;
    if (dev) {
      const head = await devHead();
      result = { devCopy: true, available: Boolean(head) && head !== target.sha, files: 0, current: { sha: head }, latest: target };
    } else if (installed && installed.sha === target.sha) {
      result = { available: false, files: 0, current: installed, latest: target };
    } else {
      const files = await pendingFiles(target, installed);
      // Cópia já igual ao GitHub (por exemplo, recém baixada em ZIP): só anota a versão.
      if (!files.length) await fs.writeFile(versionFile, JSON.stringify({ sha: target.sha, treeSha: target.treeSha, message: target.message, date: target.date }, null, 2), "utf8");
      result = { available: files.length > 0, files: files.length, current: installed || (files.length ? null : target), latest: target };
    }
    result.checkedAt = new Date().toISOString();
    result.repoUrl = "https://github.com/" + REPO;
    cached = { at: Date.now(), result };
    return result;
  }

  async function apply() {
    if (await isDevCopy()) throw new Error("Esta é a cópia de quem desenvolve (tem Git). Atualize pelo GitHub Desktop.");
    const [target, installed] = await Promise.all([latest(), readInstalled()]);
    const files = await pendingFiles(target, installed);
    // Baixa tudo primeiro; só grava depois que todos chegaram, para não deixar o programa pela metade.
    const downloads = [];
    for (const file of files) {
      const response = await fetch(RAW + target.sha + "/" + file.split("/").map(encodeURIComponent).join("/"), { headers: { "User-Agent": "Atlas-Wraeclast-Updater" } });
      if (!response.ok) throw new Error("Não consegui baixar " + file + " (erro " + response.status + ").");
      let body = Buffer.from(await response.arrayBuffer());
      if (CRLF_EXTENSIONS.has(path.extname(file).toLowerCase())) body = Buffer.from(body.toString("latin1").replace(/\r?\n/g, "\r\n"), "latin1");
      downloads.push({ full: safePath(file), body });
    }
    for (const { full, body } of downloads) {
      await fs.mkdir(path.dirname(full), { recursive: true });
      const temp = full + ".atlas-update";
      await fs.writeFile(temp, body);
      await fs.rename(temp, full);
    }
    await fs.writeFile(versionFile, JSON.stringify({ sha: target.sha, treeSha: target.treeSha, message: target.message, date: target.date }, null, 2), "utf8");
    cached = null;
    return { ok: true, files: files.length, latest: target };
  }

  // Abre um servidor novo (com o código atualizado) numa janela própria e encerra este.
  function restart(serverFile) {
    const child = spawn(process.execPath, [serverFile], { cwd: root, detached: true, stdio: "ignore", env: { ...process.env, ATLAS_RESTARTED: "1" } });
    child.unref();
    setTimeout(() => process.exit(0), 300);
  }

  return { check, apply, restart };
}
