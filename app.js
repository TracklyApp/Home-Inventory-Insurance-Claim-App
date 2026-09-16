const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roomData=[['Living room','photo-1600210492486-724fe5c67fb0','▱'],['Kitchen','photo-1556912172-45b7abe8b7e1','♧'],['Bedroom','photo-1611892440504-42a792e24d32','▤'],['Home office','photo-1497366811353-6870744d04b2','▣'],['Garage','photo-1486006920555-c77dcf18193c','⌂'],['Dining room','photo-1617806118233-18e1de247200','◴']];
const photo=id=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;
const seed=[['Linen sectional sofa','Living room',4200,'Furniture','▱'],['Samsung Frame TV · 55”','Living room',1500,'Electronics','▣'],['KitchenAid stand mixer','Kitchen',450,'Appliances','♧'],['MacBook Pro 14”','Home office',2400,'Electronics','▰'],['Oak dining table','Dining room',2800,'Furniture','▤'],['Bedroom furniture set','Bedroom',12600,'Furniture','▤'],['Kitchen appliances','Kitchen',15800,'Appliances','♧'],['Workshop tools','Garage',9800,'Equipment','⚒'],['Living room collection','Living room',18600,'Furniture','▱'],['Office equipment','Home office',11300,'Electronics','▣'],['Dining collection','Dining room',8000,'Furniture','◴']].map((x,i)=>({id:String(i+1),name:x[0],room:x[1],value:x[2],price:x[2],category:x[3],icon:x[4],date:'2025-06-12',serial:'',warranty:'',insurance:'Home policy',receipt:'',photo:'',documented:i<8}));
const ITEM_LIMIT=Activation.FREE_LIMIT;
const samples=seed.slice(0,10).map((item,index)=>({...item,id:'sample-'+item.id,value:index===4?10800:item.value,price:index===4?10800:item.price,serial:'DEMO-'+String(index+1).padStart(4,'0'),warranty:'2027-06-12',insurance:'Example home policy',documented:true}));
function migrate(saved){
  if(saved.version===2)return saved;
  const referenced=new Set(saved.claims.flatMap(claim=>claim.items));
  // Preserve edited records and every item referenced by an existing claim.
  const items=saved.items.filter(item=>referenced.has(item.id)||!seed.some(original=>Object.keys(original).every(key=>original[key]===item[key])));
  return {...saved,version:2,items};
}
let data={version:2,rooms:[],items:[],claims:[]};let storageOK=true;try{const saved=JSON.parse(localStorage.getItem('trackly-home-v1'));if(saved&&Array.isArray(saved.items)&&Array.isArray(saved.claims))data=migrate(saved);}catch{storageOK=false}
let inventoryMode=data.items.length||(data.rooms||[]).length?'personal':'sample';
const normalizeRoomName=value=>String(value??'').normalize('NFKC').trim().replace(/\s+/g,' ');
const roomKey=value=>normalizeRoomName(value).toLowerCase();
const personalRooms=()=>[...roomData,...(data.rooms||[]).map(name=>[name,'','⌂'])];
const inventoryRooms=()=>inventoryMode==='sample'?roomData:personalRooms();
const roomOptions=selected=>personalRooms().map(([name])=>'<option value="'+escapeHTML(name)+'" '+(name===selected?'selected':'')+'>'+escapeHTML(name)+'</option>').join('');
const inventoryItems=()=>inventoryMode==='sample'?samples:data.items;
const canAddItem=()=>Activation.allows(data.items.length+1);
function renderInventoryMode(){
  const host=$('#inventory-mode');
  host.innerHTML='<div class="inventory-switch"><div class="mode-tabs"><button class="button '+(inventoryMode==='sample'?'selected':'')+'" data-mode="sample">Sample inventory · 10</button><button class="button '+(inventoryMode==='personal'?'selected':'')+'" data-mode="personal">My inventory · '+data.items.length+(Activation.isActive()?' · Activated':'/12')+'</button></div><span>'+(Activation.isActive()?'Activated · No item limit':Math.max(0,ITEM_LIMIT-data.items.length)+' free spaces available')+'</span><button type="button" class="button" id="activation-open">'+(Activation.isActive()?'Activation details':'Enter activation code')+'</button></div><p class="mode-note">'+(page==='claims'?'Claims use your personal items only.':inventoryMode==='sample'?'These 10 examples show how Trackly works. Open one to copy it into your personal inventory.':(Activation.isActive()?'Your belongings only. Activation has removed the item limit.':'Your belongings only. Save 12 items free, then enter an activation code to add more.'))+'</p>';
  host.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{inventoryMode=button.dataset.mode;render()});
  $('#add').disabled=false;
  $('#add').title=page!=='claims'&&!canAddItem()?'Enter an activation code to add more than 12 items.':'';
  $('#activation-open').onclick=()=>Activation.isActive()?notify('Activated for '+Activation.customer()+'. No item limit on this device.'):Activation.open();
}
let page='overview',roomFilter='',search='';
function notify(message){$('#toast').textContent=message;$('#toast').style.display='block';clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('#toast').style.display='none',3500)}
function persist(next=data){try{localStorage.setItem('trackly-home-v1',JSON.stringify(next));data=next;storageOK=true;$('.saved').textContent='● Saved on this device';return true}catch{storageOK=false;$('.saved').textContent='○ Changes not saved';notify('Device storage is unavailable or full. Export a backup before closing.');return false}}
if(!storageOK)$('.saved').textContent='○ Device storage unavailable';
function navigate(next){page=next;search='';if(next!=='inventory')roomFilter='';render()}
function roomCards(){return '<div class="rooms">'+inventoryRooms().map(([name,img,icon])=>{const items=inventoryItems().filter(item=>item.room===name);const cover=img?'<div class="room-photo" style="background-image:url('+photo(img)+')"><span class="room-icon">'+icon+'</span></div>':'<div class="room-photo custom-room-photo"><span class="room-symbol" aria-hidden="true">⌂</span></div>';return '<button class="room" data-room="'+escapeHTML(name)+'">'+cover+'<div class="room-info"><strong>'+escapeHTML(name)+'</strong><div class="room-meta"><span>'+items.length+' items</span><b>'+money(items.reduce((sum,item)=>sum+Number(item.value),0))+'</b></div></div></button>'}).join('')+'</div>'}
function itemTable(items){return items.length?`<div class="table-wrap"><table><thead><tr><th>ITEM</th><th>ROOM</th><th>VALUE</th><th>DOCUMENTATION</th><th></th></tr></thead><tbody>${items.map(i=>`<tr><td><div class="item-cell">${i.photo?`<img class="item-thumb" src="${escapeHTML(i.photo)}" alt="">`:`<span class="item-thumb">${i.icon||'▦'}</span>`}${escapeHTML(i.name)}</div></td><td>${escapeHTML(i.room)}</td><td>${money(i.value)}</td><td><span class="badge ${i.documented?'':'amber'}">${i.documented?'Documented':'Needs details'}</span></td><td><button class="text-button" data-edit="${escapeHTML(i.id)}" aria-label="Edit ${escapeHTML(i.name)}">↗</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="panel empty">No items here yet. Add your first item to get started.</div>'}
function render(){
  const help = page === 'help';
  $('.actions').hidden = help;
  $('#inventory-mode').hidden = help;
  if (help) {
    $('#page-title').textContent = 'How to use Trackly';
    $('#page-description').textContent = 'Your detailed guide, from the first item to a complete claim record.';
    $('#breadcrumb').textContent = 'How to use';
    document.querySelectorAll('nav button').forEach(button => button.classList.toggle('active', button.dataset.page === 'help'));
    $('#content').innerHTML = Manual.render();
    Manual.bind($('#content'));
    return;
  }const visibleItems=inventoryItems();renderInventoryMode();const titles={overview:['Your home, accounted for.','Know what you own. Protect what matters.'],inventory:['Home inventory','Every belonging, with the details that matter.'],rooms:['A room-by-room picture.','Start with a space. Build a complete picture of your home.'],claims:['Insurance claims','Keep your incident, evidence, and progress together.'],documents:['Your paper trail, organized.','Photos, receipts, and warranty details attached to your items.']};$('#page-title').textContent=titles[page][0];$('#page-description').textContent=titles[page][1];$('#breadcrumb').textContent=page==='overview'?'Overview':page==='claims'?'Insurance claims':page[0].toUpperCase()+page.slice(1);document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('#nav-count').textContent=visibleItems.length;$('#add').textContent=page==='claims'?'＋ New claim':'＋ Add item';const total=visibleItems.reduce((s,i)=>s+Number(i.value),0);const documented=visibleItems.filter(i=>i.documented).length;const percent=visibleItems.length?Math.round(documented/visibleItems.length*100):0;
if(page==='overview'){$('#content').innerHTML=`<div class="stats"><div class="stat"><div class="stat-label">Total household value <span>↗</span></div><div class="stat-value">${money(total)}</div><small>Estimated replacement value</small></div><div class="stat"><div class="stat-label">Items in your home <span>▦</span></div><div class="stat-value">${visibleItems.length}<span style="font-size:13px;color:var(--muted);font-weight:400;letter-spacing:0"> items</span></div><small>Across <em>${new Set(visibleItems.map(i=>i.room)).size} rooms</em></small></div><div class="stat"><div class="stat-label">Documented items <span>▤</span></div><div class="stat-value">${percent}<span style="font-size:19px">%</span></div><small><em>${documented} items</em> with supporting details</small></div><div class="stat"><div class="stat-label">Active claims <span>◇</span></div><div class="stat-value">${data.claims.filter(c=>c.status!=='Settled'&&c.status!=='Closed').length}</div><small>Your claim progress, in one place</small></div></div><div class="overview-grid"><div><div class="section-heading"><h2>Explore your rooms</h2><button class="text-button" data-go="rooms">View all rooms ↗</button></div>${roomCards()}<section class="recent"><div class="section-heading"><h2>Recently added items</h2><button class="text-button" data-go="inventory">View inventory →</button></div>${itemTable(visibleItems.slice(0,4))}</section></div><div class="right-column"><div class="panel coverage"><div class="section-heading"><h2>A little more peace of mind</h2><span style="color:var(--accent)">♧</span></div><div class="donut" style="background:conic-gradient(var(--ring) 0 ${percent}%,var(--ring-track) ${percent}% 100%)"><div class="donut-inner"><strong>${percent}%</strong><small>documented</small></div></div><div class="legend"><span>● With supporting details</span><b>${documented} items</b></div><div class="legend"><span>○ Needs a little attention</span><b>${visibleItems.length-documented} items</b></div><p class="coverage-note">A photo and a receipt today can make things a whole lot easier tomorrow.</p><button class="text-button" data-go="documents">Review your documents →</button></div><div class="panel tip"><div class="eyebrow">✧ THE THOUGHTFUL HOMEOWNER</div><h3>Don’t forget the little things.</h3><p>Kitchen gadgets, linens, and tools add up. Take a few minutes to capture one room at a time.</p><button class="text-button" data-go="rooms">Keep building your inventory →</button></div></div></div><div class="claim-banner"><span>◇</span><div><strong>When life happens, you’re a step ahead.</strong><p>Turn your inventory into an organized insurance claim, all in one place.</p></div><button class="button" data-go="claims">Go to claim mode →</button></div>`}
if(page==='rooms')$('#content').innerHTML='<div class="section-heading"><h2>'+ (inventoryMode==='sample'?'Sample rooms':'Your rooms') +'</h2><button class="button primary" type="button" data-add-room>＋ Add room</button></div>'+roomCards();
if(page==='inventory'){$('#content').innerHTML=`<div class="toolbar"><input id="search" type="search" placeholder="Search your belongings…" aria-label="Search inventory"><select id="room-filter" aria-label="Filter by room"><option value="">All rooms</option>${inventoryRooms().map(r=>`<option value="${escapeHTML(r[0])}" ${roomFilter===r[0]?'selected':''}>${escapeHTML(r[0])}</option>`).join('')}</select></div><div id="inventory-table"></div>`;updateTable();$('#search').oninput=e=>{search=e.target.value;updateTable()};$('#room-filter').onchange=e=>{roomFilter=e.target.value;updateTable()}}
if(page==='documents')$('#content').innerHTML=itemTable(visibleItems.filter(i=>i.photo||i.receipt||i.warranty||i.documented));
if(page==='claims')$('#content').innerHTML=data.claims.length?data.claims.map(c=>`<div class="panel claim-card"><div class="section-heading"><h2>${escapeHTML(c.incident)}</h2><span class="badge">${escapeHTML(c.status)}</span></div><p>${escapeHTML(c.insurer||'Insurer not added')} · ${escapeHTML(c.number||'Claim number pending')} · ${escapeHTML(c.date)}</p><p>${c.items.length} affected items · Claimed value <strong>${money(c.value)}</strong> · Payout <strong>${money(c.payout)}</strong></p><button class="text-button" data-claim="${escapeHTML(c.id)}">Manage claim →</button><button class="text-button" data-export-claim="${escapeHTML(c.id)}">↓ Claim backup</button><button class="text-button" data-pdf-claim="${escapeHTML(c.id)}">↓ Claim PDF</button></div>`).join(''):`<div class="panel empty"><div style="font-size:40px;margin-bottom:16px">◇</div><h2>A clear path when the unexpected happens.</h2><p>Create an incident, select affected items, and track your claim through to payout.</p><button class="button primary" id="empty-claim">＋ Create your first claim</button></div>`;
}
function updateTable(){$('#inventory-table').innerHTML=itemTable(inventoryItems().filter(i=>(!roomFilter||i.room===roomFilter)&&`${i.name} ${i.serial} ${i.category}`.toLowerCase().includes(search.toLowerCase())))}
const field=(label,name,value='',type='text',extra='')=>`<label>${label}<input name="${name}" type="${type}" value="${escapeHTML(value)}" ${extra}></label>`;
let activeAttachments = null;
function openItem(id) {
  const sample = samples.find(item => item.id === id);
  if (sample) id = undefined;
  if (!id && !canAddItem()) { Activation.open(() => openItem(sample?.id)); return; }
  activeAttachments?.dispose();
  const item = sample ? {...sample, id: undefined, serial: '', insurance: '', warranty: '', documented: false} : data.items.find(item => item.id === id) || {};
  $('#modal-title').textContent = sample ? 'Add this example to my inventory' : id ? 'Item details' : 'Add a belonging';
  $('#fields').innerHTML = field('Item name','name',item.name,'text','required maxlength="150"') + '<label>Room<select name="room">' + roomOptions(item.room || roomFilter) + '</select><button type="button" class="text-button room-add-inline" data-add-room>＋ Add room</button></label>' + field('Category','category',item.category,'text','maxlength="300"') + field('Serial number','serial',item.serial,'text','maxlength="300"') + field('Purchase date','date',item.date,'date') + field('Purchase price ($)','price',item.price,'number','min="0" max="1000000000000" step="0.01" required') + field('Replacement value ($)','value',item.value,'number','min="0" max="1000000000000" step="0.01" required') + field('Warranty expires','warranty',item.warranty,'date') + field('Insurance policy / insurer','insurance',item.insurance,'text','maxlength="300"') + Attachments.field('photo','Item photograph') + Attachments.field('receipt','Receipt (image or PDF)') + (id ? '<button type="button" class="text-button remove-item" data-remove="'+escapeHTML(id)+'">Remove item</button>' : '');
  const editor = activeAttachments = Attachments.bind($('#fields'), item, ['photo','receipt']);
  $('#form button[type="submit"]').disabled = false;
  $('#form').onsubmit = async event => {
    event.preventDefault();
    const button = $('#form button[type="submit"]'); button.disabled = true;
    try {
      if (!id && !canAddItem()) { Activation.open(); return; }
      const form = new FormData(event.target);
      const next = {...item, id:item.id || crypto.randomUUID(), icon:item.icon || '▦', ...editor.values()};
      for (const key of ['name','room','category','serial','date','warranty','insurance']) next[key] = String(form.get(key)||'').trim();
      if (!personalRooms().some(room=>room[0]===next.room)) throw new Error('Choose a room from the list.');
      if (!next.name || next.name.length > 150) throw new Error('Enter an item name up to 150 characters.');
      next.price = Number(form.get('price')); next.value = Number(form.get('value'));
      if ([next.price,next.value].some(value => !Number.isFinite(value) || value<0 || value>1e12)) throw new Error('Enter valid, non-negative values.');
      next.documented = Boolean(next.photo || next.receipt || next.serial);
      const items = id ? data.items.map(item => item.id===id ? next : item) : [next,...data.items];
      if (!persist({...data,items})) return;
      inventoryMode='personal'; $('#modal').close(); render(); notify(id?'Item updated':'Your belonging has been added');
    } catch(error) { notify(error.message); } finally { button.disabled=false; }
  };
  $('#modal').showModal();
}
function openClaim(id) {
  activeAttachments?.dispose();
  const claim=data.claims.find(claim=>claim.id===id)||{items:[]};
  $('#modal-title').textContent=id?'Manage insurance claim':'Create an insurance claim';
  $('#fields').innerHTML=field('Incident / title','incident',claim.incident,'text','required maxlength="300"')+field('Incident date','date',claim.date||new Date().toISOString().slice(0,10),'date','required')+field('Insurer','insurer',claim.insurer,'text','maxlength="300"')+field('Claim number','number',claim.number,'text','maxlength="300"')+'<label>Status<select name="status">'+['Draft','Submitted','Under review','Approved','Settled','Closed'].map(status=>'<option '+(status===claim.status?'selected':'')+'>'+status+'</option>').join('')+'</select></label>'+field('Payout received ($)','payout',claim.payout||0,'number','min="0" max="1000000000000" step="0.01"')+'<label class="full">Incident notes / damage description<textarea name="notes" rows="3" maxlength="10000">'+escapeHTML(claim.notes||'')+'</textarea></label>'+Attachments.field('evidence','Incident photograph')+'<label class="full">Select lost or damaged belongings</label><div class="checklist">'+(data.items.length?data.items.map(item=>'<label><input type="checkbox" name="items" value="'+escapeHTML(item.id)+'" '+(claim.items.includes(item.id)?'checked':'')+'> '+escapeHTML(item.name)+' · '+money(item.value)+'</label>').join(''):'Add inventory items before creating a claim.')+'</div>';
  const editor=activeAttachments=Attachments.bind($('#fields'),claim,['evidence']);
  $('#form button[type="submit"]').disabled=false;
  $('#form').onsubmit=async event=>{
    event.preventDefault();const button=$('#form button[type="submit"]');button.disabled=true;
    try{
      const form=new FormData(event.target);const ids=form.getAll('items');
      if(!ids.length||ids.some(id=>!data.items.some(item=>item.id===id)))throw new Error('Select at least one affected item.');
      const next={...claim,id:claim.id||crypto.randomUUID(),items:ids,value:data.items.filter(item=>ids.includes(item.id)).reduce((sum,item)=>sum+Number(item.value),0),payout:Number(form.get('payout')),...editor.values()};
      for(const key of ['incident','date','insurer','number','status','notes'])next[key]=String(form.get(key)||'').trim();
      if(!next.incident)throw new Error('Enter an incident title.');
      if(!Number.isFinite(next.payout)||next.payout<0||next.payout>1e12)throw new Error('Enter a valid payout.');
      const claims=id?data.claims.map(claim=>claim.id===id?next:claim):[next,...data.claims];
      if(!persist({...data,claims}))return;
      $('#modal').close();render();notify('Claim saved');
    }catch(error){notify(error.message)}finally{button.disabled=false}
  };
  $('#modal').showModal();
}
function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.page)navigate(b.dataset.page);if(b.dataset.go)navigate(b.dataset.go);if(b.dataset.room){roomFilter=b.dataset.room;navigate('inventory')}if(b.dataset.edit)openItem(b.dataset.edit);if(b.dataset.claim)openClaim(b.dataset.claim);if(b.dataset.exportClaim){const c=data.claims.find(c=>c.id===b.dataset.exportClaim);download(JSON.stringify({...c,affectedItems:data.items.filter(i=>c.items.includes(i.id))},null,2),'trackly-claim.json','application/json')}if(b.dataset.remove)removeItem(b.dataset.remove);if(b.id==='empty-claim')openClaim()});
$('#add').onclick=()=>page==='claims'?openClaim():openItem();$('#close').onclick=$('#cancel').onclick=()=>$('#modal').close();$('#export').onclick=()=>{download(JSON.stringify({exportedAt:new Date().toISOString(),...data},null,2),'trackly-home-inventory.json','application/json');notify('Inventory backup exported with attachments and claims')};render();

function removeItem(id){
  if(data.claims.some(claim=>claim.items.includes(id))){notify('This item belongs to a claim. Remove it from the claim before deleting it.');return}
  const button=document.querySelector('[data-remove]');
  if(button.dataset.confirm!==id){button.dataset.confirm=id;button.textContent='Confirm removal — this cannot be undone';return}
  if(!persist({...data,items:data.items.filter(item=>item.id!==id)}))return;$('#modal').close();render();notify('Item removed. A personal space is available.');
}

$('#modal').addEventListener('close',()=>activeAttachments?.dispose());

Activation.bind(() => render());
