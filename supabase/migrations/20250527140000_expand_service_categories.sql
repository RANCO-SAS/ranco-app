insert into public.service_categories (slug, name, sort_order)
values
  ('transport', 'Transporte', 6),
  ('beauty', 'Belleza', 7),
  ('education', 'Educación', 8),
  ('events', 'Eventos', 9)
on conflict (slug) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order;

insert into public.service_subcategories (category_id, slug, name, sort_order)
select c.id, v.slug, v.name, v.sort_order
from public.service_categories c
join (
  values
    ('home', 'carpentry', 'Carpintería', 5),
    ('home', 'gardening', 'Jardinería', 6),
    ('home', 'masonry', 'Albañilería', 7),
    ('home', 'ac-install', 'Aire acondicionado', 8),
    ('home', 'home-organization', 'Organización del hogar', 9),
    ('repairs', 'locksmith', 'Cerrajería', 3),
    ('repairs', 'appliances', 'Electrodomésticos', 4),
    ('repairs', 'computer-repair', 'Reparación de equipos', 5),
    ('repairs', 'gas-install', 'Gas e instalaciones', 6),
    ('services', 'errands', 'Diligencias', 3),
    ('services', 'laundry', 'Lavandería y planchado', 4),
    ('services', 'tech-support', 'Soporte técnico', 5),
    ('services', 'photography', 'Fotografía y video', 6),
    ('services', 'sewing', 'Costura y arreglos', 7),
    ('care', 'elderly-care', 'Adultos mayores', 3),
    ('care', 'nursing', 'Acompañamiento y cuidados', 4),
    ('care', 'pet-grooming', 'Peluquería canina', 5),
    ('care', 'pet-training', 'Adiestramiento', 6),
    ('other', 'languages', 'Idiomas', 3),
    ('other', 'music-lessons', 'Música', 4),
    ('other', 'sports-training', 'Deportes y fitness', 5),
    ('other', 'driving-lessons', 'Clases de manejo', 6),
    ('transport', 'moving', 'Mudanzas', 1),
    ('transport', 'local-transport', 'Transporte local', 2),
    ('transport', 'courier', 'Mensajería y paquetería', 3),
    ('beauty', 'hairdressing', 'Peluquería', 1),
    ('beauty', 'makeup', 'Maquillaje', 2),
    ('beauty', 'barber', 'Barbería', 3),
    ('beauty', 'nails', 'Manicure y uñas', 4),
    ('education', 'school-support', 'Apoyo escolar', 1),
    ('education', 'exam-prep', 'Preparación de exámenes', 2),
    ('education', 'computer-skills', 'Informática', 3),
    ('education', 'art-lessons', 'Arte y dibujo', 4),
    ('events', 'catering', 'Catering', 1),
    ('events', 'decoration', 'Decoración', 2),
    ('events', 'entertainment', 'Animación / DJ', 3)
) as v(category_slug, slug, name, sort_order)
  on c.slug = v.category_slug
on conflict (category_id, slug) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order;
