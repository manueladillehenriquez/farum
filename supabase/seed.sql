-- =====================================================================
-- FARUM · Datos iniciales del catálogo (estructura, sin precios)
--
-- No se inventan productos reales ni precios. Las categorías 1-4 llevan
-- entradas genéricas "próximamente" (sin precio, sin compra) que se
-- activan desde /admin cargando precio y cambiando el estado a
-- "disponible" — sin tocar código.
--
-- Es idempotente: se puede volver a ejecutar sin duplicar filas.
-- =====================================================================

insert into public.categories (slug, nombre, descripcion, orden, modo) values
  ('aseo',
   'Aseo',
   'Insumos y artículos de aseo para tu negocio, oficina o local.',
   1, 'venta'),
  ('infraestructura',
   'Infraestructura',
   'Artículos de ferretería en general para mantención y mejoras.',
   2, 'venta'),
  ('oficina',
   'Oficina',
   'Artículos y suministros de oficina para tu equipo.',
   3, 'venta'),
  ('tarjetas-sellos-credenciales',
   'Tarjetas, Sellos y Credenciales',
   'Sellos y timbres personalizados, tarjetas NFC y credenciales QR con tu marca.',
   4, 'venta'),
  ('servicios',
   'Servicios',
   'Servicios operativos para tu negocio. Cada uno se cotiza a medida.',
   5, 'cotizar')
on conflict (slug) do nothing;

-- Marcadores "próximamente" (sin precio, sin SKU, sin stock).
insert into public.products (category_id, nombre, descripcion, estado)
select c.id, v.nombre, v.descripcion, 'proximamente'
  from (values
    ('aseo',            'Insumos de aseo',                 null),
    ('infraestructura', 'Ferretería y herramientas',       null),
    ('oficina',         'Suministros de oficina',          null),
    ('tarjetas-sellos-credenciales', 'Sellos y timbres personalizados', 'Diseñados con tu marca.'),
    ('tarjetas-sellos-credenciales', 'Tarjetas NFC',       'Reseñas de Google, redes sociales o contacto.'),
    ('tarjetas-sellos-credenciales', 'Credenciales QR',    'Credenciales con código QR para tu equipo.')
  ) as v(categoria, nombre, descripcion)
  join public.categories c on c.slug = v.categoria
 where not exists (
   select 1 from public.products p
    where p.category_id = c.id and p.nombre = v.nombre
 );

-- Servicios: sin precio; el botón "Cotizar" abre WhatsApp.
insert into public.products (category_id, nombre, descripcion, estado)
select c.id, v.nombre, v.descripcion, 'disponible'
  from (values
    ('Jardinería',                      'Mantención y diseño de áreas verdes para locales, oficinas y condominios.'),
    ('Aseo',                            'Servicio de aseo para oficinas, locales comerciales y espacios comunes.'),
    ('Mantención de aire acondicionado','Limpieza, revisión y mantención preventiva de equipos de aire acondicionado.'),
    ('Gasfitería',                      'Reparaciones e instalaciones de gasfitería para tu negocio.'),
    ('Seguridad',                       'Soluciones de seguridad para tu local u oficina.')
  ) as v(nombre, descripcion)
  cross join (select id from public.categories where slug = 'servicios') c
 where not exists (
   select 1 from public.products p
    where p.category_id = c.id and p.nombre = v.nombre
 );
