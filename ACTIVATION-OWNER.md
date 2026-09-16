# Coduri de activare Trackly — ghid pentru proprietar

Clientul are **12 înregistrări personale gratuite**. La încercarea de a adăuga a 13-a, aplicația cere un cod. Un cod valid elimină limita de număr de bunuri. Cele 10 exemple și camerele nu consumă înregistrări. Editarea, exporturile și dosarele existente rămân accesibile.

## Generează un cod pentru un client

Deschide terminalul în folderul proiectului și rulează cu Node.js:

```powershell
node tools/activation-codes.cjs issue "Client sau număr comandă"
```

Comanda afișează calea unui fișier `.txt` nou în `.local-license/`. Deschide fișierul și transmite clientului codul complet care începe cu `TRACKLY1.`. Fiecare rulare generează un cod distinct. Folosește de preferat numărul comenzii drept etichetă; eticheta este inclusă în cod.

Dacă `node` nu este disponibil în terminal, pe acest calculator poți folosi:

```powershell
& 'C:/Users/maria/AppData/Local/OpenAI/Codex/runtimes/cua_node/84464046935436b8/bin/node.exe' tools/activation-codes.cjs issue "Comanda 1001"
```

Nu este necesar să modifici sau să publici din nou aplicația după generarea unui cod. Nu este configurată trimiterea automată a codurilor sau încasarea plăților.

## Ce face clientul

1. Apasă **Enter activation code**, sau **Add item** după cele 12 bunuri.
2. Lipește codul complet și apasă **Activate**.
3. Contorul afișează **Activated**. Poate adăuga înregistrări noi.

Activarea se salvează în browserul curent. Clientul păstrează codul separat pentru alt browser sau dispozitiv; acesta nu este inclus în backupul inventarului. Un backup cu peste 12 bunuri cere activare înainte de restaurare. Limitele pentru stocare, atașamente și dimensiunea backupului continuă să se aplice.

## Fișiere pentru publicare

- **Publice:** `activation.js` și `activation-key.js`, împreună cu celelalte fișiere ale site-ului. Cheia din `activation-key.js` verifică semnături, dar nu poate genera coduri.
- **Private:** întregul folder `.local-license/`, în special `private-key.pem` și fișierele cu coduri. Acest folder este exclus prin `.gitignore`. Nu îl încărca pe hosting și nu distribui întregul folder de proiect clienților.

Cheile au fost deja generate pentru această aplicație. Păstrează o copie privată a folderului `.local-license/` și a cheii publice corespunzătoare. Nu regenera cheile după distribuirea codurilor: codurile existente depind de cheia publică actuală. Comanda `init` refuză suprascrierea cheilor existente.

## Limitele activării locale

Codurile au semnătură verificată local și nu expiră. Pot fi reutilizate pe alt dispozitiv; nu există limitare la un dispozitiv sau revocare online. Aplicația este statică, astfel că un utilizator care modifică sursa poate ocoli limita. Pentru control comercial strict, plăți și revocare este necesar un serviciu de licențiere pe server.
