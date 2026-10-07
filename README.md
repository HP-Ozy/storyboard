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
| Spostare una scena | trascinala tenendo premuto sull'immagine o sul titolo |
| Scrivere un commento | scrivi nel riquadro sotto l'immagine |
| Cambiare il numero della scena | **◀ ▶** |
| Eliminare una scena | **✕** sotto la scena |

### 2. Le frecce

Quando aggiungi immagini, ognuna viene collegata alla precedente. Poi puoi cambiare ogni freccia una per una:

| Cosa vuoi fare | Come |
|---|---|
| Creare una freccia | trascina il pulsante **↗** di una scena e rilascialo sopra un'altra scena |
| Selezionare una freccia | cliccaci sopra: diventa blu e compaiono i pallini |
| Curvarla | trascina il pallino blu centrale |
| Cambiare partenza o arrivo | trascina il pallino blu all'inizio o alla fine su un'altra scena |
| Eliminarla | clicca il pallino rosso, oppure premi `Canc` |

Una freccia cancellata si ricrea con **↗**.

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

### 4. Esportare per l'IA

**Esporta PDF per IA** → scegli dove salvare. Il PDF contiene tutte le scene nelle loro posizioni, con frecce e commenti. Caricalo nella chat dell'IA.

## Note

- Non c'è salvataggio automatico. Se chiudi con modifiche non salvate, il programma te lo chiede.
- Se le scene sono molto distanti, nel PDF il testo diventa piccolo: avvicinale prima di esportare.
- Se due scene sono quasi attaccate, la freccia tra loro non viene disegnata.
