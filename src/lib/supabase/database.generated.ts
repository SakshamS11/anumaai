export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      analysis_runs: {
        Row: {
          completed_at: string | null;
          conversation_id: string;
          cost_currency: string | null;
          cost_minor: number | null;
          created_at: string;
          domain_pack_version: string;
          error_code: string | null;
          error_message: string | null;
          id: string;
          input_tokens: number | null;
          latency_milliseconds: number | null;
          metric_run_id: string | null;
          model: string;
          model_version: string | null;
          organization_id: string;
          output_tokens: number | null;
          prompt_version: string;
          provenance_metadata: Json;
          provider: string;
          provider_request_id: string | null;
          source_transcription_run_id: string;
          speaker_mapping_version_id: string | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["run_status"];
          taxonomy_version: string;
        };
        Insert: {
          completed_at?: string | null;
          conversation_id: string;
          cost_currency?: string | null;
          cost_minor?: number | null;
          created_at?: string;
          domain_pack_version: string;
          error_code?: string | null;
          error_message?: string | null;
          id?: string;
          input_tokens?: number | null;
          latency_milliseconds?: number | null;
          metric_run_id?: string | null;
          model: string;
          model_version?: string | null;
          organization_id: string;
          output_tokens?: number | null;
          prompt_version: string;
          provenance_metadata?: Json;
          provider: string;
          provider_request_id?: string | null;
          source_transcription_run_id: string;
          speaker_mapping_version_id?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["run_status"];
          taxonomy_version: string;
        };
        Update: {
          completed_at?: string | null;
          conversation_id?: string;
          cost_currency?: string | null;
          cost_minor?: number | null;
          created_at?: string;
          domain_pack_version?: string;
          error_code?: string | null;
          error_message?: string | null;
          id?: string;
          input_tokens?: number | null;
          latency_milliseconds?: number | null;
          metric_run_id?: string | null;
          model?: string;
          model_version?: string | null;
          organization_id?: string;
          output_tokens?: number | null;
          prompt_version?: string;
          provenance_metadata?: Json;
          provider?: string;
          provider_request_id?: string | null;
          source_transcription_run_id?: string;
          speaker_mapping_version_id?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["run_status"];
          taxonomy_version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_runs_mapping_fk";
            columns: [
              "organization_id",
              "conversation_id",
              "source_transcription_run_id",
              "speaker_mapping_version_id",
            ];
            isOneToOne: false;
            referencedRelation: "speaker_mapping_versions";
            referencedColumns: ["organization_id", "conversation_id", "transcription_run_id", "id"];
          },
          {
            foreignKeyName: "analysis_runs_metric_run_fk";
            columns: ["organization_id", "conversation_id", "metric_run_id"];
            isOneToOne: false;
            referencedRelation: "metric_runs";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
          {
            foreignKeyName: "analysis_runs_transcription_fk";
            columns: ["organization_id", "conversation_id", "source_transcription_run_id"];
            isOneToOne: false;
            referencedRelation: "transcription_runs";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
        ];
      };
      check_definitions: {
        Row: {
          active: boolean;
          applicability: string;
          created_at: string;
          created_by_membership_id: string | null;
          description: string;
          evaluation_strategy: string;
          id: string;
          is_starter: boolean;
          key: string;
          name: string;
          observation_types: string[];
          organization_id: string;
          phrase: string | null;
          purpose: string;
          supersedes_definition_id: string | null;
          version: number;
          weight: number | null;
        };
        Insert: {
          active?: boolean;
          applicability: string;
          created_at?: string;
          created_by_membership_id?: string | null;
          description: string;
          evaluation_strategy: string;
          id?: string;
          is_starter?: boolean;
          key: string;
          name: string;
          observation_types?: string[];
          organization_id: string;
          phrase?: string | null;
          purpose: string;
          supersedes_definition_id?: string | null;
          version?: number;
          weight?: number | null;
        };
        Update: {
          active?: boolean;
          applicability?: string;
          created_at?: string;
          created_by_membership_id?: string | null;
          description?: string;
          evaluation_strategy?: string;
          id?: string;
          is_starter?: boolean;
          key?: string;
          name?: string;
          observation_types?: string[];
          organization_id?: string;
          phrase?: string | null;
          purpose?: string;
          supersedes_definition_id?: string | null;
          version?: number;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "check_definitions_created_by_membership_id_fkey";
            columns: ["created_by_membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "check_definitions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "check_definitions_supersedes_definition_id_fkey";
            columns: ["supersedes_definition_id"];
            isOneToOne: false;
            referencedRelation: "check_definitions";
            referencedColumns: ["id"];
          },
        ];
      };
      check_evaluations: {
        Row: {
          analysis_run_id: string;
          applicability_reason: string | null;
          check_definition_id: string;
          conversation_id: string;
          created_at: string;
          evaluation_version: string;
          evidence_group_id: string | null;
          explanation: string;
          id: string;
          organization_id: string;
          result_state: string;
        };
        Insert: {
          analysis_run_id: string;
          applicability_reason?: string | null;
          check_definition_id: string;
          conversation_id: string;
          created_at?: string;
          evaluation_version?: string;
          evidence_group_id?: string | null;
          explanation: string;
          id?: string;
          organization_id: string;
          result_state: string;
        };
        Update: {
          analysis_run_id?: string;
          applicability_reason?: string | null;
          check_definition_id?: string;
          conversation_id?: string;
          created_at?: string;
          evaluation_version?: string;
          evidence_group_id?: string | null;
          explanation?: string;
          id?: string;
          organization_id?: string;
          result_state?: string;
        };
        Relationships: [
          {
            foreignKeyName: "check_evaluations_organization_id_check_definition_id_fkey";
            columns: ["organization_id", "check_definition_id"];
            isOneToOne: false;
            referencedRelation: "check_definitions";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "check_evaluations_organization_id_conversation_id_analysis_fkey";
            columns: ["organization_id", "conversation_id", "analysis_run_id"];
            isOneToOne: false;
            referencedRelation: "analysis_runs";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
          {
            foreignKeyName: "check_evaluations_organization_id_conversation_id_evidence_fkey";
            columns: ["organization_id", "conversation_id", "evidence_group_id"];
            isOneToOne: false;
            referencedRelation: "evidence_groups";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
        ];
      };
      consent_records: {
        Row: {
          capture_method: Database["public"]["Enums"]["consent_capture_method"];
          captured_at: string;
          captured_by_membership_id: string;
          conversation_id: string;
          created_at: string;
          evidence_metadata: Json;
          id: string;
          organization_id: string;
          participant_id: string | null;
          status: Database["public"]["Enums"]["consent_status"];
        };
        Insert: {
          capture_method: Database["public"]["Enums"]["consent_capture_method"];
          captured_at: string;
          captured_by_membership_id: string;
          conversation_id: string;
          created_at?: string;
          evidence_metadata?: Json;
          id?: string;
          organization_id: string;
          participant_id?: string | null;
          status: Database["public"]["Enums"]["consent_status"];
        };
        Update: {
          capture_method?: Database["public"]["Enums"]["consent_capture_method"];
          captured_at?: string;
          captured_by_membership_id?: string;
          conversation_id?: string;
          created_at?: string;
          evidence_metadata?: Json;
          id?: string;
          organization_id?: string;
          participant_id?: string | null;
          status?: Database["public"]["Enums"]["consent_status"];
        };
        Relationships: [
          {
            foreignKeyName: "consent_records_captured_by_fk";
            columns: ["organization_id", "captured_by_membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "consent_records_conversation_fk";
            columns: ["organization_id", "conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "consent_records_participant_fk";
            columns: ["organization_id", "conversation_id", "participant_id"];
            isOneToOne: false;
            referencedRelation: "conversation_participants";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
        ];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          created_at: string;
          display_label: string | null;
          id: string;
          membership_id: string | null;
          organization_id: string;
          role: Database["public"]["Enums"]["participant_role"];
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          display_label?: string | null;
          id?: string;
          membership_id?: string | null;
          organization_id: string;
          role: Database["public"]["Enums"]["participant_role"];
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          display_label?: string | null;
          id?: string;
          membership_id?: string | null;
          organization_id?: string;
          role?: Database["public"]["Enums"]["participant_role"];
        };
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_fk";
            columns: ["organization_id", "conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "conversation_participants_membership_fk";
            columns: ["organization_id", "membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["organization_id", "id"];
          },
        ];
      };
      conversation_quality_assessments: {
        Row: {
          analysis_run_id: string | null;
          analytics_eligible: boolean | null;
          audio_quality: Database["public"]["Enums"]["quality_state"];
          benchmark_eligible: boolean | null;
          conversation_id: string;
          created_at: string;
          diarization_quality: Database["public"]["Enums"]["quality_state"];
          exclusion_reason: string | null;
          id: string;
          organization_id: string;
          outcome_comparison_eligible: boolean | null;
          policy_version: string;
          producer: string;
          producer_version: string;
          provenance_metadata: Json;
          review_state: Database["public"]["Enums"]["review_state"];
          semantic_analysis_quality: Database["public"]["Enums"]["quality_state"];
          speaker_mapping_quality: Database["public"]["Enums"]["quality_state"];
          speaker_mapping_version_id: string | null;
          transcription_quality: Database["public"]["Enums"]["quality_state"];
          transcription_run_id: string | null;
        };
        Insert: {
          analysis_run_id?: string | null;
          analytics_eligible?: boolean | null;
          audio_quality?: Database["public"]["Enums"]["quality_state"];
          benchmark_eligible?: boolean | null;
          conversation_id: string;
          created_at?: string;
          diarization_quality?: Database["public"]["Enums"]["quality_state"];
          exclusion_reason?: string | null;
          id?: string;
          organization_id: string;
          outcome_comparison_eligible?: boolean | null;
          policy_version: string;
          producer: string;
          producer_version: string;
          provenance_metadata?: Json;
          review_state?: Database["public"]["Enums"]["review_state"];
          semantic_analysis_quality?: Database["public"]["Enums"]["quality_state"];
          speaker_mapping_quality?: Database["public"]["Enums"]["quality_state"];
          speaker_mapping_version_id?: string | null;
          transcription_quality?: Database["public"]["Enums"]["quality_state"];
          transcription_run_id?: string | null;
        };
        Update: {
          analysis_run_id?: string | null;
          analytics_eligible?: boolean | null;
          audio_quality?: Database["public"]["Enums"]["quality_state"];
          benchmark_eligible?: boolean | null;
          conversation_id?: string;
          created_at?: string;
          diarization_quality?: Database["public"]["Enums"]["quality_state"];
          exclusion_reason?: string | null;
          id?: string;
          organization_id?: string;
          outcome_comparison_eligible?: boolean | null;
          policy_version?: string;
          producer?: string;
          producer_version?: string;
          provenance_metadata?: Json;
          review_state?: Database["public"]["Enums"]["review_state"];
          semantic_analysis_quality?: Database["public"]["Enums"]["quality_state"];
          speaker_mapping_quality?: Database["public"]["Enums"]["quality_state"];
          speaker_mapping_version_id?: string | null;
          transcription_quality?: Database["public"]["Enums"]["quality_state"];
          transcription_run_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quality_assessments_analysis_fk";
            columns: [
              "organization_id",
              "conversation_id",
              "transcription_run_id",
              "analysis_run_id",
            ];
            isOneToOne: false;
            referencedRelation: "analysis_runs";
            referencedColumns: [
              "organization_id",
              "conversation_id",
              "source_transcription_run_id",
              "id",
            ];
          },
          {
            foreignKeyName: "quality_assessments_conversation_fk";
            columns: ["organization_id", "conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "quality_assessments_mapping_fk";
            columns: [
              "organization_id",
              "conversation_id",
              "transcription_run_id",
              "speaker_mapping_version_id",
            ];
            isOneToOne: false;
            referencedRelation: "speaker_mapping_versions";
            referencedColumns: ["organization_id", "conversation_id", "transcription_run_id", "id"];
          },
          {
            foreignKeyName: "quality_assessments_transcription_fk";
            columns: ["organization_id", "conversation_id", "transcription_run_id"];
            isOneToOne: false;
            referencedRelation: "transcription_runs";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
        ];
      };
      conversations: {
        Row: {
          active_analysis_run_id: string | null;
          active_speaker_mapping_version_id: string | null;
          active_transcription_run_id: string | null;
          created_at: string;
          created_by_membership_id: string;
          ended_at: string | null;
          id: string;
          lifecycle_status: Database["public"]["Enums"]["conversation_status"];
          location_id: string | null;
          organization_id: string;
          representative_membership_id: string;
          started_at: string;
          team_id: string | null;
          title: string | null;
          updated_at: string;
          vertical: Database["public"]["Enums"]["conversation_vertical"];
        };
        Insert: {
          active_analysis_run_id?: string | null;
          active_speaker_mapping_version_id?: string | null;
          active_transcription_run_id?: string | null;
          created_at?: string;
          created_by_membership_id: string;
          ended_at?: string | null;
          id?: string;
          lifecycle_status?: Database["public"]["Enums"]["conversation_status"];
          location_id?: string | null;
          organization_id: string;
          representative_membership_id: string;
          started_at: string;
          team_id?: string | null;
          title?: string | null;
          updated_at?: string;
          vertical: Database["public"]["Enums"]["conversation_vertical"];
        };
        Update: {
          active_analysis_run_id?: string | null;
          active_speaker_mapping_version_id?: string | null;
          active_transcription_run_id?: string | null;
          created_at?: string;
          created_by_membership_id?: string;
          ended_at?: string | null;
          id?: string;
          lifecycle_status?: Database["public"]["Enums"]["conversation_status"];
          location_id?: string | null;
          organization_id?: string;
          representative_membership_id?: string;
          started_at?: string;
          team_id?: string | null;
          title?: string | null;
          updated_at?: string;
          vertical?: Database["public"]["Enums"]["conversation_vertical"];
        };
        Relationships: [
          {
            foreignKeyName: "conversations_active_analysis_fk";
            columns: ["organization_id", "id", "active_analysis_run_id"];
            isOneToOne: false;
            referencedRelation: "analysis_runs";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
          {
            foreignKeyName: "conversations_active_mapping_fk";
            columns: ["organization_id", "id", "active_speaker_mapping_version_id"];
            isOneToOne: false;
            referencedRelation: "speaker_mapping_versions";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
          {
            foreignKeyName: "conversations_active_transcription_fk";
            columns: ["organization_id", "id", "active_transcription_run_id"];
            isOneToOne: false;
            referencedRelation: "transcription_runs";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
          {
            foreignKeyName: "conversations_creator_fk";
            columns: ["organization_id", "created_by_membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "conversations_location_fk";
            columns: ["organization_id", "location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "conversations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_representative_fk";
            columns: ["organization_id", "representative_membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "conversations_team_fk";
            columns: ["organization_id", "team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["organization_id", "id"];
          },
        ];
      };
      evidence_groups: {
        Row: {
          conversation_id: string;
          created_at: string;
          created_by_membership_id: string | null;
          id: string;
          organization_id: string;
          purpose: string;
          source_analysis_run_id: string | null;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          created_by_membership_id?: string | null;
          id?: string;
          organization_id: string;
          purpose: string;
          source_analysis_run_id?: string | null;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          created_by_membership_id?: string | null;
          id?: string;
          organization_id?: string;
          purpose?: string;
          source_analysis_run_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "evidence_groups_analysis_fk";
            columns: ["organization_id", "conversation_id", "source_analysis_run_id"];
            isOneToOne: false;
            referencedRelation: "analysis_runs";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
          {
            foreignKeyName: "evidence_groups_conversation_fk";
            columns: ["organization_id", "conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "evidence_groups_creator_fk";
            columns: ["organization_id", "created_by_membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["organization_id", "id"];
          },
        ];
      };
      evidence_references: {
        Row: {
          conversation_id: string;
          created_at: string;
          end_milliseconds: number | null;
          evidence_group_id: string;
          excerpt_checksum_sha256: string | null;
          id: string;
          organization_id: string;
          sequence_number: number;
          start_milliseconds: number | null;
          transcript_segment_id: string;
          transcription_run_id: string;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          end_milliseconds?: number | null;
          evidence_group_id: string;
          excerpt_checksum_sha256?: string | null;
          id?: string;
          organization_id: string;
          sequence_number: number;
          start_milliseconds?: number | null;
          transcript_segment_id: string;
          transcription_run_id: string;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          end_milliseconds?: number | null;
          evidence_group_id?: string;
          excerpt_checksum_sha256?: string | null;
          id?: string;
          organization_id?: string;
          sequence_number?: number;
          start_milliseconds?: number | null;
          transcript_segment_id?: string;
          transcription_run_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evidence_references_group_fk";
            columns: ["organization_id", "conversation_id", "evidence_group_id"];
            isOneToOne: false;
            referencedRelation: "evidence_groups";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
          {
            foreignKeyName: "evidence_references_segment_fk";
            columns: [
              "organization_id",
              "conversation_id",
              "transcription_run_id",
              "transcript_segment_id",
            ];
            isOneToOne: false;
            referencedRelation: "transcript_segments";
            referencedColumns: ["organization_id", "conversation_id", "transcription_run_id", "id"];
          },
        ];
      };
      locations: {
        Row: {
          business_code: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          location_type: Database["public"]["Enums"]["location_type"];
          name: string;
          organization_id: string;
          timezone: string | null;
          updated_at: string;
        };
        Insert: {
          business_code?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          location_type?: Database["public"]["Enums"]["location_type"];
          name: string;
          organization_id: string;
          timezone?: string | null;
          updated_at?: string;
        };
        Update: {
          business_code?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          location_type?: Database["public"]["Enums"]["location_type"];
          name?: string;
          organization_id?: string;
          timezone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      member_assignments: {
        Row: {
          created_at: string;
          effective_from: string;
          effective_to: string | null;
          id: string;
          location_id: string | null;
          membership_id: string;
          organization_id: string;
          team_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          effective_from?: string;
          effective_to?: string | null;
          id?: string;
          location_id?: string | null;
          membership_id: string;
          organization_id: string;
          team_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          effective_from?: string;
          effective_to?: string | null;
          id?: string;
          location_id?: string | null;
          membership_id?: string;
          organization_id?: string;
          team_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "member_assignments_location_fk";
            columns: ["organization_id", "location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "member_assignments_membership_fk";
            columns: ["organization_id", "membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "member_assignments_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "member_assignments_team_fk";
            columns: ["organization_id", "team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["organization_id", "id"];
          },
        ];
      };
      metric_runs: {
        Row: {
          algorithm_version: string;
          conversation_id: string;
          created_at: string;
          id: string;
          organization_id: string;
          source_transcription_run_id: string;
          speaker_mapping_version_id: string;
        };
        Insert: {
          algorithm_version: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          organization_id: string;
          source_transcription_run_id: string;
          speaker_mapping_version_id: string;
        };
        Update: {
          algorithm_version?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          organization_id?: string;
          source_transcription_run_id?: string;
          speaker_mapping_version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "metric_runs_organization_id_conversation_id_source_transc_fkey1";
            columns: [
              "organization_id",
              "conversation_id",
              "source_transcription_run_id",
              "speaker_mapping_version_id",
            ];
            isOneToOne: false;
            referencedRelation: "speaker_mapping_versions";
            referencedColumns: ["organization_id", "conversation_id", "transcription_run_id", "id"];
          },
          {
            foreignKeyName: "metric_runs_organization_id_conversation_id_source_transcr_fkey";
            columns: ["organization_id", "conversation_id", "source_transcription_run_id"];
            isOneToOne: false;
            referencedRelation: "transcription_runs";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
        ];
      };
      metric_values: {
        Row: {
          conversation_id: string;
          created_at: string;
          id: string;
          metric_key: string;
          metric_run_id: string;
          numeric_value: number;
          organization_id: string;
          unit: string;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          id?: string;
          metric_key: string;
          metric_run_id: string;
          numeric_value: number;
          organization_id: string;
          unit: string;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          id?: string;
          metric_key?: string;
          metric_run_id?: string;
          numeric_value?: number;
          organization_id?: string;
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "metric_values_organization_id_conversation_id_metric_run_i_fkey";
            columns: ["organization_id", "conversation_id", "metric_run_id"];
            isOneToOne: false;
            referencedRelation: "metric_runs";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
        ];
      };
      observation_corrections: {
        Row: {
          conversation_id: string;
          created_at: string;
          id: string;
          observation_id: string;
          organization_id: string;
          proposed_by_membership_id: string;
          proposed_value: Json;
          reason: string | null;
          review_state: Database["public"]["Enums"]["review_state"];
          reviewed_at: string | null;
          reviewed_by_membership_id: string | null;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          id?: string;
          observation_id: string;
          organization_id: string;
          proposed_by_membership_id: string;
          proposed_value: Json;
          reason?: string | null;
          review_state?: Database["public"]["Enums"]["review_state"];
          reviewed_at?: string | null;
          reviewed_by_membership_id?: string | null;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          id?: string;
          observation_id?: string;
          organization_id?: string;
          proposed_by_membership_id?: string;
          proposed_value?: Json;
          reason?: string | null;
          review_state?: Database["public"]["Enums"]["review_state"];
          reviewed_at?: string | null;
          reviewed_by_membership_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "observation_corrections_organization_id_conversation_id_ob_fkey";
            columns: ["organization_id", "conversation_id", "observation_id"];
            isOneToOne: false;
            referencedRelation: "structured_observations";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
          {
            foreignKeyName: "observation_corrections_organization_id_proposed_by_member_fkey";
            columns: ["organization_id", "proposed_by_membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "observation_corrections_organization_id_reviewed_by_member_fkey";
            columns: ["organization_id", "reviewed_by_membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["organization_id", "id"];
          },
        ];
      };
      organization_memberships: {
        Row: {
          created_at: string;
          id: string;
          organization_id: string;
          role: Database["public"]["Enums"]["membership_role"];
          status: Database["public"]["Enums"]["membership_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organization_id: string;
          role: Database["public"]["Enums"]["membership_role"];
          status?: Database["public"]["Enums"]["membership_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          organization_id?: string;
          role?: Database["public"]["Enums"]["membership_role"];
          status?: Database["public"]["Enums"]["membership_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          country_code: string;
          created_at: string;
          default_currency: string;
          id: string;
          name: string;
          slug: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          country_code?: string;
          created_at?: string;
          default_currency?: string;
          id?: string;
          name: string;
          slug: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          country_code?: string;
          created_at?: string;
          default_currency?: string;
          id?: string;
          name?: string;
          slug?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      outcome_events: {
        Row: {
          conversation_id: string;
          created_at: string;
          created_by_membership_id: string;
          currency_code: string | null;
          event_type: string;
          external_reference: string | null;
          id: string;
          occurred_at: string;
          organization_id: string;
          source: Database["public"]["Enums"]["outcome_source"];
          value_amount_minor: number | null;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          created_by_membership_id: string;
          currency_code?: string | null;
          event_type: string;
          external_reference?: string | null;
          id?: string;
          occurred_at: string;
          organization_id: string;
          source?: Database["public"]["Enums"]["outcome_source"];
          value_amount_minor?: number | null;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          created_by_membership_id?: string;
          currency_code?: string | null;
          event_type?: string;
          external_reference?: string | null;
          id?: string;
          occurred_at?: string;
          organization_id?: string;
          source?: Database["public"]["Enums"]["outcome_source"];
          value_amount_minor?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "outcome_events_conversation_fk";
            columns: ["organization_id", "conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "outcome_events_creator_fk";
            columns: ["organization_id", "created_by_membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["organization_id", "id"];
          },
        ];
      };
      recordings: {
        Row: {
          capture_source: string;
          checksum_sha256: string | null;
          conversation_id: string;
          created_at: string;
          created_by_membership_id: string;
          duration_milliseconds: number | null;
          file_size_bytes: number;
          finalized_at: string | null;
          id: string;
          mime_type: string;
          organization_id: string;
          original_filename: string | null;
          status: Database["public"]["Enums"]["recording_status"];
          storage_bucket: string;
          storage_object_path: string;
          updated_at: string;
        };
        Insert: {
          capture_source?: string;
          checksum_sha256?: string | null;
          conversation_id: string;
          created_at?: string;
          created_by_membership_id: string;
          duration_milliseconds?: number | null;
          file_size_bytes: number;
          finalized_at?: string | null;
          id?: string;
          mime_type: string;
          organization_id: string;
          original_filename?: string | null;
          status?: Database["public"]["Enums"]["recording_status"];
          storage_bucket?: string;
          storage_object_path: string;
          updated_at?: string;
        };
        Update: {
          capture_source?: string;
          checksum_sha256?: string | null;
          conversation_id?: string;
          created_at?: string;
          created_by_membership_id?: string;
          duration_milliseconds?: number | null;
          file_size_bytes?: number;
          finalized_at?: string | null;
          id?: string;
          mime_type?: string;
          organization_id?: string;
          original_filename?: string | null;
          status?: Database["public"]["Enums"]["recording_status"];
          storage_bucket?: string;
          storage_object_path?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recordings_conversation_fk";
            columns: ["organization_id", "conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "recordings_created_by_fk";
            columns: ["organization_id", "created_by_membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["organization_id", "id"];
          },
        ];
      };
      scorecard_definitions: {
        Row: {
          active: boolean;
          check_definition_ids: string[];
          created_at: string;
          created_by_membership_id: string | null;
          id: string;
          key: string;
          name: string;
          organization_id: string;
          version: number;
        };
        Insert: {
          active?: boolean;
          check_definition_ids: string[];
          created_at?: string;
          created_by_membership_id?: string | null;
          id?: string;
          key: string;
          name: string;
          organization_id: string;
          version?: number;
        };
        Update: {
          active?: boolean;
          check_definition_ids?: string[];
          created_at?: string;
          created_by_membership_id?: string | null;
          id?: string;
          key?: string;
          name?: string;
          organization_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "scorecard_definitions_created_by_membership_id_fkey";
            columns: ["created_by_membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scorecard_definitions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      scorecard_evaluations: {
        Row: {
          analysis_run_id: string;
          applicable_check_count: number;
          conversation_id: string;
          created_at: string;
          evaluated_check_count: number;
          evaluation_version: string;
          id: string;
          insufficient_evidence_count: number;
          organization_id: string;
          score_percent: number | null;
          scorecard_definition_id: string;
        };
        Insert: {
          analysis_run_id: string;
          applicable_check_count?: number;
          conversation_id: string;
          created_at?: string;
          evaluated_check_count?: number;
          evaluation_version?: string;
          id?: string;
          insufficient_evidence_count?: number;
          organization_id: string;
          score_percent?: number | null;
          scorecard_definition_id: string;
        };
        Update: {
          analysis_run_id?: string;
          applicable_check_count?: number;
          conversation_id?: string;
          created_at?: string;
          evaluated_check_count?: number;
          evaluation_version?: string;
          id?: string;
          insufficient_evidence_count?: number;
          organization_id?: string;
          score_percent?: number | null;
          scorecard_definition_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scorecard_evaluations_organization_id_conversation_id_anal_fkey";
            columns: ["organization_id", "conversation_id", "analysis_run_id"];
            isOneToOne: false;
            referencedRelation: "analysis_runs";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
          {
            foreignKeyName: "scorecard_evaluations_organization_id_scorecard_definition_fkey";
            columns: ["organization_id", "scorecard_definition_id"];
            isOneToOne: false;
            referencedRelation: "scorecard_definitions";
            referencedColumns: ["organization_id", "id"];
          },
        ];
      };
      speaker_mapping_entries: {
        Row: {
          conversation_id: string;
          created_at: string;
          id: string;
          organization_id: string;
          participant_id: string | null;
          participant_role: Database["public"]["Enums"]["participant_role"];
          provider_speaker_identifier: string;
          speaker_mapping_version_id: string;
          transcription_run_id: string;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          id?: string;
          organization_id: string;
          participant_id?: string | null;
          participant_role: Database["public"]["Enums"]["participant_role"];
          provider_speaker_identifier: string;
          speaker_mapping_version_id: string;
          transcription_run_id: string;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          id?: string;
          organization_id?: string;
          participant_id?: string | null;
          participant_role?: Database["public"]["Enums"]["participant_role"];
          provider_speaker_identifier?: string;
          speaker_mapping_version_id?: string;
          transcription_run_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "speaker_mapping_entries_participant_fk";
            columns: ["organization_id", "conversation_id", "participant_id"];
            isOneToOne: false;
            referencedRelation: "conversation_participants";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
          {
            foreignKeyName: "speaker_mapping_entries_version_fk";
            columns: [
              "organization_id",
              "conversation_id",
              "transcription_run_id",
              "speaker_mapping_version_id",
            ];
            isOneToOne: false;
            referencedRelation: "speaker_mapping_versions";
            referencedColumns: ["organization_id", "conversation_id", "transcription_run_id", "id"];
          },
        ];
      };
      speaker_mapping_versions: {
        Row: {
          conversation_id: string;
          created_at: string;
          created_by_membership_id: string | null;
          id: string;
          organization_id: string;
          reason: string | null;
          source: Database["public"]["Enums"]["speaker_mapping_source"];
          status: Database["public"]["Enums"]["speaker_mapping_status"];
          transcription_run_id: string;
          version_number: number;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          created_by_membership_id?: string | null;
          id?: string;
          organization_id: string;
          reason?: string | null;
          source: Database["public"]["Enums"]["speaker_mapping_source"];
          status?: Database["public"]["Enums"]["speaker_mapping_status"];
          transcription_run_id: string;
          version_number: number;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          created_by_membership_id?: string | null;
          id?: string;
          organization_id?: string;
          reason?: string | null;
          source?: Database["public"]["Enums"]["speaker_mapping_source"];
          status?: Database["public"]["Enums"]["speaker_mapping_status"];
          transcription_run_id?: string;
          version_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "speaker_mapping_versions_creator_fk";
            columns: ["organization_id", "created_by_membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "speaker_mapping_versions_run_fk";
            columns: ["organization_id", "conversation_id", "transcription_run_id"];
            isOneToOne: false;
            referencedRelation: "transcription_runs";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
        ];
      };
      structured_observations: {
        Row: {
          analysis_run_id: string;
          attributes: Json;
          conversation_id: string;
          created_at: string;
          currency_code: string | null;
          evidence_group_id: string;
          id: string;
          normalized_key: string;
          observation_type: string;
          organization_id: string;
          original_model_value: Json;
          value_amount_minor: number | null;
          value_text: string | null;
        };
        Insert: {
          analysis_run_id: string;
          attributes?: Json;
          conversation_id: string;
          created_at?: string;
          currency_code?: string | null;
          evidence_group_id: string;
          id?: string;
          normalized_key: string;
          observation_type: string;
          organization_id: string;
          original_model_value: Json;
          value_amount_minor?: number | null;
          value_text?: string | null;
        };
        Update: {
          analysis_run_id?: string;
          attributes?: Json;
          conversation_id?: string;
          created_at?: string;
          currency_code?: string | null;
          evidence_group_id?: string;
          id?: string;
          normalized_key?: string;
          observation_type?: string;
          organization_id?: string;
          original_model_value?: Json;
          value_amount_minor?: number | null;
          value_text?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "observations_analysis_fk";
            columns: ["organization_id", "conversation_id", "analysis_run_id"];
            isOneToOne: false;
            referencedRelation: "analysis_runs";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
          {
            foreignKeyName: "observations_evidence_fk";
            columns: ["organization_id", "conversation_id", "evidence_group_id"];
            isOneToOne: false;
            referencedRelation: "evidence_groups";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          organization_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          organization_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          organization_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      transcript_segments: {
        Row: {
          confidence: number | null;
          conversation_id: string;
          created_at: string;
          detected_languages: string[];
          end_milliseconds: number;
          id: string;
          organization_id: string;
          original_text: string;
          provider_speaker_identifier: string | null;
          sequence_number: number;
          start_milliseconds: number;
          transcription_run_id: string;
        };
        Insert: {
          confidence?: number | null;
          conversation_id: string;
          created_at?: string;
          detected_languages?: string[];
          end_milliseconds: number;
          id?: string;
          organization_id: string;
          original_text: string;
          provider_speaker_identifier?: string | null;
          sequence_number: number;
          start_milliseconds: number;
          transcription_run_id: string;
        };
        Update: {
          confidence?: number | null;
          conversation_id?: string;
          created_at?: string;
          detected_languages?: string[];
          end_milliseconds?: number;
          id?: string;
          organization_id?: string;
          original_text?: string;
          provider_speaker_identifier?: string | null;
          sequence_number?: number;
          start_milliseconds?: number;
          transcription_run_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transcript_segments_run_fk";
            columns: ["organization_id", "conversation_id", "transcription_run_id"];
            isOneToOne: false;
            referencedRelation: "transcription_runs";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
        ];
      };
      transcription_runs: {
        Row: {
          completed_at: string | null;
          conversation_id: string;
          cost_currency: string | null;
          cost_minor: number | null;
          created_at: string;
          error_code: string | null;
          error_message: string | null;
          id: string;
          latency_milliseconds: number | null;
          model: string;
          organization_id: string;
          provider: string;
          provider_metadata: Json;
          provider_model_version: string | null;
          provider_request_id: string | null;
          recording_id: string;
          requested_by_membership_id: string | null;
          requested_language_mode: string | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["run_status"];
          workflow_run_id: string | null;
        };
        Insert: {
          completed_at?: string | null;
          conversation_id: string;
          cost_currency?: string | null;
          cost_minor?: number | null;
          created_at?: string;
          error_code?: string | null;
          error_message?: string | null;
          id?: string;
          latency_milliseconds?: number | null;
          model: string;
          organization_id: string;
          provider: string;
          provider_metadata?: Json;
          provider_model_version?: string | null;
          provider_request_id?: string | null;
          recording_id: string;
          requested_by_membership_id?: string | null;
          requested_language_mode?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["run_status"];
          workflow_run_id?: string | null;
        };
        Update: {
          completed_at?: string | null;
          conversation_id?: string;
          cost_currency?: string | null;
          cost_minor?: number | null;
          created_at?: string;
          error_code?: string | null;
          error_message?: string | null;
          id?: string;
          latency_milliseconds?: number | null;
          model?: string;
          organization_id?: string;
          provider?: string;
          provider_metadata?: Json;
          provider_model_version?: string | null;
          provider_request_id?: string | null;
          recording_id?: string;
          requested_by_membership_id?: string | null;
          requested_language_mode?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["run_status"];
          workflow_run_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transcription_runs_recording_fk";
            columns: ["organization_id", "conversation_id", "recording_id"];
            isOneToOne: false;
            referencedRelation: "recordings";
            referencedColumns: ["organization_id", "conversation_id", "id"];
          },
          {
            foreignKeyName: "transcription_runs_requested_by_fk";
            columns: ["organization_id", "requested_by_membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["organization_id", "id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      append_customer_recording_consent: {
        Args: {
          p_capture_method: Database["public"]["Enums"]["consent_capture_method"];
          p_conversation_id: string;
          p_status: Database["public"]["Enums"]["consent_status"];
        };
        Returns: string;
      };
      bootstrap_organization: {
        Args: {
          p_country_code?: string;
          p_default_currency?: string;
          p_name: string;
          p_timezone?: string;
        };
        Returns: {
          membership_id: string;
          organization_id: string;
        }[];
      };
      create_conversation_with_consent: {
        Args: {
          p_consent_capture_method?: Database["public"]["Enums"]["consent_capture_method"];
          p_consent_status?: Database["public"]["Enums"]["consent_status"];
          p_location_id?: string;
          p_organization_id: string;
          p_started_at: string;
          p_team_id?: string;
          p_title?: string;
          p_vertical: Database["public"]["Enums"]["conversation_vertical"];
        };
        Returns: string;
      };
      create_speaker_mapping_version: {
        Args: {
          p_entries: Json;
          p_reason?: string;
          p_transcription_run_id: string;
        };
        Returns: string;
      };
      finalize_recording_upload: {
        Args: { p_recording_id: string };
        Returns: undefined;
      };
      prepare_recording_upload: {
        Args: {
          p_capture_source: string;
          p_conversation_id: string;
          p_duration_milliseconds: number;
          p_file_size_bytes: number;
          p_mime_type: string;
          p_original_filename?: string;
        };
        Returns: {
          recording_id: string;
          storage_bucket: string;
          storage_object_path: string;
        }[];
      };
      propose_observation_correction: {
        Args: {
          p_observation_id: string;
          p_proposed_value: Json;
          p_reason?: string;
        };
        Returns: string;
      };
      request_interaction_understanding: {
        Args: { p_conversation_id: string };
        Returns: string;
      };
      request_transcription_run: {
        Args: { p_recording_id: string };
        Returns: string;
      };
      review_observation_correction: {
        Args: {
          p_correction_id: string;
          p_review_state: Database["public"]["Enums"]["review_state"];
        };
        Returns: undefined;
      };
      seed_starter_electronics_checks: {
        Args: { p_organization_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      consent_capture_method: "verbal" | "written" | "digital" | "imported" | "other";
      consent_status: "granted" | "declined" | "withdrawn" | "not_required" | "unknown";
      conversation_status:
        | "draft"
        | "ready_for_recording"
        | "processing"
        | "ready"
        | "partial"
        | "failed"
        | "archived";
      conversation_vertical: "electronics" | "automotive";
      location_type: "store" | "showroom" | "office" | "other";
      membership_role: "representative" | "manager" | "admin";
      membership_status: "active" | "inactive";
      outcome_source: "manual" | "import";
      participant_role:
        "representative" | "customer" | "additional_customer" | "manager" | "unknown";
      quality_state: "adequate" | "limited" | "insufficient" | "unknown" | "not_assessed";
      recording_status: "pending" | "uploading" | "uploaded" | "failed" | "deleted";
      review_state: "unreviewed" | "confirmed" | "needs_review" | "rejected";
      run_status: "pending" | "running" | "completed" | "failed" | "cancelled";
      speaker_mapping_source: "model" | "human" | "hybrid";
      speaker_mapping_status: "draft" | "active" | "superseded";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      consent_capture_method: ["verbal", "written", "digital", "imported", "other"],
      consent_status: ["granted", "declined", "withdrawn", "not_required", "unknown"],
      conversation_status: [
        "draft",
        "ready_for_recording",
        "processing",
        "ready",
        "partial",
        "failed",
        "archived",
      ],
      conversation_vertical: ["electronics", "automotive"],
      location_type: ["store", "showroom", "office", "other"],
      membership_role: ["representative", "manager", "admin"],
      membership_status: ["active", "inactive"],
      outcome_source: ["manual", "import"],
      participant_role: ["representative", "customer", "additional_customer", "manager", "unknown"],
      quality_state: ["adequate", "limited", "insufficient", "unknown", "not_assessed"],
      recording_status: ["pending", "uploading", "uploaded", "failed", "deleted"],
      review_state: ["unreviewed", "confirmed", "needs_review", "rejected"],
      run_status: ["pending", "running", "completed", "failed", "cancelled"],
      speaker_mapping_source: ["model", "human", "hybrid"],
      speaker_mapping_status: ["draft", "active", "superseded"],
    },
  },
} as const;
