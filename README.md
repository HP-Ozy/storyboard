# Storyboard

Piano nero dove disporre immagini in sequenza, commentarle ed esportare tutto in PDF da dare a un'IA.

## Linux: installazione

Requisiti: un browser moderno (Firefox o Chromium/Chrome). Nient'altro.

```bash
git clone https://github.com/HP-Ozy/storyboard.git
cd storyboard
xdg-open index.html
```

Opzionale, aprirlo come finestra a sé (Chromium/Chrome):

```bash
chromium --app="file://$PWD/index.html"
```

## Uso

| Azione | Come |
|---|---|
| Aggiungere scene | **+ Immagini** (selezione multipla, ordinate per nome file) |
| Spostare una scena | trascinarla tenendo premuto su immagine o titolo |
| Commentare | scrivere nel riquadro sotto l'immagine |
| Cambiare ordine | **◀ ▶** (le frecce si ricollegano) |
| Eliminare | **✕** |
| Salvare il lavoro | **Salva** → scarica `storyboard.json` |
| Riprendere il lavoro | **Apri** → scegliere il `.json` |
| Esportare per IA | **Esporta PDF per IA** → stampante *Salva come PDF*, orientamento *Orizzontale* |

Il PDF mantiene posizioni, frecce e commenti su una pagina A4. Caricalo nella chat dell'IA.

## Note

- Non c'è salvataggio automatico: usa **Salva** prima di chiudere.
- Piano molto grande = testo piccolo nel PDF: avvicina le scene prima di esportare.
