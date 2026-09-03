# 🏥 Centro Med - Sitio Web Interactivo & Antigravedad

Página web médica profesional, responsive e interactiva para el consultorio **Centro Med**, desarrollada con la tecnología de **Google Anti-Gravity** (Matter.js 2D Physics Engine), Tailwind CSS y backend integrado con Supabase.

![Centro Med Banner](https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Características Principales

- **🌌 Modo Gravedad 0 (Physics Mode)**: Todas las tarjetas clínicas (servicios, precios, testimonios, ubicación GPS y contacto) flotan suavemente por la pantalla respondiendo a la física de colisiones, arrastre y lanzamiento por gestos táctiles o mouse.
- **📐 Modo Cuadrícula (Static Grid)**: Alternador flotante en tiempo real para organizar los módulos en una cuadrícula estática impecable.
- **💬 Reserva Directa por WhatsApp**: Enlaces directos pre-configurados para agendar citas de forma instantánea.
- **⚡ Integración Backend con Supabase**: Base de datos en tiempo real PostgreSQL con Row Level Security (RLS) habilitado para servicios, citas médicas, testimonios y mensajes de contacto.
- **📱 Design Responsive**: Optimizado para dispositivos móviles, tablets y monitores de escritorio.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5 & CSS3**: Estructura semántica y diseño con glassmorphic UI.
- **Tailwind CSS**: Estilos modernos y paleta de colores médicos (`#0A2540`, `#0066FF`, `#F8FAFC`, `#25D366`).
- **Matter.js**: Motor de física 2D para gravedad cero, colisiones y sincronización de transformaciones CSS.
- **Supabase**: Base de datos PostgreSQL alojada en la nube con RLS.

---

## 📂 Estructura del Proyecto

```text
Proyecto/
├── index.html        # Estructura principal HTML5 y modales
├── styles.css        # Estilos personalizados, glassmorphism y animación
├── app.js            # Lógica de física Matter.js, sincronización DOM y eventos
├── server.ps1        # Servidor web local nativo en PowerShell
└── README.md         # Documentación oficial
```

---

## 🌐 Despliegue en GitHub Pages / Cloudflare Pages

1. Sube este repositorio a GitHub.
2. Ve a **Settings > Pages** en tu repositorio de GitHub.
3. En **Source**, selecciona `Deploy from a branch` y elige la rama `main`.
4. Conecta tu dominio personalizado desde **Cloudflare DNS** agregando los registros `CNAME` o `A`.
