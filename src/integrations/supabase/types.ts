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
          ativo: boolean | null
          descricao: string | null
          duracao_minutos: number
          id: number
          label: string | null
          multiplicador: number | null
        }
        Insert: {
          ativo?: boolean | null
          descricao?: string | null
          duracao_minutos: number
          id?: number
          label?: string | null
          multiplicador?: number | null
        }
        Update: {
          ativo?: boolean | null
          descricao?: string | null
          duracao_minutos?: number
          id?: number
          label?: string | null
          multiplicador?: number | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          aceitou_termos: boolean | null
          ativo: boolean | null
          cadastrado_por: string | null
          created_at: string | null
          dia_fixo: string | null
          email: string | null
          forma_pagamento: string | null
          horario_fixo: string | null
          id: number
          nome: string
          observacoes: string | null
          pontos_fidelidade: number | null
          reservas_concluidas: number | null
          salvar_senha: boolean | null
          senha: string | null
          sobrenome: string | null
          status_pagamento: string | null
          telefone: string | null
          tipo: string | null
          user_id: string | null
        }
        Insert: {
          aceitou_termos?: boolean | null
          ativo?: boolean | null
          cadastrado_por?: string | null
          created_at?: string | null
          dia_fixo?: string | null
          email?: string | null
          forma_pagamento?: string | null
          horario_fixo?: string | null
          id?: number
          nome: string
          observacoes?: string | null
          pontos_fidelidade?: number | null
          reservas_concluidas?: number | null
          salvar_senha?: boolean | null
          senha?: string | null
          sobrenome?: string | null
          status_pagamento?: string | null
          telefone?: string | null
          tipo?: string | null
          user_id?: string | null
        }
        Update: {
          aceitou_termos?: boolean | null
          ativo?: boolean | null
          cadastrado_por?: string | null
          created_at?: string | null
          dia_fixo?: string | null
          email?: string | null
          forma_pagamento?: string | null
          horario_fixo?: string | null
          id?: number
          nome?: string
          observacoes?: string | null
          pontos_fidelidade?: number | null
          reservas_concluidas?: number | null
          salvar_senha?: boolean | null
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
          categoria: string | null
          chave: string
          descricao: string | null
          id: number
          updated_at: string | null
          valor: string | null
        }
        Insert: {
          categoria?: string | null
          chave: string
          descricao?: string | null
          id?: number
          updated_at?: string | null
          valor?: string | null
        }
        Update: {
          categoria?: string | null
          chave?: string
          descricao?: string | null
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
          censurado: boolean | null
          cliente_id: number | null
          comentario: string | null
          data_publicacao: string | null
          estrelas: number | null
          id: number
          nome: string | null
          nome_exibicao: string | null
        }
        Insert: {
          aprovado?: boolean | null
          autor?: string | null
          censurado?: boolean | null
          cliente_id?: number | null
          comentario?: string | null
          data_publicacao?: string | null
          estrelas?: number | null
          id?: number
          nome?: string | null
          nome_exibicao?: string | null
        }
        Update: {
          aprovado?: boolean | null
          autor?: string | null
          censurado?: boolean | null
          cliente_id?: number | null
          comentario?: string | null
          data_publicacao?: string | null
          estrelas?: number | null
          id?: number
          nome?: string | null
          nome_exibicao?: string | null
        }
        Relationships: []
      }
      dias_semana: {
        Row: {
          codigo: number
          id: number
          nome: string
        }
        Insert: {
          codigo: number
          id?: number
          nome: string
        }
        Update: {
          codigo?: number
          id?: number
          nome?: string
        }
        Relationships: []
      }
      fechamentos_caixa: {
        Row: {
          created_at: string
          data: string
          fechado_por: string | null
          id: string
          valor_dinheiro: number | null
          valor_pix: number | null
        }
        Insert: {
          created_at?: string
          data: string
          fechado_por?: string | null
          id?: string
          valor_dinheiro?: number | null
          valor_pix?: number | null
        }
        Update: {
          created_at?: string
          data?: string
          fechado_por?: string | null
          id?: string
          valor_dinheiro?: number | null
          valor_pix?: number | null
        }
        Relationships: []
      }
      funcionarios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string | null
          email_corporativo: string | null
          id: string
          nome: string
          senha: string | null
          sobrenome: string | null
          telefone: string | null
          tipo: string | null
          total_acessos: number | null
          turno: string | null
          ultimo_acesso: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string | null
          email_corporativo?: string | null
          id?: string
          nome: string
          senha?: string | null
          sobrenome?: string | null
          telefone?: string | null
          tipo?: string | null
          total_acessos?: number | null
          turno?: string | null
          ultimo_acesso?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string | null
          email_corporativo?: string | null
          id?: string
          nome?: string
          senha?: string | null
          sobrenome?: string | null
          telefone?: string | null
          tipo?: string | null
          total_acessos?: number | null
          turno?: string | null
          ultimo_acesso?: string | null
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
      manutencao: {
        Row: {
          ativo: number | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: number
        }
        Insert: {
          ativo?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: number
        }
        Update: {
          ativo?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: number
        }
        Relationships: []
      }
      mensalistas: {
        Row: {
          dia_semana: string | null
          horario: string | null
          id: number
          metodo_pgto: string | null
          nome: string | null
          observacao: string | null
          responsavel: string | null
          status_pagamento: string | null
        }
        Insert: {
          dia_semana?: string | null
          horario?: string | null
          id?: number
          metodo_pgto?: string | null
          nome?: string | null
          observacao?: string | null
          responsavel?: string | null
          status_pagamento?: string | null
        }
        Update: {
          dia_semana?: string | null
          horario?: string | null
          id?: number
          metodo_pgto?: string | null
          nome?: string | null
          observacao?: string | null
          responsavel?: string | null
          status_pagamento?: string | null
        }
        Relationships: []
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
          comprovante_path: string | null
          created_at: string | null
          data_confirmacao: string | null
          data_expiracao: string | null
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
          comprovante_path?: string | null
          created_at?: string | null
          data_confirmacao?: string | null
          data_expiracao?: string | null
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
          comprovante_path?: string | null
          created_at?: string | null
          data_confirmacao?: string | null
          data_expiracao?: string | null
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
      palavras_bloqueadas: {
        Row: {
          id: number
          palavra: string
        }
        Insert: {
          id?: number
          palavra: string
        }
        Update: {
          id?: number
          palavra?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          estoque_minimo: number | null
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
          descricao?: string | null
          estoque_minimo?: number | null
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
          descricao?: string | null
          estoque_minimo?: number | null
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
          id_mercado_pago: string | null
          observacoes: string | null
          pago: boolean | null
          pix_copia_e_cola: string | null
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
          id_mercado_pago?: string | null
          observacoes?: string | null
          pago?: boolean | null
          pix_copia_e_cola?: string | null
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
          id_mercado_pago?: string | null
          observacoes?: string | null
          pago?: boolean | null
          pix_copia_e_cola?: string | null
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
          data_fim: string | null
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
          data_fim?: string | null
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
          data_fim?: string | null
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
          ativo: boolean | null
          hora_fim: string | null
          hora_inicio: string | null
          id: number
          nome: string
          preco_hora: number | null
          valor_hora: number | null
        }
        Insert: {
          ativo?: boolean | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: number
          nome: string
          preco_hora?: number | null
          valor_hora?: number | null
        }
        Update: {
          ativo?: boolean | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: number
          nome?: string
          preco_hora?: number | null
          valor_hora?: number | null
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
      fn_censurar_texto: { Args: { p_texto: string }; Returns: string }
      incrementar_fidelidade: { Args: { cli_id: number }; Returns: undefined }
      login_cliente: {
        Args: { p_email: string; p_senha: string }
        Returns: {
          email: string
          id: number
          nome: string
          tipo: string
        }[]
      }
      login_funcionario: {
        Args: { p_email: string; p_senha: string }
        Returns: {
          id: string
          nome: string
          tipo: string
        }[]
      }
      redefinir_senha_cliente: {
        Args: { p_email: string; p_nova_senha: string }
        Returns: boolean
      }
      registrar_acesso: {
        Args: { p_funcionario_id: string }
        Returns: undefined
      }
      set_funcionario_senha: {
        Args: { p_id: string; p_senha: string }
        Returns: undefined
      }
      sp_verificar_disponibilidade: {
        Args: { p_data: string; p_duracao_min: number; p_horario: string }
        Returns: {
          disponivel: boolean
        }[]
      }
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
