# Storyboard

Programma per Windows e Linux: metti le immagini su un piano, le colleghi con frecce, scrivi un commento sotto ognuna ed esporti tutto in un PDF da dare a un'IA.

## Installazione

Serve [Node.js](https://nodejs.org) (versione 20 o più recente).

```bash
git clone https://github.com/HP-Ozy/storyboard.git
cd storyboard
npm install
npm start
```

Le volte successive basta `npm start` dalla cartella `storyboard`.

### Creare il programma installabile (facoltativo)

```bash
npm run dist
```

Il risultato finisce nella cartella `release/`:

- **Windows** → `Storyboard Setup x.y.z.exe` (installer)
- **Linux** → `Storyboard-x.y.z.AppImage` (rendilo eseguibile con `chmod +x` e avvialo). Va creato da Linux.

## Come si usa

### 1. Le scene

| Cosa vuoi fare | Come |
|---|---|
| Aggiungere immagini | **+ Immagini** (puoi sceglierne tante insieme; vengono ordinate per nome file) |
| Aggiungere un nodo senza immagine (sceneggiatura, nota) | **+ Testo**: compare accanto all'ultimo nodo; non serve archetipo né emozione |
| Spostare una scena | trascinala tenendo premuto sull'immagine o sul titolo |
| Spostare più scene insieme | **Ctrl + clic** su ognuna (bordo blu), poi trascinane una; clic sul piano vuoto per deselezionare |
| Rimettere in ordine le scene sparse | **Allinea**: griglia di 5 per riga, nell'ordine dei numeri delle scene |
| Scrivere un commento | scrivi nel riquadro sotto l'immagine |
| Cambiare il numero della scena | **◀ ▶** |
| Eliminare una scena | **✕** sotto la scena |

### Attori, gesti e azioni

Il pannello in basso a sinistra raccoglie gli elementi che si ripetono in tutto il progetto.

| Cosa vuoi fare | Come |
|---|---|
| Creare un attore, un gesto o un'azione | apri la sezione e premi **+ Aggiungi**, poi scrivi nome e descrizione; con **Immagine** alleghi il riferimento (es. il model sheet del personaggio) |
| Metterlo in una scena | **+ Aggiungi** sotto la scena → scegli dal gruppo Attori, Gesti o Azioni |
| Scrivere cosa fa un attore in quella scena | dopo averlo scelto compare un riquadro dedicato sotto la scena |
| Vedere l'attore in 3D sul piano | dopo avergli dato un'**Immagine** premi **3D sul piano**: compare un nodo col modello, trascinalo dentro per ruotarlo. Funziona meglio con un PNG a sfondo trasparente o un'immagine su sfondo uniforme. È la sagoma "gonfiata" dell'immagine, non una ricostruzione: il retro è lo specchio del davanti |
| Eliminarlo | **✕** nel pannello: viene tolto anche da tutte le scene |

### 2. Le frecce

Le frecce non si creano da sole: le colleghi tu, scena per scena.

| Cosa vuoi fare | Come |
|---|---|
| Creare una freccia | passa il mouse su una scena, trascina uno dei **pallini blu** ai lati e rilascialo sopra un'altra scena |
| Selezionare una freccia | cliccaci sopra: diventa blu e compaiono i pallini |
| Curvarla | trascina il pallino blu centrale |
| Cambiare partenza o arrivo | trascina il pallino blu all'inizio o alla fine su un'altra scena |
| Eliminarla | clicca il pallino rosso, oppure premi `Canc` |

Una freccia cancellata si ricrea dai pallini.

### 3. Salvare e riaprire

| Cosa vuoi fare | Come |
|---|---|
| Salvare | scrivi il nome in **Nome progetto** e premi **Salva** (compare *Salvato ✓*) |
| Riaprire un progetto | **Archivio** → clicca il nome |
| Modificare un progetto salvato | aprilo dall'**Archivio**, modificalo, premi **Salva** |
| Farne una copia | cambia il nome nel campo e premi **Salva** |
| Eliminare un progetto | **Archivio** → **Elimina** (definitivo) |
| Iniziare da zero | **Nuovo** |

I progetti stanno nella cartella `archivio/`, una sottocartella per progetto. Il percorso esatto è scritto in cima alla finestra **Archivio**:

- con `npm start` → `storyboard/archivio/`
- programma installato → accanto a `Storyboard.exe` (Windows) o al file `.AppImage` (Linux)

Ogni progetto è una cartella normale (`project.json` + `images/`): puoi copiarla su un altro computer, anche da Windows a Linux, e metterla nella sua cartella `archivio/`.

### Canali PYD nel Calendario

Nel **Calendario**, colonna a sinistra, sezione **Canali PYD**: scegli la piattaforma (YouTube, Instagram, TikTok), scrivi il nome del canale e premi **+ Aggiungi**. Trascina il canale su un giorno e un'ora per pianificare una pubblicazione: lo stesso canale si può mettere quante volte vuoi, e ogni piattaforma ha il suo colore. Per scrivere cosa esce, aggiungi un flag nella stessa ora. Con ✕ sulla pubblicazione la togli; con ✕ sul canale lo elimini insieme a tutte le sue pubblicazioni. Serve solo a vedere il piano: l'app non si collega ai social.

### 4. Esportare per l'IA

**Esporta PDF per IA** → scegli dove salvare. Il PDF contiene tutte le scene nelle loro posizioni, con frecce e commenti. Caricalo nella chat dell'IA.

## Note

- Non c'è salvataggio automatico. Se chiudi con modifiche non salvate, il programma te lo chiede.
- Se le scene sono molto distanti, nel PDF il testo diventa piccolo: avvicinale prima di esportare.
- Se due scene sono quasi attaccate, la freccia tra loro non viene disegnata.

## Contribuire

Il ramo `main` è protetto: **non si può pushare direttamente**. Ogni modifica passa da un ramo separato e da una **Pull Request**, che viene revisionata e approvata prima di entrare in `main`.

### 1. Parti da `main` aggiornato

```bash
git checkout main
git pull
```

### 2. Crea un ramo per la tua modifica

```bash
git checkout -b feature/nome-modifica
```

Usa un nome che dica cosa fai:

| Tipo di modifica | Esempio di nome |
|---|---|
| Nuova funzione | `feature/zoom-piano` |
| Correzione di un errore | `fix/frecce-pdf` |
| Solo documentazione | `docs/readme-linux` |

### 3. Lavora e fai i commit

```bash
git add .
git commit -m "Descrizione breve di cosa hai cambiato"
```

Puoi fare più commit sullo stesso ramo.

### 4. Pubblica il ramo

```bash
git push -u origin feature/nome-modifica
```

I push successivi sullo stesso ramo: basta `git push`.

### 5. Apri la Pull Request

Su GitHub compare il banner **Compare & pull request**: cliccalo.
In alternativa: **Pull requests** → **New pull request** → base `main`, compare il tuo ramo.

Nella descrizione scrivi:

- cosa hai cambiato
- perché
- come provarlo (es. "aggiungi 3 immagini e esporta il PDF")

Poi **Create pull request**.

### 6. Revisione

| Cosa succede | Cosa fai |
|---|---|
| La PR viene **approvata** | viene fatto il merge in `main`, non devi fare altro |
| Vengono **chieste modifiche** | correggi sullo stesso ramo, fai commit e `git push`: la PR si aggiorna da sola |

Se aggiungi commit dopo un'approvazione, l'approvazione decade e serve una nuova revisione.

### 7. Dopo il merge

```bash
git checkout main
git pull
git branch -d feature/nome-modifica
```

Per la modifica successiva riparti dal punto 1.

### Se `main` è cambiato mentre lavoravi

Se GitHub segnala conflitti nella PR:

```bash
git checkout main
git pull
git checkout feature/nome-modifica
git merge main
```

Risolvi i conflitti nei file segnalati, poi:

```bash
git add .
git commit
git push
```
