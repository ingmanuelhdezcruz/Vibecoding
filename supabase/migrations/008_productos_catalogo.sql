-- ============================================================
-- 008 · Catálogo de productos sobre core_items
-- ------------------------------------------------------------
-- Extiende el CRUD genérico para el catálogo Betterware:
-- precio, categoría y estatus de disponibilidad.
-- No se renombra la tabla para no romper RLS ni las tools.
-- ============================================================

alter table public.core_items
  add column if not exists precio numeric(10, 2),
  add column if not exists categoria text not null default 'hogar',
  add column if not exists status text not null default 'disponible';

alter table public.core_items
  alter column status set default 'disponible';

update public.core_items
  set status = 'disponible'
  where status in ('active', 'archived') or status is null;

update public.core_items
  set status = 'agotado'
  where status = 'done';

comment on table public.core_items is
  'Catálogo de productos Betterware por usuario (CRUD del MVP).';
comment on column public.core_items.title is 'Nombre del producto.';
comment on column public.core_items.precio is 'Precio en MXN.';
comment on column public.core_items.categoria is
  'cocina | limpieza | organizacion | cuidado_personal | hogar';
comment on column public.core_items.status is
  'disponible | agotado | proximo';
