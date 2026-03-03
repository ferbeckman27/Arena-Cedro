export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agenda: {
        Row: {
          data: string
          horario_fim: string | null
          horario_inicio: string | null
          id: number
          reserva_id: number | null
          status: string | null
          turno: string | null
        }
        Insert: {
          data: string
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: number
          reserva_id?: number | null
          status?: string | null
          turno?: string | null
        }
        Update: {
          data?: string
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: number
          reserva_id?: number | null
          status?: string | null
          turno?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agenda_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas_detalhes"
            referencedColumns: ["id"]
          },
        ]
      }
      blocos: {
        Row: {
          duracao_minutos: number
          id: number
          label: string | null
        }
        Insert: {
          duracao_minutos: number
          id?: number
          label?: string | null
        }
        Update: {
          duracao_minutos?: number
          id?: number
          label?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          cadastrado_por: string | null
          created_at: string | null
          dia_fixo: string | null
          email: string | null
          forma_pagamento: string | null
          horario_fixo: string | null
          id: number
          nome: string
          observacoes: string | null
          reservas_concluidas: number | null
          senha: string | null
          sobrenome: string | null
          status_pagamento: string | null
          telefone: string | null
          tipo: string | null
          user_id: string | null
        }
        Insert: {
          cadastrado_por?: string | null
          created_at?: string | null
          dia_fixo?: string | null
          email?: string | null
          forma_pagamento?: string | null
          horario_fixo?: string | null
          id?: number
          nome: string
          observacoes?: string | null
          reservas_concluidas?: number | null
          senha?: string | null
          sobrenome?: string | null
          status_pagamento?: string | null
          telefone?: string | null
          tipo?: string | null
          user_id?: string | null
        }
        Update: {
          cadastrado_por?: string | null
          created_at?: string | null
          dia_fixo?: string | null
          email?: string | null
          forma_pagamento?: string | null
          horario_fixo?: string | null
          id?: number
          nome?: string
          observacoes?: string | null
          reservas_concluidas?: number | null
          senha?: string | null
          sobrenome?: string | null
          status_pagamento?: string | null
          telefone?: string | null
          tipo?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          chave: string
          id: number
          updated_at: string | null
          valor: string | null
        }
        Insert: {
          chave: string
          id?: number
          updated_at?: string | null
          valor?: string | null
        }
        Update: {
          chave?: string
          id?: number
          updated_at?: string | null
          valor?: string | null
        }
        Relationships: []
      }
      depoimentos: {
        Row: {
          aprovado: boolean | null
          autor: string | null
          cliente_id: number | null
          comentario: string | null
          data_publicacao: string | null
          estrelas: number | null
          id: number
          nome: string | null
        }
        Insert: {
          aprovado?: boolean | null
          autor?: string | null
          cliente_id?: number | null
          comentario?: string | null
          data_publicacao?: string | null
          estrelas?: number | null
          id?: number
          nome?: string | null
        }
        Update: {
          aprovado?: boolean | null
          autor?: string | null
          cliente_id?: number | null
          comentario?: string | null
          data_publicacao?: string | null
          estrelas?: number | null
          id?: number
          nome?: string | null
        }
        Relationships: []
      }
      funcionarios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string | null
          id: string
          nome: string
          senha: string | null
          telefone: string | null
          tipo: string | null
          turno: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome: string
          senha?: string | null
          telefone?: string | null
          tipo?: string | null
          turno?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string
          senha?: string | null
          telefone?: string | null
          tipo?: string | null
          turno?: string | null
        }
        Relationships: []
      }
      itens_reserva: {
        Row: {
          created_at: string | null
          id: number
          pago: boolean | null
          preco_unitario: number | null
          produto_id: number | null
          quantidade: number | null
          reserva_id: number | null
          subtotal: number | null
          tipo: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          pago?: boolean | null
          preco_unitario?: number | null
          produto_id?: number | null
          quantidade?: number | null
          reserva_id?: number | null
          subtotal?: number | null
          tipo?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          pago?: boolean | null
          preco_unitario?: number | null
          produto_id?: number | null
          quantidade?: number | null
          reserva_id?: number | null
          subtotal?: number | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_reserva_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_reserva_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_reserva_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas_detalhes"
            referencedColumns: ["id"]
          },
        ]
      }
      observacoes_clientes: {
        Row: {
          alerta: boolean | null
          cliente_id: number | null
          cliente_nome: string | null
          created_at: string | null
          id: number
          observacao: string | null
          tipo: string | null
        }
        Insert: {
          alerta?: boolean | null
          cliente_id?: number | null
          cliente_nome?: string | null
          created_at?: string | null
          id?: number
          observacao?: string | null
          tipo?: string | null
        }
        Update: {
          alerta?: boolean | null
          cliente_id?: number | null
          cliente_nome?: string | null
          created_at?: string | null
          id?: number
          observacao?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "observacoes_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          codigo_pix: string | null
          created_at: string | null
          data_confirmacao: string | null
          forma_pagamento: string | null
          id: number
          id_mercado_pago: string | null
          qr_code_base64: string | null
          reserva_id: number | null
          status: string | null
          tipo: string | null
          valor: number
        }
        Insert: {
          codigo_pix?: string | null
          created_at?: string | null
          data_confirmacao?: string | null
          forma_pagamento?: string | null
          id?: number
          id_mercado_pago?: string | null
          qr_code_base64?: string | null
          reserva_id?: number | null
          status?: string | null
          tipo?: string | null
          valor: number
        }
        Update: {
          codigo_pix?: string | null
          created_at?: string | null
          data_confirmacao?: string | null
          forma_pagamento?: string | null
          id?: number
          id_mercado_pago?: string | null
          qr_code_base64?: string | null
          reserva_id?: number | null
          status?: string | null
          tipo?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas_detalhes"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: number
          nome: string
          preco_aluguel: number | null
          preco_venda: number | null
          quantidade_estoque: number | null
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: number
          nome: string
          preco_aluguel?: number | null
          preco_venda?: number | null
          quantidade_estoque?: number | null
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: number
          nome?: string
          preco_aluguel?: number | null
          preco_venda?: number | null
          quantidade_estoque?: number | null
          tipo?: string | null
        }
        Relationships: []
      }
      reservas: {
        Row: {
          atendente_id: string | null
          bloco_id: number | null
          cliente_id: number | null
          cliente_nome: string | null
          comissao_valor: number | null
          created_at: string | null
          data_pagamento: string | null
          data_reserva: string
          duracao: number | null
          forma_pagamento: string | null
          funcionario_id: string | null
          horario_fim: string | null
          horario_inicio: string
          id: number
          observacoes: string | null
          pago: boolean | null
          reserva_fixa_id: number | null
          status: string | null
          tipo: string | null
          turno_id: number | null
          valor_pago_sinal: number | null
          valor_restante: number | null
          valor_sinal: number | null
          valor_total: number | null
        }
        Insert: {
          atendente_id?: string | null
          bloco_id?: number | null
          cliente_id?: number | null
          cliente_nome?: string | null
          comissao_valor?: number | null
          created_at?: string | null
          data_pagamento?: string | null
          data_reserva: string
          duracao?: number | null
          forma_pagamento?: string | null
          funcionario_id?: string | null
          horario_fim?: string | null
          horario_inicio: string
          id?: number
          observacoes?: string | null
          pago?: boolean | null
          reserva_fixa_id?: number | null
          status?: string | null
          tipo?: string | null
          turno_id?: number | null
          valor_pago_sinal?: number | null
          valor_restante?: number | null
          valor_sinal?: number | null
          valor_total?: number | null
        }
        Update: {
          atendente_id?: string | null
          bloco_id?: number | null
          cliente_id?: number | null
          cliente_nome?: string | null
          comissao_valor?: number | null
          created_at?: string | null
          data_pagamento?: string | null
          data_reserva?: string
          duracao?: number | null
          forma_pagamento?: string | null
          funcionario_id?: string | null
          horario_fim?: string | null
          horario_inicio?: string
          id?: number
          observacoes?: string | null
          pago?: boolean | null
          reserva_fixa_id?: number | null
          status?: string | null
          tipo?: string | null
          turno_id?: number | null
          valor_pago_sinal?: number | null
          valor_restante?: number | null
          valor_sinal?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reservas_bloco_id_fkey"
            columns: ["bloco_id"]
            isOneToOne: false
            referencedRelation: "blocos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_reserva_fixa_id_fkey"
            columns: ["reserva_fixa_id"]
            isOneToOne: false
            referencedRelation: "reservas_fixas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: false
            referencedRelation: "turnos"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas_fixas: {
        Row: {
          ativo: boolean | null
          bloco_id: number | null
          cliente_id: number | null
          created_at: string | null
          data_inicio: string | null
          dia_semana_id: number | null
          horario_inicio: string | null
          id: number
          turno_id: number | null
        }
        Insert: {
          ativo?: boolean | null
          bloco_id?: number | null
          cliente_id?: number | null
          created_at?: string | null
          data_inicio?: string | null
          dia_semana_id?: number | null
          horario_inicio?: string | null
          id?: number
          turno_id?: number | null
        }
        Update: {
          ativo?: boolean | null
          bloco_id?: number | null
          cliente_id?: number | null
          created_at?: string | null
          data_inicio?: string | null
          dia_semana_id?: number | null
          horario_inicio?: string | null
          id?: number
          turno_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reservas_fixas_bloco_id_fkey"
            columns: ["bloco_id"]
            isOneToOne: false
            referencedRelation: "blocos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_fixas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_fixas_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: false
            referencedRelation: "turnos"
            referencedColumns: ["id"]
          },
        ]
      }
      turnos: {
        Row: {
          hora_fim: string | null
          hora_inicio: string | null
          id: number
          nome: string
          preco_hora: number | null
        }
        Insert: {
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: number
          nome: string
          preco_hora?: number | null
        }
        Update: {
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: number
          nome?: string
          preco_hora?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      reservas_detalhes: {
        Row: {
          cliente_nome: string | null
          data_reserva: string | null
          forma_pagamento: string | null
          funcionario_nome: string | null
          horario_fim: string | null
          horario_inicio: string | null
          id: number | null
          observacoes: string | null
          pago: boolean | null
          status: string | null
          tipo: string | null
          valor_restante: number | null
          valor_sinal: number | null
          valor_total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      incrementar_fidelidade: { Args: { cli_id: number }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
