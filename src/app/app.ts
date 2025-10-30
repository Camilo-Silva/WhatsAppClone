import { Component, signal, effect } from '@angular/core';
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
  status?: 'sent' | 'delivered' | 'read'; // Estado del mensaje
}

interface User {
  id: string;
  name: string;
  avatar?: string;
}

// 👥 Usuarios principales para testing (solo 2 visibles en UI)
const USERS: User[] = [
  { id: 'user1', name: 'Veronica' },      // 📹 Videollamada
  { id: 'user2', name: 'Camila' },    // 📞 Llamada
  { id: 'user3', name: 'María Rodríguez' }, // Oculto (opcional)
  { id: 'user4', name: 'Pedro Martínez' }   // Oculto (opcional)
];

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-100 overflow-hidden"
         style="height: 100vh; height: 100dvh; -webkit-overflow-scrolling: touch;">
      @if (isAuthReady()) {
        <div class="h-full max-w-md mx-auto bg-white shadow-lg flex flex-col relative overflow-hidden">
          <!-- Header Fijo -->
          <div class="bg-whatsapp-green text-white p-4 sticky top-0 z-10">
            <div class="flex justify-between items-center">
              <div>
                <h1 class="text-lg font-semibold">VistoApp</h1>
                <p class="text-xs opacity-75">{{getUserName(currentUserId())}}</p>
                <!-- <p class="text-xs opacity-50">({{currentUserId()}})</p> -->
              </div>

              <!-- Iconos de WhatsApp (ocultan cambio de usuario) -->
              <div class="flex gap-3">
                <!-- Videollamada = Ana García (user1) -->
                <button
                  (click)="switchUser('user1')"
                  [class.opacity-100]="currentUserId() === 'user1'"
                  [class.opacity-60]="currentUserId() !== 'user1'"
                  [title]="'Videollamada (' + getUserName('user1') + ')'"
                  class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all">
                  <!-- Icono de videocámara -->
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                </button>

                <!-- Llamada = Carlos López (user2) -->
                <button
                  (click)="switchUser('user2')"
                  [class.opacity-100]="currentUserId() === 'user2'"
                  [class.opacity-60]="currentUserId() !== 'user2'"
                  [title]="'Llamada (' + getUserName('user2') + ')'"
                  class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all">
                  <!-- Icono de teléfono -->
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                </button>

                <!-- Menú de opciones (funcional) -->
                <div class="relative">
                  <button
                    (click)="toggleMenu()"
                    class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all opacity-60">
                    <!-- Icono de menú (3 puntos verticales) -->
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>

                  <!-- Menú desplegable -->
                  @if (showMenu()) {
                    <div class="absolute right-0 top-10 bg-white rounded-lg shadow-lg border py-2 w-48 z-50">
                      <button
                        (click)="clearAllMessages()"
                        class="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 text-sm">
                        🗑️ Eliminar conversación
                      </button>
                      <button
                        (click)="closeMenu()"
                        class="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 text-sm">
                        ❌ Cancelar
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Messages Area -->
          <div id="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-2 min-h-0 pb-6">
            <!-- Debug info -->
            <div class="text-xs text-gray-500 mb-2">
              Total mensajes: {{messages().length}}
            </div>

            @for (message of messages(); track message.id) {
              <div class="flex"
                   [class.justify-end]="message.sender_uid === currentUserId()">
                <div class="max-w-xs px-4 py-2 rounded-lg"
                     [class.bg-whatsapp-bubble-out]="message.sender_uid === currentUserId()"
                     [class.bg-whatsapp-bubble-in]="message.sender_uid !== currentUserId()">
                  <p class="text-sm">{{message.text}}</p>
                  <div class="flex items-center justify-between mt-1">
                    <p class="text-xs opacity-50">
                      {{getUserName(message.sender_uid)}} - {{formatTime(message.created_at)}}
                    </p>
                    <!-- Tildes de estado (solo para mensajes propios) -->
                    @if (message.sender_uid === currentUserId()) {
                      <div class="ml-2 flex items-center">
                        <span [ngClass]="{
                          'text-gray-400': getMessageStatus(message) !== 'read',
                          'text-whatsapp-read-blue': getMessageStatus(message) === 'read'
                        }" class="text-xs font-medium">
                          {{getStatusIcon(message)}}
                        </span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }

            @if (messages().length === 0) {
              <div class="text-center text-gray-500 text-sm">
                No hay mensajes aún. ¡Escribe el primero!
              </div>
            }
          </div>

          <!-- Input Area Fijo -->
          <div class="p-4 border-t flex gap-2 bg-white sticky bottom-0 z-10">
            <input
              type="text"
              [(ngModel)]="inputMessage"
              (keyup.enter)="sendMessage()"
              placeholder="Escribe un mensaje..."
              class="flex-1 p-3 border rounded-lg text-base"
              style="font-size: 16px; /* Evita zoom en iOS */">
            <button
              (click)="sendMessage()"
              class="bg-whatsapp-green text-white px-4 py-3 rounded-lg font-medium min-w-[80px]">
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
export class App {
  private supabase: SupabaseClient;

  // Signals para el estado
  isAuthReady = signal<boolean>(false);
  currentUserId = signal<string>('user1'); // Empezar como Ana García (videollamada activa)
  messages = signal<Message[]>([]);
  inputMessage = signal<string>('');
  showMenu = signal<boolean>(false); // Control del menú desplegable

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initializeApp();
  }

  // 🔽 Scroll automático al final del chat
  scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById('messagesContainer');
      if (container) {
        container.scrollTop = container.scrollHeight;
        console.log('📱 Auto-scroll aplicado');
      }
    }, 100); // Pequeño delay para asegurar que el DOM se actualice
  }

    // Función para alternar el menú
  toggleMenu() {
    this.showMenu.set(!this.showMenu());
  }

  // Función para cerrar el menú
  closeMenu() {
    this.showMenu.set(false);
  }

  // Función para eliminar todos los mensajes de la conversación actual
  async clearAllMessages() {
    if (!this.currentUserId()) {
      return;
    }

    try {
      // Confirmar la acción
      const confirmed = confirm('¿Estás seguro de que quieres eliminar toda la conversación? Esta acción no se puede deshacer.');
      if (!confirmed) {
        this.closeMenu();
        return;
      }

      console.log('🗑️ Intentando eliminar todos los mensajes...');

      // Primero, vamos a obtener todos los mensajes para ver qué hay
      const { data: allMessages, error: fetchError } = await this.supabase
        .from('messages')
        .select('*');

      console.log('📋 Mensajes existentes antes de eliminar:', allMessages);
      console.log('📋 Error al obtener mensajes:', fetchError);

      if (fetchError) {
        console.error('❌ Error al obtener mensajes:', fetchError);
        alert(`Error al acceder a los mensajes: ${fetchError.message}`);
        this.closeMenu();
        return;
      }

      // MÉTODO 1: Intentar eliminación directa
      console.log('🔥 Método 1: Eliminación directa...');
      const { data: deleteData, error: deleteError } = await this.supabase
        .from('messages')
        .delete()
        .neq('id', -1);

      console.log('📊 Resultado de eliminación directa:', { data: deleteData, error: deleteError });

      // Si la eliminación directa falló, usar MÉTODO 2: Eliminación por lotes
      if (deleteError || (deleteData === null && allMessages && allMessages.length > 0)) {
        console.log('🔥 Método 2: Eliminación por lotes...');

        // Obtener todos los IDs de mensajes
        const messageIds = allMessages?.map(msg => msg.id) || [];
        console.log('🆔 IDs de mensajes a eliminar:', messageIds);

        if (messageIds.length > 0) {
          const { data: batchDeleteData, error: batchDeleteError } = await this.supabase
            .from('messages')
            .delete()
            .in('id', messageIds);

          console.log('📊 Resultado de eliminación por lotes:', { data: batchDeleteData, error: batchDeleteError });

          if (batchDeleteError) {
            console.error('❌ Error en eliminación por lotes:', batchDeleteError);
            alert(`Error al eliminar mensajes: ${batchDeleteError.message}\n\nProblema: Las políticas de seguridad de Supabase pueden estar bloqueando la eliminación.`);
            this.closeMenu();
            return;
          }
        }
      }

      // Verificar si realmente se eliminaron
      const { data: remainingMessages } = await this.supabase
        .from('messages')
        .select('*');

      console.log('📋 Mensajes restantes después de eliminar:', remainingMessages);

      if (remainingMessages && remainingMessages.length > 0) {
        alert('⚠️ No se pudieron eliminar los mensajes de la base de datos.\n\nSolución: Ve a Supabase → SQL Editor y ejecuta el archivo FIX_DELETE_POLICY.sql');
      } else {
        console.log('✅ Conversación eliminada exitosamente de la base de datos');
        alert('✅ Conversación eliminada exitosamente');
      }

      // Limpiar mensajes localmente siempre
      this.messages.set([]);

    } catch (error) {
      console.error('💥 Error en clearAllMessages:', error);
      alert('Error al eliminar la conversación');
    }

    this.closeMenu();
  }

  // Función para cambiar de usuario activo
  switchUser(userId: string) {
    const userName = this.getUserName(userId);
    const icon = userId === 'user1' ? '📹 Videollamada' : '📞 Llamada';
    console.log(`${icon}: Cambiando a ${userName} (${userId})`);
    this.currentUserId.set(userId);

    // Simular que el usuario "lee" los mensajes al cambiar
    this.markMessagesAsRead(userId);
  }

  // 👁️ Marcar mensajes como leídos (simulación)
  markMessagesAsRead(readerId: string) {
    // En una implementación real, esto se haría en la base de datos
    // Aquí solo actualizamos el estado local para demo
    setTimeout(() => {
      console.log(`📖 ${this.getUserName(readerId)} ha leído los mensajes`);
      // Trigger re-render para actualizar tildes
      this.messages.update(messages => [...messages]);
    }, 1000);
  }

  // 👤 Obtener nombre del usuario por ID
  getUserName(userId: string): string {
    return USERS.find(user => user.id === userId)?.name || userId;
  }

  // 👤 Obtener usuario actual completo
  getCurrentUser(): User | undefined {
    return USERS.find(user => user.id === this.currentUserId());
  }

  // 👥 Obtener lista de usuarios disponibles
  getAvailableUsers(): User[] {
    return USERS;
  }

  // ✓✓ Obtener estado del mensaje (simulado)
  getMessageStatus(message: Message): 'sent' | 'delivered' | 'read' {
    // Si el mensaje tiene estado explícito, usarlo
    if (message.status) {
      return message.status;
    }

    // Lógica simulada basada en tiempo y usuario
    const messageAge = Date.now() - new Date(message.created_at).getTime();
    const isOwnMessage = message.sender_uid === this.currentUserId();

    if (!isOwnMessage) {
      return 'read'; // Los mensajes de otros siempre aparecen como leídos
    }

    // Simulación realista para mensajes propios
    if (messageAge > 10000) { // Más de 10 segundos = leído
      return 'read';
    } else if (messageAge > 3000) { // Más de 3 segundos = entregado
      return 'delivered';
    } else { // Recién enviado
      return 'sent';
    }
  }

  // ✓ Obtener icono de estado para las tildes
  getStatusIcon(message: Message): string {
    const status = this.getMessageStatus(message);

    switch (status) {
      case 'sent': return '✓';           // Una tilde gris
      case 'delivered': return '✓✓';     // Dos tildes grises
      case 'read': return '✓✓';          // Dos tildes azules (color en CSS)
      default: return '';
    }
  }

  async initializeApp() {
    // Simular carga inicial
    setTimeout(() => {
      this.isAuthReady.set(true);
      this.loadMessages();
    }, 1000);

    // Agregar listener para cerrar menú al hacer clic fuera
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const menuContainer = target.closest('.relative');
      const isMenuButton = target.closest('button')?.getAttribute('(click)') === 'toggleMenu()';

      if (!menuContainer && !isMenuButton && this.showMenu()) {
        this.closeMenu();
      }
    });
  }

  async loadMessages() {
    try {
      console.log('🔄 Intentando cargar mensajes desde Supabase...');

      // Cargar mensajes existentes
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      console.log('📊 Respuesta de Supabase:', { data, error });

      if (error) {
        console.error('❌ Error cargando mensajes:', error);
        return;
      }

      if (data) {
        console.log(`✅ ${data.length} mensajes cargados:`, data);
        this.messages.set(data);
        console.log('🔄 Estado del signal después de cargar:', this.messages());
        this.scrollToBottom(); // 🔽 Scroll after loading messages
      } else {
        console.log('⚠️ No hay datos en la respuesta');
        this.messages.set([]);
      }

      // Suscribirse a cambios en tiempo real
      console.log('🔔 Configurando suscripción Realtime...');
      const channel = this.supabase
        .channel('messages')
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
              console.log('🆕 Nuevo mensaje recibido via Realtime:', payload.new);
              const newMessage = payload.new as Message;
              this.messages.update(messages => [...messages, newMessage]);
              this.scrollToBottom(); // 🔽 Scroll when new message arrives
            }
        )
        .subscribe((status) => {
          console.log('📡 Estado de suscripción Realtime:', status);
        });

    } catch (error) {
      console.error('💥 Error en loadMessages:', error);
    }
  }

  async sendMessage() {
    const messageText = this.inputMessage().trim();
    const userId = this.currentUserId();

    console.log('📝 Intentando enviar mensaje:', { messageText, userId });

    if (!messageText || !userId) {
      console.log('⚠️ Mensaje vacío o usuario no definido');
      return;
    }

    try {
      const messageData = {
        sender_uid: userId,
        text: messageText
      };

      console.log('📤 Datos del mensaje a enviar:', messageData);

      const { data, error } = await this.supabase
        .from('messages')
        .insert(messageData)
        .select(); // Agregar select para obtener el mensaje insertado

      console.log('📊 Respuesta de inserción:', { data, error });

      if (error) {
        console.error('❌ Error enviando mensaje:', error);
        return;
      }

      console.log('✅ Mensaje enviado correctamente:', data);
      this.inputMessage.set('');
      this.scrollToBottom(); // 🔽 Scroll after sending message

      // ✓✓ Simular evolución de estado del mensaje
      this.simulateMessageStatusEvolution();

    } catch (error) {
      console.error('💥 Error en sendMessage:', error);
    }
  }

  // ⏱️ Simular evolución realista de estados de mensaje
  simulateMessageStatusEvolution() {
    // Después de 2 segundos: sent → delivered
    setTimeout(() => {
      console.log('✓✓ Mensaje entregado');
      this.messages.update(messages => [...messages]); // Trigger re-render
    }, 2000);

    // Después de 5-15 segundos: delivered → read (aleatorio)
    const readDelay = 5000 + Math.random() * 10000; // 5-15 segundos
    setTimeout(() => {
      console.log('✓✓ Mensaje leído (azul)');
      this.messages.update(messages => [...messages]); // Trigger re-render
    }, readDelay);
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}
