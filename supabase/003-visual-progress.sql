create or replace function public.maq_get_progress(p_user_id uuid) returns jsonb language sql stable security invoker set search_path=public,pg_temp as $$
with mine as(select * from public.maq_attempts where user_id=p_user_id),
q as(select question_id,topic,count(*)::int attempts,round(avg(score),2) average,round(max(score),2) best,round(100.0*count(*) filter(where correct)/count(*),1) accuracy,max(created_at) last_attempt from mine group by question_id,topic),
t as(select topic,sum(attempts)::int attempts,round(sum(best)/(case topic when 1 then 130 when 4 then 90 else 80 end)*100,2) mastery from q group by topic),
ts as(select topic,count(*)::int attempts,round(avg(score),2) average,round(100.0*count(*) filter(where correct)/count(*),1) accuracy from mine group by topic)
select jsonb_build_object(
 'attempts',(select count(*) from mine),
 'average',coalesce((select round(avg(score),2) from mine),0),
 'accuracy',coalesce((select round(100.0*count(*) filter(where correct)/nullif(count(*),0),1) from mine),0),
 'mastery',coalesce((select round(sum(best)/1180*100,2) from q),0),
 'practicedQuestions',(select count(*) from q), 'totalQuestions',118,
 'questions',coalesce((select jsonb_agg(to_jsonb(q) order by topic,question_id) from q),'[]'::jsonb),
 'topics',coalesce((select jsonb_agg(to_jsonb(ts)||jsonb_build_object('mastery',t.mastery) order by ts.topic) from ts join t using(topic)),'[]'::jsonb)
);
$$;
revoke all on function public.maq_get_progress(uuid) from public,anon,authenticated;
grant execute on function public.maq_get_progress(uuid) to service_role;

notify pgrst, 'reload schema';
select 'Seis ejercicios visuales integrados al progreso; 118 preguntas' as resultado;