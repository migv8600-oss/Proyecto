/**
 * Centro Med - Anti-Gravity Interactive Physics & UI Controller
 * Uses Matter.js engine to power floating medical cards in 2D zero-gravity.
 */

// Global State & Matter.js References
let engine, world, runner;
let cardBodies = [];
let wallBodies = [];
let mouseConstraint;
let isGridMode = false;
let isPhysicsInitialized = false;

// Card Metadata Registry
const CARD_DATA = {
  'hero-card': {
    title: 'Centro Med - Atención Médica Integral',
    category: 'Consultorio Médico Principal',
    price: null,
    badge: 'Atención 24/7',
    icon: '🏥',
    description: 'En Centro Med nos enfocamos en brindar atención médica especializada con tecnología de vanguardia y calidez humana. Contamos con médicos especialistas en diversas áreas para proteger la salud de toda tu familia.',
    features: ['Atención personalizada', 'Diagnósticos de alta precisión', 'Cómodas instalaciones', 'Equipo médico certificado'],
    ctaText: 'Reservar Cita por WhatsApp',
    waMessage: 'Hola Centro Med, me gustaría solicitar información general y reservar una cita.'
  },
  'service-1': {
    title: 'Consulta Médica General',
    category: 'Medicina General',
    price: '$30.00',
    badge: 'Popular',
    icon: '🩺',
    description: 'Evaluación clínica completa, toma de signos vitales, diagnóstico preventivo y prescripción de tratamiento médico.',
    features: ['Chequeo de presión arterial y glucosa', 'Evaluación física integral', 'Receta médica digital', 'Seguimiento personalizado'],
    ctaText: 'Agendar Consulta ($30)',
    waMessage: 'Hola Centro Med, deseo agendar una Consulta Médica General por $30.'
  },
  'service-2': {
    title: 'Chequeo Médico Integral',
    category: 'Medicina Preventiva',
    price: '$75.00',
    badge: 'Recomendado',
    icon: '📊',
    description: 'Perfil completo de exámenes clínicos preventivos. Incluye biometría, perfil lipídico, glucosa y consulta de valoración.',
    features: ['Análisis de sangre y orina completos', 'Evaluación médica post-resultados', 'Informe de riesgo cardiovascular', 'Plan nutricional básico'],
    ctaText: 'Agendar Chequeo ($75)',
    waMessage: 'Hola Centro Med, deseo solicitar el Chequeo Médico Integral por $75.'
  },
  'service-3': {
    title: 'Electrocardiograma (ECG)',
    category: 'Cardiología',
    price: '$45.00',
    badge: 'Diagnóstico Rápido',
    icon: '❤️',
    description: 'Estudio de la actividad eléctrica del corazón para detectar arritmias, insuficiencias o patologías cardíacas.',
    features: ['Lectura por cardiólogo especialista', 'Informe gráfico inmediato', 'Evaluación de ritmo y conducción', 'Sin dolor ni preparación previa'],
    ctaText: 'Reservar ECG ($45)',
    waMessage: 'Hola Centro Med, deseo agendar un Electrocardiograma por $45.'
  },
  'service-4': {
    title: 'Pediatría y Neonatología',
    category: 'Atención Infantil',
    price: '$35.00',
    badge: 'Cuidado Infantil',
    icon: '👶',
    description: 'Control del crecimiento, desarrollo psicomotor, esquema de vacunación y tratamiento de enfermedades pediátricas.',
    features: ['Control de peso y talla', 'Evaluación de desarrollo infantil', 'Orientación de vacunación', 'Atención cálida y sin estrés'],
    ctaText: 'Agendar Consulta Pediátrica ($35)',
    waMessage: 'Hola Centro Med, quiero agendar una consulta de Pediatría por $35.'
  },
  'service-5': {
    title: 'Laboratorio Clínico',
    category: 'Diagnósticos',
    price: '$50.00',
    badge: 'Resultados el Mismo Día',
    icon: '🧪',
    description: 'Tomas de muestra automatizadas con estándares internacionales de bioseguridad y entrega rápida de resultados online.',
    features: ['Biometría hematológica', 'Perfil tiroideo y hormonal', 'Pruebas infecciosas rápidas', 'Resultados por WhatsApp/Email'],
    ctaText: 'Consultar Exámenes ($50)',
    waMessage: 'Hola Centro Med, me gustaría información sobre los exámene de Laboratorio Clínico.'
  },
  'service-6': {
    title: 'Odontología Especializada',
    category: 'Salud Oral',
    price: '$40.00',
    badge: 'Estética Dental',
    icon: '🦷',
    description: 'Profilaxis profiláctica, limpieza con ultrasonido, diagnóstico con cámara intraoral y plan de diseño de sonrisa.',
    features: ['Limpieza ultrasónica profunda', 'Aplicación de flúor', 'Revisión de caries y encías', 'Presupuesto de tratamiento transparente'],
    ctaText: 'Reservar Odontología ($40)',
    waMessage: 'Hola Centro Med, deseo agendar una cita de Odontología Especializada por $40.'
  },
  'testimonials-card': {
    title: 'Testimonios de Nuestros Pacientes',
    category: 'Reputación & Opiniones',
    price: '⭐ 4.9 / 5.0',
    badge: '120+ Opiniones',
    icon: '⭐',
    description: 'La satisfacción de nuestros pacientes es nuestro mayor orgullo. Conoce algunas experiencias de quienes confían en Centro Med.',
    features: [
      '"Excelente atención y diagnóstico certero. Los doctores son muy amables." - María G.',
      '"Reservar por WhatsApp fue súper fácil y no tuve que esperar nada." - Carlos R.',
      '"Instalaciones limpias, modernas y precios bastante accesibles." - Elena P.'
    ],
    ctaText: 'Escribir una Opinión',
    waMessage: 'Hola Centro Med, me gustaría dejar mi testimonio sobre la excelente atención.'
  },
  'contact-payments-card': {
    title: 'Horarios de Atención & Formas de Pago',
    category: 'Información Práctica',
    price: null,
    badge: 'Información Oficial',
    icon: '💳',
    description: 'Te facilitamos el acceso a la salud con amplios horarios y múltiples opciones de pago flexibles.',
    features: [
      '🕒 Lunes a Viernes: 8:00 AM - 8:00 PM',
      '🕒 Sábados: 8:00 AM - 4:00 PM',
      '🕒 Domingos: Atención de Urgencias',
      '💵 Medios de pago: Efectivo, Tarjeta de Crédito/Débito, Transferencia Bancaria Directa'
    ],
    ctaText: 'Contactar Administración',
    waMessage: 'Hola Centro Med, necesito información sobre horarios y formas de pago.'
  },
  'social-card': {
    title: 'Comunidad & Redes Sociales',
    category: 'Síguenos Online',
    price: null,
    badge: '@CentroMedOficial',
    icon: '🌐',
    description: 'Únete a nuestras redes sociales para recibir consejos de salud diarios, promociones exclusivas en chequeos y transmisiones en vivo con nuestros especialistas.',
    features: [
      'Facebook: @CentroMedOficial',
      'Instagram: @CentroMed_Salud',
      'TikTok: @CentroMedTips'
    ],
    ctaText: 'Enviar mensaje directo',
    waMessage: 'Hola Centro Med, los sigo en redes sociales y quisiera hacer una consulta.'
  },
  'gps-card': {
    title: 'Ubicación & GPS Centro Med',
    category: 'Dirección Consultorio',
    price: null,
    badge: 'Fácil Acceso',
    icon: '📍',
    description: 'Nos encontramos ubicados en la zona médica central, con amplio parqueadero privado y rampa de accesibilidad.',
    features: [
      'Dirección: Av. Principal de la Salud #450, Edificio Centro Med, Piso 2',
      'Referencia: Frente al Parque Central / Al lado de Farmacias de la Ciudad',
      'Estacionamiento: Gratuito para pacientes'
    ],
    ctaText: 'Abrir en Google Maps',
    waMessage: 'Hola Centro Med, solicito la ubicación GPS exacta para llegar a su consultorio.'
  }
};

// Initialize Matter.js Engine & Synchronize DOM
function initPhysics() {
  if (typeof Matter === 'undefined') {
    console.error('Matter.js library not loaded yet.');
    return;
  }

  const container = document.getElementById('physics-container');
  if (!container) return;

  // Module aliases
  const { Engine, World, Bodies, Body, Mouse, MouseConstraint, Vector } = Matter;

  // 1. Create Engine
  engine = Engine.create({
    gravity: { x: 0, y: 0, scale: 0.001 } // Zero gravity environment
  });
  world = engine.world;

  const width = window.innerWidth;
  const height = window.innerHeight;

  // 2. Create Boundary Walls (Thick invisible walls around screen)
  const wallThickness = 120;
  wallBodies = [
    // Top
    Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, { isStatic: true, friction: 0.1, restitution: 0.9 }),
    // Bottom
    Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, { isStatic: true, friction: 0.1, restitution: 0.9 }),
    // Left
    Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, friction: 0.1, restitution: 0.9 }),
    // Right
    Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, friction: 0.1, restitution: 0.9 })
  ];
  World.add(world, wallBodies);

  // 3. Collect floating cards and attach Matter.js Bodies
  const cards = Array.from(document.querySelectorAll('.physics-card'));
  cardBodies = [];

  // Calculate random initial dispersion zone
  const paddingX = Math.min(100, width * 0.1);
  const paddingY = 100;
  const availableW = Math.max(300, width - paddingX * 2);
  const availableH = Math.max(300, height - paddingY - 120);

  cards.forEach((cardEl, idx) => {
    // Measure element dimensions
    const rect = cardEl.getBoundingClientRect();
    const cardW = rect.width || 320;
    const cardH = rect.height || 180;

    // Random initial positions spread across canvas
    const startX = paddingX + (Math.random() * (availableW - cardW)) + cardW / 2;
    const startY = paddingY + (Math.random() * (availableH - cardH)) + cardH / 2;

    // Create rigid box body
    const body = Bodies.rectangle(startX, startY, cardW, cardH, {
      frictionAir: 0.015,
      friction: 0.1,
      restitution: 0.82, // Bouncy feel
      chamfer: { radius: 16 }
    });

    // Assign random initial velocity & slow rotation impulse
    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 3.5,
      y: (Math.random() - 0.5) * 3.5
    });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.04);

    // Link DOM element to Body object
    body.domElement = cardEl;
    cardEl.matterBody = body;
    cardBodies.push(body);
    World.add(world, body);
  });

  // 4. Create Mouse Constraint for dragging cards seamlessly
  const mouse = Mouse.create(container);
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.15,
      damping: 0.1,
      render: { visible: false }
    }
  });
  World.add(world, mouseConstraint);

  // Allow touch scrolling when not dragging a card
  mouseConstraint.mouse.element.removeEventListener("mousewheel", mouseConstraint.mouse.mousewheel);
  mouseConstraint.mouse.element.removeEventListener("DOMMouseScroll", mouseConstraint.mouse.mousewheel);

  // 5. Physics Update Loop using requestAnimationFrame
  let lastTime = performance.now();
  function updatePhysics(time) {
    const delta = Math.min((time - lastTime) / 1000, 0.033);
    lastTime = time;

    if (!isGridMode) {
      Engine.update(engine, delta * 1000);

      // Sync DOM positions & rotations with Matter bodies
      cardBodies.forEach(body => {
        if (body && body.domElement) {
          const { x, y } = body.position;
          const angle = body.angle;
          const rect = body.domElement.getBoundingClientRect();
          const halfW = rect.width / 2;
          const halfH = rect.height / 2;

          // Gentle zero-gravity drift impulse if speed is very low
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

// Window Resize Handler to keep wall boundaries aligned
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

// Toggle between Zero-Gravity Mode & Grid Mode
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

    btnZeroG.classList.remove('bg-blue-600', 'text-white');
    btnZeroG.classList.add('text-slate-300', 'hover:text-white');
    btnGrid.classList.add('bg-blue-600', 'text-white');
    btnGrid.classList.remove('text-slate-300');
    shakeBtn.classList.add('hidden');
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

    // Re-trigger random gentle impulse
    shakeCards();

    btnGrid.classList.remove('bg-blue-600', 'text-white');
    btnGrid.classList.add('text-slate-300', 'hover:text-white');
    btnZeroG.classList.add('bg-blue-600', 'text-white');
    btnZeroG.classList.remove('text-slate-300');
    shakeBtn.classList.remove('hidden');
  }
}

// Shake / Scatter Cards impulse
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

// Open Detailed Modal when clicking a card
function openCardModal(cardId) {
  const data = CARD_DATA[cardId];
  if (!data) return;

  const modal = document.getElementById('card-modal');
  const contentContainer = document.getElementById('modal-content');

  // Build features HTML list
  const featuresHtml = data.features.map(item => `
    <li class="flex items-start gap-2.5 text-slate-700">
      <span class="text-blue-600 font-bold mt-0.5">✓</span>
      <span>${item}</span>
    </li>
  `).join('');

  // Encoded WA Link
  const waUrl = `https://wa.me/593999999999?text=${encodeURIComponent(data.waMessage)}`;

  contentContainer.innerHTML = `
    <div class="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shadow-sm border border-blue-100">
          ${data.icon}
        </div>
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">${data.category}</span>
          <h3 class="text-xl font-bold text-slate-900 mt-1">${data.title}</h3>
        </div>
      </div>
      ${data.price ? `<div class="text-right">
        <span class="block text-2xl font-extrabold text-slate-900">${data.price}</span>
        <span class="text-xs text-slate-500">Precio transparente</span>
      </div>` : ''}
    </div>

    <p class="text-slate-600 mb-6 leading-relaxed">${data.description}</p>

    <div class="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-6">
      <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detalles y Beneficios</h4>
      <ul class="space-y-2 text-sm">
        ${featuresHtml}
      </ul>
    </div>

    <div class="flex items-center justify-end gap-3 pt-2">
      <button onclick="closeModal('card-modal')" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition">
        Cerrar
      </button>
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition">
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

// Open Admin Drawer Modal
function openAdminModal() {
  const modal = document.getElementById('admin-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// Close Modal Utility
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Event Listeners Setup
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Matter.js zero gravity physics after rendering
  setTimeout(initPhysics, 100);

  // Card click detection (distinguish between click and drag)
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
      // If click without substantial drag, open detail modal
      if (!isDragging) {
        const cardId = card.getAttribute('data-card-id');
        if (cardId) openCardModal(cardId);
      }
    });
  });

  // Admin form submission simulation
  const adminForm = document.getElementById('admin-form');
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const statusAlert = document.getElementById('admin-status');
      statusAlert.classList.remove('hidden');
      setTimeout(() => {
        statusAlert.classList.add('hidden');
        closeModal('admin-modal');
      }, 1500);
    });
  }
});
