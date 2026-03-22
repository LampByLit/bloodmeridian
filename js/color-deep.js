(function () {
  "use strict";

  var data = window.__BM_COLOR__;
  if (!data || !data.occurrences) return;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderHitSentence(sentence, start, end) {
    return (
      escapeHtml(sentence.slice(0, start)) +
      '<mark class="concordance__hit">' +
      escapeHtml(sentence.slice(start, end)) +
      "</mark>" +
      escapeHtml(sentence.slice(end))
    );
  }

  var families = data.families || [];
  var byFamilyWords = data.byFamilyWords || {};
  var occurrences = data.occurrences || [];
  var meta = data.meta || {};

  /* --- Family cards --- */
  var cardsEl = document.getElementById("color-family-cards");
  if (cardsEl) {
    cardsEl.innerHTML = "";
    families.forEach(function (f) {
      var words = byFamilyWords[f.id] || {};
      var rows = Object.keys(words)
        .map(function (w) {
          return { w: w, n: words[w] };
        })
        .sort(function (a, b) {
          return b.n - a.n || a.w.localeCompare(b.w);
        });

      var col = document.createElement("div");
      col.className = "col-12 col-md-6 col-xl-4";

      var card = document.createElement("article");
      card.className = "color-family-card";
      card.style.setProperty("--concord-accent", f.hex || "#666");

      var head = document.createElement("div");
      head.className = "color-family-card__head";

      var sw = document.createElement("div");
      sw.className = "color-family-card__swatch";
      sw.style.background = f.hex || "#888";
      sw.setAttribute("aria-hidden", "true");

      var titles = document.createElement("div");
      var h = document.createElement("h3");
      h.className = "color-family-card__label";
      h.textContent = f.label;
      var sub = document.createElement("p");
      sub.className = "color-family-card__count";
      var total = rows.reduce(function (acc, r) {
        return acc + r.n;
      }, 0);
      sub.textContent = total + " hit" + (total === 1 ? "" : "s");
      titles.appendChild(h);
      titles.appendChild(sub);
      head.appendChild(sw);
      head.appendChild(titles);

      var table = document.createElement("table");
      table.className = "color-family-card__table";
      var tbody = document.createElement("tbody");
      rows.forEach(function (row) {
        var tr = document.createElement("tr");
        var tdL = document.createElement("td");
        tdL.textContent = row.w;
        var tdR = document.createElement("td");
        tdR.textContent = String(row.n);
        tr.appendChild(tdL);
        tr.appendChild(tdR);
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      card.appendChild(head);
      card.appendChild(table);
      col.appendChild(card);
      cardsEl.appendChild(col);
    });
  }

  /* --- Concordance --- */
  var famFilter = document.getElementById("concord-family-filter");
  var wordFilter = document.getElementById("concord-word-filter");
  var textFilter = document.getElementById("concord-text-filter");
  var listEl = document.getElementById("concord-list");

  function uniqueWordsForFamily(famId) {
    var set = {};
    occurrences.forEach(function (o) {
      if (famId === "all" || o.family === famId) set[o.word] = true;
    });
    return Object.keys(set).sort(function (a, b) {
      return a.localeCompare(b);
    });
  }

  function fillWordSelect(famId) {
    if (!wordFilter) return;
    var words = uniqueWordsForFamily(famId);
    var prev = wordFilter.value;
    wordFilter.innerHTML = "";
    var optAll = document.createElement("option");
    optAll.value = "all";
    optAll.textContent = "All lemmas";
    wordFilter.appendChild(optAll);
    words.forEach(function (w) {
      var opt = document.createElement("option");
      opt.value = w;
      opt.textContent = w;
      wordFilter.appendChild(opt);
    });
    if (words.indexOf(prev) !== -1) wordFilter.value = prev;
  }

  if (famFilter) {
    famFilter.innerHTML = "";
    var o0 = document.createElement("option");
    o0.value = "all";
    o0.textContent = "All families";
    famFilter.appendChild(o0);
    families.forEach(function (f) {
      var opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = f.label;
      famFilter.appendChild(opt);
    });
    famFilter.addEventListener("change", function () {
      fillWordSelect(famFilter.value);
      renderConcordance();
    });
  }
  fillWordSelect("all");

  if (wordFilter) {
    wordFilter.addEventListener("change", renderConcordance);
  }
  if (textFilter) {
    textFilter.addEventListener("input", renderConcordance);
  }

  function renderConcordance() {
    if (!listEl) return;
    var fam = famFilter ? famFilter.value : "all";
    var word = wordFilter ? wordFilter.value : "all";
    var q = textFilter ? textFilter.value.toLowerCase().trim() : "";

    var filtered = occurrences.filter(function (o) {
      if (fam !== "all" && o.family !== fam) return false;
      if (word !== "all" && o.word !== word) return false;
      if (q && o.sentence.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });

    listEl.innerHTML = "";
    var frag = document.createDocumentFragment();
    filtered.forEach(function (o) {
      var famObj = families.find(function (f) {
        return f.id === o.family;
      });
      var accent = famObj ? famObj.hex : "#29639c";

      var block = document.createElement("blockquote");
      block.className = "color-concordance__item";
      block.style.setProperty("--concord-accent", accent);
      block.setAttribute(
        "cite",
        "sentence " + (o.sentenceId + 1)
      );

      var p = document.createElement("p");
      p.className = "mb-0";
      p.innerHTML = renderHitSentence(o.sentence, o.start, o.end);
      block.appendChild(p);

      var foot = document.createElement("footer");
      var bits = [
        famObj ? famObj.label : o.family,
        "·",
        "“" + o.word + "”",
        "·",
        "sentence " + (o.sentenceId + 1),
      ];
      if (o.tier === "B") bits.push("· Tier B");
      if (o.contextAfter) {
        var tail = o.contextAfter;
        if (tail.length > 100) tail = tail.slice(0, 97) + "…";
        bits.push("· then: " + tail + " …");
      }
      foot.textContent = bits.join(" ");
      block.appendChild(foot);

      frag.appendChild(block);
    });
    listEl.appendChild(frag);

    var countEl = document.getElementById("concord-count");
    if (countEl) {
      countEl.textContent =
        filtered.length +
        " passage" +
        (filtered.length === 1 ? "" : "s") +
        (meta.totalHits != null ? " (of " + meta.totalHits + ")" : "");
    }
  }

  renderConcordance();

  var deepMeta = document.getElementById("color-deep-meta");
  if (deepMeta && meta.totalHits != null) {
    deepMeta.textContent =
      String(meta.totalHits) +
      " total matches · each card lists lemmas for that family; concordance shows full sentence context.";
  }
})();
