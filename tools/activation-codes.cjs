// Owner-only utility. Never publish .local-license/ or the private signing key.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const folder = path.join(root, '.local-license');
const privateFile = path.join(folder, 'private-key.pem');
const publicFile = path.join(root, 'activation-key.js');

function issue(privateKey, customer) {
  const payload = Buffer.from(JSON.stringify({v:1, app:'trackly-home', plan:'unlimited', id:crypto.randomUUID(), customer})).toString('base64url');
  const message = 'TRACKLY1.' + payload;
  const signature = crypto.sign('sha256', Buffer.from(message), {key:privateKey, dsaEncoding:'ieee-p1363'}).toString('base64url');
  return message + '.' + signature;
}

if (require.main === module) {
  try {
    const [command, customer = 'Trackly customer'] = process.argv.slice(2);
    if (command === 'init') {
      if (fs.existsSync(privateFile) || fs.existsSync(publicFile)) throw Error('Keys already exist. Keep them: replacing keys invalidates issued codes.');
      fs.mkdirSync(folder, {recursive:true});
      const keys = crypto.generateKeyPairSync('ec', {namedCurve:'prime256v1'});
      fs.writeFileSync(privateFile, keys.privateKey.export({type:'pkcs8',format:'pem'}), {flag:'wx',mode:0o600});
      fs.writeFileSync(publicFile, '// Public verification key only. The signing key stays with the app owner.\nconst ACTIVATION_PUBLIC_KEY = Object.freeze(' + JSON.stringify(keys.publicKey.export({format:'jwk'})) + ');\n', {flag:'wx'});
      console.log('Created local signing key and public app verification key. Back up .local-license/ privately.');
    } else if (command === 'issue') {
      if (!customer.trim() || customer.length > 120) throw Error('Use a customer label of 1–120 characters.');
      const code = issue(fs.readFileSync(privateFile, 'utf8'), customer.trim());
      const output = path.join(folder, 'code-' + crypto.randomUUID() + '.txt');
      fs.writeFileSync(output, code + '\n', {flag:'wx',mode:0o600});
      console.log('Activation code saved to ' + output);
    } else {
      throw Error('Usage: node tools/activation-codes.cjs init | issue "Customer label"');
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = {issue};
