"use strict";
const PALETA = ["#7A5CC4","#C8102E","#F2B705","#2E7DBA","#2F9E6B","#E07B24","#0FA3A3","#B5487D"];
const LOGO = document.getElementById("logo").textContent.trim();
document.querySelectorAll(".logo-img").forEach(i=> i.src = LOGO);

/* Dados: painéis e categorias, carregados do banco (Firebase) depois do login */
let DADOS = { categorias:{}, paineis:[] };

/* --- utilidades --- */
const $ = id => document.getElementById(id);
const esc = t => String(t ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ler = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch(e) { return d; } };
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} };
const linkOk = u => /^https?:\/\//i.test(u || "");
const imgOk = u => typeof u === "string" && u.startsWith("data:image/");
const corDe = cat => DADOS.categorias[cat] || "var(--muted)";
const linkDe = p => linkOk(p.link) ? p.link : "";

let favs = ler("gav-favoritos", []), recs = ler("gav-recentes", []), acessos = ler("gav-acessos", {});
let estado = { view:"inicio", cat:"Todos" };
let painelAberto = null;
let catsAbertas = ler("gav-cats-abertas", []);
let podeEditar = false, podeCriar = false, podeGerir = false, modo = "site";
let papel = "visualizador";

/* --- ícones --- */
const I = {
  casa:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>',
  estrela:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/></svg>',
  estrelaCheia:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/></svg>',
  estrelaVazia:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/></svg>',
  relogio:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  link:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  fogo:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3 1-6 1-9.5z"/></svg>',
  chev:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  lapis:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>'
};

/* --- miniaturas ilustrativas --- */
function thumb(tipo, cor){
  const kpis = [0,1,2].map(i=>`<rect x="${24+i*72}" y="16" width="62" height="26" rx="3" fill="#fff" fill-opacity=".08"/><rect x="${30+i*72}" y="22" width="28" height="5" rx="2" fill="#fff" fill-opacity=".35"/><rect x="${30+i*72}" y="31" width="42" height="6" rx="2" fill="${cor}"/>`).join("");
  let g = "";
  if(tipo==="barras"){ [34,52,40,70,58,82,64,90].forEach((h,i)=> g+=`<rect x="${30+i*24}" y="${150-h}" width="14" height="${h}" rx="2" fill="${cor}" fill-opacity="${.5+i*.06}"/>`); }
  if(tipo==="barrasH"){ [150,120,96,70,44].forEach((w,i)=> g+=`<rect x="30" y="${62+i*17}" width="${w}" height="10" rx="2" fill="${cor}" fill-opacity="${.95-i*.12}"/>`); }
  if(tipo==="linha"){ g=`<polyline points="28,130 58,118 88,124 118,96 148,102 178,78 208,84 232,62" fill="none" stroke="${cor}" stroke-width="3" stroke-linejoin="round"/><polyline points="28,140 58,136 88,132 118,128 148,120 178,116 208,106 232,100" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2" stroke-dasharray="4 4"/>`; }
  if(tipo==="rosca"){ g=`<circle cx="92" cy="106" r="34" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="14"/><circle cx="92" cy="106" r="34" fill="none" stroke="${cor}" stroke-width="14" stroke-dasharray="160 214" transform="rotate(-90 92 106)"/>${[0,1,2].map(i=>`<rect x="150" y="${82+i*18}" width="${70-i*14}" height="8" rx="2" fill="#fff" fill-opacity=".2"/>`).join("")}`; }
  if(tipo==="calendario"){ for(let r=0;r<4;r++)for(let c=0;c<7;c++){const on=(r*7+c)%3!==1; g+=`<rect x="${30+c*29}" y="${60+r*23}" width="23" height="17" rx="2" fill="${on?cor:"#fff"}" fill-opacity="${on?.8:.1}"/>`;} }
  return `<svg viewBox="0 0 256 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${kpis}${g}</svg>`;
}

/* --- menu lateral --- */
const categorias = () => [...new Set(DADOS.paineis.map(p=>p.cat))];
function item(id, icone, rotulo, ativo, extra="", cls=""){
  return `<button class="nav-item ${cls}" data-nav="${esc(id)}" aria-current="${ativo}" title="${esc(rotulo)}"><span class="ic">${icone}</span><span class="lbl">${esc(rotulo)}</span>${extra}</button>`;
}
function renderNav(){
  const v = estado.view, c = estado.cat;
  let h = item("inicio", I.casa, "Início", !painelAberto && v==="inicio" && c==="Todos");
  h += item("favoritos", I.estrela, "Favoritos", v==="favoritos", `<span class="count">${favs.length||""}</span>`);
  h += item("recentes", I.relogio, "Recentes", v==="recentes");
  h += `<div class="sep"></div><div class="sec">Categorias</div>`;
  categorias().forEach(cat=>{
    const ps = DADOS.paineis.filter(p=>p.cat===cat);
    const aberta = catsAbertas.includes(cat);
    h += `<button class="nav-item cat" data-nav="cat:${esc(cat)}" aria-expanded="${aberta}" aria-current="${!painelAberto && v==="inicio" && c===cat}" title="${esc(cat)}"><span class="ic"><span class="dot" style="background:${esc(corDe(cat))}"></span></span><span class="lbl">${esc(cat)}</span><span class="count">${ps.length}</span><span class="chev" aria-hidden="true">${I.chev}</span></button>`;
    if(aberta) ps.forEach(p=>{
      h += `<button class="nav-item nav-sub" data-nav="p:${esc(p.id)}" aria-current="${painelAberto===p.id}" title="${esc(p.titulo)}"><span class="lbl">${esc(p.titulo)}</span><span class="nl ${linkDe(p)?"on":""}" aria-hidden="true"></span></button>`;
    });
  });
  h += `<div class="sep"></div>`;
  h += item("semlink", I.link, "Sem link", v==="semlink", `<span class="count">${DADOS.paineis.filter(p=>!linkDe(p)).length||""}</span>`);
  h += `<p class="foot">Ponto verde: painel com link. Favoritos e recentes ficam salvos neste navegador.</p>`;
  const nav = $("nav"); nav.innerHTML = h;
  nav.querySelectorAll("[data-nav]").forEach(b=> b.onclick = ()=>{
    const d = b.dataset.nav;
    fecharGaveta();
    if(d.startsWith("p:")){ abrirPainel(DADOS.paineis.find(x=>x.id===d.slice(2))); return; }
    if(d.startsWith("cat:") && !(document.body.classList.contains("mini") && !matchMedia("(max-width:900px)").matches)){
      const cat = d.slice(4);
      catsAbertas = catsAbertas.includes(cat) ? catsAbertas.filter(x=>x!==cat) : [...catsAbertas, cat];
      gravar("gav-cats-abertas", catsAbertas); renderNav(); return;
    }
    estado = d.startsWith("cat:") ? { view:"inicio", cat:d.slice(4) } : { view:d, cat:"Todos" };
    mostrarPainel(); render(); window.scrollTo({top:0});
  });
}

/* --- mais acessados --- */
function abrirPainel(p){
  const url = linkDe(p);
  if(!url){ if(podeEditar) abrirForm(p); else aviso("Este painel ainda não tem link cadastrado."); return; }
  recs = [p.id, ...recs.filter(id=>id!==p.id)].slice(0,8); gravar("gav-recentes", recs);
  acessos[p.id] = (acessos[p.id]||0) + 1; gravar("gav-acessos", acessos);
  mostrarVisual(p);
}

/* --- Visual do relatório dentro do portal --- */
function embedDe(url){
  try {
    const u = new URL(url);
    if(!/(^|\.)powerbi\.com$/i.test(u.hostname)) return url;
    if(/reportembed|\/view/i.test(u.pathname) || u.searchParams.get("r")) return url;
    const m = u.pathname.match(/\/groups\/([^/]+)\/reports\/([0-9a-f-]{36})(?:\/([^/?]+))?/i);
    if(!m) return url;
    const q = new URLSearchParams({ reportId:m[2], autoAuth:"true" });
    if(m[1].toLowerCase()!=="me") q.set("groupId", m[1]);
    if(m[3]) q.set("pageName", m[3]);
    const ctid = u.searchParams.get("ctid"); if(ctid) q.set("ctid", ctid);
    return "https://app.powerbi.com/reportEmbed?" + q.toString();
  } catch(e) { return url; }
}
let frameBloqueado = false;
document.addEventListener("securitypolicyviolation", e=>{
  if(!painelAberto) return;
  if(/frame|child|default/.test(e.violatedDirective || e.effectiveDirective || "")){ frameBloqueado = true; mensagemBloqueio(); }
});
function mensagemBloqueio(){
  const p = DADOS.paineis.find(x=>x.id===painelAberto); if(!p) return;
  $("vFrame").innerHTML = `<div class="vmsg"><div><strong>Não foi possível exibir o relatório aqui</strong><p>Esta versão do portal não permite mostrar outros sites dentro da página. Abra o relatório em uma nova aba ou use o arquivo do portal publicado na rede da empresa.</p><button class="btn primary" type="button" id="vAbrirFora">Abrir relatório em nova aba</button></div></div>`;
  $("vAbrirFora").onclick = ()=> window.open(linkDe(p), "_blank", "noopener");
}
function carregarFrame(p){
  if(frameBloqueado){ mensagemBloqueio(); return; }
  const f = document.createElement("iframe");
  f.src = embedDe(linkDe(p)); f.title = p.titulo; f.allowFullscreen = true;
  f.setAttribute("allow", "fullscreen");
  $("vFrame").replaceChildren(f);
}
function mostrarVisual(p){
  painelAberto = p.id;
  if(!catsAbertas.includes(p.cat)){ catsAbertas = [...catsAbertas, p.cat]; gravar("gav-cats-abertas", catsAbertas); }
  $("homeView").hidden = true; $("perfilView").hidden = true; $("visualView").hidden = false;
  $("vTitulo").textContent = p.titulo; $("vCat").textContent = p.cat;
  $("vDot").style.background = corDe(p.cat);
  const fav = favs.includes(p.id);
  $("vFav").innerHTML = fav ? I.estrelaCheia : I.estrelaVazia; $("vFav").classList.toggle("on", fav);
  $("vFav").title = fav ? "Remover dos favoritos" : "Favoritar";
  $("vEditar").innerHTML = I.lapis; $("vEditar").hidden = !podeEditar;
  carregarFrame(p);
  document.title = p.titulo + " — Gestão à Vista";
  render(); window.scrollTo({top:0});
}
$("vVoltar").onclick = ()=>{ mostrarPainel(); render(); };
$("vRecarregar").onclick = ()=>{ const p = DADOS.paineis.find(x=>x.id===painelAberto); if(p) carregarFrame(p); };
$("vAba").onclick = ()=>{ const p = DADOS.paineis.find(x=>x.id===painelAberto); if(p) window.open(linkDe(p), "_blank", "noopener"); };
$("vTela").onclick = ()=>{ const el = $("vFrame"); if(document.fullscreenElement) document.exitFullscreen(); else if(el.requestFullscreen) el.requestFullscreen(); };
$("vEditar").onclick = ()=>{ const p = DADOS.paineis.find(x=>x.id===painelAberto); if(p) abrirForm(p); };
$("vFav").onclick = ()=>{
  const id = painelAberto; if(!id) return;
  favs = favs.includes(id) ? favs.filter(x=>x!==id) : [...favs, id]; gravar("gav-favoritos", favs);
  const fav = favs.includes(id);
  $("vFav").innerHTML = fav ? I.estrelaCheia : I.estrelaVazia; $("vFav").classList.toggle("on", fav); render();
};
function renderChips(){
  const box = $("chips");
  const top = DADOS.paineis.filter(p=>acessos[p.id]).sort((a,b)=>acessos[b.id]-acessos[a.id]).slice(0,6);
  const lbl = `<span class="chips-lbl">${I.fogo}Mais acessados</span>`;
  if(!top.length){ box.innerHTML = lbl + `<span class="chips-hint">Os painéis que você mais abrir aparecem aqui.</span>`; return; }
  box.innerHTML = lbl + top.map(p=>`<button class="chip" data-top="${esc(p.id)}" title="Abrir ${esc(p.titulo)}"><span class="dot" style="background:${esc(corDe(p.cat))}"></span>${esc(p.titulo)}<span class="n">${acessos[p.id]}</span></button>`).join("");
  box.querySelectorAll("[data-top]").forEach(b=> b.onclick = ()=> abrirPainel(DADOS.paineis.find(x=>x.id===b.dataset.top)));
}

/* --- grade --- */
function listaAtual(){
  const q = $("q").value.trim().toLowerCase();
  const porId = id => DADOS.paineis.find(p=>p.id===id);
  let base = estado.view==="favoritos" ? favs.map(porId).filter(Boolean)
           : estado.view==="recentes" ? recs.map(porId).filter(Boolean)
           : estado.view==="semlink" ? DADOS.paineis.filter(p=>!linkDe(p))
           : DADOS.paineis;
  return base.filter(p => (estado.cat==="Todos"||p.cat===estado.cat) && (p.titulo+" "+p.desc+" "+p.cat).toLowerCase().includes(q));
}
const TITULOS = { inicio:"Início", favoritos:"Favoritos", recentes:"Recentes", semlink:"Painéis sem link" };
const VAZIOS = {
  favoritos:["Nenhum favorito ainda","Toque na estrela de um painel para fixá-lo aqui."],
  recentes:["Nada aberto recentemente","Os painéis que você abrir aparecem aqui."],
  semlink:["Todos os painéis têm link","Nada pendente por aqui."],
  inicio:["Nenhum painel encontrado","Tente outro termo ou escolha \"Início\"."]
};
function renderGrid(){
  const lista = listaAtual();
  $("viewTitle").textContent = estado.view==="inicio" && estado.cat!=="Todos" ? estado.cat : TITULOS[estado.view];
  $("viewCount").textContent = lista.length ? `${lista.length} ${lista.length===1?"painel":"painéis"}` : "";
  const grid = $("grid");
  if(!DADOS.paineis.length){
    grid.innerHTML = `<div class="vazio-cta"><strong>Nenhum painel cadastrado ainda</strong>${podeGerir ? "Importe a lista de painéis atual do portal para começar." : "Aguarde o administrador cadastrar os painéis."}${podeGerir ? `<br><button class="btn primary" type="button" id="importarBtn">Importar painéis atuais</button>` : ""}</div>`;
    if($("importarBtn")) $("importarBtn").onclick = importarSemente;
    return;
  }
  if(!lista.length){
    const [t,d] = $("q").value.trim() ? VAZIOS.inicio : (VAZIOS[estado.view]||VAZIOS.inicio);
    grid.innerHTML = `<p class="empty"><strong>${t}</strong>${d}</p>`; return;
  }
  grid.innerHTML = lista.map(p=>{
    const cor = corDe(p.cat), fav = favs.includes(p.id), id = esc(p.id);
    return `<article class="card">
      <button class="open" data-id="${id}" aria-label="Abrir ${esc(p.titulo)}">
        <div class="thumb">${imgOk(p.img)?`<img src="${esc(p.img)}" alt="">`:thumb(p.tipo,esc(cor))}<span class="stripe" style="background:${esc(cor)}"></span>${linkDe(p)?"":`<span class="nolink">Sem link</span>`}</div>
      </button>
      <div class="meta">
        <div class="info"><h3>${esc(p.titulo)}</h3><p>${esc(p.desc)}</p><p class="cat" style="color:${esc(cor)}">${esc(p.cat)}</p></div>
        <button class="mini-btn ${fav?"on":""}" data-fav="${id}" aria-pressed="${fav}" aria-label="${fav?"Remover dos":"Adicionar aos"} favoritos" title="${fav?"Remover dos favoritos":"Favoritar"}">${fav?I.estrelaCheia:I.estrelaVazia}</button>
        ${podeEditar?`<button class="mini-btn" data-edit="${id}" aria-label="Editar ${esc(p.titulo)}" title="Editar painel">${I.lapis}</button>`:""}
      </div>
    </article>`;
  }).join("");
  grid.querySelectorAll("[data-id]").forEach(b=> b.onclick = ()=> abrirPainel(DADOS.paineis.find(x=>x.id===b.dataset.id)));
  grid.querySelectorAll("[data-fav]").forEach(b=> b.onclick = ()=>{
    const id = b.dataset.fav;
    favs = favs.includes(id) ? favs.filter(x=>x!==id) : [...favs, id];
    gravar("gav-favoritos", favs); render();
  });
  grid.querySelectorAll("[data-edit]").forEach(b=> b.onclick = ()=> abrirForm(DADOS.paineis.find(x=>x.id===b.dataset.edit)));
}
function render(){ renderNav(); renderChips(); renderGrid(); }
$("q").addEventListener("input", renderGrid);

/* --- aviso rápido --- */
let avisoT;
function aviso(txt, fixo){
  let t = document.querySelector(".toast");
  if(!t){ t = document.createElement("div"); t.className = "toast"; t.setAttribute("role","status"); document.body.appendChild(t); }
  t.textContent = txt; t.hidden = false;
  clearTimeout(avisoT); if(!fixo) avisoT = setTimeout(()=> t.hidden = true, 3600);
}

/* ===================== EDIÇÃO (somente após login com permissão) ===================== */
const dlg = $("dlg");
let editando = null, imgNova = undefined; /* undefined = sem mudança, null = remover, string = nova */
function preview(){
  const cor = $("fCat").value==="__nova__" ? PALETA[Object.keys(DADOS.categorias).length % PALETA.length] : corDe($("fCat").value);
  const img = imgNova===undefined ? (editando && editando.img) : imgNova;
  $("fPrev").innerHTML = imgOk(img) ? `<img src="${esc(img)}" alt="">` : thumb($("fTipo").value, esc(cor));
  $("fImgRemove").hidden = !imgOk(img);
  $("fTipoBox").hidden = imgOk(img);
}
function abrirForm(p){
  if(p ? !podeEditar : !podeCriar) return;
  editando = p || null; imgNova = undefined;
  $("dlgTitle").textContent = p ? "Editar painel" : "Novo painel";
  $("fTitulo").value = p ? p.titulo : "";
  $("fDesc").value = p ? p.desc : "";
  $("fLink").value = p ? (p.link||"") : "";
  $("fTipo").value = p ? (p.tipo||"barras") : "barras";
  const cats = categorias();
  $("fCat").innerHTML = cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("") + `<option value="__nova__">+ Nova categoria…</option>`;
  $("fCat").value = p ? p.cat : (estado.cat!=="Todos" ? estado.cat : cats[0]);
  $("fNovaCat").value = ""; $("fNovaCatBox").hidden = true;
  $("fImg").value = "";
  $("delBtn").hidden = !p || papel!=="admin";
  preview(); dlg.showModal(); $("fTitulo").focus();
}
$("fCat").onchange = ()=>{ $("fNovaCatBox").hidden = $("fCat").value!=="__nova__"; preview(); };
$("fTipo").onchange = preview;
$("fImgRemove").onclick = ()=>{ imgNova = null; preview(); };
$("fImg").onchange = e=>{
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = ()=>{
    const im = new Image();
    im.onload = ()=>{
      const W=640,H=360, c=document.createElement("canvas"); c.width=W; c.height=H;
      const k = Math.max(W/im.width, H/im.height), w=im.width*k, h=im.height*k;
      c.getContext("2d").drawImage(im,(W-w)/2,(H-h)/2,w,h);
      imgNova = c.toDataURL("image/jpeg",0.82); preview();
    };
    im.onerror = ()=> aviso("Não foi possível ler essa imagem.");
    im.src = r.result;
  };
  r.readAsDataURL(f);
};
$("cancelBtn").onclick = ()=> dlg.close();
$("delBtn").onclick = async ()=>{
  if(!editando || !confirm(`Excluir o painel "${editando.titulo}"? Ele some para todos.`)) return;
  const novo = structuredClone(DADOS); novo.paineis = novo.paineis.filter(x=>x.id!==editando.id);
  dlg.close(); await publicar(novo);
};
$("form").onsubmit = async e=>{
  e.preventDefault();
  const titulo = $("fTitulo").value.trim();
  if(!titulo){ $("fTitulo").focus(); aviso("Informe o nome do painel."); return; }
  const link = $("fLink").value.trim();
  if(link && !linkOk(link)){ $("fLink").focus(); aviso("O link precisa começar com https://"); return; }
  let cat = $("fCat").value;
  const novo = structuredClone(DADOS);
  if(cat==="__nova__"){
    cat = $("fNovaCat").value.trim();
    if(!cat){ $("fNovaCat").focus(); aviso("Informe o nome da nova categoria."); return; }
    if(!novo.categorias[cat]) novo.categorias[cat] = PALETA[Object.keys(novo.categorias).length % PALETA.length];
  }
  const p = editando ? novo.paineis.find(x=>x.id===editando.id) : { id: titulo.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,30) + "-" + Date.now().toString(36) };
  Object.assign(p, { titulo, desc:$("fDesc").value.trim(), cat, link, tipo:$("fTipo").value });
  if(imgNova===null) delete p.img; else if(typeof imgNova==="string") p.img = imgNova;
  if(!editando) novo.paineis.push(p);
  dlg.close(); await publicar(novo);
};

/* Salva as mudanças de painéis no banco (só o que mudou) */
async function publicar(novo){
  if(!podeCriar){ aviso("Seu acesso não permite salvar alterações."); return; }
  aviso("Salvando…", true);
  try {
    const antes = new Map(DADOS.paineis.map(p=>[p.id,p]));
    const depois = new Set(novo.paineis.map(p=>p.id));
    const lote = db.batch();
    let n = 0;
    novo.paineis.forEach(p=>{
      const a = antes.get(p.id);
      if(a && JSON.stringify(a)===JSON.stringify(p)) return;
      const d = JSON.parse(JSON.stringify(p));
      if(typeof d.ordem!=="number") d.ordem = Date.now();
      d.atualizadoEm = new Date().toISOString(); d.atualizadoPor = EU.nome;
      lote.set(db.collection("paineis").doc(p.id), d); n++;
    });
    antes.forEach((p,id)=>{ if(!depois.has(id)){ lote.delete(db.collection("paineis").doc(id)); n++; } });
    if(JSON.stringify(novo.categorias)!==JSON.stringify(DADOS.categorias)){ lote.set(db.doc("config/geral"), { categorias: novo.categorias }, { merge:true }); n++; }
    if(n) await lote.commit();
    aviso("Salvo. Todos já veem a alteração.");
  } catch(err){
    aviso(/permission/i.test(String(err && (err.code||err.message))) ? "Seu acesso não permite essa alteração." : "Não foi possível salvar agora. Tente novamente.");
  }
}

/* Importa a lista de painéis que veio com o site (usado uma vez, pelo administrador) */
async function importarSemente(){
  if(!podeGerir) return;
  const b = $("importarBtn"); if(b) b.disabled = true;
  try {
    const s = JSON.parse(document.getElementById("semente").textContent);
    const lote = db.batch();
    s.paineis.forEach((p,i)=> lote.set(db.collection("paineis").doc(p.id), { ...p, ordem:i, atualizadoEm:new Date().toISOString(), atualizadoPor:EU.nome }));
    lote.set(db.doc("config/geral"), { categorias: s.categorias }, { merge:true });
    await lote.commit();
    aviso("Painéis importados.");
  } catch(err){ aviso("Não foi possível importar os painéis."); if(b) b.disabled = false; }
}

/* ===================== ACESSO (Firebase: e-mail e senha) ===================== */
const conta = $("account"), umenu = $("umenu"), userBtn = $("userBtn");
function fecharPops(){ umenu.hidden = true; userBtn.setAttribute("aria-expanded","false"); }
userBtn.onclick = e=>{ e.stopPropagation(); const abrir = umenu.hidden; fecharPops(); umenu.hidden = !abrir; userBtn.setAttribute("aria-expanded",String(abrir)); };
document.addEventListener("click", e=>{ if(!conta.contains(e.target)) fecharPops(); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape"){ fecharPops(); fecharGaveta(); } });
$("createBtn").onclick = ()=> abrirForm(null);

const ROTULO = { visualizador:"Visualizador", editor:"Editor", admin:"Administrador" };
const PAPEIS = ["visualizador","editor","admin"];
const iniciais = n => { const p = String(n||"?").trim().split(/\s+/).filter(Boolean); return ((p[0]||"?")[0] + (p.length>1 ? p[p.length-1][0] : "")).toUpperCase(); };
const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const senhaOk = s => String(s).length >= 8;
function msgErro(err){
  const c = String(err && (err.code || err.message) || err);
  if(/invalid-credential|wrong-password|user-not-found|invalid-login/i.test(c)) return "E-mail ou senha incorretos.";
  if(/too-many-requests/i.test(c)) return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  if(/email-already-in-use/i.test(c)) return "Esse e-mail já tem conta. Se for alguém desativado, reative na lista de usuários.";
  if(/invalid-email/i.test(c)) return "E-mail inválido.";
  if(/weak-password/i.test(c)) return "Senha fraca: use pelo menos 8 caracteres.";
  if(/requires-recent-login/i.test(c)) return "Por segurança, saia e entre de novo antes de trocar a senha.";
  if(/network/i.test(c)) return "Sem conexão. Verifique a internet e tente de novo.";
  if(/permission/i.test(c)) return "Seu acesso não permite essa ação.";
  if(/operation-not-allowed/i.test(c)) return "O login por e-mail e senha não está ativado no Firebase (Authentication → Método de login → E-mail/senha).";
  return "Não foi possível concluir. Código: " + c;
}

let fb = null, auth = null, db = null, EU = null, configurando = false;
let unsubs = [], usuarios = {};

/* --- tela de entrada --- */
const gate = $("gate");
function telaGate(qual, msg, acao){
  gate.hidden = false; document.body.classList.add("travado");
  $("gMsg").textContent = msg || "";
  ["gLogin","gSetup"].forEach(id=> $(id).hidden = id!==qual);
  const b = $("gAcao"); b.hidden = !acao;
  if(acao){ b.textContent = acao.txt; b.onclick = acao.fn; }
  const foco = { gLogin:"gEmail", gSetup:"suNome" }[qual];
  if(foco) setTimeout(()=> $(foco).focus(), 0);
}
async function mostrarEntrada(erro){
  let precisaSetup = false;
  try { precisaSetup = !(await db.doc("config/inicial").get()).exists; } catch(e) {}
  if(precisaSetup){ telaGate("gSetup", ""); return; }
  $("gErro").textContent = erro || "";
  telaGate("gLogin", "Entre com seu e-mail e senha.");
}

$("gLogin").onsubmit = async e=>{
  e.preventDefault();
  const err = $("gErro"), email = $("gEmail").value.trim(), senha = $("gSenha").value;
  if(!email || !senha){ err.textContent = "Informe e-mail e senha."; return; }
  const b = $("gEntrar"); b.disabled = true; err.textContent = "";
  try { await auth.signInWithEmailAndPassword(email, senha); $("gSenha").value = ""; }
  catch(x){ err.textContent = msgErro(x); }
  finally { b.disabled = false; }
};
$("gEsqueci").onclick = async ()=>{
  const email = $("gEmail").value.trim(), err = $("gErro");
  if(!emailOk(email)){ err.textContent = "Digite seu e-mail acima e clique de novo em \"Esqueci minha senha\"."; $("gEmail").focus(); return; }
  try { await auth.sendPasswordResetEmail(email); } catch(x) {}
  err.textContent = ""; aviso("Se o e-mail estiver cadastrado, chegará um link para criar uma nova senha.");
};

$("gSetup").onsubmit = async e=>{
  e.preventDefault();
  const err = $("suErro"), v = id=> $(id).value.trim();
  const nome = v("suNome"), email = v("suEmail"), senha = $("suSenha").value;
  if(!nome || !emailOk(email)){ err.textContent = "Informe nome e um e-mail válido."; return; }
  if(!senhaOk(senha)){ err.textContent = "A senha precisa ter pelo menos 8 caracteres."; return; }
  if(senha !== $("suSenha2").value){ err.textContent = "As duas senhas não são iguais."; return; }
  const b = $("suOk"); b.disabled = true; err.textContent = ""; configurando = true;
  let cred = null;
  try {
    cred = await auth.createUserWithEmailAndPassword(email, senha);
    const uid = cred.user.uid, lote = db.batch();
    lote.set(db.doc("usuarios/" + uid), { nome, email, empresa:v("suEmp"), papel:"admin", ativo:true, criadoEm:new Date().toISOString() });
    lote.set(db.doc("config/inicial"), { em:new Date().toISOString(), uid });
    await lote.commit();
    configurando = false; await aoMudarLogin(cred.user);
  } catch(x){
    configurando = false;
    if(cred && cred.user){ try { await cred.user.delete(); } catch(_) { await auth.signOut(); } }
    err.textContent = /permission/i.test(String(x && x.code)) ? "O portal já foi configurado por outra pessoa. Entre com seu e-mail e senha." : msgErro(x);
  } finally { b.disabled = false; }
};

/* --- sessão --- */
function pararOuvintes(){ unsubs.forEach(f=>{ try { f(); } catch(e) {} }); unsubs = []; }
async function aoMudarLogin(u){
  if(configurando) return;
  pararOuvintes(); EU = null; usuarios = {};
  podeEditar = podeCriar = podeGerir = false; conta.hidden = true; $("createBtn").hidden = true;
  if(!u){ DADOS = { categorias:{}, paineis:[] }; mostrarPainel(); render(); mostrarEntrada(); return; }
  let d = null;
  try { d = await db.doc("usuarios/" + u.uid).get(); } catch(e) {}
  if(!d || !d.exists || d.data().ativo !== true){
    await auth.signOut();
    mostrarEntrada(d && d.exists ? "Seu acesso está desativado. Fale com o administrador." : "Seu usuário não tem acesso a este portal. Fale com o administrador.");
    return;
  }
  EU = { uid:u.uid, ...d.data() };
  aplicarPerfil();
  gate.hidden = true; document.body.classList.remove("travado");
  /* meu cadastro: se for desativado ou mudar de papel, aplica na hora */
  unsubs.push(db.doc("usuarios/" + u.uid).onSnapshot(s=>{
    if(!s.exists || s.data().ativo !== true){ sair("Seu acesso foi desativado ou removido."); return; }
    EU = { uid:u.uid, ...s.data() }; aplicarPerfil();
  }, ()=>{}));
  /* painéis e categorias */
  unsubs.push(db.collection("paineis").orderBy("ordem").onSnapshot(s=>{
    DADOS = { ...DADOS, paineis: s.docs.map(x=>({ id:x.id, ...x.data() })) };
    render();
    if(painelAberto && !DADOS.paineis.some(p=>p.id===painelAberto)){ mostrarPainel(); render(); }
  }, ()=> aviso("Não foi possível carregar os painéis.")));
  unsubs.push(db.doc("config/geral").onSnapshot(s=>{
    DADOS = { ...DADOS, categorias: (s.exists && s.data().categorias) || {} }; render();
  }, ()=>{}));
}
async function sair(msg){
  fecharPops(); mostrarPainel();
  try { await auth.signOut(); } catch(e) {}
  if(msg) setTimeout(()=> $("gErro").textContent = msg, 300);
}
$("uSair").onclick = ()=> sair("");

/* --- permissões do perfil --- */
function aplicarPerfil(){
  papel = PAPEIS.includes(EU.papel) ? EU.papel : "visualizador";
  podeCriar = podeEditar = papel==="admin" || papel==="editor";
  podeGerir = papel==="admin";
  const ini = `<span class="ini">${esc(iniciais(EU.nome))}</span>`;
  userBtn.innerHTML = ini;
  umenu.querySelector(".uhead").firstElementChild.outerHTML = ini;
  $("userName").textContent = EU.nome;
  $("userEmpresa").textContent = [EU.empresa, EU.email].filter(Boolean).join(" · ");
  $("userRole").textContent = ROTULO[papel];
  userBtn.title = EU.nome; userBtn.setAttribute("aria-label","Conta de " + EU.nome);
  conta.hidden = false; $("createBtn").hidden = !podeCriar;
  if(podeGerir && !unsubs.usuarios){
    const f = db.collection("usuarios").onSnapshot(s=>{
      usuarios = {}; s.docs.forEach(x=> usuarios[x.id] = x.data());
      if(!$("perfilView").hidden) listarUsuarios();
    }, ()=>{});
    unsubs.push(f); unsubs.usuarios = true;
  }
  render();
  if(!$("perfilView").hidden) renderPerfil();
}

/* --- Página "Meu perfil" --- */
function mostrarPainel(){ $("perfilView").hidden = true; $("visualView").hidden = true; $("homeView").hidden = false; if(painelAberto){ painelAberto = null; $("vFrame").replaceChildren(); document.title = "Gestão à Vista — Segurança Empresarial"; } }
$("perfilVoltar").onclick = ()=>{ mostrarPainel(); render(); window.scrollTo({top:0}); };
$("uPerfil").onclick = ()=>{ fecharPops(); fecharGaveta(); mostrarPainel(); $("homeView").hidden = true; $("perfilView").hidden = false; renderPerfil(); window.scrollTo({top:0}); };

function renderPerfil(){
  if(!EU) return;
  $("pIni").textContent = iniciais(EU.nome);
  $("pSub").textContent = ROTULO[papel] + (EU.empresa ? " · " + EU.empresa : "");
  $("pNome").textContent = EU.nome; $("pEmail").textContent = EU.email || "";
  $("pEmp").textContent = EU.empresa || "Não informada"; $("pTipo").textContent = ROTULO[papel];
  $("gestaoBox").hidden = !podeGerir;
  if(podeGerir) listarUsuarios();
}
$("pSenhaForm").onsubmit = async e=>{
  e.preventDefault();
  const atual = $("psAtual").value, nova = $("psNova").value;
  if(!atual){ aviso("Informe sua senha atual."); return; }
  if(!senhaOk(nova)){ aviso("A nova senha precisa ter pelo menos 8 caracteres."); return; }
  if(nova !== $("psNova2").value){ aviso("As duas senhas novas não são iguais."); return; }
  const b = $("psOk"); b.disabled = true;
  try {
    const u = auth.currentUser;
    await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, atual));
    await u.updatePassword(nova);
    $("pSenhaForm").reset(); aviso("Senha trocada.");
  } catch(x){ aviso(msgErro(x)); }
  finally { b.disabled = false; }
};

/* --- Usuários (somente administrador) --- */
function listarUsuarios(){
  const box = $("perfisLista");
  const lista = Object.entries(usuarios).sort(([,a],[,b])=> PAPEIS.indexOf(b.papel)-PAPEIS.indexOf(a.papel) || String(a.nome).localeCompare(String(b.nome)));
  if(!lista.length){ box.innerHTML = `<p class="vazio">Nenhum usuário cadastrado.</p>`; return; }
  box.innerHTML = lista.map(([id,u])=>`<div class="prow ${u.ativo===false?"inativo":""}"><span class="ini">${esc(iniciais(u.nome))}</span><div class="pi"><strong>${esc(u.nome)}${id===EU.uid?" (você)":""}</strong><small>${esc([u.email, u.empresa, u.ativo===false?"desativado":""].filter(Boolean).join(" · "))}</small></div><span class="tag ${esc(u.papel)}">${esc(ROTULO[u.papel]||"Visualizador")}</span>${id===EU.uid?"":`<button class="mini-btn" data-uedit="${esc(id)}" title="Editar usuário" aria-label="Editar ${esc(u.nome)}">${I.lapis}</button>`}</div>`).join("");
  box.querySelectorAll("[data-uedit]").forEach(b=> b.onclick = ()=> abrirUsuarioForm(b.dataset.uedit));
}

const dlgP = $("dlgPerfil");
let uEditando = null;
function abrirUsuarioForm(id){
  if(!podeGerir) return;
  uEditando = id; const u = id ? usuarios[id] : null;
  $("npTitulo").textContent = id ? "Editar usuário" : "Novo usuário";
  $("npNome").value = u ? u.nome : ""; $("npEmail").value = u ? u.email : ""; $("npEmpresa").value = u ? (u.empresa||"") : "";
  $("npEmail").disabled = !!id;
  $("npTipo").value = u && PAPEIS.includes(u.papel) ? u.papel : "visualizador";
  $("npSenha").value = ""; $("npSenhaBox").hidden = !!id;
  $("npAtivo").checked = !u || u.ativo !== false; $("npAtivoBox").hidden = !id;
  $("npReset").hidden = !id;
  $("npHint").textContent = id ? "Para trocar a senha da pessoa, envie o e-mail de redefinição." : "Passe a senha inicial para a pessoa; ela pode trocar depois em Meu perfil.";
  dlgP.showModal(); $("npNome").focus();
}
$("novoPerfilBtn").onclick = ()=> abrirUsuarioForm(null);
$("npCancelar").onclick = ()=> dlgP.close();
$("npReset").onclick = async ()=>{
  const u = uEditando && usuarios[uEditando]; if(!u) return;
  try { await auth.sendPasswordResetEmail(u.email); aviso("E-mail de redefinição enviado para " + u.email + "."); } catch(x){ aviso(msgErro(x)); }
};
$("npForm").onsubmit = async e=>{
  e.preventDefault();
  const nome = $("npNome").value.trim(), email = $("npEmail").value.trim(), empresa = $("npEmpresa").value.trim();
  const novoPapel = PAPEIS.includes($("npTipo").value) ? $("npTipo").value : "visualizador";
  if(!nome){ aviso("Informe o nome."); return; }
  const b = $("npSalvar"); b.disabled = true;
  try {
    if(uEditando){
      await db.doc("usuarios/" + uEditando).update({ nome, empresa, papel:novoPapel, ativo:$("npAtivo").checked, atualizadoEm:new Date().toISOString() });
      dlgP.close(); aviso("Usuário salvo.");
    } else {
      const senha = $("npSenha").value;
      if(!emailOk(email)){ aviso("Informe um e-mail válido."); return; }
      if(!senhaOk(senha)){ aviso("A senha inicial precisa ter pelo menos 8 caracteres."); return; }
      if(Object.values(usuarios).some(u=> String(u.email).toLowerCase()===email.toLowerCase())){ aviso("Esse e-mail já está na lista de usuários."); return; }
      /* cria a conta numa instância separada, para o administrador continuar conectado */
      const app2 = firebase.apps.find(a=> a.name==="cadastro") || firebase.initializeApp(window.FIREBASE_CONFIG, "cadastro");
      const cred = await app2.auth().createUserWithEmailAndPassword(email, senha);
      const uid = cred.user.uid; await app2.auth().signOut();
      await db.doc("usuarios/" + uid).set({ nome, email, empresa, papel:novoPapel, ativo:true, criadoEm:new Date().toISOString() });
      dlgP.close(); aviso("Usuário criado. Passe o e-mail e a senha inicial para " + nome.split(" ")[0] + ".");
    }
  } catch(x){ aviso(msgErro(x)); }
  finally { b.disabled = false; }
};

/* --- Inicialização --- */
telaGate(null, "Carregando…");
(function iniciar(){
  if(!window.firebase || !window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.apiKey){
    telaGate(null, "O banco do portal ainda não foi configurado. Preencha o arquivo firebase-config.js com os dados do projeto Firebase.");
    return;
  }
  try {
    fb = firebase.initializeApp(window.FIREBASE_CONFIG);
    auth = firebase.auth(); db = firebase.firestore();
  } catch(e){ telaGate(null, "Não foi possível conectar ao banco. Verifique o firebase-config.js."); return; }
  auth.onAuthStateChanged(u=> aoMudarLogin(u));
})();

/* --- menu: recolher (computador) / gaveta (celular) --- */
const estreito = () => matchMedia("(max-width:900px)").matches;
if(ler("gav-menu-mini", false)) document.body.classList.add("mini");
function fecharGaveta(){ document.body.classList.remove("drawer"); }
$("menuBtn").onclick = ()=>{
  if(estreito()) document.body.classList.toggle("drawer");
  else { document.body.classList.toggle("mini"); gravar("gav-menu-mini", document.body.classList.contains("mini")); }
};
$("closeBtn").onclick = fecharGaveta;
$("backdrop").onclick = fecharGaveta;

/* --- tema claro / escuro --- */
const SOL='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const LUA='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const themeBtn = $("themeBtn");
const temaAtual = ()=> document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
function aplicarTema(t){ document.documentElement.dataset.theme = t; themeBtn.innerHTML = t==="dark" ? SOL : LUA; themeBtn.title = t==="dark" ? "Mudar para tema claro" : "Mudar para tema escuro"; }
let temaSalvo = null; try { temaSalvo = localStorage.getItem("gav-tema"); } catch(e) {}
aplicarTema(temaSalvo || temaAtual());
themeBtn.onclick = ()=>{ const t = temaAtual()==="dark" ? "light" : "dark"; aplicarTema(t); try { localStorage.setItem("gav-tema", t); } catch(e) {} };

render();
