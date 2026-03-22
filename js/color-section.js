(function () {
  "use strict";

  var data = window.__BM_COLOR__;
  if (!data || !data.families || !data.byFamily) return;

  var barsEl = document.getElementById("color-chart-bars");
  var labelEl = document.getElementById("color-chart-label");
  var metaEl = document.getElementById("color-meta");

  var families = data.families;
  var byFamily = data.byFamily;
  var meta = data.meta || {};

  var counts = families.map(function (f) {
    return byFamily[f.id] || 0;
  });
  var max = Math.max.apply(null, counts.concat([1]));

  if (labelEl) {
    labelEl.textContent =
      "Color-word hits by spectral family. " +
      (meta.totalHits != null ? meta.totalHits + " matches in " : "") +
      (meta.sentenceCount != null ? meta.sentenceCount + " sentences." : "");
  }

  if (metaEl) {
    var bits = [
      "Tier " + (meta.tier || "A"),
    ];
    if (meta.tierAHits != null && meta.tierBHits != null && meta.tierBHits > 0) {
      bits.push(" · A: " + meta.tierAHits + ", B: " + meta.tierBHits);
    }
    bits.push(" · generated " + (meta.generatedAt || "").slice(0, 10));
    metaEl.textContent = bits.join("");
  }

  if (barsEl) {
    barsEl.innerHTML = "";
    families.forEach(function (f, i) {
      var n = byFamily[f.id] || 0;
      var h = Math.round((n / max) * 100);
      var col = document.createElement("div");
      col.className = "color-chart__col";
      col.setAttribute("role", "presentation");

      var barWrap = document.createElement("div");
      barWrap.className = "color-chart__bar-wrap";

      var bar = document.createElement("div");
      bar.className = "color-chart__bar";
      bar.style.setProperty("--bar-h", h + "%");
      bar.style.setProperty("--bar-color", f.hex || "#888");
      bar.setAttribute("title", f.label + ": " + n);
      if (h >= 85) bar.classList.add("color-chart__bar--glow");

      var nEl = document.createElement("span");
      nEl.className = "color-chart__n";
      nEl.textContent = String(n);

      var cap = document.createElement("span");
      cap.className = "color-chart__cap";
      cap.textContent = f.label;

      barWrap.appendChild(bar);
      bar.appendChild(nEl);
      col.appendChild(barWrap);
      col.appendChild(cap);
      barsEl.appendChild(col);
    });
  }
})();
