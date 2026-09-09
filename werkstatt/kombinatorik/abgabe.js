/* ============================================================
   LARS — der Abgabeweg der Strategieaufgaben

   NICHT von Kasper. Diese Datei gehoert LARS und wird beim
   Uebernehmen danebengelegt (`werkzeuge/werkstatt_uebernehmen.py`).

   WARUM ES SIE GIBT. Kaspers `aufnahme.js` sagt es selbst:

     «Speichern: Ton und Ereignisse getrennt, beides ueber den
      Browser. Keine Uebertragung an eine Ablage - die Adresse
      fehlt bewusst.»

   Das ist in KASPER richtig: Dort gibt es keinen Kurs und keine
   Ablage. In der Lernlandschaft gibt es beides -- und ohne den
   letzten Schritt endet der Weg im Download-Ordner. Genau die
   Luecke, die Rike am 09.09.2026 geschlossen haben wollte: «Ich
   will sauber erklaeren, wie Studierende die Kompensation machen.»

   DIESELBE BAUART WIE BEI DER PRUEFUNG (`pruefungen_uebernehmen.py`
   setzt dort `PIA_ABGABE`): Kaspers Quelle bleibt unberuehrt,
   geaendert wird die Kopie, und zwar an einer Stelle.

   ZWEI DATEIEN, NICHT EINE. Die Pruefung schnuert ein ZIP; hier
   fallen `..._aufnahme.webm` und `..._aufnahme_ereignisse.json`
   getrennt an. Beide werden gebraucht -- die Tonspur ist der
   Nachweis, der Ereignisstrom sagt, was auf der Flaeche geschah.
   Der Text nennt deshalb ausdruecklich BEIDE.

   KEINE SPERRE. Nichts wird freigeschaltet, nichts erscheint
   erst nach einem Klick (Rike, 09.09.2026, zum Pruefungsabschluss:
   ein Weg wird geordnet, nicht versperrt). Der Kasten steht von
   dem Moment an da, in dem jemand «Ja, mit Aufnahme» gewaehlt hat.
   ============================================================ */
(function () {
  'use strict';

  var ZIEL = window.LARS_ABGABE && window.LARS_ABGABE.ablage;
  if (!ZIEL) return;                 // ohne Adresse kein Kasten

  var ID = 'lars-abgabe';

  function el(tag, klasse, html) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* Der Kasten. Bewusst schlicht und ohne eigene Farben: Er soll
     aussehen, als gehoere er zur Seite, nicht als sei er
     angeklebt. Masse und Toene aus Kaspers `flaeche.css`. */
  function kasten() {
    var d = el('div', null);
    d.id = ID;
    d.style.cssText = 'margin:22px auto 40px;max-width:52rem;padding:16px 18px;' +
      'border:1px solid #ddd6ca;border-radius:10px;background:#fffaf2;' +
      'font:15px/1.55 "Fira Sans",system-ui,sans-serif;color:#2c2620';

    d.appendChild(el('div', null,
      '<b>Wenn Sie fertig sind: die Aufnahme abgeben</b>'));

    d.appendChild(el('p', null,
      'Beim Beenden legt der Browser <b>zwei Dateien</b> in Ihren ' +
      'Download-Ordner — eine mit der Endung <code>.webm</code> (der Ton) ' +
      'und eine mit <code>_ereignisse.json</code> (was auf der Fläche ' +
      'geschah). <b>Bitte geben Sie beide ab.</b>'));

    var knopf = el('button', null, 'Abgabefenster öffnen');
    knopf.type = 'button';
    knopf.style.cssText = 'margin:4px 0 2px;padding:.55em 1.1em;border:0;' +
      'border-radius:8px;background:#5B4B8A;color:#fff;font:inherit;' +
      'font-weight:600;cursor:pointer';
    knopf.onclick = function () {
      window.open(ZIEL, 'larsabgabe', 'noopener') ||
        window.open(ZIEL, '_blank', 'noopener');
      hinweis.style.display = '';
    };
    d.appendChild(knopf);

    var hinweis = el('p', null,
      'Ziehen Sie beide Dateien in das Fenster. Der Ordner nimmt Dateien ' +
      'nur entgegen — Sie sehen darin nichts von anderen.');
    hinweis.style.cssText = 'display:none;margin:.6em 0 0;color:#6b6257';
    d.appendChild(hinweis);

    /* Der Ausweg. Dieselbe Ueberlegung wie beim Pruefungsabschluss:
       Die Seite erfaehrt nie, ob die Datei drueben ankam, und wer
       ehrlich ist und bei wem es klemmt, darf nicht ohne Weg
       dastehen. */
    d.appendChild(el('p', null,
      '<small>Klappt das nicht? Die beiden Dateien bleiben in Ihrem ' +
      'Download-Ordner liegen — schicken Sie sie dann auf einem anderen ' +
      'Weg an Ihre Dozentin.</small>'));

    return d;
  }

  function zeigen() {
    if (document.getElementById(ID)) return;
    var wohin = document.querySelector('main') || document.body;
    wohin.appendChild(kasten());
  }

  /* Sobald jemand die Aufnahme gewaehlt hat, steht der Kasten da.
     Erkannt wird das am Sichern-Knopf, den Kaspers `flaeche.js` nur
     dann in die Leiste haengt (`stand.aufnahme && window.Aufnahme`).
     Ein Beobachter statt eines Klicklauschers: So steht der Weg
     schon VOR dem Beenden auf der Seite, nicht erst danach. */
  function suchen() {
    var knoepfe = document.querySelectorAll('button');
    for (var i = 0; i < knoepfe.length; i++) {
      if (/Aufnahme beenden und sichern/.test(knoepfe[i].textContent)) {
        zeigen();
        return true;
      }
    }
    return false;
  }

  function los() {
    if (suchen()) return;
    var beobachter = new MutationObserver(function () { suchen(); });
    beobachter.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', los);
  else los();
})();
