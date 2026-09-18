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
function analyzeCardState(){
  if(state.accessMode !== "github_app") return "public";
  return state.github.connected ? "private_connected" : "private_disconnected";
}
function syncAnalyzeCard(){
  const form = document.querySelector("#analyze-form");
  const mode = analyzeCardState();
  if(form) form.dataset.analyzeState = mode;
  const pub = document.querySelector("#public-repo-input");
  const priv = document.querySelector("#private-repo-input");
  const disconnected = document.querySelector("#private-disconnected");
  if(pub) pub.hidden = mode !== "public";
  if(disconnected) disconnected.hidden = mode !== "private_disconnected";
  if(priv) priv.hidden = mode !== "private_connected";
  const hint = document.querySelector("#granted-repo-hint");
  if(hint){
    hint.hidden = mode !== "private_connected";
    hint.textContent = t("grantedReposHint");
  }
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
setSourceMode = function(mode){
  state.accessMode = mode === "github_app" ? "github_app" : "public";
  document.querySelectorAll("[data-source-mode]").forEach(b => b.classList.toggle("active", b.dataset.sourceMode === state.accessMode));
  syncAnalyzeCard();
  renderGitHubState();
  updateAssistantContext();
};
async function activatePrivateRepoCta(){
  setSourceMode("github_app");
  const status = document.querySelector("#github-user-status");
  if(status) status.textContent = t("githubConnecting");
  const ok = state.github.connected || await refreshGitHubSession();
  if(!ok){ return; }
  populateGrantedRepoDropdown();
  renderGitHubState();
  const select = document.querySelector("#private-repository");
  if(!select) return;
  select.focus();
  if(select.showPicker) try { select.showPicker(); } catch {}
}
renderGitHubState = function(){
  const status = document.querySelector("#github-user-status");
  const connect = document.querySelector("#github-connect");
  const select = document.querySelector("#private-repository");
  if(!status || !select) return;
  if(state.github.connected){
    const repos = grantedRepositories();
    const login = state.github.user?.login ? " @" + state.github.user.login : "";
    status.textContent = repos.length ? t("githubConnected") + login + " · " + repos.length + " repos" : t("noGrantedRepos");
    if(connect) connect.textContent = t("disconnectGitHub");
    populateGrantedRepoDropdown(select.value);
    const ws = document.querySelector("#workspace-connected");
    if(ws) ws.hidden = false;
    renderWorkspaceRepoOptions();
  } else {
    status.textContent = state.accessMode === "github_app" ? t("connectToLoadRepos") : t("publicMode");
    if(connect) connect.textContent = t("connectGitHub");
    populateGrantedRepoDropdown();
    const ws = document.querySelector("#workspace-connected");
    if(ws) ws.hidden = true;
  }
  syncAnalyzeCard();
};
function bindMobileChrome(){
  const menu = document.querySelector("#header-menu");
  const nav = document.querySelector("#header-nav");
  if(menu && nav){
    menu.onclick = () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      menu.setAttribute("aria-expanded", String(open));
    };
    nav.querySelectorAll("button,a").forEach(el => el.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menu.setAttribute("aria-expanded", "false");
    }));
  }
  const connectCta = document.querySelector("#connect-github-cta");
  if(connectCta) connectCta.onclick = () => startGitHubConnect();
  const treeToggle = document.querySelector("#tree-toggle");
  const filesLayout = document.querySelector(".files-layout");
  if(treeToggle && filesLayout){
    treeToggle.onclick = () => {
      const collapsed = filesLayout.classList.toggle("tree-collapsed");
      treeToggle.setAttribute("aria-expanded", String(!collapsed));
      treeToggle.textContent = t(collapsed ? "showTree" : "hideTree");
    };
  }
  const markFocus = (on) => document.body.classList.toggle("input-focused", on);
  document.addEventListener("focusin", (e) => {
    const target = e.target;
    if(!target) return;
    const field = target.matches("input,textarea,select");
    const inAssistant = target.closest("#assistant-panel");
    markFocus(field && !inAssistant);
  });
  document.addEventListener("focusout", () => setTimeout(() => {
    const active = document.activeElement;
    const field = active && active.matches && active.matches("input,textarea,select");
    const inAssistant = active && active.closest && active.closest("#assistant-panel");
    markFocus(Boolean(field && !inAssistant));
  }, 0));
  if(window.visualViewport){
    const syncKeyboard = () => {
      document.body.classList.toggle("keyboard-open", window.visualViewport.height < window.innerHeight - 80);
    };
    window.visualViewport.addEventListener("resize", syncKeyboard);
  }
}
function assetCategory(path){
  const rel = String(path||"").replace("AVGL_FULL_ASSET_PACKAGE/","");
  if(rel.includes("01_logos")) return "Logos";
  if(rel.includes("02_favicon")) return "Favicon / App icons";
  if(rel.includes("03_foundations") || rel.includes("foundations")) return "Foundations";
  if(rel.includes("04_iconography")) return "Iconography";
  if(rel.includes("05_ui_assets")) return "UI assets";
  if(rel.includes("06_marketing")) return "Marketing";
  if(rel.includes("07_mockups") || rel.includes("reference")) return "References";
  if(rel.includes("08_guidelines") || rel.endsWith(".pdf") || rel.includes("guidelines")) return "Guidelines";
  return "Other";
}
function renderAssetLibrary(files){
  const host = document.querySelector("#asset-library-grid");
  const cats = document.querySelector("#asset-categories");
  const search = document.querySelector("#asset-search");
  if(!host) return;
  const groups = new Map();
  files
    .filter(file => assetCategory(file.name) === "Iconography")
    .forEach(file => {
      const key = "Iconography";
      if(!groups.has(key)) groups.set(key, []);
      groups.get(key).push(file);
    });
  const names = ["Iconography"].filter(name => groups.has(name));
  let active = "Iconography";
  const draw = () => {
    const q = (search && !search.hidden ? search.value : "").trim().toLowerCase();
    host.replaceChildren();
    const list = (groups.get(active)||[]).filter(file => !q || String(file.name).toLowerCase().includes(q));
    list.forEach(file => host.append(assetCard(file)));
  };
  if(cats){
    cats.replaceChildren();
    names.forEach(name => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "asset-category" + (name === active ? " active" : "");
      b.innerHTML = "<span>"+name+"</span><span>"+groups.get(name).length+"</span>";
      b.onclick = () => {
        active = name;
        cats.querySelectorAll(".asset-category").forEach(el => el.classList.toggle("active", el === b));
        if(search) search.hidden = false;
        draw();
      };
      cats.append(b);
    });
  }
  if(search){
    search.hidden = false;
    search.oninput = draw;
  }
  draw();
}
`;

function injectI18n(src){
  return src
    .replace(
      'privateChatBlocked:"Remote assistant is disabled for private repository context. Use LOCAL_PRIVATE for source-private inference."}',
      'privateChatBlocked:"Remote assistant is disabled for private repository context. Use LOCAL_PRIVATE for source-private inference.",selectGrantedRepo:"Select a granted repository",githubConnecting:"Connecting GitHub\u2026",noGrantedRepos:"No repositories were granted to AVGL.",connectToLoadRepos:"Connect GitHub to load granted repositories.",grantedReposHint:"Only repositories you granted to the Visual-Grammar GitHub App.",heroLead:"Evidence-bound system mapping for agentic repositories.",privateNeedsConnection:"Private repositories require a GitHub connection.",hideTree:"Hide repository tree",showTree:"Show repository tree"}'
    )
    .replace(
      'privateChatBlocked:"Remote Assistant ist f\u00fcr Private-Repository-Context deaktiviert. Nutze LOCAL_PRIVATE f\u00fcr source-private Inference."}',
      'privateChatBlocked:"Remote Assistant ist f\u00fcr Private-Repository-Context deaktiviert. Nutze LOCAL_PRIVATE f\u00fcr source-private Inference.",selectGrantedRepo:"Freigegebenes Repository w\u00e4hlen",githubConnecting:"GitHub wird verbunden\u2026",noGrantedRepos:"AVGL wurden keine Repositories freigegeben.",connectToLoadRepos:"GitHub verbinden, um freigegebene Repositories zu laden.",grantedReposHint:"Nur Repositories, die du der Visual-Grammar GitHub App freigegeben hast.",heroLead:"Evidence-gebundene Systemkartierung f\u00fcr agentische Repositories.",privateNeedsConnection:"Private Repositories ben\u00f6tigen eine GitHub-Verbindung.",hideTree:"Repository-Tree ausblenden",showTree:"Repository-Tree einblenden"}'
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
  next = next.replace(
    'files.forEach(file=>host.append(assetCard(file)));',
    'renderAssetLibrary(files);'
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
bindMobileChrome();
syncAnalyzeCard();
`;
}

const source = await fetch("/app.js", { cache: "no-store" }).then((r) => {
  if (!r.ok) throw new Error("Could not load AVGL web app.");
  return r.text();
});
const blob = new Blob([patchSource(source)], { type: "text/javascript" });
await import(URL.createObjectURL(blob));
