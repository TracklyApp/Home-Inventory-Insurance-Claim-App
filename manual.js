/* Shared source for the in-app guide, standalone HTML, and PDF manual. */
const Manual = (() => {
  const updated = '15 September 2026';
  const sections = [
    { id:'start', title:'Quick start: your first inventory', intro:'Trackly keeps a room-by-room record of your belongings and helps you organize insurance claim information. This edition includes 10 sample items and 12 free personal items, with activation to add more. Start with one real belonging, then build up your inventory.', blocks:[
      {type:'steps',items:[
        'Open the app. For a local computer preview, open index.html from the project folder. For phone installation, use the published HTTPS website link when it is available.',
        'Select My inventory. A new personal inventory starts empty. The 10 examples under Sample inventory are for demonstration only.',
        'Select Add item. Enter a descriptive name, choose a room, and enter the purchase price and replacement value in US dollars.',
        'Add the serial number, purchase date, warranty date, and insurance details if you have them. You can return and complete these later.',
        'Choose an item photograph and, if available, a receipt. Wait for processing to finish, then check that the preview is readable.',
        'Select Save. The item appears in your personal inventory and its replacement value is included in your household total.',
        'Select Backup to download a JSON copy of your inventory, claims, and saved attachments. Store it somewhere you can find again.',
        'Open Overview to check your totals. To change the display name, click the profile at the bottom of the sidebar, or use the phone menu > Edit profile.'
      ]},
      {type:'note',title:'Your first backup',text:'Do this after entering real information. The app stores records in this browser on this device. A downloaded backup is what lets you restore them later or move them to another device.'},
      {type:'example',title:'A useful item name',text:'Use a name such as “Samsung Frame TV 55-inch” instead of “TV”. Add its serial number in the separate field so it is easier to identify and search for.'}
    ]},
    { id:'navigation', title:'Find your way around', intro:'On a computer, use the left sidebar. On a phone, tap the three-line menu button to open navigation. Choosing a page closes that menu. You can also close it by tapping the button again or tapping outside the menu.', blocks:[
      {type:'table',headers:['Page or control','What it does'],rows:[
        ['Overview','Shows household replacement value, item count, documentation percentage, active claims, rooms, and recently added items.'],
        ['Home inventory','Lists items in the selected sample or personal inventory. Search by name, serial number, or category, and filter by room.'],
        ['Rooms','Shows the six starter rooms and your custom rooms. Use Add room to create a space, or select a card to open its filtered inventory.'],
        ['Insurance claims','Create and manage incidents, selected personal items, claim information, status, and payout.'],
        ['Documents','Shows items with supporting details or a warranty date. Open an item to view or manage its attachments.'],
        ['How to use','Opens this manual. Search its chapters, download the PDF, or open the separate HTML guide.'],
        ['Light / Dark','Changes the appearance. On a narrow phone screen these controls appear as sun and moon icons.'],
        ['Install app','Offers installation when supported, or displays instructions for your browser.']
      ]},
      {type:'note',title:'Read the dashboard in the right mode',text:'Household value, rooms, item count, and documentation percentage follow Sample inventory or My inventory. Active claims always refer to your personal claims. Settled and Closed claims do not count as active.'},
      {type:'text',text:'Household value is the sum of the replacement values you entered; it is not a live valuation or an insurance coverage limit. Most on-screen amounts are rounded to whole dollars. The PDF reports show cents.'}
    ]},
    { id:'samples', title:'Samples and your 12 free spaces', intro:'Sample inventory contains 10 demonstration records. My inventory is your own separate collection, with 12 free personal records before activation. The counter, such as My inventory · 3/12, tells you how many personal spaces are used.', blocks:[
      {type:'steps',items:[
        'Choose Sample inventory to explore the example rooms, fields, and values.',
        'Open a sample item using its arrow button at the end of the row. The dialog is titled Add this example to my inventory.',
        'Review all copied fields. Change the name, purchase date, prices, and other values so they describe your real belonging. Enter your actual serial number and policy information.',
        'Save to create a personal copy. It uses one of your 12 free spaces, and the sample stays unchanged.'
      ]},
      {type:'subhead',text:'Add your own rooms'},
      {type:'steps',items:['Open Rooms and select Add room. Enter a name, such as Bathroom, Nursery, or Guest bedroom, then select Save room.','Alternatively, select Add room below the Room selector in an item form. Saving the room selects it in that form and keeps your unsaved item details.','Custom rooms appear in My inventory, room filters, and item selectors. They do not use any item spaces. Room names must be unique and between 1 and 60 characters; up to 100 custom rooms are supported.']},
      {type:'note',title:'When all 12 free spaces are used',text:'Add item asks for an activation code before adding a 13th item. A valid code removes the item limit. You can still edit, export, and manage existing records. Importing more than 12 items also requires activation. See the activation chapter for steps.'},
      {type:'text',text:'Personal totals, claim selections, backups, and PDF exports do not include the sample records. If you export while viewing samples, the export still uses your personal inventory. Add real personal items before requesting an Inventory PDF.'}
    ]},
    { id:'item-fields', title:'Add an item: every field explained', intro:'Choose Add item from an inventory page. Fill in the form, attach supporting files if available, and select Save. Fields you do not yet know can be completed later, except the required name and prices. The room is selected from the available list.', blocks:[
      {type:'table',headers:['Field','What to enter'],rows:[
        ['Item name','A clear name, ideally including the brand or model. Required; up to 150 characters.'],
        ['Room','Choose a starter or custom room. Use Add room below the selector to create and select a new room without losing this item draft.'],
        ['Category','A label such as Furniture, Electronics, Appliances, or Equipment. You can type your own category.'],
        ['Serial number','The manufacturer’s identifier from the product label, packaging, or receipt. Copy it carefully.'],
        ['Purchase date','The date you bought the item. Leave it empty if unknown rather than inventing a date.'],
        ['Purchase price ($)','The amount originally paid. Enter a non-negative number; cents are supported. This field is required.'],
        ['Replacement value ($)','Your estimate for replacing the item. Required; this value contributes to the household total and the value of a claim when saved.'],
        ['Warranty expires','The end date recorded in your warranty. Saving it does not schedule a reminder.'],
        ['Insurance policy / insurer','The policy reference, insurer name, or a short description you want to keep with this item.'],
        ['Item photograph','One image showing the belonging. See the attachment chapter for processing and limits.'],
        ['Receipt','One image or PDF receipt. You can replace or remove it later.']
      ]},
      {type:'note',title:'Currency and documentation',text:'This edition uses USD throughout and does not convert currencies. An item is marked Documented when it has a saved photograph, receipt, or serial number. That label does not mean an insurer has verified the item or accepted its evidence.'}
    ]},
    { id:'attachments', title:'Photographs, receipts, and incident evidence', intro:'Each item has one photograph and one receipt slot. Each claim has one incident photograph slot. Processing takes place on your device; these files are not uploaded to a Trackly server.', blocks:[
      {type:'steps',items:[
        'Open an item or claim and choose a file in the appropriate attachment field. On a phone, the file picker may offer the camera or photo library.',
        'Wait while Preparing attachment is displayed. Save is temporarily disabled during processing.',
        'Inspect the preview. Check the item, serial label, or receipt text for clarity. The saved file size is shown after processing.',
        'For a PDF receipt, use Download PDF receipt to preview to open the original file in your device’s PDF viewer.',
        'Select Save to keep the attachment with the record. Cancel leaves the previously saved record unchanged.'
      ]},
      {type:'table',headers:['File type','Limits and processing'],rows:[
        ['Item or incident photo','Input up to 20 MB. JPEG, PNG, WebP, and GIF images are converted to a still JPEG, resized to a maximum long edge of 1600 px, and compressed to at most 650 KB. Extremely large image dimensions are rejected.'],
        ['Image receipt','Input up to 20 MB. Maximum long edge is 2200 px to retain more text detail, with the same 650 KB output cap.'],
        ['PDF receipt','Up to 2 MB. Kept as the original PDF; its file signature is checked.'],
        ['HEIC / HEIF phone photo','Works only when the browser can decode it. If rejected, export a JPEG copy from your photo app and choose that file.']
      ]},
      {type:'subhead',text:'Replace or remove a file'},
      {type:'text',text:'Choose another file to replace the current attachment, or choose Remove attachment under its preview. These are draft changes until you select Save. If processing fails, choose Discard failed upload to return to the previous attachment, or select a supported replacement.'},
      {type:'note',title:'Keep the originals',text:'Compression reduces detail. Keep the original photos and receipts separately, especially if you may need them for a claim. If a receipt is hard to read, try a clearer or cropped image, or upload the original PDF receipt.'}
    ]},
    { id:'edit', title:'Search, edit, and remove belongings', intro:'Open Home inventory and select My inventory to work with your own records. The search box and room selector work together.', blocks:[
      {type:'steps',items:[
        'Type part of the item name, serial number, or category into Search your belongings. Use All rooms to search the complete selected inventory.',
        'Select a room in the dropdown to narrow the results. If an item disappears, clear the search and return to All rooms.',
        'Select the arrow at the end of an item row to open Item details.',
        'Change fields or attachments and choose Save. Choose Cancel to discard the draft edits.',
        'To delete a personal item, open its details and choose Remove item. Press the confirmation button that appears to complete removal.'
      ]},
      {type:'note',title:'Items already used in a claim',text:'Trackly blocks deletion while any claim references the item. Open each relevant claim with Manage claim and deselect the item, then save. A claim must keep at least one selected item. If this is its only item and there is no other genuinely affected item to select, retain the record; claim deletion is not available in this edition.'},
      {type:'text',text:'Removing an item frees a personal space and removes its saved attachments from that record. There is no recycle bin or undo button. Export a current backup before removing something you may need again.'}
    ]},
    { id:'claims', title:'Create and track an insurance claim', intro:'Insurance claims is an organizing tool for your own records. It does not contact your insurer or submit a claim. Follow your insurer’s separate reporting process and record the details here.', blocks:[
      {type:'steps',items:[
        'Make sure the lost or damaged belongings are in My inventory with their details and replacement values.',
        'Open Insurance claims. Choose New claim, or Create your first claim if no claims exist.',
        'Enter an incident title and incident date, such as “Kitchen water damage”. These fields are required.',
        'Enter the insurer and claim number when available. Describe the damage in the notes and attach an incident photograph if useful.',
        'Select at least one affected personal item from the checklist. Samples cannot be selected.',
        'Choose a status, record any payout received, and select Save.',
        'Later, use Manage claim to update its status, notes, selected items, evidence, or payout. Export Claim PDF when you need a readable report.'
      ]},
      {type:'table',headers:['Status','Suggested way to use it'],rows:[
        ['Draft','You are still collecting the information.'],['Submitted','You have separately sent the claim to your insurer.'],['Under review','Your insurer is reviewing it.'],['Approved','You have received approval from the insurer.'],['Settled','The settlement process is complete.'],['Closed','You consider this claim closed.']
      ]},
      {type:'note',title:'Values and payout',text:'Saving a claim recalculates its claimed value from the selected items’ current replacement values. Editing an item alone does not update an existing claim’s saved value. A Claim PDF shows the saved claim value and current selected-item value separately if they differ. Payout is the total amount you enter, not a payment log or an automatically received transfer.'},
      {type:'text',text:'Statuses are set manually. Settled and Closed claims stay in your list, but are excluded from the Active claims count. There is no automated insurer status check or claim deletion control.'}
    ]},
    { id:'exports', title:'Choose the right export', intro:'Trackly offers a readable PDF for reviewing or sharing and JSON files for retaining structured data and attachments. These exports use personal records, even when Sample inventory is selected.', blocks:[
      {type:'table',headers:['Button / file','Purpose and contents'],rows:[
        ['Inventory PDF','Downloads trackly-home-inventory.pdf with all personal items, a summary of values, item details, and image evidence pages. Requires at least one personal item.'],
        ['Claim PDF','Downloads trackly-insurance-claim.pdf for one claim: incident details, insurer, number, status, values, payout, selected items, and evidence.'],
        ['Backup','Downloads trackly-home-inventory.json with the full personal inventory, custom rooms, claims, and embedded attachments. Use this file with Import backup.'],
        ['Claim backup','Downloads trackly-claim.json for one claim and its selected item details. This is an archive for that claim; Import backup does not accept it as a full inventory backup.']
      ]},
      {type:'steps',items:[
        'For a complete inventory report, select Inventory PDF. For one claim, open Insurance claims and choose Claim PDF on its card.',
        'Wait while Preparing PDF is displayed. Large reports with several images may take longer.',
        'Find the download in your browser’s Downloads or Files area. If iPhone opens the PDF, use Share to save a copy to Files.',
        'Open the PDF and review the owner name, item details, amounts, and image legibility before sharing it.'
      ]},
      {type:'note',title:'What happens to PDF receipts?',text:'Photographs and image receipts appear as pages in the report. An attached PDF receipt is named in the report but its original pages are not merged. Download that receipt from Item details and share it separately if needed. It is also retained inside the full JSON backup.'},
      {type:'text',text:'Reports show USD amounts with cents and use the name saved in Edit profile. Exporting a report does not email it, upload it, or submit it to an insurer.'}
    ]},
    { id:'restore', title:'Back up, restore, and move to another device', intro:'Keep a full backup after meaningful changes. The same JSON file can restore your inventory on the current device or be transferred to another device and imported there.', blocks:[
      {type:'subhead',text:'Create a backup'},
      {type:'steps',items:[
        'Select Backup from the app’s top action buttons.',
        'Find trackly-home-inventory.json in Downloads or Files. Your browser may add a number when a file with that name already exists.',
        'Keep a dated copy somewhere separate from the browser. The file contains your item details and attachments, so share it only with intended recipients.'
      ]},
      {type:'subhead',text:'Restore a backup'},
      {type:'steps',items:[
        'Select Import backup and choose the full inventory JSON file.',
        'Review the number of personal items, custom rooms, claims, attachments, and the total replacement value shown in the preview.',
        'If you want to preserve the current records first, choose Download current backup in the import dialog.',
        'Check Replace my current personal inventory, custom rooms, and claims with this backup. Then choose Restore backup.',
        'Review My inventory and Insurance claims. On a new device, set your profile name and preferred theme separately.'
      ]},
      {type:'note',title:'Replacement, not merging',text:'Restore replaces the current personal inventory, custom rooms, and claims with the chosen file. It does not add the imported records to the existing ones. Profile and theme settings are not part of this inventory backup. An empty but valid backup can replace the inventory with zero items.'},
      {type:'text',text:'Import accepts full Trackly backups up to 12 MB with up to 100 claims. Restoring more than 12 personal items requires activation. Invalid dates or values, duplicate IDs, missing claim references, and unsupported attachments are rejected before changing records. If storage is full, the previous data remains intact. Keep the source backup and resolve the storage problem before trying again.'}
    ]},
    { id:'activation', title:'Activate after 12 personal items', intro:'Trackly includes 12 free personal inventory spaces. The 10 sample records, rooms, and claims do not use these spaces. A valid activation code removes the personal-item count limit; available browser storage still applies.', blocks:[
      {type:'steps',items:[
        'Add up to 12 personal items as usual. My inventory shows your usage, for example 12/12.',
        'Select Add item when all 12 spaces are used, or choose Enter activation code beside the inventory switch at any time.',
        'Paste the complete TRACKLY1 code supplied by the seller into Activation code. If you have not received one, contact the seller through your purchase channel.',
        'Choose Activate. A valid code is saved on this browser and device, and My inventory changes to Activated.',
        'If you opened activation while adding an item, the item form opens after success. Enter its details and Save. For a blocked backup import, review the refreshed preview and confirm replacement before selecting Restore backup.'
      ]},
      {type:'note',title:'You can keep using your records',text:'Choose Not now or close the activation dialog to return. Existing items remain available for viewing, editing, claims, and exports. Removing an unlinked item frees a space within the 12-item allowance. Activation does not delete or change your inventory.'},
      {type:'subhead',text:'Keep your code separately'},
      {type:'text',text:'Activation is remembered after reopening this browser, including offline use after setup. It is not included in inventory backups. If you change browser or device, or clear site data, enter your code again. Activate before restoring a backup containing more than 12 items.'},
      {type:'subhead',text:'If activation does not work'},
      {type:'bullets',items:[
        'Paste the whole code and check that you received it for this Trackly app. Invalid or changed codes do not unlock the inventory.',
        'If the app asks for a supported connection, use its HTTPS link or localhost on a computer in a current browser.',
        'If activation cannot be saved, keep your code, export your inventory, and resolve the browser storage problem before retrying.'
      ]},
      {type:'text',text:'Activation does not add cloud sync, sign-in, or automatic payment processing. Attachment limits, the backup file size limit, and browser storage limits remain the same.'}
    ]},
    { id:'phone', title:'Install on your phone and work offline', intro:'Phone installation needs the published HTTPS website link. Opening index.html as a local file is useful for a computer preview, but cannot enable phone installation. Uploading files to a Git repository alone is not the same as publishing a website.', blocks:[
      {type:'subhead',text:'Android / Chrome'},
      {type:'steps',items:[
        'Open the app’s HTTPS link in Chrome and allow the page to finish loading.',
        'Tap Install app in Trackly. If the browser offers an installation prompt, follow it.',
        'If Trackly shows instructions instead, open Chrome’s menu and look for Install app or Add to Home screen. The wording depends on the browser.',
        'Confirm, then launch Trackly from its home-screen icon.'
      ]},
      {type:'subhead',text:'iPhone or iPad / Safari'},
      {type:'steps',items:[
        'Open the app’s HTTPS link in Safari.',
        'Tap Share, then Add to Home Screen.',
        'If Open as Web App is offered, enable it. Tap Add.',
        'Launch Trackly from the new home-screen icon.'
      ]},
      {type:'note',title:'Offline use',text:'After a successful online load and offline setup, the installed app can open cached pages and use locally saved records, attachments, and PDF tools without a connection. Remote room photos and web fonts may not load offline. Test this on your own device before relying on it away from a connection.'},
      {type:'text',text:'Installation does not automatically copy data from a computer or a different browser. If the installed app is empty, use a full Backup from the source and Import backup in the installed app. When an update is available, open online, then close all app tabs/windows and reopen so the new cached version can activate.'},
      {type:'note',title:'Device verification',text:'Real Android and iPhone installation was not verified in the development session. Browser support, file pickers, and installation wording can differ. Use the checks above on the device where you plan to keep your inventory.'}
    ]},
    { id:'personalize', title:'Your name, initials, and appearance', intro:'Personalize the display name and choose the Modern Luxury Light or Dark theme. These preferences are saved in the current browser on the current device.', blocks:[
      {type:'subhead',text:'Change Jamie Davis to your own name'},
      {type:'steps',items:[
        'On a computer, click the profile name at the bottom of the left sidebar. On a phone, open the three-line menu and select Edit profile.',
        'Enter your name in Your name. Use between 1 and 80 characters.',
        'Choose Save profile. The displayed name and initials update automatically.',
        'Generate a new PDF if you want the changed name to appear in a report. Existing downloaded PDFs do not change.'
      ]},
      {type:'subhead',text:'Switch Light and Dark'},
      {type:'text',text:'Use the Light / sun or Dark / moon control in the top bar. On first use, the app follows the device’s preferred color scheme. Once you choose a mode, Trackly remembers your choice. Light uses pearl white and navy; Dark uses deep navy with champagne accents.'},
      {type:'note',title:'A local profile',text:'Edit profile changes the name shown in the app and reports. It does not create a password, sign you into a cloud account, or enable synchronization. Set the name and theme again when using a different browser or device.'}
    ]},
    { id:'troubleshooting', title:'Troubleshooting', intro:'Start by checking the selected inventory mode, current filters, and the message shown by the app. Avoid clearing browser data while troubleshooting unless you have a backup you can restore.', blocks:[
      {type:'table',headers:['What you see','What to do'],rows:[
        ['Add item asks for a code','At 12 personal items, enter the code supplied by the seller to add more. Choose Not now to keep using existing records. Samples and rooms do not consume personal spaces.'],
        ['An item seems missing','Choose My inventory, clear the search, and select All rooms. Check that you opened the same device, browser, and website address where you saved it.'],
        ['Device storage is unavailable or full','Previously saved records remain intact when a save fails. Keep the form open, download a backup, and try smaller attachments. The item limit does not guarantee enough storage for every large file.'],
        ['Choose a smaller photograph','The input limit is 20 MB, with additional image-dimension and compressed-size limits. Crop or export a smaller JPEG copy and retry.'],
        ['This image cannot be opened','Use a JPEG, PNG, or WebP copy. HEIC/HEIF support depends on the browser. Choose Discard failed upload to retain the previous attachment.'],
        ['Receipt text is blurry','Review the image preview. Retake it in good light, crop around the receipt, or use the original PDF if it is within the 2 MB limit.'],
        ['Import backup rejects the file','Use the full trackly-home-inventory.json file, not a PDF report or trackly-claim.json. Activate first if it has more than 12 items, and check the file size limit. Keep the original file unchanged.'],
        ['An item cannot be removed','One or more claims reference it. See Search, edit, and remove belongings for the claim-link restriction.'],
        ['PDF tools are not available','Reload online once so the PDF assets can load. For a local preview, keep the supplied project files together, including the vendor folder.'],
        ['PDF does not include sample items','Exports intentionally use personal records. Add or copy real belongings into My inventory first.'],
        ['Install app only shows help','Use an HTTPS website link and a supported browser. Follow its installation menu, or Safari’s Add to Home Screen steps.'],
        ['The app looks like the old version','Connect to the internet, open the app, close all its tabs/windows, then reopen. Avoid deleting site data as an update step.'],
        ['The phone inventory is empty','Installation does not synchronize devices. Transfer a full JSON backup and restore it on the phone.']
      ]}
    ]},
    { id:'example', title:'Worked example: from belonging to claim', intro:'This is an example workflow with invented amounts, not advice about the value of your own belongings or an insurer’s coverage.', blocks:[
      {type:'steps',items:[
        'In My inventory, choose Add item. Enter “KitchenAid stand mixer”, select Kitchen, and enter 350.00 as the purchase price and 450.00 as the replacement value.',
        'Enter the actual purchase date and serial number for your own item. Attach a clear photograph and receipt, then select Save.',
        'If this is your only personal item, the household replacement total is $450. Download Backup so the record and attachments are preserved outside the browser.',
        'Suppose this item is later damaged in a water incident. Open Insurance claims and choose New claim. Enter the incident title and date, describe the damage, and select the mixer.',
        'Keep the status as Draft while collecting information. Saving the claim records a claimed value of $450 from the selected item.',
        'After reporting the incident through your insurer’s process, use Manage claim to add its claim number and manually change the status to Submitted.',
        'If you record a total payout received of $300, enter 300 in Payout received ($). Update the status when appropriate and Save.',
        'Choose Claim PDF to review the incident, item value, payout, and evidence. Share that PDF and any required original receipts through the channel your insurer requests.',
        'Download a new full Backup after these changes.'
      ]},
      {type:'note',title:'If the replacement value changes',text:'If you later change the mixer’s replacement value to $475, the saved claim remains at $450 until the claim is saved again. The Claim PDF identifies a difference between current selected-item values and the saved claimed value.'}
    ]},
    { id:'routine', title:'A simple routine and current limits', intro:'A useful inventory is one you can find, understand, and restore. Keep your records current with a short repeatable routine.', blocks:[
      {type:'bullets',items:[
        'After adding or changing real records, download a full Backup and keep a dated copy.',
        'Keep original photos and receipts alongside your own document archive. Trackly stores compressed copies of uploaded images.',
        'Review item names, serial numbers, and replacement estimates when your belongings change.',
        'Before removing records or restoring an older backup, preserve the current full backup.',
        'Before sharing a report, review its owner name, amounts, selected items, attachments, and private details.',
        'Before relying on phone offline use, test opening the installed app, saving a record, and exporting on your own device.'
      ]},
      {type:'subhead',text:'What this edition does not do'},
      {type:'text',text:'There is no cloud synchronization, password-protected account, multi-device live update, automatic valuation, currency conversion, warranty reminder, insurer integration, or automatic claim submission. You can add custom rooms; room renaming and deletion are not available. Claim deletion is not available. Each item has one photo and one receipt; each claim has one incident photo.'},
      {type:'note',title:'Your records stay local',text:'The app saves inventory in browser storage. Clearing that storage, switching to another browser or website address, or losing the device can make those records unavailable. The profile name is not an access-control feature. Keep a full backup somewhere separate and treat exported files as private records.'},
      {type:'text',text:'Use this guide through How to use in the app, keep the PDF for reference, or open how-to-use.html separately. All three editions cover the same features described here. Guide updated: '+updated+'.'}
    ]}
  ];
  const escape = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function blockHTML(block) {
    if(block.type==='steps'||block.type==='bullets'){const tag=block.type==='steps'?'ol':'ul';return `<${tag}>${block.items.map(item=>`<li>${escape(item)}</li>`).join('')}</${tag}>`;}
    if(block.type==='table')return `<div class="manual-table"><table><thead><tr>${block.headers.map(text=>`<th>${escape(text)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(row=>`<tr>${row.map(text=>`<td>${escape(text)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    if(block.type==='subhead')return `<h3>${escape(block.text)}</h3>`;
    if(block.type==='note'||block.type==='example')return `<div class="manual-note ${block.type}"><strong>${escape(block.title)}</strong><p>${escape(block.text)}</p></div>`;
    return `<p>${escape(block.text)}</p>`;
  }
  function render(standalone=false){return `<div class="manual-guide" id="manual-top"><div class="manual-intro"><div><span class="eyebrow">YOUR TRACKLY HANDBOOK</span><h2>Everything you need, step by step.</h2><p>A detailed guide to your belongings, evidence, backups, and claims.</p><small>10 sample items + 12 free personal spaces · Updated ${updated}</small></div><div class="manual-downloads"><a class="button primary" href="output/pdf/trackly-how-to-use.pdf" download>↓ Download manual PDF</a>${standalone?'':'<a class="button" href="how-to-use.html" target="_blank" rel="noopener">Open separate guide ↗</a>'}</div></div><label class="manual-search">Find a topic<input type="search" id="manual-search" placeholder="Search: receipt, backup, phone…" aria-describedby="manual-results"></label><p id="manual-results" class="manual-results" role="status">${sections.length} chapters</p><div class="manual-toc" aria-label="Manual contents">${sections.map((section,index)=>`<a href="#guide-${section.id}" data-guide-link="${section.id}"><span>${String(index+1).padStart(2,'0')}</span>${escape(section.title)}</a>`).join('')}</div><div class="manual-chapters">${sections.map((section,index)=>`<section class="manual-section" id="guide-${section.id}" data-guide-section="${section.id}"><div class="manual-section-title"><span>${String(index+1).padStart(2,'0')}</span><h2>${escape(section.title)}</h2></div><p>${escape(section.intro)}</p>${section.blocks.map(blockHTML).join('')}<a class="manual-top-link" href="#manual-top">Back to contents ↑</a></section>`).join('')}</div></div>`;}
  function bind(host=document){
    const input=host.querySelector('#manual-search');if(!input)return;
    input.addEventListener('input',()=>{
      const query=input.value.trim().toLowerCase();let count=0;
      for(const section of sections){const found=!query||JSON.stringify(section).toLowerCase().includes(query);host.querySelector(`[data-guide-section="${section.id}"]`).hidden=!found;host.querySelector(`[data-guide-link="${section.id}"]`).hidden=!found;if(found)count++;}
      host.querySelector('#manual-results').textContent=count?`${count} ${count===1?'chapter':'chapters'}${query?' matching your search':''}`:'No matching chapters. Try a shorter word or clear the search.';
    });
  }
  return {sections,updated,render,bind};
})();
