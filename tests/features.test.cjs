const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const existing = require('./app.test.cjs');
const root = path.join(__dirname,'..');
const fixture = {version:2,items:[{id:'personal-1',name:'Șifonier & lampă',room:'Bedroom',price:125.55,value:199.99,serial:'SN-123',date:'2026-02-10',warranty:'2027-02-10',insurance:'Home policy',photo:'',receipt:''}],claims:[{id:'claim-1',incident:'Water damage',date:'2026-09-14',insurer:'Example insurer',number:'CL-001',status:'Submitted',notes:'Water reached the cabinet.',items:['personal-1'],value:199.99,payout:50,evidence:''}]};

async function main(){
  await existing;
  const a=existing.app();a.context.atob=value=>Buffer.from(value,'base64').toString('binary');
  a.run(fs.readFileSync(path.join(root,'backup.js'),'utf8').split('\n(() => {')[0]);
  a.context.fixture=fixture;
  const restored=a.run('Backups.validate(fixture)');
  assert.equal(restored.items[0].name,fixture.items[0].name);
  assert.equal(restored.claims[0].value,199.99);
  const invalids=[
    null, {items:[]}, {...fixture,version:9},
    {...fixture,items:[...fixture.items,...fixture.items]},
    {...fixture,items:[{...fixture.items[0],value:-1}]},
    {...fixture,items:[{...fixture.items[0],price:Infinity}]},
    {...fixture,items:[{...fixture.items[0],date:'2026-02-30'}]},
    {...fixture,items:[{...fixture.items[0],photo:'javascript:alert(1)'}]},
    {...fixture,items:[{...fixture.items[0],photo:'data:image/svg+xml;base64,PHN2Zz4='}]},
    {...fixture,items:[{...fixture.items[0],photo:'data:image/png;base64,YWJj'}]},
    {...fixture,claims:[{...fixture.claims[0],items:['missing']}]},
    {...fixture,items:Array.from({length:13},(_,index)=>({...fixture.items[0],id:'id-'+index}))}
  ];
  for(const invalid of invalids){a.context.invalid=invalid;assert.throws(()=>a.run('Backups.validate(invalid)'));}
  const png='data:image/png;base64,'+fs.readFileSync(path.join(root,'icons/icon-192.png')).toString('base64');
  a.context.png=png;assert.equal(a.run('Backups.attachment(png)'),png);
  a.context.payload={...fixture,items:[{...fixture.items[0],name:'<img src=x onerror=alert(1)>',icon:'<script>bad()</script>'}]};
  a.run('persist(Backups.validate(payload));inventoryMode="personal";navigate("inventory")');
  assert.match(a.get('#inventory-table').innerHTML,/&lt;img/);
  assert.doesNotMatch(a.get('#inventory-table').innerHTML,/<script>/);
  const state=JSON.parse(a.storage.get('trackly-home-v1'));assert.equal(state.items.length,1);
  const options={failWrites:true};const failed=existing.app(fixture,options);
  failed.run('openItem("personal-1")');await existing.submit(failed,existing.values('Unsaved edit'));
  assert.equal(failed.run('data.items[0].name'),fixture.items[0].name);
  assert.equal(failed.get('#modal').open,true);
  failed.context.replacement={version:2,items:[],claims:[]};assert.equal(failed.run('persist(replacement)'),false);
  assert.equal(failed.run('data.items.length'),1);
  assert.equal(JSON.parse(failed.storage.get('trackly-home-v1')).items.length,1);
  console.log('PASS backup: round-trip, malformed schemas, duplicate IDs, invalid amounts/dates/media, missing references, quota and HTML escaping');
  console.log('PASS atomic saves: failed edits and restores preserve memory and stored data');

  const ui=existing.app();ui.context.atob=a.context.atob;
  ui.run(fs.readFileSync(path.join(root,'backup.js'),'utf8'));
  ui.get('#import-backup').click();
  assert.equal(ui.get('#restore-backup').disabled,true);
  ui.get('#backup-file').files=[{size:100,text:async()=>JSON.stringify(fixture)}];
  await ui.get('#backup-file').onchange();
  assert.match(ui.get('#backup-preview').textContent,/1 personal items/);
  ui.get('#restore-backup').click();assert.equal(ui.run('data.items.length'),0);
  ui.get('#backup-confirm').checked=true;ui.get('#backup-confirm').onchange();
  assert.equal(ui.get('#restore-backup').disabled,false);
  ui.get('#restore-backup').click();assert.equal(ui.run('data.items.length'),1);
  assert.equal(ui.get('#backup-dialog').open,false);
  ui.get('#import-backup').click();
  ui.get('#backup-file').files=[{size:100,text:async()=>'{broken'}];
  await ui.get('#backup-file').onchange();
  assert.match(ui.get('#backup-error').textContent,/not valid JSON/);
  assert.equal(ui.run('data.items.length'),1);
  console.log('PASS restore UI: preview, explicit replacement confirmation, restore and invalid-file preservation');

  // Exercise the actual compression algorithm with controlled browser primitives.
  const source=fs.readFileSync(path.join(root,'attachments.js'),'utf8');
  let widths=[],qualities=[],revoked=0;
  const context=vm.createContext({
    URL:{createObjectURL:()=> 'blob:test',revokeObjectURL:()=>revoked++},
    Image:class{constructor(){this.naturalWidth=4000;this.naturalHeight=3000;}set src(value){this.onload()}},
    FileReader:class{readAsDataURL(blob){this.result='data:image/jpeg;base64,/9j/';this.onload()}},
    document:{createElement(){return{width:0,height:0,getContext(){return{fillRect(){},drawImage(){}}},toBlob(callback,type,quality){widths.push(this.width);qualities.push(quality);callback({size:quality>.8?800000:400000})}}}}
  });
  vm.runInContext(source,context);
  context.file={name:'camera.png',size:6000000,type:'image/png'};
  const result=await vm.runInContext('Attachments.prepare(file,"photo")',context);
  assert.equal(result.name,'camera.jpg');assert.equal(result.size,400000);assert.equal(widths[0],1600);assert.equal(qualities.length,2);assert.equal(revoked,1);
  widths=[];await vm.runInContext('Attachments.prepare(file,"receipt")',context);assert.equal(widths[0],2200);
  context.file={name:'too-big.jpg',size:21*1024*1024,type:'image/jpeg'};await assert.rejects(vm.runInContext('Attachments.prepare(file,"photo")',context));
  context.file={name:'fake.pdf',size:50,type:'application/pdf',slice:()=>({arrayBuffer:async()=>Buffer.from('wrong')})};await assert.rejects(vm.runInContext('Attachments.prepare(file,"receipt")',context));
  console.log('PASS photos: resize, receipt resolution, quality fallback, size rejection, PDF signature and object URL cleanup');

  const nodes=new Map();
  const node=()=>({children:[],value:'',disabled:false,append(child){this.children.push(child)},replaceChildren(){this.children=[]},setAttribute(){}});
  const get=selector=>{if(!nodes.has(selector))nodes.set(selector,node());return nodes.get(selector)};
  context.document.querySelector=get;
  const canvasFactory=context.document.createElement;
  context.document.createElement=tag=>tag==='canvas'?canvasFactory():node();
  context.host={querySelector:get};
  context.initial={photo:'data:image/jpeg;base64,/9j/',photoName:'original.jpg'};
  vm.runInContext('var editor=Attachments.bind(host,initial,["photo"])',context);
  const preview=get('[data-attachment-preview="photo"]');
  assert.ok(preview.children.some(child=>child.alt==='Photograph preview'));
  preview.children.find(child=>child.textContent==='Remove attachment').onclick();
  assert.equal(vm.runInContext('editor.values().photo',context),'');
  assert.equal(context.initial.photoName,'original.jpg');
  const upload=get('[data-attachment-input="photo"]');
  upload.files=[{name:'picture.png',size:5000000,type:'image/png'}];
  await upload.onchange();assert.equal(vm.runInContext('editor.values().photoName',context),'picture.jpg');
  upload.files=[{name:'bad.txt',size:10,type:'text/plain'}];await upload.onchange();
  assert.throws(()=>vm.runInContext('editor.values()',context));
  preview.children.find(child=>child.textContent==='Discard failed upload').onclick();
  assert.equal(vm.runInContext('editor.values().photoName',context),'picture.jpg');
  console.log('PASS attachment editor: preview, remove, replace, failed-upload recovery and unchanged original until save');

  // Offline navigation uses the cached app even when the network rejects.
  const handlers={};let match=null;
  const offline=vm.createContext({URL,self:{location:{origin:'https://trackly.test'},clients:{claim:async()=>{}},addEventListener:(event,fn)=>handlers[event]=fn},fetch:async()=>{throw Error('offline')},caches:{match:async request=>{match=request;if(typeof request==='object'&&request.mode==='navigate')return request.url.endsWith('how-to-use.html')?'cached guide':undefined;return 'cached app'}}});
  vm.runInContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),offline);
  let response;handlers.fetch({request:{url:'https://trackly.test/index.html',method:'GET',mode:'navigate'},respondWith:value=>response=value});assert.equal(await response,'cached app');assert.equal(match,'./index.html');
  handlers.fetch({request:{url:'https://trackly.test/attachments.js',method:'GET',mode:'cors'},respondWith:value=>response=value});assert.equal(await response,'cached app');
  handlers.fetch({request:{url:'https://trackly.test/how-to-use.html',method:'GET',mode:'navigate'},respondWith:value=>response=value});assert.equal(await response,'cached guide');
  const assets=vm.runInContext('ASSETS',offline);for(const asset of ['attachments.js','backup.js','reports.js','vendor/jspdf.umd.min.js','vendor/pdf-font.js'])assert.ok(assets.includes('./'+asset));
  const css=fs.readFileSync(path.join(root,'theme.css'),'utf8');assert.match(css,/min-height: 44px/);assert.match(css,/grid-template-columns: repeat\(2,minmax\(0,1fr\)\)/);
  console.log('PASS offline: navigation fallback, cached assets, PDF dependencies and mobile control layout rules');
}
module.exports=main();
if(require.main===module)module.exports.catch(error=>{console.error(error);process.exitCode=1});
