/* CIRCUIT · 路由与视图 */
(function () {
  'use strict';
  var app = document.getElementById('app');
  var E = window.Elec;

  function $(s) { return app.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(app.querySelectorAll(s)); }
  function num(sel, d) {
    var el = $(sel);
    if (!el) return d;
    var v = parseFloat(el.value);
    return isNaN(v) ? d : v;
  }
  function val(sel) { var el = $(sel); return el ? el.value : ''; }
  function fmt(x, n) {
    if (x == null || !isFinite(x)) return '—';
    if (n === undefined) n = 3;
    if (x === 0) return '0';
    var a = Math.abs(x);
    if (a >= 1e6 || a < 1e-3) return x.toExponential(2);
    return (Math.round(x * Math.pow(10, n)) / Math.pow(10, n)).toString();
  }
  function unit(x) {
    if (x == null || !isFinite(x)) return ['—', ''];
    var a = Math.abs(x), p = '', v = x;
    if (a >= 1e6) { p = 'M'; v = x / 1e6; }
    else if (a >= 1e3) { p = 'k'; v = x / 1e3; }
    else if (a >= 1) { p = ''; v = x; }
    else if (a >= 1e-3) { p = 'm'; v = x * 1e3; }
    else if (a >= 1e-6) { p = 'µ'; v = x * 1e6; }
    else if (a >= 1e-9) { p = 'n'; v = x * 1e9; }
    else { p = 'p'; v = x * 1e12; }
    return [fmt(v), p];
  }
  function pu(x, base) { var t = unit(x); return fmt(t[0]) + ' ' + t[1] + base; }
  function head(no, t, en) {
    return '<div class="tool-head"><span class="no">' + no + '</span><span class="t">' + t + '</span><span class="e">' + en + '</span></div>';
  }
  function inp(id, label, value, step, min) {
    return '<label for="' + id + '">' + label + '</label><input type="number" id="' + id + '" value="' + value + '"' +
      (step != null ? ' step="' + step + '"' : '') + (min != null ? ' min="' + min + '"' : '') + '>';
  }
  function seg(id, label, valHtml, unitTxt) {
    return '<div class="seg"><div class="label">' + label + '</div><div class="val" id="' + id + '">' + valHtml +
      (unitTxt ? '<span class="unit">' + unitTxt + '</span>' : '') + '</div></div>';
  }

  /* ========== 首页 ========== */
  var TOOLS = [
    { r: 'c1', ref: 'U1', nm: 'OHM', cn: '欧姆定律', ds: 'V = I × R，已知任意两个求第三个' },
    { r: 'c2', ref: 'U2', nm: 'POWER', cn: '电功率', ds: 'P=VI=I²R=V²/R，三种组合模式' },
    { r: 'c3', ref: 'U3', nm: 'R-SERIES', cn: '电阻串并', ds: '串联/并联总电阻 + 四色环读数' },
    { r: 'c4', ref: 'U4', nm: 'DIV-V', cn: '分压电路', ds: '两电阻串联分压，输出电压与功耗' },
    { r: 'c5', ref: 'U5', nm: 'DIV-I', cn: '分流电路', ds: '两电阻并联分流，支路电流与压降' },
    { r: 'c6', ref: 'U6', nm: 'RC-TAU', cn: 'RC 时间常数', ds: 'τ=RC，充放电曲线与 5τ 满充时间' },
    { r: 'c7', ref: 'U7', nm: 'LC-RES', cn: '谐振频率', ds: 'f=1/(2π√LC)，Q 值与带宽' },
    { r: 'c8', ref: 'U8', nm: 'Z-AC', cn: '交流阻抗', ds: '容抗/感抗/RLC 阻抗模与相位角' }
  ];
  function viewHome() {
    var h = '<div class="index-grid">';
    for (var i = 0; i < TOOLS.length; i++) {
      var t = TOOLS[i];
      h += '<a class="index-card" href="#/' + t.r + '"><span class="pin"></span>' +
        '<div class="ref">' + t.ref + '</div>' +
        '<div class="nm">' + t.nm + '</div>' +
        '<div style="font:700 13px/1.6 var(--mono);color:var(--silk);letter-spacing:2px;margin-bottom:6px">' + t.cn + '</div>' +
        '<div class="ds">' + t.ds + '</div></a>';
    }
    app.innerHTML = h + '</div>';
  }

  /* ========== U1 欧姆定律 ========== */
  function viewC1() {
    app.innerHTML = head('U1', '欧姆定律', 'OHM LAW') +
      '<div class="tool-wrap"><div class="chip" data-ref="U1-A">' +
        '<h3>输入（留空一个未知量）</h3><div class="sub">LEAVE ONE BLANK</div>' +
        inp('v1', '电压 V (伏特)', '12', 'any') +
        inp('i1', '电流 I (安培)', '', 'any') +
        inp('r1', '电阻 R (欧姆)', '470', 'any') +
      '</div><div class="seg-row" style="flex-direction:column">' +
        seg('s1v', 'VOLTAGE 电压', '—', 'V') +
        seg('s1i', 'CURRENT 电流', '—', 'A') +
        seg('s1r', 'RESISTANCE 电阻', '—', 'Ω') +
      '</div></div>';
    function calc() {
      var v = $('#v1').value === '' ? null : num('#v1', NaN);
      var i = $('#i1').value === '' ? null : num('#i1', NaN);
      var r = $('#r1').value === '' ? null : num('#r1', NaN);
      var filled = (v != null ? 1 : 0) + (i != null ? 1 : 0) + (r != null ? 1 : 0);
      if (filled < 2) {
        $('#s1v').innerHTML = '—<span class="unit">V</span>';
        $('#s1i').innerHTML = '—<span class="unit">A</span>';
        $('#s1r').innerHTML = '—<span class="unit">Ω</span>';
        return;
      }
      var out = E.ohm(v, i, r);
      $('#s1v').innerHTML = fmt(out.v) + '<span class="unit">V</span>';
      $('#s1i').innerHTML = fmt(out.i) + '<span class="unit">A</span>';
      $('#s1r').innerHTML = fmt(out.r) + '<span class="unit">Ω</span>';
    }
    ['#v1', '#i1', '#r1'].forEach(function (s) { $(s).addEventListener('input', calc); });
    calc();
  }

  /* ========== U2 电功率 ========== */
  function viewC2() {
    app.innerHTML = head('U2', '电功率', 'POWER') +
      '<div class="tool-wrap"><div class="chip" data-ref="U2-A">' +
        '<h3>选择组合</h3><div class="sub">MODE</div>' +
        '<label>计算模式</label><select id="m2">' +
          '<option value="vi">P = V × I（电压 × 电流）</option>' +
          '<option value="ir">P = I² × R（电流 × 电阻）</option>' +
          '<option value="vr">P = V² / R（电压 / 电阻）</option>' +
        '</select>' +
        '<div id="f2a"></div><div id="f2b"></div>' +
      '</div><div style="display:flex;flex-direction:column;gap:16px">' +
        seg('s2p', 'POWER 功率', '—', 'W') +
        '<div class="trace-out" id="o2"></div>' +
      '</div></div>';
    function fields() {
      var m = val('#m2');
      var labels = m === 'vi' ? ['电压 V', '电流 I'] : m === 'ir' ? ['电流 I', '电阻 R'] : ['电压 V', '电阻 R'];
      var units = m === 'vi' ? ['V', 'A'] : m === 'ir' ? ['A', 'Ω'] : ['V', 'Ω'];
      $('#f2a').innerHTML = inp('a2', labels[0] + ' (' + units[0] + ')', m === 'vi' ? '12' : m === 'ir' ? '0.5' : '12');
      $('#f2b').innerHTML = inp('b2', labels[1] + ' (' + units[1] + ')', m === 'vi' ? '2' : m === 'ir' ? '100' : '24');
      calc();
    }
    function calc() {
      var a = num('#a2', NaN), b = num('#b2', NaN), m = val('#m2');
      if (isNaN(a) || isNaN(b) || b === 0) { $('#s2p').innerHTML = '—<span class="unit">W</span>'; $('#o2').innerHTML = ''; return; }
      var p = E.power(a, b, m);
      $('#s2p').innerHTML = fmt(p) + '<span class="unit">W</span>';
      $('#o2').innerHTML =
        'P = <b>' + fmt(p) + ' W</b><br>' +
        '换算：<span class="r">' + fmt(p / 1000) + ' kW</span> · ' +
        fmt(p * 1000) + ' mW<br>' +
        '1 小时耗电 <span class="r">' + fmt(p / 1000) + ' 度（kWh）</span>';
    }
    $('#m2').addEventListener('change', fields);
    fields();
    if (!app._c2bound) {
      app._c2bound = true;
      app.addEventListener('input', function (e) {
        if (e.target && (e.target.id === 'a2' || e.target.id === 'b2')) calc();
      });
    }
  }

  /* ========== U3 电阻串并 + 色环 ========== */
  function viewC3() {
    var rs = [100, 220, 470];
    app.innerHTML = head('U3', '电阻串并与色环', 'R SERIES & COLOR') +
      '<div class="tool-wrap">' +
      '<div class="chip" data-ref="U3-A">' +
        '<h3>电阻列表 (Ω)</h3><div class="sub">RESISTOR LIST</div>' +
        '<div class="r-list" id="r3list"></div>' +
        '<div class="r-add"><input type="number" id="r3new" placeholder="输入阻值 Ω" value="1000"><button class="pad-btn" id="r3add">ADD</button></div>' +
        '<div style="margin-top:16px;display:flex;gap:8px">' +
          '<button class="pad-btn" id="r3ser">SERIES 串联</button>' +
          '<button class="pad-btn ghost" id="r3par">PARALLEL 并联</button>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:16px">' +
        seg('s3ser', 'SERIES 串联总阻', '—', 'Ω') +
        seg('s3par', 'PARALLEL 并联总阻', '—', 'Ω') +
      '</div>' +
      '<div class="tool-wide chip" data-ref="U3-B" style="margin-top:6px">' +
        '<h3>四色环读数</h3><div class="sub">4-BAND COLOR CODE</div>' +
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">' +
          '<label>第 1 环<select id="c3a"></select></label>' +
          '<label>第 2 环<select id="c3b"></select></label>' +
          '<label>倍乘<select id="c3m"></select></label>' +
          '<label>误差<select id="c3t"></select></label>' +
        '</div>' +
        '<div class="trace-out" id="o3c" style="margin-top:12px"></div>' +
      '</div></div>';
    var digitOpts = '';
    ['黑', '棕', '红', '橙', '黄', '绿', '蓝', '紫', '灰', '白'].forEach(function (n, i) {
      digitOpts += '<option value="' + i + '"' + (i === 1 ? ' selected' : '') + '>' + n + ' ' + i + '</option>';
    });
    $('#c3a').innerHTML = digitOpts;
    $('#c3b').innerHTML = digitOpts;
    $('#c3m').innerHTML =
      '<option value="0">黑 ×1</option><option value="1">棕 ×10</option><option value="2" selected>红 ×100</option>' +
      '<option value="3">橙 ×1k</option><option value="4">黄 ×10k</option><option value="5">绿 ×100k</option>' +
      '<option value="6">蓝 ×1M</option><option value="gold">金 ×0.1</option><option value="silver">银 ×0.01</option>';
    $('#c3t').innerHTML =
      '<option value="brown">棕 ±1%</option><option value="red">红 ±2%</option><option value="gold" selected>金 ±5%</option>' +
      '<option value="silver">银 ±10%</option><option value="none">无 ±20%</option>';

    function renderList() {
      $('#r3list').innerHTML = rs.map(function (r, i) {
        return '<span class="r-pill">R' + (i + 1) + ' ' + r + 'Ω <span class="x" data-i="' + i + '">×</span></span>';
      }).join('');
      $('#s3ser').innerHTML = pu(E.seriesR(rs), 'Ω');
      $('#s3par').innerHTML = pu(E.parallelR(rs), 'Ω');
    }
    $('#r3list').addEventListener('click', function (e) {
      var t = e.target;
      if (t.className === 'x') {
        rs.splice(parseInt(t.getAttribute('data-i'), 10), 1);
        renderList();
      }
    });
    $('#r3add').addEventListener('click', function () {
      var v = num('#r3new', NaN);
      if (!isNaN(v) && v > 0) { rs.push(v); renderList(); }
    });
    $('#r3ser').addEventListener('click', function () {
      $('#s3ser').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    function colorCalc() {
      var r = E.resistor4(parseInt(val('#c3a'), 10), parseInt(val('#c3b'), 10), val('#c3m'), val('#c3t'));
      $('#o3c').innerHTML =
        '标称值 <b>' + pu(r.r, 'Ω') + '</b> · 误差 ±<b>' + r.tol + '%</b><br>' +
        '实际范围 <span class="r">' + pu(r.min, 'Ω') + ' ~ ' + pu(r.max, 'Ω') + '</span>';
    }
    ['#c3a', '#c3b', '#c3m', '#c3t'].forEach(function (s) { $(s).addEventListener('change', colorCalc); });
    renderList();
    colorCalc();
  }

  /* ========== U4 分压 ========== */
  function viewC4() {
    app.innerHTML = head('U4', '分压电路', 'VOLT DIVIDER') +
      '<div class="tool-wrap"><div class="chip" data-ref="U4-A">' +
        '<h3>串联两电阻</h3><div class="sub">R1 (上) / R2 (下)</div>' +
        inp('v4', '输入电压 Vin (V)', '12') +
        inp('r4a', 'R1 上端 (Ω)', '10000') +
        inp('r4b', 'R2 下端 (Ω)', '10000') +
      '</div><div style="display:flex;flex-direction:column;gap:16px">' +
        seg('s4v', 'VOUT 输出电压', '—', 'V') +
        seg('s4i', '回路电流', '—', 'A') +
        '<div class="trace-out" id="o4"></div>' +
      '</div></div>';
    function calc() {
      var vin = num('#v4', 12), r1 = num('#r4a', 10000), r2 = num('#r4b', 10000);
      if (r1 + r2 === 0) return;
      var r = E.voltDivider(vin, r1, r2);
      $('#s4v').innerHTML = fmt(r.vout) + '<span class="unit">V</span>';
      $('#s4i').innerHTML = fmt(r.i) + '<span class="unit">A</span>';
      $('#o4').innerHTML =
        'Vout = Vin × R2/(R1+R2) = <b>' + fmt(r.vout) + ' V</b><br>' +
        'R1 功耗 <span class="r">' + pu(r.p1, 'W') + '</span> · R2 功耗 <span class="r">' + pu(r.p2, 'W') + '</span><br>' +
        '分压比 <b>' + fmt(r2 / (r1 + r2)) + '</b>（' + fmt(r2 / (r1 + r2) * 100, 1) + '%）';
    }
    ['#v4', '#r4a', '#r4b'].forEach(function (s) { $(s).addEventListener('input', calc); });
    calc();
  }

  /* ========== U5 分流 ========== */
  function viewC5() {
    app.innerHTML = head('U5', '分流电路', 'CURRENT DIVIDER') +
      '<div class="tool-wrap"><div class="chip" data-ref="U5-A">' +
        '<h3>并联两电阻</h3><div class="sub">R1 // R2</div>' +
        inp('i5', '总输入电流 Iin (A)', '1') +
        inp('r5a', 'R1 (Ω)', '100') +
        inp('r5b', 'R2 (Ω)', '220') +
      '</div><div style="display:flex;flex-direction:column;gap:16px">' +
        seg('s5a', 'I1 支路电流', '—', 'A') +
        seg('s5b', 'I2 支路电流', '—', 'A') +
        '<div class="trace-out" id="o5"></div>' +
      '</div></div>';
    function calc() {
      var iin = num('#i5', 1), r1 = num('#r5a', 100), r2 = num('#r5b', 220);
      if (r1 + r2 === 0) return;
      var r = E.currDivider(iin, r1, r2);
      $('#s5a').innerHTML = fmt(r.i1) + '<span class="unit">A</span>';
      $('#s5b').innerHTML = fmt(r.i2) + '<span class="unit">A</span>';
      $('#o5').innerHTML =
        'I1 = Iin × R2/(R1+R2) = <b>' + fmt(r.i1) + ' A</b><br>' +
        'I2 = Iin × R1/(R1+R2) = <b>' + fmt(r.i2) + ' A</b><br>' +
        '并联压降 <span class="r">' + fmt(r.v) + ' V</span> · 等效电阻 <span class="r">' + pu(r.req, 'Ω') + '</span>';
    }
    ['#i5', '#r5a', '#r5b'].forEach(function (s) { $(s).addEventListener('input', calc); });
    calc();
  }

  /* ========== U6 RC 时间常数 ========== */
  function viewC6() {
    app.innerHTML = head('U6', 'RC 时间常数', 'RC TIME CONSTANT') +
      '<div class="tool-wrap"><div class="chip" data-ref="U6-A">' +
        '<h3>RC 参数</h3><div class="sub">RESISTOR × CAPACITOR</div>' +
        inp('r6', '电阻 R (Ω)', '10000') +
        inp('c6', '电容 C (µF)', '100') +
        inp('vs6', '电源电压 Vs (V)', '5') +
        '<label>模式</label><select id="m6"><option value="chg">充电 CHARGE</option><option value="dis">放电 DISCHARGE</option></select>' +
      '</div><div style="display:flex;flex-direction:column;gap:16px">' +
        seg('s6t', 'τ 时间常数', '—', 's') +
        seg('s6v', '5τ 满程时间', '—', 's') +
        '<div class="trace-out" id="o6"></div>' +
      '</div>' +
      '<div class="tool-wide chip" data-ref="U6-B" style="margin-top:6px">' +
        '<h3>充放电曲线</h3><div class="sub">WAVEFORM</div>' +
        '<canvas id="cv6" class="cv" height="200"></canvas>' +
      '</div></div>';
    function calc() {
      var r = num('#r6', 10000), c = num('#c6', 100) * 1e-6, vs = num('#vs6', 5);
      var tau = E.rcTau(r, c);
      $('#s6t').innerHTML = fmt(tau) + '<span class="unit">s</span>';
      $('#s6v').innerHTML = fmt(5 * tau) + '<span class="unit">s</span>';
      var t1 = E.capCharge(vs, r, c, tau);
      var m = val('#m6');
      $('#o6').innerHTML =
        'τ = RC = <b>' + fmt(tau) + ' s</b>（' + fmt(tau * 1000) + ' ms）<br>' +
        '1τ 时电容电压 <span class="r">' + fmt(vs * 0.632) + ' V</span>（63.2%）<br>' +
        '3τ = ' + fmt(3 * tau) + 's（95%）· 5τ = <b>' + fmt(5 * tau) + ' s</b>（99.3%）<br>' +
        '初始充电电流 <span class="r">' + fmt(vs / r) + ' A</span>';
      drawRC($('#cv6'), r, c, vs, m === 'chg');
    }
    ['#r6', '#c6', '#vs6'].forEach(function (s) { $(s).addEventListener('input', calc); });
    $('#m6').addEventListener('change', calc);
    calc();
  }
  function drawRC(cv, r, c, vs, charge) {
    if (!cv || !cv.getContext) return;
    var w = cv.clientWidth || 600;
    cv.width = w * 2; cv.height = 200;
    var x = cv.getContext('2d');
    x.scale(2, 2); w = cv.width / 2; var h = 100;
    x.fillStyle = '#083024'; x.fillRect(0, 0, w, h * 2);
    var tau = r * c, T = 5 * tau;
    var X = function (t) { return 40 + (t / T) * (w - 60); };
    var Y = function (v) { return h * 1.6 - (v / vs) * h * 1.3; };
    x.strokeStyle = '#2d6e53'; x.lineWidth = 1;
    for (var k = 0; k <= 5; k++) {
      var xx = X(k * tau);
      x.beginPath(); x.moveTo(xx, 12); x.lineTo(xx, h * 1.6); x.stroke();
      x.fillStyle = '#6b6958'; x.font = '9px Courier New'; x.textAlign = 'center';
      x.fillText(k + 'τ', xx, h * 1.6 + 14);
    }
    x.strokeStyle = '#c9a227'; x.lineWidth = 2;
    x.beginPath();
    for (var i = 0; i <= 100; i++) {
      var t = T * i / 100;
      var v = charge ? vs * (1 - Math.exp(-t / tau)) : vs * Math.exp(-t / tau);
      if (i === 0) x.moveTo(X(t), Y(v)); else x.lineTo(X(t), Y(v));
    }
    x.stroke();
    x.fillStyle = '#e8c84a'; x.textAlign = 'left';
    x.fillText(charge ? 'Vc(t) CHARGE' : 'Vc(t) DISCHARGE', 50, 24);
    x.fillStyle = '#e8e6d8';
    x.fillText(fmt(vs) + 'V', 8, Y(vs) + 3);
    x.fillText('0V', 12, Y(0) + 3);
  }

  /* ========== U7 LC 谐振 ========== */
  function viewC7() {
    app.innerHTML = head('U7', 'LC 谐振频率', 'LC RESONANCE') +
      '<div class="tool-wrap"><div class="chip" data-ref="U7-A">' +
        '<h3>LC 槽路</h3><div class="sub">TANK CIRCUIT</div>' +
        inp('l7', '电感 L (mH)', '10') +
        inp('c7', '电容 C (µF)', '1') +
        inp('r7', '等效串联电阻 R (Ω)', '10') +
      '</div><div style="display:flex;flex-direction:column;gap:16px">' +
        seg('s7f', 'RESONANT FREQ 谐振频率', '—', 'Hz') +
        seg('s7q', 'Q 品质因数', '—', '') +
        '<div class="trace-out" id="o7"></div>' +
      '</div></div>';
    function calc() {
      var l = num('#l7', 10) * 1e-3, c = num('#c7', 1) * 1e-6, r = num('#r7', 10);
      var f0 = E.lcFreq(l, c), q = E.lcQ(r, l, c), bw = E.lcBandwidth(f0, q);
      $('#s7f').innerHTML = fmt(f0) + '<span class="unit">Hz</span>';
      $('#s7q').innerHTML = fmt(q) + '<span class="unit"></span>';
      $('#o7').innerHTML =
        'f0 = 1/(2π√LC) = <b>' + fmt(f0) + ' Hz</b>（' + fmt(f0 / 1000) + ' kHz）<br>' +
        'Q = (1/R)·√(L/C) = <b>' + fmt(q) + '</b><br>' +
        '带宽 BW = f0/Q = <span class="r">' + fmt(bw) + ' Hz</span><br>' +
        '周期 T = <span class="r">' + fmt(1 / f0) + ' s</span>';
    }
    ['#l7', '#c7', '#r7'].forEach(function (s) { $(s).addEventListener('input', calc); });
    calc();
  }

  /* ========== U8 交流阻抗 ========== */
  function viewC8() {
    app.innerHTML = head('U8', '交流阻抗', 'AC IMPEDANCE') +
      '<div class="tool-wrap"><div class="chip" data-ref="U8-A">' +
        '<h3>RLC 串联</h3><div class="sub">R-L-C SERIES</div>' +
        inp('f8', '频率 f (Hz)', '50') +
        inp('r8', '电阻 R (Ω)', '100') +
        inp('l8', '电感 L (mH)', '100') +
        inp('c8', '电容 C (µF)', '100') +
      '</div><div style="display:flex;flex-direction:column;gap:14px">' +
        seg('s8x', 'Xc 容抗', '—', 'Ω') +
        seg('s8l', 'Xl 感抗', '—', 'Ω') +
        seg('s8z', 'Z 阻抗模', '—', 'Ω') +
        '<div class="trace-out" id="o8"></div>' +
      '</div></div>';
    function calc() {
      var f = num('#f8', 50), r = num('#r8', 100);
      var l = num('#l8', 100) * 1e-3, c = num('#c8', 100) * 1e-6;
      var xc = E.capReactance(c, f), xl = E.indReactance(l, f);
      var z = E.impedance(r, xl, xc);
      var phi = z.phi * 180 / Math.PI;
      $('#s8x').innerHTML = fmt(xc) + '<span class="unit">Ω</span>';
      $('#s8l').innerHTML = fmt(xl) + '<span class="unit">Ω</span>';
      $('#s8z').innerHTML = fmt(z.z) + '<span class="unit">Ω</span>';
      $('#o8').innerHTML =
        'Xc = 1/(2πfC) = <b>' + fmt(xc) + ' Ω</b><br>' +
        'Xl = 2πfL = <b>' + fmt(xl) + ' Ω</b><br>' +
        'Z = √(R²+(Xl−Xc)²) = <b>' + fmt(z.z) + ' Ω</b><br>' +
        '相位角 φ = <span class="r">' + fmt(phi) + '°</span>' +
        (phi > 0 ? '（感性，电压超前）' : phi < 0 ? '（容性，电流超前）' : '（谐振，纯阻性）');
    }
    ['#f8', '#r8', '#l8', '#c8'].forEach(function (s) { $(s).addEventListener('input', calc); });
    calc();
  }

  /* ---------- 路由 ---------- */
  var ROUTES = {
    home: { view: viewHome, crumb: 'U0 INDEX' },
    c1: { view: viewC1, crumb: 'U1 OHM' }, c2: { view: viewC2, crumb: 'U2 POWER' },
    c3: { view: viewC3, crumb: 'U3 R-SERIES' }, c4: { view: viewC4, crumb: 'U4 DIV-V' },
    c5: { view: viewC5, crumb: 'U5 DIV-I' }, c6: { view: viewC6, crumb: 'U6 RC-TAU' },
    c7: { view: viewC7, crumb: 'U7 LC-RES' }, c8: { view: viewC8, crumb: 'U8 Z-AC' }
  };
  function routeName() {
    var h = location.hash.replace(/^#\/?/, '');
    return ROUTES[h] ? h : 'home';
  }
  function route() {
    var r = routeName();
    var links = document.querySelectorAll('.u');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-r') === r) links[i].className = 'u on';
      else links[i].className = 'u';
    }
    document.getElementById('wbCrumbs').innerHTML = 'PCB / <b>' + ROUTES[r].crumb + '</b>';
    ROUTES[r].view();
    app.style.opacity = '0';
    requestAnimationFrame(function () {
      app.style.transition = 'opacity .25s';
      app.style.opacity = '1';
    });
    var wb = document.querySelector('.wb-canvas');
    if (wb) wb.scrollTop = 0;
  }
  document.getElementById('wbMenu').addEventListener('click', function () {
    document.querySelector('.pcb-rail').classList.toggle('open');
  });
  document.getElementById('railList').addEventListener('click', function () {
    document.querySelector('.pcb-rail').classList.remove('open');
  });
  window.addEventListener('hashchange', route);
  route();
})();
