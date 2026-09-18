const EXTRA_EN = {
  selectGrantedRepo: "Select a granted repository",
  githubConnecting: "Connecting GitHub…",
  noGrantedRepos: "No repositories were granted to AVGL.",
  connectToLoadRepos: "Connect GitHub to load granted repositories.",
  grantedReposHint: "Only repositories you granted to the Visual-Grammar GitHub App."
};
const EXTRA_DE = {
  selectGrantedRepo: "Freigegebenes Repository wählen",
  githubConnecting: "GitHub wird verbunden…",
  noGrantedRepos: "AVGL wurden keine Repositories freigegeben.",
  connectToLoadRepos: "GitHub verbinden, um freigegebene Repositories zu laden.",
  grantedReposHint: "Nur Repositories, die du der Visual-Grammar GitHub App freigegeben hast."
};

const PATCH_FN = `
function githubConnectUrl(){
  return "/api/github-app/install?returnTo="+encodeURIComponent(location.pathname+location.search);
}
function startGitHubConnect(){ location.href = githubConnectUrl(); }
function grantedRepositories(){
  return (state.github.repositories||[]).slice().sort((a,b)=>{
    if(Boolean(a.private)!==Boolean(b.private)) return a.private ? -1 : 1;
    return String(a.fullName||"").localeCompare(String(b.fullName||""));
  });
}
function ensureGrantedRepoHint(){
  const input = document.querySelector("#private-repo-input");
  if(!input || document.querySelector("#granted-repo-hint")) return;
  const hint = document.createElement("p");
  hint.id = "granted-repo-hint";
  hint.className = "scan-mode-hint granted-repo-hint";
  hint.hidden = true;
  input.insertAdjacentElement("afterend", hint);
}
function populateGrantedRepoDropdown(preferred){
  const select = document.querySelector("#private-repository");
  if(!select) return;
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = t("selectGrantedRepo");
  const repos = grantedRepositories();
  const options = repos.map(repo => {
    const o = document.createElement("option");
    o.value = repo.fullName;
    o.textContent = repo.fullName + (repo.private ? " · private" : "");
    return o;
  });
  const current = preferred || select.value;
  select.replaceChildren(placeholder, ...options);
  select.value = current && repos.some(repo => repo.fullName === current) ? current : "";
  const analyze = document.querySelector("#analyze-private-button");
  if(analyze) analyze.disabled = !select.value;
}
function setSourceMode(mode){
  state.accessMode = mode === "github_app" ? "github_app" : "public";
  document.querySelectorAll("[data-source-mode]").forEach(b => b.classList.toggle("active", b.dataset.sourceMode === state.accessMode));
  const pub = document.querySelector("#public-repo-input");
  const priv = document.querySelector("#private-repo-input");
  if(pub) pub.hidden = state.accessMode !== "public";
  if(priv) priv.hidden = state.accessMode !== "github_app";
  ensureGrantedRepoHint();
  const hint = document.querySelector("#granted-repo-hint");
  if(hint){
    hint.hidden = state.accessMode !== "github_app";
    hint.textContent = t("grantedReposHint");
  }
  renderGitHubState();
  updateAssistantContext();
}
async function activatePrivateRepoCta(){
  setSourceMode("github_app");
  const status = document.querySelector("#github-user-status");
  if(status) status.textContent = t("githubConnecting");
  const ok = state.github.connected || await refreshGitHubSession();
  if(!ok){ startGitHubConnect(); return; }
  populateGrantedRepoDropdown();
  renderGitHubState();
  const select = document.querySelector("#private-repository");
  if(!select) return;
  select.focus();
  if(select.showPicker) try { select.showPicker(); } catch {}
}
function renderGitHubState(){
  const status = document.querySelector("#github-user-status");
  const connect = document.querySelector("#github-connect");
  const select = document.querySelector("#private-repository");
  if(!status || !connect || !select) return;
  if(state.github.connected){
    const repos = grantedRepositories();
    const login = state.github.user?.login ? " @" + state.github.user.login : "";
    status.textContent = repos.length ? t("githubConnected") + login + " · " + repos.length + " repos" : t("noGrantedRepos");
    connect.textContent = t("disconnectGitHub");
    populateGrantedRepoDropdown(select.value);
    const ws = document.querySelector("#workspace-connected");
    if(ws) ws.hidden = false;
    renderWorkspaceRepoOptions();
  } else {
    status.textContent = state.accessMode === "github_app" ? t("connectToLoadRepos") : t("publicMode");
    connect.textContent = t("connectGitHub");
    populateGrantedRepoDropdown();
    const ws = document.querySelector("#workspace-connected");
    if(ws) ws.hidden = true;
  }
}
`;

function injectI18n(src){
  return src
    .replace(
      'privateChatBlocked:"Remote assistant is disabled for private repository context. Use LOCAL_PRIVATE for source-private inference."}',
      'privateChatBlocked:"Remote assistant is disabled for private repository context. Use LOCAL_PRIVATE for source-private inference.",selectGrantedRepo:"Select a granted repository",githubConnecting:"Connecting GitHub\u2026",noGrantedRepos:"No repositories were granted to AVGL.",connectToLoadRepos:"Connect GitHub to load granted repositories.",grantedReposHint:"Only repositories you granted to the Visual-Grammar GitHub App."}'
    )
    .replace(
      'privateChatBlocked:"Remote Assistant ist f\u00fcr Private-Repository-Context deaktiviert. Nutze LOCAL_PRIVATE f\u00fcr source-private Inference."}',
      'privateChatBlocked:"Remote Assistant ist f\u00fcr Private-Repository-Context deaktiviert. Nutze LOCAL_PRIVATE f\u00fcr source-private Inference.",selectGrantedRepo:"Freigegebenes Repository w\u00e4hlen",githubConnecting:"GitHub wird verbunden\u2026",noGrantedRepos:"AVGL wurden keine Repositories freigegeben.",connectToLoadRepos:"GitHub verbinden, um freigegebene Repositories zu laden.",grantedReposHint:"Nur Repositories, die du der Visual-Grammar GitHub App freigegeben hast."}'
    );
}

function patchSource(src){
  let next = injectI18n(src);
  next = next.replace(
    'document.querySelectorAll(".scan-mode-button").forEach(b=>b.onclick=()=>setScanStrategy(b.dataset.scan));',
    'document.querySelectorAll("[data-scan]").forEach(b=>b.onclick=()=>setScanStrategy(b.dataset.scan));'
  );
  next = next.replace(
    'document.querySelectorAll(".scan-mode-button").forEach(b=>b.classList.toggle("active",b.dataset.scan===state.scanStrategy));',
    'document.querySelectorAll("[data-scan]").forEach(b=>b.classList.toggle("active",b.dataset.scan===state.scanStrategy));'
  );
  next = next.replace(
    'document.querySelectorAll("[data-source-mode]").forEach(b=>b.onclick=()=>setSourceMode(b.dataset.sourceMode));',
    'document.querySelectorAll("[data-source-mode]").forEach(b=>b.onclick=()=>{if(b.dataset.sourceMode==="github_app")activatePrivateRepoCta();else setSourceMode("public");});'
  );
  next = next.replace(
    'location.href="/api/github-app/install?returnTo="+encodeURIComponent(location.pathname+location.search)',
    'startGitHubConnect()'
  );
  next = next.replace(
    'if(params.get("github")==="connected"){history.replaceState({},document.title,location.pathname);refreshGitHubSession().then(ok=>{if(ok)setSourceMode("github_app")})}else{refreshGitHubSession()}',
    'if(params.get("github")==="connected"){history.replaceState({},document.title,location.pathname);refreshGitHubSession().then(ok=>{if(ok){setSourceMode("github_app");const s=document.querySelector("#private-repository");if(s){s.focus();if(s.showPicker)try{s.showPicker()}catch{}}}})}else{refreshGitHubSession()}'
  );
  return next + "\n" + PATCH_FN + `
document.querySelectorAll("[data-source-mode]").forEach(b=>b.onclick=()=>{
  if(b.dataset.sourceMode==="github_app") activatePrivateRepoCta();
  else setSourceMode("public");
});
const privateSelect = document.querySelector("#private-repository");
if(privateSelect) privateSelect.addEventListener("change", ()=>{
  const analyze = document.querySelector("#analyze-private-button");
  if(analyze) analyze.disabled = !privateSelect.value;
});
ensureGrantedRepoHint();
`;
}

const source = await fetch("/web/app.js", { cache: "no-store" }).then((r) => {
  if (!r.ok) throw new Error("Could not load AVGL web app.");
  return r.text();
});
const blob = new Blob([patchSource(source)], { type: "text/javascript" });
await import(URL.createObjectURL(blob));
void EXTRA_EN;
void EXTRA_DE;
