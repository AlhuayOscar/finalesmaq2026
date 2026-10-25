alter table public.maq_attempts add column if not exists result jsonb;
notify pgrst, 'reload schema';
select 'Guardado idempotente de respuestas configurado' as resultado;
