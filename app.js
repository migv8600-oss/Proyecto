/**
 * Centro Med / Clínica Santa Lucía Aesthetic - Anti-Gravity Interactive Physics & UI Controller
 */

let engine, world, runner;
let cardBodies = [];
let wallBodies = [];
let mouseConstraint;
let isGridMode = false;
let isPhysicsInitialized = false;

// Comprehensive Card Metadata Registry (Santa Lucía Aesthetic)
const CARD_DATA = {
  'hero-card': {
    title: 'Centro Med & Clínica Santa Lucía',
    category: 'Salud y Bienestar desde 1982',
    price: null,
    badge: '4 Décadas de Experiencia',
    icon: '🏥',
    description: 'Más de cuatro décadas al servicio de la comunidad. Brindamos atención médica integral con profesionales altamente calificados, quirófanos equipados y emergencias las 24 horas.',
    features: ['Emergencias 24 Horas / 365 días', 'Trato humano: Cada paciente es familia', 'Tecnología de diagnóstico moderna', 'Quirófanos y área de internación equipados'],
    ctaText: 'Reservar Cita por WhatsApp',
    waMessage: 'Hola, me gustaría agendar una consulta médica en Centro Med / Clínica Santa Lucía.'
  },
  'service-1': {
    title: 'Medicina General',
    category: 'Atención Integral',
    price: '$30.00',
    badge: 'Consulta Preventiva',
    icon: '🩺',
    description: 'Consulta médica integral, diagnóstico certero y tratamiento de enfermedades comunes. Chequeos preventivos y seguimiento clínico personalizado.',
    features: ['Toma de signos vitales completos', 'Evaluación clínica preventivo', 'Receta médica digital', 'Seguimiento por especialistas'],
    ctaText: 'Agendar Medicina General ($30)',
    waMessage: 'Hola, me gustaría solicitar una cita de Medicina General por $30.'
  },
  'service-2': {
    title: 'Ginecología & Obstetricia',
    category: 'Salud Femenina',
    price: '$40.00',
    badge: 'Control Prenatal',
    icon: '🤰',
    description: 'Atención especializada en salud femenina, control del embarazo paso a paso, ecografías de alta resolución y tratamiento de patologías ginecológicas.',
    features: ['Control prenatal especializado', 'Ecografía pélvica y obstétrica', 'Detección temprana de patologías', 'Atención cálida y confidencial'],
    ctaText: 'Agendar Ginecología ($40)',
    waMessage: 'Hola, deseo agendar una consulta de Ginecología y Obstetricia.'
  },
  'service-3': {
    title: 'Traumatología & Ortopedia',
    category: 'Especialidad Médica',
    price: '$45.00',
    badge: 'Atención de Traumas',
    icon: '🦴',
    description: 'Atención especializada e integral de heridas, traumas, luxaciones y fracturas. Tratamiento del sistema músculo-esquelético con tecnología de imagen.',
    features: ['Evaluación de fracturas y traumas', 'Inmovilización y curaciones', 'Diagnóstico por radiología/ecografía', 'Rehabilitación y seguimiento'],
    ctaText: 'Consultar Traumatología ($45)',
    waMessage: 'Hola, me gustaría agendar una cita en el área de Traumatología y Ortopedia.'
  },
  'service-4': {
    title: 'Cirugía General & Laparoscópica',
    category: 'Quirófano Especializado',
    price: '$120.00',
    badge: 'Mínimamente Invasiva',
    icon: '🔪',
    description: 'Cirugía general y laparoscópica avanzada: vesícula, apéndice, hernias, útero, ovarios, próstata, quistes y tumores con recuperación acelerada.',
    features: ['Quirófanos completamente equipados', 'Procedimientos laparoscópicos', 'Cirujanos generales certificados', 'Monitoreo post-quirúrgico continuo'],
    ctaText: 'Solicitar Evaluación Quirúrgica',
    waMessage: 'Hola, deseo información sobre los servicios de Cirugía General y Laparoscópica.'
  },
  'service-5': {
    title: 'Emergencias 24 Horas',
    category: 'Atención Inmediata 24/7',
    price: 'Atención 24/7',
    badge: '🔴 Activo 24H',
    icon: '🚑',
    description: 'Servicio de emergencias médicas y quirúrgicas disponible las 24 horas del día, los 365 días del año con respuesta inmediata.',
    features: ['Médicos emergenciólogos de guardia', 'Área de shock y estabilización', 'Disponibilidad de laboratorio 24H', 'Acceso directo a quirófano urgente'],
    ctaText: 'Llamar a Emergencias (0992834462)',
    waMessage: 'URGENTE: Solicito atención inmediata de Emergencias 24H.'
  },
  'service-6': {
    title: 'Laboratorio Clínico',
    category: 'Diagnósticos Automatizados',
    price: '$50.00',
    badge: 'Resultados Rápido',
    icon: '🧪',
    description: 'Hemograma completo, glucosa, urea, creatinina, perfil lipídico, examen de orina elemental y pruebas hormonales con resultados confiables el mismo día.',
    features: ['Procesamiento automatizado de muestras', 'Biometría e inmunología completa', 'Resultados digitales vía WhatsApp/Email', 'Toma de muestras bajo normas de bioseguridad'],
    ctaText: 'Consultar Exámenes de Laboratorio',
    waMessage: 'Hola, quisiera información sobre los exámenes de Laboratorio Clínico.'
  },
  'service-7': {
    title: 'Internaciones & Quirófanos',
    category: 'Hospitalización',
    price: '$80.00 / día',
    badge: 'Confort & Seguridad',
    icon: '🛋️',
    description: 'Habitaciones privadas y semi-privadas cómodas y totalmente equipadas para la recuperación post-quirúrgica o clínica con monitoreo de enfermería constante.',
    features: ['Habitaciones con aire acondicionado y TV', 'Monitoreo de signos vitales 24H', 'Atención personalizada de enfermería', 'Visita médica diaria garantizada'],
    ctaText: 'Consultar Disponibilidad de Habitaciones',
    waMessage: 'Hola, deseo consultar disponibilidad de habitaciones para internación.'
  },
  'service-8': {
    title: 'Farmacia Interna 24H',
    category: 'Servicios Complementarios',
    price: 'Stock Completo',
    badge: 'Disponibilidad Inmediata',
    icon: '💊',
    description: 'Farmacia interna con amplio stock de medicamentos insumos y soluciones médicas con atención continua para pacientes internados y ambulantes.',
    features: ['Amplia variedad de medicamentos de marca y genéricos', 'Atención continua las 24 horas', 'Descuentos para pacientes de consulta externa', 'Insumos quirúrgicos de alta calidad'],
    ctaText: 'Consultar Medicamentos',
    waMessage: 'Hola, me gustaría verificar la disponibilidad de un medicamento en farmacia.'
  },
  'testimonials-card': {
    title: 'Tradición Médica & Confianza',
    category: 'Reseñas de la Comunidad',
    price: '⭐ 4.9 / 5.0',
    badge: '100,000+ Pacientes',
    icon: '⭐',
    description: 'Durante más de cuatro décadas hemos sido un pilar fundamental en la salud de miles de familias con calidad, calidez y compromiso humano.',
    features: [
      '"Excelente clínica, trato muy humano y profesional por parte de médicos y enfermeras." - Rosa M.',
      '"Me operaron de la vesícula por laparoscopía y la recuperación fue rapidísima." - Javier L.',
      '"Atención de emergencia limpia, rápida y muy bien equipada." - Fernando C.'
    ],
    ctaText: 'Escribir una Opinión',
    waMessage: 'Hola, quisiera dejar una reseña sobre la atención recibida.'
  },
  'contact-payments-card': {
    title: 'Horarios de Atención & Teléfonos',
    category: 'Contacto Oficial',
    price: null,
    badge: 'Atención Continua',
    icon: '📞',
    description: 'Estamos disponibles para cuidar de tu salud con atención personalizada en consulta y emergencias continuas.',
    features: [
      '🕒 Consultas: 09:00 AM - 13:00 PM | 16:00 PM - 20:00 PM',
      '🔴 Emergencias: 24 Horas / 365 Días',
      '📞 Teléfonos fijos: (07) 293-1236 / (07) 293-3926',
      '📱 Celulares: 0992834462 / 0992834465',
      '💵 Medios de pago: Efectivo, Tarjetas de Crédito/Débito, Transferencia Directa'
    ],
    ctaText: 'Contactar Central Telefónica',
    waMessage: 'Hola, deseo comunicarme con la central telefónica de la clínica.'
  },
  'gps-card': {
    title: 'Ubicación Estratégica',
    category: 'Dirección Consultorio',
    price: null,
    badge: 'Fácil Acceso',
    icon: '📍',
    description: 'Ubicados estratégicamente en las calles Sucre y Santa Rosa esquina, diagonal al Coliseo de Deportes (Machala, El Oro, Ecuador).',
    features: [
      'Dirección: Calle Sucre y Santa Rosa esquina (Diagonal al Coliseo)',
      'Ciudad: Machala, Provincia de El Oro, Ecuador',
      'Rampa de accesibilidad e ingreso directo de ambulancias'
    ],
    ctaText: 'Abrir en Google Maps',
    waMessage: 'Hola, solicito la ubicación exacta en Google Maps para llegar a la clínica.'
  },
  'sistema-hc-card': {
    title: 'Sistema de Historias Clínicas (HC)',
    category: 'Portal Digital Pacientes',
    price: null,
    badge: 'Acceso Digital',
    icon: '💻',
    description: 'Acceso al sistema digital de gestión de historias clínicas para pacientes hospitalizados, quirúrgicos y de consulta externa.',
    features: [
      'Consulta de resultados de laboratorio online',
      'Acceso a informes quirúrgicos y ecográficos',
      'Seguridad y confidencialidad garantizada'
    ],
    ctaText: 'Ingresar al Sistema HC',
    waMessage: 'Hola, me gustaría solicitar acceso a mis historias clínicas digitales.'
  }
};

// Initialize Matter.js Physics Engine
function initPhysics() {
  if (typeof Matter === 'undefined') return;

  const container = document.getElementById('physics-container');
  if (!container) return;

  const { Engine, World, Bodies, Body, Mouse, MouseConstraint, Vector } = Matter;

  engine = Engine.create({ gravity: { x: 0, y: 0, scale: 0.001 } });
  world = engine.world;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const wallThickness = 120;

  wallBodies = [
    Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, { isStatic: true, restitution: 0.9 }),
    Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, { isStatic: true, restitution: 0.9 }),
    Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, restitution: 0.9 }),
    Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, restitution: 0.9 })
  ];
  World.add(world, wallBodies);

  const cards = Array.from(document.querySelectorAll('.physics-card'));
  cardBodies = [];

  const paddingX = Math.min(80, width * 0.08);
  const paddingY = 90;
  const availableW = Math.max(300, width - paddingX * 2);
  const availableH = Math.max(300, height - paddingY - 120);

  cards.forEach((cardEl) => {
    const rect = cardEl.getBoundingClientRect();
    const cardW = rect.width || 320;
    const cardH = rect.height || 190;

    const startX = paddingX + (Math.random() * (availableW - cardW)) + cardW / 2;
    const startY = paddingY + (Math.random() * (availableH - cardH)) + cardH / 2;

    const body = Bodies.rectangle(startX, startY, cardW, cardH, {
      frictionAir: 0.015,
      friction: 0.1,
      restitution: 0.85,
      chamfer: { radius: 18 }
    });

    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 3.5,
      y: (Math.random() - 0.5) * 3.5
    });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.03);

    body.domElement = cardEl;
    cardEl.matterBody = body;
    cardBodies.push(body);
    World.add(world, body);
  });

  const mouse = Mouse.create(container);
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.15, damping: 0.1, render: { visible: false } }
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
          if (speed < 0.2) {
            Body.applyForce(body, body.position, {
              x: (Math.random() - 0.5) * 0.0003,
              y: (Math.random() - 0.5) * 0.0003
            });
          }

          body.domElement.style.transform = `translate3d(${x - halfW}px, ${y - halfH}px, 0px) rotate(${angle}rad)`;
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

    shakeCards();

    btnGrid.classList.remove('bg-[#134074]', 'text-white');
    btnGrid.classList.add('text-slate-300', 'hover:text-white');
    btnZeroG.classList.add('bg-[#134074]', 'text-white');
    btnZeroG.classList.remove('text-slate-300');
    if (shakeBtn) shakeBtn.classList.remove('hidden');
  }
}

function shakeCards() {
  if (isGridMode || !Matter) return;
  const { Body } = Matter;
  cardBodies.forEach(body => {
    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 12,
      y: (Math.random() - 0.5) * 12
    });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);
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
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.754zm6.097-4.908l.389.231c1.55.922 3.33 1.409 5.15 1.41h.005c5.361 0 9.722-4.36 9.725-9.723.001-2.601-1.01-5.047-2.85-6.888-1.839-1.84-4.285-2.852-6.889-2.852-5.362 0-9.723 4.361-9.726 9.724-.001 1.944.576 3.839 1.666 5.485l.253.383-1.006 3.676 3.766-.987z"/>
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

// Apply dynamic branding, theme colors, logo, and price settings from Admin Panel
function applyDynamicBrandingAndServices() {
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
    // Default Santa Lucía Deep Navy & Royal Blue
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
      link.href = `https://wa.me/${branding.whatsapp}?text=Hola%20${encodeURIComponent(branding.name || 'Centro Med Santa Lucía')}%2C%20quisiera%20agendar%20una%20cita`;
    });
  }

  services.forEach(serv => {
    if (CARD_DATA[serv.card_id]) {
      CARD_DATA[serv.card_id].title = serv.title;
      CARD_DATA[serv.card_id].price = `$${parseFloat(serv.price).toFixed(2)}`;
      CARD_DATA[serv.card_id].description = serv.description;
      if (serv.category) CARD_DATA[serv.card_id].category = serv.category;
      if (serv.icon) CARD_DATA[serv.card_id].icon = serv.icon;
    }

    const cardEl = document.getElementById(serv.card_id);
    if (cardEl) {
      const priceSpan = cardEl.querySelector('.text-emerald-700, .text-emerald-600');
      if (priceSpan && serv.price) priceSpan.innerText = `$${parseFloat(serv.price).toFixed(2)}`;
      const titleEl = cardEl.querySelector('h3');
      if (titleEl) titleEl.innerText = serv.title;
    }
  });
}

// Event Listeners Setup
document.addEventListener('DOMContentLoaded', () => {
  applyDynamicBrandingAndServices();
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
