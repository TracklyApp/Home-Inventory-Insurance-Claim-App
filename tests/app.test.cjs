const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

function app(saved, options = {}) {
  const elements = new Map();
  const storage = new Map(saved ? [['trackly-home-v1', JSON.stringify(saved)]] : []);
  if(options.activation) storage.set('trackly-activation-v1', options.activation);
  let nextId = 0;
  const get = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      innerHTML: '', textContent: '', style: {}, dataset: {}, disabled: false,
      querySelectorAll: () => [], querySelector: selector => get(selector), addEventListener(event, fn) { this['on'+event]=fn; }, focus() {}, classList: { toggle() {} },
      click() { this.onclick?.({currentTarget:this}); },
      showModal() { this.open = true; }, close() { this.open = false; }
    });
    return elements.get(selector);
  };
  const context = vm.createContext({
    console, Intl, setTimeout: () => 0, clearTimeout() {},
    crypto: { subtle:require('node:crypto').webcrypto.subtle, randomUUID: () => `test-${++nextId}` },
    TextEncoder, TextDecoder, atob,
    FormData: class { constructor(values) { this.values = values; } get(key) { return this.values[key] ?? ''; } getAll(key) { return this.values[key] ?? []; } },
    Attachments: { field: (kind, label) => `<label>${label}</label>`, bind: (host, item, kinds) => ({ values: () => Object.fromEntries(kinds.flatMap(kind => [[kind,item[kind]||''],[`${kind}Name`,item[`${kind}Name`]||'']])), dispose() {} }) },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => { if(options.failWrites) throw new Error('Storage full'); storage.set(key, value); } },
    document: { querySelector: get, querySelectorAll: () => [], addEventListener() {} }
  });
  if(options.publicKey) vm.runInContext('const ACTIVATION_PUBLIC_KEY = '+JSON.stringify(options.publicKey),context);
  else new vm.Script(fs.readFileSync(path.join(root,'activation-key.js'),'utf8')).runInContext(context);
  new vm.Script(fs.readFileSync(path.join(root,'activation.js'),'utf8')).runInContext(context);
  new vm.Script(fs.readFileSync(path.join(root, 'manual.js'), 'utf8')).runInContext(context);
  new vm.Script(source).runInContext(context);
  return { get, storage, context, run: code => vm.runInContext(code, context) };
}
const values = name => ({ name, room: 'Kitchen', price: '100', value: '150', photoFile: { size: 0 }, receiptFile: { size: 0 } });
const submit = (a, form) => a.get('#form').onsubmit({ preventDefault() {}, target: form });

async function main() {
  const a = app();
  assert.equal(a.run('samples.length'), 10);
  assert.equal(a.run('samples.reduce((sum,item)=>sum+item.value,0)'), 87450);
  assert.equal(a.run('data.items.length'), 0);
  a.run("inventoryMode='personal';render()");
  assert.match(a.get('#content').innerHTML, /\$0/);
  for (let index = 0; index < 12; index++) {
    a.run('openItem()');
    await submit(a, values(`Personal item ${index}`));
  }
  assert.equal(a.run('data.items.length'), 12);
  assert.equal(a.get('#add').disabled, false);
  a.run('openItem()');
  assert.equal(a.get('#modal').open, false);
  // Reusing a previously open form must not bypass the quota.
  await submit(a, values('Thirteenth item'));
  assert.equal(a.run('data.items.length'), 12);
  a.run('openItem(data.items[0].id)');
  await submit(a, values('Edited personal item'));
  assert.equal(a.run('data.items.length'), 12);
  assert.equal(a.run('data.items[0].name'), 'Edited personal item');
  a.run("navigate('inventory');roomFilter='Kitchen';search='Edited';updateTable()");
  assert.match(a.get('#inventory-table').innerHTML, /Edited personal item/);
  assert.doesNotMatch(a.get('#inventory-table').innerHTML, /Personal item 0/);
  const reloaded = app(JSON.parse(a.storage.get('trackly-home-v1')));
  assert.equal(reloaded.run('data.items.length'), 12);
  assert.equal(reloaded.run('inventoryMode'), 'personal');
  a.run('openClaim()');
  assert.doesNotMatch(a.get('#fields').innerHTML, /sample-/);
  await submit(a, { incident: 'Water damage', date: '2026-09-14', insurer: 'Test insurer', status: 'Submitted', payout: '25', items: ['test-10'], evidence: { size: 0 } });
  assert.equal(a.run('data.claims[0].value'), 150);
  a.run("removeItem('test-10')");
  assert.equal(a.run('data.items.length'), 12);
  a.run("removeItem('test-1')");
  assert.equal(a.run('data.items.length'), 12);
  a.run("removeItem('test-1')");
  assert.equal(a.run('data.items.length'), 11);
  a.run("openItem('sample-1')");
  await submit(a, values('My own sofa'));
  assert.equal(a.run('data.items.length'), 12);
  assert.equal(a.run('samples[0].name'), 'Linen sectional sofa');
  assert.equal(a.run('data.items.some(item=>item.id.startsWith("sample-"))'), false);
  const legacy = a.run('JSON.parse(JSON.stringify({items:seed,claims:[]}))');
  assert.equal(app(legacy).run('data.items.length'), 0);
  legacy.items[0].name = 'User edited sofa';
  legacy.claims = [{ items: ['11'], id: 'old-claim' }];
  const migrated = app(legacy);
  assert.equal(migrated.run('data.items.length'), 2);
  assert.equal(migrated.run('data.items.find(item=>item.id==="11").name'), 'Dining collection');
  for (const page of ['overview', 'inventory', 'rooms', 'documents', 'claims', 'help']) {
    a.run(`navigate('${page}')`);
    assert.ok(a.get('#content').innerHTML);
  }
  assert.equal(a.get('.actions').hidden,true);
  assert.match(a.get('#content').innerHTML,/Download manual PDF/);
  a.run("navigate('inventory')");
  assert.equal(a.get('.actions').hidden,false);
  console.log('PASS inventory: 10 samples, 12-item activation limit, edit, copy, removal, claim links, totals, filters, persistence and migration');

  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest')));
  assert.equal(manifest.display, 'standalone');
  for (const icon of manifest.icons) {
    const png = fs.readFileSync(path.join(root, icon.src));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    const [width, height] = icon.sizes.split('x').map(Number);
    assert.equal(png.readUInt32BE(16), width);
    assert.equal(png.readUInt32BE(20), height);
  }
  const swSource = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const cachedAssets = vm.runInNewContext(swSource + ';ASSETS', { self: { addEventListener() {} } });
  for (const asset of cachedAssets) assert.ok(fs.existsSync(path.join(root, asset)), asset);
  const installSource = fs.readFileSync(path.join(root, 'install.js'), 'utf8');
  const events = {};
  const controls = {};
  const control = selector => controls[selector] ??= { addEventListener(name, callback) { this[name] = callback; }, showModal() { this.open = true; }, close() { this.open = false; } };
  let registered = false;
  vm.runInNewContext(installSource, {
    document: { querySelector: control }, location: { protocol: 'https:' },
    navigator: { serviceWorker: { register: async () => { registered = true; } } },
    window: { isSecureContext: true, matchMedia: () => ({ matches: false, addEventListener() {} }), addEventListener: (name, callback) => events[name] = callback }
  });
  assert.ok(registered);
  await control('#install-app').click();
  assert.equal(control('#install-dialog').open, true);
  let prompted = 0;
  events.beforeinstallprompt({ preventDefault() {}, prompt: async () => prompted++, userChoice: Promise.resolve({ outcome: 'dismissed' }) });
  await control('#install-app').click();
  assert.equal(prompted, 1);
  assert.equal(control('#install-app').disabled, false);
  events.appinstalled();
  assert.equal(control('#install-app').disabled, true);
  console.log('PASS PWA: manifest, PNG dimensions, offline asset paths, service-worker registration, install help, native prompt and installed state');
}
module.exports = main();
module.exports.app = app;
module.exports.submit = submit;
module.exports.values = values;
if (require.main === module) module.exports.catch(error => { console.error(error); process.exitCode = 1; });
