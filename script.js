const PHONE = "528332932117";
const dateInput = document.getElementById("eventDate");
const bookingForm = document.getElementById("bookingForm");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

// Menú móvil
menuToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mainNav.classList.remove("open")));

// El formulario permite solicitar fechas futuras. El sitio no confirma ni cobra anticipos automáticamente.
const today = new Date();
today.setHours(0,0,0,0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate()+1);
dateInput.min = toLocalDate(tomorrow);

function toLocalDate(date){
  const y=date.getFullYear(), m=String(date.getMonth()+1).padStart(2,"0"), d=String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}

const guestsSelect = document.getElementById("guests");
const autoPackage = document.getElementById("autoPackage");
const autoPackageName = document.getElementById("autoPackageName");
const autoPackageDetail = document.getElementById("autoPackageDetail");
let assignedPackage = null;

function resolvePackage() {
  const guests = guestsSelect.value;
  const dateValue = dateInput.value;

  if (!guests) return null;

  if (guests === "61-70") {
    return {
      key: "quote",
      name: "Cotización especial",
      price: "Precio por confirmar",
      detail: "Para eventos de 61 a 70 personas. Consulta disponibilidad y cotización."
    };
  }

  if (!dateValue) return null;

  const [year, month, day] = dateValue.split("-").map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  const weekend = weekday === 5 || weekday === 6 || weekday === 0;

  if (weekend) {
    return {
      key: "celebracion",
      name: "Plan celebración",
      price: "$4,500 MXN",
      detail: "Viernes, sábado y domingo · hasta 60 personas."
    };
  }

  if (guests === "10-25") {
    return {
      key: "intimo",
      name: "Plan íntimo",
      price: "$2,500 MXN",
      detail: "Lunes a jueves · de 10 a 25 personas."
    };
  }

  return {
    key: "reunion",
    name: "Plan reunión",
    price: "$3,500 MXN",
    detail: "Lunes a jueves · de 26 a 60 personas."
  };
}

function refreshPackage() {
  assignedPackage = resolvePackage();

  document.querySelectorAll(".ticket").forEach((card, index) => {
    const keys = ["intimo", "reunion", "celebracion"];
    card.classList.toggle("is-assigned", !!assignedPackage && keys[index] === assignedPackage.key);
  });

  if (!guestsSelect.value) {
    autoPackageName.textContent = "Selecciona cantidad de personas";
    autoPackageDetail.textContent = "El paquete aparecerá aquí según el día de tu evento y tus invitados.";
    autoPackage.classList.remove("is-ready");
    return;
  }

  if (!dateInput.value && guestsSelect.value !== "61-70") {
    autoPackageName.textContent = "Selecciona la fecha de tu evento";
    autoPackageDetail.textContent = "Necesitamos la fecha para saber si aplica tarifa entre semana o de fin de semana.";
    autoPackage.classList.remove("is-ready");
    return;
  }

  autoPackageName.textContent = `${assignedPackage.name} · ${assignedPackage.price}`;
  autoPackageDetail.textContent = assignedPackage.detail;
  autoPackage.classList.add("is-ready");
}

dateInput.addEventListener("change", refreshPackage);
guestsSelect.addEventListener("change", refreshPackage);
refreshPackage();

// Las tarjetas conservan su diseño y al pulsarlas llevan al formulario con el rango de invitados sugerido.
document.querySelectorAll("[data-package]").forEach(link => {
  link.addEventListener("click", () => {
    const plan = link.dataset.package;
    if (plan === "Plan íntimo") guestsSelect.value = "10-25";
    else guestsSelect.value = "26-60";
    refreshPackage();
  });
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const date = dateInput.value;
  if (!date) { alert("Selecciona la fecha de tu evento."); return; }
  const chosen = new Date(date + "T12:00:00");
  if (chosen <= today) { alert("Selecciona una fecha futura."); return; }
  if (!guestsSelect.value) { alert("Selecciona la cantidad de personas."); return; }

  refreshPackage();
  if (!assignedPackage) {
    alert("No fue posible asignar el paquete. Revisa la fecha y la cantidad de personas.");
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  if (phone.replace(/\D/g, "").length < 10) { alert("Escribe un teléfono válido de 10 dígitos."); return; }

  const prettyDate = chosen.toLocaleDateString("es-MX", {weekday:"long", year:"numeric", month:"long", day:"numeric"});
  const notes = document.getElementById("notes").value.trim();
  const guestLabel = guestsSelect.options[guestsSelect.selectedIndex].text;
  const message = [
    "¡Hola! Me interesa solicitar una fecha en Pool 915.",
    "",
    `Nombre: ${name}`,
    `Teléfono: ${phone}`,
    `Fecha solicitada: ${prettyDate}`,
    `Personas: ${guestLabel}`,
    `Paquete asignado automáticamente: ${assignedPackage.name}`,
    `Precio: ${assignedPackage.price}`,
    notes ? `Detalles: ${notes}` : "",
    "",
    "Entiendo que la fecha está sujeta a confirmación y que el anticipo para apartar es de $500 MXN."
  ].filter(Boolean).join("\n");

  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

// Atajo opcional para el encargado: abre la guía de control local con ?admin=1.
// Esta demostración no sustituye una base de datos ni bloquea fechas entre distintos dispositivos.
if(new URLSearchParams(location.search).get("admin")==="1"){
  const admin = document.createElement("aside");
  admin.className = "admin-hint";
  admin.innerHTML = `<b>Vista de administración (demo)</b><p>Las solicitudes llegan por WhatsApp. Para llevar control real de fechas entre varios dispositivos se necesita conectar una base de datos y un panel privado.</p><button type="button">Entendido</button>`;
  document.body.appendChild(admin);
  const style=document.createElement("style");
  style.textContent=".admin-hint{position:fixed;z-index:50;left:18px;bottom:18px;max-width:300px;background:#fff;padding:18px;box-shadow:0 5px 30px #0003;font:12px 'DM Sans';color:#222}.admin-hint p{line-height:1.6;color:#666}.admin-hint button{border:0;background:#b3944c;color:#fff;padding:9px 15px;cursor:pointer}";
  document.head.appendChild(style);
  admin.querySelector("button").onclick=()=>admin.remove();
}


// Flechas para mover carruseles de paquetes y fotografías.
document.querySelectorAll(".carousel-arrow").forEach(button => {
  button.addEventListener("click", () => {
    const track = document.getElementById(button.dataset.target);
    if (!track) return;
    const direction = Number(button.dataset.direction) || 1;
    const item = track.querySelector(":scope > *");
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 12;
    const distance = item ? item.getBoundingClientRect().width + gap : track.clientWidth * .8;
    track.scrollBy({left: direction * distance, behavior:"smooth"});
  });
});

// Galería: avanza sola, puntos sincronizados con la foto visible y pausa al interactuar
(function(){
  const track=document.getElementById('galleryTrack'), box=document.getElementById('galleryDots');
  if(!track||!box) return;
  const slides=[...track.querySelectorAll('.gallery-slide')];
  let idx=0, lock=0;
  const dots=slides.map((s,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Ver fotografía '+(i+1));b.innerHTML='<i></i>';b.addEventListener('click',()=>go(i));box.appendChild(b);return b;});
  const padL=()=>parseFloat(getComputedStyle(track).paddingLeft)||0;
  function paint(){dots.forEach((d,i)=>d.classList.toggle('active',i===idx));}
  function go(i){
    idx=(i+slides.length)%slides.length; lock=Date.now()+900; paint();
    const left=slides[idx].getBoundingClientRect().left-track.getBoundingClientRect().left+track.scrollLeft-padL();
    track.scrollTo({left,behavior:'smooth'}); setTimeout(sync,950);
  }
  function sync(){
    if(Date.now()<lock) return;
    const tl=track.getBoundingClientRect().left+padL(); let best=0,d=1e9;
    slides.forEach((s,i)=>{const x=Math.abs(s.getBoundingClientRect().left-tl); if(x<d){d=x;best=i;}});
    if(track.scrollLeft+track.clientWidth>=track.scrollWidth-4) best=slides.length-1;
    if(best!==idx){idx=best;paint();}
  }
  track.addEventListener('scroll',sync,{passive:true});
  box.addEventListener('animationend',e=>{if(e.animationName==='galFill') go(idx+1);});
  const pause=()=>box.classList.add('paused'), play=()=>box.classList.remove('paused');
  [track,box].forEach(el=>{el.addEventListener('pointerenter',pause);el.addEventListener('pointerleave',play);el.addEventListener('focusin',pause);el.addEventListener('focusout',play);});
  track.addEventListener('touchstart',pause,{passive:true}); track.addEventListener('touchend',()=>setTimeout(play,2500),{passive:true});
  document.querySelectorAll('.carousel-arrow[data-target="galleryTrack"]').forEach(btn=>btn.addEventListener('click',()=>setTimeout(()=>{sync();},700)));
  if('IntersectionObserver' in window) new IntersectionObserver(en=>{en[0].isIntersecting?play():pause();},{threshold:.3}).observe(track);
  paint();
})();

// Portada: las fotos del collage van cambiando solas
(function(){
  const imgs=[...document.querySelectorAll('.pol img')];
  if(imgs.length<3||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const pool=['foto-5','foto-1','foto-3','foto-6','foto-4','foto-2'].map(n=>'assets/'+n+'.jpg');
  pool.forEach(s=>{const i=new Image();i.src=s;});
  let next=3,k=0;
  setInterval(()=>{ if(document.hidden) return; const im=imgs[k%3]; k++; im.style.opacity=0;
    setTimeout(()=>{im.src=pool[next%pool.length];next++;im.style.opacity=1;},450); },3800);
})();

// Cifras que cuentan al aparecer
(function(){
  const els=document.querySelectorAll('.stats b');
  if(!els.length||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  els.forEach(b=>{const m=b.textContent.match(/\d+/); if(!m) return;
    const n=+m[0], pre=b.textContent.slice(0,m.index), post=b.textContent.slice(m.index+m[0].length);
    const io=new IntersectionObserver(en=>{ if(!en[0].isIntersecting) return; io.disconnect(); const t0=performance.now();
      (function f(t){const p=Math.min(1,(t-t0)/1100); b.textContent=pre+Math.round(n*(1-Math.pow(1-p,3)))+post; if(p<1) requestAnimationFrame(f);})(t0); },{threshold:.6});
    io.observe(b);});
})();

// Aparición suave de tarjetas al hacer scroll
(function(){
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const els=document.querySelectorAll('.stats>div,.bento article,.ticket,.steps li,.visit li,.title,.booking-form,.deposit');
  const io=new IntersectionObserver(en=>en.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}}),{threshold:.12});
  els.forEach((e,i)=>{e.classList.add('rv');e.style.transitionDelay=(i%4)*70+'ms';io.observe(e);});
})();
