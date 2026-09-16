# Mobile release verification

Automated checks passed for menu behavior, touch-control layout rules, installation events, HTTPS/local-file handling, iOS standalone detection, and cached offline navigation. These tests use simulated browser primitives. They do not measure a rendered mobile viewport or verify installation on a real phone.

No browser or physical Android/iPhone was connected in the development session. The following real-device checks remain pending until the app has an HTTPS link:

1. Open in Android Chrome and iPhone Safari at 320-430 px portrait widths; check both themes and landscape. Only the inventory table should scroll horizontally.
2. Open the hamburger menu, navigate, and edit the profile. Confirm the menu closes and keyboard focus remains usable.
3. Add a camera photograph and a receipt. Check portrait orientation, preview, compression size, and readable receipt text. Save, edit, replace, remove, cancel, and reload.
4. Export a backup, change an item, then import the backup. Review the summary and confirm replacement. Repeat with malformed JSON and cancel; current records must remain unchanged.
5. Export inventory and claim PDFs; save them to Files/Downloads and reopen. Check diacritics, long notes, photos, cent values, and page numbers.
6. Install through Chrome's install prompt / menu and Safari's Share → Add to Home Screen. On iPhone enable Open as Web App when offered.
7. After an online load finishes, close the app, enable airplane mode, and reopen the installed app. Navigate, add/edit a personal record, reopen, and export both a backup and PDF. Remote room photos may be unavailable.
8. Reconnect, close all app tabs, and reopen to activate the newest service-worker cache. Confirm inventory survives the update.

Do not mark these physical-device checks complete based only on the Node test results.

## Activation

- At 12 personal items, Add item opens activation. Cancel returns to existing inventory.
- Paste a valid owner-supplied test code; item 13 can be saved. Reopen the installed app offline and verify Activated remains.
- Invalid codes show an inline error; the keyboard, close button, and Activate button remain usable at narrow widths in both themes.
- A backup with 13 items prompts for activation, then still requires replacement confirmation.
