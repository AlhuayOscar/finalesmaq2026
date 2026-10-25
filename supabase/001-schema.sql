create table if not exists public.maq_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email text not null, full_name text not null default '',
 role text not null default 'student' check(role in ('student','admin')),
 created_at timestamptz not null default now()
);
create table if not exists public.maq_exam_sessions (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 topic integer not null check(topic between -1 and 13), settings jsonb not null default '{}',
 baseline jsonb not null default '{}', summary jsonb,
 status text not null default 'active' check(status in ('active','finished')),
 created_at timestamptz not null default now(), finished_at timestamptz
);
create table if not exists public.maq_attempts (
 id text primary key, user_id uuid not null references auth.users(id) on delete cascade,
 session_id uuid not null references public.maq_exam_sessions(id) on delete cascade,
 question_id text not null, topic integer not null check(topic between 0 and 13),
 score numeric(4,2) not null check(score between 0 and 10),
 score_before_hint numeric(4,2) not null check(score_before_hint between 0 and 10),
 correct boolean not null, hint_used boolean not null default false,
 depth text not null, scope text not null, speed text not null,
 response_text text not null default '', feedback text not null default '',
 omissions jsonb not null default '[]', created_at timestamptz not null default now()
);
create index if not exists maq_attempts_user_question on public.maq_attempts(user_id,question_id,created_at desc);
create index if not exists maq_attempts_session on public.maq_attempts(session_id);
create index if not exists maq_sessions_user on public.maq_exam_sessions(user_id,created_at desc);
alter table public.maq_profiles enable row level security;
alter table public.maq_exam_sessions enable row level security;
alter table public.maq_attempts enable row level security;
revoke all on public.maq_profiles, public.maq_exam_sessions, public.maq_attempts from anon, authenticated;
grant select on public.maq_profiles, public.maq_exam_sessions, public.maq_attempts to authenticated;
grant all on public.maq_profiles, public.maq_exam_sessions, public.maq_attempts to service_role;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='maq_profiles' and policyname='maq_own_profile') then create policy maq_own_profile on public.maq_profiles for select to authenticated using(id=(select auth.uid())); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='maq_exam_sessions' and policyname='maq_own_sessions') then create policy maq_own_sessions on public.maq_exam_sessions for select to authenticated using(user_id=(select auth.uid())); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='maq_attempts' and policyname='maq_own_attempts') then create policy maq_own_attempts on public.maq_attempts for select to authenticated using(user_id=(select auth.uid())); end if;
end $$;
create or replace function public.maq_sync_profile() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 insert into public.maq_profiles(id,email,full_name,role)
 values(new.id,coalesce(new.email,''),left(coalesce(new.raw_user_meta_data->>'full_name',''),100),case when lower(new.email)='oscarcarlosalhuay@gmail.com' and new.email_confirmed_at is not null then 'admin' else 'student' end)
 on conflict(id) do update set email=excluded.email,full_name=excluded.full_name,
 role=case when lower(new.email)='oscarcarlosalhuay@gmail.com' and new.email_confirmed_at is not null then 'admin' else maq_profiles.role end;
 return new;
end $$;
do $$ begin
 if not exists(select 1 from pg_trigger where tgname='maq_profile_sync') then create trigger maq_profile_sync after insert or update of email,email_confirmed_at,raw_user_meta_data on auth.users for each row execute function public.maq_sync_profile(); end if;
end $$;
insert into public.maq_profiles(id,email,full_name,role)
select id,coalesce(email,''),left(coalesce(raw_user_meta_data->>'full_name',''),100),case when lower(email)='oscarcarlosalhuay@gmail.com' and email_confirmed_at is not null then 'admin' else 'student' end from auth.users
on conflict(id) do nothing;
create or replace function public.maq_get_progress(p_user_id uuid) returns jsonb language sql stable security invoker set search_path=public,pg_temp as $$
with mine as(select * from public.maq_attempts where user_id=p_user_id),
q as(select question_id,topic,count(*)::int attempts,round(avg(score),2) average,round(max(score),2) best,round(100.0*count(*) filter(where correct)/count(*),1) accuracy,max(created_at) last_attempt from mine group by question_id,topic),
t as(select topic,sum(attempts)::int attempts,round(sum(best)/80*100,2) mastery from q group by topic),
ts as(select topic,count(*)::int attempts,round(avg(score),2) average,round(100.0*count(*) filter(where correct)/count(*),1) accuracy from mine group by topic)
select jsonb_build_object(
 'attempts',(select count(*) from mine),
 'average',coalesce((select round(avg(score),2) from mine),0),
 'accuracy',coalesce((select round(100.0*count(*) filter(where correct)/nullif(count(*),0),1) from mine),0),
 'mastery',coalesce((select round(sum(best)/1120*100,2) from q),0),
 'practicedQuestions',(select count(*) from q), 'totalQuestions',112,
 'questions',coalesce((select jsonb_agg(to_jsonb(q) order by topic,question_id) from q),'[]'::jsonb),
 'topics',coalesce((select jsonb_agg(to_jsonb(ts)||jsonb_build_object('mastery',t.mastery) order by ts.topic) from ts join t using(topic)),'[]'::jsonb)
);
$$;
revoke all on function public.maq_get_progress(uuid) from public,anon,authenticated;
grant execute on function public.maq_get_progress(uuid) to service_role;
revoke all on function public.maq_sync_profile() from public,anon,authenticated;
notify pgrst, 'reload schema';
select 'Usuarios, sesiones, intentos y progreso configurados' as resultado;
