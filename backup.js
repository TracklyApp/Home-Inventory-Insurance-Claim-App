const Backups = (() => {
  const fail = message => { throw new Error(message); };
  function text(value, name, max = 300, required = false) {
    if (value == null && !required) return '';
    if (typeof value !== 'string' || value.length > max || (required && !value.trim())) fail(`Invalid ${name}.`);
    return value.trim();
  }
  function number(value, name) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1e12) fail(`Invalid ${name}.`);
    return value;
  }
  function date(value, name, required = false) {
    const result = text(value, name, 10, required);
    if (result && (!/^\d{4}-\d{2}-\d{2}$/.test(result) || !Number.isFinite(Date.parse(result)) || new Date(result).toISOString().slice(0, 10) !== result)) fail(`Invalid ${name}.`);
    return result;
  }
  function attachment(value, pdf = false) {
    if (!value) return '';
    if (typeof value !== 'string' || value.length > 2800000) fail('An attachment exceeds the 2 MB limit.');
    const match = /^data:(image\/(?:jpeg|png|webp|gif)|application\/pdf);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
    if (!match || (!pdf && match[1] === 'application/pdf')) fail('Unsupported attachment. Only embedded JPEG, PNG, WebP, GIF, and PDF receipts are accepted.');
    let bytes;
    try { bytes = atob(match[2]); } catch { fail('An attachment has invalid encoding.'); }
    const valid = { 'image/jpeg': bytes.startsWith('\xff\xd8\xff'), 'image/png': bytes.startsWith('\x89PNG\r\n\x1a\n'), 'image/webp': bytes.startsWith('RIFF') && bytes.slice(8, 12) === 'WEBP', 'image/gif': /^GIF8[79]a/.test(bytes), 'application/pdf': bytes.startsWith('%PDF-') };
    if (!valid[match[1]]) fail('An attachment does not match its file type.');
    return value;
  }
  function id(value) {
    if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(value) || value.startsWith('sample-')) fail('Invalid record identifier.');
    return value;
  }
  function validate(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !Array.isArray(raw.items) || !Array.isArray(raw.claims)) fail('Choose a Trackly inventory backup JSON file, not a single claim export.');
    if (raw.version != null && raw.version !== 1 && raw.version !== 2) fail('This backup version is not supported.');
    if (!Activation.allows(raw.items.length)) { const error = new Error('This backup contains more than 12 personal items. Enter an activation code to restore it.'); error.code = 'ACTIVATION_REQUIRED'; throw error; }
    if (raw.claims.length > 100) fail('This backup contains too many claims.');
    if (raw.rooms !== undefined && (!Array.isArray(raw.rooms) || raw.rooms.length > 100)) fail('Invalid custom rooms list (maximum 100 rooms).');
    const rooms = (raw.rooms || []).map(value => normalizeRoomName(text(value, 'room name', 60, true)));
    const roomKeys = new Set(roomData.map(room => roomKey(room[0])));
    for (const name of rooms) {
      if (roomKeys.has(roomKey(name))) fail('Duplicate room names in this backup.');
      roomKeys.add(roomKey(name));
    }
    const knownRooms = new Set([...roomData.map(room => room[0]), ...rooms]);
    const items = raw.items.map(item => {
      if (!item || typeof item !== 'object') fail('Invalid inventory record.');
      const result = { id: id(item.id), name: text(item.name, 'item name', 150, true), room: text(item.room, 'room', 100, true), price: number(item.price, 'purchase price'), value: number(item.value, 'replacement value'), category: text(item.category, 'category'), serial: text(item.serial, 'serial number'), date: date(item.date, 'purchase date'), warranty: date(item.warranty, 'warranty date'), insurance: text(item.insurance, 'insurance'), photo: attachment(item.photo), receipt: attachment(item.receipt, true), photoName: text(item.photoName, 'photo filename'), receiptName: text(item.receiptName, 'receipt filename'), icon: '▦' };
      if (!knownRooms.has(result.room)) fail(`Unknown room: ${result.room}.`);
      result.documented = Boolean(result.photo || result.receipt || result.serial);
      return result;
    });
    const ids = new Set(items.map(item => item.id));
    if (ids.size !== items.length) fail('Duplicate inventory identifiers in this backup.');
    const claims = raw.claims.map(claim => {
      if (!claim || typeof claim !== 'object' || !Array.isArray(claim.items) || !claim.items.length || claim.items.some(value => !ids.has(value)) || new Set(claim.items).size !== claim.items.length) fail('A claim references missing or duplicate items.');
      if (!['Draft', 'Submitted', 'Under review', 'Approved', 'Settled', 'Closed'].includes(claim.status)) fail('Invalid claim status.');
      return { id: id(claim.id), incident: text(claim.incident, 'incident title', 300, true), date: date(claim.date, 'incident date', true), insurer: text(claim.insurer, 'insurer'), number: text(claim.number, 'claim number'), status: claim.status, notes: text(claim.notes, 'incident notes', 10000), items: [...claim.items], value: number(claim.value, 'claim value'), payout: number(claim.payout, 'payout'), evidence: attachment(claim.evidence), evidenceName: text(claim.evidenceName, 'evidence filename') };
    });
    if (new Set(claims.map(claim => claim.id)).size !== claims.length) fail('Duplicate claim identifiers in this backup.');
    return { version: 2, rooms, items, claims };
  }
  return { validate, attachment };
})();

(() => {
  const dialog = document.querySelector('#backup-dialog');
  const picker = document.querySelector('#backup-file');
  const preview = document.querySelector('#backup-preview');
  const confirm = document.querySelector('#backup-confirm');
  const apply = document.querySelector('#restore-backup');
  const error = document.querySelector('#backup-error');
  let candidate = null;
  let generation = 0;
  document.querySelector('#import-backup').onclick = () => {
    generation++; candidate = null; picker.value = ''; confirm.checked = false; apply.disabled = true;
    preview.textContent = 'Choose a backup to review its contents before restoring.'; error.textContent = '';
    dialog.showModal();
  };
  document.querySelector('#close-backup').onclick = () => dialog.close();
  picker.onchange = async () => {
    const current = ++generation;
    candidate = null; confirm.checked = false; apply.disabled = true; error.textContent = '';
    const file = picker.files[0];
    if (!file) return;
    preview.textContent = 'Checking backup…';
    try {
      if (file.size > 12 * 1024 * 1024) throw new Error('Choose a backup smaller than 12 MB.');
      await Activation.ready;
      const parsed = Backups.validate(JSON.parse(await file.text()));
      if (current !== generation) return;
      candidate = parsed;
      const photos = parsed.items.reduce((sum, item) => sum + Number(Boolean(item.photo)) + Number(Boolean(item.receipt)), 0) + parsed.claims.filter(claim => claim.evidence).length;
      preview.textContent = `${parsed.items.length} personal items · ${parsed.rooms.length} custom rooms · ${parsed.claims.length} claims · ${photos} attachments · ${money(parsed.items.reduce((sum, item) => sum + item.value, 0))} replacement value. Restoring replaces your current ${data.items.length} items, ${(data.rooms || []).length} custom rooms, and ${data.claims.length} claims.`;
    } catch (failure) {
      if (current !== generation) return;
      preview.textContent = 'Your current inventory has not been changed.';
      error.textContent = failure instanceof SyntaxError ? 'This file is not valid JSON.' : failure.message;
      if (failure.code === 'ACTIVATION_REQUIRED') Activation.open(() => picker.onchange());
    }
  };
  confirm.onchange = () => { apply.disabled = !candidate || !confirm.checked; };
  document.querySelector('#download-before-restore').onclick = () => document.querySelector('#export').click();
  apply.onclick = () => {
    if (!candidate || !confirm.checked) return;
    try { Backups.validate(candidate); }
    catch (failure) { error.textContent = failure.message; if (failure.code === 'ACTIVATION_REQUIRED') Activation.open(() => picker.onchange()); return; }
    // localStorage.setItem is atomic: a quota failure leaves the old backup intact.
    if (!persist(candidate)) { error.textContent = 'There is not enough device storage to restore this backup. Your existing inventory is unchanged.'; return; }
    candidate = null; inventoryMode = 'personal'; navigate('inventory'); dialog.close(); notify('Backup restored with its items, claims, and attachments');
  };
})();
