const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');
const handlers={};const attributes={};let focused=false;
const mobile={matches:true,addEventListener:(event,fn)=>handlers.resize=fn};
const toggle={getAttribute:key=>attributes[key],setAttribute:(key,value)=>attributes[key]=value,addEventListener:(event,fn)=>handlers.toggle=fn,focus:()=>focused=true};
const navigation={addEventListener:(event,fn)=>handlers.select=fn};
vm.runInNewContext(source('navigation.js'),{window:{matchMedia:()=>mobile},document:{querySelector:selector=>selector==='#menu-toggle'?toggle:selector==='#primary-navigation'?navigation:{contains:()=>false},addEventListener:(event,fn)=>handlers[event]=fn}});
assert.equal(navigation.hidden,true);handlers.toggle();assert.equal(navigation.hidden,false);
handlers.select({target:{closest:()=>true}});assert.equal(navigation.hidden,true);assert.equal(focused,true);
handlers.toggle();handlers.keydown({key:'Escape'});assert.equal(navigation.hidden,true);
handlers.toggle();handlers.click({target:{}});assert.equal(navigation.hidden,true);
mobile.matches=false;handlers.resize();assert.equal(navigation.hidden,false);
mobile.matches=true;handlers.resize();assert.equal(navigation.hidden,true);
console.log('PASS mobile menu: open, select, outside click, Escape, focus and desktop/mobile transitions');

function install(protocol,standalone=false){
  const events={};const nodes={};let registrations=0;
  const get=selector=>nodes[selector]??={addEventListener:(name,fn)=>nodes[selector][name]=fn,showModal(){this.open=true},close(){this.open=false}};
  vm.runInNewContext(source('install.js'),{document:{querySelector:get},location:{protocol},navigator:{standalone,serviceWorker:{register:async()=>registrations++}},window:{isSecureContext:protocol==='https:',matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener:(name,fn)=>events[name]=fn}});
  return{get,events,count:()=>registrations};
}
(async()=>{
  const local=install('file:');await local.get('#install-app').click();assert.equal(local.count(),0);assert.equal(local.get('#install-local-note').hidden,false);
  const secure=install('https:');await secure.get('#install-app').click();assert.equal(secure.count(),1);assert.equal(secure.get('#install-dialog').open,true);assert.equal(secure.get('#install-local-note').hidden,true);
  const ios=install('https:',true);assert.equal(ios.get('#install-app').disabled,true);
  const html=source('index.html');assert.match(html,/iPhone \/ iPad/);assert.match(html,/Add to Home Screen/);assert.match(html,/data-edit-profile/);
  console.log('PASS install states: local-file guidance, HTTPS registration, fallback help and iOS standalone detection');
  console.log('LIMIT: these are simulated controls, not a real mobile browser or physical phone installation test.');
})().catch(error=>{console.error(error);process.exitCode=1});
