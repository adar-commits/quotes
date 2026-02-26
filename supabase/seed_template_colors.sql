-- Elite Rugs: CHARCOAL WEAVE #2F2F2C, HERITAGE RED #951A22, ANTIQUE GOLD #B7A36B
UPDATE quote_templates
SET main_color = '#951A22',
    bullets_color = '#B7A36B',
    contact_strip_bg = '#951A22',
    logo_url = '/logos/elite-rugs.png'
WHERE template_key = 'elite_rugs';

-- Pozitive: rgb(26, 211, 209) = #1AD3D1
UPDATE quote_templates
SET main_color = '#1AD3D1',
    bullets_color = '#1AD3D1',
    contact_strip_bg = '#1AD3D1',
    logo_url = '/logos/pozitive.png'
WHERE template_key = 'pozitive';
