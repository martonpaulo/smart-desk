export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)';
  };
  public: {
    Tables: {
      columns: {
        Row: {
          color: string;
          created_at: string;
          id: string;
          position: number;
          title: string;
          trashed: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color: string;
          created_at: string;
          id: string;
          position?: number;
          title: string;
          trashed?: boolean;
          updated_at: string;
          user_id: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          id?: string;
          position?: number;
          title?: string;
          trashed?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          acknowledged: boolean;
          all_day: boolean;
          created_at: string;
          description: string | null;
          end_time: string;
          id: string;
          start_time: string;
          summary: string;
          trashed: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          acknowledged?: boolean;
          all_day: boolean;
          created_at: string;
          description?: string | null;
          end_time: string;
          id: string;
          start_time: string;
          summary: string;
          trashed?: boolean;
          updated_at: string;
          user_id: string;
        };
        Update: {
          acknowledged?: boolean;
          all_day?: boolean;
          created_at?: string;
          description?: string | null;
          end_time?: string;
          id?: string;
          start_time?: string;
          summary?: string;
          trashed?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      files: {
        Row: {
          created_at: string;
          id: string;
          public_id: string;
          resource_type: string;
          trashed: boolean;
          updated_at: string;
          url: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          public_id: string;
          resource_type: string;
          trashed?: boolean;
          updated_at?: string;
          url: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          public_id?: string;
          resource_type?: string;
          trashed?: boolean;
          updated_at?: string;
          url?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      ics_calendars: {
        Row: {
          color: string;
          created_at: string;
          id: string;
          source: string;
          title: string;
          trashed: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color: string;
          created_at: string;
          id: string;
          source: string;
          title: string;
          trashed?: boolean;
          updated_at: string;
          user_id: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          id?: string;
          source?: string;
          title?: string;
          trashed?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          created_at: string;
          end_date: string;
          id: string;
          name: string;
          start_date: string;
          trashed: boolean;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at: string;
          end_date: string;
          id: string;
          name: string;
          start_date: string;
          trashed?: boolean;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          end_date?: string;
          id?: string;
          name?: string;
          start_date?: string;
          trashed?: boolean;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      maps: {
        Row: {
          created_at: string;
          file_public_id: string;
          file_url: string;
          id: string;
          name: string;
          region_colors: JSON;
          region_labels: JSON;
          region_tooltips: JSON;
          trashed: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          file_public_id: string;
          file_url: string;
          id?: string;
          name: string;
          region_colors?: JSON;
          region_labels?: JSON;
          region_tooltips?: JSON;
          trashed?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          file_public_id?: string;
          file_url?: string;
          id?: string;
          name?: string;
          region_colors?: JSON;
          region_labels?: JSON;
          region_tooltips?: JSON;
          trashed?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          color: string | null;
          content: string | null;
          created_at: string;
          id: string;
          title: string | null;
          trashed: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          content?: string | null;
          created_at: string;
          id: string;
          title?: string | null;
          trashed?: boolean;
          updated_at: string;
          user_id: string;
        };
        Update: {
          color?: string | null;
          content?: string | null;
          created_at?: string;
          id?: string;
          title?: string | null;
          trashed?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          color: string;
          created_at: string;
          id: string;
          name: string;
          position: number;
          trashed: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color: string;
          created_at: string;
          id: string;
          name: string;
          position: number;
          trashed?: boolean;
          updated_at: string;
          user_id: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          id?: string;
          name?: string;
          position?: number;
          trashed?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          blocked: boolean;
          classified_date: string | null;
          column_id: string;
          created_at: string;
          daily: boolean;
          estimated_time: number | null;
          event_id: string | null;
          id: string;
          important: boolean;
          notes: string | null;
          planned_date: string | null;
          position: number;
          quantity_done: number;
          quantity_target: number;
          tag_id: string | null;
          title: string;
          trashed: boolean;
          updated_at: string;
          urgent: boolean;
          user_id: string;
        };
        Insert: {
          blocked?: boolean;
          classified_date?: string | null;
          column_id: string;
          created_at: string;
          daily?: boolean;
          estimated_time?: number | null;
          event_id?: string | null;
          id: string;
          important?: boolean;
          notes?: string | null;
          planned_date?: string | null;
          position?: number;
          quantity_done?: number;
          quantity_target?: number;
          tag_id?: string | null;
          title: string;
          trashed?: boolean;
          updated_at: string;
          urgent?: boolean;
          user_id: string;
        };
        Update: {
          blocked?: boolean;
          classified_date?: string | null;
          column_id?: string;
          created_at?: string;
          daily?: boolean;
          estimated_time?: number | null;
          event_id?: string | null;
          id?: string;
          important?: boolean;
          notes?: string | null;
          planned_date?: string | null;
          position?: number;
          quantity_done?: number;
          quantity_target?: number;
          tag_id?: string | null;
          title?: string;
          trashed?: boolean;
          updated_at?: string;
          urgent?: boolean;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_column_id_fkey';
            columns: ['column_id'];
            isOneToOne: false;
            referencedRelation: 'columns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
