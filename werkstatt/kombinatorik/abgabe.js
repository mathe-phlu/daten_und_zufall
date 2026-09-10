/* ============================================================
   LARS — Aufnahmeanzeige und Abgabeweg der Strategieaufgaben

   NICHT von Kasper. Diese Datei gehoert LARS und wird beim
   Uebernehmen danebengelegt (`werkzeuge/werkstatt_uebernehmen.py`).
   Sie aendert Kaspers Dateien nicht, sondern haengt sich an das
   fertige Dokument — dieselbe Bauart wie `PIA_ABGABE` bei den
   Pruefungen: Die Quelle bleibt unberuehrt, geaendert wird die
   Kopie, und zwar an einer Stelle.

   WARUM ES SIE GIBT. Kaspers `aufnahme.js` sagt es selbst:

     «Speichern: Ton und Ereignisse getrennt, beides ueber den
      Browser. Keine Uebertragung an eine Ablage - die Adresse
      fehlt bewusst.»

   Das ist in KASPER richtig: Dort gibt es keinen Kurs und keine
   Ablage. In der Lernlandschaft gibt es beides.

   ------------------------------------------------------------
   WAS SICH AM 10.09.2026 GEAENDERT HAT

   Rike, nachdem sie die Seite zum ersten Mal in Betrieb gesehen
   hat: «Bei den SuS ist das mit der Aufnahme viel subtiler — da
   laeuft oben die Aufnahme. Den Aufnahme-beenden-Knopf braeuchte
   es theoretisch gar nicht. Es soll einfach am Ende das Feld
   aufploppen mit der Abgabemoeglichkeit, so wie wir es bei der
   Pruefung bei Pia auch haben.»

   Vorher stand der Abgabekasten vom ersten Klick an unter der
   Flaeche und nahm ihr die halbe Hoehe — bei 900 px Fensterhoehe
   blieben der Sortierflaeche rund 250. Dazu ein roter Knopf
   «Aufnahme beenden und sichern» in der Fussleiste, der neben
   «Pruefen» und «Stand als Bild sichern» stand, als waere das
   Beenden ein Arbeitsschritt unter anderen.

   Jetzt drei Dinge, alle nach dem Vorbild von Pias Pruefung
   (`PIA/pruefungen/gemeinsam/ablauf.js`, Z. 705) und Kaspers
   eigener grosser Fassung (`KASPER/bauen/aufnahme.js`, Z. 730):

   1. OBEN, DEZENT. Ein pulsierender Punkt, «Aufnahme laeuft»,
      die Uhr und ein schmaler Pegel — im Kopf, nicht in der
      Arbeitsleiste. Der Pegel steht dort nicht als Schmuck: Er
      ist das Einzige, was verraet, dass das Mikrofon noch
      zuhoert. Eine tote Anzeige neben einer toten Aufnahme sieht
      genauso aus wie eine lebende.

   2. DER ROTE KNOPF VERSCHWINDET aus der Fussleiste. Kaspers
      `flaeche.js` haengt ihn bei jedem Etappenwechsel neu hinein,
      deshalb raeumt ihn ein Beobachter weg statt ein einmaliger
      Griff.

   3. DER ABSCHLUSS PLOPPT AUF. In der letzten Etappe steht in der
      Fussleiste dort, wo sonst «Etappe N →» steht, ein ruhiger
      Knopf «Fertig — Aufnahme abgeben». Er legt eine Deckseite
      ueber die Flaeche, mit denselben nummerierten Schritten wie
      Pias Pruefungsabschluss.

   KEINE SPERRE — das ist der Grund fuer den kleinen Textknopf
   «beenden» in der Kopfanzeige. Rike, 09.09.2026, zum
   Pruefungsabschluss: ein Weg wird geordnet, nicht versperrt. Wer
   nach zwanzig Minuten abbrechen muss, darf nicht erst durch drei
   Etappen klicken, um an seine Dateien zu kommen. Der Abschluss
   ist deshalb von jeder Etappe aus offen, nur nicht aufdringlich.

   DIE NAMEN. Rike, 10.09.2026: «Wir fragen keine Namen vorher ab.
   Wie bei den Kompensationen im MA01.03 muessten wir bei der Abgabe
   noch die Namen erfragen — da mehrere gemeinsam arbeiten koennen,
   muessten mindestens vier Namen eingegeben werden koennen.»

   Vorher gefragt wird also nicht: Wer sich zu Beginn eintragen muss,
   traegt sich ein, bevor er weiss, ob er die Aufnahme ueberhaupt
   abgibt. Gefragt wird am Schluss, dort, wo der Name gebraucht wird.

   Er landet an zwei Stellen: im DATEINAMEN (`..._mueller-meier.webm`)
   und im Ereignisstrom. Der Dateiname traegt, was ein Mensch beim
   Sortieren des Abgabeordners sieht; der Ereignisstrom traegt es
   auch dann noch, wenn jemand die Datei umbenennt.

   VIER FELDER, und ein fuenftes auf Wunsch — dieselbe Zahl, die Rike
   genannt hat, plus die Moeglichkeit, dass es eine groessere Gruppe
   war. Leer bleiben duerfen sie; der Knopf mahnt einmal an und
   sichert beim zweiten Druck trotzdem. Eine Datei, die nicht
   heruntergeladen wird, weil ein Feld leer ist, ist der schlechtere
   Fall — siehe «keine Sperre» oben.

   ZWEI DATEIEN, NICHT EINE. Die Pruefung schnuert ein ZIP; hier
   fallen `..._aufnahme.webm` und `..._aufnahme_ereignisse.json`
   getrennt an. Beide werden gebraucht — die Tonspur ist der
   Nachweis, der Ereignisstrom sagt, was auf der Flaeche geschah.
   Der Text nennt deshalb ausdruecklich BEIDE.

   DER LETZTE BROCKEN. Kaspers Knopf rief `beenden()` und
   `sichern()` unmittelbar hintereinander. `MediaRecorder.stop()`
   liefert den letzten Brocken aber ERST im naechsten Durchlauf
   (`ondataavailable`), und `A.brocken` war zum Zeitpunkt des
   Sicherns noch ohne ihn: bis zu vier Sekunden Ton fehlten, und
   zwar genau die letzten. Hier wird auf `stop` gewartet.
   ============================================================ */
(function () {
  'use strict';

  var ZIEL = window.LARS_ABGABE && window.LARS_ABGABE.ablage;

  var ID_KOPF = 'lars-aufnahmestand';
  var ID_DECK = 'lars-abschluss';
  var ID_FERTIG = 'lars-fertig';

  var uhrLaeuft = null;      // Kennung des Intervalls der Kopfanzeige
  var messer = null;         // Analyser fuer den Pegel
  var messdaten = null;

  function el(tag, klasse, html) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function auf() { return window.Aufnahme; }
  function laeuft() { var A = auf(); return !!(A && A.laeuft); }

  /* Der Dateiname, den Kaspers Knopf auch verwendet hat. `D` ist die
     Kapiteldatei im Kopf der Seite; faellt sie aus, bleibt ein Name
     ohne Nummer — besser als gar keine Datei. */
  function dateiname(namen) {
    var k = (typeof D !== 'undefined' && D && D.kapitel) ? D.kapitel : '';
    var vorn = k ? 'kapitel' + k + '_aufnahme' : 'strategieaufgabe_aufnahme';
    if (!namen || !namen.length) return vorn;
    return vorn + '_' + sauber(namen.join('-'));
  }

  /* Ein Dateiname, den ein Mensch wiedererkennt und jedes
     Betriebssystem annimmt — woertlich dieselbe Regel wie im
     Notizblatt von MA01.03 (`bauen/gestalt/notizblatt.js`, Z. 1227):
     Umlaute ausgeschrieben, alles Uebrige zu Bindestrichen. Die
     Laenge ist gekappt, weil bei fuenf Doppelnamen sonst ein
     Dateiname entsteht, den manche Ablage nicht mehr annimmt. */
  function sauber(wort) {
    return String(wort || '')
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue')
      .replace(/ß/g, 'ss')
      .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  }

  /* ---------- Gestaltung ----------
     Als eigener Block statt als Inline-Stil: Die Kopfanzeige hat
     einen Puls, und eine Animation laesst sich nicht an ein Element
     schreiben. Die Toene kommen aus Kaspers `flaeche.css`
     (`--matt`, `--falsch`, `--linie`), damit nichts angeklebt
     aussieht. */
  function gestalt() {
    if (document.getElementById('lars-abgabe-stil')) return;
    var s = el('style');
    s.id = 'lars-abgabe-stil';
    s.textContent = [
      '#' + ID_KOPF + '{display:flex;align-items:center;gap:8px;',
      '  font-size:13px;color:var(--matt,#6c6357);white-space:nowrap}',
      '#' + ID_KOPF + ' .punkt{width:9px;height:9px;border-radius:50%;',
      '  background:var(--falsch,#C0392B);animation:larspuls 1.6s infinite}',
      '@keyframes larspuls{0%,100%{opacity:1}50%{opacity:.25}}',
      '#' + ID_KOPF + ' .uhr{font-variant-numeric:tabular-nums;',
      '  font-feature-settings:"tnum"}',
      '#' + ID_KOPF + ' .pegel{width:44px;height:5px;border-radius:3px;',
      '  background:var(--linie,#e4d9c7);overflow:hidden}',
      '#' + ID_KOPF + ' .pegel i{display:block;height:100%;width:0;',
      '  background:var(--matt,#6c6357);transition:width .12s}',
      '#' + ID_KOPF + ' .schluss{font:inherit;color:var(--matt,#6c6357);',
      '  background:none;border:0;border-bottom:1px solid currentColor;',
      '  padding:0;cursor:pointer;opacity:.8}',
      '#' + ID_KOPF + ' .schluss:hover{opacity:1}',
      /* Die Deckseite. Sie liegt ueber der Flaeche, nicht darunter:
         Wer hier ist, sortiert nicht mehr, und die Karten sollen
         trotzdem stehen bleiben, falls er zurueckgeht. */
      '#' + ID_DECK + '{position:fixed;inset:0;z-index:900;',
      '  background:rgba(45,41,36,.34);display:flex;align-items:center;',
      '  justify-content:center;padding:22px;overflow:auto;',
      '  animation:larsauf .18s ease-out}',
      '@keyframes larsauf{from{opacity:0}to{opacity:1}}',
      '#' + ID_DECK + ' .blatt{max-width:40rem;width:100%;',
      '  background:var(--karte,#fffefb);border:1px solid var(--linie,#e4d9c7);',
      '  border-radius:12px;padding:22px 26px 24px;',
      '  box-shadow:0 8px 34px rgba(45,41,36,.22);',
      '  font:15px/1.55 var(--druck,"Fira Sans",system-ui,sans-serif);',
      '  color:var(--tinte,#2d2924);animation:larshoch .22s ease-out}',
      '@keyframes larshoch{from{transform:translateY(10px)}to{transform:none}}',
      '#' + ID_DECK + ' h2{font-family:var(--hand,"Patrick Hand",cursive);',
      '  font-weight:400;font-size:23px;margin:0 0 4px}',
      '#' + ID_DECK + ' ol{margin:14px 0 0;padding-left:0;list-style:none;',
      '  counter-reset:larsschritt}',
      '#' + ID_DECK + ' li{counter-increment:larsschritt;position:relative;',
      '  padding:0 0 16px 34px}',
      '#' + ID_DECK + ' li::before{content:counter(larsschritt);',
      '  position:absolute;left:0;top:1px;width:23px;height:23px;',
      '  border-radius:50%;background:var(--akzent,#9867A5);color:#fff;',
      '  font-size:13px;display:flex;align-items:center;justify-content:center}',
      '#' + ID_DECK + ' .tat{font:inherit;font-weight:600;cursor:pointer;',
      '  margin:8px 0 0;padding:.55em 1.1em;border:0;border-radius:8px;',
      '  background:var(--akzent,#9867A5);color:#fff}',
      '#' + ID_DECK + ' .tat[disabled]{opacity:.5;cursor:default}',
      '#' + ID_DECK + ' .leer{font:inherit;cursor:pointer;margin:8px 8px 0 0;',
      '  padding:.5em 1em;border:1px solid var(--linie,#e4d9c7);',
      '  border-radius:8px;background:var(--karte,#fffefb);',
      '  color:var(--tinte,#2d2924)}',
      '#' + ID_DECK + ' .zart{color:var(--matt,#6c6357);font-size:13.5px}',
      '#' + ID_DECK + ' code{font-size:13px;background:var(--creme,#f6ecdf);',
      '  padding:1px 4px;border-radius:4px}',
      /* Zwei Spalten, nicht so viele wie hineinpassen: Vier Felder
         stehen dann als 2x2 da statt als 3+1 — eine Reihe, die zur
         Zahl passt. Unter 30rem wird eine Spalte daraus. */
      '#' + ID_DECK + ' .namen{display:grid;gap:7px;margin:8px 0 0;',
      '  grid-template-columns:repeat(2,minmax(0,1fr))}',
      '@media (max-width:30rem){#' + ID_DECK + ' .namen{',
      '  grid-template-columns:1fr}}',
      '#' + ID_DECK + ' .namen input{font:inherit;padding:.45em .6em;',
      '  border:1px solid var(--linie,#e4d9c7);border-radius:7px;',
      '  background:var(--papier,#f8f4ec);color:inherit;width:100%}',
      '#' + ID_DECK + ' .namen input:focus{outline:2px solid ',
      '  var(--akzent,#9867A5);outline-offset:1px}',
      '#' + ID_DECK + ' .mehr{font:inherit;font-size:13.5px;background:none;',
      '  border:0;color:var(--matt,#6c6357);cursor:pointer;padding:6px 0 0;',
      '  border-bottom:1px solid currentColor;margin-top:8px}',
      '#' + ID_DECK + ' .mahnung{color:var(--falsch,#C0392B);font-size:13.5px;',
      '  margin:.5em 0 0}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ---------- 1. Die Anzeige im Kopf ---------- */

  function kopfanzeige() {
    if (document.getElementById(ID_KOPF)) return;
    var kopf = document.querySelector('header');
    if (!kopf) return;

    var g = el('div');
    g.id = ID_KOPF;
    g.appendChild(el('span', 'punkt'));
    g.appendChild(el('span', null, 'Aufnahme läuft'));
    var uhr = el('span', 'uhr', '00:00');
    g.appendChild(uhr);
    var pegel = el('span', 'pegel');
    var fuell = el('i');
    pegel.appendChild(fuell);
    g.appendChild(pegel);

    /* Der Notausgang, siehe Kopf der Datei: klein, aber immer da. */
    var schluss = el('button', 'schluss', 'beenden');
    schluss.type = 'button';
    schluss.onclick = function () { deckseite(); };
    g.appendChild(schluss);

    /* Vor die Navigation, nicht dahinter: `nav` traegt in Kaspers
       CSS ein `margin-left:auto` und bleibt damit rechts aussen. */
    var nav = kopf.querySelector('nav');
    if (nav) kopf.insertBefore(g, nav); else kopf.appendChild(g);

    pegelmesser();
    uhrLaeuft = setInterval(function () {
      var A = auf();
      if (!A || !A.laeuft) return;
      var s = Math.floor((performance.now() - A.t0) / 1000);
      uhr.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' +
                        String(s % 60).padStart(2, '0');
      fuell.style.width = Math.round(pegelwert() * 100) + '%';
    }, 500);
  }

  /* Der Pegel haengt an derselben Spur, die aufgenommen wird — nicht
     an einer zweiten Mikrofonanfrage. Faellt der AudioContext aus,
     bleibt der Balken auf null; die Anzeige laeuft weiter. */
  function pegelmesser() {
    try {
      var A = auf();
      if (!A || !A.spur) return;
      var Kontext = window.AudioContext || window.webkitAudioContext;
      var k = new Kontext();
      var q = k.createMediaStreamSource(A.spur);
      messer = k.createAnalyser();
      messer.fftSize = 512;
      q.connect(messer);
      messdaten = new Uint8Array(messer.fftSize);
    } catch (e) { messer = null; }
  }

  function pegelwert() {
    if (!messer) return 0;
    messer.getByteTimeDomainData(messdaten);
    var s = 0;
    for (var i = 0; i < messdaten.length; i++) {
      var v = (messdaten[i] - 128) / 128;
      s += v * v;
    }
    return Math.min(1, Math.sqrt(s / messdaten.length) * 6);
  }

  function kopfanzeigeWeg() {
    if (uhrLaeuft) { clearInterval(uhrLaeuft); uhrLaeuft = null; }
    var g = document.getElementById(ID_KOPF);
    if (g) g.remove();
  }

  /* ---------- 2. Der rote Knopf aus der Fussleiste ---------- */

  function roteKnoepfeWeg() {
    var k = document.querySelectorAll('.leiste button');
    for (var i = 0; i < k.length; i++)
      if (/Aufnahme beenden und sichern/.test(k[i].textContent)) k[i].remove();
  }

  /* ---------- 3. Der Fertig-Knopf in der letzten Etappe ---------- */

  /* Die letzte Etappe erkennt sie an Kaspers Zustand. `stand` und
     `ETAPPEN` stehen als `let`/`const` im globalen Bereich — nicht
     an `window`, aber von hier aus lesbar, weil diese Datei nach
     `flaeche.js` geladen wird. Faellt das aus, entscheidet die
     Navigationsleiste: der letzte Knopf mit `aria-current`. */
  function letzteEtappe() {
    try {
      if (typeof stand !== 'undefined' && typeof ETAPPEN !== 'undefined')
        return stand.aufnahme !== null && ETAPPEN.length > 0 &&
               stand.etappe === ETAPPEN.length - 1;
    } catch (e) { /* weiter unten */ }
    var k = document.querySelectorAll('#nav button');
    return k.length > 1 &&
           k[k.length - 1].getAttribute('aria-current') === 'true';
  }

  function fertigknopf() {
    var leiste = document.querySelector('.leiste');
    if (!leiste) return;
    var da = document.getElementById(ID_FERTIG);
    if (!letzteEtappe()) { if (da) da.remove(); return; }
    if (da) return;
    var b = el('button', 'knopf leer', 'Fertig — Aufnahme abgeben →');
    b.id = ID_FERTIG;
    b.type = 'button';
    b.style.marginLeft = 'auto';
    b.onclick = function () { deckseite(); };
    leiste.appendChild(b);
  }

  /* ---------- 4. Die Deckseite ---------- */

  function deckseite() {
    if (document.getElementById(ID_DECK)) return;
    gestalt();

    var deck = el('div');
    deck.id = ID_DECK;
    var blatt = el('div', 'blatt');
    deck.appendChild(blatt);

    blatt.appendChild(el('h2', null, 'Fertig — und jetzt die Abgabe'));
    var vorspann = el('p', 'zart',
      'Drei Schritte, dann sind Sie durch. Die Aufnahme läuft noch, ' +
      'solange Sie nicht auf den Sichern-Knopf drücken.');
    blatt.appendChild(vorspann);

    var liste = el('ol');

    /* Schritt 1 — die Namen. Erst hier, nicht am Anfang: siehe Kopf
       der Datei. Vier Felder stehen von selbst da, weitere auf
       Wunsch. */
    var s0 = el('li');
    s0.appendChild(el('div', null,
      '<b>Wer hat gemeinsam gearbeitet?</b>'));
    s0.appendChild(el('p', 'zart',
      'Bitte Vor- und Nachnamen — sie kommen in den Dateinamen, damit ' +
      'wir die Aufnahme zuordnen können. Wer allein gearbeitet hat, ' +
      'füllt nur das erste Feld aus.'));
    var felder = el('div', 'namen');
    for (var n = 0; n < 4; n++) {
      var f0 = document.createElement('input');
      f0.type = 'text';
      f0.autocomplete = n === 0 ? 'name' : 'off';
      f0.placeholder = n === 0 ? 'Ihr Name' : 'Weiterer Name';
      felder.appendChild(f0);
    }
    s0.appendChild(felder);
    var mehr = el('button', 'mehr', 'Noch ein Feld');
    mehr.type = 'button';
    mehr.onclick = function () {
      var f1 = document.createElement('input');
      f1.type = 'text';
      f1.autocomplete = 'off';
      f1.placeholder = 'Weiterer Name';
      felder.appendChild(f1);
      f1.focus();
    };
    s0.appendChild(mehr);
    var mahnung = el('p', 'mahnung');
    mahnung.style.display = 'none';
    s0.appendChild(mahnung);
    liste.appendChild(s0);

    function namenLesen() {
      var raus = [];
      var e = felder.querySelectorAll('input');
      for (var i = 0; i < e.length; i++) {
        var w = e[i].value.trim();
        if (w) raus.push(w);
      }
      return raus;
    }

    /* Schritt 2 — beenden und sichern. */
    var s1 = el('li');
    s1.appendChild(el('div', null,
      '<b>Aufnahme beenden und die zwei Dateien sichern</b>'));
    s1.appendChild(el('p', 'zart',
      'Der Browser legt sie in Ihren Download-Ordner: eine mit der ' +
      'Endung <code>.webm</code> (der Ton) und eine mit ' +
      '<code>_ereignisse.json</code> (was auf der Fläche geschah). ' +
      '<b>Beide werden gebraucht.</b>'));
    var k1 = el('button', 'tat', 'Aufnahme beenden und sichern');
    k1.type = 'button';
    s1.appendChild(k1);

    /* Nachfrage statt Behauptung — dieselbe Ueberlegung wie bei Pias
       Pruefungsabschluss: `herunterladen()` ist ein Klick auf einen
       `<a download>` und meldet nichts zurueck. Eine Seite, die
       «Gespeichert ✓» schreibt, ohne es wissen zu koennen, laesst
       genau den im Glauben, bei dem es klemmt. */
    var frage1 = el('div');
    frage1.style.display = 'none';
    frage1.appendChild(el('p', null,
      'Liegen jetzt <b>beide</b> Dateien in Ihrem Download-Ordner?'));
    var jaK = el('button', 'leer', 'Ja, beide sind da');
    var neinK = el('button', 'leer', 'Nein, da fehlt etwas');
    jaK.type = 'button'; neinK.type = 'button';
    frage1.appendChild(jaK);
    frage1.appendChild(neinK);
    var klemmt = el('p', 'zart');
    klemmt.style.display = 'none';
    klemmt.innerHTML = 'Dann bleiben Sie bitte auf dieser Seite und ' +
      'schliessen den Browser noch nicht. Versuchen Sie es noch einmal ' +
      'mit dem Knopf oben — er speichert erneut. Klappt es weiterhin ' +
      'nicht, schreiben Sie Ihrer Dozentin; die Aufnahme ist nicht ' +
      'verloren, solange dieses Fenster offen bleibt.';
    frage1.appendChild(klemmt);
    s1.appendChild(frage1);
    liste.appendChild(s1);

    /* Schritt 3 — abgeben. Nicht gesperrt, nur nummeriert: Wer
       den Ordner schon offen hat, findet hier trotzdem seinen Weg. */
    var s2 = el('li');
    s2.appendChild(el('div', null,
      '<b>Beide Dateien in das Abgabefenster ziehen</b>'));
    if (ZIEL) {
      s2.appendChild(el('p', 'zart',
        'Der Ordner nimmt Dateien nur entgegen — Sie sehen darin ' +
        'nichts von anderen.'));
      var k2 = el('button', 'tat', 'Abgabefenster öffnen');
      k2.type = 'button';
      k2.onclick = function () {
        window.open(ZIEL, 'larsabgabe', 'noopener') ||
          window.open(ZIEL, '_blank', 'noopener');
      };
      s2.appendChild(k2);
    } else {
      /* Ohne Adresse kein Knopf, aber auch keine Sackgasse. */
      s2.appendChild(el('p', 'zart',
        'Schicken Sie die beiden Dateien Ihrer Dozentin.'));
    }
    liste.appendChild(s2);
    blatt.appendChild(liste);

    blatt.appendChild(el('p', 'zart',
      'Klappt das Abgeben nicht? Die beiden Dateien bleiben in Ihrem ' +
      'Download-Ordner liegen — schicken Sie sie dann auf einem anderen ' +
      'Weg an Ihre Dozentin, und sagen Sie kurz Bescheid, dass es nicht ' +
      'ging.'));

    /* Zurueck zur Aufgabe. Solange die Aufnahme laeuft, ist das ein
       echtes Zurueck; danach heisst der Knopf, was er dann noch tut:
       die Karten wieder ansehen. Weitersortiert wird nicht mehr —
       das haelt Kaspers Flaeche selbst so. */
    var zurueck = el('button', 'leer', 'Zurück zur Aufgabe');
    zurueck.type = 'button';
    zurueck.style.marginTop = '10px';
    zurueck.onclick = function () { deck.remove(); };
    blatt.appendChild(zurueck);

    /* Einmal mahnen, beim zweiten Druck sichern. Rikes Regel «keine
       Sperre, die aussperrt»: Wer den Namen partout nicht eintraegt,
       bekommt seine Dateien trotzdem — sie sind sonst weg, sobald er
       das Fenster schliesst. Der zweite Satz sagt ihm dann, was das
       fuer die Zuordnung bedeutet. */
    var gemahnt = false;
    k1.onclick = function () {
      var namen = namenLesen();
      if (!namen.length && !gemahnt) {
        gemahnt = true;
        mahnung.style.display = '';
        mahnung.textContent = 'Bitte tragen Sie mindestens einen Namen ' +
          'ein — sonst wissen wir nicht, wessen Aufnahme das ist.';
        var erstes = felder.querySelector('input');
        if (erstes) erstes.focus();
        return;
      }
      if (!namen.length) {
        mahnung.textContent = 'Wir sichern jetzt ohne Namen. Schreiben ' +
          'Sie Ihrer Dozentin, von wem die Aufnahme ist — aus der Datei ' +
          'allein geht es nicht hervor.';
      } else {
        mahnung.style.display = 'none';
      }
      k1.disabled = true;
      k1.textContent = 'Wird gesichert …';
      beendenUndSichern(namen, function () {
        k1.disabled = false;
        k1.textContent = 'Nochmals sichern';
        frage1.style.display = '';
        kopfanzeigeWeg();
        /* Der Vorspann sprach von einer laufenden Aufnahme — jetzt
           laeuft keine mehr. Ein Satz, der nach dem Sichern noch
           dasselbe behauptet, laesst offen, ob der Knopf gewirkt
           hat. */
        vorspann.textContent = 'Die Aufnahme ist beendet und gesichert. ' +
          'Bleibt noch die Abgabe.';
        zurueck.textContent = 'Karten wieder ansehen';
      });
    };
    jaK.onclick = function () {
      klemmt.style.display = 'none';
      jaK.textContent = 'Gut ✓';
      jaK.disabled = true;
    };
    neinK.onclick = function () { klemmt.style.display = ''; };

    document.body.appendChild(deck);
  }

  /* Beenden und sichern — mit dem letzten Brocken, siehe Kopf der
     Datei. Ohne Aufnehmer (jemand hat schon beendet) wird trotzdem
     gesichert: Die Brocken liegen dann bereits vollstaendig vor. */
  function beendenUndSichern(namen, fertig) {
    var A = auf();
    if (!A) { fertig(); return; }
    var r = A.aufnehmer;
    var name = dateiname(namen);
    /* Die Namen auch in den Ereignisstrom, nicht nur in den
       Dateinamen: Wer eine Datei umbenennt oder nur die `.webm`
       abgibt, wuerde sonst unauffindbar. `merken` steht in Kaspers
       schlanker Fassung und schreibt in dieselbe Liste, die gleich
       gesichert wird. */
    if (namen && namen.length && A.merken) A.merken('namen', {namen: namen});
    if (A.laeuft && r && r.state !== 'inactive') {
      var geschehen = false;
      var tun = function () {
        if (geschehen) return;
        geschehen = true;
        A.sichern(name);
        fertig();
      };
      r.addEventListener('stop', tun, { once: true });
      /* Notnagel: Bleibt `stop` aus, wird nach einer Sekunde trotzdem
         gesichert — lieber vier Sekunden Ton weniger als gar keine
         Datei. */
      setTimeout(tun, 1000);
      A.beenden();
    } else {
      A.sichern(name);
      fertig();
    }
  }

  /* ---------- 5. Der Startbildschirm sagt jetzt die Wahrheit ----------

     Kaspers Startfeld schliesst mit «Am Ende speichern Sie Ton und
     Verlauf selbst — die Ablage richten wir spaeter ein». In KASPER
     stimmt das; hier steht die Ablage seit dem 09.09.2026. Ein Satz,
     der einer Studentin sagt, es gebe noch keinen Abgabeort, waehrend
     zwei Klicks weiter das Abgabefenster steht, kostet genau die, die
     ihn liest. */
  function starttextRichten() {
    if (!ZIEL) return;
    var p = document.querySelectorAll('.hinweis');
    for (var i = 0; i < p.length; i++) {
      if (!/Ablage richten wir später ein/.test(p[i].textContent)) continue;
      p[i].innerHTML = 'Es wird nichts von selbst hochgeladen. Am Ende ' +
        'speichern Sie Ton und Verlauf selbst und legen beide Dateien ' +
        'in das Abgabefenster — der Weg dorthin steht am Schluss auf ' +
        'dieser Seite.';
    }
  }

  /* ---------- Der Wachdienst ----------
     Kaspers Flaeche baut Kopf und Fussleiste bei jedem Etappenwechsel
     neu. Ein einmaliger Griff waere nach dem ersten Klick wieder weg;
     deshalb ein Beobachter, der nach jeder Aenderung nachsieht. Er
     ist billig: Er liest nur, was ohnehin im Dokument steht. */
  function nachsehen() {
    starttextRichten();
    roteKnoepfeWeg();
    if (laeuft()) {
      gestalt();
      kopfanzeige();
      fertigknopf();
    } else if (!document.getElementById(ID_DECK)) {
      kopfanzeigeWeg();
    }
  }

  function los() {
    gestalt();
    nachsehen();
    var wach = new MutationObserver(function () { nachsehen(); });
    wach.observe(document.body, { childList: true, subtree: true });
    /* Der Start der Aufnahme aendert das Dokument nicht in jedem Fall
       sichtbar — deshalb zusaetzlich ein ruhiger Takt. */
    setInterval(nachsehen, 1000);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', los);
  else los();
})();
