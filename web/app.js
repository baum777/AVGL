const { projectFileSemanticContext } = await import(location.origin + "/file-semantic-projection.js");
const $=s=>document.querySelector(s);
const state={locale:localStorage.getItem("avgl.locale")||(navigator.language||"en").toLowerCase().startsWith("de")?"de":"en",scanStrategy:"full",accessMode:"public",repo:"",ir:null,inventory:null,activeFile:null,chat:[],github:{connected:false,user:null,repositories:[]},workspace:{selected:[]}};
const TXT={
en:{hero1:"Understand the agent.",hero2:"Not the graph.",hero:"Analyze public repositories directly or connect GitHub for user-scoped private repositories. AVGL maps bounded evidence into a readable system story, repository relations, and cross-repository workspaces.",repo:"GitHub repository",analyze:"Analyze",help:"Public repositories work directly. Private repositories require a verified GitHub App user session.",analysis:"Analysis",story:"Story",files:"Files",inspect:"Inspect",system:"System",filesTitle:"Repository structure",filesIntro:"Browse the repository by hierarchy. Select a file for a grounded description of its role, content, and likely effect.",search:"Search files…",select:"Select a file",selectHint:"AVGL will explain what it contains, what role it plays, and which semantic areas it touches.",excerpt:"Source excerpt",ask:"Ask AVGL",assistant:"Repository assistant",noRepo:"Analyze a repository first. The assistant will answer against the current repo context.",placeholder:"Ask about architecture, a file, permissions, runtime…",send:"Send",loading:"Discovering, binding and synthesizing repository evidence…",done:"Analysis complete. Signals are bounded; unknowns stay explicit.",loadFiles:"Loading repository hierarchy…",filesFail:"Repository hierarchy could not be loaded.",fileLoad:"Loading file context…",fileFail:"File context could not be loaded.",role:"Role",areas:"Semantic areas",symbols:"Symbols / exports",lines:"Lines",size:"Size",source:"Source surfaces",notFound:"Not evidenced",partial:"Partial bounded scan",complete:"Complete bounded scan",systemNote:"Semantic frame, not reconstructed topology. v0.2 does not yet extract complete relation/call paths.",evidenceIntro:"Static signals grouped by semantic area. Documentation can support understanding, but cannot by itself prove MAY, ACT or DID.",thinking:"Reading relevant repository context…",chatFail:"The assistant could not answer this request.",keyMissing:"OpenRouter is not configured. Add OPENROUTER_API_KEY in Vercel.",suggest1:"What are the biggest architecture gaps?",suggest2:"Explain the authority model.",suggest3:"Which files matter most for runtime behavior?",canMay:"Technical reach is not permission.",actDid:"An effect path is not a verified result.",unknown:"Missing evidence is never filled with a guess.",scanModeLabel:"Scan mode",scanFull:"Full",scanQuick:"Quick · 120",scanFullHint:"Scans every eligible text/code file in the complete Git tree.",scanQuickHint:"Fast weighted sample of up to 120 eligible files.",sampled:"files scanned",fullScan:"Full source scan",quickScan:"Quick sample",relationsTitle:"How is it connected?",effectsTitle:"What does it affect?",noRelations:"No source-backed relation resolved for this file.",noEffects:"No external effect candidate resolved for this file.",localMutation:"Local mutation",externalEffect:"External effect candidate",workspace:"Workspace",connectGitHub:"Connect GitHub",disconnectGitHub:"Disconnect",publicRepo:"Public URL",privateRepo:"Private GitHub",publicMode:"Public repository mode",privateMode:"Private repository mode",githubConnected:"GitHub connected",githubUnavailable:"GitHub App is not configured or no session is active.",workspaceTitle:"Cross-repository workspace",workspaceIntro:"Analyze up to eight repositories at immutable revisions and derive evidence-bound cross-repository relations.",addRepo:"Add repository",connectedRepos:"Connected GitHub repositories",selectedRepos:"Selected repositories",analyzeWorkspace:"Analyze workspace",workspaceEmpty:"Add at least one repository.",workspaceLimit:"A workspace can contain at most eight repositories.",workspaceLoading:"Resolving immutable revisions and analyzing repositories…",workspaceDone:"Workspace analysis complete.",privateChatBlocked:"Remote assistant is disabled for private repository context. Use LOCAL_PRIVATE for source-private inference."},
de:{hero1:"Verstehe den Agent.",hero2:"Nicht den Graph.",hero:"Analysiere öffentliche Repositories direkt oder verbinde GitHub für user-gebundene private Repositories. AVGL überführt Evidence in verständliche System-Stories, Repository-Relationen und Cross-Repo-Workspaces.",repo:"GitHub-Repository",analyze:"Analysieren",help:"Öffentliche Repositories funktionieren direkt. Private Repositories benötigen eine verifizierte GitHub-App-User-Session.",analysis:"Analyse",story:"Story",files:"Files",inspect:"Inspect",system:"System",filesTitle:"Repository-Struktur",filesIntro:"Navigiere hierarchisch durch das Repository. Wähle ein File für eine verständliche Beschreibung von Rolle, Inhalt und möglicher Wirkung.",search:"Files durchsuchen…",select:"File auswählen",selectHint:"AVGL erklärt Inhalt, Rolle und die berührten semantischen Bereiche.",excerpt:"Source-Auszug",ask:"AVGL fragen",assistant:"Repository-Assistant",noRepo:"Analysiere zuerst ein Repository. Danach antwortet der Assistant auf Basis des aktuellen Repo-Context.",placeholder:"Frage zu Architektur, einem File, Permissions, Runtime…",send:"Senden",loading:"Repository-Evidence wird entdeckt, gebunden und synthetisiert…",done:"Analyse abgeschlossen. Signale bleiben begrenzt; Unbekanntes bleibt explizit.",loadFiles:"Repository-Hierarchie wird geladen…",filesFail:"Repository-Hierarchie konnte nicht geladen werden.",fileLoad:"File-Context wird geladen…",fileFail:"File-Context konnte nicht geladen werden.",role:"Rolle",areas:"Semantische Bereiche",symbols:"Symbole / Exports",lines:"Zeilen",size:"Größe",source:"Source-Surfaces",notFound:"Nicht belegt",partial:"Partieller begrenzter Scan",complete:"Vollständiger begrenzter Scan",systemNote:"Semantischer Rahmen, keine rekonstruierte Topologie. v0.2 extrahiert noch keine vollständigen Relation-/Call-Pfade.",evidenceIntro:"Statische Signale nach semantischem Bereich. Dokumentation kann Verständnis stützen, beweist allein aber weder MAY, ACT noch DID.",thinking:"Relevanter Repository-Context wird gelesen…",chatFail:"Der Assistant konnte diese Anfrage nicht beantworten.",keyMissing:"OpenRouter ist nicht konfiguriert. OPENROUTER_API_KEY muss in Vercel gesetzt werden.",suggest1:"Was sind die größten Architektur-Gaps?",suggest2:"Erkläre das Authority-Modell.",suggest3:"Welche Files sind für das Runtime-Verhalten am wichtigsten?",canMay:"Technische Reichweite ist keine Permission.",actDid:"Ein Effect-Pfad ist noch kein verifiziertes Ergebnis.",unknown:"Fehlende Evidence wird niemals durch eine Vermutung ersetzt.",scanModeLabel:"Scan-Modus",scanFull:"Vollständig",scanQuick:"Schnell · 120",scanFullHint:"Scannt jede geeignete Text-/Code-Datei im vollständigen Git-Tree.",scanQuickHint:"Schneller gewichteter Sample-Scan mit maximal 120 geeigneten Files.",sampled:"Files gescannt",fullScan:"Full Source Scan",quickScan:"Quick Sample",relationsTitle:"Wie ist es verbunden?",effectsTitle:"Was bewirkt es?",noRelations:"Für dieses File wurde keine Source-gebundene Relation aufgelöst.",noEffects:"Für dieses File wurde kein externer Effect-Kandidat aufgelöst.",localMutation:"Lokale Mutation",externalEffect:"Externer Effect-Kandidat",workspace:"Workspace",connectGitHub:"GitHub verbinden",disconnectGitHub:"Trennen",publicRepo:"Öffentliche URL",privateRepo:"Privates GitHub",publicMode:"Öffentlicher Repository-Modus",privateMode:"Privater Repository-Modus",githubConnected:"GitHub verbunden",githubUnavailable:"GitHub App ist nicht konfiguriert oder es besteht keine Session.",workspaceTitle:"Cross-Repository Workspace",workspaceIntro:"Analysiert bis zu acht Repositories an unveränderlichen Revisionen und leitet Evidence-gebundene Cross-Repo-Relationen ab.",addRepo:"Repository hinzufügen",connectedRepos:"Verbundene GitHub-Repositories",selectedRepos:"Ausgewählte Repositories",analyzeWorkspace:"Workspace analysieren",workspaceEmpty:"Füge mindestens ein Repository hinzu.",workspaceLimit:"Ein Workspace kann maximal acht Repositories enthalten.",workspaceLoading:"Unveränderliche Revisionen werden aufgelöst und Repositories analysiert…",workspaceDone:"Workspace-Analyse abgeschlossen.",privateChatBlocked:"Remote Assistant ist für Private-Repository-Context deaktiviert. Nutze LOCAL_PRIVATE für source-private Inference."}
};
const Q={en:{WHO:"Who is acting?",KNOW:"What does it work with?",THINK:"How does it think or plan?",CAN:"What can it technically reach?",MAY:"What is it allowed to do?",ACT:"Where can real effects happen?",DID:"How is the result evidenced?"},de:{WHO:"Wer handelt?",KNOW:"Womit arbeitet das System?",THINK:"Wie denkt oder plant es?",CAN:"Was kann es technisch erreichen?",MAY:"Was darf es?",ACT:"Wo kann reale Wirkung entstehen?",DID:"Wie wird das Ergebnis nachgewiesen?"}};
const PREFIX={en:{WHO:"Agent structure",KNOW:"Context surfaces",THINK:"Cognition signals",CAN:"Capability surfaces",MAY:"Authority controls",ACT:"Effect paths",DID:"Evidence paths"},de:{WHO:"Agent-Struktur",KNOW:"Context-Surfaces",THINK:"Cognition-Signale",CAN:"Capability-Surfaces",MAY:"Authority-Controls",ACT:"Effect-Pfade",DID:"Evidence-Pfade"}};
const FAMILY_DE={"agent-definitions":"Agent-Definitionen","harness-instructions":"Harness / Instructions","roles":"Rollen","memory":"Memory","retrieval-rag":"Retrieval / RAG","context-state":"Context / State","resources-files":"Resources / Files","planning":"Planning / Replanning","reasoning":"Reasoning","delegation":"Handoffs / Subagents","routing":"Model- / Task-Routing","model-runtime":"Model-Runtime","filesystem":"Filesystem","browser-web":"Browser / Web","shell-process":"Shell / Process","function-tools":"Function Tools","database-storage":"Database / Storage","git-repository":"Git / Repository","messaging":"Messaging / E-Mail","authorization-policy":"Authorization / Policy","approval-hitl":"Approval / Human Control","permission-scope":"Permissions / Scope","grants-delegation":"Grants / Delegation","revocation-expiry":"Revocation / Expiry","executor-dispatch":"Executor / Dispatch","file-mutation":"File-Mutation","git-mutation":"Git-Mutation","network-send":"Network / API-Dispatch","deployment":"Deployment","database-mutation":"Database-Mutation","command-execution":"Command-Execution","verification":"Verification","receipts":"Receipts","audit-logging":"Audit / Logging","tests":"Tests","tracing-observability":"Tracing / Observability","reconciliation":"Reconciliation","outcomes":"Outcomes / Results"};
function t(k){return TXT[state.locale][k]||TXT.en[k]||k}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function nodeFor(c){return state.ir?.nodes?.find(n=>n.semanticClass===c)||null}
function areaFor(c){return state.ir?.synthesis?.areas?.[c]||null}
function famLabel(f){return state.locale==="de"?(FAMILY_DE[f.id]||f.label):f.label}
function summary(c){const a=areaFor(c),n=nodeFor(c);if(!a||a.status!=="EVIDENCED")return t("notFound");const labels=(a.families||[]).map(famLabel);return (PREFIX[state.locale][c]||c)+": "+(labels.length?labels.join(", "):(n?.label||"bounded signals"))+"."}
function fmtBytes(v){v=Number(v||0);return v<1024?v+" B":v<1048576?(v/1024).toFixed(1)+" KB":(v/1048576).toFixed(1)+" MB"}
const ASSET_ROOT="/assets/";
function assetIcon(path,cls="avgl-inline-icon",alt=""){const img=document.createElement("img");img.className=cls;img.src=ASSET_ROOT+path;img.alt=alt;img.setAttribute("aria-hidden",alt?"false":"true");return img}
function chip(text,cls=""){return el("span","chip "+cls,text)}
function applyLocale(){
 document.documentElement.lang=state.locale;$("#lang-toggle").textContent=state.locale==="de"?"EN":"DE";
 const map={heroLine1:"hero1",heroLine2:"hero2",heroCopy:"hero",repoLabel:"repo",analyzeBtn:"analyze",repoHelp:"help",analysisEyebrow:"analysis",tabStory:"story",tabFiles:"files",tabInspect:"inspect",tabSystem:"system",filesTitle:"filesTitle",filesIntro:"filesIntro",selectFile:"select",selectFileHint:"selectHint",sourceExcerpt:"excerpt",fabText:"ask",assistantTitle:"assistant",assistantContext:"noRepo",assistantSend:"send",scanModeLabel:"scanModeLabel",scanFull:"scanFull",scanQuick:"scanQuick",relationsTitle:"relationsTitle",effectsTitle:"effectsTitle"};
 for(const [id,key] of Object.entries(map)){const n=$("#"+id);if(n)n.textContent=t(key)}
 const aliases={heroLine1:"hero1",heroLine2:"hero2",heroCopy:"hero",repoLabel:"repo",repoHelp:"help",analysisEyebrow:"analysis",tabStory:"story",tabFiles:"files",tabInspect:"inspect",tabSystem:"system",filesTitle:"filesTitle",filesIntro:"filesIntro",selectFile:"select",selectFileHint:"selectHint",sourceExcerpt:"excerpt",askAvgl:"ask",assistantTitle:"assistant",assistantNoRepo:"noRepo",assistantPlaceholder:"placeholder",searchFiles:"search"};
 document.querySelectorAll("[data-i18n]").forEach(n=>{const key=aliases[n.dataset.i18n]||n.dataset.i18n;if(TXT[state.locale][key])n.textContent=t(key)});
 document.querySelectorAll("[data-i18n-placeholder]").forEach(n=>{const key=aliases[n.dataset.i18nPlaceholder]||n.dataset.i18nPlaceholder;if(TXT[state.locale][key])n.placeholder=t(key)});
 $("#file-search").placeholder=t("search");$("#assistant-input").placeholder=t("placeholder");$("#scan-mode-hint").textContent=t(state.scanStrategy==="full"?"scanFullHint":"scanQuickHint");
 if(state.ir){renderAll(false)} if(state.inventory)renderTree();if(state.activeFile)loadFile(state.activeFile,true);renderSuggestions();renderGitHubState();renderWorkspaceSelected();updateAssistantContext();
}
$("#lang-toggle").onclick=()=>{state.locale=state.locale==="de"?"en":"de";localStorage.setItem("avgl.locale",state.locale);applyLocale()};
function setScanStrategy(mode){state.scanStrategy=mode==="bounded"?"bounded":"full";document.querySelectorAll(".scan-mode-button").forEach(b=>b.classList.toggle("active",b.dataset.scan===state.scanStrategy));$("#scan-mode-hint").textContent=t(state.scanStrategy==="full"?"scanFullHint":"scanQuickHint")}
document.querySelectorAll(".scan-mode-button").forEach(b=>b.onclick=()=>setScanStrategy(b.dataset.scan));
function renderStory(){
 const host=$("#story-view");host.replaceChildren();const stack=el("div","story-stack");
 ["WHO","KNOW","THINK"].forEach((c,i)=>stack.append(storyStep(c,i+1)));
 const pair=el("div","capability-pair");pair.append(areaCard("CAN"),areaCard("MAY"));stack.append(pair,storyStep("ACT",4),storyStep("DID",5));host.append(stack)
}
function storyStep(c,i){const n=nodeFor(c),a=areaFor(c),w=el("div","story-step"+(n?"":" unknown"));w.append(el("div","story-number",String(i)));const body=el("div"),q=el("div","story-question");q.append(el("span","token",c),document.createTextNode(" · "+Q[state.locale][c]));body.append(q,el("p","story-answer",summary(c)),el("p","story-explain",n?sourceText(n):t("notFound")));if(a?.families?.length)body.append(familyRow(a));w.append(body);return w}
function areaCard(c){const a=areaFor(c),n=nodeFor(c),card=el("div","pair-card"+(!n&&c==="MAY"?" authority-missing":""));card.append(el("span","token",c),el("h3","",summary(c)),el("p","",n?sourceText(n):t("notFound")));if(a?.families?.length)card.append(familyRow(a));return card}
function familyRow(a){const r=el("div","family-row");(a.families||[]).forEach(f=>r.append(chip(famLabel(f),"family")));return r}
function sourceText(n){const kinds=[...new Set((n.evidence||[]).map(e=>e.sourceKind).filter(Boolean))];return t("source")+": "+(kinds.join(", ")||"unknown")}
function renderInspect(){
 const host=$("#inspect-view");host.replaceChildren(el("div","notice",t("evidenceIntro")));const grid=el("div","inspect-grid");
 for(const c of ["WHO","KNOW","THINK","CAN","MAY","ACT","DID"]){const n=nodeFor(c),card=el("article","inspect-card"),head=el("div","inspect-head");head.append(assetIcon("04_iconography/lenses/avgl-evidence.svg","inspect-lens-icon"),el("div","token",c),chip(n?.evidenceState||"UNKNOWN"));card.append(head,el("h3","",Q[state.locale][c]),el("p","",summary(c)));if(n?.evidence?.length){const d=el("details"),shown=n.evidence.length,total=n.evidenceCount??shown,s=el("summary","",shown===total?total+" evidence refs":shown+" / "+total+" evidence refs shown"),list=el("div","evidence-list");d.append(s);n.evidence.forEach(e=>{const item=el("div","evidence-item"),b=el("button","evidence-link",e.path+":"+e.line);b.onclick=()=>{selectView("files");loadFile(e.path)};item.append(b,chip(e.sourceKind||"unknown"),el("code","",e.snippet||""));list.append(item)});d.append(list);card.append(d)}grid.append(card)}host.append(grid)
}
function renderSystem(){const h=$("#system-view");h.replaceChildren(el("div","notice",t("systemNote")));const s=el("div","system-story");s.append(band("WHO · KNOW · THINK",state.locale==="de"?"Agent-Plane":"Agent plane",summary("WHO")+" · "+summary("KNOW")+" · "+summary("THINK")),arrow(),band("PROPOSAL",state.locale==="de"?"Intent verlässt Cognition":"Intent leaves cognition",state.locale==="de"?"Ein Model-Vorschlag ist noch keine Authority oder externer Effect.":"A model proposal is not yet authority or an external effect."),boundary());const p=el("div","system-pair");p.append(band("CAN",summary("CAN"),t("canMay")),band("MAY",summary("MAY"),t("canMay")));s.append(p,arrow(),band("ACT",summary("ACT"),t("actDid")),arrow(),band("DID",summary("DID"),t("actDid")));h.append(s)}
function band(tok,title,copy){const b=el("div","system-band");b.append(el("span","token",tok),el("h3","",title),el("p","",copy));return b}function arrow(){return el("div","system-arrow","↓")}function boundary(){return el("div","system-boundary",state.locale==="de"?"Authority Boundary":"Authority boundary")}
function renderMeta(){const a=state.ir.analysis||{},c=a.sourceCoverage||{},eligible=a.filesEligible??a.filesSeen;const h=$("#scan-meta"),mode=a.scanStrategy==="full"?t("fullScan"):t("quickScan");h.replaceChildren(chip(mode),chip((a.filesScanned||0)+"/"+eligible+" "+t("sampled")),chip("impl "+(c.implementation||0)+" · cfg "+(c.config||0)+" · test "+(c.test||0)+" · docs "+(c.documentation||0)),chip(a.scanComplete?t("complete"):t("partial")));const n=$("#partial-warning");n.hidden=!!a.scanComplete;if(!n.hidden){const failures=a.contentFetchFailures?.length||0;n.textContent=state.locale==="de"?`Scan unvollständig: ${a.filesScanned||0} von ${eligible} geeigneten Files gelesen${failures?`; ${failures} Fetch-Fehler`:""}. Nicht gelesene Evidence bleibt unbekannt.`:`Scan incomplete: ${a.filesScanned||0} of ${eligible} eligible files read${failures?`; ${failures} fetch failures`:""}. Unseen evidence remains unknown.`}}
function renderAll(scroll=true){$("#result-title").textContent=state.ir?.source?.label||state.repo;renderMeta();renderStory();renderInspect();renderSystem();$("#result").hidden=false;if(scroll)$("#result").scrollIntoView({behavior:"smooth",block:"start"})}
function selectView(v){document.querySelectorAll(".view-tab").forEach(b=>{const on=b.dataset.view===v;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on))});["story","files","inspect","system"].forEach(x=>$("#"+x+"-view").hidden=x!==v)}
document.querySelectorAll(".view-tab").forEach(b=>b.onclick=()=>selectView(b.dataset.view));

function buildTree(files){const root={dirs:new Map,files:[]};for(const file of files){let n=root;const parts=file.path.split("/");parts.forEach((p,i)=>{if(i===parts.length-1)n.files.push(file);else{if(!n.dirs.has(p))n.dirs.set(p,{name:p,dirs:new Map,files:[]});n=n.dirs.get(p)}})}return root}
function countTree(n){let c=n.files.length;for(const d of n.dirs.values())c+=countTree(d);return c}
function renderTreeNode(n,host,depth=0){[...n.dirs.values()].sort((a,b)=>a.name.localeCompare(b.name)).forEach(d=>{const details=el("details","tree-folder");if(depth<1)details.open=true;const s=el("summary","tree-folder-summary");s.append(el("span","chev","›"),assetIcon("04_iconography/ui/avgl-folder.svg","tree-node-icon"),el("span","tree-node-label",d.name),chip(String(countTree(d))));details.append(s);const ch=el("div","tree-children");renderTreeNode(d,ch,depth+1);details.append(ch);host.append(details)});n.files.sort((a,b)=>a.path.localeCompare(b.path)).forEach(f=>{const b=el("button","tree-file"+(state.activeFile===f.path?" active":""));b.title=f.path;const meta=el("span","file-meta");meta.append(el("i","kind-dot "+f.sourceKind));if(evidencePaths().has(f.path))meta.append(assetIcon("04_iconography/lenses/avgl-evidence.svg","evidence-node-icon"));b.append(assetIcon("04_iconography/ui/avgl-file.svg","tree-node-icon"),el("span","tree-node-label",f.path.split("/").pop()),meta);b.onclick=()=>loadFile(f.path);host.append(b)})}
function evidencePaths(){return new Set((state.ir?.nodes||[]).flatMap(n=>(n.evidence||[]).map(e=>e.path)))}
function renderTree(){if(!state.inventory)return;const q=$("#file-search").value.trim().toLowerCase(),all=state.inventory.files||[],files=q?all.filter(f=>f.path.toLowerCase().includes(q)):all;$("#file-count").textContent=files.length+" "+t("fileCount");const h=$("#file-tree");h.replaceChildren();renderTreeNode(buildTree(files),h);$("#tree-warning").hidden=!state.inventory.treeTruncated;if(state.inventory.treeTruncated)$("#tree-warning").textContent=state.locale==="de"?"GitHub lieferte einen gekürzten Repository-Tree.":"GitHub returned a truncated repository tree."}
$("#file-search").oninput=renderTree;
async function loadInventory(repo){try{const r=await fetch("/api/repository",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({repository:repo,accessMode:state.accessMode})}),p=await r.json();if(!r.ok)throw Error(p.error||t("filesFail"));state.inventory=p;renderTree();return p}catch(e){$("#tree-warning").hidden=false;$("#tree-warning").textContent=e.message;return null}}
async function loadFile(path,quiet=false){if(!state.repo)return;state.activeFile=path;renderTree();$("#file-empty").hidden=true;$("#file-detail").hidden=false;$("#file-role").textContent=t("fileLoad");$("#file-path").textContent=path;updateAssistantContext();try{const r=await fetch("/api/file",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({repository:state.repo,path,accessMode:state.accessMode})}),p=await r.json();if(!r.ok)throw Error(p.error||t("fileFail"));showFile(p.file)}catch(e){$("#file-role").textContent=t("fileFail");$("#file-summary").textContent=e.message}}
function showFile(f){const semantic=projectFileSemanticContext(state.ir,f.path);$("#file-role").textContent=f.role?.[state.locale]||f.sourceKind;$("#file-path").textContent=f.path;$("#file-summary").textContent=f.summary?.[state.locale]||"";const tags=$("#file-tags");tags.replaceChildren(chip(f.sourceKind));semantic.semanticClasses.forEach(c=>tags.append(chip(c,"semantic")));const facts=$("#file-facts");facts.replaceChildren(fact(t("role"),f.role?.[state.locale]||f.sourceKind),fact(t("areas"),semantic.semanticClasses.join(" · ")||"—"),fact(t("symbols"),(f.symbols||[]).join(", ")||"—"),fact(t("lines"),String(f.lineCount||"—")),fact(t("size"),fmtBytes(f.size)));renderFileRelations(f.path);$("#file-excerpt").textContent=f.excerpt||""}
function fact(k,v){const d=el("div","file-fact");d.append(el("span","",k),el("strong","",v));return d}
function relationPeer(rel,path){
 const fromFile=rel.from?.kind==="file"&&rel.from.id===path,toFile=rel.to?.kind==="file"&&rel.to.id===path;
 if(fromFile)return rel.to;if(toFile)return rel.from;return fromFile?rel.to:rel.from
}
function relationRow(rel,path){
 const peer=relationPeer(rel,path),row=el("div","relation-row"),top=el("div","relation-row-head");
 top.append(assetIcon("04_iconography/ui/avgl-relation.svg","relation-row-icon"),el("span","relation-type",rel.type),chip(rel.basis||"UNKNOWN"));
 row.append(top,el("div","relation-target",peer?.id||"—"));
 if(peer?.kind==="file"){row.classList.add("clickable");row.onclick=()=>loadFile(peer.id)}
 const ev=rel.evidence?.[0];if(ev)row.append(el("div","relation-evidence",ev.path+":"+ev.line));
 return row
}
function effectRow(effect){
 const row=el("div","relation-row effect "+(effect.external?"external":"local")),top=el("div","relation-row-head");
 top.append(assetIcon("04_iconography/core/avgl-flow.svg","relation-row-icon"),el("span","relation-type",effect.external?t("externalEffect"):t("localMutation")),chip(effect.effectKind));
 row.append(top,el("div","relation-target",effect.callee||effect.effectKind),el("div","relation-evidence",(effect.evidence?.path||"")+":"+String(effect.evidence?.line||"")));
 return row
}
function renderFileRelations(path){
 const relHost=$("#file-relations"),effHost=$("#file-effects");relHost.replaceChildren();effHost.replaceChildren();
 const relations=(state.ir?.relations||[]).filter(rel=>(rel.from?.kind==="file"&&rel.from.id===path)||(rel.to?.kind==="file"&&rel.to.id===path));
 const visible=relations.filter(rel=>!["CALLS","LOCAL_MUTATION","EMITS_EFFECT"].includes(rel.type)).slice(0,40);
 if(!visible.length)relHost.append(el("p","relation-empty",t("noRelations")));else visible.forEach(rel=>relHost.append(relationRow(rel,path)));
 const effects=(state.ir?.effects||[]).filter(effect=>effect.path===path).slice(0,40);
 if(!effects.length)effHost.append(el("p","relation-empty",t("noEffects")));else effects.forEach(effect=>effHost.append(effectRow(effect)))
}


async function analyzeCurrentRepository(repo){if(!repo)return;state.repo=repo;state.ir=null;state.inventory=null;state.activeFile=null;state.chat=[];$("#error").hidden=true;$("#status").textContent=t("loading");$("#analyze-button").disabled=true;$("#analyze-private-button").disabled=true;try{const [r]=await Promise.all([fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({repository:repo,scanStrategy:state.scanStrategy,accessMode:state.accessMode})}),loadInventory(repo)]);const p=await r.json();if(!r.ok)throw Error(p.error||"Analysis failed");state.ir=p.ir;renderAll();$("#status").textContent=t("done");renderSuggestions();updateAssistantContext()}catch(err){$("#error").textContent=err.message;$("#error").hidden=false;$("#status").textContent=""}finally{$("#analyze-button").disabled=false;$("#analyze-private-button").disabled=false}}
$("#analyze-form").onsubmit=async e=>{e.preventDefault();if(state.accessMode!=="public")return;await analyzeCurrentRepository($("#repository").value.trim())};
$("#analyze-private-button").onclick=async()=>{const repo=$("#private-repository").value;if(repo)await analyzeCurrentRepository(repo)};
$("#assistant-fab").onclick=()=>{$("#assistant-panel").hidden=!$("#assistant-panel").hidden;if(!$("#assistant-panel").hidden)$("#assistant-input").focus()};$("#assistant-close").onclick=()=>$("#assistant-panel").hidden=true;
function updateAssistantContext(){const n=$("#assistant-context");if(!state.repo){n.textContent=t("noRepo");$("#assistant-send").disabled=true}else if(state.accessMode==="github_app"){n.textContent=t("privateChatBlocked");$("#assistant-send").disabled=true}else{n.textContent=state.repo+(state.activeFile?" · "+(state.locale==="de"?"Aktives File":"Active file")+": "+state.activeFile:"");$("#assistant-send").disabled=false}}
function renderSuggestions(){const h=$("#assistant-suggestions");h.replaceChildren();["suggest1","suggest2","suggest3"].forEach(k=>{const b=el("button","assistant-suggestion",t(k));b.type="button";b.onclick=()=>{$("#assistant-input").value=t(k);$("#assistant-input").focus()};h.append(b)})}
function bubble(role,text,meta=""){const m=el("div","chat-message "+role);m.append(el("div","chat-bubble",text));if(meta)m.append(el("div","chat-meta",meta));$("#assistant-messages").append(m);$("#assistant-messages").scrollTop=$("#assistant-messages").scrollHeight}
$("#assistant-form").onsubmit=async e=>{e.preventDefault();const q=$("#assistant-input").value.trim();if(!q||!state.repo)return;bubble("user",q);$("#assistant-input").value="";$("#assistant-send").disabled=true;$("#assistant-status").textContent=t("thinking");const history=state.chat.slice(-8);try{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({repository:state.repo,question:q,locale:state.locale,activeFile:state.activeFile,history,context:state.ir,accessMode:state.accessMode})}),p=await r.json();if(!r.ok)throw Error(p.error||t("chatFail"));bubble("assistant",p.answer,p.model||"");state.chat.push({role:"user",content:q},{role:"assistant",content:p.answer})}catch(err){bubble("assistant",err.message.includes("not configured")?t("keyMissing"):err.message)}finally{$("#assistant-send").disabled=false;$("#assistant-status").textContent=""}};

function setSourceMode(mode){
 state.accessMode=mode==="github_app"?"github_app":"public";
 document.querySelectorAll("[data-source-mode]").forEach(b=>b.classList.toggle("active",b.dataset.sourceMode===state.accessMode));
 $("#public-repo-input").hidden=state.accessMode!=="public";
 $("#private-repo-input").hidden=state.accessMode!=="github_app";
 if(state.accessMode==="github_app"&&!state.github.connected)refreshGitHubSession();
 renderGitHubState();updateAssistantContext()
}
document.querySelectorAll("[data-source-mode]").forEach(b=>b.onclick=()=>setSourceMode(b.dataset.sourceMode));

function renderGitHubState(){
 const status=$("#github-user-status"),connect=$("#github-connect"),select=$("#private-repository");
 if(state.github.connected){
   const login=state.github.user?.login?" @"+state.github.user.login:"";
   status.textContent=t("githubConnected")+login+" · "+state.github.repositories.length+" repos";
   connect.textContent=t("disconnectGitHub");
   select.replaceChildren(...state.github.repositories.map(repo=>{const o=document.createElement("option");o.value=repo.fullName;o.textContent=repo.fullName+(repo.private?" · private":"");return o}));
   $("#workspace-connected").hidden=false;renderWorkspaceRepoOptions()
 }else{
   status.textContent=state.accessMode==="github_app"?t("githubUnavailable"):t("publicMode");
   connect.textContent=t("connectGitHub");select.replaceChildren();$("#workspace-connected").hidden=true
 }
}
async function refreshGitHubSession(){
 try{
  const r=await fetch("/api/github-app/repos",{credentials:"same-origin"}),p=await r.json();
  if(!r.ok){state.github={connected:false,user:null,repositories:[]};renderGitHubState();return false}
  state.github={connected:true,user:p.user||null,repositories:p.repositories||[]};renderGitHubState();return true
 }catch{state.github={connected:false,user:null,repositories:[]};renderGitHubState();return false}
}
$("#github-connect").onclick=async()=>{
 if(state.github.connected){
  await fetch("/api/github-app/disconnect",{method:"POST",credentials:"same-origin"});
  state.github={connected:false,user:null,repositories:[]};setSourceMode("public");renderWorkspaceSelected();return
 }
 location.href="/api/github-app/install?returnTo="+encodeURIComponent(location.pathname+location.search)
};

function addWorkspaceRepo(repository,meta={}){
 const value=String(repository||"").trim();if(!value)return;
 if(state.workspace.selected.some(r=>r.repository.toLowerCase()===value.toLowerCase()))return;
 if(state.workspace.selected.length>=8){$("#workspace-error").textContent=t("workspaceLimit");$("#workspace-error").hidden=false;return}
 state.workspace.selected.push({repository:value,id:value,revision:meta.defaultBranch||undefined,private:Boolean(meta.private),accessMode:meta.githubApp?"github_app":"public"});
 renderWorkspaceSelected()
}
function removeWorkspaceRepo(repository){state.workspace.selected=state.workspace.selected.filter(r=>r.repository!==repository);renderWorkspaceSelected()}
function renderWorkspaceSelected(){
 const host=$("#workspace-selected");if(!host)return;host.replaceChildren();
 if(!state.workspace.selected.length){host.append(el("p","relation-empty",t("workspaceEmpty")));return}
 state.workspace.selected.forEach(repo=>{const row=el("div","workspace-selected-row"),name=el("span","workspace-repo-name",repo.repository),remove=el("button","icon-button","×");remove.type="button";remove.onclick=()=>removeWorkspaceRepo(repo.repository);row.append(name,chip(repo.accessMode==="github_app"?"GITHUB APP":"PUBLIC"),remove);host.append(row)})
}
function renderWorkspaceRepoOptions(){
 const host=$("#workspace-repo-options");if(!host)return;host.replaceChildren();
 state.github.repositories.forEach(repo=>{const b=el("button","workspace-repo-option",repo.fullName+(repo.private?" · private":""));b.type="button";b.onclick=()=>addWorkspaceRepo(repo.fullName,{...repo,githubApp:true});host.append(b)})
}
$("#workspace-toggle").onclick=()=>{$("#workspace-panel").hidden=!$("#workspace-panel").hidden;if(!$("#workspace-panel").hidden)$("#workspace-panel").scrollIntoView({behavior:"smooth",block:"start"})};
$("#workspace-close").onclick=()=>$("#workspace-panel").hidden=true;
$("#workspace-add").onclick=()=>{addWorkspaceRepo($("#workspace-repo-input").value);$("#workspace-repo-input").value=""};
$("#workspace-analyze").onclick=async()=>{
 $("#workspace-error").hidden=true;$("#workspace-result").hidden=true;
 if(!state.workspace.selected.length){$("#workspace-error").textContent=t("workspaceEmpty");$("#workspace-error").hidden=false;return}
 $("#workspace-status").textContent=t("workspaceLoading");$("#workspace-analyze").disabled=true;
 try{
  const r=await fetch("/api/workspace",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({label:"AVGL Workspace",repositories:state.workspace.selected.map(repo=>({repository:repo.repository,id:repo.id,revision:repo.revision,accessMode:repo.accessMode||"public"})),scanStrategy:state.scanStrategy})});
  const p=await r.json();if(!r.ok)throw Error(p.error||"Workspace analysis failed");
  const host=$("#workspace-result");host.replaceChildren();
  host.append(el("h3","",t("workspaceDone")),el("p","workspace-summary",p.summary.repositories+" repositories · "+p.summary.explicitRelations+" explicit relations · "+p.summary.derivedRelations+" derived relations · "+p.summary.derivedEffectChains+" derived effect chains"));
  const list=el("div","workspace-relations");
  (p.workspace?.relations||[]).slice(0,120).forEach(rel=>{const row=el("div","relation-row"),head=el("div","relation-row-head");head.append(el("span","relation-type",rel.type),chip(rel.basis));row.append(head,el("div","relation-target",(rel.from?.id||"?")+" → "+(rel.to?.id||"?")));list.append(row)});
  host.append(list);host.hidden=false;$("#workspace-status").textContent=t("workspaceDone")
 }catch(err){$("#workspace-error").textContent=err.message;$("#workspace-error").hidden=false;$("#workspace-status").textContent=""}
 finally{$("#workspace-analyze").disabled=false}
};

const params=new URLSearchParams(location.search);
if(params.get("github")==="connected"){history.replaceState({},document.title,location.pathname);refreshGitHubSession().then(ok=>{if(ok)setSourceMode("github_app")})}else{refreshGitHubSession()}

setScanStrategy("full");setSourceMode("public");applyLocale();renderSuggestions();renderWorkspaceSelected();updateAssistantContext();

// Brand asset library — served directly from committed web/assets/*.
const BRAND_ASSET_PREFIX="";
const BRAND_STATIC_ROOT="/assets/";
const assetLibrary=$("#asset-library");
let assetLibraryLoaded=false;
function brandAssetUrl(path){
  let relative=String(path||"").replace(BRAND_ASSET_PREFIX,"");
  while(relative.startsWith("/")) relative=relative.slice(1);
  return BRAND_STATIC_ROOT+relative.split("/").map(encodeURIComponent).join("/");
}
function assetCard(file){
  const relative=String(file.name||"").replace(BRAND_ASSET_PREFIX,"");
  const ext=(relative.split(".").pop()||"").toLowerCase();
  const renderable=["svg","png","ico"].includes(ext);
  const a=el("a","asset-card");a.href=brandAssetUrl(relative);a.target="_blank";a.rel="noopener noreferrer";a.title=relative;
  const preview=el("div","asset-preview"+(renderable?"":" asset-doc"));
  if(renderable){const img=document.createElement("img");img.src=brandAssetUrl(relative);img.alt="";img.loading="lazy";img.decoding="async";preview.append(img)}
  else preview.textContent=ext?ext.toUpperCase():"FILE";
  a.append(preview,el("div","asset-name",relative.split("/").pop()||relative),el("div","asset-path",relative));
  return a;
}
async function loadAssetLibrary(){
  if(assetLibraryLoaded||!assetLibrary)return;
  assetLibraryLoaded=true;
  const host=$("#asset-library-grid"),count=$("#asset-count");
  host.replaceChildren(el("p","relation-empty","Loading bundled assets…"));
  try{
    const r=await fetch(BRAND_STATIC_ROOT+"manifest.json"),manifest=await r.json();
    if(!r.ok)throw Error("Asset manifest unavailable");
    const files=[...(manifest.files||[]).map(file=>({name:file.path})),{name:"manifest.json"},{name:"manifest.txt"}];
    count.textContent=files.length+" bundled assets";
    host.replaceChildren();
    files.forEach(file=>host.append(assetCard(file)));
  }catch(error){host.replaceChildren(el("div","asset-error",error.message));assetLibraryLoaded=false}
}
if(assetLibrary)assetLibrary.addEventListener("toggle",()=>{if(assetLibrary.open)loadAssetLibrary()});