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
  window.FX={
    confetti(){ if(reduce)return; ensure(); spawn(90,innerWidth*.2,innerHeight*.35,1.6,11); spawn(90,innerWidth*.8,innerHeight*.35,1.6,11); setTimeout(()=>spawn(60,innerWidth/2,innerHeight*.25,2.4,9),250) },
    burst(el){ if(reduce||!el)return; ensure(); const r=el.getBoundingClientRect(); spawn(26,r.left+r.width/2,r.top+r.height/2,6.3,5) },
    shake(el){ if(reduce||!el)return; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake") }
  };
})();
