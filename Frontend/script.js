/* Compact final: ayuda + domingo->sabado + exportes + filtros + timeline */
document.addEventListener('DOMContentLoaded', () => {
  const $ = s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const cal = $('#calendar'), monthLabel = $('#monthLabel');
  const prev = $('#prev'), next = $('#next'), themeBtn = $('#themeToggle');
  const helpBtn = $('#helpBtn'), helpModal = $('#helpModal'), helpClose = $('#helpClose');
  const legendBtns = $$('.legend-btn'), filterHint = $('#filterHint');
  const exportMonth = $('#exportMonth'), clearMonth = $('#clearMonth');
  const modal = $('#modal'), closeBtn = $('#close');
  const typeEl = $('#type'), hourEl = $('#hour'), minEl = $('#minute'), ampmEl = $('#ampm'), titleEl = $('#title');
  const saveBtn = $('#save'), exportDayBtn = $('#exportDay'), listEl = $('#list'), timeline = $('#timeline');
  let cur = new Date(), sel = null, activeFilter = null;

  const COLORS = { clase: getComputedStyle(document.documentElement).getPropertyValue('--clase').trim(), laboratorio: getComputedStyle(document.documentElement).getPropertyValue('--lab').trim(), examen: getComputedStyle(document.documentElement).getPropertyValue('--examen').trim(), otro: getComputedStyle(document.documentElement).getPropertyValue('--otro').trim() };
  // Key de almacenamiento por usuario
  const USER = localStorage.getItem("userId") || "default";
  const MKEY = d => `${USER}_${d.getFullYear()}-${d.getMonth()}`;
  const load = k => JSON.parse(localStorage.getItem(k)||'{}'), save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const cap = s => s? s.charAt(0).toUpperCase()+s.slice(1):'';

  // fill time selects
  for(let h=1;h<=12;h++) hourEl.innerHTML += `<option>${h}</option>`;
  for(let m=0;m<60;m++){ const mm=String(m).padStart(2,'0'); minEl.innerHTML += `<option>${mm}</option>`; }

  // theme
  themeBtn.addEventListener('click', ()=>{ document.body.classList.toggle('dark'); themeBtn.textContent = document.body.classList.contains('dark')? '☀':'🌙'; });

  // HELP modal
  helpBtn.addEventListener('click', ()=> helpModal.classList.remove('hidden'));
  helpClose && helpClose.addEventListener('click', ()=> helpModal.classList.add('hidden'));
  helpModal.addEventListener('click', e=> { if(e.target===helpModal) helpModal.classList.add('hidden'); });

  // draw calendar (Dom->Sab)
  function draw(){
    cal.innerHTML = '';
    const y = cur.getFullYear(), m = cur.getMonth();
    const first = new Date(y,m,1), days = new Date(y,m+1,0).getDate();
    // set label
    const lbl = first.toLocaleDateString('es-ES',{month:'long',year:'numeric'}); monthLabel.textContent = cap(lbl.split(' ')[0]) + ' ' + y;
    const store = load(MKEY(cur));
    // offset: getDay() returns 0 for Sunday — perfect
    const offset = first.getDay(); // 0..6 where 0 = Domingo
    for(let i=0;i<offset;i++){ const empty = document.createElement('div'); empty.className='day empty'; cal.appendChild(empty); }
    for(let d=1; d<=days; d++){
      const date = new Date(y,m,d);
      const wd = date.toLocaleDateString('es-ES',{weekday:'short'});
      const cell = document.createElement('div'); cell.className='day'; cell.dataset.d=d;
      cell.innerHTML = `<div class="left"><div class="week">${wd}</div><div class="num">${d}</div></div><div class="dots"></div>`;
      const list = store[d]||[]; const types = [...new Set(list.map(x=>x.type))];
      types.forEach(t=>{ const s = document.createElement('span'); s.className='dot'; s.style.background = COLORS[t]||'#888'; cell.querySelector('.dots').appendChild(s); });
      cell.addEventListener('click', ()=> open(d));
      cal.appendChild(cell);
    }
    applyFilter();
  }

  function applyFilter(){
    const store = load(MKEY(cur));
    $$('.day').forEach(c=>{
      if(c.classList.contains('empty')) return;
      const d = c.dataset.d, list = store[d]||[], dots = c.querySelector('.dots');
      dots.innerHTML=''; c.style.background=''; c.style.color='';
      if(!list.length) return;
      if(activeFilter){
        if(list.some(e=>e.type===activeFilter)){ c.style.background = COLORS[activeFilter]; c.style.color='#fff'; } else { c.style.background='var(--card)'; c.style.color='var(--text)'; }
        return;
      }
      const types = [...new Set(list.map(x=>x.type))]; types.forEach(t=>{ const s=document.createElement('span'); s.className='dot'; s.style.background = COLORS[t]||'#888'; dots.appendChild(s); });
    });
  }

  // open modal
  function open(d){ sel = d; modal.classList.remove('hidden'); $('#modalTitle').textContent = `Eventos - ${d}/${cur.getMonth()+1}/${cur.getFullYear()}`; renderList(); renderTimeline(); }
  closeBtn.addEventListener('click', ()=>{ modal.classList.add('hidden'); titleEl.value=''; hourEl.value='1'; minEl.value='00'; ampmEl.value='AM'; });
  modal.addEventListener('click', e=>{ if(e.target===modal) modal.classList.add('hidden'); });

  // save
  saveBtn.addEventListener('click', ()=>{
    if(!titleEl.value.trim()) return alert('Escribe un nombre');
    let h=parseInt(hourEl.value,10), mm=minEl.value;
    if(ampmEl.value==='PM' && h!==12) h+=12; if(ampmEl.value==='AM' && h===12) h=0;
    const time = `${String(h).padStart(2,'0')}:${mm}`;
    const k = MKEY(cur), s = load(k);
    if(!s[sel]) s[sel]=[]; s[sel].push({type:typeEl.value,time,name:titleEl.value.trim()}); save(k,s);
    renderList(); renderTimeline(); draw(); titleEl.value=''; hourEl.value='1'; minEl.value='00'; ampmEl.value='AM';
  });

  function renderList(){
    listEl.innerHTML=''; const arr = (load(MKEY(cur))[sel]||[]).slice().sort((a,b)=>a.time.localeCompare(b.time));
    if(!arr.length) { listEl.innerHTML='<li>(No hay eventos)</li>'; return; }
    arr.forEach(ev=> {
      const li=document.createElement('li'); li.innerHTML = `<span><strong>[${ev.time}]</strong> ${cap(ev.type)} — ${ev.name}</span><button class="del">🗑</button>`;
      li.querySelector('.del').addEventListener('click', ()=>{ const k=MKEY(cur), s=load(k), list=s[sel]||[]; const idx = list.findIndex(x=>x.time===ev.time&&x.name===ev.name&&x.type===ev.type); if(idx>=0){ list.splice(idx,1); s[sel]=list; save(k,s); renderList(); renderTimeline(); draw(); }});
      listEl.appendChild(li);
    });
  }

  function renderTimeline(){
    timeline.innerHTML=''; const arr = load(MKEY(cur))[sel]||[];
    for(let h=0; h<24; h++){
      const row = document.createElement('div'); row.className='hour'; row.innerHTML = `<div class="hour-label">${String(h).padStart(2,'0')}:00</div>`;
      arr.forEach(ev=>{ if(Number(ev.time.split(':')[0])===h){ const b=document.createElement('span'); b.className='timeline-block'; b.textContent=`${ev.time} — ${ev.name}`; b.style.background = COLORS[ev.type]||'#777'; b.addEventListener('click',(e)=>{ e.stopPropagation(); if(confirm(`Eliminar "${ev.name}" a las ${ev.time}?`)){ const k=MKEY(cur), s=load(k), list=s[sel]||[]; const p=list.findIndex(x=>x.time===ev.time&&x.name===ev.name&&x.type===ev.type); if(p>=0){ list.splice(p,1); s[sel]=list; save(k,s); renderList(); renderTimeline(); draw(); } } }); row.appendChild(b); }});
      timeline.appendChild(row);
    }
  }

  // legend filter
  legendBtns.forEach(b=> b.addEventListener('click', ()=>{
    const t = b.dataset.type;
    if(activeFilter===t){ activeFilter=null; b.classList.remove('active'); filterHint.textContent=''; }
    else{ activeFilter=t; legendBtns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); filterHint.textContent='Pulsa el botón de nuevo para quitar la búsqueda por filtro.'; if(document.body.classList.contains('dark')) b.style.color='white'; }
    applyFilter();
  }));

  // export month (clean clone)
  exportMonth.addEventListener('click', async ()=>{
    const wrap = document.querySelector('.calendar-wrap'), clone = wrap.cloneNode(true);
    clone.style.boxShadow='none'; clone.style.position='fixed'; clone.style.left='-5000px'; document.body.appendChild(clone);
    try{ const c = await html2canvas(clone,{scale:2}); const a=document.createElement('a'); a.href=c.toDataURL(); a.download=`calendario-${cur.getFullYear()}-${cur.getMonth()+1}.png`; a.click(); }catch(e){ alert('Error exportando'); }
    document.body.removeChild(clone);
  });

  // export day (title + list + timeline)
  exportDayBtn.addEventListener('click', async ()=>{
    if(!sel) return alert('Selecciona un día');
    const items = load(MKEY(cur))[sel]||[];
    const tmp = document.createElement('div'); tmp.style.padding='18px'; tmp.style.background=getComputedStyle(document.documentElement).getPropertyValue('--card'); tmp.style.color=getComputedStyle(document.documentElement).getPropertyValue('--text'); tmp.style.borderRadius='10px'; tmp.style.width='900px';
    const h = document.createElement('h2'); h.textContent = `Día ${sel} — ${cap(new Date(cur.getFullYear(),cur.getMonth(),sel).toLocaleDateString('es-ES',{weekday:'long',month:'long',day:'numeric'}))}`; tmp.appendChild(h);
    const listBox = document.createElement('div'); items.slice().sort((a,b)=>a.time.localeCompare(b.time)).forEach(ev=>{ const p=document.createElement('p'); const dot=document.createElement('span'); dot.style.width='12px'; dot.style.height='12px'; dot.style.display='inline-block'; dot.style.background = COLORS[ev.type]; dot.style.borderRadius='50%'; dot.style.marginRight='8px'; p.appendChild(dot); p.appendChild(document.createTextNode(`${ev.time} — ${cap(ev.type)}: ${ev.name}`)); listBox.appendChild(p); }); tmp.appendChild(listBox);
    const tl = document.createElement('div'); for(let h=0;h<24;h++){ const row=document.createElement('div'); row.style.display='flex'; row.style.gap='8px'; const lbl=document.createElement('div'); lbl.style.width='64px'; lbl.textContent=`${String(h).padStart(2,'0')}:00`; row.appendChild(lbl); items.forEach(ev=>{ if(Number(ev.time.split(':')[0])===h){ const b=document.createElement('span'); b.textContent = `${ev.time} ${ev.name}`; b.style.background=COLORS[ev.type]; b.style.color='white'; b.style.padding='4px 8px'; b.style.borderRadius='6px'; b.style.marginRight='6px'; row.appendChild(b);} }); tl.appendChild(row); } tmp.appendChild(tl);
    tmp.style.position='fixed'; tmp.style.left='-6000px'; document.body.appendChild(tmp);
    try{ const c=await html2canvas(tmp,{scale:2}); const a=document.createElement('a'); a.href=c.toDataURL(); a.download=`dia-${sel}-${cur.getMonth()+1}.png`; a.click(); }catch(e){ alert('Error exportando día'); }
    document.body.removeChild(tmp);
  });

  // clear month
  clearMonth.addEventListener('click', ()=>{ if(confirm('Borrar todos los eventos del mes actual?')){ localStorage.removeItem(MKEY(cur)); draw(); } });

  // month nav
  prev.addEventListener('click', ()=>{ cur.setMonth(cur.getMonth()-1); sel=null; activeFilter=null; filterHint.textContent=''; draw(); });
  next.addEventListener('click', ()=>{ cur.setMonth(cur.getMonth()+1); sel=null; activeFilter=null; filterHint.textContent=''; draw(); });

  // initial
  draw();
});
