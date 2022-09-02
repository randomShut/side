const SPIELFELD_KLASSE = "spielfeld";
const SPIELANZEIGE_KLASSE = "spielanzeige";
const FELD_KLASSE = "feld";
const SPIELER_KLASSE = "spieler";
const GEGNER_KLASSE = "gegner";
const OVERLAY_KLASSE = "overlay";
const OVERLAY_TEXT_KLASSE = "overlay-text";
const OVERLAY_BUTTON_KLASSE = "overlay-button";
const SICHTBAR_KLASSE = "sichtbar";

const spielfeld = document.querySelector("." + SPIELFELD_KLASSE);
const spielanzeige = document.querySelector("." + SPIELANZEIGE_KLASSE);
const overlay = document.querySelector("." + OVERLAY_KLASSE);
const overlayText = document.querySelector("." + OVERLAY_TEXT_KLASSE);
const overlayButton = document.querySelector("." + OVERLAY_BUTTON_KLASSE);

const felder = document.querySelectorAll("." + FELD_KLASSE);

const SIEG_KOMBINATIONEN = [
  [felder[0], felder[1], felder[2]],
  [felder[3], felder[4], felder[5]],
  [felder[6], felder[7], felder[8]],
  [felder[0], felder[3], felder[6]],
  [felder[1], felder[4], felder[7]],
  [felder[2], felder[5], felder[8]],
  [felder[0], felder[4], felder[8]],
  [felder[2], felder[4], felder[6]],
];

let aktuelleKlasse;

overlayButton.addEventListener("click", spielStarten);

spielStarten();

function klickVerarbeiten(ereignis) {
  // Den Klick verhindern, wenn der Gegner gerade am Zug ist
  if (aktuelleKlasse === GEGNER_KLASSE) {
    return;
  }

  // Ermitteln, welches Feld angeklickt wurde
  const feld = ereignis.target;

  // Spielstein auf dieses Feld setzen
  if (spielsteinSetzen(feld) === true) {
    // Beende den Zug, wenn der Spielstein erfolgreich gesetzt wurde
    zugBeenden();
  }
}

function spielsteinSetzen(feld) {
  // Prüfen, ob das Feld schon besetzt ist
  if (
    feld.classList.contains(SPIELER_KLASSE) ||
    feld.classList.contains(GEGNER_KLASSE)
  ) {
    // Verhindern, dass ein Spielstein gesetzt wird
    return false;
  }

  // Dem Feld die Klasse des Spielers anhängen, der gerade an der Reihe ist
  feld.classList.add(aktuelleKlasse);

  // Das Feld deaktivieren, um weitere Klicks zu verhindern
  feld.disabled = true;

  // Signalisieren, dass der Spielstein erfolgreich gesetzt wurde
  return true;
}

function spielStarten() {
  // Das Overlay wieder verstecken, falls es bereits sichtbar ist
  overlay.classList.remove(SICHTBAR_KLASSE);

  // Die Klasse des letzten Siegers vom Overlay-Text entfernen
  overlayText.classList.remove(SPIELER_KLASSE, GEGNER_KLASSE);

  // Die aktuelleKlasse leeren, damit der Zufall entscheidet, wer beginnt
  aktuelleKlasse = null;

  // Die Liste der Felder durchgehen
  for (const feld of felder) {
    // Bestehende Spielsteine vom Feld entfernen
    feld.classList.remove(SPIELER_KLASSE, GEGNER_KLASSE);

    // Das Feld wieder aktivieren, falls es schon deaktiviert ist
    feld.disabled = false;

    // Jedem Feld sagen, was beim Klick darauf passieren soll
    feld.addEventListener("click", klickVerarbeiten);
  }

  // Festlegen, wer beginnen darf
  zugBeenden();
}

function zugBeenden() {
  // Prüfen, ob der Spieler, der gerade an der Reihe ist, gewonnen hat
  if (siegPruefen() === true) {
    // Ist das der Fall, wird das Spiel beendet
    spielBeenden(false);

    // zugBeenden-Funktion unterbrechen, um nicht zum anderen Spieler zu wechseln
    return;
  }

  // Prüfen, ob ein Unentschieden entstanden ist
  if (unentschiedenPruefen() === true) {
    // Ist das der Fall, wird das Spiel beendet
    spielBeenden(true);

    // zugBeenden-Funktion unterbrechen, um nicht zum anderen Spieler zu wechseln
    return;
  }

  if (aktuelleKlasse === SPIELER_KLASSE) {
    // Spieler beendet seinen Zug -> zum Gegner wechseln
    aktuelleKlasse = GEGNER_KLASSE;
  } else if (aktuelleKlasse === GEGNER_KLASSE) {
    // Gegner beendet seinen Zug -> zum Spieler wechseln
    aktuelleKlasse = SPIELER_KLASSE;
  } else {
    // Es ist noch niemand am Zug -> auswürfeln, wer beginnt
    aktuelleKlasse = Math.random() < 0.5 ? SPIELER_KLASSE : GEGNER_KLASSE;
  }

  spielanzeigeAktualisieren();

  // Ist der Gegner an der Reihe, muss ein Computerzug ausgeführt werden
  if (aktuelleKlasse === GEGNER_KLASSE) {
    setTimeout(computerZugAusfuehren, 750);
  }
}

function spielanzeigeAktualisieren() {
  // Die Klasse des aktuellen Spielers von der Spielanzeige entfernen
  spielanzeige.classList.remove(SPIELER_KLASSE, GEGNER_KLASSE);

  // Text der Spielanzeige anpassen: je nachdem, wer gerade am Zug ist
  if (aktuelleKlasse === SPIELER_KLASSE) {
    spielanzeige.innerText = "Du bist am Zug.";
  } else {
    spielanzeige.innerText = "Der Gegner ist am Zug.";
  }

  // Die Klasse des Spielers, der gerade am Zug ist an die Spielanzeige hängen
  spielanzeige.classList.add(aktuelleKlasse);
}

function siegPruefen() {
  // Gehe alle Siegeskombinationen durch
  for (const kombination of SIEG_KOMBINATIONEN) {
    // Prüfe, ob alle 3 Felder der gleichen Klasse angehören
    const gewonnen = kombination.every(function (feld) {
      return feld.classList.contains(aktuelleKlasse);
    });

    if (gewonnen === true) {
      // Beende die Funktion & signalisiere, dass der Spieler gewonnen hat
      return true;
    }
  }

  // Signalisiere, dass das Spiel (noch) NICHT gewonnen ist
  return false;
}

function spielBeenden(unentschieden) {
  // Text für das Overlay festlegen
  if (unentschieden === true) {
    overlayText.innerText = "Unentschieden!";
  } else if (aktuelleKlasse === SPIELER_KLASSE) {
    overlayText.innerText = "Du hast gewonnen!";
    overlayText.classList.add(SPIELER_KLASSE);
  } else {
    overlayText.innerText = "Der Gegner hat gewonnen!";
    overlayText.classList.add(GEGNER_KLASSE);
  }

  // Das Overlay sichtbar machen
  overlay.classList.add(SICHTBAR_KLASSE);
}

function unentschiedenPruefen() {
  // Gehe alle Felder durch
  for (const feld of felder) {
    // Prüfe, ob das Feld noch unbesetzt ist
    if (
      !feld.classList.contains(SPIELER_KLASSE) &&
      !feld.classList.contains(GEGNER_KLASSE)
    ) {
      // Gibt es ein unbesetztes Feld, kann es kein Unentschieden sein
      return false;
    }
  }

  // Es gibt kein freies Feld mehr -> unentschieden!
  return true;
}

function computerZugAusfuehren() {
  // Per Zufall ein Feld auswählen
  const zufallsIndex = Math.floor(Math.random() * 9);

  // Einen Spielstein auf dieses Feld setzen
  if (spielsteinSetzen(felder[zufallsIndex]) === true) {
    // Beende den Zug, wenn der Spielstein erfolgreich gesetzt wurde
    zugBeenden();
  } else {
    // Wähle ein anderes Feld, wenn das Feld schon besetzt war
    computerZugAusfuehren();
  }
}
