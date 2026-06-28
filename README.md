
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EZOI — Intelligence, Refined</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@300;400&display=swap" rel="stylesheet">
<style>
  :root{
    --obsidian:#070708;
    --panel:#0f0f12;
    --line: rgba(255,255,255,0.08);
    --chrome:#cfd3da;
    --chrome-dim:#7a7d85;
    --plasma:#7df9ff;
    --plasma-violet:#b48cff;
    --warn:#ff6a3d;
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{
    background:var(--obsidian);
    color:var(--chrome);
    font-family:'Space Grotesk', sans-serif;
    overflow-x:hidden;
    cursor:default;
  }
  ::selection{ background:var(--plasma); color:#000; }

  @media (prefers-reduced-motion: reduce){
    *{ animation-duration:0.01ms !important; animation-iteration-count:1 !important; transition-duration:0.01ms !important; scroll-behavior:auto !important; }
  }

  a{color:inherit; text-decoration:none;}

  /* ---------- noise + grid texture ---------- */
  .grain{
    position:fixed; inset:0; pointer-events:none; z-index:999;
    opacity:0.035; mix-blend-mode:overlay;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  .grid-overlay{
    position:fixed; inset:0; pointer-events:none; z-index:1;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(circle at 50% 30%, black 0%, transparent 70%);
  }

  /* ---------- nav ---------- */
  header{
    position:fixed; top:0; left:0; right:0; z-index:100;
    display:flex; align-items:center; justify-content:space-between;
    padding:28px 48px;
    backdrop-filter: blur(12px);
    background:linear-gradient(to bottom, rgba(7,7,8,0.8), transparent);
  }
  .logo{
    font-size:18px; letter-spacing:0.32em; font-weight:600; color:#fff;
  }
  .logo span{color:var(--plasma);}
  nav ul{
    display:flex; gap:44px; list-style:none;
    font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:var(--chrome-dim);
  }
  nav ul li a{ position:relative; padding-bottom:4px; transition:color .3s; }
  nav ul li a::after{
    content:''; position:absolute; left:0; bottom:0; height:1px; width:0%;
    background:var(--plasma); transition:width .35s ease;
  }
  nav ul li a:hover{ color:#fff; }
  nav ul li a:hover::after{ width:100%; }
  .nav-cta{
    font-size:11px; letter-spacing:0.18em; text-transform:uppercase;
    border:1px solid var(--line); padding:10px 20px; border-radius:2px;
    color:#fff; transition:all .3s;
  }
  .nav-cta:hover{ border-color:var(--plasma); box-shadow:0 0 24px rgba(125,249,255,0.25); }

  /* ---------- hero ---------- */
  .hero{
    position:relative; min-height:100vh;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    text-align:center; padding:160px 24px 80px;
  }
  #orb{
    position:absolute; top:0; left:0; width:100%; height:100%; z-index:0;
  }
  .eyebrow{
    font-family:'JetBrains Mono', monospace;
    font-size:11px; letter-spacing:0.3em; color:var(--plasma);
    text-transform:uppercase; margin-bottom:28px; z-index:2;
    opacity:0; animation: fadeUp 1s ease forwards .2s;
  }
  h1.hero-title{
    font-size:clamp(48px, 9vw, 118px); line-height:0.96; font-weight:600;
    color:#fff; z-index:2; letter-spacing:-0.02em;
    opacity:0; animation: fadeUp 1.1s ease forwards .4s;
  }
  h1.hero-title em{
    font-family:'Cormorant Garamond', serif; font-style:italic; font-weight:400;
    background:linear-gradient(120deg, var(--plasma), var(--plasma-violet));
    -webkit-background-clip:text; background-clip:text; color:transparent;
  }
  .hero-sub{
    max-width:560px; margin-top:28px; font-size:17px; line-height:1.7;
    color:var(--chrome-dim); z-index:2; font-weight:300;
    opacity:0; animation: fadeUp 1.1s ease forwards .7s;
  }
  .hero-actions{
    margin-top:48px; display:flex; gap:20px; z-index:2;
    opacity:0; animation: fadeUp 1.1s ease forwards 1s;
  }
  .btn-primary{
    background:#fff; color:#000; padding:16px 34px; border-radius:2px;
    font-size:12px; letter-spacing:0.16em; text-transform:uppercase; font-weight:600;
    transition:all .35s ease; position:relative; overflow:hidden;
  }
  .btn-primary:hover{ box-shadow:0 0 40px rgba(255,255,255,0.4); transform:translateY(-2px); }
  .btn-ghost{
    border:1px solid var(--line); padding:16px 34px; border-radius:2px;
    font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#fff;
    transition:all .35s ease;
  }
  .btn-ghost:hover{ border-color:var(--plasma-violet); background:rgba(180,140,255,0.06); }

  @keyframes fadeUp{ from{opacity:0; transform:translateY(24px);} to{opacity:1; transform:translateY(0);} }

  .scroll-cue{
    position:absolute; bottom:40px; left:50%; transform:translateX(-50%);
    font-family:'JetBrains Mono', monospace; font-size:10px; letter-spacing:0.2em;
    color:var(--chrome-dim); display:flex; flex-direction:column; align-items:center; gap:10px;
    z-index:2;
  }
  .scroll-cue .line{ width:1px; height:34px; background:linear-gradient(to bottom, var(--plasma), transparent); animation:pulse 2s infinite; }
  @keyframes pulse{ 0%,100%{opacity:.3;} 50%{opacity:1;} }

  /* ---------- marquee strip ---------- */
  .marquee{
    border-top:1px solid var(--line); border-bottom:1px solid var(--line);
    padding:18px 0; overflow:hidden; white-space:nowrap; background:var(--panel);
  }
  .marquee-track{ display:inline-block; animation: scroll 28s linear infinite; }
  .marquee span{
    font-family:'JetBrains Mono', monospace; font-size:12px; letter-spacing:0.18em;
    color:var(--chrome-dim); margin-right:60px; text-transform:uppercase;
  }
  .marquee span b{ color:var(--plasma); font-weight:400; }
  @keyframes scroll{ from{transform:translateX(0);} to{transform:translateX(-50%);} }

  /* ---------- section shell ---------- */
  section{ padding:160px 48px; position:relative; }
  .section-head{
    display:flex; justify-content:space-between; align-items:flex-end;
    max-width:1280px; margin:0 auto 80px; flex-wrap:wrap; gap:24px;
  }
  .section-tag{
    font-family:'JetBrains Mono', monospace; font-size:11px; letter-spacing:0.28em;
    color:var(--plasma); text-transform:uppercase; margin-bottom:18px; display:block;
  }
  .section-title{
    font-size:clamp(32px,4.4vw,56px); color:#fff; font-weight:500; letter-spacing:-0.01em; max-width:640px;
  }
  .section-desc{ max-width:340px; color:var(--chrome-dim); font-size:15px; line-height:1.7; font-weight:300; }

  /* ---------- capability grid (signature) ---------- */
  .capabilities{ max-width:1280px; margin:0 auto; display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--line); border:1px solid var(--line); }
  .cap-card{
    background:var(--obsidian); padding:48px 38px; position:relative; overflow:hidden;
    transition:background .4s ease;
  }
  .cap-card::before{
    content:''; position:absolute; inset:0; opacity:0; transition:opacity .5s ease;
    background:radial-gradient(circle at 30% 20%, rgba(125,249,255,0.08), transparent 60%);
  }
  .cap-card:hover::before{ opacity:1; }
  .cap-card:hover{ background:#0a0a0d; }
  .cap-index{ font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--chrome-dim); letter-spacing:0.2em; }
  .cap-title{ color:#fff; font-size:22px; margin:28px 0 14px; font-weight:500; }
  .cap-desc{ color:var(--chrome-dim); font-size:14.5px; line-height:1.75; font-weight:300; }
  .cap-glyph{
    position:absolute; right:24px; top:30px; width:34px; height:34px;
    border:1px solid var(--line); border-radius:50%;
    display:flex; align-items:center; justify-content:center;
  }
  .cap-glyph::after{ content:''; width:6px; height:6px; background:var(--plasma); border-radius:50%; box-shadow:0 0 12px var(--plasma); }

  /* ---------- ledger / metrics ---------- */
  .ledger{ max-width:1280px; margin:0 auto; border-top:1px solid var(--line); }
  .ledger-row{
    display:grid; grid-template-columns: 90px 1fr 240px 160px;
    align-items:center; padding:30px 0; border-bottom:1px solid var(--line);
    transition:padding-left .35s ease;
  }
  .ledger-row:hover{ padding-left:14px; background:linear-gradient(90deg, rgba(125,249,255,0.04), transparent); }
  .ledger-id{ font-family:'JetBrains Mono', monospace; font-size:12px; color:var(--plasma); }
  .ledger-name{ color:#fff; font-size:20px; font-weight:500; }
  .ledger-meta{ font-family:'JetBrains Mono', monospace; font-size:12px; color:var(--chrome-dim); }
  .ledger-val{ text-align:right; font-size:14px; color:var(--chrome); font-weight:300; }

  /* ---------- testimonial / quote ---------- */
  .quote-block{
    max-width:900px; margin:0 auto; text-align:center;
  }
  .quote-block blockquote{
    font-family:'Cormorant Garamond', serif; font-style:italic; font-weight:400;
    font-size:clamp(26px,3.6vw,42px); color:#fff; line-height:1.45;
  }
  .quote-block blockquote span{ color:var(--plasma); }
  .quote-attr{ margin-top:32px; font-family:'JetBrains Mono', monospace; font-size:12px; letter-spacing:0.16em; color:var(--chrome-dim); text-transform:uppercase; }

  /* ---------- access / CTA panel ---------- */
  .access{
    max-width:1280px; margin:0 auto; border:1px solid var(--line); border-radius:4px;
    padding:80px; position:relative; overflow:hidden;
    background:linear-gradient(160deg, #0c0c10, #070708 60%);
  }
  .access::before{
    content:''; position:absolute; width:600px; height:600px; border-radius:50%;
    background:radial-gradient(circle, rgba(180,140,255,0.12), transparent 70%);
    top:-200px; right:-150px; pointer-events:none;
  }
  .access-grid{ display:grid; grid-template-columns:1.2fr 1fr; gap:60px; align-items:center; position:relative; z-index:1; }
  .access h3{ font-size:clamp(28px,3.4vw,44px); color:#fff; font-weight:500; line-height:1.2; }
  .access p{ margin-top:18px; color:var(--chrome-dim); font-size:15px; line-height:1.7; max-width:440px; font-weight:300; }
  .access-form{ display:flex; flex-direction:column; gap:14px; }
  .access-form input{
    background:transparent; border:1px solid var(--line); color:#fff; padding:16px 18px;
    font-family:'Space Grotesk', sans-serif; font-size:14px; border-radius:2px; outline:none;
    transition:border-color .3s;
  }
  .access-form input::placeholder{ color:var(--chrome-dim); }
  .access-form input:focus{ border-color:var(--plasma); }
  .access-form button{
    background:var(--plasma); color:#000; border:none; padding:16px; border-radius:2px;
    font-size:12px; letter-spacing:0.18em; text-transform:uppercase; font-weight:600; cursor:pointer;
    transition:all .3s;
  }
  .access-form button:hover{ background:#fff; box-shadow:0 0 30px rgba(125,249,255,0.4); }
  .fine{ font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--chrome-dim); margin-top:10px; }

  /* ---------- footer ---------- */
  footer{
    border-top:1px solid var(--line); padding:60px 48px 40px;
    display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:24px;
  }
  .footer-logo{ font-size:14px; letter-spacing:0.3em; color:var(--chrome-dim); }
  footer .fcol{ display:flex; gap:48px; flex-wrap:wrap; }
  footer .fcol a{ font-size:12px; letter-spacing:0.1em; color:var(--chrome-dim); text-transform:uppercase; transition:color .3s; }
  footer .fcol a:hover{ color:var(--plasma); }
  .footer-time{ font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--chrome-dim); }

  @media (max-width:900px){
    nav ul{ display:none; }
    .capabilities{ grid-template-columns:1fr; }
    .access-grid{ grid-template-columns:1fr; }
    section{ padding:110px 24px; }
    .ledger-row{ grid-template-columns: 50px 1fr; row-gap:8px; }
    .ledger-meta, .ledger-val{ display:none; }
  }
</style>
</head>
<body>

<div class="grain"></div>
<div class="grid-overlay"></div>

<header>
  <div class="logo">EZ<span>O</span>I</div>
  <nav>
    <ul>
      <li><a href="#capabilities">System</a></li>
      <li><a href="#ledger">Holdings</a></li>
      <li><a href="#access">Access</a></li>
    </ul>
  </nav>
  <a href="#access" class="nav-cta">Request Invite</a>
</header>

<section class="hero">
  <canvas id="orb"></canvas>
  <div class="eyebrow">// EZOI.ME — PRIVATE INTELLIGENCE LAYER</div>
  <h1 class="hero-title">Wealth, run by<br><em>quiet intelligence.</em></h1>
  <p class="hero-sub">EZOI is the autonomous layer between your capital and your decisions — built for those who require speed without spectacle, and control without effort.</p>
  <div class="hero-actions">
    <a href="#access" class="btn-primary">Request Access</a>
    <a href="#capabilities" class="btn-ghost">View System</a>
  </div>
  <div class="scroll-cue"><span>SCROLL</span><div class="line"></div></div>
</section>

<div class="marquee">
  <div class="marquee-track">
    <span>EUR · USD · BTC <b>↗</b></span>
    <span>LATENCY <b>0.4ms</b></span>
    <span>UPTIME <b>99.998%</b></span>
    <span>MEMBERS <b>BY INVITATION ONLY</b></span>
    <span>EUR · USD · BTC <b>↗</b></span>
    <span>LATENCY <b>0.4ms</b></span>
    <span>UPTIME <b>99.998%</b></span>
    <span>MEMBERS <b>BY INVITATION ONLY</b></span>
  </div>
</div>

<section id="capabilities">
  <div class="section-head">
    <div>
      <span class="section-tag">01 — The System</span>
      <h2 class="section-title">Three instruments. One quiet machine.</h2>
    </div>
    <p class="section-desc">Every layer of EZOI is built to disappear into the background of your day — present only when a decision is required of you.</p>
  </div>
  <div class="capabilities">
    <div class="cap-card">
      <div class="cap-glyph"></div>
      <div class="cap-index">ENGINE / 01</div>
      <div class="cap-title">Predictive Allocation</div>
      <div class="cap-desc">A continuously-retrained model reallocates across asset classes in real time, weighing thousands of macro signals before you've finished your coffee.</div>
    </div>
    <div class="cap-card">
      <div class="cap-glyph"></div>
      <div class="cap-index">ENGINE / 02</div>
      <div class="cap-title">Silent Concierge</div>
      <div class="cap-desc">A dedicated human strategist, briefed by the system itself, available on a single private line — never a call centre, never a queue.</div>
    </div>
    <div class="cap-card">
      <div class="cap-glyph"></div>
      <div class="cap-index">ENGINE / 03</div>
      <div class="cap-title">Sovereign Custody</div>
      <div class="cap-desc">Multi-jurisdictional vaulting with biometric release — your assets answer to you alone, verified by hardware you hold, not a server you trust blindly.</div>
    </div>
  </div>
</section>

<section id="ledger">
  <div class="section-head">
    <div>
      <span class="section-tag">02 — Holdings Class</span>
      <h2 class="section-title">Built for every form capital takes.</h2>
    </div>
    <p class="section-desc">A single interface, tuned differently for each instrument — never a one-size dashboard.</p>
  </div>
  <div class="ledger">
    <div class="ledger-row">
      <div class="ledger-id">EQ</div>
      <div class="ledger-name">Public Equities</div>
      <div class="ledger-meta">REBALANCED HOURLY</div>
      <div class="ledger-val">Tier I</div>
    </div>
    <div class="ledger-row">
      <div class="ledger-id">PE</div>
      <div class="ledger-name">Private Markets</div>
      <div class="ledger-meta">QUARTERLY WINDOWS</div>
      <div class="ledger-val">Tier I — II</div>
    </div>
    <div class="ledger-row">
      <div class="ledger-id">DA</div>
      <div class="ledger-name">Digital Assets</div>
      <div class="ledger-meta">COLD + WARM VAULT</div>
      <div class="ledger-val">Tier I</div>
    </div>
    <div class="ledger-row">
      <div class="ledger-id">RE</div>
      <div class="ledger-name">Real Property</div>
      <div class="ledger-meta">DEED-LINKED LEDGER</div>
      <div class="ledger-val">Tier II</div>
    </div>
    <div class="ledger-row">
      <div class="ledger-id">CO</div>
      <div class="ledger-name">Collectibles & Objects</div>
      <div class="ledger-meta">INSURED CUSTODY</div>
      <div class="ledger-val">Tier II — III</div>
    </div>
  </div>
</section>

<section>
  <div class="quote-block">
    <blockquote>"The best system is the one you <span>stop noticing</span> — until the one moment it has already protected you."</blockquote>
    <div class="quote-attr">— Founding Member, EZOI Circle</div>
  </div>
</section>

<section id="access">
  <div class="access">
    <div class="access-grid">
      <div>
        <h3>Membership is not sold.<br>It is extended.</h3>
        <p>EZOI is intentionally closed. Each member is reviewed individually, and access is granted by the system and the circle together — typically within ten days.</p>
      </div>
      <form class="access-form" onsubmit="event.preventDefault(); this.querySelector('button').textContent='Request Received';">
        <input type="text" placeholder="Full name" required>
        <input type="email" placeholder="Private email" required>
        <input type="text" placeholder="Referred by (optional)">
        <button type="submit">Submit Request</button>
        <div class="fine">No public onboarding. No advertising. Ever.</div>
      </form>
    </div>
  </div>
</section>

<footer>
  <div class="footer-logo">EZOI.ME</div>
  <div class="fcol">
    <a href="#capabilities">System</a>
    <a href="#ledger">Holdings</a>
    <a href="#access">Access</a>
    <a href="#">Privacy</a>
  </div>
  <div class="footer-time" id="clock">—</div>
</footer>

<script>
  // live clock, quiet detail
  function tick(){
    const d = new Date();
    const el = document.getElementById('clock');
    if(el) el.textContent = 'LOCAL ' + d.toLocaleTimeString([], {hour12:false}) + ' — EZOI NODE 04';
  }
  setInterval(tick, 1000); tick();

  // ---------- hero plasma orb canvas ----------
  const canvas = document.getElementById('orb');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }
  window.addEventListener('resize', resize);
  resize();

  const N = reduced ? 0 : 90;
  for(let i=0;i<N;i++){
    const ang = Math.random()*Math.PI*2;
    const r = 60 + Math.random()*220;
    particles.push({
      ang, r, speed: 0.0008 + Math.random()*0.0012,
      size: Math.random()*2 + 0.4,
      hueMix: Math.random()
    });
  }

  let mouseX = 0.5, mouseY = 0.5;
  window.addEventListener('mousemove', e=>{
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  function draw(t){
    ctx.clearRect(0,0,w,h);
    const cx = w*(0.5 + (mouseX-0.5)*0.04);
    const cy = h*0.46 + (mouseY-0.5)*h*0.04;

    // core glow
    const grad = ctx.createRadialGradient(cx,cy,0,cx,cy,260*devicePixelRatio);
    grad.addColorStop(0, 'rgba(125,249,255,0.22)');
    grad.addColorStop(0.5, 'rgba(180,140,255,0.10)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx,cy,260*devicePixelRatio,0,Math.PI*2);
    ctx.fill();

    particles.forEach(p=>{
      p.ang += p.speed;
      const x = cx + Math.cos(p.ang)*p.r*devicePixelRatio;
      const y = cy + Math.sin(p.ang)*p.r*devicePixelRatio*0.55;
      const c = p.hueMix > 0.5 ? '125,249,255' : '180,140,255';
      ctx.beginPath();
      ctx.fillStyle = `rgba(${c},${0.5+0.5*Math.sin(p.ang*3)})`;
      ctx.arc(x,y,p.size*devicePixelRatio,0,Math.PI*2);
      ctx.fill();
    });

    if(!reduced) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
</script>

</body>
</html>

# tech-salman.github.io
