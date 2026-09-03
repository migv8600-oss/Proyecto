/**
 * Centro Med - Anti-Gravity Interactive Physics Controller (Live Supabase Realtime Sync)
 */

let engine, world;
let cardBodies = [];
let wallBodies = [];
let mouseConstraint;
let isGridMode = false;
let isPhysicsInitialized = false;

const SUPABASE_URL = 'https://aokvisoqggsolnrttopb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFva3Zpc29xZ2dzb2xucnR0b3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTk0MjcsImV4cCI6MjA3MjQ5NTQyN30.placeholder';

let supabaseClient = null;
if (typeof supabase !== 'undefined' && supabase.createClient) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Card Metadata Registry
const CARD_DATA = {
  'hero-card': {
    title: 'Centro Med',
    category: 'Consultorio Médico & Salud Integral',
    price: null,
    badge: 'Atención Médica 24/7',
    icon: '🏥',
    description: 'Atención médica integral con profesionales altamente calificados, tecnología avanzada y emergencias las 24 horas. ¡Toca o arrastra cualquier tarjeta en Antigravedad!',
    features: ['Emergencias 24 Horas / 365 días', 'Trato humano y cercano', 'Tecnología de diagnóstico moderna', 'Quirófanos y área de internación equipados'],
    ctaText: 'Reservar Cita por WhatsApp',
    waMessage: 'Hola Centro Med, me gustaría agendar una consulta médica.'
  },
  'service-1': {
    title: 'Medicina General',
    category: 'Atención Integral',
    price: '$30.00',
    badge: 'Consulta Preventiva',
    icon: '🩺',
    description: 'Consulta médica integral, diagnóstico certero, chequeos preventivos y tratamientos.',
    features: ['Toma de signos vitales completos', 'Evaluación clínica preventivo', 'Receta médica digital', 'Seguimiento por especialistas'],
    ctaText: 'Agendar Medicina General ($30)',
    waMessage: 'Hola Centro Med, me gustaría solicitar una cita de Medicina General por $30.'
  },
  'service-2': {
    title: 'Ginecología & Obstetricia',
    category: 'Salud Femenina',
    price: '$40.00',
    badge: 'Control Prenatal',
    icon: '🤰',
    description: 'Atención especializada en salud femenina, control del embarazo paso a paso y ecografías obstétricas de alta resolución.',
    features: ['Control prenatal especializado', 'Ecografía pélvica y obstétrica', 'Detección temprana de patologías', 'Atención cálida y confidencial'],
    ctaText: 'Agendar Ginecología ($40)',
    waMessage: 'Hola Centro Med, deseo agendar una consulta de Ginecología y Obstetricia.'
  },
  'service-3': {
    title: 'Traumatología & Ortopedia',
    category: 'Especialidad Médica',
    price: '$45.00',
    badge: 'Atención de Traumas',
    icon: '🦴',
    description: 'Atención especializada e tratamiento integral de heridas, traumas, luxaciones y fracturas.',
    features: ['Evaluación de fracturas y traumas', 'Inmovilización y curaciones', 'Diagnóstico por radiología/ecografía', 'Rehabilitación y seguimiento'],
    ctaText: 'Consultar Traumatología ($45)',
    waMessage: 'Hola Centro Med, me gustaría agendar una cita en Traumatología.'
  },
  'service-4': {
    title: 'Cirugía General & Laparoscópica',
    category: 'Quirófano Especializado',
    price: '$120.00',
    badge: 'Mínimamente Invasiva',
    icon: '🔪',
    description: 'Cirugía de vesícula, apéndice, hernias y tumores con procedimientos mínimamente invasivos.',
    features: ['Quirófanos completamente equipados', 'Procedimientos laparoscópicos', 'Cirujanos generales certificados', 'Monitoreo post-quirúrgico continuo'],
    ctaText: 'Solicitar Evaluación Quirúrgica',
    waMessage: 'Hola Centro Med, deseo información sobre los servicios de Cirugía General.'
  },
  'service-5': {
    title: 'Emergencias 24 Horas',
    category: 'Atención Inmediata 24/7',
    price: 'Atención 24/7',
    badge: '🔴 Activo 24H',
    icon: '🚑',
    description: 'Servicio de emergencia médica y quirúrgica disponible las 24 horas del día, los 365 días del año.',
    features: ['Médicos emergenciólogos de guardia', 'Área de shock y estabilización', 'Disponibilidad de laboratorio 24H', 'Acceso directo a quirófano urgente'],
    ctaText: 'Llamar a Emergencias (0992834462)',
    waMessage: 'URGENTE: Solicito atención inmediata de Emergencias 24H en Centro Med.'
  },
  'service-6': {
    title: 'Laboratorio Clínico',
    category: 'Diagnósticos Automatizados',
    price: '$50.00',
    badge: 'Resultados Rápido',
    icon: '🧪',
    description: 'Hemograma completo, glucosa, urea, creatinina y orina con resultados el mismo día.',
    features: ['Procesamiento automatizado de muestras', 'Biometría e inmunología completa', 'Resultados digitales vía WhatsApp/Email', 'Toma de muestras bajo normas de bioseguridad'],
    ctaText: 'Consultar Exámenes de Laboratorio',
    waMessage: 'Hola Centro Med, quisiera información sobre el Laboratorio Clínico.'
  },
  'service-7': {
    title: 'Internaciones & Quirófanos',
    category: 'Hospitalización',
    price: '$80.00 / día',
    badge: 'Confort & Seguridad',
    icon: '🛋️',
    description: 'Habitaciones privadas y confortables con monitoreo constante de enfermería.',
    features: ['Habitaciones con aire acondicionado y TV', 'Monitoreo de signos vitales 24H', 'Atención personalizada de enfermería', 'Visita médica diaria garantizada'],
    ctaText: 'Consultar Disponibilidad de Habitaciones',
    waMessage: 'Hola Centro Med, deseo consultar disponibilidad de habitaciones.'
  },
  'service-8': {
    title: 'Farmacia Interna 24H',
    category: 'Servicios Complementarios',
    price: 'Stock Completo',
    badge: 'Disponibilidad Inmediata',
    icon: '💊',
    description: 'Disponibilidad inmediata de medicamentos para pacientes hospitalizados y externos.',
    features: ['Amplia variedad de medicamentos de marca y genéricos', 'Atención continua las 24 horas', 'Descuentos para pacientes externos', 'Insumos quirúrgicos de alta calidad'],
    ctaText: 'Consultar Medicamentos',
    waMessage: 'Hola Centro Med, me gustaría verificar la disponibilidad de un medicamento.'
  },
  'testimonials-card': {
    title: 'Tradición Médica & Confianza',
    category: 'Reseñas de la Comunidad',
    price: '⭐ 4.9 / 5.0',
    badge: 'Confianza Calidad',
    icon: '⭐',
    description: 'Trato humano y profesional con alta calidad clínica.',
    features: [
      '"Excelente atención clínica, trato muy humano y profesional de médicos y enfermeras." - María G.',
      '"Me operaron de la vesícula por laparoscopía y la recuperación fue rapidísima." - Javier L.'
    ],
    ctaText: 'Escribir una Opinión',
    waMessage: 'Hola Centro Med, quisiera dejar una reseña sobre la atención.'
  },
  'contact-payments-card': {
    title: 'Horarios & Teléfonos Directos',
    category: 'Contacto Oficial',
    price: null,
    badge: 'Atención Continua',
    icon: '📞',
    description: 'Estamos disponibles para cuidar de tu salud.',
    features: [
      '🕒 Consultas: 09:00 - 13:00 / 16:00 - 20:00',
      '🔴 Emergencias: 24 Horas / 365 Días',
      '📞 Teléfonos fijos: (07) 293-1236 · 0992834462'
    ],
    ctaText: 'Contactar Central Telefónica',
    waMessage: 'Hola Centro Med, me gustaría comunicarme con recepción.'
  },
  'gps-card': {
    title: 'Ubicación Centro Med',
    category: 'Dirección Consultorio',
    price: null,
    badge: 'Fácil Acceso',
    icon: '📍',
    description: 'Av. Principal de la Salud #450, Edificio Centro Med.',
    features: [
      'Dirección: Av. Principal de la Salud #450',
      'Frente al Parque Central / Estacionamiento privado'
    ],
    ctaText: 'Abrir en Google Maps',
    waMessage: 'Hola Centro Med, solicito la ubicación exacta en Google Maps.'
  },
  'sistema-hc-card': {
    title: 'Sistema de Historias Clínicas (HC)',
    category: 'Portal Digital Pacientes',
    price: null,
    badge: 'Acceso Digital',
    icon: '💻',
    description: 'Acceso al sistema digital de historias clínicas para pacientes.',
    features: ['Consulta de exámenes online', 'Acceso seguro y confidencial'],
    ctaText: 'Ingresar al Sistema HC',
    waMessage: 'Hola Centro Med, me gustaría solicitar acceso a mis historias clínicas.'
  }
};

// Initialize Symmetrical Floating Grid Physics
function initPhysics() {
  if (typeof Matter === 'undefined') return;

  const container = document.getElementById('physics-container');
  if (!container) return;

  const { Engine, World, Bodies, Body, Mouse, MouseConstraint, Vector } = Matter;

  engine = Engine.create({ gravity: { x: 0, y: 0, scale: 0.0005 } });
  world = engine.world;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const wallThickness = 120;

  wallBodies = [
    Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, { isStatic: true, restitution: 0.8 }),
    Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, { isStatic: true, restitution: 0.8 }),
    Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, restitution: 0.8 }),
    Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, restitution: 0.8 })
  ];
  World.add(world, wallBodies);

  const cards = Array.from(document.querySelectorAll('.physics-card'));
  cardBodies = [];

  const cols = width < 768 ? 1 : (width < 1280 ? 3 : 4);
  const paddingX = width < 768 ? 20 : 60;
  const startY = width < 768 ? 110 : 130;
  const cellW = (width - paddingX * 2) / cols;
  const cellH = 220;

  cards.forEach((cardEl, idx) => {
    const colIdx = idx % cols;
    const rowIdx = Math.floor(idx / cols);

    const slotX = paddingX + (colIdx * cellW) + (cellW / 2);
    const slotY = startY + (rowIdx * cellH) + 90;

    const rect = cardEl.getBoundingClientRect();
    const cardW = rect.width || 310;
    const cardH = rect.height || 185;

    const body = Bodies.rectangle(slotX, slotY, cardW, cardH, {
      frictionAir: 0.035,
      friction: 0.15,
      restitution: 0.4,
      chamfer: { radius: 18 }
    });

    body.targetSlot = { x: slotX, y: slotY };

    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 1.2,
      y: (Math.random() - 0.5) * 1.2
    });

    body.domElement = cardEl;
    cardEl.matterBody = body;
    cardBodies.push(body);
    World.add(world, body);
  });

  const mouse = Mouse.create(container);
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.2, damping: 0.15, render: { visible: false } }
  });
  World.add(world, mouseConstraint);

  let lastTime = performance.now();
  function updatePhysics(time) {
    const delta = Math.min((time - lastTime) / 1000, 0.033);
    lastTime = time;

    if (!isGridMode) {
      Engine.update(engine, delta * 1000);

      cardBodies.forEach(body => {
        if (body && body.domElement) {
          const { x, y } = body.position;
          const angle = body.angle;
          const rect = body.domElement.getBoundingClientRect();
          const halfW = rect.width / 2;
          const halfH = rect.height / 2;

          const speed = Vector.magnitude(body.velocity);
          if (speed < 0.15 && body.targetSlot) {
            const dx = body.targetSlot.x - x;
            const dy = body.targetSlot.y - y;
            Body.applyForce(body, body.position, {
              x: dx * 0.00008,
              y: dy * 0.00008
            });
          }

          if (Math.abs(angle) > 0.15) {
            Body.setAngularVelocity(body, -angle * 0.05);
          }

          body.domElement.style.transform = `translate3d(${x - halfW}px, ${y - halfH}px, 0px) rotate(${angle * 0.4}rad)`;
        }
      });
    }

    requestAnimationFrame(updatePhysics);
  }

  requestAnimationFrame(updatePhysics);
  isPhysicsInitialized = true;
}

window.addEventListener('resize', () => {
  if (!engine || isGridMode) return;
  const { Bodies, Body } = Matter;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const wallThickness = 120;

  if (wallBodies.length === 4) {
    Body.setPosition(wallBodies[0], { x: width / 2, y: -wallThickness / 2 });
    Body.setPosition(wallBodies[1], { x: width / 2, y: height + wallThickness / 2 });
    Body.setPosition(wallBodies[2], { x: -wallThickness / 2, y: height / 2 });
    Body.setPosition(wallBodies[3], { x: width + wallThickness / 2, y: height / 2 });
  }
});

function toggleViewMode(targetMode) {
  const container = document.getElementById('physics-container');
  const btnZeroG = document.getElementById('btn-zerog');
  const btnGrid = document.getElementById('btn-grid');
  const shakeBtn = document.getElementById('btn-shake');

  if (targetMode === 'grid') {
    isGridMode = true;
    container.classList.remove('h-screen', 'overflow-hidden');
    container.classList.add('grid-mode-container');

    cardBodies.forEach(body => {
      if (body && body.domElement) {
        body.domElement.classList.remove('physics-card');
        body.domElement.classList.add('grid-mode-card');
        body.domElement.style.transform = '';
      }
    });

    btnZeroG.classList.remove('bg-[#134074]', 'text-white');
    btnZeroG.classList.add('text-slate-300', 'hover:text-white');
    btnGrid.classList.add('bg-[#134074]', 'text-white');
    btnGrid.classList.remove('text-slate-300');
    if (shakeBtn) shakeBtn.classList.add('hidden');
  } else {
    isGridMode = false;
    container.classList.add('h-screen', 'overflow-hidden');
    container.classList.remove('grid-mode-container');

    cardBodies.forEach(body => {
      if (body && body.domElement) {
        body.domElement.classList.add('physics-card');
        body.domElement.classList.remove('grid-mode-card');
      }
    });

    organizeMatrix();

    btnGrid.classList.remove('bg-[#134074]', 'text-white');
    btnGrid.classList.add('text-slate-300', 'hover:text-white');
    btnZeroG.classList.add('bg-[#134074]', 'text-white');
    btnZeroG.classList.remove('text-slate-300');
    if (shakeBtn) shakeBtn.classList.remove('hidden');
  }
}

function organizeMatrix() {
  if (isGridMode || !Matter) return;
  const { Body } = Matter;

  cardBodies.forEach(body => {
    if (body.targetSlot) {
      Body.setPosition(body, { x: body.targetSlot.x, y: body.targetSlot.y });
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 1.5, y: (Math.random() - 0.5) * 1.5 });
      Body.setAngle(body, 0);
      Body.setAngularVelocity(body, 0);
    }
  });
}

function shakeCards() {
  if (isGridMode || !Matter) return;
  const { Body } = Matter;
  cardBodies.forEach(body => {
    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8
    });
  });
}

function openCardModal(cardId) {
  const data = CARD_DATA[cardId];
  if (!data) return;

  const modal = document.getElementById('card-modal');
  const contentContainer = document.getElementById('modal-content');

  const featuresHtml = data.features.map(item => `
    <li class="flex items-start gap-2.5 text-slate-700">
      <span class="text-[#134074] font-bold mt-0.5">✓</span>
      <span>${item}</span>
    </li>
  `).join('');

  const waUrl = `https://wa.me/5930992834462?text=${encodeURIComponent(data.waMessage)}`;

  contentContainer.innerHTML = `
    <div class="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-blue-50 text-[#134074] flex items-center justify-center text-2xl shadow-sm border border-blue-100">
          ${data.icon}
        </div>
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-[#134074] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">${data.category}</span>
          <h3 class="text-xl font-bold text-[#0B2545] mt-1">${data.title}</h3>
        </div>
      </div>
      ${data.price ? `<div class="text-right">
        <span class="block text-xl font-extrabold text-[#0B2545]">${data.price}</span>
        <span class="text-xs text-slate-500">Transparente</span>
      </div>` : ''}
    </div>

    <p class="text-slate-600 mb-6 leading-relaxed text-sm sm:text-base">${data.description}</p>

    <div class="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-6">
      <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detalles & Características</h4>
      <ul class="space-y-2 text-sm">
        ${featuresHtml}
      </ul>
    </div>

    <div class="flex items-center justify-end gap-3 pt-2">
      <button onclick="closeModal('card-modal')" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition">
        Cerrar
      </button>
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition">
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.754zm6.097-4.908l.389.231c1.55.922 3.33 1.409 5.15 1.41h.005c5.361 0 9.722-4.36 9.725-9.723.001-2.601-1.01-5.047-2.85-6.888-1.839-1.84-4.285-2.852-6.889-2.852-5.362 0-9.723 4.361-9.726 9.724-.001 1.944.576 3.839 1.666 5.485l.253.383-1.006 3.676 3.766-.987z"/>
        </svg>
        ${data.ctaText}
      </a>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Apply dynamic branding, theme colors, logo, and price settings from Live Supabase DB
async function applyDynamicBrandingAndServices() {
  if (supabaseClient) {
    try {
      // 1. Fetch live services from Supabase
      const { data: dbServices } = await supabaseClient.from('services').select('*');
      if (dbServices && dbServices.length > 0) {
        localStorage.setItem('centromed_services', JSON.stringify(dbServices));
      }

      // 2. Fetch live settings from Supabase
      const { data: dbSettings } = await supabaseClient.from('settings').select('*');
      if (dbSettings) {
        dbSettings.forEach(s => {
          if (s.key === 'branding') localStorage.setItem('centromed_branding', JSON.stringify(s.value));
          if (s.key === 'theme') localStorage.setItem('centromed_theme', JSON.stringify(s.value));
        });
      }
    } catch (e) {
      console.log('Using local fallback state');
    }
  }

  const theme = JSON.parse(localStorage.getItem('centromed_theme') || '{}');
  const branding = JSON.parse(localStorage.getItem('centromed_branding') || '{}');
  const services = JSON.parse(localStorage.getItem('centromed_services') || '[]');

  const root = document.documentElement;
  if (theme.palette === 'emerald') {
    root.style.setProperty('--primary-navy', '#064E3B');
    root.style.setProperty('--primary-blue', '#059669');
    root.style.setProperty('--bg-medical', '#F0FDF4');
  } else if (theme.palette === 'purple') {
    root.style.setProperty('--primary-navy', '#3B0764');
    root.style.setProperty('--primary-blue', '#7C3AED');
    root.style.setProperty('--bg-medical', '#FAF5FF');
  } else if (theme.palette === 'dark') {
    root.style.setProperty('--primary-navy', '#0F172A');
    root.style.setProperty('--primary-blue', '#38BDF8');
    root.style.setProperty('--bg-medical', '#020617');
    document.body.classList.add('text-slate-100');
    document.body.classList.remove('text-slate-800');
  } else {
    root.style.setProperty('--primary-navy', '#0B2545');
    root.style.setProperty('--primary-blue', '#134074');
    root.style.setProperty('--bg-medical', '#EEF4F8');
  }

  if (theme.font) root.style.setProperty('--font-family', theme.font);
  if (theme.radius) root.style.setProperty('--card-radius', theme.radius);

  if (theme.defaultMode === 'grid') {
    setTimeout(() => toggleViewMode('grid'), 200);
  }

  if (branding.name) {
    document.querySelectorAll('.brand-name-text').forEach(el => el.innerText = branding.name);
  }
  if (branding.subheading) {
    const heroDesc = document.querySelector('#hero-card p');
    if (heroDesc) heroDesc.innerText = branding.subheading;
  }
  if (branding.whatsapp) {
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
      link.href = `https://wa.me/${branding.whatsapp}?text=Hola%20${encodeURIComponent(branding.name || 'Centro Med')}%2C%20quisiera%20agendar%20una%20cita`;
    });
  }

  services.forEach(serv => {
    if (CARD_DATA[serv.card_id]) {
      CARD_DATA[serv.card_id].title = serv.title;
      CARD_DATA[serv.card_id].price = serv.price > 0 ? `$${parseFloat(serv.price).toFixed(2)}` : 'Servicio 24H';
      CARD_DATA[serv.card_id].description = serv.description;
      if (serv.category) CARD_DATA[serv.card_id].category = serv.category;
      if (serv.icon) CARD_DATA[serv.card_id].icon = serv.icon;
    }

    const cardEl = document.getElementById(serv.card_id);
    if (cardEl) {
      const priceSpan = cardEl.querySelector('.text-emerald-700, .text-emerald-600');
      if (priceSpan && serv.price !== undefined) {
        priceSpan.innerText = serv.price > 0 ? `$${parseFloat(serv.price).toFixed(2)}` : 'Servicio 24H';
      }
      const titleEl = cardEl.querySelector('h3');
      if (titleEl && serv.title) titleEl.innerText = serv.title;
    }
  });
}

// Event Listeners Setup
document.addEventListener('DOMContentLoaded', async () => {
  await applyDynamicBrandingAndServices();
  setTimeout(initPhysics, 100);

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  document.querySelectorAll('.physics-card, .grid-mode-card').forEach(card => {
    card.addEventListener('pointerdown', (e) => {
      isDragging = false;
      startX = e.clientX;
      startY = e.clientY;
    });

    card.addEventListener('pointermove', (e) => {
      if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) {
        isDragging = true;
      }
    });

    card.addEventListener('pointerup', (e) => {
      if (!isDragging) {
        const cardId = card.getAttribute('data-card-id');
        if (cardId) openCardModal(cardId);
      }
    });
  });
});
