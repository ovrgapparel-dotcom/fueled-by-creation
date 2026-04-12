-- Seed Fashion Personas

INSERT INTO public.fashions (
    name, 
    category, 
    bio, 
    profile_image_url, 
    banner_image_url, 
    ig_url,
    is_featured,
    is_trending,
    status
) VALUES 
(
    'Ozwald Boateng', 
    'Designer', 
    'Known for his trademark twist on classic British tailoring and bespoke style.', 
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
    'https://images.unsplash.com/photo-1550995191-1cb118a80d46?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', 
    'https://instagram.com/ozwald_boateng',
    true,
    true,
    'Published'
),
(
    'Loza Maléombho', 
    'Brand / Designer', 
    'Bridging Ivorian traditions with modern New York fashion aesthetics, creating a unique silhouette that empowers women globally.', 
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', 
    'https://instagram.com/lozamaleombho',
    true,
    false,
    'Published'
);
