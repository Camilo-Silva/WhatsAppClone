# Configuración de Supabase para Clon de WhatsApp

## Prerequisitos

- Cuenta en [Supabase](https://supabase.com)
- Proyecto Angular ya configurado

## 1. Configuración del Proyecto Supabase

### Crear Nuevo Proyecto
1. Acceder a [Supabase Dashboard](https://app.supabase.com)
2. Hacer clic en "New Project"
3. Llenar los datos:
   - **Name**: `whatsapp-clone` (o el nombre que prefieras)
   - **Database Password**: Generar una contraseña segura
   - **Region**: Seleccionar la más cercana a tu ubicación

### Obtener Credenciales
Una vez creado el proyecto, ir a **Settings → API** y copiar:
- **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
- **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 2. Configuración de Base de Datos

### Crear Tabla `messages`
En el **SQL Editor** de Supabase, ejecutar:

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

-- Política para permitir lectura a todos los usuarios autenticados
CREATE POLICY "Enable read access for all users" ON messages
  FOR SELECT USING (true);

-- Política para permitir inserción a todos los usuarios autenticados
CREATE POLICY "Enable insert for all users" ON messages
  FOR INSERT WITH CHECK (true);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### Crear Tabla `contacts` (Opcional)
Para gestión de contactos más avanzada:

```sql
-- Crear tabla para contactos/usuarios
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'online',
  last_message TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Políticas similares
CREATE POLICY "Enable read access for contacts" ON contacts
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for contacts" ON contacts
  FOR INSERT WITH CHECK (true);

-- Datos de ejemplo
INSERT INTO contacts (uid, name, status, last_message) VALUES
  ('user1', 'Ana García', 'online', 'Hola, ¿cómo estás?'),
  ('user2', 'Carlos López', 'visto hace 5 min', 'Nos vemos mañana'),
  ('user3', 'María Rodríguez', 'online', 'Perfecto, gracias');
```

## 3. Configuración en Angular

### Instalar Cliente Supabase
```bash
npm install @supabase/supabase-js
```

### Configuración en `app.component.ts`
```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Reemplazar con tus credenciales reales
const supabaseUrl = 'https://xxxxxxxxxxxxx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export class AppComponent {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initializeApp();
  }

  async initializeApp() {
    // Simular autenticación con un ID fijo
    this.currentUserId.set('user1'); // Cambiar por user2, user3, etc. para testing
    this.isAuthReady.set(true);
    this.viewMode.set('chatList');
  }
}
```

## 4. Implementación de Funciones Core

### Cargar Mensajes con Realtime
```typescript
loadMessages() {
  // Cargar mensajes existentes
  this.supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true })
    .then(({ data, error }) => {
      if (data) {
        this.messages.set(data);
      }
    });

  // Suscribirse a cambios en tiempo real
  this.supabase
    .channel('messages')
    .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          this.messages.update(messages => [...messages, newMessage]);
        }
    )
    .subscribe();
}
```

### Enviar Mensaje
```typescript
async sendMessage() {
  const messageText = this.inputMessage().trim();
  const userId = this.currentUserId();
  
  if (!messageText || !userId) return;

  const { error } = await this.supabase
    .from('messages')
    .insert({
      sender_uid: userId,
      text: messageText
    });

  if (!error) {
    this.inputMessage.set('');
  }
}
```

## 5. Testing Multiusuario

### Configuración para Testing
1. **Tab 1**: Usar `currentUserId = 'user1'`
2. **Tab 2**: Usar `currentUserId = 'user2'`
3. **Tab 3**: Usar `currentUserId = 'user3'`

### Verificar Funcionalidad
- Enviar mensaje desde Tab 1
- Verificar que aparezca automáticamente en Tab 2 y Tab 3
- Los mensajes deben alinearse correctamente según el remitente

## 6. Variables de Entorno (Producción)

Para producción, crear `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Y en el código:
```typescript
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;
```

## 7. Troubleshooting Común

### Mensajes no aparecen en tiempo real
- Verificar que la tabla tenga `ALTER PUBLICATION supabase_realtime ADD TABLE messages;`
- Confirmar que la suscripción esté activa
- Revisar la consola del navegador por errores

### Error de autenticación
- Para este proyecto usamos autenticación simulada
- El `currentUserId` debe ser consistente entre tabs para el mismo usuario

### Performance
- La tabla `messages` crecerá indefinidamente
- Para producción, implementar paginación o limpieza automática

---

**Importante**: Este setup está optimizado para desarrollo y demo. Para producción, implementar autenticación real de Supabase y políticas de seguridad más estrictas.