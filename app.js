const $=id=>document.getElementById(id),key="eggMarketDemo1";let s=JSON.parse(localStorage.getItem(key)||'{"p":[],"b":[],"s":[]}');const fa=n=>Number(n).toLocaleString("fa-IR");$("today").textContent=new Intl.DateTimeFormat("fa-IR",{year:"numeric",month:"long",day:"numeric"}).format(new Date());function save(){localStorage.setItem(key,JSON.stringify(s));render()}document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x===b));["buy","history","brands","sources"].forEach(id=>$(id).classList.toggle("hide",id!==b.dataset.tab))});$("form").onsubmit=e=>{e.preventDefault();let r={d:new Date().toISOString(),b:$("brand").value.trim(),w:+$("weight").value,t:$("type").value,p:+$("price").value};s.p.unshift(r);if(!s.b.includes(r.b))s.b.push(r.b);$("form").reset();$("msg").textContent="خرید ثبت شد.";save()};$("brandForm").onsubmit=e=>{e.preventDefault();let v=$("newBrand").value.trim();if(v&&!s.b.includes(v))s.b.push(v);$("newBrand").value="";save()};$("sourceForm").onsubmit=e=>{e.preventDefault();let v=$("newSource").value.trim();if(v&&!s.s.includes(v))s.s.push(v);$("newSource").value="";save()};function render(){$("count").textContent=fa(s.p.length);$("brandsCount").textContent=fa(s.b.length);$("avg").textContent=s.p.length?fa(Math.round(s.p.reduce((a,x)=>a+x.p,0)/s.p.length)):"—";$("brandList").innerHTML=s.b.map(x=>`<option>${esc(x)}</option>`).join("");$("rows").innerHTML=s.p.map((x,i)=>`<tr><td>${new Intl.DateTimeFormat("fa-IR").format(new Date(x.d))}</td><td>${esc(x.b)}</td><td>${fa(x.w)}</td><td>${esc(x.t)}</td><td>${fa(x.p)}</td><td><button data-del="${i}">حذف</button></td></tr>`).join("")||'<tr><td colspan="6">هنوز خریدی ثبت نشده است.</td></tr>';document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{s.p.splice(+b.dataset.del,1);save()});$("brandChips").innerHTML=s.b.map((x,i)=>`<span class="chip">${esc(x)} <button data-b="${i}">×</button></span>`).join("");$("sourceChips").innerHTML=s.s.map((x,i)=>`<span class="chip">${esc(x)} <button data-s="${i}">×</button></span>`).join("");document.querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>{s.b.splice(+b.dataset.b,1);save()});document.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{s.s.splice(+b.dataset.s,1);save()})}function esc(x){return String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}$("csv").onclick=()=>{let a=[["date","brand","weight_kg","egg_type","price"],...s.p.map(x=>[x.d,x.b,x.w,x.t,x.p])],csv="\uFEFF"+a.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\n"),u=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})),link=document.createElement("a");link.href=u;link.download="egg-purchases.csv";link.click();URL.revokeObjectURL(u)};render();

// Read-only connection test. This does not upload or migrate personal purchases.
async function checkSupabaseConnection() {
  const footer = document.querySelector("footer");
  const status = document.createElement("p");
  status.id = "dbStatus";
  status.textContent = "در حال بررسی اتصال پایگاه داده...";
  footer.appendChild(status);

  if (!window.supabaseClient) {
    status.textContent = "اتصال پایگاه داده برقرار نشد؛ کتابخانه اتصال بارگذاری نشد.";
    return;
  }

  const { error } = await window.supabaseClient
    .from("market_index_points")
    .select("index_name")
    .limit(1);

  status.textContent = error
    ? "اتصال به Supabase برقرار نشد؛ دسترسی خواندن جدول را باید بررسی کنیم."
    : "اتصال به پایگاه داده Supabase برقرار است.";
}
checkSupabaseConnection();
