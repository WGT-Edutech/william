/*!
 * vp-engine.js — pure variable-proximity maths for the margreenie site.
 * No DOM access: loaded by the page (window.VPEngine) AND unit-tested in Node.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.VPEngine = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // VP ENGINE START
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smoothstep(t) { t = clamp01(t); return t * t * (3 - 2 * t); }
  function smootherstep(t) { t = clamp01(t); return t * t * t * (t * (t * 6 - 15) + 10); }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /**
   * Cursor proximity -> variable-font values. Plain numbers in, plain numbers out.
   *
   * @param {object} o
   *   cx, cy      cursor position (viewport px)
   *   ex, ey      element centre (viewport px)
   *   radius      proximity radius in px (0 = disabled)
   *   baseW       the element's own font-weight (computed style)
   *   swing       how far wght moves, as a fraction of baseW (0..1)
   *   strength    global VP strength multiplier (0 = off)
   *   opszBase    optical-size rest value, or null to skip opsz entirely
   *   opszSwing   how far opsz moves, as a fraction of opszBase (0..1)
   * @returns {{wght:number, opsz:number|null, t:number, dist:number}}
   */
  function compute(o) {
    var cx = +o.cx || 0, cy = +o.cy || 0;
    var ex = +o.ex || 0, ey = +o.ey || 0;
    var radius = +o.radius || 0;
    var baseW = +o.baseW || 400;
    var swing = clamp(+o.swing || 0, 0, 1);
    var strength = clamp(o.strength == null ? 1 : +o.strength, 0, 1);
    var dx = cx - ex, dy = cy - ey;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var t = radius > 0 ? clamp01(1 - dist / radius) : 0;
    t = smootherstep(t) * strength;   // quintic: round, soft-edged blob

    var wMax = clamp(baseW * (1 + swing), 100, 1000);
    var wMin = clamp(baseW * (1 - swing), 100, 1000);
    if (wMin > wMax) { var tmp = wMin; wMin = wMax; wMax = tmp; }
    var wght = Math.round(wMin + (wMax - wMin) * t);

    var opsz = null;
    if (o.opszBase != null) {
      var ob = clamp(+o.opszBase, 8, 144);
      var os = clamp(+o.opszSwing || 0, 0, 1);
      var oMax = clamp(ob * (1 + os), 8, 144);
      var oMin = clamp(ob * (1 - os), 8, 144);
      if (oMin > oMax) { var t2 = oMin; oMin = oMax; oMax = t2; }
      opsz = Math.round(oMin + (oMax - oMin) * t);
    }
    return { wght: wght, opsz: opsz, t: t, dist: dist };
  }

  /** CSS font-variation-settings value for wght (+ optional opsz). */
  function formatSettings(wght, opsz) {
    var s = '"wght" ' + Math.round(wght);
    if (opsz != null) { s += ', "opsz" ' + Math.round(opsz); }
    return s;
  }
  // VP ENGINE END

  return {
    clamp01: clamp01,
    smoothstep: smoothstep,
    smootherstep: smootherstep,
    clamp: clamp,
    compute: compute,
    formatSettings: formatSettings
  };
}));
