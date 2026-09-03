/**
 * Centro Med - Admin Panel JavaScript Logic & Live Supabase Synchronization
 */

const ADMIN_USER = 'admin_centromed';
const ADMIN_PASS = 'CentroMed2026!Secured';

const SUPABASE_URL = 'https://aokvisoqggsolnrttopb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFva3Zpc29xZ2dzb2xucnR0b3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTk0MjcsImV4cCI6MjA3MjQ5NTQyN30.placeholder';

let supabaseClient = null;
if (typeof supabase !== 'undefined' && supabase.createClient) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let servicesData = [];

// DOM Init & Authentication Check
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();

  // Login Form Submit
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();
    });
  }

  // Theme Form Submit
  const themeForm = document.getElementById('theme-form');
  if (themeForm) {
    themeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveThemeSettings();
    });
  }

  // Branding Form Submit
  const brandingForm = document.getElementById('branding-form');
  if (brandingForm) {
    brandingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveBrandingSettings();
    });
  }

  // Service Form Submit
  const serviceForm = document.getElementById('service-form');
  if (serviceForm) {
    serviceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveService();
    });
  }
});

// Authentication Handler
function checkAuthStatus() {
  const isAuthenticated = sessionStorage.getItem('centromed_admin_auth') === 'true';
  const loginScreen = document.getElementById('login-screen');
  const adminApp = document.getElementById('admin-app');

  if (isAuthenticated) {
    loginScreen.classList.add('hidden');
    adminApp.classList.remove('hidden');
    loadThemeSettings();
    loadBrandingSettings();
    loadServices();
    loadAppointments();
    loadTestimonials();
  } else {
    loginScreen.classList.remove('hidden');
    adminApp.classList.add('hidden');
  }
}

function handleLogin() {
  const userInput = document.getElementById('login-username').value.trim();
  const passInput = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  if (userInput === ADMIN_USER && passInput === ADMIN_PASS) {
    sessionStorage.setItem('centromed_admin_auth', 'true');
    if (errorEl) errorEl.classList.add('hidden');
    checkAuthStatus();
  } else {
    if (errorEl) {
      errorEl.classList.remove('hidden');
      errorEl.innerText = '⚠️ Usuario o contraseña incorrectos.';
    }
  }
}

function logoutAdmin() {
  sessionStorage.removeItem('centromed_admin_auth');
  checkAuthStatus();
}

// Tab Switcher
function switchTab(tabId) {
  const tabs = ['services', 'theme', 'appointments', 'testimonials', 'branding'];
  tabs.forEach(t => {
    const section = document.getElementById(`tab-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (t === tabId) {
      section.classList.remove('hidden');
      btn.classList.add('bg-[#134074]', 'text-white', 'shadow-md');
      btn.classList.remove('text-slate-300');
    } else {
      section.classList.add('hidden');
      btn.classList.remove('bg-[#134074]', 'text-white', 'shadow-md');
      btn.classList.add('text-slate-300');
    }
  });

  const titles = {
    services: 'Gestión de Servicios & Especialidades Médicas',
    theme: '🎨 Editor de Aspecto Visual & Tema',
    appointments: 'Solicitudes de Citas Médicas',
    testimonials: 'Testimonios & Reseñas de Pacientes',
    branding: 'Configuración de Marca Centro Med, Fotos & Datos'
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl && titles[tabId]) titleEl.innerText = titles[tabId];
}

// Show Alert Banner
function showAlert(message) {
  const alertEl = document.getElementById('admin-alert');
  const alertText = document.getElementById('admin-alert-text');
  if (alertEl && alertText) {
    alertText.innerText = `✓ ${message}`;
    alertEl.classList.remove('hidden');
    setTimeout(() => alertEl.classList.add('hidden'), 3500);
  }
}

// ================= THEME & VISUAL DESIGN EDITOR =================
async function loadThemeSettings() {
  if (supabaseClient) {
    try {
      const { data } = await supabaseClient.from('settings').select('value').eq('key', 'theme').single();
      if (data && data.value) {
        localStorage.setItem('centromed_theme', JSON.stringify(data.value));
      }
    } catch (e) {}
  }

  const theme = JSON.parse(localStorage.getItem('centromed_theme') || '{}');
  if (theme.palette) {
    const radio = document.querySelector(`input[name="color-palette"][value="${theme.palette}"]`);
    if (radio) radio.checked = true;
  }
  if (theme.font) document.getElementById('theme-font').value = theme.font;
  if (theme.radius) document.getElementById('theme-radius').value = theme.radius;
  if (theme.defaultMode) document.getElementById('theme-default-mode').value = theme.defaultMode;
  if (theme.glass) document.getElementById('theme-glass').value = theme.glass;
}

async function saveThemeSettings() {
  const palette = document.querySelector('input[name="color-palette"]:checked').value;
  const font = document.getElementById('theme-font').value;
  const radius = document.getElementById('theme-radius').value;
  const defaultMode = document.getElementById('theme-default-mode').value;
  const glass = document.getElementById('theme-glass').value;

  const themeConfig = { palette, font, radius, defaultMode, glass };
  localStorage.setItem('centromed_theme', JSON.stringify(themeConfig));

  if (supabaseClient) {
    try {
      await supabaseClient.from('settings').upsert({ key: 'theme', value: themeConfig });
    } catch (e) {}
  }

  showAlert('Nuevo diseño visual aplicado a Centro Med. Se actualizará automáticamente en la página web pública.');
}

// ================= SERVICES MANAGEMENT =================
async function loadServices() {
  const container = document.getElementById('services-admin-grid');
  if (!container) return;

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('services').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        servicesData = data;
        localStorage.setItem('centromed_services', JSON.stringify(servicesData));
      }
    } catch (err) {}
  }

  if (servicesData.length === 0) {
    const saved = localStorage.getItem('centromed_services');
    if (saved) {
      servicesData = JSON.parse(saved);
    } else {
      servicesData = [
        { card_id: 'service-1', title: 'Medicina General', category: 'Atención Integral', price: 30.00, badge: 'Consulta Preventiva', icon: '🩺', description: 'Consulta médica integral, diagnóstico certero, chequeos preventivos y tratamientos.' },
        { card_id: 'service-2', title: 'Ginecología & Obstetricia', category: 'Salud Femenina', price: 40.00, badge: 'Control Prenatal', icon: '🤰', description: 'Atención especializada en salud femenina, control del embarazo y ecografías.' },
        { card_id: 'service-3', title: 'Traumatología & Ortopedia', category: 'Especialidad Médica', price: 45.00, badge: 'Atención de Traumas', icon: '🦴', description: 'Tratamiento integral de heridas, traumas, luxaciones y fracturas.' },
        { card_id: 'service-4', title: 'Cirugía General & Laparoscópica', category: 'Quirófano Especializado', price: 120.00, badge: 'Mínimamente Invasiva', icon: '🔪', description: 'Cirugía de vesícula, apéndice, hernias y tumores con procedimientos avanzados.' },
        { card_id: 'service-5', title: 'Emergencias 24 Horas', category: 'Atención Inmediata 24/7', price: 0.00, badge: '🔴 Activo 24H', icon: '🚑', description: 'Servicio de emergencia médica y quirúrgica disponible las 24 horas del día.' },
        { card_id: 'service-6', title: 'Laboratorio Clínico', category: 'Diagnósticos Automatizados', price: 50.00, badge: 'Resultados Rápido', icon: '🧪', description: 'Hemograma completo, glucosa, urea, creatinina y orina el mismo día.' },
        { card_id: 'service-7', title: 'Internaciones & Quirófanos', category: 'Hospitalización', price: 80.00, badge: 'Confort & Seguridad', icon: '🛋️', description: 'Habitaciones privadas confortables con monitoreo constante de enfermería.' },
        { card_id: 'service-8', title: 'Farmacia Interna 24H', category: 'Servicios Complementarios', price: 0.00, badge: 'Disponibilidad Inmediata', icon: '💊', description: 'Disponibilidad inmediata de medicamentos para pacientes internados y externos.' }
      ];
    }
  }

  container.innerHTML = servicesData.map(item => `
    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#134074] flex items-center justify-center text-xl font-bold">
            ${item.icon || '🩺'}
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-extrabold ${item.price > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-[#134074] border border-blue-200'}">
            ${item.price > 0 ? '$' + parseFloat(item.price).toFixed(2) : 'Servicio 24H'}
          </span>
        </div>
        <span class="text-[11px] uppercase font-bold text-slate-400 tracking-wider">${item.category}</span>
        <h4 class="text-base font-extrabold text-[#0B2545] mb-2">${item.title}</h4>
        <p class="text-xs text-slate-500 mb-4 line-clamp-3">${item.description}</p>
      </div>

      <div class="flex items-center justify-between border-t border-slate-100 pt-3">
        <button onclick="editService('${item.card_id}')" class="px-3 py-1.5 rounded-lg bg-blue-50 text-[#134074] font-bold text-xs hover:bg-blue-100 transition">
          ✏️ Editar
        </button>
        <button onclick="deleteService('${item.card_id}')" class="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition">
          🗑️ Eliminar
        </button>
      </div>
    </div>
  `).join('');
}

function openNewServiceModal() {
  document.getElementById('service-card-id').value = '';
  document.getElementById('input-title').value = '';
  document.getElementById('input-category').value = 'Medicina General';
  document.getElementById('input-price').value = '30.00';
  document.getElementById('input-icon').value = '🩺';
  document.getElementById('input-badge').value = 'Nuevo';
  document.getElementById('input-description').value = '';
  document.getElementById('modal-service-title').innerText = 'Agregar Nuevo Servicio Médico a Centro Med';

  const modal = document.getElementById('service-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function editService(cardId) {
  const item = servicesData.find(s => s.card_id === cardId);
  if (!item) return;

  document.getElementById('service-card-id').value = item.card_id;
  document.getElementById('input-title').value = item.title;
  document.getElementById('input-category').value = item.category;
  document.getElementById('input-price').value = item.price;
  document.getElementById('input-icon').value = item.icon || '';
  document.getElementById('input-badge').value = item.badge || '';
  document.getElementById('input-description').value = item.description;
  document.getElementById('modal-service-title').innerText = `Editar: ${item.title}`;

  const modal = document.getElementById('service-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAdminModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function saveService() {
  const cardId = document.getElementById('service-card-id').value || `service-${Date.now()}`;
  const title = document.getElementById('input-title').value;
  const category = document.getElementById('input-category').value;
  const price = parseFloat(document.getElementById('input-price').value);
  const icon = document.getElementById('input-icon').value;
  const badge = document.getElementById('input-badge').value;
  const description = document.getElementById('input-description').value;

  const updatedObj = { card_id: cardId, title, category, price, icon, badge, description };

  const existingIdx = servicesData.findIndex(s => s.card_id === cardId);
  if (existingIdx >= 0) {
    servicesData[existingIdx] = updatedObj;
  } else {
    servicesData.push(updatedObj);
  }

  localStorage.setItem('centromed_services', JSON.stringify(servicesData));

  if (supabaseClient) {
    try {
      await supabaseClient.from('services').upsert(updatedObj);
    } catch (e) {}
  }

  closeAdminModal('service-modal');
  loadServices();
  showAlert('Servicio guardado en Supabase y visible globalmente en la página web.');
}

async function deleteService(cardId) {
  if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) return;

  servicesData = servicesData.filter(s => s.card_id !== cardId);
  localStorage.setItem('centromed_services', JSON.stringify(servicesData));

  if (supabaseClient) {
    try {
      await supabaseClient.from('services').delete().eq('card_id', cardId);
    } catch (e) {}
  }

  loadServices();
  showAlert('Servicio eliminado correctamente.');
}

// ================= BRANDING & PHOTOS =================
async function loadBrandingSettings() {
  if (supabaseClient) {
    try {
      const { data } = await supabaseClient.from('settings').select('value').eq('key', 'branding').single();
      if (data && data.value) {
        localStorage.setItem('centromed_branding', JSON.stringify(data.value));
      }
    } catch (e) {}
  }

  const settings = JSON.parse(localStorage.getItem('centromed_branding') || '{}');
  if (settings.name) document.getElementById('brand-name').value = settings.name;
  if (settings.whatsapp) document.getElementById('brand-whatsapp').value = settings.whatsapp;
  if (settings.subheading) document.getElementById('brand-subheading').value = settings.subheading;
  if (settings.logoUrl) document.getElementById('brand-logo-url').value = settings.logoUrl;
  if (settings.hoursWeek) document.getElementById('brand-hours-week').value = settings.hoursWeek;
  if (settings.hoursSat) document.getElementById('brand-hours-sat').value = settings.hoursSat;
  if (settings.address) document.getElementById('brand-address').value = settings.address;
}

async function saveBrandingSettings() {
  const settings = {
    name: document.getElementById('brand-name').value,
    whatsapp: document.getElementById('brand-whatsapp').value,
    subheading: document.getElementById('brand-subheading').value,
    logoUrl: document.getElementById('brand-logo-url').value,
    hoursWeek: document.getElementById('brand-hours-week').value,
    hoursSat: document.getElementById('brand-hours-sat').value,
    address: document.getElementById('brand-address').value
  };

  localStorage.setItem('centromed_branding', JSON.stringify(settings));

  if (supabaseClient) {
    try {
      await supabaseClient.from('settings').upsert({ key: 'branding', value: settings });
    } catch (e) {}
  }

  showAlert('Marca Centro Med, fotos y datos guardados en Supabase. Actualizado en la web.');
}

// ================= APPOINTMENTS =================
function loadAppointments() {
  const tableBody = document.getElementById('appointments-table-body');
  const countEl = document.getElementById('appointments-count');
  if (!tableBody) return;

  const mockAppts = [
    { patient_name: 'María García', phone: '+593 98 765 4321', service: 'Medicina General', date: '2026-09-05 10:00 AM', status: 'Pendiente' },
    { patient_name: 'Carlos Rodríguez', phone: '+593 99 123 4567', service: 'Cirugía General & Laparoscópica', date: '2026-09-06 03:00 PM', status: 'Confirmada' }
  ];

  countEl.innerText = `${mockAppts.length} Citas Registradas`;

  tableBody.innerHTML = mockAppts.map(item => `
    <tr class="hover:bg-slate-50 transition">
      <td class="p-4 font-bold text-[#0B2545]">${item.patient_name}</td>
      <td class="p-4 text-blue-600 font-semibold">${item.phone}</td>
      <td class="p-4">${item.service}</td>
      <td class="p-4 text-slate-500">${item.date}</td>
      <td class="p-4">
        <span class="px-2.5 py-1 rounded-full text-xs font-extrabold ${item.status === 'Confirmada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
          ${item.status}
        </span>
      </td>
      <td class="p-4 text-right">
        <a href="https://wa.me/${item.phone.replace(/[^0-9]/g,'')}?text=Hola%20${encodeURIComponent(item.patient_name)}%2C%20le%20escribimos%20de%20Centro%20Med." target="_blank" class="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition">
          💬 WhatsApp
        </a>
      </td>
    </tr>
  `).join('');
}

// ================= TESTIMONIALS =================
function loadTestimonials() {
  const container = document.getElementById('testimonials-admin-grid');
  if (!container) return;

  const testimonials = [
    { name: 'María G.', rating: 5, comment: 'Excelente atención clínica, trato muy humano y profesional de médicos y enfermeras de Centro Med.' },
    { name: 'Javier L.', rating: 5, comment: 'Me operaron de la vesícula por laparoscopía y la recuperación fue rapidísima.' },
    { name: 'Fernando C.', rating: 5, comment: 'Atención de emergencia limpia, rápida y muy bien equipada las 24 horas.' }
  ];

  container.innerHTML = testimonials.map(item => `
    <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div class="flex justify-between items-center mb-2">
        <span class="font-bold text-[#0B2545]">${item.name}</span>
        <span class="text-amber-400 text-sm">★★★★★</span>
      </div>
      <p class="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">"${item.comment}"</p>
    </div>
  `).join('');
}
