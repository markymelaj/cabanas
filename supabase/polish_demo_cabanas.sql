-- Pulido visual/comercial de la demo publica.
-- Corrige textos con tildes y agrega fotos si las cabañas estaban sin imagenes.

update public.cabanas
set
  nombre = 'Cabaña para 2 y 4 personas',
  subtitulo = coalesce(subtitulo, 'Ideal para parejas o familias pequeñas'),
  descripcion_corta = 'Acogedora cabaña con vista al paisaje y terraza privada.',
  descripcion = 'Perfecta para parejas o familias pequeñas. Espacio cómodo, cocina equipada y terraza para descansar.',
  amenidades = array[
    '1 habitación doble',
    '1 habitación con cama 2 plazas',
    '1 baño completo',
    'Cocina equipada',
    'Terraza con parrilla',
    'Estacionamiento',
    'WiFi',
    'Ropa de cama incluida'
  ],
  fotos = array[
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
  ],
  dormitorios = coalesce(dormitorios, 2),
  banos = coalesce(banos, 1),
  camas = coalesce(camas, '2 camas'),
  activa = true
where slug = 'cabana-2-4';

update public.cabanas
set
  nombre = 'Cabaña para 6 personas',
  subtitulo = coalesce(subtitulo, 'Amplia, familiar y con espacios independientes'),
  descripcion_corta = 'Amplia cabaña con suite, ideal para familias o grupos de amigos.',
  descripcion = 'Espacio, confort y naturaleza en armonía. Ideal para grupos que buscan disfrutar juntos sin renunciar a la privacidad.',
  amenidades = array[
    '1 suite con baño privado',
    '2 habitaciones dobles',
    '2 baños',
    'Living y comedor',
    'Cocina completamente equipada',
    'Terraza con parrilla',
    'Estacionamiento doble',
    'WiFi',
    'Lavandería',
    'Ropa de cama incluida'
  ],
  fotos = array[
    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
  ],
  dormitorios = coalesce(dormitorios, 3),
  banos = coalesce(banos, 2),
  camas = coalesce(camas, 'Suite y dormitorios dobles'),
  activa = true
where slug = 'cabana-6';

notify pgrst, 'reload schema';
