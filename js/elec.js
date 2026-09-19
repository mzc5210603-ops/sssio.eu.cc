/* CIRCUIT · 电学计算核心（纯函数） */
var Elec = (function () {
  'use strict';

  /* U1 欧姆定律 V=IR，已知任意两个求第三个 */
  function ohm(v, i, r) {
    if (v == null && i != null && r != null) return { v: i * r, i: i, r: r };
    if (i == null && v != null && r != null) return { v: v, i: v / r, r: r };
    if (r == null && v != null && i != null) return { v: v, i: i, r: v / i };
    return { v: v, i: i, r: r };
  }

  /* U2 电功率 P=VI=I²R=V²/R，给两个量求功率 */
  function power(a, b, mode) {
    /* mode: 'vi' | 'ir' | 'vr' */
    if (mode === 'vi') return a * b;
    if (mode === 'ir') return a * a * b;       /* a=I, b=R */
    if (mode === 'vr') return a * a / b;       /* a=V, b=R */
    return NaN;
  }

  /* U3 电阻串并联 */
  function seriesR(rs) { return rs.reduce((s, r) => s + r, 0); }
  function parallelR(rs) {
    if (!rs.length) return 0;
    var inv = rs.reduce((s, r) => s + 1 / r, 0);
    return 1 / inv;
  }
  /* 色环→阻值：4 环 */
  var RING = {
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
    gold: -1, silver: -2
  };
  var TOL = { gold: 5, silver: 10, brown: 1, red: 2, green: 0.5, blue: 0.25, violet: 0.1, gray: 0.05, none: 20 };
  function resistor4(r1, r2, mult, tol) {
    var base = r1 * 10 + r2;
    var m = (mult === 'gold') ? 0.1 : (mult === 'silver') ? 0.01 : Math.pow(10, mult);
    var r = base * m;
    var t = TOL[tol] != null ? TOL[tol] : 20;
    return { r: r, tol: t, min: r * (1 - t / 100), max: r * (1 + t / 100) };
  }

  /* U4 分压：Vin 加在 R1(上) 与 R2(下) 串联，Vout = Vout across R2 */
  function voltDivider(vin, r1, r2) {
    var vout = vin * r2 / (r1 + r2);
    var i = vin / (r1 + r2);
    return { vout: vout, i: i, p1: i * i * r1, p2: i * i * r2 };
  }

  /* U5 分流：Iin 流入 R1 与 R2 并联，求各支路电流 */
  function currDivider(iin, r1, r2) {
    var i1 = iin * r2 / (r1 + r2);
    var i2 = iin * r1 / (r1 + r2);
    var v = i1 * r1;
    return { i1: i1, i2: i2, v: v, req: parallelR([r1, r2]) };
  }

  /* U6 RC 时间常数 */
  function rcTau(r, c) { return r * c; }
  /* 电容充电：Vc(t) = Vs(1 - e^(-t/RC)) */
  function capCharge(vs, r, c, t) {
    var tau = rcTau(r, c);
    return { tau: tau, vc: vs * (1 - Math.exp(-t / tau)), ic: (vs / r) * Math.exp(-t / tau) };
  }
  /* 电容放电：Vc(t) = V0·e^(-t/RC) */
  function capDischarge(v0, r, c, t) {
    var tau = rcTau(r, c);
    return { tau: tau, vc: v0 * Math.exp(-t / tau), ic: (v0 / r) * Math.exp(-t / tau) };
  }

  /* U7 LC 谐振 */
  function lcFreq(l, c) { return 1 / (2 * Math.PI * Math.sqrt(l * c)); }
  function lcQ(r, l, c) { return (1 / r) * Math.sqrt(l / c); }
  function lcBandwidth(f0, q) { return f0 / q; }

  /* U8 交流阻抗 */
  function capReactance(c, f) { return 1 / (2 * Math.PI * f * c); }
  function indReactance(l, f) { return 2 * Math.PI * f * l; }
  function impedance(r, xl, xc) {
    var x = xl - xc;
    return { z: Math.sqrt(r * r + x * x), phi: Math.atan2(x, r), x: x };
  }

  return {
    ohm: ohm, power: power,
    seriesR: seriesR, parallelR: parallelR, resistor4: resistor4, RING: RING, TOL: TOL,
    voltDivider: voltDivider, currDivider: currDivider,
    rcTau: rcTau, capCharge: capCharge, capDischarge: capDischarge,
    lcFreq: lcFreq, lcQ: lcQ, lcBandwidth: lcBandwidth,
    capReactance: capReactance, indReactance: indReactance, impedance: impedance
  };
})();
if (typeof window !== 'undefined') window.Elec = Elec;
