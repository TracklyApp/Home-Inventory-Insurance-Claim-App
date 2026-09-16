# Trackly — Home Inventory & Insurance Claim Tracker

Open `index.html` in a modern browser for a local preview. No installation or build step is required. Phone installation requires hosting the files together on an HTTPS static website; opening the local file does not support PWA installation.

The responsive prototype includes an overview, six starter rooms plus custom rooms, searchable inventory, item editing, photograph and receipt uploads, warranty and insurance fields, claim creation and status updates, payouts, incident photos, backup export/import, and downloadable inventory and claim PDF reports.

## User manual

Choose **How to use** in the sidebar or the phone's hamburger menu. The guide includes 15 searchable chapters with field explanations, examples, backup/restore steps, attachment limits, claim workflows, phone installation, and troubleshooting.

Separate versions are available as `how-to-use.html` (self-contained HTML with embedded styling and search) and `output/pdf/trackly-how-to-use.pdf` (a clickable contents page). Both are linked from the in-app guide and cached for offline access after a successful online setup. If the HTML file is copied elsewhere, its content and search still work; links back to the app/PDF require those relative files to remain available.

All versions share their content in `manual.js`. After editing the manual, run `node tools/build-manual.cjs`, visually check the generated PDF, and bump the cache version in `sw.js` before deployment.

The app has two inventory views: 10 illustrative sample records totaling $87,450, and a personal inventory with 12 free client records, followed by activation to remove the item count limit. Samples do not count toward the personal limit or personal totals. Opening a sample offers a copy into a personal space. Personal records can be edited at the limit or removed to free a space. Items linked to claims cannot be deleted until unlinked. Claims and exports use personal records only.

Data is saved in localStorage in the current browser. On upgrade, untouched old demonstration records are replaced by the separate samples; edited records and records referenced by existing claims are preserved. Previously saved personal records above the new limit are retained, but additions above 12 require activation. Documentation indicators are not insurance coverage assessments. Changes to a claim's selected items recalculate its value when saved.

## Install on a phone

Deploy only the website files, including `icons/`, `vendor/`, `output/pdf/`, the manual files, `manifest.webmanifest`, and `sw.js`, to an HTTPS static host. Keep the directory structure intact so offline setup can find all cached files. No domain or hosting account has been configured by this change. The paths also support deployment in a subdirectory. Development-only `tmp/`, `tests/`, and `tools/` directories are not required by the website.

- Android: visit the HTTPS link in Chrome, then tap **Install app**. If a native prompt is not available, use the browser menu's **Install app** or **Add to Home screen** option.
- iPhone/iPad: visit the HTTPS link in Safari, choose **Share → Add to Home Screen**, enable **Open as Web App** if shown, and tap **Add**.

After the first successful online load and service-worker setup, the app shell works offline. Uploaded attachments are saved with inventory on the same device. Remote room photos and fonts are not cached. Installation does not synchronize or transfer data between devices. A local `localhost` server can test the PWA on a desktop; a phone accessing a LAN HTTP address still needs HTTPS for PWA features.

The service worker waits for existing tabs to close before activating an updated version. Bump `CACHE` in `sw.js` when deploying changed shell assets.

## Verification

Run these commands with Node.js:

```
node tests/features.test.cjs
node tests/mobile.test.cjs
node tests/pdf.test.cjs
```

The feature suite also runs the existing inventory and PWA tests. It checks import validation and explicit replacement, atomic storage failures, attachment compression and removal, and offline fallbacks. The PDF suite uses the bundled library and font to generate actual sample PDFs under `tmp/pdf-qa/`, including images, Romanian text, long notes, and 10 records. Sample reports were rendered with Poppler and visually inspected during development.

Mobile tests simulate browser controls; they do not test a rendered viewport or install on a real device. A browser and physical Android/iPhone were unavailable. See `tests/MOBILE-QA.md` for the pending release checks after HTTPS hosting is available.

## Backups

Use **Backup** to download personal inventory, claims, and embedded attachments as JSON. Use **Import backup**, select that file, review its totals and attachment counts, then explicitly confirm replacement and choose **Restore backup**. The import dialog also lets you download the current backup first. Import replaces personal items, custom rooms, and claims; it does not merge or change your profile/theme.

Malformed files, unsupported attachments, invalid prices/dates, duplicate IDs, and broken claim references are rejected before changing data. Backups with more than 12 items require activation. A storage failure leaves the previous inventory intact. Import accepts full inventory backups up to 12 MB, not individual claim exports. Sample data is separate and cannot be imported into personal slots by using sample IDs.

## Photographs and receipts

Select a photograph in an item or claim form to see a preview before saving. Upload processing happens locally. Photos up to 20 MB are resized to a maximum long edge of 1600 px (2200 px for image receipts), converted to JPEG, and compressed to at most 650 KB. Check receipt legibility in the preview. JPEG, PNG, WebP, and GIF are supported; HEIC/HEIF depends on the browser's decoder, with an explanatory error when unavailable. Keep your original full-resolution files separately.

PDF receipts up to 2 MB are retained in their original format and can be downloaded to preview. Use **Remove attachment** or choose a replacement, then **Save**; Cancel leaves the stored record unchanged. Uploaded images and receipts share the browser's storage quota. Storage failures keep the form open and preserve previously saved records. Export regularly.

## PDF reports

**Inventory PDF** exports personal items only. **Claim PDF** on a claim card exports incident details, claim number, insurer, status, saved claim value, payout, and the selected items. Both include serial numbers, purchase dates/prices, replacement values, warranty/policy details, and separate image evidence pages. Reports support Romanian diacritics, long notes, pagination, and cent values. The name saved in Edit profile is used as the report owner.

Image receipts are printed in the report. Existing PDF receipt pages are not merged; their filenames and retrieval instructions are included, and the original PDFs remain in the JSON backup. A claim report distinguishes its saved claim value from current item replacement values when they differ. Reports do not submit anything to an insurer.

The PDF dependencies are bundled in `vendor/` so generation works offline after the app shell is cached, and also works from the local preview. They are jsPDF 4.2.1 (MIT, https://github.com/parallax/jsPDF) and Noto Sans (SIL Open Font License, https://github.com/notofonts/noto-fonts). License files are included. Do not remove these files when deploying.

Cloud synchronization, authentication, and insurer submission are not implemented. Do not use this prototype as your only record of important belongings.

Room photographs load from Unsplash; fonts load from Google Fonts. The core interface and local data features do not require these resources.

## Custom rooms

Choose **Rooms → Add room**, or **Add room** below the Room selector in an item form. A new room is saved locally and appears in personal room cards, filters, and item selectors. Inline room creation preserves the item draft and selects the new room. Names are normalized, unique (case-insensitive), and 1–60 characters long. Up to 100 custom rooms are supported; rooms do not consume any item spaces. Samples keep their original rooms. Custom rooms, including empty ones, are included in full backups and restored together with their items. Older backups without a rooms list still work.

Run `node tests/rooms.test.cjs` to check room creation, inline selection, persistence, backup restoration, duplicate names, and storage failures.

## Activation after 12 items

Clients can save 12 personal items without a code. Add item (including copying a sample) opens the activation dialog before item 13. Existing items remain editable and exportable. A valid signed code removes the item-count limit; browser storage and attachment/import size limits still apply. More-than-12-item backups require activation and explicit replacement confirmation. Activation persists separately from inventory and must be entered again on a new device or after clearing site storage.

Owner instructions are in ACTIVATION-OWNER.md. Use node tools/activation-codes.cjs issue "Customer label" to create a customer code locally. The private key is in .local-license/, excluded from Git; never host or distribute that folder. Keep activation-key.js and activation.js with the website.

Codes are checked offline using ECDSA P-256 signatures. This static app cannot enforce one-device use, online revocation, payment status, or resist a user editing the app code. Strong commercial enforcement requires server-side licensing. No payment provider or online license server is configured.

Run node tests/activation.test.cjs for signature verification, the 12/13-item boundary, unlock/reload, invalid codes, storage failures, backup gating, and retained over-limit records.
