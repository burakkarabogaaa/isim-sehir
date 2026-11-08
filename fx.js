/* Küçük efekt kütüphanesi: konfeti ve kutlama patlaması. prefers-reduced-motion açıkken sessiz kalır. */
(function(){
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cv,ctx,parts=[],raf=0;
  function ensure(){
    if(cv)return;
    cv=document.createElement("canvas"); cv.id="fx"; document.body.appendChild(cv);
    ctx=cv.getContext("2d"); resize(); addEventListener("resize",resize);
  }
  function resize(){const d=Math.min(devicePixelRatio||1,2); cv.width=innerWidth*d; cv.height=innerHeight*d; cv.style.width=innerWidth+"px"; cv.style.height=innerHeight+"px"; ctx.setTransform(d,0,0,d,0,0)}
  function color(){
    const cs=getComputedStyle(document.documentElement);
    return [cs.getPropertyValue("--gold"),cs.getPropertyValue("--gold-2"),cs.getPropertyValue("--accent-2"),cs.getPropertyValue("--margin"),cs.getPropertyValue("--good")].map(s=>s.trim());
  }
  function loop(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    parts=parts.filter(p=>p.life>0);
    for(const p of parts){
      p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.vx*=.99; p.rot+=p.vr; p.life-=1;
      ctx.save(); ctx.globalAlpha=Math.min(1,p.life/30); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.c;
      if(p.shape)ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2); else{ctx.beginPath();ctx.arc(0,0,p.s/2,0,7);ctx.fill()}
      ctx.restore();
    }
    if(parts.length)raf=requestAnimationFrame(loop); else{raf=0;ctx.clearRect(0,0,innerWidth,innerHeight)}
  }
  function spawn(n,x,y,spread,speed){
    const cols=color();
    for(let i=0;i<n;i++){
      const a=-Math.PI/2+(Math.random()-.5)*spread, v=speed*(.5+Math.random());
      parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:.18+Math.random()*.1,s:6+Math.random()*8,rot:Math.random()*6,vr:(Math.random()-.5)*.3,c:cols[i%cols.length],life:90+Math.random()*60,shape:Math.random()<.7});
    }
    if(!raf)raf=requestAnimationFrame(loop);
  }
  /* Ses: dosya yok, Web Audio ile üretilir. Tarayıcı ilk dokunuştan önce ses çalmaz; ilk tıklamada açılır. */
  let ac=null, muted=false;
  try{muted=localStorage.getItem("oyun-odasi-mute")==="1"}catch(e){}
  function ctxA(){ if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}} if(ac.state==="suspended")ac.resume().catch(()=>{}); return ac }
  document.addEventListener("pointerdown",()=>{ctxA()},{capture:true,passive:true});
  function tone(t0,freq,dur,type,gain,slide){
    const a=ctxA(); if(!a)return;
    const o=a.createOscillator(), g=a.createGain(); o.type=type||"sine"; o.frequency.setValueAtTime(freq,t0);
    if(slide)o.frequency.exponentialRampToValueAtTime(slide,t0+dur);
    g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(gain||.18,t0+.012); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0+dur+.02);
  }
  function noise(t0,dur,gain){
    const a=ctxA(); if(!a)return;
    const buf=a.createBuffer(1,a.sampleRate*dur,a.sampleRate), d=buf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
    const s=a.createBufferSource(), g=a.createGain(), fl=a.createBiquadFilter(); fl.type="lowpass"; fl.frequency.value=900;
    s.buffer=buf; g.gain.value=gain||.25; s.connect(fl).connect(g).connect(a.destination); s.start(t0);
  }
  const SOUNDS={
    tap(t){tone(t,660,.05,"triangle",.08)},
    tick(t){tone(t,1200,.04,"square",.05)},
    start(t){[523,659,784].forEach((f,i)=>tone(t+i*.09,f,.22,"triangle",.16))},
    good(t){tone(t,740,.12,"triangle",.16,988);tone(t+.1,1175,.18,"sine",.12)},
    bad(t){tone(t,220,.25,"sawtooth",.12,110);noise(t,.18,.12)},
    turn(t){tone(t,880,.12,"sine",.14);tone(t+.13,1109,.16,"sine",.12)},
    stop(t){tone(t,988,.08,"square",.1);tone(t+.08,1319,.3,"triangle",.16)},
    win(t){[523,659,784,1047].forEach((f,i)=>tone(t+i*.1,f,.35,"triangle",.16));tone(t+.45,1319,.6,"sine",.14)},
    lose(t){[392,349,311,262].forEach((f,i)=>tone(t+i*.17,f,.3,"sawtooth",.09))},
    throw(t){noise(t,.22,.2);tone(t,900,.2,"sine",.05,300)},
    thud(t){tone(t,140,.12,"sine",.3,60);noise(t,.06,.3)},
    reveal(t){tone(t,392,.12,"triangle",.1);tone(t+.1,523,.2,"triangle",.12)}
  };
  function play(name){ if(muted)return; const a=ctxA(); if(!a||a.state!=="running")return; const fn=SOUNDS[name]; if(fn)try{fn(a.currentTime)}catch(e){} }
  window.FX={
    sound:play,
    get muted(){return muted},
    setMuted(v){muted=!!v;try{localStorage.setItem("oyun-odasi-mute",muted?"1":"0")}catch(e){}},
    confetti(){ if(reduce)return; ensure(); spawn(90,innerWidth*.2,innerHeight*.35,1.6,11); spawn(90,innerWidth*.8,innerHeight*.35,1.6,11); setTimeout(()=>spawn(60,innerWidth/2,innerHeight*.25,2.4,9),250) },
    burst(el){ if(reduce||!el)return; ensure(); const r=el.getBoundingClientRect(); spawn(26,r.left+r.width/2,r.top+r.height/2,6.3,5) },
    shake(el){ if(reduce||!el)return; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake") }
  };
})();
