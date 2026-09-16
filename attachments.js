/* All processing stays on the device. No image is uploaded to a server. */
const Attachments = (() => {
  const MAX_INPUT = 20 * 1024 * 1024;
  const MAX_PDF = 2 * 1024 * 1024;
  const MAX_IMAGE = 650 * 1024;
  const read = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the attachment.'));
    reader.readAsDataURL(file);
  });
  const loadImage = url => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('This image cannot be opened. Use a JPEG, PNG, or WebP image. For HEIC, export it as JPEG first.'));
    img.src = url;
  });
  async function compress(file, receipt = false) {
    if (file.size > MAX_INPUT) throw new Error('Choose a photograph smaller than 20 MB.');
    if (!/^image\/(jpeg|png|webp|gif|heic|heif)$/i.test(file.type)) throw new Error('Choose a JPEG, PNG, WebP, or supported phone photo.');
    const url = URL.createObjectURL(file);
    let img;
    try { img = await loadImage(url); } finally { URL.revokeObjectURL(url); }
    if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth * img.naturalHeight > 60000000) throw new Error('This image is too large to process. Choose a smaller copy.');
    const canvas = document.createElement('canvas');
    const maximum = receipt ? 2200 : 1600;
    const scale = Math.min(1, maximum / Math.max(img.naturalWidth, img.naturalHeight));
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing is unavailable in this browser.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    let blob;
    for (const quality of [0.88, 0.78, 0.66, 0.54]) {
      blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (!blob) throw new Error('Could not compress this photograph.');
      if (blob.size <= MAX_IMAGE) break;
    }
    if (blob.size > MAX_IMAGE) throw new Error('This image is still too large. Crop it or choose a smaller copy.');
    const value = await read(blob);
    canvas.width = canvas.height = 1;
    return { value, name: file.name.replace(/\.[^.]+$/, '') + '.jpg', size: blob.size, originalSize: file.size };
  }
  async function prepare(file, kind) {
    if (kind === 'receipt' && file.type === 'application/pdf') {
      if (file.size > MAX_PDF) throw new Error('Choose a PDF receipt smaller than 2 MB.');
      const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
      if (String.fromCharCode(...signature) !== '%PDF-') throw new Error('This file is not a valid PDF receipt.');
      return { value: await read(file), name: file.name, size: file.size, originalSize: file.size };
    }
    return compress(file, kind === 'receipt');
  }
  function field(kind, label) {
    return `<section class="attachment-editor full"><label>${label}<input type="file" data-attachment-input="${kind}" accept="${kind === 'receipt' ? 'image/*,application/pdf' : 'image/*'}"></label><div data-attachment-preview="${kind}"></div></section>`;
  }
  function bind(host, initial, kinds) {
    const state = {};
    let pending = 0;
    let disposed = false;
    let errors = new Set();
    const submit = document.querySelector('#form button[type="submit"]');
    function paint(kind) {
      const preview = host.querySelector(`[data-attachment-preview="${kind}"]`);
      const attachment = state[kind];
      preview.replaceChildren();
      if (!attachment.value) return;
      if (attachment.value.startsWith('data:image/')) {
        const image = document.createElement('img');
        image.className = 'attachment-preview';
        image.src = attachment.value;
        image.alt = kind === 'receipt' ? 'Receipt preview' : 'Photograph preview';
        preview.append(image);
      }
      const link = document.createElement('a');
      link.className = 'attachment';
      link.textContent = attachment.value.startsWith('data:application/pdf') ? 'Download PDF receipt to preview' : 'Open / download image';
      link.href = attachment.value;
      link.download = attachment.name || `${kind}.jpg`;
      preview.append(link);
      const caption = document.createElement('small');
      caption.textContent = attachment.size ? `Saved size: ${Math.ceil(attachment.size / 1024)} KB${attachment.originalSize > attachment.size ? ` (from ${Math.ceil(attachment.originalSize / 1024)} KB)` : ''}. Check that the details are readable.` : 'Check that the details are readable before saving.';
      preview.append(caption);
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'text-button remove-item'; remove.textContent = 'Remove attachment';
      remove.onclick = () => { state[kind] = { value: '', name: '' }; errors.delete(kind); host.querySelector(`[data-attachment-input="${kind}"]`).value = ''; paint(kind); };
      preview.append(remove);
    }
    for (const kind of kinds) {
      state[kind] = { value: initial[kind] || '', name: initial[`${kind}Name`] || '' };
      paint(kind);
      const input = host.querySelector(`[data-attachment-input="${kind}"]`);
      input.onchange = async () => {
        if (!input.files[0]) return;
        pending++; submit.disabled = true; input.disabled = true;
        const preview = host.querySelector(`[data-attachment-preview="${kind}"]`);
        preview.textContent = 'Preparing attachment…';
        try {
          const result = await prepare(input.files[0], kind);
          if (!disposed) { state[kind] = result; errors.delete(kind); paint(kind); }
        } catch (error) {
          if (!disposed) {
            errors.add(kind); paint(kind);
            const message = document.createElement('p'); message.className = 'form-error'; message.setAttribute('role', 'alert'); message.textContent = error.message; preview.append(message);
            const discard = document.createElement('button'); discard.type = 'button'; discard.className = 'text-button'; discard.textContent = 'Discard failed upload';
            discard.onclick = () => { errors.delete(kind); input.value = ''; paint(kind); }; preview.append(discard);
          }
        } finally { pending--; if (!disposed) { input.disabled = false; submit.disabled = pending > 0; } }
      };
    }
    return {
      values() {
        if (pending) throw new Error('Please wait for the photograph to finish processing.');
        if (errors.size) throw new Error('Replace or remove the attachment that could not be processed.');
        return Object.fromEntries(kinds.flatMap(kind => [[kind, state[kind].value], [`${kind}Name`, state[kind].name]]));
      },
      dispose() { disposed = true; }
    };
  }
  return { prepare, compress, loadImage, field, bind };
})();
