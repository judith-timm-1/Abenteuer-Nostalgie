/* ABENTEUER NOSTALGIE – kleine Ergänzungen
   Die Website funktioniert vollständig ohne dieses Skript. */
(function () {
  "use strict";

  /* ---------- 0. Dunkelmodus ----------
     Ohne JavaScript folgt die Seite der Einstellung des Geräts (hell/dunkel).
     Mit JavaScript erscheint im Kopfbereich ein Knopf zum Umschalten.
     Die Wahl wird im Browser gespeichert und gilt auf allen Seiten. */
  var wurzel = document.documentElement;
  var systemDunkel = window.matchMedia("(prefers-color-scheme: dark)");
  var SPEICHER = "abenteuer-nostalgie-farbmodus";

  function gespeicherterModus() {
    try {
      var wert = window.localStorage.getItem(SPEICHER);
      return wert === "dark" || wert === "light" ? wert : null;
    } catch (fehler) {
      return null; // z. B. privates Fenster: dann einfach Systemeinstellung
    }
  }

  function speichereModus(wert) {
    try {
      window.localStorage.setItem(SPEICHER, wert);
    } catch (fehler) { /* nicht schlimm */ }
  }

  function istDunkel() {
    var gewaehlt = wurzel.getAttribute("data-theme");
    return gewaehlt ? gewaehlt === "dark" : systemDunkel.matches;
  }

  // gespeicherte Wahl so früh wie möglich anwenden
  var start = gespeicherterModus();
  if (start) wurzel.setAttribute("data-theme", start);

  var kopf = document.querySelector(".kopf__innen");
  if (kopf) {
    var modusKnopf = document.createElement("button");
    modusKnopf.type = "button";
    modusKnopf.className = "modus-knopf";
    modusKnopf.innerHTML =
      '<span class="modus-knopf__symbol" aria-hidden="true"></span>' +
      "Dunkelmodus" +
      '<span class="modus-knopf__status" aria-hidden="true"></span>';
    var statusText = modusKnopf.querySelector(".modus-knopf__status");

    var aktualisiereKnopf = function () {
      var dunkel = istDunkel();
      modusKnopf.setAttribute("aria-pressed", dunkel ? "true" : "false");
      statusText.textContent = dunkel ? "an" : "aus";
    };

    modusKnopf.addEventListener("click", function () {
      var neu = istDunkel() ? "light" : "dark";
      wurzel.setAttribute("data-theme", neu);
      speichereModus(neu);
      aktualisiereKnopf();
    });

    // ändert jemand die Geräteeinstellung und hat nichts selbst gewählt: mitgehen
    systemDunkel.addEventListener("change", aktualisiereKnopf);

    aktualisiereKnopf();
    kopf.appendChild(modusKnopf);
  }

  /* ---------- 1. Tilt-Effekt für Ticket- und Programmkarten ----------
     Nur mit Maus (hover: hover, pointer: fine) und ohne reduzierte Bewegung.
     Die Neigung wird über die CSS-Variablen --rx und --ry gesetzt. */
  var feineMaus = window.matchMedia("(hover: hover) and (pointer: fine)");
  var wenigBewegung = window.matchMedia("(prefers-reduced-motion: reduce)");
  var MAX_GRAD = 8;

  function neige(karte, ereignis) {
    var r = karte.getBoundingClientRect();
    var x = (ereignis.clientX - r.left) / r.width - 0.5;  // -0.5 … 0.5
    var y = (ereignis.clientY - r.top) / r.height - 0.5;
    karte.style.setProperty("--ry", (x * 2 * MAX_GRAD).toFixed(2) + "deg");
    karte.style.setProperty("--rx", (-y * 2 * MAX_GRAD).toFixed(2) + "deg");
  }

  function zuruecksetzen(karte) {
    karte.classList.remove("tilt--aktiv");
    karte.style.removeProperty("--rx");
    karte.style.removeProperty("--ry");
  }

  document.querySelectorAll(".tilt").forEach(function (karte) {
    karte.addEventListener("pointermove", function (e) {
      if (!feineMaus.matches || wenigBewegung.matches || e.pointerType !== "mouse") return;
      karte.classList.add("tilt--aktiv");
      neige(karte, e);
    });
    karte.addEventListener("pointerleave", function () {
      zuruecksetzen(karte);
    });
  });

  /* ---------- 2. Freundliche Bestätigung beim Ticketformular ----------
     Das submit-Ereignis kommt erst, wenn alle Pflichtfelder gültig sind. */
  var formular = document.getElementById("ticketformular");
  var status = document.getElementById("formular-status");

  if (formular && status) {
    formular.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = formular.elements["name"].value.trim();
      var anzahl = formular.elements["anzahl"].value;
      var art = formular.elements["ticketart"];
      var artText = art.options[art.selectedIndex].text;
      var karten = anzahl === "1" ? "1 Karte" : anzahl + " Karten";

      status.textContent =
        "Vielen Dank, " + name + "! Ihre Bestellung (" + karten + ", " + artText +
        ") ist bei uns angekommen. Wir freuen uns auf Sie am 28. Februar 2027. " +
        "Kleiner Hinweis: Dies ist ein Studienprojekt der Kunstschule Wandsbek – " +
        "es wurden keine Daten verschickt und keine echten Karten bestellt.";
      status.setAttribute("tabindex", "-1");
      status.focus();
    });
  }
})();