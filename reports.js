const Reports = (() => {
  const currency = value => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',minimumFractionDigits:2}).format(Number(value)||0);
  const clean = value => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[\u2011-\u2015]/g, '-');
  async function create(items, claim = null, owner = '', timestamp = new Date()) {
    if (!globalThis.jspdf?.jsPDF || !globalThis.TRACKLY_PDF_FONT) throw new Error('PDF tools are not available. Reload the app online once and retry.');
    const doc = new globalThis.jspdf.jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
    doc.addFileToVFS('NotoSans.ttf', globalThis.TRACKLY_PDF_FONT);
    doc.addFont('NotoSans.ttf', 'NotoSans', 'normal');
    doc.setFont('NotoSans');
    doc.setProperties({title:claim?'Trackly Insurance Claim':'Trackly Home Inventory',author:owner||'Trackly',subject:'Personal inventory and supporting evidence'});
    const left=18, right=192, width=174, bottom=273;
    let y=18;
    const color = (hex='#233d63') => doc.setTextColor(hex);
    function page() { doc.addPage(); y=20; }
    function ensure(height) { if(y+height>bottom)page(); }
    function line(text,size=10,shade='#233d63',indent=0,maxWidth=width-indent) {
      doc.setFontSize(size);color(shade);
      const lines=doc.splitTextToSize(clean(text)||'Not provided',maxWidth);
      const leading=size*.46;
      for(const part of lines){ensure(leading+1);doc.text(part,left+indent,y);y+=leading;}
      y+=2;
    }
    function heading(text) { ensure(34); y+=4;line(text,13);doc.setDrawColor('#dce0e8');doc.line(left,y,right,y);y+=7; }
    function field(label,value) { line(label+': '+(value==null||value===''?'Not provided':clean(value)),9); }
    async function imagePage(source,title,filename) {
      if(!source)return;
      if(source.startsWith('data:application/pdf')){heading(title);line('PDF receipt: '+(filename||'receipt.pdf'),10);line('The original PDF receipt is included in the JSON backup and can be downloaded from the item details. Its pages are not merged into this report.',9,'#606b7c');return;}
      // Decode locally to respect phone orientation and normalize legacy image formats.
      const image=await Attachments.loadImage(source);
      const canvas=document.createElement('canvas');
      const scale=Math.min(1,2200/Math.max(image.naturalWidth,image.naturalHeight));
      canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
      const context=canvas.getContext('2d');
      if(!context)throw new Error('Image rendering is unavailable.');
      context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
      const jpeg=canvas.toDataURL('image/jpeg',.92);
      page();heading(title);
      if(filename)line(filename,9,'#606b7c');
      const factor=Math.min(width/canvas.width,(bottom-y-8)/canvas.height);
      const w=canvas.width*factor,h=canvas.height*factor;
      doc.addImage(jpeg,'JPEG',left+(width-w)/2,y,w,h,undefined,'FAST');y+=h+8;
      canvas.width=canvas.height=1;
    }
    doc.setFillColor('#172c4a');doc.rect(0,0,210,46,'F');
    doc.setFontSize(11);doc.setTextColor('#dfc79c');doc.text('TRACKLY  /  HOME RECORDS',left,17);
    doc.setFontSize(22);doc.setTextColor('#ffffff');doc.text(claim?'Insurance claim report':'Home inventory report',left,32);
    y=57;
    field('Prepared for',owner||'Homeowner');
    field('Generated',timestamp.toISOString().slice(0,10));
    field('Currency','USD');
    field('Personal items',String(items.length));
    const total=items.reduce((sum,item)=>sum+Number(item.value),0);
    field(claim?'Current replacement value of selected items':'Total replacement value',currency(total));
    if(claim){
      heading('Incident and claim');
      field('Incident',claim.incident);field('Incident date',claim.date);field('Insurer',claim.insurer);field('Claim number',claim.number);field('Status',claim.status);
      field('Claimed value (saved with claim)',currency(claim.value));field('Payout received',currency(claim.payout));
      if(Math.abs(total-claim.value)>.005)line('The saved claim value differs from the current inventory values. Review the claim before submitting it.',9,'#825d22');
      if(claim.notes){heading('Damage description / notes');line(claim.notes,10);}
    }
    heading('Inventory summary');
    function tableHeader(){ensure(15);doc.setFillColor('#eeeff3');doc.rect(left,y-4,width,9,'F');doc.setFontSize(9);color();doc.text('ITEM / ROOM',left+2,y+1);doc.text('PURCHASE',143,y+1,{align:'right'});doc.text('REPLACEMENT',right-2,y+1,{align:'right'});y+=12;}
    tableHeader();
    for(const item of items){
      doc.setFontSize(9);const names=doc.splitTextToSize(clean(item.name)+' / '+clean(item.room),92);const height=Math.max(12,names.length*4.5+5);
      if(y+height>bottom){page();tableHeader();}
      color();doc.text(names,left+2,y);doc.text(currency(item.price),143,y,{align:'right'});doc.text(currency(item.value),right-2,y,{align:'right'});y+=height;
      doc.setDrawColor('#dce0e8');doc.line(left,y-4,right,y-4);
    }
    heading('About this record');
    line('Values and evidence are supplied by the homeowner. This report is an inventory record, not proof of coverage, an appraisal, or confirmation that an insurer has accepted a claim.',9,'#606b7c');
    line('Keep the original receipts and photographs. Image receipts and photographs appear in the following pages; PDF receipts are listed and retained in the JSON backup.',9,'#606b7c');
    for(let index=0;index<items.length;index++){
      const item=items[index];page();heading(`${index+1}. ${item.name}`);
      field('Room',item.room);field('Category',item.category);field('Serial number',item.serial);field('Purchased',item.date);field('Purchase price',currency(item.price));field('Replacement value',currency(item.value));field('Warranty expires',item.warranty);field('Insurance policy / insurer',item.insurance);
      field('Photograph',item.photo?'Included on following page':'Not attached');field('Receipt',item.receipt?(item.receiptName||'Attached'):'Not attached');
      await imagePage(item.photo,`Item ${index+1} - photograph`,item.photoName);
      await imagePage(item.receipt,`Item ${index+1} - receipt`,item.receiptName);
    }
    if(claim)await imagePage(claim.evidence,'Incident photograph',claim.evidenceName);
    const pages=doc.getNumberOfPages();
    for(let n=1;n<=pages;n++){doc.setPage(n);doc.setFontSize(8);doc.setTextColor('#606b7c');doc.setDrawColor('#dce0e8');doc.line(left,281,right,281);doc.text('TRACKLY | Personal home records',left,287);doc.text(`${n} / ${pages}`,right,287,{align:'right'});}
    return doc;
  }
  async function exportPDF(claimId, button) {
    const claim=claimId?data.claims.find(claim=>claim.id===claimId):null;
    if(claimId&&!claim){notify('This claim could not be found.');return;}
    const items=claim?data.items.filter(item=>claim.items.includes(item.id)):data.items;
    if(!items.length){notify('Add personal items before exporting a PDF. Sample items are not included.');return;}
    const snapshot=JSON.parse(JSON.stringify({items,claim}));
    const label=button.textContent;button.disabled=true;button.textContent='Preparing PDF…';
    try{
      let owner='';try{owner=JSON.parse(localStorage.getItem('trackly-profile'))?.name||'';}catch{}
      const doc=await create(snapshot.items,snapshot.claim,owner);
      download(doc.output('arraybuffer'),claim?'trackly-insurance-claim.pdf':'trackly-home-inventory.pdf','application/pdf');
      notify('PDF downloaded. On iPhone, use Share to save it to Files.');
    }catch(error){notify('PDF could not be created: '+error.message);}finally{button.disabled=false;button.textContent=label;}
  }
  return {create,exportPDF};
})();
document.querySelector('#export-pdf').onclick=event=>Reports.exportPDF(null,event.currentTarget);
document.addEventListener('click',event=>{const button=event.target.closest('[data-pdf-claim]');if(button)Reports.exportPDF(button.dataset.pdfClaim,button);});
