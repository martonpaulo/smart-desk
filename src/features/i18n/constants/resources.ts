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
        connected:
          'Google Calendar connected. Updates sync automatically every few seconds.',
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
        editDialog: {
          title: 'Edit task',
          description: 'Update the title, optional notes, optional tags, and planned date.',
          saveChanges: 'Save changes',
          cancel: 'Cancel',
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
          'Los eventos del calendario se leen desde SQLite local. La sincronizacion remota se ejecuta en segundo plano.',
      },
      language: {
        label: 'Idioma',
        english: 'Ingles',
        spanish: 'Espanol',
      },
      auth: {
        actionFailed: 'La accion fallo: {{message}}',
        signedOut: 'Has cerrado sesion. Inicia sesion para conectar Google Calendar.',
        connected:
          'Google Calendar conectado. Las actualizaciones se sincronizan automaticamente cada pocos segundos.',
        disconnected:
          'Google Calendar no esta conectado. Conectalo para sincronizar eventos en tu calendario local.',
      },
      google: {
        connect: 'Conectar y sincronizar Google',
        connecting: 'Conectando...',
        connected: 'Google conectado',
        checking: 'Comprobando Google...',
        signIn: 'Iniciar sesion con Google',
        signingOut: 'Cerrando sesion...',
        signOut: 'Cerrar sesion',
        loading: 'Cargando...',
      },
      calendar: {
        todayTitle: 'Calendario de hoy',
        sectionAllDay: 'Todo el dia',
        sectionScheduled: 'Programado',
        allDayLabel: 'Todo el dia',
        untitledItem: 'Elemento sin titulo',
        emptyAllDay: 'No hay elementos de todo el dia para hoy.',
        emptyScheduled: 'No hay elementos con horario para hoy.',
        emptyStateHint:
          'Conecta Google Calendar y sincroniza eventos para llenar esta vista.',
        toasts: {
          added: 'Agregado: {{label}}',
          updated: 'Actualizado: {{label}}',
          removed: 'Eliminado: {{label}}',
        },
      },
      tasks: {
        title: 'Tareas',
        subtitle:
          'Crea tareas con una fecha planificada. Se muestran como elementos de todo el dia en esa fecha.',
        signInHint: 'Inicia sesion para crear y sincronizar tareas.',
        loading: 'Cargando tareas...',
        emptyState:
          'Aun no hay tareas. Crea una y tambien aparecera como evento de todo el dia.',
        defaultTaskTitle: 'Nueva tarea',
        toasts: {
          created: 'Tarea creada.',
          updated: 'Tarea actualizada.',
          deleted: 'Tarea eliminada.',
          createError: 'No se pudo crear la tarea. Intentalo de nuevo.',
          updateError: 'No se pudo actualizar la tarea. Intentalo de nuevo.',
          deleteError: 'No se pudo eliminar la tarea. Intentalo de nuevo.',
        },
        actions: {
          edit: 'Editar',
          delete: 'Eliminar',
        },
        editDialog: {
          title: 'Editar tarea',
          description:
            'Actualiza el titulo, notas opcionales, etiquetas opcionales y fecha planificada.',
          saveChanges: 'Guardar cambios',
          cancel: 'Cancelar',
        },
        form: {
          titleLabel: 'Titulo',
          titlePlaceholder: 'Escribe notas de lanzamiento',
          descriptionLabel: 'Descripcion (opcional)',
          descriptionPlaceholder: 'Agrega contexto o detalles de la lista',
          tagsLabel: 'Etiquetas (opcional)',
          tagsPlaceholder: 'trabajo, urgente',
          plannedDateLabel: 'Fecha planificada',
          addTask: 'Agregar tarea',
          validation: {
            titleRequired: 'El titulo es obligatorio.',
            titleMax: 'El titulo debe tener como maximo {{max}} caracteres.',
            descriptionMax: 'La descripcion debe tener como maximo {{max}} caracteres.',
            tagsMax: 'Las etiquetas deben tener como maximo {{max}} caracteres.',
            plannedDateFormat: 'La fecha planificada debe tener formato YYYY-MM-DD.',
          },
        },
      },
      callback: {
        success: {
          google_connected:
            'Google Calendar conectado correctamente. La sincronizacion inicial ha comenzado.',
        },
        error: {
          oauth_failed: 'La autorizacion de Google fue cancelada o fallo.',
          invalid_state: 'Estado OAuth invalido. Intenta conectar de nuevo.',
          state_mismatch:
            'Fallo la validacion de seguridad. Vuelve a conectar Google.',
          token_exchange_failed: 'No se pudo intercambiar el codigo de autorizacion de Google.',
          profile_fetch_failed: 'No se pudieron obtener los datos de tu perfil de Google.',
          connection_save_failed:
            'Google se conecto, pero no se pudo guardar tu conexion.',
          no_refresh_token:
            'Google no devolvio un refresh token. Intenta de nuevo con consentimiento.',
          callback_failed: 'Error inesperado en el callback. Intenta de nuevo.',
        },
      },
    },
  },
} as const;

