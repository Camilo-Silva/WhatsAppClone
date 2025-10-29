# 💬 WhatsApp Clone - Angular + Supabase

Un clon completamente funcional de WhatsApp desarrollado con **Angular 18+** y **Supabase** que incluye mensajería en tiempo real, cambio de usuarios y todas las características visuales auténticas de WhatsApp.

![WhatsApp Clone](https://img.shields.io/badge/Angular-18+-red?style=for-the-badge&logo=angular)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green?style=for-the-badge&logo=supabase)
![Mobile First](https://img.shields.io/badge/Design-Mobile%20First-blue?style=for-the-badge&logo=responsive)

## ✨ Características Principales

### 💬 **Mensajería en Tiempo Real**
- Mensajes instantáneos con Supabase Realtime
- Sincronización automática entre dispositivos
- Base de datos PostgreSQL robusta

### 👥 **Gestión de Usuarios**
- Cambio dinámico entre usuarios (Ana García/Carlos López)
- Iconos camuflados: 📹 Videollamada / 📞 Llamada
- Sistema de identificación simple pero efectivo

### ✓✓ **Estados de Mensaje Auténticos**
- **✓** Una tilde gris (enviado)
- **✓✓** Dos tildes grises (entregado)  
- **✓✓** Dos tildes azules (leído)
- Evolución temporal realista de estados

### 📱 **Diseño Mobile First**
- Interfaz idéntica a WhatsApp original
- Totalmente responsive (móvil/tablet/desktop)
- Paleta de colores oficial de WhatsApp
- Header y input fijos con scroll optimizado

### 🛠️ **Funcionalidades Avanzadas**
- **🗑️ Eliminar conversación completa** con menú desplegable
- **📜 Auto-scroll inteligente** al enviar/recibir mensajes
- **⏰ Formateo de tiempo real** (HH:MM)
- **🔄 Actualizaciones en tiempo real** vía WebSockets

## 🚀 Quick Start (15 minutos)

### 1️⃣ **Clonar el Repositorio**
```bash
git clone https://github.com/Camilo-Silva/WhatsAppClone.git
cd WhatsAppClone
npm install
```

### 2️⃣ **Configurar Supabase**
1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **SQL Editor** y ejecuta:

```sql
-- Crear tabla de mensajes
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  sender_uid TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Políticas de seguridad
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete messages" ON messages FOR DELETE USING (true);
```

### 3️⃣ **Actualizar Credenciales**
Edita `src/app/app.ts` y actualiza:
```typescript
const supabaseUrl = 'TU_SUPABASE_URL';
const supabaseKey = 'TU_SUPABASE_ANON_KEY';
```

### 4️⃣ **Ejecutar la Aplicación**
```bash
# Desarrollo local
ng serve

# Para probar en móvil (acceso desde red)
ng serve --host 0.0.0.0
```

¡Listo! 🎉 Abre http://localhost:4200 o http://TU_IP:4200 desde móvil.

## 🛠️ Stack Tecnológico

| Tecnología | Propósito | Versión |
|------------|-----------|---------|
| **Angular** | Framework frontend | 18+ |
| **TypeScript** | Lenguaje tipado | 5+ |
| **Tailwind CSS** | Estilos utilitarios | 3+ |
| **Supabase** | Backend + Realtime | Latest |
| **PostgreSQL** | Base de datos | 15+ |

## 📱 Demo en Vivo

### **Funcionalidades Interactivas:**
1. **👥 Cambio de Usuario**: Haz clic en 📹 o 📞 en el header
2. **💬 Envío de Mensajes**: Escribe y presiona Enter o clic en "Enviar"
3. **✓✓ Estados de Mensaje**: Observa la evolución de tildes
4. **🗑️ Eliminar Conversación**: Menú de 3 puntos → Eliminar
5. **📱 Responsive**: Prueba en diferentes tamaños de pantalla

### **Testing Multiusuario:**
- Abre múltiples tabs/dispositivos
- Cambia entre usuarios con los iconos
- Los mensajes aparecen instantáneamente

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

### 💡 **¿Te gustó el proyecto?**

⭐ **¡Dale una estrella al repo!** ⭐

🔧 **Creado por:** [Camilo Silva](https://github.com/Camilo-Silva)
