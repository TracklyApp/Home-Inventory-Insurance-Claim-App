const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {jsPDF} = require('../vendor/jspdf.umd.min.js');
const root = path.join(__dirname,'..');
const source = fs.readFileSync(path.join(root,'manual.js'),'utf8');
const sandbox = vm.createContext({});
vm.runInContext(source,sandbox);
const guide = vm.runInContext('Manual',sandbox);
const css = fs.readFileSync(path.join(root,'manual.css'),'utf8');
const standalone = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trackly - Detailed How-to-use Manual</title><style>${css}</style></head><body class="manual-standalone"><main><div class="standalone-heading"><h1>How to use Trackly</h1><a href="index.html">Open the app</a></div>${guide.render(true)}</main><script>${source}\nManual.bind(document);</script></body></html>`;
fs.writeFileSync(path.join(root,'how-to-use.html'),standalone);

const doc = new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
doc.addFileToVFS('NotoSans.ttf',fs.readFileSync(path.join(root,'vendor/NotoSans-Regular.ttf')).toString('base64'));
doc.addFont('NotoSans.ttf','NotoSans','normal');doc.setFont('NotoSans');
doc.setProperties({title:'Trackly - Detailed How-to-use Manual',author:'Trackly',subject:'Home inventory, evidence, backups, claims, and phone installation'});
const left=18,right=192,width=174,bottom=272;
let y=20,currentTitle='';
const sectionPages=[];
function nextPage(continued=true){
  doc.addPage();y=24;
  if(continued&&currentTitle){doc.setFontSize(8);doc.setTextColor('#606b7c');doc.text('TRACKLY / '+currentTitle+' (continued)',left,14);doc.setDrawColor('#dce0e8');doc.line(left,18,right,18);}
}
function ensure(height){if(y+height>bottom)nextPage();}
function paragraph(value,{size=10,shade='#3c4960',indent=0,after=3}={}){
  doc.setFontSize(size);
  const lines=doc.splitTextToSize(String(value),width-indent);
  for(const line of lines){ensure(size*.48+1);doc.setFontSize(size);doc.setTextColor(shade);doc.text(line,left+indent,y);y+=size*.48;}
  y+=after;
}
function list(items,ordered){
  items.forEach((item,index)=>{
    doc.setFontSize(10);const lines=doc.splitTextToSize(item,width-9);ensure(Math.min(lines.length*4.8+5,22));
    doc.setTextColor('#795e2e');doc.text(ordered?`${index+1}.`:'•',left,y);
    paragraph(item,{indent:9,after:4});
  });
}
function table(block){
  const widths=[48,126],pad=3,lineHeight=4.25;
  function header(){ensure(14);doc.setFillColor('#eeeff3');doc.rect(left,y-4,width,10,'F');doc.setFontSize(9);doc.setTextColor('#233d63');doc.text(block.headers[0],left+pad,y+1);doc.text(block.headers[1],left+widths[0]+pad,y+1);y+=11;}
  header();
  for(const row of block.rows){
    doc.setFontSize(9);
    const cells=row.map((text,index)=>doc.splitTextToSize(text,widths[index]-pad*2));
    const height=Math.max(...cells.map(lines=>lines.length))*lineHeight+4;
    if(y+height>bottom){nextPage();header();}
    doc.setFontSize(9);doc.setTextColor('#233d63');doc.text(cells[0],left+pad,y,{lineHeightFactor:1.34});
    doc.setTextColor('#3c4960');doc.text(cells[1],left+widths[0]+pad,y,{lineHeightFactor:1.34});
    y+=height;doc.setDrawColor('#dce0e8');doc.line(left,y-4,right,y-4);
  }
  y+=3;
}
function note(block){
  doc.setFontSize(9.5);const lines=doc.splitTextToSize(block.text,width-12);const height=lines.length*4.6+19;
  ensure(height+3);doc.setFillColor('#f0e8d9');doc.roundedRect(left,y-4,width,height,2,2,'F');doc.setFillColor('#9c8250');doc.rect(left,y-4,1,height,'F');
  y+=3;doc.setFontSize(10);doc.setTextColor('#233d63');doc.text(block.title,left+6,y);y+=7;
  doc.setFontSize(9.5);doc.setTextColor('#3c4960');doc.text(lines,left+6,y,{lineHeightFactor:1.37});y+=lines.length*4.6+10;
}

// Cover.
doc.setFillColor('#14253e');doc.rect(0,0,210,297,'F');
doc.setFillColor('#dfc79c');doc.rect(left,28,23,1.3,'F');doc.setTextColor('#dfc79c');doc.setFontSize(12);doc.text('TRACKLY / USER HANDBOOK',left,46);
doc.setFontSize(37);doc.setTextColor('#fff');doc.text('Your home.',left,84);doc.text('Your records.',left,104);doc.text('All in one place.',left,124);
doc.setFontSize(16);doc.setTextColor('#d0d9e8');doc.text('The detailed how-to-use manual',left,151);
doc.setFontSize(11);doc.text(['From your first belonging to an organized claim.','Practical steps, field explanations, and help when you need it.'],left,170,{lineHeightFactor:1.7});
doc.setDrawColor('#435775');doc.line(left,212,right,212);
doc.setFontSize(11);doc.setTextColor('#dfc79c');doc.text('10 SAMPLE ITEMS + 12 FREE PERSONAL SPACES',left,227);
doc.setTextColor('#d0d9e8');doc.setFontSize(10);doc.text('Home Inventory & Insurance Claim Tracker',left,241);doc.text('Updated '+guide.updated,left,251);
doc.setFontSize(9);doc.text('Includes inventory, evidence, PDFs, backups, phone installation, and FAQs.',left,274);

nextPage(false);const contentsPage=doc.getNumberOfPages();
for(let index=0;index<guide.sections.length;index++){
  const section=guide.sections[index];currentTitle=section.title;nextPage(false);sectionPages.push(doc.getNumberOfPages());
  doc.setTextColor('#795e2e');doc.setFontSize(10);doc.text('CHAPTER '+String(index+1).padStart(2,'0'),left,y);y+=13;
  paragraph(section.title,{size:22,shade:'#1c2c46',after:6});
  paragraph(section.intro,{size:10.5,after:6});
  for(const block of section.blocks){
    if(block.type==='steps'||block.type==='bullets')list(block.items,block.type==='steps');
    else if(block.type==='table')table(block);
    else if(block.type==='note'||block.type==='example')note(block);
    else if(block.type==='subhead'){ensure(24);y+=3;paragraph(block.text,{size:12,shade:'#233d63',after:4});}
    else paragraph(block.text);
  }
}
doc.setPage(contentsPage);y=27;
paragraph('How to use this handbook',{size:24,shade:'#1c2c46',after:8});
paragraph('Start with Chapter 1, or use the contents below to jump to the task you need. Button names match the English app interface. The same chapters are available under How to use inside Trackly.',{size:10.5,after:9});
for(let index=0;index<guide.sections.length;index++){
  doc.setFontSize(10);doc.setTextColor('#795e2e');doc.text(String(index+1).padStart(2,'0'),left,y);
  doc.setTextColor('#233d63');doc.text(guide.sections[index].title,left+12,y);doc.text(String(sectionPages[index]),right,y,{align:'right'});
  doc.link(left,y-4,width,9,{pageNumber:sectionPages[index]});doc.setDrawColor('#dce0e8');doc.line(left,y+4,right,y+4);y+=11;
}
y+=7;paragraph('Use the full Backup JSON file to restore data. PDF reports and this handbook are readable documents, not restorable inventory backups.',{size:9.5,shade:'#606b7c'});
const pages=doc.getNumberOfPages();
for(let page=2;page<=pages;page++){doc.setPage(page);doc.setFontSize(8);doc.setTextColor('#606b7c');doc.setDrawColor('#dce0e8');doc.line(left,281,right,281);doc.text('TRACKLY | How to use',left,287);doc.text(`${page} / ${pages}`,right,287,{align:'right'});}
const output=path.join(root,'output/pdf');fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'trackly-how-to-use.pdf'),Buffer.from(doc.output('arraybuffer')));
console.log(JSON.stringify({chapters:guide.sections.length,pages,sectionPages,html:'how-to-use.html',pdf:'output/pdf/trackly-how-to-use.pdf'},null,2));
