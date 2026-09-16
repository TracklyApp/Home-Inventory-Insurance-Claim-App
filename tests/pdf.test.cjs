const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const {jsPDF}=require('../vendor/jspdf.umd.min.js');
async function main(){
  const imagePath=path.join(root,'tests/fixtures/receipt.jpg');
  fs.mkdirSync(path.join(root,'tmp/pdf-qa'),{recursive:true});
  const jpeg='data:image/jpeg;base64,'+fs.readFileSync(imagePath).toString('base64');
  const context=vm.createContext({
    jspdf:{jsPDF},TRACKLY_PDF_FONT:fs.readFileSync(path.join(root,'vendor/NotoSans-Regular.ttf')).toString('base64'),Intl,
    Attachments:{loadImage:async()=>({naturalWidth:900,naturalHeight:1200})},
    document:{querySelector:()=>({}),addEventListener(){},createElement:()=>({getContext:()=>({fillRect(){},drawImage(){}}),toDataURL:()=>jpeg})}
  });
  vm.runInContext(fs.readFileSync(path.join(root,'reports.js'),'utf8'),context);
  const items=[{id:'test-1',name:'Șifonier și lampă - înregistrare demonstrativă',room:'Bedroom',category:'Furniture',serial:'SN-DEMO-001',date:'2026-02-10',price:125.55,value:199.99,warranty:'2027-02-10',insurance:'Example policy',photo:jpeg,receipt:jpeg,receiptName:'sample-receipt.jpg'}];
  const claim={id:'claim-demo',incident:'Apă în dormitor - exemplu',date:'2026-09-14',insurer:'Example insurer',number:'CL-DEMO-001',status:'Under review',notes:'Test report. '+ 'Descriere: bun deteriorat de apă. '.repeat(180),items:['test-1'],value:180.55,payout:50.25,evidence:jpeg};
  context.items=items;context.claim=claim;
  const inventory=await vm.runInContext('Reports.create(items,null,"Maria Test")',context);
  const incident=await vm.runInContext('Reports.create(items,claim,"Maria Test")',context);
  assert.equal(inventory.getNumberOfPages(),4);
  assert.ok(incident.getNumberOfPages()>inventory.getNumberOfPages());
  fs.writeFileSync(path.join(root,'tmp/pdf-qa/inventory.pdf'),Buffer.from(inventory.output('arraybuffer')));
  fs.writeFileSync(path.join(root,'tmp/pdf-qa/claim.pdf'),Buffer.from(incident.output('arraybuffer')));
  // Long names, maximum prices and all ten rows must paginate without throwing.
  context.items=Array.from({length:10},(_,i)=>({...items[0],id:'item-'+i,name:'A very long item name '.repeat(7).slice(0,150),value:1e12,photo:'',receipt:''}));
  const long=await vm.runInContext('Reports.create(items,null,"Long record test")',context);
  assert.ok(long.getNumberOfPages()>=11);
  fs.writeFileSync(path.join(root,'tmp/pdf-qa/long-inventory.pdf'),Buffer.from(long.output('arraybuffer')));
  console.log(`PASS PDF: actual generation, Unicode font, photographs, receipts, long notes, 10 items, large values and pagination (${inventory.getNumberOfPages()} / ${incident.getNumberOfPages()} / ${long.getNumberOfPages()} pages)`);
}
module.exports=main();
if(require.main===module)module.exports.catch(error=>{console.error(error);process.exitCode=1});
