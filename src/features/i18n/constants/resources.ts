export const translationResources = {
  en: {
    common: {
      app: {
        title: 'Smart Desk',
        subtitle:
          'Calendar events are read from local SQLite. Remote sync is handled in the background.',
      },
      language: {
        label: 'Language',
        english: 'English',
        spanish: 'Spanish',
      },
      auth: {
        actionFailed: 'Action failed: {{message}}',
        signedOut: 'You are signed out. Sign in to connect Google Calendar.',
        connected: 'Google Calendar connected. Updates sync automatically every few seconds.',
        disconnected:
          'Google Calendar is not connected. Connect it to sync events into your local calendar.',
      },
      google: {
        connect: 'Connect & Sync Google',
        connecting: 'Connecting...',
        connected: 'Google Connected',
        checking: 'Checking Google...',
        signIn: 'Sign in with Google',
        signingOut: 'Signing out...',
        signOut: 'Sign out',
        loading: 'Loading...',
      },
      calendar: {
        todayTitle: 'Today Calendar',
        sectionAllDay: 'All-day',
        sectionScheduled: 'Scheduled',
        allDayLabel: 'All day',
        untitledItem: 'Untitled item',
        emptyAllDay: 'No all-day items for today.',
        emptyScheduled: 'No timed items for today.',
        emptyStateHint: 'Connect Google Calendar and sync events to populate this view.',
        toasts: {
          added: 'Added: {{label}}',
          updated: 'Updated: {{label}}',
          removed: 'Removed: {{label}}',
        },
      },
      tasks: {
        title: 'Tasks',
        subtitle: 'Create tasks with a planned date. They are shown as all-day items on that day.',
        signInHint: 'Sign in to create and sync tasks.',
        loading: 'Loading tasks...',
        emptyState: 'No tasks yet. Create one and it will also appear as an all-day event.',
        defaultTaskTitle: 'New Task',
        toasts: {
          created: 'Task created.',
          updated: 'Task updated.',
          deleted: 'Task deleted.',
          createError: 'Could not create task. Try again.',
          updateError: 'Could not update task. Try again.',
          deleteError: 'Could not delete task. Try again.',
        },
        actions: {
          edit: 'Edit',
          delete: 'Delete',
        },
        createDialog: {
          title: 'Add task',
          description: 'Create a task with optional notes, optional tags, and a planned date.',
        },
        editDialog: {
          title: 'Edit task',
          description: 'Update the title, optional notes, optional tags, and planned date.',
          saveChanges: 'Save changes',
          cancel: 'Cancel',
        },
        deleteDialog: {
          title: 'Delete task',
          description: 'Are you sure you want to delete "{{title}}"? This action cannot be undone.',
          confirm: 'Delete',
        },
        form: {
          titleLabel: 'Title',
          titlePlaceholder: 'Write release notes',
          descriptionLabel: 'Description (optional)',
          descriptionPlaceholder: 'Add context or checklist details',
          tagsLabel: 'Tags (optional)',
          tagsPlaceholder: 'work, urgent',
          plannedDateLabel: 'Planned date',
          addTask: 'Add task',
          validation: {
            titleRequired: 'Title is required.',
            titleMax: 'Title must be at most {{max}} characters.',
            descriptionMax: 'Description must be at most {{max}} characters.',
            tagsMax: 'Tags must be at most {{max}} characters.',
            plannedDateFormat: 'Planned date must be in YYYY-MM-DD format.',
          },
        },
      },
      callback: {
        success: {
          google_connected: 'Google Calendar connected successfully. Initial sync started.',
        },
        error: {
          oauth_failed: 'Google authorization was cancelled or failed.',
          invalid_state: 'Invalid OAuth state. Please try connecting again.',
          state_mismatch: 'Security validation failed. Please reconnect Google.',
          token_exchange_failed: 'Could not exchange Google authorization code.',
          profile_fetch_failed: 'Could not fetch your Google profile details.',
          connection_save_failed: 'Connected to Google, but saving your connection failed.',
          no_refresh_token: 'Google did not return a refresh token. Try again with consent.',
          callback_failed: 'Unexpected callback error. Please try again.',
        },
      },
    },
  },
  es: {
    common: {
      app: {
        title: 'Smart Desk',
        subtitle:
          'Los eventos del calendario se leen desde SQLite local. La sincronización remota se ejecuta en segundo plano.',
      },
      language: {
        label: 'Idioma',
        english: 'Inglés',
        spanish: 'Español',
      },
      auth: {
        actionFailed: 'La acción ha fallado: {{message}}',
        signedOut: 'Has cerrado sesión. Inicia sesión para conectar Google Calendar.',
        connected:
          'Google Calendar está conectado. Las actualizaciones se sincronizan automáticamente cada pocos segundos.',
        disconnected:
          'Google Calendar no está conectado. Conéctalo para sincronizar los eventos en tu calendario local.',
      },
      google: {
        connect: 'Conectar y sincronizar Google',
        connecting: 'Conectando...',
        connected: 'Google conectado',
        checking: 'Comprobando Google...',
        signIn: 'Iniciar sesión con Google',
        signingOut: 'Cerrando sesión...',
        signOut: 'Cerrar sesión',
        loading: 'Cargando...',
      },
      calendar: {
        todayTitle: 'Calendario de hoy',
        sectionAllDay: 'Todo el día',
        sectionScheduled: 'Programado',
        allDayLabel: 'Todo el día',
        untitledItem: 'Elemento sin título',
        emptyAllDay: 'No hay elementos de todo el día para hoy.',
        emptyScheduled: 'No hay elementos programados para hoy.',
        emptyStateHint:
          'Conecta Google Calendar y sincroniza los eventos para rellenar esta vista.',
        toasts: {
          added: 'Añadido: {{label}}',
          updated: 'Actualizado: {{label}}',
          removed: 'Eliminado: {{label}}',
        },
      },
      tasks: {
        title: 'Tareas',
        subtitle:
          'Crea tareas con una fecha planificada. Se muestran como elementos de todo el día en esa fecha.',
        signInHint: 'Inicia sesión para crear y sincronizar tareas.',
        loading: 'Cargando tareas...',
        emptyState: 'Aún no hay tareas. Crea una y también aparecerá como evento de todo el día.',
        defaultTaskTitle: 'Nueva tarea',
        toasts: {
          created: 'Tarea creada.',
          updated: 'Tarea actualizada.',
          deleted: 'Tarea eliminada.',
          createError: 'No se pudo crear la tarea. Inténtalo de nuevo.',
          updateError: 'No se pudo actualizar la tarea. Inténtalo de nuevo.',
          deleteError: 'No se pudo eliminar la tarea. Inténtalo de nuevo.',
        },
        actions: {
          edit: 'Editar',
          delete: 'Eliminar',
        },
        createDialog: {
          title: 'Añadir tarea',
          description:
            'Crea una tarea con notas opcionales, etiquetas opcionales y una fecha planificada.',
        },
        editDialog: {
          title: 'Editar tarea',
          description:
            'Actualiza el título, las notas opcionales, las etiquetas opcionales y la fecha planificada.',
          saveChanges: 'Guardar cambios',
          cancel: 'Cancelar',
        },
        deleteDialog: {
          title: 'Eliminar tarea',
          description:
            '¿Seguro que quieres eliminar "{{title}}"? Esta acción no se puede deshacer.',
          confirm: 'Eliminar',
        },
        form: {
          titleLabel: 'Título',
          titlePlaceholder: 'Escribe las notas de la versión',
          descriptionLabel: 'Descripción (opcional)',
          descriptionPlaceholder: 'Añade contexto o detalles de la lista',
          tagsLabel: 'Etiquetas (opcional)',
          tagsPlaceholder: 'trabajo, urgente',
          plannedDateLabel: 'Fecha planificada',
          addTask: 'Añadir tarea',
          validation: {
            titleRequired: 'El título es obligatorio.',
            titleMax: 'El título debe tener como máximo {{max}} caracteres.',
            descriptionMax: 'La descripción debe tener como máximo {{max}} caracteres.',
            tagsMax: 'Las etiquetas deben tener como máximo {{max}} caracteres.',
            plannedDateFormat: 'La fecha planificada debe tener formato YYYY-MM-DD.',
          },
        },
      },
      callback: {
        success: {
          google_connected:
            'Google Calendar conectado correctamente. La sincronización inicial ha comenzado.',
        },
        error: {
          oauth_failed: 'La autorización de Google fue cancelada o falló.',
          invalid_state: 'Estado de OAuth no válido. Intenta conectar de nuevo.',
          state_mismatch: 'La validación de seguridad ha fallado. Vuelve a conectar Google.',
          token_exchange_failed: 'No se pudo intercambiar el código de autorización de Google.',
          profile_fetch_failed: 'No se pudieron obtener los datos de tu perfil de Google.',
          connection_save_failed: 'Google se conectó, pero no se pudo guardar la conexión.',
          no_refresh_token:
            'Google no devolvió un refresh token. Inténtalo de nuevo con consentimiento.',
          callback_failed: 'Error inesperado en el callback. Inténtalo de nuevo.',
        },
      },
    },
  },
} as const;
