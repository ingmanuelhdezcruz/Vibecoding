-- ============================================================
-- 009 · SKU, tipo de catálogo y disponibilidad
-- ------------------------------------------------------------
-- Adapta core_items a Productos para el hogar:
-- SKU numérico, tipo (Producto / Ofertas / Lo más vendido)
-- y disponibilidad (entrega inmediata / bajo pedido / no disponible).
-- No se renombra la tabla para no romper RLS ni las tools.
-- ============================================================

alter table public.core_items
  add column if not exists sku numeric,
  add column if not exists status text not null default 'entrega_inmediata',
  add column if not exists categoria text not null default 'producto';

-- Filas viejas: intenta leer un número del título; si no hay, usa 0.
update public.core_items
  set sku = coalesce(
    sku,
    nullif(regexp_replace(coalesce(title, ''), '[^0-9]', '', 'g'), '')::numeric,
    0
  )
  where sku is null;

alter table public.core_items
  alter column sku set default 0;

-- Postgres no permite IF NOT EXISTS en SET NOT NULL; es idempotente.
alter table public.core_items
  alter column sku set not null;

-- Tipo de entidad reutiliza `categoria`.
update public.core_items
  set categoria = 'producto'
  where categoria is null
     or categoria not in ('producto', 'ofertas', 'lo_mas_vendido');

alter table public.core_items
  alter column categoria set default 'producto';

-- Disponibilidad reutiliza `status`.
update public.core_items
  set status = 'entrega_inmediata'
  where status in ('disponible', 'active') or status is null;

update public.core_items
  set status = 'no_disponible'
  where status in ('agotado', 'done');

update public.core_items
  set status = 'bajo_pedido'
  where status in ('proximo', 'archived');

update public.core_items
  set status = 'entrega_inmediata'
  where status not in ('entrega_inmediata', 'bajo_pedido', 'no_disponible');

alter table public.core_items
  alter column status set default 'entrega_inmediata';

-- El título NOT NULL se sincroniza con el SKU desde la app.
update public.core_items
  set title = sku::text
  where title is null or title = '';

comment on table public.core_items is
  'Catálogo de productos para el hogar (Producto, Ofertas, Lo más vendido).';
comment on column public.core_items.sku is 'SKU numérico del artículo.';
comment on column public.core_items.title is 'Copia textual del SKU (columna requerida del CRUD genérico).';
comment on column public.core_items.description is 'Descripción del artículo.';
comment on column public.core_items.precio is 'Precio en MXN.';
comment on column public.core_items.categoria is
  'producto | ofertas | lo_mas_vendido';
comment on column public.core_items.status is
  'entrega_inmediata | bajo_pedido | no_disponible';
