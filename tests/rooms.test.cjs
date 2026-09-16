const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const suite=require('./app.test.cjs');
const source=fs.readFileSync(path.join(__dirname,'../rooms.js'),'utf8');
async function main(){
  await suite;
  const a=suite.app();a.run(source);
  assert.equal(a.run('personalRooms().length'),6);
  assert.equal(a.run('RoomManager.add("  Guest   bedroom  ")'),'Guest bedroom');
  assert.equal(a.run('data.items.length'),0);
  assert.equal(a.run('personalRooms().length'),7);
  for(const name of ['','  ','KITCHEN','Ｇｕｅｓｔ bedroom','x'.repeat(61)]){
    a.context.testName=name;assert.throws(()=>a.run('RoomManager.add(testName)'));
  }
  a.run("inventoryMode='personal';navigate('rooms')");assert.match(a.get('#content').innerHTML,/Guest bedroom/);
  a.run("navigate('inventory')");assert.match(a.get('#content').innerHTML,/Guest bedroom/);
  a.run('openItem()');assert.match(a.get('#fields').innerHTML,/Guest bedroom/);
  await suite.submit(a,{...suite.values('Guest lamp'),room:'Guest bedroom'});
  a.run("roomFilter='Guest bedroom';navigate('inventory')");assert.match(a.get('#inventory-table').innerHTML,/Guest lamp/);
  a.run('openItem(data.items[0].id);RoomManager.open()');
  a.get('#room-name').value='Bathroom';a.get('#room-form').onsubmit({preventDefault(){}});
  assert.equal(a.get('#fields select[name="room"]').value,'Bathroom');
  assert.equal(a.get('#modal').open,true);
  assert.equal(a.get('#room-dialog').open,false);
  await suite.submit(a,{...suite.values('Guest lamp'),room:'Bathroom'});
  assert.equal(a.run('data.items[0].room'),'Bathroom');
  const saved=JSON.parse(a.storage.get('trackly-home-v1'));const reload=suite.app(saved);
  assert.equal(reload.run('personalRooms().length'),8);
  a.context.atob=value=>Buffer.from(value,'base64').toString('binary');
  a.run(fs.readFileSync(path.join(__dirname,'../backup.js'),'utf8').split('\n(() => {')[0]);
  a.context.saved=saved;const backup=a.run('Backups.validate(saved)');
  assert.equal(backup.rooms.length,2);assert.equal(backup.items[0].room,'Bathroom');
  a.context.invalid={...saved,rooms:['Kitchen']};assert.throws(()=>a.run('Backups.validate(invalid)'));
  a.context.invalid={...saved,rooms:['Bathroom',' bathroom ']};assert.throws(()=>a.run('Backups.validate(invalid)'));
  a.context.invalid={...saved,rooms:[]};assert.throws(()=>a.run('Backups.validate(invalid)'));
  assert.equal(a.run('Backups.validate({version:2,items:[],claims:[]}).rooms.length'),0);
  a.run('RoomManager.add(\'Bath <img src=x> & laundry\');inventoryMode="personal";navigate("rooms")');
  assert.match(a.get('#content').innerHTML,/&lt;img src=x&gt; &amp;/);assert.doesNotMatch(a.get('#content').innerHTML,/<img src=x>/);
  a.run("inventoryMode='sample';navigate('rooms')");assert.doesNotMatch(a.get('#content').innerHTML,/Guest bedroom|Bathroom/);
  const failure=suite.app(saved,{failWrites:true});failure.run(source);assert.throws(()=>failure.run('RoomManager.add("Nursery")'));assert.equal(failure.run('data.rooms.length'),2);
  console.log('PASS rooms: add, trim/duplicate validation, cards, selectors, assignment, inline creation, reload, backup round-trip, legacy backups, escaping, sample separation and failed saves');
}
module.exports=main();
if(require.main===module)module.exports.catch(error=>{console.error(error);process.exitCode=1});
