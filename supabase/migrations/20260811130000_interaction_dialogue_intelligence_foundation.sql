-- Interaction Dialogue Intelligence Foundation. These rows are immutable
-- projections of one versioned analysis run; they never replace transcript evidence.
create table public.interaction_questions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  conversation_id uuid not null references public.conversations(id) on delete restrict,
  analysis_run_id uuid not null references public.analysis_runs(id) on delete restrict,
  speaker_role public.participant_role not null,
  normalized_topic text not null,
  question_text text not null,
  question_type text not null check (question_type in ('discovery','clarification','product_or_service_information','commercial','finance','comparison','process','objection_related','closing','other')),
  evidence_group_id uuid not null references public.evidence_groups(id) on delete restrict,
  created_at timestamptz not null default now()
);
create table public.interaction_question_responses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  conversation_id uuid not null references public.conversations(id) on delete restrict,
  analysis_run_id uuid not null references public.analysis_runs(id) on delete restrict,
  question_id uuid not null references public.interaction_questions(id) on delete restrict,
  responding_role public.participant_role,
  response_text text,
  response_state text not null check (response_state in ('answered','partially_answered','unanswered','uncertain')),
  rationale text,
  evidence_group_id uuid references public.evidence_groups(id) on delete restrict,
  created_at timestamptz not null default now(),
  check ((response_state in ('unanswered','uncertain')) or evidence_group_id is not null)
);
create table public.interaction_objections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  conversation_id uuid not null references public.conversations(id) on delete restrict,
  analysis_run_id uuid not null references public.analysis_runs(id) on delete restrict,
  speaker_role public.participant_role not null,
  objection_family text not null check (objection_family in ('price','value','product_or_service_fit','competitor','timing','trust','process','finance','availability_claim','policy','risk','other')),
  objection_text text not null,
  evidence_group_id uuid not null references public.evidence_groups(id) on delete restrict,
  created_at timestamptz not null default now()
);
create table public.interaction_objection_handlings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  conversation_id uuid not null references public.conversations(id) on delete restrict,
  analysis_run_id uuid not null references public.analysis_runs(id) on delete restrict,
  objection_id uuid not null references public.interaction_objections(id) on delete restrict,
  responding_role public.participant_role,
  response_text text,
  handling_state text not null check (handling_state in ('resolved','partially_resolved','unresolved','deferred','uncertain')),
  strategy text,
  rationale text,
  evidence_group_id uuid references public.evidence_groups(id) on delete restrict,
  created_at timestamptz not null default now(),
  check ((handling_state in ('unresolved','uncertain','deferred')) or evidence_group_id is not null)
);
create index interaction_questions_analysis_idx on public.interaction_questions(analysis_run_id, created_at);
create index interaction_question_responses_question_idx on public.interaction_question_responses(question_id, created_at);
create index interaction_objections_analysis_idx on public.interaction_objections(analysis_run_id, created_at);
create index interaction_objection_handlings_objection_idx on public.interaction_objection_handlings(objection_id, created_at);

alter table public.interaction_questions enable row level security;
alter table public.interaction_question_responses enable row level security;
alter table public.interaction_objections enable row level security;
alter table public.interaction_objection_handlings enable row level security;
create policy interaction_questions_conversation_read on public.interaction_questions for select to authenticated using ((select private.can_access_conversation(conversation_id)));
create policy interaction_question_responses_conversation_read on public.interaction_question_responses for select to authenticated using ((select private.can_access_conversation(conversation_id)));
create policy interaction_objections_conversation_read on public.interaction_objections for select to authenticated using ((select private.can_access_conversation(conversation_id)));
create policy interaction_objection_handlings_conversation_read on public.interaction_objection_handlings for select to authenticated using ((select private.can_access_conversation(conversation_id)));
grant select on public.interaction_questions, public.interaction_question_responses, public.interaction_objections, public.interaction_objection_handlings to authenticated;
grant all on public.interaction_questions, public.interaction_question_responses, public.interaction_objections, public.interaction_objection_handlings to service_role;

-- One atomic write keeps the metric lineage, observations, questions and objection
-- links retry-safe. The extraction is still a single provider call.
create function public.persist_interaction_intelligence_result(
  p_analysis_run_id uuid, p_metric_values jsonb, p_observations jsonb, p_questions jsonb, p_objections jsonb
) returns table(metric_run_id uuid, already_persisted boolean)
language plpgsql security definer set search_path = '' as $$
declare
  v_run public.analysis_runs%rowtype; v_metric_run_id uuid; v_item jsonb; v_group_id uuid; v_response_group_id uuid;
  v_segment_id uuid; v_sequence integer; v_metric jsonb; v_question_id uuid; v_objection_id uuid;
begin
  select * into v_run from public.analysis_runs where id=p_analysis_run_id for update;
  if not found then raise exception 'Analysis run was not found.' using errcode='P0002'; end if;
  if jsonb_typeof(p_metric_values)<>'array' or jsonb_typeof(p_observations)<>'array' or jsonb_typeof(p_questions)<>'array' or jsonb_typeof(p_objections)<>'array' then raise exception 'Interaction persistence payload must contain arrays.' using errcode='22023'; end if;
  if v_run.metric_run_id is not null then return query select v_run.metric_run_id, true; return; end if;
  insert into public.metric_runs(organization_id,conversation_id,source_transcription_run_id,speaker_mapping_version_id,algorithm_version) values(v_run.organization_id,v_run.conversation_id,v_run.source_transcription_run_id,v_run.speaker_mapping_version_id,'phase5.1.v1') returning id into v_metric_run_id;
  for v_metric in select value from jsonb_array_elements(p_metric_values) loop insert into public.metric_values(organization_id,conversation_id,metric_run_id,metric_key,numeric_value,unit) values(v_run.organization_id,v_run.conversation_id,v_metric_run_id,v_metric->>'metric_key',(v_metric->>'numeric_value')::numeric,v_metric->>'unit'); end loop;
  for v_item in select value from jsonb_array_elements(p_observations) loop
    insert into public.evidence_groups(organization_id,conversation_id,purpose,source_analysis_run_id) values(v_run.organization_id,v_run.conversation_id,'observation:'||(v_item->>'type'),p_analysis_run_id) returning id into v_group_id;
    v_sequence:=0; for v_segment_id in select value::uuid from jsonb_array_elements_text(v_item->'evidenceSegmentIds') loop
      insert into public.evidence_references(organization_id,conversation_id,evidence_group_id,transcription_run_id,transcript_segment_id,sequence_number,start_milliseconds,end_milliseconds) select v_run.organization_id,v_run.conversation_id,v_group_id,v_run.source_transcription_run_id,id,v_sequence,start_milliseconds,end_milliseconds from public.transcript_segments where id=v_segment_id and organization_id=v_run.organization_id and conversation_id=v_run.conversation_id and transcription_run_id=v_run.source_transcription_run_id;
      if not found then raise exception 'Observation evidence segment is not part of this source transcript.' using errcode='22023'; end if; v_sequence:=v_sequence+1;
    end loop;
    insert into public.structured_observations(organization_id,conversation_id,analysis_run_id,observation_type,normalized_key,value_text,value_amount_minor,currency_code,attributes,original_model_value,evidence_group_id) values(v_run.organization_id,v_run.conversation_id,p_analysis_run_id,v_item->>'type',v_item->>'key',nullif(v_item->>'text',''),nullif(v_item->>'amountMinor','')::bigint,case when nullif(v_item->>'amountMinor','') is null then null else nullif(v_item->>'currency','') end,coalesce(v_item->'attributes','{}'::jsonb),v_item,v_group_id);
  end loop;
  for v_item in select value from jsonb_array_elements(p_questions) loop
    insert into public.evidence_groups(organization_id,conversation_id,purpose,source_analysis_run_id) values(v_run.organization_id,v_run.conversation_id,'question',p_analysis_run_id) returning id into v_group_id;
    v_sequence:=0; for v_segment_id in select value::uuid from jsonb_array_elements_text(v_item->'evidenceSegmentIds') loop insert into public.evidence_references(organization_id,conversation_id,evidence_group_id,transcription_run_id,transcript_segment_id,sequence_number,start_milliseconds,end_milliseconds) select v_run.organization_id,v_run.conversation_id,v_group_id,v_run.source_transcription_run_id,id,v_sequence,start_milliseconds,end_milliseconds from public.transcript_segments where id=v_segment_id and organization_id=v_run.organization_id and conversation_id=v_run.conversation_id and transcription_run_id=v_run.source_transcription_run_id; if not found then raise exception 'Question evidence is not part of this source transcript.' using errcode='22023'; end if; v_sequence:=v_sequence+1; end loop;
    insert into public.interaction_questions(organization_id,conversation_id,analysis_run_id,speaker_role,normalized_topic,question_text,question_type,evidence_group_id) values(v_run.organization_id,v_run.conversation_id,p_analysis_run_id,(v_item->>'speakerRole')::public.participant_role,v_item->>'normalizedTopic',v_item->>'text',v_item->>'questionType',v_group_id) returning id into v_question_id;
    v_response_group_id:=null; if coalesce(jsonb_array_length(v_item->'response'->'evidenceSegmentIds'),0)>0 then insert into public.evidence_groups(organization_id,conversation_id,purpose,source_analysis_run_id) values(v_run.organization_id,v_run.conversation_id,'question_response',p_analysis_run_id) returning id into v_response_group_id; v_sequence:=0; for v_segment_id in select value::uuid from jsonb_array_elements_text(v_item->'response'->'evidenceSegmentIds') loop insert into public.evidence_references(organization_id,conversation_id,evidence_group_id,transcription_run_id,transcript_segment_id,sequence_number,start_milliseconds,end_milliseconds) select v_run.organization_id,v_run.conversation_id,v_response_group_id,v_run.source_transcription_run_id,id,v_sequence,start_milliseconds,end_milliseconds from public.transcript_segments where id=v_segment_id and organization_id=v_run.organization_id and conversation_id=v_run.conversation_id and transcription_run_id=v_run.source_transcription_run_id; if not found then raise exception 'Question response evidence is not part of this source transcript.' using errcode='22023'; end if; v_sequence:=v_sequence+1; end loop; end if;
    insert into public.interaction_question_responses(organization_id,conversation_id,analysis_run_id,question_id,responding_role,response_text,response_state,rationale,evidence_group_id) values(v_run.organization_id,v_run.conversation_id,p_analysis_run_id,v_question_id,nullif(v_item->'response'->>'speakerRole','')::public.participant_role,nullif(v_item->'response'->>'text',''),v_item->'response'->>'state',nullif(v_item->'response'->>'rationale',''),v_response_group_id);
  end loop;
  for v_item in select value from jsonb_array_elements(p_objections) loop
    insert into public.evidence_groups(organization_id,conversation_id,purpose,source_analysis_run_id) values(v_run.organization_id,v_run.conversation_id,'objection',p_analysis_run_id) returning id into v_group_id; v_sequence:=0; for v_segment_id in select value::uuid from jsonb_array_elements_text(v_item->'evidenceSegmentIds') loop insert into public.evidence_references(organization_id,conversation_id,evidence_group_id,transcription_run_id,transcript_segment_id,sequence_number,start_milliseconds,end_milliseconds) select v_run.organization_id,v_run.conversation_id,v_group_id,v_run.source_transcription_run_id,id,v_sequence,start_milliseconds,end_milliseconds from public.transcript_segments where id=v_segment_id and organization_id=v_run.organization_id and conversation_id=v_run.conversation_id and transcription_run_id=v_run.source_transcription_run_id; if not found then raise exception 'Objection evidence is not part of this source transcript.' using errcode='22023'; end if; v_sequence:=v_sequence+1; end loop;
    insert into public.interaction_objections(organization_id,conversation_id,analysis_run_id,speaker_role,objection_family,objection_text,evidence_group_id) values(v_run.organization_id,v_run.conversation_id,p_analysis_run_id,(v_item->>'speakerRole')::public.participant_role,v_item->>'family',v_item->>'text',v_group_id) returning id into v_objection_id;
    v_response_group_id:=null; if coalesce(jsonb_array_length(v_item->'handling'->'evidenceSegmentIds'),0)>0 then insert into public.evidence_groups(organization_id,conversation_id,purpose,source_analysis_run_id) values(v_run.organization_id,v_run.conversation_id,'objection_handling',p_analysis_run_id) returning id into v_response_group_id; v_sequence:=0; for v_segment_id in select value::uuid from jsonb_array_elements_text(v_item->'handling'->'evidenceSegmentIds') loop insert into public.evidence_references(organization_id,conversation_id,evidence_group_id,transcription_run_id,transcript_segment_id,sequence_number,start_milliseconds,end_milliseconds) select v_run.organization_id,v_run.conversation_id,v_response_group_id,v_run.source_transcription_run_id,id,v_sequence,start_milliseconds,end_milliseconds from public.transcript_segments where id=v_segment_id and organization_id=v_run.organization_id and conversation_id=v_run.conversation_id and transcription_run_id=v_run.source_transcription_run_id; if not found then raise exception 'Objection handling evidence is not part of this source transcript.' using errcode='22023'; end if; v_sequence:=v_sequence+1; end loop; end if;
    insert into public.interaction_objection_handlings(organization_id,conversation_id,analysis_run_id,objection_id,responding_role,response_text,handling_state,strategy,rationale,evidence_group_id) values(v_run.organization_id,v_run.conversation_id,p_analysis_run_id,v_objection_id,nullif(v_item->'handling'->>'speakerRole','')::public.participant_role,nullif(v_item->'handling'->>'text',''),v_item->'handling'->>'state',nullif(v_item->'handling'->>'strategy',''),nullif(v_item->'handling'->>'rationale',''),v_response_group_id);
  end loop;
  update public.analysis_runs set metric_run_id=v_metric_run_id where id=p_analysis_run_id;
  return query select v_metric_run_id,false;
end; $$;
revoke all on function public.persist_interaction_intelligence_result(uuid,jsonb,jsonb,jsonb,jsonb) from public;
grant execute on function public.persist_interaction_intelligence_result(uuid,jsonb,jsonb,jsonb,jsonb) to service_role;
