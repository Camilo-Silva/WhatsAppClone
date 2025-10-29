# 🚀 Inicio Rápido - Clon de WhatsApp

## Pasos para Empezar (15 minutos)

### 1. Setup de Supabase Cloud ⚡

#### Crear Proyecto
1. Ir a **[Supabase.com](https://supabase.com)** y crear cuenta
2. Hacer clic en **"New Project"**
3. Llenar datos:
   - **Name**: `whatsapp-clone`
   - **Password**: Generar una segura
   - **Region**: Elegir la más cercana

#### Obtener Credenciales
1. Una vez creado, ir a **Settings → API**
2. Copiar:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiI...`

### 2. Configurar Base de Datos 📊

#### Ejecutar SQL
1. Ir a **SQL Editor** en Supabase
2. Copiar y ejecutar este código:

```sql
-- Crear tabla para mensajes
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  sender_uid TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a todos
CREATE POLICY "Enable read access for all users" ON messages
  FOR SELECT USING (true);

-- Permitir inserción a todos
CREATE POLICY "Enable insert for all users" ON messages
  FOR INSERT WITH CHECK (true);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Datos de ejemplo para testing
INSERT INTO messages (sender_uid, text) VALUES
  ('user1', '¡Hola! Soy el primer usuario 👋'),
  ('user2', 'Perfecto, el chat funciona! 🎉'),
  ('user1', 'Excelente, vamos a probarlo 🚀');
```

### 3. Setup de Angular 🅰️

#### Crear Proyecto (si no existe)
```bash
ng new whatsapp-clone --routing=false --style=css --standalone
cd whatsapp-clone
```

#### Instalar Dependencias
```bash
npm install @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

#### Configurar Tailwind CSS
Editar `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'whatsapp': {
          'green': '#075e54',
          'light-green': '#25d366',
          'bubble-out': '#d9fdd3',
          'bubble-in': '#f0f0f0'
        }
      }
    },
  },
  plugins: [],
}
```

Editar `src/styles.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Configuración Inicial del Componente 🔧

Crear/editar `src/app/app.component.ts` con la base:

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 🔥 TUS CREDENCIALES DE SUPABASE
const supabaseUrl = 'https://ghxypafsrucebtikvttt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoeHlwYWZzcnVjZWJ0aWt2dHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NzEzNDQsImV4cCI6MjA3NzM0NzM0NH0.UTzO-vmnU15_F9jFAHmnryGxard6t2K2a7F8rKN_YCI';

interface Message {
  id: number;
  sender_uid: string;
  text: string;
  created_at: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-screen bg-gray-100">
      @if (isAuthReady()) {
        <div class="h-full max-w-md mx-auto bg-white shadow-lg">
          <!-- Header -->
          <div class="bg-whatsapp-green text-white p-4">
            <h1 class="text-lg font-semibold">WhatsApp Clone</h1>
            <p class="text-xs opacity-75">User ID: {{currentUserId()}}</p>
          </div>
          
          <!-- Messages Area -->
          <div class="h-96 overflow-y-auto p-4 space-y-2">
            @for (message of messages(); track message.id) {
              <div class="flex" 
                   [class.justify-end]="message.sender_uid === currentUserId()">
                <div class="max-w-xs px-4 py-2 rounded-lg"
                     [class.bg-whatsapp-bubble-out]="message.sender_uid === currentUserId()"
                     [class.bg-whatsapp-bubble-in]="message.sender_uid !== currentUserId()">
                  <p class="text-sm">{{message.text}}</p>
                  <p class="text-xs opacity-50 mt-1">
                    {{message.sender_uid}} - {{formatTime(message.created_at)}}
                  </p>
                </div>
              </div>
            }
          </div>
          
          <!-- Input Area -->
          <div class="p-4 border-t flex gap-2">
            <input 
              type="text" 
              [(ngModel)]="inputMessage"
              (keyup.enter)="sendMessage()"
              placeholder="Escribe un mensaje..."
              class="flex-1 p-2 border rounded-lg">
            <button 
              (click)="sendMessage()"
              class="bg-whatsapp-green text-white px-4 py-2 rounded-lg">
              Enviar
            </button>
          </div>
        </div>
      } @else {
        <div class="h-full flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin w-8 h-8 border-4 border-whatsapp-green border-t-transparent rounded-full mx-auto"></div>
            <p class="mt-2 text-gray-600">Conectando...</p>
          </div>
        </div>
      }
    </div>
  `
})
export class AppComponent {
  private supabase: SupabaseClient;
  
  // Signals para el estado
  isAuthReady = signal<boolean>(false);
  currentUserId = signal<string>('user1'); // Cambiar a user2, user3 para testing
  messages = signal<Message[]>([]);
  inputMessage = signal<string>('');

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initializeApp();
  }

  async initializeApp() {
    // Simular carga inicial
    setTimeout(() => {
      this.isAuthReady.set(true);
      this.loadMessages();
    }, 1000);
  }

  loadMessages() {
    // TODO: Implementar carga de mensajes desde Supabase
    console.log('Cargando mensajes...');
  }

  sendMessage() {
    // TODO: Implementar envío de mensajes a Supabase
    console.log('Enviando mensaje:', this.inputMessage());
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString();
  }
}
```

### 5. Testing Inicial 🧪

#### Ejecutar la Aplicación
```bash
ng serve
```

#### Verificar
1. **Abrir** `http://localhost:4200`
2. **Verificar** que aparece la interfaz básica
3. **Cambiar** `currentUserId` a `'user2'` y recargar
4. **Abrir** otra tab con `'user1'` para testing multiusuario

### 6. Próximos Pasos 🎯

Una vez que tengas la base funcionando:
1. **Implementar** `loadMessages()` con Supabase
2. **Implementar** `sendMessage()` con Supabase  
3. **Agregar** suscripción Realtime
4. **Mejorar** la UI/UX

---

## 🆘 Troubleshooting Rápido

- **Error de CORS**: Verificar que las credenciales de Supabase sean correctas
- **No aparecen mensajes**: Verificar que la tabla `messages` exista en Supabase
- **Estilos rotos**: Verificar que Tailwind esté configurado correctamente

## 📚 Referencias

- **Documentación completa**: Ver `SUPABASE_SETUP.md`
- **Instrucciones de desarrollo**: Ver `.github/copilot-instructions.md`
- **Setup local (avanzado)**: Ver `LOCAL_DEVELOPMENT.md`