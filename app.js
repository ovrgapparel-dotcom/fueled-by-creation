/* ===== FUELED BY CREATION — Application Logic ===== */
import './content_utils.js';
import './translations.js';

// ===== APP CONFIGURATION (v1.1.4) =====
const HERO_VIDEO_URL = 'https://vz-746a5c10-8cd.b-cdn.net/513e9a7e-1a5c-4d3e-9e33-7a918e9a/play_480p.mp4';
const STORAGE_BUCKET = 'product-images';
const CONFIG_TABLE = 'app_config';

var sbClient = null;
var currentUser = null;
var products = [];
var activeFilter = 'all';
var adminImgSlots = ['', '', '', '', ''];
var selectedPayment = 'paypal';
var currentProduct = null;
var cart = [];
var currentPage = 'home';

function localizeDemoData() {
    if (window.getLang() === 'fr') {
        // Localize Artists
        demoArtists[0].bio = "Sensation Afrobeat mêlant culture et rythme.";
        demoArtists[0].latest_release_title = "Fire & Gold EP";
        demoArtists[1].bio = "Vocaliste R&B aux mélodies envoûtantes.";
        demoArtists[1].latest_release_title = "Midnight Session";
        demoArtists[2].bio = "Beats électroniques et sons définissant la culture.";

        // Localize Articles
        demoArticles[0].title = "L'essor de l'Afrobeat dans la culture mondiale";
        demoArticles[0].excerpt = "Comment les rythmes africains deviennent la bande-son d'une génération.";
        demoArticles[1].title = "5 façons de construire votre marque en tant qu'artiste indépendant";
        demoArticles[1].excerpt = "Conseils pratiques pour les artistes émergents pour développer leur audience.";
        demoArticles[2].title = "Coulisses : Session de studio FBC";
        demoArticles[2].excerpt = "Un regard exclusif sur le processus créatif.";

        // Localize Threads
        demoThreads[0].title = window.t('underrated_artist');
        demoThreads[0].hook_text = "Donnez vos choix — la culture a besoin de les entendre.";
        demoThreads[1].title = window.t('merch_drop');
        demoThreads[1].hook_text = "Nouvelle collection FBC ce week-end. Quelles pièces visez-vous ?";
        demoThreads[2].title = window.t('afrobeat_vs_amapiano');
        demoThreads[2].hook_text = "Le débat qui s'enflamme tout le mois.";

        // Localize Events
        demoEvents[0].title = "FBC Live: Kwame Blaze en Concert";
        demoEvents[0].description = "Une nuit électrisante d'Afrobeat, performances live et drops exclusifs.";
        demoEvents[1].title = "Nuit de la Culture : Art × Musique × Mode";
        demoEvents[1].description = "Une soirée multidisciplinaire célébrant l'intersection de la culture.";
        demoEvents[2].title = "Boutique Éphémère FBC";
        demoEvents[2].description = "Expérience merch exclusive en personne. Drops limités uniquement.";
    }
}

// ===== DEMO DATA (used until Supabase tables are populated) =====
var demoArtists = [
    { id: 'a1', name: 'Kwame Blaze', bio: 'Afrobeat sensation blending culture with rhythm.', profile_image_url: 'https://images.unsplash.com/photo-1557124816-e9b7d5440de2?auto=format&fit=crop&q=80&w=400', banner_image_url: '', promo_video_url: '', latest_release_title: 'Fire & Gold EP', latest_release_cover_url: '', latest_release_listen_url: '#', latest_release_date: '2026-02-15', merch_product_id: '', instagram_url: '#', youtube_url: '#', tiktok_spotify_url: '#', status: 'Published', is_featured: true },
    { id: 'a2', name: 'Nia Vox', bio: 'R&B vocalist with soul-stirring melodies.', profile_image_url: 'https://images.unsplash.com/photo-1516575334481-f8528e9466b4?auto=format&fit=crop&q=80&w=400', banner_image_url: '', promo_video_url: '', latest_release_title: 'Midnight Session', latest_release_cover_url: '', latest_release_listen_url: '#', latest_release_date: '2026-01-20', merch_product_id: '', instagram_url: '#', youtube_url: '#', tiktok_spotify_url: '#', status: 'Published', is_featured: true },
    { id: 'a3', name: 'DJ Phantom', bio: 'Electronic beats and culture-defining sounds.', profile_image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=400', banner_image_url: '', promo_video_url: '', latest_release_title: 'Neon Pulse', latest_release_cover_url: '', latest_release_listen_url: '#', latest_release_date: '2026-03-01', merch_product_id: '', instagram_url: '#', youtube_url: '#', tiktok_spotify_url: '#', status: 'Published', is_featured: false },
];


var demoArticles = [
    { id: 'art1', title: 'The Rise of Afrobeat in Global Culture', category: 'article', cover_image_url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800', excerpt: 'How African rhythms are becoming the soundtrack of a generation.', body_content: '<p>Afrobeat has transcended borders. What started as a movement in West Africa is now a global phenomenon, influencing pop, hip-hop, and electronic music worldwide.</p><p>Artists like Kwame Blaze are at the forefront of this cultural revolution, blending traditional sounds with modern production techniques.</p>', author: 'FBC Editorial', publish_date: '2026-03-01', status: 'Published', is_featured: true, is_trending: true },
    { id: 'art2', title: '5 Ways to Build Your Brand as an Independent Artist', category: 'howto', cover_image_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800', excerpt: 'Practical tips for emerging artists to grow their audience.', body_content: '<p>Building a brand as an independent artist requires strategy, consistency, and authenticity. Here are five proven methods to accelerate your growth.</p>', author: 'FBC Editorial', publish_date: '2026-02-20', status: 'Published', is_featured: false, is_trending: false },
    { id: 'art3', title: 'Behind the Scenes: FBC Studio Session', category: 'vlog', cover_image_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800', excerpt: 'An exclusive look inside the creative process.', body_content: '<p>We took cameras inside the studio to capture the magic behind the latest FBC artist collaborations.</p>', author: 'FBC Media', publish_date: '2026-02-28', status: 'Published', is_featured: true, is_trending: true },
];

var influencers = [];
var demoInfluencers = [
    { id: 'i1', name: 'DJ Zadig', category: 'Music Icon', bio: 'The pioneer of Afro-Electric sounds.', profile_image_url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80', banner_image_url: '', ig_url: '#', yt_url: '#', tiktok_spotify_url: '#' },
    { id: 'i2', name: 'Aicha Culture', category: 'Cultural Activist', bio: 'Promoting Ivorian heritage through modern art.', profile_image_url: 'https://images.unsplash.com/photo-1531123414780-f05244585149?auto=format&fit=crop&q=80', banner_image_url: '', ig_url: '#', yt_url: '#', tiktok_spotify_url: '#' }
];

var demoThreads = [
    { id: 't1', title: 'Who is the most underrated artist right now?', tag: 'Hot', hook_text: 'Drop your picks — the culture needs to hear them.', cover_image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800', status: 'Active', priority_order: 1, is_pinned: true, likes: 124, comments: 45, views: 890 },
    { id: 't2', title: 'Merch drop incoming 🔥', tag: 'Trend', hook_text: 'New FBC collection dropping this weekend. What pieces are you eyeing?', cover_image_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800', status: 'Active', priority_order: 2, is_pinned: false, likes: 342, comments: 67, views: '1.2k' },
    { id: 't3', title: 'Afrobeat vs Amapiano — which one defines 2026?', tag: 'News', hook_text: 'The debate that\'s been heating up all month.', cover_image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800', status: 'Active', priority_order: 3, is_pinned: false, likes: 89, comments: 23, views: 456 },
];


var demoEvents = [
    { id: 'e1', title: 'FBC Live: Kwame Blaze in Concert', description: 'An electrifying night of Afrobeat, live performances, and exclusive merch drops.', event_date: '2026-04-15T20:00:00', location_name: 'Sofitel Abidjan', location_address: 'Abidjan, Côte d\'Ivoire', cover_image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800', ticketing_url: '#', featured_artist_id: 'a1', status: 'Published' },
    { id: 'e2', title: 'Culture Night: Art × Music × Fashion', description: 'A multi-disciplinary evening celebrating the intersection of culture.', event_date: '2026-05-10T19:00:00', location_name: 'Ivoire Trade Center', location_address: 'Plateau, Abidjan', cover_image_url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=800', ticketing_url: '#', featured_artist_id: null, status: 'Published' },
    { id: 'e3', title: 'FBC Pop-Up Shop', description: 'Exclusive in-person merch experience. Limited drops only.', event_date: '2026-04-28T10:00:00', location_name: 'Zone 4, Marcory', location_address: 'Abidjan', cover_image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800', ticketing_url: '#', featured_artist_id: null, status: 'Published' },
];


// ===== INIT =====
function initSupabase() {
    try {
        var _sb = window['supabase'] || window['supabaseJs'];
        if (!_sb || typeof _sb.createClient !== 'function') throw new Error('Supabase library not loaded');
        sbClient = _sb.createClient(SUPABASE_URL, SUPABASE_ANON, {
            auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, storage: window.localStorage }
        });
        window.sbClient = sbClient; // Make it available globally for other modules
        sbClient.auth.onAuthStateChange(function (event, session) { currentUser = session ? session.user : null; updateAdminUI(); });
        return true;
    } catch (e) { console.error('Supabase init error:', e); return false; }
}

// ===== PAGE ROUTING =====
function switchPage(page) {
    currentPage = page;
    document.querySelectorAll('.page-section').forEach(function (s) { s.classList.remove('active'); });
    var target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    // Update nav
    document.querySelectorAll('#mainNav a').forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-page') === page);
    });
    // Close mobile nav on navigation
    var nav = document.getElementById('mainNav');
    if (nav) nav.classList.remove('mobile-nav-active');
    // Hide overlays using the open class (not inline style — avoids CSS conflicts)
    ['artistDetail', 'articleDetail', 'eventDetail', 'influencerDetail'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) { el.classList.remove('open'); el.style.display = ''; }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // When opening Trends page: ensure pinned item is rendered
    if (page === 'trends') {
        loadHotTopics();
    }

    // When opening Home: refresh hero media
    if (page === 'home') loadHeroMedia();
}


function handleRouting() {
    const hash = window.location.hash;
    if (hash.startsWith('#artist/')) {
        const id = hash.replace('#artist/', '');
        openArtistDetail(id);
    } else if (hash.startsWith('#article/')) {
        const id = hash.replace('#article/', '');
        openArticleDetail(id);
    } else if (hash.startsWith('#event/')) {
        const id = hash.replace('#event/', '');
        openEventDetail(id);
    } else if (hash.startsWith('#influencer/')) {
        const id = hash.replace('#influencer/', '');
        openInfluencerDetail(id);
    } else if (hash === '#shop') {
        document.getElementById('shop').scrollIntoView();
    } else if (hash === '#artists') {
        document.getElementById('artists').scrollIntoView();
    }
}

function toggleMobileMenu() {
    var nav = document.getElementById('mainNav');
    nav.classList.toggle('mobile-nav-active');
}

// ===== HERO MEDIA MANAGEMENT (v1.0.5 & v1.1.7) =====
var currentHeroUrl = HERO_VIDEO_URL;
var sectionHeroes = {
    shop: '',
    artists: '',
    trends: '',
    events: ''
};

async function loadHeroConfig() {
    if (!sbClient) return;
    try {
        const { data, error } = await sbClient.from(CONFIG_TABLE).select('*').in('key', [
            'hero_video_url', 'shop_hero_url', 'artists_hero_url', 'trends_hero_url', 'events_hero_url'
        ]);
        if (error) {
            if (error.code !== 'PGRST116') console.error('Error loading hero config:', error);
            return;
        }
        if (data && data.length > 0) {
            data.forEach(item => {
                if (item.key === 'hero_video_url') {
                    currentHeroUrl = item.value;
                    const input = document.getElementById('heroVideoInput');
                    if (input) input.value = currentHeroUrl;
                } else {
                    const sectionName = item.key.split('_')[0]; // e.g. 'shop'
                    sectionHeroes[sectionName] = item.value;
                    const input = document.getElementById(sectionName + 'HeroInput');
                    if (input) input.value = item.value;
                }
            });
            // Apply immediately
            loadHeroMedia();
            loadSectionHeroMedia('shop', 'hero-shop');
            loadSectionHeroMedia('artists', 'hero-artists');
            loadSectionHeroMedia('trends', 'hero-trends');
            loadSectionHeroMedia('events', 'hero-events');
        }
    } catch (e) { console.error('Hero config load error:', e); }
}

async function saveHeroConfig() {
    var btn = event?.target || document.querySelector('button[onclick="saveHeroConfig()"]');
    var originalText = btn ? btn.textContent : '💾 Save All Hero Configurations';
    
    // Collect all URLs from DOM
    const urls = {
        hero_video_url: document.getElementById('heroVideoInput')?.value.trim() || '',
        shop_hero_url: document.getElementById('shopHeroInput')?.value.trim() || '',
        artists_hero_url: document.getElementById('artistsHeroInput')?.value.trim() || '',
        trends_hero_url: document.getElementById('trendsHeroInput')?.value.trim() || '',
        events_hero_url: document.getElementById('eventsHeroInput')?.value.trim() || ''
    };

    if (!urls.hero_video_url) { showToast('Error', 'Main hero video URL cannot be empty.', '#ef4444'); return; }
    
    if (!sbClient) { 
        showToast('Demo Mode', 'URLs saved locally.'); 
        currentHeroUrl = urls.hero_video_url; 
        loadHeroMedia(); 
        return; 
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
    try {
        const configs = Object.keys(urls).filter(k => urls[k]).map(k => ({ key: k, value: urls[k] }));
        if(configs.length === 0) return;

        const { error } = await sbClient.from(CONFIG_TABLE).upsert(configs, { onConflict: 'key' });
        if (error) throw error;
        
        showToast('Saved! ✓', 'All Hero configurations updated.');
        
        // Reload to apply visual changes
        loadHeroConfig();
    } catch (e) {
        console.error('Save hero config error:', e);
        showToast('Error', 'Could not save configs: ' + e.message, '#ef4444');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
}

// ===== FEATURED PROMO MANAGEMENT (v1.0.5) =====
async function loadFeaturedPromoConfig() {
    if (!sbClient) return;
    try {
        const { data, error } = await sbClient.from(CONFIG_TABLE).select('*').in('key', [
            'featured_promo_title', 'featured_promo_desc', 'featured_promo_media', 'featured_promo_btn_text', 'featured_promo_btn_link'
        ]);
        if (error) { console.error('Error loading featured promo config:', error); return; }
        
        if (data && data.length > 0) {
            data.forEach(item => {
                const inputId = {
                    'featured_promo_title': 'featuredPromoTitleInput',
                    'featured_promo_desc': 'featuredPromoDescInput',
                    'featured_promo_media': 'featuredPromoMediaInput',
                    'featured_promo_btn_text': 'featuredPromoBtnTextInput',
                    'featured_promo_btn_link': 'featuredPromoBtnLinkInput'
                }[item.key];
                const input = document.getElementById(inputId);
                if (input) input.value = item.value;
            });
            renderFeaturedPromo();
        }
    } catch (e) { console.error('Featured promo config load error:', e); }
}

async function saveFeaturedPromoConfig() {
    var btn = event?.target || document.querySelector('button[onclick="saveFeaturedPromoConfig()"]');
    var originalText = btn ? btn.textContent : '💾 Save Featured Configuration';
    const title = document.getElementById('featuredPromoTitleInput').value.trim();
    const desc = document.getElementById('featuredPromoDescInput').value.trim();
    const media = document.getElementById('featuredPromoMediaInput').value.trim();
    const btnText = document.getElementById('featuredPromoBtnTextInput').value.trim();
    const btnLink = document.getElementById('featuredPromoBtnLinkInput').value.trim();

    if (!title || !desc || !media) {
        showToast('Error', 'Title, Description, and Media are required.', '#ef4444');
        return;
    }

    if (!sbClient) {
        showToast('Demo Mode', 'Saved locally.');
        renderFeaturedPromo();
        return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
    try {
        const configs = [
            { key: 'featured_promo_title', value: title },
            { key: 'featured_promo_desc', value: desc },
            { key: 'featured_promo_media', value: media },
            { key: 'featured_promo_btn_text', value: btnText },
            { key: 'featured_promo_btn_link', value: btnLink }
        ];
        const { error } = await sbClient.from(CONFIG_TABLE).upsert(configs, { onConflict: 'key' });
        if (error) throw error;
        renderFeaturedPromo();
        showToast('Saved! ✓', 'Featured promo updated successfully.');
    } catch (e) {
        console.error('Save featured promo config error:', e);
        showToast('Error', 'Could not save featured promo config: ' + e.message, '#ef4444');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
}

function renderFeaturedPromo() {
    const title = document.getElementById('featuredPromoTitleInput')?.value || "THE CREW IN SESSION";
    const desc = document.getElementById('featuredPromoDescInput')?.value || "Go behind the scenes with the FBC team...";
    const media = document.getElementById('featuredPromoMediaInput')?.value || "assets/featured_video_thumbnail.png";
    const btnText = document.getElementById('featuredPromoBtnTextInput')?.value || "Watch Documentary";
    const btnLink = document.getElementById('featuredPromoBtnLinkInput')?.value || "trends";

    const titleEl = document.getElementById('featuredPromoTitle');
    const descEl = document.getElementById('featuredPromoDesc');
    const mediaEl = document.getElementById('featuredPromoMedia');
    const btnEl = document.getElementById('featuredPromoBtn');

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    if (btnEl) {
        btnEl.textContent = btnText;
        btnEl.onclick = (e) => {
            e.preventDefault();
            if (btnLink.startsWith('http')) window.open(btnLink, '_blank');
            else switchPage(btnLink);
        };
    }
    if (mediaEl) {
        const isVideo = media.match(/\.(mp4|webm|ogg|mov)$|^data:video/i);
        if (isVideo) {
            mediaEl.innerHTML = '<video src="' + media + '" autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover"></video>';
            mediaEl.style.backgroundImage = 'none';
        } else {
            mediaEl.style.backgroundImage = 'url(' + media + ')';
            mediaEl.innerHTML = `
                <div class="play-btn-glass"
                    style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.4); cursor: pointer;">
                    <span style="color: white; font-size: 2rem; margin-left: 5px;">▶</span>
                </div>`;
        }
    }
}

// ===== PRODUCT LOADING =====
function setSupabaseStatus(state, msg) {
    var el = document.getElementById('supabaseStatus');
    if (el) { el.className = 'supabase-status ' + state; el.textContent = msg; }
}

async function loadProducts() {
    var tries = 0;
    while (!sbClient && tries < 10) { await new Promise(function (r) { setTimeout(r, 300); }); tries++; }
    if (!sbClient) { products = getDefaultProducts(); showLoadedCatalogue(); showToast('Demo Mode', 'Supabase connection unavailable.', '#f59e0b'); return; }
    try {
        var res = await sbClient.from(PRODUCTS_TABLE).select('*').order('id', { ascending: true });
        if (res.error) throw res.error;
        products = res.data || []; showLoadedCatalogue();
    } catch (e) { products = getDefaultProducts(); showLoadedCatalogue(); showToast('Demo Mode', 'Supabase not configured — using demo data.', '#f59e0b'); }
}

function showLoadedCatalogue() {
    var lg = document.getElementById('loadingGrid');
    var pg = document.getElementById('productsGrid');
    if (lg) lg.style.display = 'none';
    if (pg) pg.style.display = 'grid';
    renderCatalogue(activeFilter);
}

function getDefaultProducts() {
    return [
        {
            id: 'p1',
            name: 'FBC Classic Tee',
            category: 't-shirt',
            price: 15000,
            old_price: 20000,
            imgs: ['/assets/black_classic_tee.png'],
            description: 'The definitive FUELED BY CREATION staple.',
            sizes: ['S', 'M', 'L', 'XL'],
            badge: 'New'
        },
        {
            id: 'p2',
            name: 'Premium Bone Hoodie',
            category: 'hoodie',
            price: 35000,
            old_price: 45000,
            imgs: ['/assets/bone_premium_hoodie.png'],
            description: 'Heavyweight comfort for the culture.',
            sizes: ['M', 'L', 'XL'],
            badge: 'Essentials'
        },
        { id: 'p3', name: 'Culture Set', category: 'ensemble', price: 35000, old_price: 40000, description: 'Full set for sport and daily life.', badge: 'Limited', sizes: ['S', 'M', 'L', 'XL', 'XXL'], imgs: [] },
        { id: 'p4', name: 'Premium Tee', category: 't-shirt', price: 15000, old_price: 20000, description: 'Premium quality cotton tee.', badge: '', sizes: ['S', 'M', 'L', 'XL'], imgs: [] },
    ];
}

// ===== RENDER FUNCTIONS =====
function renderCatalogue(filter) {
    filter = filter || 'all'; activeFilter = filter;
    var grid = document.getElementById('productsGrid'); if (!grid) return;
    var filtered = filter === 'all' ? products : products.filter(function (p) { return p.category === filter; });
    if (!filtered.length) { grid.innerHTML = '<div class="empty-state"><div class="empty-icon">📦</div><p>No products in this category.</p></div>'; return; }
    grid.innerHTML = filtered.map(function (p) {
        var disc = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0;
        var imgSrc = p.imgs && p.imgs[0];
        var imgHtml = imgSrc ? '<img src="' + imgSrc + '" alt="' + p.name + '" loading="lazy">' : '<div class="product-img-placeholder"><span style="font-size:4rem;opacity:0.15">👕</span></div>';
        var badgeHtml = p.badge ? '<span class="product-badge">' + p.badge + '</span>' : '';
        var discHtml = p.old_price ? '<span class="product-old">' + fmt(p.old_price) + '</span><span class="product-discount">-' + disc + '%</span>' : '';
        return '<article class="product-card" onclick="openProduct(\'' + p.id + '\')" tabindex="0">' +
            '<div class="product-img-wrap">' + imgHtml + badgeHtml +
            '<button class="product-quick-view" onclick="event.stopPropagation();openProduct(\'' + p.id + '\')">' + window.t('view_details') + '</button></div>' +
            '<div class="product-info">' +
            '<div class="product-cat">' + (p.category === 't-shirt' ? window.t('tshirts') : window.t('sets')) + '</div>' +
            '<h3 class="product-name">' + p.name + '</h3>' +
            '<div class="product-pricing"><span class="product-price">' + fmt(p.price) + '</span>' + discHtml + '</div>' +
            '<button class="btn-add-cart" onclick="event.stopPropagation();quickAddToCart(\'' + p.id + '\')">' + window.t('add_to_cart') + '</button>' +
            '</div></article>';
    }).join('');
}

function renderArtists(targetGridId, artistList) {
    var grid = document.getElementById(targetGridId); if (!grid) return;
    if (!artistList.length) { grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🎤</div><p>No artists to display yet.</p></div>'; return; }
    grid.innerHTML = artistList.map(function (a) {
        var imgHtml = a.profile_image_url ? '<img src="' + a.profile_image_url + '" alt="' + a.name + '" loading="lazy">' : '';
        var featuredBadge = a.is_featured ? '<span class="featured-badge">⭐ ' + window.t('featured_artist') + '</span>' : '';
        return '<div class="artist-card" onclick="openArtistDetail(\'' + a.id + '\')">' +
            '<div class="artist-card-img">' + imgHtml + featuredBadge + '</div>' +
            '<div class="artist-card-body">' +
            '<h3 class="artist-card-name">' + a.name + '</h3>' +
            '<p class="artist-card-release">🎵 ' + (a.latest_release_title || window.t('coming_soon')) + '</p>' +
            '<div class="artist-card-actions">' +
            '<button class="btn-sm btn-view-profile" onclick="event.stopPropagation();openArtistDetail(\'' + a.id + '\')">' + window.t('view_profile') + '</button>' +
            (a.latest_release_listen_url && a.latest_release_listen_url !== '#' ? '<a href="' + a.latest_release_listen_url + '" target="_blank" class="btn-sm btn-listen" onclick="event.stopPropagation()">▶ ' + window.t('listen_now') + '</a>' : '') +
            '</div></div></div>';
    }).join('');
}

function renderArticles(targetGridId, articleList) {
    var grid = document.getElementById(targetGridId); if (!grid) return;
    if (!articleList.length) { grid.innerHTML = '<div class="empty-state"><div class="empty-icon">📰</div><p>No articles yet.</p></div>'; return; }
    // Clean any prior classes
    grid.className = 'articles-grid';
    grid.innerHTML = articleList.map(function (a) {
        var defaultImg = 'https://images.unsplash.com/photo-1514525253344-de81c97ef2c9?auto=format&fit=crop&q=80&w=800';
        var imgHtml = '<img src="' + (a.cover_image_url || defaultImg) + '" alt="' + a.title + '" loading="lazy" style="width:100%; height:100%; object-fit:contain; background:#000;">';
        var catKey = a.category === 'howto' ? 'how_to' : (a.category === 'vlog' ? 'vlogs' : a.category);
        var catLabel = window.t(catKey) || a.category;
        return '<div class="article-card" onclick="openArticleDetail(\'' + a.id + '\')">' +
            '<div class="article-card-img">' + imgHtml + '</div>' +
            '<div class="article-card-body">' +
            '<span class="article-card-tag">' + catLabel + '</span>' +
            '<h3 class="article-card-title">' + a.title + '</h3>' +
            '<p class="article-card-excerpt">' + (a.excerpt || '') + '</p>' +
            '<div class="article-card-meta"><span>' + window.t('by') + ' ' + (a.author || 'FBC') + '</span><span>' + formatDate(a.publish_date) + '</span></div>' +
            '</div></div>';
    }).join('');
}

function renderFeaturedArticlesSplit(targetContainerId, articleList) {
    var container = document.getElementById(targetContainerId); if (!container) return;
    if (!articleList.length) { container.innerHTML = '<div class="empty-state"><p>No featured articles yet.</p></div>'; return; }
    
    // Show top 3 featured articles
    var topArticles = articleList.slice(0, 3);
    var html = '<div class="featured-articles-grid">';
    
    topArticles.forEach(function(a) {
        var bgImg = a.cover_image_url ? a.cover_image_url : 'https://images.unsplash.com/photo-1531123414780-f05244585149?auto=format&fit=crop&q=80';
        var excerpt = a.excerpt || window.t('read_latest_feature');
        if (excerpt.length > 120) excerpt = excerpt.substring(0, 117) + '...';

        html += 
            '<div class="featured-article-card" onclick="openArticleDetail(\'' + a.id + '\')">' +
                '<div class="card-img" style="background-image: url(\'' + bgImg + '\');"></div>' +
                '<div class="card-body">' +
                    '<h3>' + a.title + '</h3>' +
                    '<p>' + excerpt + '</p>' +
                    '<div class="btn-read">' + window.t('read_more') + '</div>' +
                '</div>' +
            '</div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function renderThreads(targetListId, threadList) {
    var list = document.getElementById(targetListId); if (!list) return;
    if (!threadList.length) { list.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><p>No threads yet.</p></div>'; return; }

    // Separate pinned from regular
    var pinnedItem = threadList.find(function(t) { return t.is_pinned; });
    var regularThreads = threadList.filter(function(t) { return !t.is_pinned; });
    var sortedThreads = regularThreads.slice().sort(function (a, b) { return a.priority_order - b.priority_order; });

    // Render pinned into the premium card slot
    var pinnedWrap = document.getElementById('pinnedArticleWrap');
    if (pinnedWrap) {
        if (pinnedItem) {
            var coverStyle = pinnedItem.cover_image_url ? 'style="background-image:url(\'' + pinnedItem.cover_image_url + '\')"' : 'style="background: linear-gradient(135deg,#1a1a1a,#2d1a0e)"';
            pinnedWrap.innerHTML =
                '<div class="pinned-article-card">' +
                    '<div class="pinned-media" ' + coverStyle + '></div>' +
                    '<div class="pinned-content">' +
                        '<span class="badge-featured">' + (pinnedItem.tag || 'FEATURED') + '</span>' +
                        '<h3 class="pinned-title">' + pinnedItem.title + '</h3>' +
                        '<p class="pinned-hook">' + (pinnedItem.hook_text || '') + '</p>' +
                        '<span class="pinned-cta">Read the full story &rarr;</span>' +
                    '</div>' +
                '</div>';
        } else {
            pinnedWrap.innerHTML = '';
        }
    }

    // Render regular threads
    list.innerHTML = sortedThreads.map(function (t) {
        var tagClass = { Hot: 'hot', Trend: 'trend', News: 'news' }[t.tag] || 'trend';
        var threadTagText = window.i18n ? window.i18n.t(t.tag.toLowerCase()) : t.tag;
        return '<div class="thread-card">' +
            '<div class="thread-tag-wrap"><span class="thread-tag ' + tagClass + '">' + threadTagText + '</span></div>' +
            '<div class="thread-info"><h4 class="thread-title">' + t.title + '</h4><p class="thread-hook">' + (t.hook_text || '') + '</p></div>' +
            '<div class="thread-actions-grid">' +
            '<button class="thread-action-btn"><span>🔥</span><span class="count">' + (t.likes || 0) + '</span></button>' +
            '<button class="thread-action-btn"><span>💬</span><span class="count">' + (t.comments || 0) + '</span></button>' +
            '<button class="thread-action-btn"><span>👀</span><span class="count">' + (t.views || 0) + '</span></button>' +
            '</div>' +
            '</div>';
    }).join('');
}


function renderEvents(targetGridId, eventList) {
    var grid = document.getElementById(targetGridId); if (!grid) return;
    if (!eventList.length) { grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🎫</div><p>No events scheduled yet.</p></div>'; return; }
    grid.innerHTML = eventList.map(function (e) {
        var d = new Date(e.event_date);
        var enMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        var frMonths = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEP', 'OCT', 'NOV', 'DÉC'];
        var months = window.getLang() === 'fr' ? frMonths : enMonths;
        var defaultImg = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800';
        var eventImg = e.cover_image_url || defaultImg;
        var imgHtml = '<img src="' + eventImg + '" alt="' + e.title + '" loading="lazy" style="width:100%; height:100%; object-fit:contain; background:#000;">';

        return '<div class="event-card" onclick="openEventDetail(\'' + (e.id || '') + '\')">' +
            '<div class="event-card-img">' + imgHtml +
            '<div class="event-date-badge"><div class="edb-month">' + months[d.getMonth()] + '</div><div class="edb-day">' + d.getDate() + '</div></div>' +
            '</div>' +
            '<div class="event-card-body">' +
            '<h3 class="event-card-title">' + e.title + '</h3>' +
            '<p class="event-card-location">📍 ' + e.location_name + '</p>' +
            (e.ticketing_url ? '<a href="' + e.ticketing_url + '" target="_blank" class="event-card-cta" onclick="event.stopPropagation()">' + window.t('get_tickets') + '</a>' : '') +
            '</div></div>';
    }).join('');
}

// ===== FILTER HANDLERS =====
function filterProducts(filter, btn) {
    document.querySelectorAll('#filterTabs .filter-tab').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active'); renderCatalogue(filter);
}

function filterTrends(filter, btn) {
    document.querySelectorAll('#trendsFilterTabs .filter-tab').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    var filtered = filter === 'all' ? demoArticles : demoArticles.filter(function (a) { return a.category === filter; });
    renderArticles('allArticlesGrid', filtered);
}


// ===== PRODUCT DETAIL =====
var currentViewedProduct = null; // Added for the new openProduct logic
function openProduct(id) {
    var p = products.find(function (x) { return x.id == id; });
    if (!p) return;

    currentProduct = p;

    var mainImg = p.imgs && p.imgs.length > 0 ? p.imgs[0] : '';
    var mediaWrap = document.getElementById('mainImgWrap'); // Use existing modal gallery container
    if (mediaWrap) {
        var isVideo = mainImg && mainImg.match(/\.(mp4|webm|ogg|mov)$|^data:video/i);
        if (isVideo) {
            mediaWrap.innerHTML = '<video src="' + mainImg + '" autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;display:block"></video>';
        } else {
            mediaWrap.innerHTML = '<img id="productMainImg" src="' + (mainImg || 'https://via.placeholder.com/600') + '" alt="Main Product" style="width:100%;display:block">';
        }
    }

    // Existing elements
    // Field population
    var modalName = document.getElementById('modalName');
    if (modalName) modalName.textContent = p.name;
    
    var modalPrice = document.getElementById('modalPrice');
    if (modalPrice) modalPrice.textContent = fmt(p.price);
    
    var modalOld = document.getElementById('modalOld');
    var disc = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0;
    if (modalOld) modalOld.textContent = p.old_price ? fmt(p.old_price) : '';
    
    var modalDisc = document.getElementById('modalDisc');
    if (modalDisc) modalDisc.textContent = disc ? '-' + disc + '%' : '';
    
    var modalDesc = document.getElementById('modalDesc');
    if (modalDesc) modalDesc.textContent = p.description || '';

    var modalCatLabel = document.getElementById('modalCatLabel');
    if (modalCatLabel) modalCatLabel.textContent = p.category === 't-shirt' ? window.t('tshirts') : window.t('sets');
    
    // Quantity reset
    var qtyInput = document.getElementById('qtyInput');
    if (qtyInput) qtyInput.value = 1;

    // Gallery population
    var thumbRow = document.getElementById('thumbRow');
    if (thumbRow) {
        thumbRow.innerHTML = [0, 1, 2, 3].map(function (i) {
            var src = p.imgs && p.imgs[i + 1];
            return '<div class="thumb ' + (i === 0 ? 'active' : '') + '" onclick="selectThumb(this,\'' + (src || '') + '\')">' +
                (src ? '<img src="' + src + '" alt="Photo ' + (i + 2) + '">' : '<div class="thumb-placeholder">👕</div>') + '</div>';
        }).join('');
    }

    var sizeBtns = document.getElementById('sizeBtns');
    if (sizeBtns) {
        sizeBtns.innerHTML = (p.sizes || []).map(function (s, i) {
            return '<button class="size-btn' + (i === 0 ? ' selected' : '') + '" onclick="selectSize(this)">' + s + '</button>';
        }).join('');
    }

    var sizeSection = document.getElementById('sizeSection');
    if (sizeSection) sizeSection.style.display = p.sizes && p.sizes.length ? '' : 'none';
    document.getElementById('productOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function selectThumb(el, src) {
    document.querySelectorAll('.thumb').forEach(function (t) { t.classList.remove('active'); }); el.classList.add('active');
    document.getElementById('mainImgWrap').innerHTML = src ? '<img src="' + src + '" alt="">' : '<div class="main-img-placeholder">👕</div>';
}
function selectSize(btn) { document.querySelectorAll('.size-btn').forEach(function (b) { b.classList.remove('selected'); }); btn.classList.add('selected'); }
function closeProduct() { document.getElementById('productOverlay').classList.remove('open'); document.body.style.overflow = ''; }
function changeQty(d) { var inp = document.getElementById('qtyInput'); inp.value = Math.max(1, parseInt(inp.value || 1) + d); }
function handleOverlayClick(e, id) {
    if (e.target.id === id) {
        if (id === 'productOverlay') closeProduct();
        else if (id === 'checkoutOverlay') closeCheckout();
        else if (id === 'adminOverlay') closeAdmin();
        else if (id === 'contentUploadOverlay') closeContentUpload();
        else if (id === 'influencerDetail') closeDetail();
    }
}

// ===== CART =====
function quickAddToCart(id) { var p = products.find(function (x) { return x.id == id; }); if (p) addCartItem(p, 1, p.sizes && p.sizes[0] || ''); }
function addToCartFromModal() {
    if (!currentProduct) return;
    var qty = parseInt(document.getElementById('qtyInput').value || 1);
    var sel = document.querySelector('.size-btn.selected');
    var size = sel ? sel.textContent : '';
    addCartItem(currentProduct, qty, size); closeProduct(); toggleCart();
}
function addCartItem(p, qty, size) {
    var key = p.id + '-' + size;
    var ex = cart.find(function (c) { return c.key === key; });
    if (ex) ex.qty += qty;
    else cart.push({ key: key, id: p.id, name: p.name, price: p.price, qty: qty, size: size, img: p.imgs && p.imgs[0] || '' });
    renderCart(); showToast('Added! 🛍', p.name + ' added to cart.');
}
function removeFromCart(key) { cart = cart.filter(function (c) { return c.key !== key; }); renderCart(); }
function renderCart() {
    var total = cart.reduce(function (s, c) { return s + c.price * c.qty; }, 0);
    document.getElementById('cartCount').textContent = cart.reduce(function (s, c) { return s + c.qty; }, 0);
    document.getElementById('cartTotal').textContent = fmt(total);
    var el = document.getElementById('cartItems');
    if (!cart.length) { el.innerHTML = '<div class="cart-empty"><div class="empty-icon">🛍</div><p>Your cart is empty</p></div>'; return; }
    el.innerHTML = cart.map(function (c) {
        return '<div class="cart-item">' +
            '<div class="cart-item-img">' + (c.img ? '<img src="' + c.img + '" alt="' + c.name + '">' : '👕') + '</div>' +
            '<div class="cart-item-info"><div class="cart-item-name">' + c.name + '</div>' +
            '<div class="cart-item-meta">' + (c.size ? 'Size: ' + c.size + ' · ' : '') + 'Qty: ' + c.qty + '</div>' +
            '<div class="cart-item-price">' + fmt(c.price * c.qty) + '</div></div>' +
            '<button class="cart-item-remove" onclick="removeFromCart(\'' + c.key + '\')">✕</button></div>';
    }).join('');
}
function toggleCart() { document.getElementById('cartPanel').classList.toggle('open'); }

// ===== CHECKOUT =====
function openCheckout() {
    if (!cart.length) { showToast('Cart empty', 'Add items first.', '#f59e0b'); return; }
    document.getElementById('cartPanel').classList.remove('open');
    var total = cart.reduce(function (s, c) { return s + c.price * c.qty; }, 0);
    document.getElementById('checkoutSummaryItems').innerHTML = cart.map(function (c) {
        return '<div class="summary-row"><span>' + c.name + (c.size ? ' (' + c.size + ')' : '') + ' ×' + c.qty + '</span><span>' + fmt(c.price * c.qty) + '</span></div>';
    }).join('');
    document.getElementById('checkoutTotalDisplay').textContent = fmt(total);
    document.getElementById('orderDetails').value = cart.map(function (c) { return c.name + (c.size ? ' (' + c.size + ')' : '') + ' ×' + c.qty + ': ' + fmt(c.price * c.qty); }).join(' | ') + ' | TOTAL: ' + fmt(total);
    document.getElementById('checkoutOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeCheckout() { document.getElementById('checkoutOverlay').classList.remove('open'); document.body.style.overflow = ''; }
function selectPayment(m) {
    selectedPayment = m;
    document.getElementById('checkoutPaymentMethod').value = m;
    ['Paypal', 'Orange', 'Djamo', 'Wave', 'Yango', 'Whatsapp'].forEach(function (x) { 
        var el = document.getElementById('payOpt' + x);
        if (el) el.classList.remove('selected'); 
    });
    var map = { paypal: 'Paypal', orange: 'Orange', djamo: 'Djamo', wave: 'Wave', yango: 'Yango', whatsapp: 'Whatsapp' };
    var target = document.getElementById('payOpt' + map[m]);
    if (target) target.classList.add('selected');
}
function submitOrder(e) {
    e.preventDefault();
    var f = e.target;
    var name = f.first_name.value + ' ' + f.last_name.value;
    var total = cart.reduce(function (s, c) { return s + c.price * c.qty; }, 0);
    document.getElementById('orderSubject').value = 'FBC Order — ' + name;
    document.getElementById('orderAutoResponse').value = 'Hello ' + name + '! Order received. Total: ' + fmt(total) + '. We\'ll contact you within 24h. Thanks!';
    var data = new FormData(f);
    fetch('https://formsubmit.co/ajax/orvg.apparel@gmail.com', { method: 'POST', headers: { 'Accept': 'application/json' }, body: data }).catch(function () { });
    if (selectedPayment === 'paypal') redirectPayPal(total);
    else if (selectedPayment === 'orange') { window.open('https://orange.ci/money/', '_blank'); finishOrder(name); }
    else if (selectedPayment === 'djamo') { window.open('https://djamo.com/pay', '_blank'); finishOrder(name); }
    else if (selectedPayment === 'wave') { window.open('https://pay.wave.com/m/M_ci_1F_--SCMirUC/c/ci/', '_blank'); finishOrder(name); }
    else if (selectedPayment === 'yango') { window.open('https://buy.yango.com/store/caede4e7-d634-4b4f-8a0f-f54e255ed1f7', '_blank'); finishOrder(name); }
    else if (selectedPayment === 'whatsapp') {
        var items = cart.map(function (c) { return '• ' + c.name + (c.size ? ' (' + c.size + ')' : '') + ' ×' + c.qty + ': ' + fmt(c.price * c.qty); }).join('%0A');
        window.open('https://wa.me/2250799108108?text=Hello FBC! Order:%0A%0AClient: ' + name + '%0A%0A' + items + '%0A%0ATotal: ' + fmt(total), '_blank');
        finishOrder(name);
    }
}
function redirectPayPal(total) {
    var pf = document.getElementById('paypalCartForm');
    pf.querySelectorAll('.dyn').forEach(function (el) { el.remove(); });
    cart.forEach(function (c, i) {
        [['item_name_' + (i + 1), c.name + (c.size ? ' (' + c.size + ')' : '')], ['amount_' + (i + 1), fmtUSD(c.price)], ['quantity_' + (i + 1), c.qty]].forEach(function (pair) {
            var inp = document.createElement('input'); inp.type = 'hidden'; inp.name = pair[0]; inp.value = pair[1]; inp.className = 'dyn'; pf.appendChild(inp);
        });
    });
    pf.submit(); finishOrder('');
}
function finishOrder(name) { 
    // Check if an event was in the cart to unlock it
    cart.forEach(function(item) {
        if (item.key.startsWith('event-')) {
            var eventId = item.id;
            if (eventId && !unlockedEvents.includes(eventId)) {
                unlockedEvents.push(eventId);
                console.log('Event unlocked via checkout:', eventId);
            }
        }
    });

    closeCheckout(); 
    cart = []; 
    renderCart(); 
    showToast('Order confirmed! 🎉', 'Thanks ' + name + '! We\'ll contact you within 24h.'); 
}


function payWithPayPal() {
    if (!currentProduct) return;
    var qty = parseInt(document.getElementById('qtyInput').value || 1);
    var sel = document.querySelector('.size-btn.selected'); var size = sel ? sel.textContent : '';
    var pf = document.getElementById('paypalCartForm');
    pf.querySelectorAll('.dyn').forEach(function (el) { el.remove(); });
    [['item_name_1', currentProduct.name + (size ? ' (' + size + ')' : '')], ['amount_1', fmtUSD(currentProduct.price)], ['quantity_1', qty]].forEach(function (pair) {
        var i = document.createElement('input'); i.type = 'hidden'; i.name = pair[0]; i.value = pair[1]; i.className = 'dyn'; pf.appendChild(i);
    });
    pf.submit();
}
function payWithOrange() { window.open('https://orange.ci/money/', '_blank'); }
function payWithDjamo() { window.open('https://djamo.com/pay', '_blank'); }
function payWithWave() { window.open('https://pay.wave.com/m/M_ci_1F_--SCMirUC/c/ci/', '_blank'); }
function buyViaYango() { window.open('https://buy.yango.com/store/caede4e7-d634-4b4f-8a0f-f54e255ed1f7', '_blank'); }
function buyViaWhatsApp() {
    if (!currentProduct) return;
    var qty = parseInt(document.getElementById('qtyInput').value || 1);
    var sel = document.querySelector('.size-btn.selected'); var size = sel ? sel.textContent : '';
    var msg = 'Hello, I\'m interested in: ' + currentProduct.name + (size ? ' (' + size + ')' : '') + ' ×' + qty + ' — ' + fmt(currentProduct.price * qty);
    window.open('https://wa.me/2250799108108?text=' + encodeURIComponent(msg), '_blank');
}

// ===== ADMIN =====
function handleAdminClick() { 
    if (currentUser) openAdmin(); 
    else openLogin(); 
}

function openLogin() {
    document.getElementById('loginOverlay').classList.add('open');
    document.getElementById('loginEmail').focus();
}

function closeLogin() {
    document.getElementById('loginOverlay').classList.remove('open');
    document.getElementById('loginError').textContent = '';
}
async function doLogin() {
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;
    document.getElementById('loginError').textContent = '';
    if (!email || !password) { document.getElementById('loginError').textContent = 'Please fill in all fields.'; return; }
    try {
        await sbClient.auth.signOut().catch(function () { });
        var res = await sbClient.auth.signInWithPassword({ email: email, password: password });
        if (res.error) throw res.error;
        currentUser = res.data.user; closeLogin(); openAdmin();
    } catch (e) { document.getElementById('loginError').textContent = 'Invalid email or password.'; }
}
async function doLogout() { await sbClient.auth.signOut(); currentUser = null; closeAdmin(); showToast('Logged out', 'Admin session ended.'); }
function updateAdminUI() {
    var btn = document.getElementById('adminToggleBtn'); if (!btn) return;
    if (currentUser) { btn.textContent = '⚙●'; btn.style.color = '#22c55e'; btn.style.opacity = '0.4'; }
    else { btn.textContent = '⚙'; btn.style.color = '#1a1a1a'; btn.style.opacity = '0.15'; }
}

function openAdmin() {
    closeLogin();
    document.getElementById('adminOverlay').classList.add('open');
    
    // Ensure the default tab is loaded and highlighted
    var productsTab = document.querySelector('.admin-tabs .admin-tab');
    if (productsTab) {
        showAdminTab('products', productsTab);
    } else {
        loadAdminProducts();
    }
    
    loadAdminThreads();
    loadAdminEvents();
    loadHeroConfig(); // Load hero config when admin opens
    loadFeaturedPromoConfig(); // Load featured promo config
    loadAdminNotifications();
}

function closeAdmin() {
    document.getElementById('adminOverlay').classList.remove('open');
}
async function checkSupabaseConnection() {
    try {
        var res = await sbClient.from(PRODUCTS_TABLE).select('id').limit(1);
        if (res.error) throw res.error;
        setSupabaseStatus('connected', '✓ Connected to Supabase — real-time data');
    } catch (e) { setSupabaseStatus('disconnected', '✗ Supabase not configured'); }
}
async function loadAdminProducts() {
    var list = document.getElementById('adminProductList');
    list.innerHTML = '<p style="color:#666;text-align:center;padding:2rem">Loading...</p>';
    try {
        var res = await sbClient.from(PRODUCTS_TABLE).select('*').order('id');
        if (res.error) throw res.error;
        products = res.data || []; renderCatalogue(activeFilter); renderAdminProductList();
    } catch (e) { list.innerHTML = '<p style="color:#f87171;text-align:center;padding:2rem">Error: database not configured.</p>'; }
}
function renderAdminProductList() {
    document.getElementById('adminProductList').innerHTML = products.length ? products.map(function (p) {
        var disc = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0;
        var thumb = p.imgs && p.imgs[0] ? '<img src="' + p.imgs[0] + '" alt="' + p.name + '">' : '👕';
        var badge = p.badge ? '<span style="background:var(--primary);color:white;font-size:0.65rem;padding:1px 7px;border-radius:10px;font-weight:600;margin-left:4px">' + p.badge + '</span>' : '';
        var priceInfo = '<span style="color:white;font-weight:700">' + fmt(p.price) + '</span>' + (p.old_price ? ' <span style="text-decoration:line-through">' + fmt(p.old_price) + '</span> <span style="color:var(--primary)">-' + disc + '%</span>' : '');
        return '<div class="admin-product-item">' +
            '<div class="admin-product-thumb">' + thumb + '</div>' +
            '<div class="admin-product-meta"><h4>' + p.name + badge + '</h4>' +
            '<p>' + priceInfo + ' · ' + (p.category === 't-shirt' ? 'T-Shirts' : 'Sets') + ' · ' + ((p.sizes || []).join(', ') || '—') + '</p></div>' +
            '<div class="admin-product-actions">' +
            '<button class="btn-edit" onclick="editProduct(' + p.id + ')">✏ Edit</button>' +
            '<button class="btn-delete" onclick="deleteProduct(' + p.id + ')">🗑 Delete</button></div></div>';
    }).join('') : '<div style="text-align:center;padding:3rem;color:#555"><div style="font-size:2.5rem;margin-bottom:1rem">📦</div><p>No products. Click <strong style="color:var(--primary)">+ Add Product</strong>.</p></div>';
}
function editProduct(id) {
    var p = products.find(function (x) { return x.id === id; }); if (!p) return;
    document.getElementById('editProductId').value = id;
    document.getElementById('adminName').value = p.name;
    document.getElementById('adminCat').value = p.category;
    document.getElementById('adminPrice').value = p.price;
    document.getElementById('adminOldPrice').value = p.old_price || '';
    document.getElementById('adminDesc').value = p.description || '';
    document.getElementById('adminSizes').value = (p.sizes || []).join(', ');
    document.getElementById('adminBadge').value = p.badge || '';
    adminImgSlots = (p.imgs || []).concat(['', '', '', '', '']).slice(0, 5);
    renderAdminImgSlots();
    document.getElementById('adminFormTitle').textContent = '✏ Edit — ' + p.name;
    document.getElementById('btnSaveLabel').textContent = '💾 Update';
    showAdminTab('add', document.querySelectorAll('.admin-tab')[1]);
}
async function deleteProduct(id) {
    if (!confirm('Delete this product permanently?')) return;
    var isDemo = isDemoId(id);
    try {
        if (!isDemo) {
            var res = await sbClient.from(PRODUCTS_TABLE).delete().eq('id', id);
            if (res.error) throw res.error;
        }
        products = products.filter(function (p) { return p.id !== id; });
        renderAdminProductList(); renderCatalogue(activeFilter);
        showToast('Deleted', 'Product removed from catalogue.');
    } catch (e) { showToast('Error', 'Could not delete.', '#ef4444'); }
}
async function saveProduct() {
    var name = document.getElementById('adminName').value.trim();
    var cat = document.getElementById('adminCat').value;
    var price = parseInt(document.getElementById('adminPrice').value);
    var old_price = parseInt(document.getElementById('adminOldPrice').value) || null;
    var description = document.getElementById('adminDesc').value.trim();
    var sizes = document.getElementById('adminSizes').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var badge = document.getElementById('adminBadge').value.trim();
    var imgs = adminImgSlots.filter(Boolean);
    var editId = document.getElementById('editProductId').value;
    var isDemo = isDemoId(editId);
    if (!name || !price) { showToast('Required fields', 'Name and price are required.', '#f59e0b'); return; }
    var payload = { name: name, category: cat, price: price, old_price: old_price, description: description, badge: badge, sizes: sizes, imgs: imgs };
    try {
        if (editId && !isDemo) {
            var res = await sbClient.from(PRODUCTS_TABLE).update(payload).eq('id', parseInt(editId));
            if (res.error) throw res.error;
        } else {
            var res2 = await sbClient.from(PRODUCTS_TABLE).insert(payload);
            if (res2.error) throw res2.error;
        }
        await loadAdminProducts(); cancelEditProduct();
        showAdminTab('products', document.querySelectorAll('.admin-tab')[0]);
        showToast('Saved! ✓', '"' + name + '" updated in Supabase.');
    } catch (e) { showToast('Supabase Error', e.message || 'Check configuration.', '#ef4444'); }
}
function cancelEditProduct() {
    document.getElementById('editProductId').value = '';
    document.getElementById('adminName').value = '';
    document.getElementById('adminCat').value = 't-shirt';
    document.getElementById('adminPrice').value = '';
    document.getElementById('adminOldPrice').value = '';
    document.getElementById('adminDesc').value = '';
    document.getElementById('adminSizes').value = 'S, M, L, XL, XXL';
    document.getElementById('adminBadge').value = '';
    adminImgSlots = ['', '', '', '', ''];
    renderAdminImgSlots();
    document.getElementById('adminFormTitle').textContent = '+ New Product';
    document.getElementById('btnSaveLabel').textContent = '💾 Save to Supabase';
}
function showAdminTab(tab, el) {
    document.querySelectorAll('.admin-tab').forEach(function (t) { t.classList.remove('active'); }); el.classList.add('active');
    var tabMap = {
        'products': 'adminTabProducts', 'add': 'adminTabAdd',
        'artists-admin': 'adminTabArtists', 'articles-admin': 'adminTabArticles',
        'featured-articles-admin': 'adminTabFeaturedArticles',
        'threads-admin': 'adminTabThreads', 'events-admin': 'adminTabEvents',
        'hero-media': 'adminTabHeroMedia',
        'featured-promo': 'adminTabFeaturedPromo',
        'notifications-admin': 'adminTabNotifications',
        'influencers-admin': 'adminTabInfluencers'
    };
    Object.values(tabMap).forEach(function (id) { var el2 = document.getElementById(id); if (el2) el2.style.display = 'none'; });
    var target = document.getElementById(tabMap[tab]);
    if (target) target.style.display = '';
    
    // UI Initialization for specific tabs
    if (tab === 'add') renderAdminImgSlots();

    // Lazy-load data when switching tabs
    if (tab === 'artists-admin') loadAdminArtists();
    else if (tab === 'articles-admin') loadAdminArticles();
    else if (tab === 'featured-articles-admin') loadAdminFeaturedArticles();
    else if (tab === 'threads-admin') loadAdminThreads();
    else if (tab === 'events-admin') loadAdminEvents();
    else if (tab === 'notifications-admin') loadAdminNotifications();
    else if (tab === 'hero-media') loadHeroConfig();
    else if (tab === 'featured-promo') loadFeaturedPromoConfig();
    else if (tab === 'products') loadAdminProducts();
    else if (tab === 'influencers-admin') loadAdminInfluencers();
}
function renderAdminImgSlots() {
    var labels = ['Main', 'Photo 2', 'Photo 3', 'Photo 4', 'Photo 5'];
    var slotsEl = document.getElementById('adminImgSlots'); if (!slotsEl) return;
    slotsEl.innerHTML = adminImgSlots.map(function (src, i) {
        var isVideo = src && (src.split('?')[0].match(/\.(mp4|webm|ogg|mov)$|^data:video/i));
        var mediaHtml = src ? (isVideo ? 
            '<video src="' + src + '" id="slotImg_' + i + '" autoplay muted loop playsinline controls style="width:100%;height:100%;object-fit:cover"></video>' : 
            '<img src="' + src + '" alt="Slot ' + (i + 1) + '" id="slotImg_' + i + '">') : 
            '<div class="img-slot-icon">📷</div>';

        return '<div style="margin-bottom:1rem;display:flex;flex-direction:column;gap:0.5rem;align-items:center;">' +
            '<div class="img-slot" id="slot_' + i + '">' +
            mediaHtml +
            '<span class="img-slot-label">' + labels[i] + '</span>' +
            (src ? '<button class="img-slot-clear" onclick="clearSlot(event,' + i + ')">✕</button>' : '') +
            '<div class="upload-progress" id="slotProgress_' + i + '">↻ Upload...</div>' +
            '<input type="file" accept="image/*,video/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;z-index:2" onchange="uploadImageToStorage(event,' + i + ')">' +
            '</div>' +
            '<input type="text" placeholder="Upload or paste URL" value="' + (src || '') + '" onchange="updateAdminImgSlotFromInput(event, ' + i + ')" style="width:100%;font-size:0.85rem;padding:0.4rem;border-radius:6px;border:1px solid #ccc;box-sizing:border-box;">' +
            '</div>';
    }).join('');
}
function updateAdminImgSlotFromInput(e, index) {
    adminImgSlots[index] = e.target.value.trim();
    renderAdminImgSlots();
}
function clearSlot(e, i) { e.stopPropagation(); adminImgSlots[i] = ''; renderAdminImgSlots(); }
async function uploadImageToStorage(event, slotIndex) {
    var file = event.target.files[0]; if (!file) return;
    var prog = document.getElementById('slotProgress_' + slotIndex);
    if (prog) prog.classList.add('show');
    try {
        var userRes = await sbClient.auth.getUser();
        if (!userRes.data.user) throw new Error('Not authenticated');
        var ext = file.name.split('.').pop();
        var path = 'products/' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.' + ext;
        var upRes = await sbClient.storage.from(STORAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
        if (upRes.error) throw upRes.error;
        
        var urlData = sbClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        adminImgSlots[slotIndex] = urlData.data.publicUrl;
        
        if (prog) prog.classList.remove('show');
        renderAdminImgSlots();
        showToast('Photo uploaded ✓', 'Image saved and preview updated.');
    } catch (e) {
        if (prog) prog.classList.remove('show');
        if (e.message && (e.message.includes('bucket') || e.message.includes('Bucket') || e.message.includes('not found'))) {
            var reader = new FileReader();
            reader.onload = function (ev) { 
                adminImgSlots[slotIndex] = ev.target.result; 
                renderAdminImgSlots(); 
                showToast('Photo loaded (local)', 'Note: Create the "product-images" bucket in Supabase.', '#f59e0b'); 
            };
            reader.readAsDataURL(file);
        } else {
            var msg = e.message || 'Check storage permissions.';
            if (msg.includes('payload too large') || msg.includes('oversized') || e.status === 413) {
                msg = 'File too large (Max 50MB).';
            }
            showToast('Upload error', msg, '#ef4444');
        }
    }
}

// ===================================================================
// ===== ADMIN CRUD: ARTISTS ========================================
// ===================================================================
function isDemoId(id) {
    return typeof id === 'string' && /^(a|art|t|e|p|i)\d+$/.test(id);
}

var adminArtists = [];

async function loadAdminArtists() {
    var list = document.getElementById('adminArtistList'); if (!list) return;
    list.innerHTML = '<p style="color:#666;text-align:center;padding:2rem">Loading artists...</p>';
    try {
        var res = await sbClient.from('artists').select('*').order('created_at', { ascending: false });
        console.log('DEBUG loadAdminArtists: res.error=', res.error, 'res.data length=', res.data ? res.data.length : 'null');
        var liveArtists = (res.data && res.data.length > 0) ? res.data : [];
        // Merge with demo data, avoiding duplicates by ID
        var demo = typeof demoArtists !== 'undefined' ? demoArtists : [];
        console.log('DEBUG loadAdminArtists: liveArtists=', liveArtists.length, 'demo=', demo.length, 'demoIds=', demo.map(function(d){return d.id;}));
        adminArtists = liveArtists.concat(demo.filter(d => !liveArtists.find(l => l.id === d.id)));
        console.log('DEBUG loadAdminArtists: merged adminArtists=', adminArtists.length, adminArtists.map(function(a){return a.id + ':' + a.name;}));
    } catch (e) { 
        console.error('DEBUG loadAdminArtists CATCH:', e);
        adminArtists = typeof demoArtists !== 'undefined' ? demoArtists.slice() : []; 
    }
    renderAdminArtistList();
}

function renderAdminArtistList() {
    var list = document.getElementById('adminArtistList');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    if (!adminArtists.length) { list.innerHTML = '<div style="text-align:center;padding:3rem;color:#555"><div style="font-size:2.5rem;margin-bottom:1rem">🎤</div><p>No artists yet. Add your first artist below.</p></div>'; return; }
    list.innerHTML = adminArtists.map(function (a) {
        var statusColor = a.status === 'Published' ? '#22c55e' : a.status === 'Hidden' ? '#ef4444' : '#f59e0b';
        return '<div class="admin-product-item">' +
            '<div class="admin-product-thumb">' + (a.profile_image_url ? '<img src="' + a.profile_image_url + '" alt="' + a.name + '">' : '🎤') + '</div>' +
            '<div class="admin-product-meta"><h4>' + a.name + (a.is_featured ? ' ⭐' : '') + '</h4>' +
            '<p><span style="color:' + statusColor + '">' + a.status + '</span> · 🎵 ' + (a.latest_release_title || '—') + '</p></div>' +
            '<div class="admin-product-actions">' +
            '<button class="btn-edit" onclick="editArtist(\'' + a.id + '\')">✏ Edit</button>' +
            '<button class="btn-delete" onclick="deleteArtist(\'' + a.id + '\')">🗑 Delete</button></div></div>';
    }).join('');
}

function editArtist(id) {
    var a = adminArtists.find(function (x) { return x.id === id; }); if (!a) return;
    document.getElementById('editArtistId').value = id;
    document.getElementById('artistName').value = a.name || '';
    document.getElementById('artistBio').value = a.bio || '';
    document.getElementById('artistStatus').value = a.status || 'Draft';
    document.getElementById('artistProfileImg').value = a.profile_image_url || '';
    document.getElementById('artistBannerImg').value = a.banner_image_url || '';
    document.getElementById('artistPromoVideo').value = a.promo_video_url || '';
    document.getElementById('artistReleaseTitle').value = a.latest_release_title || '';
    document.getElementById('artistReleaseDate').value = a.latest_release_date || '';
    document.getElementById('artistReleaseCover').value = a.latest_release_cover_url || '';
    document.getElementById('artistReleaseListen').value = a.latest_release_listen_url || '';
    document.getElementById('artistInstagram').value = a.instagram_url || '';
    document.getElementById('artistYoutube').value = a.youtube_url || '';
    document.getElementById('artistTiktok').value = a.tiktok_spotify_url || '';
    document.getElementById('artistMerchId').value = a.merch_product_id || '';
    document.getElementById('artistFeatured').checked = a.is_featured || false;
    document.getElementById('artistFormTitle').textContent = '✏ Edit — ' + a.name;
}

function cancelEditArtist() {
    document.getElementById('editArtistId').value = '';
    ['artistName', 'artistBio', 'artistProfileImg', 'artistBannerImg', 'artistPromoVideo', 'artistReleaseTitle', 'artistReleaseDate', 'artistReleaseCover', 'artistReleaseListen', 'artistInstagram', 'artistYoutube', 'artistTiktok', 'artistMerchId'].forEach(function (id) { document.getElementById(id).value = ''; });
    document.getElementById('artistStatus').value = 'Draft';
    document.getElementById('artistFeatured').checked = false;
    document.getElementById('artistFormTitle').textContent = '+ New Artist';
}

async function saveArtist() {
    var name = document.getElementById('artistName').value.trim();
    if (!name) { showToast('Required', 'Artist name is required.', '#f59e0b'); return; }
    var payload = {
        name: name,
        bio: document.getElementById('artistBio').value.trim() || null,
        status: document.getElementById('artistStatus').value,
        profile_image_url: document.getElementById('artistProfileImg').value.trim() || null,
        banner_image_url: document.getElementById('artistBannerImg').value.trim() || null,
        promo_video_url: document.getElementById('artistPromoVideo').value.trim() || null,
        latest_release_title: document.getElementById('artistReleaseTitle').value.trim() || null,
        latest_release_date: document.getElementById('artistReleaseDate').value || null,
        latest_release_cover_url: document.getElementById('artistReleaseCover').value.trim() || null,
        latest_release_listen_url: document.getElementById('artistReleaseListen').value.trim() || null,
        instagram_url: document.getElementById('artistInstagram').value.trim() || null,
        youtube_url: document.getElementById('artistYoutube').value.trim() || null,
        tiktok_spotify_url: document.getElementById('artistTiktok').value.trim() || null,
        merch_product_id: document.getElementById('artistMerchId').value.trim() || null,
        is_featured: document.getElementById('artistFeatured').checked
    };
    var editId = document.getElementById('editArtistId').value;
    var isDemo = isDemoId(editId);
    try {
        if (editId && !isDemo) {
            var res = await sbClient.from('artists').update(payload).eq('id', editId);
            if (res.error) throw res.error;
        } else {
            var res2 = await sbClient.from('artists').insert(payload);
            if (res2.error) throw res2.error;
            if (isDemo && typeof demoArtists !== 'undefined') {
                demoArtists = demoArtists.filter(function (d) { return d.id !== editId; });
            }
        }
        cancelEditArtist(); await loadAdminArtists(); refreshFrontendData();
        showToast('Saved! ✓', '"' + name + '" saved to Supabase.');
    } catch (e) { showToast('Error', e.message || 'Could not save artist.', '#ef4444'); }
}

async function deleteArtist(id) {
    if (!confirm('Delete this artist permanently?')) return;
    var isDemo = isDemoId(id);
    try {
        if (!isDemo) {
            var res = await sbClient.from('artists').delete().eq('id', id);
            if (res.error) throw res.error;
        } else if (typeof demoArtists !== 'undefined') {
            demoArtists = demoArtists.filter(function (d) { return d.id !== id; });
        }
        adminArtists = adminArtists.filter(function (a) { return a.id !== id; });
        renderAdminArtistList(); refreshFrontendData();
        showToast('Deleted', 'Artist removed.');
    } catch (e) { showToast('Error', 'Could not delete artist.', '#ef4444'); }
}

// ===================================================================
// ===== ADMIN CRUD: ARTICLES =======================================
// ===================================================================
var adminArticles = [];

async function loadAdminArticles() {
    var list = document.getElementById('adminArticleList'); if (!list) return;
    list.innerHTML = '<p style="color:#666;text-align:center;padding:2rem">Loading articles...</p>';
    try {
        var res = await sbClient.from('articles').select('*').order('created_at', { ascending: false });
        var liveArticles = (res.data && res.data.length > 0) ? res.data : [];
        var demo = typeof demoArticles !== 'undefined' ? demoArticles : [];
        adminArticles = liveArticles.concat(demo.filter(d => !liveArticles.find(l => l.id === d.id)));
    } catch (e) { 
        console.error('ERROR IN loadAdminArticles:', e);
        adminArticles = typeof demoArticles !== 'undefined' ? demoArticles.slice() : []; 
    }
    renderAdminArticleList();
    console.log("ARTICLES RENDERED HTML:", document.getElementById('adminArticleList').outerHTML);
    console.log("DEMO ARTICLES:", demoArticles);
}

async function loadAdminFeaturedArticles() {
    var list = document.getElementById('featuredArticlesAdminList'); if (!list) return;
    list.innerHTML = '<p style="color:#666;text-align:center;padding:2rem">Loading featured articles...</p>';
    // We already have adminArticles loaded or can load them
    if (!adminArticles.length) {
        await loadAdminArticles();
    }
    renderAdminFeaturedArticlesList();
}

function renderAdminFeaturedArticlesList() {
    var list = document.getElementById('featuredArticlesAdminList');
    var featured = adminArticles.filter(function(a) { return a.is_featured; });
    
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    
    if (!featured.length) { 
        list.innerHTML = '<div style="text-align:center;padding:3rem;color:#555"><div style="font-size:2.5rem;margin-bottom:1rem">⭐</div><p>No featured articles yet. Mark articles as "Featured" in the Articles tab.</p></div>'; 
        return; 
    }
    
    var catIcons = { article: '📰', vlog: '🎥', howto: '💡', hot: '🔥' };
    list.innerHTML = '<h3 style="margin-bottom:1rem; color:var(--primary)">Featured Articles (Top 3 on Home)</h3>' + 
    featured.map(function (a) {
        var statusColor = a.status === 'Published' ? '#22c55e' : a.status === 'Hidden' ? '#ef4444' : '#f59e0b';
        return '<div class="admin-product-item">' +
            '<div class="admin-product-thumb">' + (a.cover_image_url ? '<img src="' + a.cover_image_url + '" alt="' + a.title + '">' : (catIcons[a.category] || '📄')) + '</div>' +
            '<div class="admin-product-meta"><h4>' + a.title + '</h4>' +
            '<p><span style="color:' + statusColor + '">' + a.status + '</span> · ' + (catIcons[a.category] || '') + ' ' + (a.category || '') + '</p></div>' +
            '<div class="admin-product-actions">' +
            '<button class="btn-edit" onclick="showAdminTab(\'articles-admin\', document.querySelector(\'[onclick*=\\\'articles-admin\\\']\')); editArticle(\'' + a.id + '\')">✏ Edit</button>' +
            '<button class="btn-delete" onclick="deleteArticle(\'' + a.id + '\')">🗑 Delete</button></div></div>';
    }).join('');
}

function renderAdminArticleList() {
    var list = document.getElementById('adminArticleList');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    if (!adminArticles.length) { list.innerHTML = '<div style="text-align:center;padding:3rem;color:#555"><div style="font-size:2.5rem;margin-bottom:1rem">📰</div><p>No articles yet. Create your first article below.</p></div>'; return; }
    var catIcons = { article: '📰', vlog: '🎥', howto: '💡', hot: '🔥' };
    list.innerHTML = adminArticles.map(function (a) {
        var statusColor = a.status === 'Published' ? '#22c55e' : a.status === 'Hidden' ? '#ef4444' : '#f59e0b';
        return '<div class="admin-product-item">' +
            '<div class="admin-product-thumb">' + (a.cover_image_url ? '<img src="' + a.cover_image_url + '" alt="' + a.title + '">' : (catIcons[a.category] || '📄')) + '</div>' +
            '<div class="admin-product-meta"><h4>' + a.title + (a.is_featured ? ' ⭐' : '') + (a.is_trending ? ' 🔥' : '') + '</h4>' +
            '<p><span style="color:' + statusColor + '">' + a.status + '</span> · ' + (catIcons[a.category] || '') + ' ' + (a.category || '') + ' · By ' + (a.author || 'FBC') + '</p></div>' +
            '<div class="admin-product-actions">' +
            '<button class="btn-edit" onclick="editArticle(\'' + a.id + '\')">✏ Edit</button>' +
            '<button class="btn-delete" onclick="deleteArticle(\'' + a.id + '\')">🗑 Delete</button></div></div>';
    }).join('');
}

function editArticle(id) {
    var a = adminArticles.find(function (x) { return x.id === id; }); if (!a) return;
    document.getElementById('editArticleId').value = id;
    document.getElementById('articleTitle').value = a.title || '';
    document.getElementById('articleCategory').value = a.category || 'article';
    document.getElementById('articleAuthor').value = a.author || '';
    document.getElementById('articleCoverImg').value = a.cover_image_url || '';
    document.getElementById('articlePromoVideo').value = a.promo_video_url || '';
    document.getElementById('articleExtLink').value = a.external_link || '';
    document.getElementById('articleExcerpt').value = a.excerpt || '';
    document.getElementById('articleBody').value = a.body_content || '';
    document.getElementById('articlePublishDate').value = a.publish_date ? a.publish_date.slice(0, 16) : '';
    document.getElementById('articleStatus').value = a.status || 'Draft';
    document.getElementById('articleFeatured').checked = a.is_featured || false;
    document.getElementById('articleTrending').checked = a.is_trending || false;
    document.getElementById('articleFormTitle').textContent = '✏ Edit — ' + a.title;
}

function cancelEditArticle() {
    document.getElementById('editArticleId').value = '';
    ['articleTitle', 'articleAuthor', 'articleCoverImg', 'articlePromoVideo', 'articleExtLink', 'articleExcerpt', 'articleBody', 'articlePublishDate'].forEach(function (id) { document.getElementById(id).value = ''; });
    document.getElementById('articleCategory').value = 'article';
    document.getElementById('articleStatus').value = 'Draft';
    document.getElementById('articleFeatured').checked = false;
    document.getElementById('articleTrending').checked = false;
    document.getElementById('articleFormTitle').textContent = '+ New Article';
}

async function saveArticle() {
    var title = document.getElementById('articleTitle').value.trim();
    if (!title) { showToast('Required', 'Article title is required.', '#f59e0b'); return; }
    var payload = {
        title: title,
        category: document.getElementById('articleCategory').value,
        author: document.getElementById('articleAuthor').value.trim() || 'FBC Editorial',
        cover_image_url: document.getElementById('articleCoverImg').value.trim() || null,
        promo_video_url: document.getElementById('articlePromoVideo').value.trim() || null,
        external_link: document.getElementById('articleExtLink').value.trim() || null,
        excerpt: document.getElementById('articleExcerpt').value.trim() || null,
        body_content: document.getElementById('articleBody').value || null,
        publish_date: document.getElementById('articlePublishDate').value || null,
        status: document.getElementById('articleStatus').value,
        is_featured: document.getElementById('articleFeatured').checked,
        is_trending: document.getElementById('articleTrending').checked
    };
    var editId = document.getElementById('editArticleId').value;
    var isDemo = isDemoId(editId);
    var btn = event?.target || document.querySelector('button[onclick="saveArticle()"]');
    var originalText = btn ? btn.textContent : '💾 Save Article';

    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
    try {
        if (editId && !isDemo) {
            var res = await sbClient.from('articles').update(payload).eq('id', editId);
            if (res.error) throw res.error;
        } else {
            var res2 = await sbClient.from('articles').insert(payload);
            if (res2.error) throw res2.error;
            if (isDemo && typeof demoArticles !== 'undefined') {
                demoArticles = demoArticles.filter(function (d) { return d.id !== editId; });
            }
        }
        cancelEditArticle(); await loadAdminArticles(); refreshFrontendData();
        showToast('Saved! ✓', '"' + title + '" saved.');
    } catch (e) { 
        console.error('saveArticle error:', e);
        showToast('Error', e.message || 'Could not save article.', '#ef4444'); 
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
}

async function deleteArticle(id) {
    if (!confirm('Delete this article permanently?')) return;
    var isDemo = isDemoId(id);
    try {
        if (!isDemo) {
            var res = await sbClient.from('articles').delete().eq('id', id);
            if (res.error) throw res.error;
        } else if (typeof demoArticles !== 'undefined') {
            demoArticles = demoArticles.filter(function (d) { return d.id !== id; });
        }
        adminArticles = adminArticles.filter(function (a) { return a.id !== id; });
        renderAdminArticleList(); refreshFrontendData();
        showToast('Deleted', 'Article removed.');
    } catch (e) { showToast('Error', 'Could not delete article.', '#ef4444'); }
}

// ===================================================================
// ===== ADMIN CRUD: THREADS ========================================
// ===================================================================
var adminThreads = [];

async function loadAdminThreads() {
    var list = document.getElementById('adminThreadList'); if (!list) return;
    list.innerHTML = '<p style="color:#666;text-align:center;padding:2rem">Loading threads...</p>';
    try {
        var res = await sbClient.from('threads').select('*').order('priority_order', { ascending: true });
        var liveThreads = (res.data && res.data.length > 0) ? res.data : [];
        var demo = typeof demoThreads !== 'undefined' ? demoThreads : [];
        adminThreads = liveThreads.concat(demo.filter(d => !liveThreads.find(l => l.id === d.id)));
    } catch (e) { adminThreads = typeof demoThreads !== 'undefined' ? demoThreads.slice() : []; }
    renderAdminThreadList();
}

function renderAdminThreadList() {
    var list = document.getElementById('adminThreadList');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    if (!adminThreads.length) { list.innerHTML = '<div style="text-align:center;padding:3rem;color:#555"><div style="font-size:2.5rem;margin-bottom:1rem">💬</div><p>No threads yet. Start a conversation below.</p></div>'; return; }
    var tagIcons = { Hot: '🔥', Trend: '📈', News: '📰' };
    list.innerHTML = adminThreads.map(function (t) {
        var statusColor = t.status === 'Active' ? '#22c55e' : '#ef4444';
        return '<div class="admin-product-item">' +
            '<div class="admin-product-thumb">' + (tagIcons[t.tag] || '💬') + '</div>' +
            '<div class="admin-product-meta"><h4>' + (t.is_pinned ? '📌 ' : '') + t.title + '</h4>' +
            '<p><span style="color:' + statusColor + '">' + t.status + '</span> · ' + t.tag + ' · Priority: ' + t.priority_order + '</p></div>' +
            '<div class="admin-product-actions">' +
            '<button class="btn-edit" onclick="editThread(\'' + t.id + '\')">✏ Edit</button>' +
            '<button class="btn-delete" onclick="deleteThread(\'' + t.id + '\')">🗑 Delete</button></div></div>';
    }).join('');
}

function editThread(id) {
    var t = adminThreads.find(function (x) { return x.id === id; }); if (!t) return;
    document.getElementById('editThreadId').value = id;
    document.getElementById('threadTitle').value = t.title || '';
    document.getElementById('threadTag').value = t.tag || 'Hot';
    document.getElementById('threadHook').value = t.hook_text || '';
    document.getElementById('threadCoverImg').value = t.cover_image_url || '';
    document.getElementById('threadPromoVideo').value = t.promo_video_url || '';
    document.getElementById('threadExtLink').value = t.external_link || '';
    document.getElementById('threadStatus').value = t.status || 'Active';
    document.getElementById('threadPriority').value = t.priority_order || 0;
    document.getElementById('threadPinned').checked = t.is_pinned || false;
    document.getElementById('threadFormTitle').textContent = '✏ Edit — ' + t.title;
}

function cancelEditThread() {
    document.getElementById('editThreadId').value = '';
    ['threadTitle', 'threadHook', 'threadCoverImg', 'threadPromoVideo', 'threadExtLink'].forEach(function (id) { document.getElementById(id).value = ''; });
    document.getElementById('threadTag').value = 'Hot';
    document.getElementById('threadStatus').value = 'Active';
    document.getElementById('threadPriority').value = '0';
    document.getElementById('threadPinned').checked = false;
    document.getElementById('threadFormTitle').textContent = '+ New Thread';
}

async function saveThread() {
    var title = document.getElementById('threadTitle').value.trim();
    if (!title) { showToast('Required', 'Thread title is required.', '#f59e0b'); return; }
    var payload = {
        title: title,
        tag: document.getElementById('threadTag').value,
        hook_text: document.getElementById('threadHook').value.trim() || null,
        cover_image_url: document.getElementById('threadCoverImg').value.trim() || null,
        promo_video_url: document.getElementById('threadPromoVideo').value.trim() || null,
        external_link: document.getElementById('threadExtLink').value.trim() || null,
        status: document.getElementById('threadStatus').value,
        priority_order: parseInt(document.getElementById('threadPriority').value) || 0,
        is_pinned: document.getElementById('threadPinned').checked
    };
    var editId = document.getElementById('editThreadId').value;
    var isDemo = isDemoId(editId);
    try {
        if (editId && !isDemo) {
            var res = await sbClient.from('threads').update(payload).eq('id', editId);
            if (res.error) throw res.error;
        } else {
            var res2 = await sbClient.from('threads').insert(payload);
            if (res2.error) throw res2.error;
            if (isDemo && typeof demoThreads !== 'undefined') {
                demoThreads = demoThreads.filter(function (d) { return d.id !== editId; });
            }
        }
        cancelEditThread(); await loadAdminThreads(); refreshFrontendData();
        showToast('Saved! ✓', '"' + title + '" saved.');
    } catch (e) { showToast('Error', e.message || 'Could not save thread.', '#ef4444'); }
}

async function deleteThread(id) {
    if (!confirm('Delete this thread permanently?')) return;
    var isDemo = isDemoId(id);
    try {
        if (!isDemo) {
            var res = await sbClient.from('threads').delete().eq('id', id);
            if (res.error) throw res.error;
        } else if (typeof demoThreads !== 'undefined') {
            demoThreads = demoThreads.filter(function (d) { return d.id !== id; });
        }
        adminThreads = adminThreads.filter(function (t) { return t.id !== id; });
        renderAdminThreadList(); refreshFrontendData();
        showToast('Deleted', 'Thread removed.');
    } catch (e) { showToast('Error', 'Could not delete thread.', '#ef4444'); }
}

// ===================================================================
// ===== ADMIN CRUD: EVENTS =========================================
// ===================================================================
var adminEvents = [];

async function loadAdminEvents() {
    var list = document.getElementById('adminEventList'); if (!list) return;
    list.innerHTML = '<p style="color:#666;text-align:center;padding:2rem">Loading events...</p>';
    try {
        var res = await sbClient.from('events').select('*').order('event_date', { ascending: true });
        var liveEvents = (res.data && res.data.length > 0) ? res.data : [];
        var demo = typeof demoEvents !== 'undefined' ? demoEvents : [];
        adminEvents = liveEvents.concat(demo.filter(d => !liveEvents.find(l => l.id === d.id)));
    } catch (e) { adminEvents = typeof demoEvents !== 'undefined' ? demoEvents.slice() : []; }
    renderAdminEventList();
}

function renderAdminEventList() {
    var list = document.getElementById('adminEventList');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    if (!adminEvents.length) { list.innerHTML = '<div style="text-align:center;padding:3rem;color:#555"><div style="font-size:2.5rem;margin-bottom:1rem">🎫</div><p>No events yet. Create your first event below.</p></div>'; return; }
    list.innerHTML = adminEvents.map(function (e) {
        var statusColor = e.status === 'Published' ? '#22c55e' : e.status === 'Hidden' ? '#ef4444' : '#f59e0b';
        var d = new Date(e.event_date);
        var dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return '<div class="admin-product-item">' +
            '<div class="admin-product-thumb">' + (e.cover_image_url ? '<img src="' + e.cover_image_url + '" alt="' + e.title + '">' : '🎫') + '</div>' +
            '<div class="admin-product-meta"><h4>' + e.title + '</h4>' +
            '<p><span style="color:' + statusColor + '">' + e.status + '</span> · 📅 ' + dateStr + ' · 📍 ' + e.location_name + '</p></div>' +
            '<div class="admin-product-actions">' +
            '<button class="btn-edit" onclick="editEvent(\'' + e.id + '\')">✏ Edit</button>' +
            '<button class="btn-delete" onclick="deleteEvent(\'' + e.id + '\')">🗑 Delete</button></div></div>';
    }).join('');
}

function editEvent(id) {
    var e = adminEvents.find(function (x) { return x.id === id; }); if (!e) return;
    document.getElementById('editEventId').value = id;
    document.getElementById('eventTitle').value = e.title || '';
    document.getElementById('eventDate').value = e.event_date ? e.event_date.slice(0, 16) : '';
    document.getElementById('eventDescription').value = e.description || '';
    document.getElementById('eventVenue').value = e.location_name || '';
    document.getElementById('eventAddress').value = e.location_address || '';
    document.getElementById('eventCoverImg').value = e.cover_image_url || '';
    document.getElementById('eventPromoVideo').value = e.promo_video_url || '';
    document.getElementById('eventExtLink').value = e.external_link || '';
    document.getElementById('eventTicketUrl').value = e.ticketing_url || '';
    document.getElementById('eventArtistId').value = e.featured_artist_id || '';
    document.getElementById('eventStatus').value = e.status || 'Draft';
    document.getElementById('eventFormTitle').textContent = '✏ Edit — ' + e.title;
}

function cancelEditEvent() {
    document.getElementById('editEventId').value = '';
    ['eventTitle', 'eventDate', 'eventDescription', 'eventVenue', 'eventAddress', 'eventCoverImg', 'eventPromoVideo', 'eventExtLink', 'eventTicketUrl', 'eventArtistId'].forEach(function (id) { document.getElementById(id).value = ''; });
    document.getElementById('eventStatus').value = 'Draft';
    document.getElementById('eventFormTitle').textContent = '+ New Event';
}

async function saveEvent() {
    var title = document.getElementById('eventTitle').value.trim();
    var eventDate = document.getElementById('eventDate').value;
    var venue = document.getElementById('eventVenue').value.trim();
    if (!title || !eventDate || !venue) { showToast('Required', 'Title, date, and venue are required.', '#f59e0b'); return; }
    var payload = {
        title: title,
        event_date: eventDate,
        description: document.getElementById('eventDescription').value.trim() || null,
        location_name: venue,
        location_address: document.getElementById('eventAddress').value.trim() || null,
        cover_image_url: document.getElementById('eventCoverImg').value.trim() || null,
        promo_video_url: document.getElementById('eventPromoVideo').value.trim() || null,
        external_link: document.getElementById('eventExtLink').value.trim() || null,
        ticketing_url: document.getElementById('eventTicketUrl').value.trim() || null,
        featured_artist_id: document.getElementById('eventArtistId').value.trim() || null,
        status: document.getElementById('eventStatus').value
    };
    var editId = document.getElementById('editEventId').value;
    var isDemo = isDemoId(editId);
    try {
        if (editId && !isDemo) {
            var res = await sbClient.from('events').update(payload).eq('id', editId);
            if (res.error) throw res.error;
        } else {
            var res2 = await sbClient.from('events').insert(payload);
            if (res2.error) throw res2.error;
            if (isDemo && typeof demoEvents !== 'undefined') {
                demoEvents = demoEvents.filter(function (d) { return d.id !== editId; });
            }
        }
        cancelEditEvent(); await loadAdminEvents(); refreshFrontendData();
        showToast('Saved! ✓', '"' + title + '" saved.');
    } catch (e) { showToast('Error', e.message || 'Could not save event.', '#ef4444'); }
}

async function deleteEvent(id) {
    if (!confirm('Delete this event permanently?')) return;
    var isDemo = isDemoId(id);
    try {
        if (!isDemo) {
            var res = await sbClient.from('events').delete().eq('id', id);
            if (res.error) throw res.error;
        } else if (typeof demoEvents !== 'undefined') {
            demoEvents = demoEvents.filter(function (d) { return d.id !== id; });
        }
        adminEvents = adminEvents.filter(function (e) { return e.id !== id; });
        renderAdminEventList(); refreshFrontendData();
        showToast('Deleted', 'Event removed.');
    } catch (e) { showToast('Error', 'Could not delete event.', '#ef4444'); }
}

// ===================================================================
// ===== ADMIN CRUD: INFLUENCERS ====================================
// ===================================================================
const INFLUENCERS_TABLE = 'influencers';
var adminInfluencers = [];

async function loadAdminInfluencers() {
    var list = document.getElementById('adminInfluencerList'); if (!list) return;
    list.innerHTML = '<p style="color:#666;text-align:center;padding:2rem">Loading influencers...</p>';
    try {
        var res = await sbClient.from(INFLUENCERS_TABLE).select('*').order('created_at', { ascending: false });
        var liveInfluencers = (res.data && res.data.length > 0) ? res.data : [];
        var demo = typeof demoInfluencers !== 'undefined' ? demoInfluencers : [];
        adminInfluencers = liveInfluencers.concat(demo.filter(d => !liveInfluencers.find(l => l.id === d.id)));
    } catch (e) {
        console.error('ERROR IN loadAdminInfluencers:', e);
        adminInfluencers = typeof demoInfluencers !== 'undefined' ? demoInfluencers.slice() : [];
    }
    renderAdminInfluencerList();
}

function renderAdminInfluencerList() {
    var list = document.getElementById('adminInfluencerList');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    if (!adminInfluencers.length) { list.innerHTML = '<div style="text-align:center;padding:3rem;color:#555"><div style="font-size:2.5rem;margin-bottom:1rem">🌟</div><p>No influencers yet. Add your first influencer below.</p></div>'; return; }
    list.innerHTML = adminInfluencers.map(function (i) {
        return '<div class="admin-product-item">' +
            '<div class="admin-product-thumb">' + (i.profile_image_url ? '<img src="' + i.profile_image_url + '" alt="' + i.name + '">' : '🌟') + '</div>' +
            '<div class="admin-product-meta"><h4>' + i.name + '</h4>' +
            '<p>' + (i.category || 'Influencer') + '</p></div>' +
            '<div class="admin-product-actions">' +
            '<button class="btn-edit" onclick="editInfluencer(\'' + i.id + '\')">✏ Edit</button>' +
            '<button class="btn-delete" onclick="deleteInfluencer(\'' + i.id + '\')">🗑 Delete</button></div></div>';
    }).join('');
}

function editInfluencer(id) {
    var i = adminInfluencers.find(function (x) { return x.id === id; }); if (!i) return;
    document.getElementById('editInfluencerId').value = id;
    document.getElementById('influencerName').value = i.name || '';
    document.getElementById('influencerCategory').value = i.category || '';
    document.getElementById('influencerBio').value = i.bio || '';
    document.getElementById('influencerProfileImg').value = i.profile_image_url || '';
    document.getElementById('influencerBannerImg').value = i.banner_image_url || '';
    document.getElementById('influencerInstagram').value = i.ig_url || '';
    document.getElementById('influencerYoutube').value = i.yt_url || '';
    document.getElementById('influencerTikTok').value = i.tiktok_spotify_url || '';
    document.getElementById('influencerFormTitle').textContent = '✏ Edit — ' + i.name;
}

function cancelEditInfluencer() {
    document.getElementById('editInfluencerId').value = '';
    ['influencerName', 'influencerCategory', 'influencerBio', 'influencerProfileImg', 'influencerBannerImg', 'influencerInstagram', 'influencerYoutube', 'influencerTikTok'].forEach(function (id) { document.getElementById(id).value = ''; });
    document.getElementById('influencerFormTitle').textContent = '+ New Influencer';
}

async function saveInfluencer() {
    var name = document.getElementById('influencerName').value.trim();
    if (!name) { showToast('Required', 'Influencer name is required.', '#f59e0b'); return; }
    var payload = {
        name: name,
        category: document.getElementById('influencerCategory').value.trim() || null,
        bio: document.getElementById('influencerBio').value.trim() || null,
        profile_image_url: document.getElementById('influencerProfileImg').value.trim() || null,
        banner_image_url: document.getElementById('influencerBannerImg').value.trim() || null,
        ig_url: document.getElementById('influencerInstagram').value.trim() || null,
        yt_url: document.getElementById('influencerYoutube').value.trim() || null,
        tiktok_spotify_url: document.getElementById('influencerTikTok').value.trim() || null
    };
    var editId = document.getElementById('editInfluencerId').value;
    var isDemo = isDemoId(editId);
    var btn = event?.target || document.querySelector('button[onclick="saveInfluencer()"]');
    var originalText = btn ? btn.textContent : '💾 Save Influencer';

    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
    try {
        if (editId && !isDemo) {
            var res = await sbClient.from(INFLUENCERS_TABLE).update(payload).eq('id', editId);
            if (res.error) throw res.error;
        } else {
            var res2 = await sbClient.from(INFLUENCERS_TABLE).insert(payload);
            if (res2.error) throw res2.error;
            if (isDemo && typeof demoInfluencers !== 'undefined') {
                demoInfluencers = demoInfluencers.filter(function (d) { return d.id !== editId; });
            }
        }
        cancelEditInfluencer(); await loadAdminInfluencers(); refreshFrontendData();
        showToast('Saved! ✓', '"' + name + '" saved to Supabase.');
    } catch (e) { showToast('Error', e.message || 'Could not save influencer.', '#ef4444'); }
    finally {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
}

async function deleteInfluencer(id) {
    if (!confirm('Delete this influencer permanently?')) return;
    var isDemo = isDemoId(id);
    try {
        if (!isDemo) {
            var res = await sbClient.from(INFLUENCERS_TABLE).delete().eq('id', id);
            if (res.error) throw res.error;
        } else if (typeof demoInfluencers !== 'undefined') {
            demoInfluencers = demoInfluencers.filter(function (d) { return d.id !== id; });
        }
        adminInfluencers = adminInfluencers.filter(function (i) { return i.id !== id; });
        renderAdminInfluencerList(); refreshFrontendData();
        showToast('Deleted', 'Influencer removed.');
    } catch (e) { showToast('Error', 'Could not delete influencer.', '#ef4444'); }
}

// ===================================================================
// ===== ADMIN: NOTIFICATIONS =======================================
// ===================================================================
var adminNotifications = [];

async function loadAdminNotifications() {
    var list = document.getElementById('adminNotificationList'); if (!list) return;
    list.innerHTML = '<p style="color:#666;text-align:center;padding:2rem">Loading notifications...</p>';
    try {
        var res = await sbClient.from('notifications').select('*').order('created_at', { ascending: false });
        if (res.error) throw res.error;
        adminNotifications = res.data || [];
    } catch (e) { adminNotifications = []; }
    renderAdminNotificationList();
    renderNotifAnalytics();
}

function renderAdminNotificationList() {
    var list = document.getElementById('adminNotificationList');
    if (!adminNotifications.length) { list.innerHTML = '<div style="text-align:center;padding:3rem;color:#555"><div style="font-size:2.5rem;margin-bottom:1rem">📣</div><p>No notifications sent yet. Compose your first notification below.</p></div>'; return; }
    list.innerHTML = adminNotifications.map(function (n) {
        var statusIcon = n.status === 'sent' ? '✅' : '📝';
        var openRate = n.total_sent ? Math.round((n.total_opened / n.total_sent) * 100) : 0;
        return '<div class="admin-product-item">' +
            '<div class="admin-product-thumb">' + statusIcon + '</div>' +
            '<div class="admin-product-meta"><h4>' + n.title + '</h4>' +
            '<p>' + statusIcon + ' ' + n.status + ' · 📤 ' + (n.total_sent || 0) + ' sent · 👀 ' + (n.total_opened || 0) + ' opened (' + openRate + '%)</p></div>' +
            '<div class="admin-product-actions">' +
            (n.status === 'draft' ? '<button class="btn-edit" onclick="editNotification(\'' + n.id + '\')">✏ Edit</button>' +
                '<button class="btn-save" onclick="sendNotification(\'' + n.id + '\')" style="background:#22c55e;font-size:.75rem;padding:4px 10px;border-radius:6px;color:white;border:none;cursor:pointer">📣 Send</button>' : '') +
            '<button class="btn-delete" onclick="deleteNotification(\'' + n.id + '\')">🗑 Delete</button></div></div>';
    }).join('');
}

function renderNotifAnalytics() {
    var el = document.getElementById('notifAnalytics'); if (!el) return;
    if (!adminNotifications.length) { el.innerHTML = 'No data yet.'; return; }
    var totalSent = adminNotifications.reduce(function (s, n) { return s + (n.total_sent || 0); }, 0);
    var totalOpened = adminNotifications.reduce(function (s, n) { return s + (n.total_opened || 0); }, 0);
    var avgRate = totalSent ? Math.round((totalOpened / totalSent) * 100) : 0;
    el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;text-align:center">' +
        '<div><div style="font-size:1.5rem;font-weight:700;color:white">' + adminNotifications.length + '</div><div>Total Notifications</div></div>' +
        '<div><div style="font-size:1.5rem;font-weight:700;color:white">' + totalSent + '</div><div>Total Sent</div></div>' +
        '<div><div style="font-size:1.5rem;font-weight:700;color:var(--primary)">' + avgRate + '%</div><div>Avg Open Rate</div></div></div>';
}

function editNotification(id) {
    var n = adminNotifications.find(function (x) { return x.id === id; }); if (!n) return;
    document.getElementById('editNotificationId').value = id;
    document.getElementById('notifTitle').value = n.title || '';
    document.getElementById('notifType').value = n.type || 'general';
    document.getElementById('notifBody').value = n.body || '';
    document.getElementById('notifImage').value = n.image_url || '';
    document.getElementById('notifDeepLink').value = n.deep_link || '';
    document.getElementById('notificationFormTitle').textContent = '✏ Edit Notification';
}

function cancelEditNotification() {
    document.getElementById('editNotificationId').value = '';
    ['notifTitle', 'notifBody', 'notifImage', 'notifDeepLink'].forEach(function (id) { document.getElementById(id).value = ''; });
    document.getElementById('notifType').value = 'general';
    document.getElementById('notificationFormTitle').textContent = '📣 Compose Notification';
}

async function saveNotification() {
    var title = document.getElementById('notifTitle').value.trim();
    var body = document.getElementById('notifBody').value.trim();
    if (!title || !body) { showToast('Required', 'Title and body are required.', '#f59e0b'); return; }
    var payload = {
        title: title,
        body: body,
        type: document.getElementById('notifType').value,
        image_url: document.getElementById('notifImage').value.trim() || null,
        deep_link: document.getElementById('notifDeepLink').value.trim() || null,
        status: 'draft'
    };
    var editId = document.getElementById('editNotificationId').value;
    try {
        if (editId) {
            var res = await sbClient.from('notifications').update(payload).eq('id', editId);
            if (res.error) throw res.error;
        } else {
            var res2 = await sbClient.from('notifications').insert(payload);
            if (res2.error) throw res2.error;
        }
        cancelEditNotification(); await loadAdminNotifications();
        showToast('Saved! ✓', 'Notification draft saved.');
    } catch (e) { showToast('Error', e.message || 'Could not save notification.', '#ef4444'); }
}

async function sendNotification(idOverride) {
    var notifId = idOverride || document.getElementById('editNotificationId').value;
    // If no existing ID, save first then send
    if (!notifId) {
        var title = document.getElementById('notifTitle').value.trim();
        var body = document.getElementById('notifBody').value.trim();
        if (!title || !body) { showToast('Required', 'Title and body are required.', '#f59e0b'); return; }
        try {
            var insertRes = await sbClient.from('notifications').insert({
                title: title, body: body, type: document.getElementById('notifType').value,
                image_url: document.getElementById('notifImage').value.trim() || null,
                deep_link: document.getElementById('notifDeepLink').value.trim() || null,
                status: 'draft'
            }).select().single();
            if (insertRes.error) throw insertRes.error;
            notifId = insertRes.data.id;
        } catch (e) { showToast('Error', e.message || 'Could not create notification.', '#ef4444'); return; }
    }
    // Invoke the Edge Function
    try {
        var fnRes = await sbClient.functions.invoke('send-notification', {
            body: { notification_id: notifId }
        });
        if (fnRes.error) throw fnRes.error;
        cancelEditNotification(); await loadAdminNotifications();
        showToast('📣 Sent!', 'Notification dispatched to all devices.');
    } catch (e) {
        showToast('Send Error', e.message || 'Edge function not configured. Save the notification draft and deploy the send-notification function.', '#ef4444');
        await loadAdminNotifications();
    }
}

async function deleteNotification(id) {
    if (!confirm('Delete this notification permanently?')) return;
    try {
        var res = await sbClient.from('notifications').delete().eq('id', id);
        if (res.error) throw res.error;
        adminNotifications = adminNotifications.filter(function (n) { return n.id !== id; });
        renderAdminNotificationList(); renderNotifAnalytics();
        showToast('Deleted', 'Notification removed.');
    } catch (e) { showToast('Error', 'Could not delete.', '#ef4444'); }
}

// ===================================================================
// ===== FRONTEND DATA REFRESH ======================================
// ===================================================================
async function refreshFrontendData() {
    // Re-fetch and re-render all frontend sections from Supabase
    // Live data fully replaces demo data when available
    try {
        var aRes = await sbClient.from('artists').select('*').eq('status', 'Published').order('created_at', { ascending: false });
        // Use live data exclusively if available; otherwise fall back to demo
        var displayArtists = (!aRes.error && aRes.data && aRes.data.length > 0) ? aRes.data : (typeof demoArtists !== 'undefined' ? demoArtists : []);
        renderArtists('featuredArtistsGrid', displayArtists.filter(function (a) { return a.is_featured; }));
        renderArtists('allArtistsGrid', displayArtists);
    } catch (e) { renderArtists('featuredArtistsGrid', demoArtists.filter(a => a.is_featured)); renderArtists('allArtistsGrid', demoArtists); }

    try {
        var artRes = await sbClient.from('articles').select('*').eq('status', 'Published').order('publish_date', { ascending: false });
        var displayArticles = (!artRes.error && artRes.data && artRes.data.length > 0) ? artRes.data : (typeof demoArticles !== 'undefined' ? demoArticles : []);
        renderFeaturedArticlesSplit('featuredArticlesGrid', displayArticles.filter(function (a) { return a.is_featured; }));
        renderArticles('allArticlesGrid', displayArticles);
    } catch (e) { renderFeaturedArticlesSplit('featuredArticlesGrid', demoArticles.filter(a => a.is_featured)); renderArticles('allArticlesGrid', demoArticles); }

    try {
        var tRes = await sbClient.from('threads').select('*').eq('status', 'Active').order('priority_order');
        var displayThreads = (!tRes.error && tRes.data && tRes.data.length > 0) ? tRes.data : (typeof demoThreads !== 'undefined' ? demoThreads : []);
        renderThreads('allThreadsList', displayThreads);
    } catch (e) { renderThreads('allThreadsList', demoThreads); }

    try {
        var eRes = await sbClient.from('events').select('*').eq('status', 'Published').order('event_date');
        var displayEvents = (!eRes.error && eRes.data && eRes.data.length > 0) ? eRes.data : (typeof demoEvents !== 'undefined' ? demoEvents : []);
        renderEvents('featuredEventsGrid', displayEvents.slice(0, 3));
        renderEvents('allEventsGrid', displayEvents);
    } catch (e) { renderEvents('featuredEventsGrid', demoEvents.slice(0, 3)); renderEvents('allEventsGrid', demoEvents); }

    try {
        var iRes = await sbClient.from(INFLUENCERS_TABLE).select('*').order('name');
        var displayInfluencers = (!iRes.error && iRes.data && iRes.data.length > 0) ? iRes.data : (typeof demoInfluencers !== 'undefined' ? demoInfluencers : []);
        renderInfluencers('allInfluencersGrid', displayInfluencers);
    } catch (e) { renderInfluencers('allInfluencersGrid', demoInfluencers); }

    if (currentPage === 'home') loadHeroMedia();

    // Final translation pass
    setTimeout(applyTranslations, 100);
}

// ===== NEWSLETTER =====
function handleNewsletter(e) {
    e.preventDefault();
    var name = e.target.name.value;
    fetch('https://formsubmit.co/ajax/contact@fueledbycreation.com', { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(e.target) }).catch(function () { });
    showToast('Welcome to the Tribe! 🎉', 'Thanks ' + name + '!');
    e.target.reset();
}

// ===== CHAT WIDGET =====
function toggleChat() {
    var toggle = document.getElementById('chatToggle');
    var channels = document.getElementById('chatChannels');
    toggle.classList.toggle('open');
    channels.classList.toggle('open');
}

// ===== FRONTEND DETAIL VIEWS (Supporting Deep Links) =====
async function openArtistDetail(id) {
    // Hide any other details first
    document.querySelectorAll('.overlay').forEach(ov => ov.classList.remove('open'));
    var a = demoArtists.find(x => x.id === id);
    if (!a && sbClient) {
        var res = await sbClient.from('artists').select('*').eq('id', id).single();
        if (!res.error) a = res.data;
    }
    if (!a) return;

    document.getElementById('artistNameDetail').textContent = a.name;
    document.getElementById('artistBioDetail').textContent = a.bio || '';
    
    // Media handling for Hero
    var heroWrap = document.getElementById('artistHero');
    var mediaContainer = document.getElementById('artistHeroMedia');
    if (mediaContainer) {
        var isVideo = a.banner_image_url && (a.banner_image_url.match(/\.(mp4|webm|ogg|mov)$|^data:video/i) || a.promo_video_url);
        if (isVideo) {
            mediaContainer.innerHTML = '<video src="' + (a.promo_video_url || a.banner_image_url) + '" autoplay muted loop playsinline controls style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1"></video>';
            heroWrap.style.backgroundImage = 'none';
        } else {
            mediaContainer.innerHTML = '';
            heroWrap.style.backgroundImage = a.banner_image_url ? `url(${a.banner_image_url})` : 'linear-gradient(135deg, #1a1a1a, #0d0d0d)';
        }
    }

    document.getElementById('artistProfileImgDetail').src = a.profile_image_url || 'https://via.placeholder.com/150';

    // Release
    document.getElementById('releaseTitleDetail').textContent = a.latest_release_title || 'No recent release';
    document.getElementById('releaseCoverDetail').src = a.latest_release_cover_url || 'https://via.placeholder.com/300';
    document.getElementById('releaseLinkDetail').href = a.latest_release_listen_url || '#';

    // Social
    document.getElementById('artistInstaDetail').href = a.instagram_url || '#';
    document.getElementById('artistYoutubeDetail').href = a.youtube_url || '#';
    
    var tiktok = document.getElementById('artistTikTokDetail');
    if (tiktok) { 
        tiktok.href = a.tiktok_spotify_url || '#'; 
        tiktok.style.display = a.tiktok_spotify_url ? 'inline-flex' : 'none'; 
    }

    document.getElementById('artistDetail').classList.add('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function openArticleDetail(id) {
    // Hide any other details first
    document.querySelectorAll('.overlay').forEach(ov => ov.classList.remove('open'));
    var a = demoArticles.find(x => x.id === id);
    if (!a && sbClient) {
        var res = await sbClient.from('articles').select('*').eq('id', id).single();
        if (!res.error) a = res.data;
    }
    if (!a) return;

    // Calculate reading time
    var words = (a.body_content || '').replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    var readTime = Math.max(1, Math.ceil(words / 200));

    document.getElementById('articleTitleDetail').textContent = a.title;
    document.getElementById('articleAuthorDetail').innerHTML = 
        '<span style="color:var(--primary);font-weight:700">' + (a.author || 'FBC Editorial') + '</span> · ' + 
        formatDate(a.publish_date) + ' · <span style="opacity:0.7">⏱️ ' + readTime + ' min read</span>';
    
    var mediaWrap = document.getElementById('articleMediaWrap');
    if (mediaWrap) {
        var videoUrl = a.promo_video_url || a.cover_image_url;
        var isVideo = videoUrl && videoUrl.split('?')[0].match(/\.(mp4|webm|ogg|mov)$|^data:video/i);
        if (isVideo) {
            mediaWrap.innerHTML = `<video src="${videoUrl}" autoplay muted loop playsinline controls style="width:100%;max-height:500px;object-fit:cover;display:block"></video>`;
        } else {
            mediaWrap.innerHTML = '<img id="articleCoverDetail" src="' + (a.cover_image_url || 'https://via.placeholder.com/800x400') + '" alt="Cover" class="article-detail-cover" style="width:100%;display:block;border-bottom:1px solid rgba(0,0,0,0.05)">';
        }
    }

    // Add External Link if exists
    var bodyContent = a.body_content || '<p style="color:#888;font-style:italic">No content available for this article.</p>';
    if (a.external_link) {
        bodyContent += '<div style="margin-top:3rem;text-align:center;padding:2rem;background:var(--light);border-radius:12px">' +
                       '<p style="margin-bottom:1rem;font-weight:600">Want to dive deeper?</p>' +
                       '<a href="' + a.external_link + '" target="_blank" class="btn-primary" style="display:inline-block;width:auto;padding:1rem 2.5rem;font-size:1.1rem;box-shadow:0 10px 20px rgba(255,107,53,0.3)">Explore More Content &rarr;</a>' +
                       '</div>';
    }
    
    const bodyEl = document.getElementById('articleBodyDetail');
    bodyEl.innerHTML = bodyContent;
    bodyEl.style.fontSize = '1.15rem';
    bodyEl.style.lineHeight = '1.8';
    bodyEl.style.color = '#222';

    document.getElementById('articleDetail').classList.add('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function openEventDetail(id) {
    // Hide any other details first
    document.querySelectorAll('.overlay').forEach(ov => ov.classList.remove('open'));
    var e = demoEvents.find(x => x.id === id);
    if (!e && sbClient) {
        var res = await sbClient.from('events').select('*').eq('id', id).single();
        if (!res.error) e = res.data;
    }
    if (!e) return;

    document.getElementById('eventTitleDetail').textContent = e.title;
    document.getElementById('eventDateDetail').innerHTML = `📅 ${formatDate(e.event_date)}`;
    document.getElementById('eventLocDetail').innerHTML = `📍 ${e.location_name}`;
    document.getElementById('eventDescDetail').textContent = e.description || '';
    
    var mediaWrap = document.getElementById('eventMediaWrap');
    if (mediaWrap) {
        var videoUrl = e.promo_video_url || e.cover_image_url;
        var isVideo = videoUrl && videoUrl.split('?')[0].match(/\.(mp4|webm|ogg|mov)$|^data:video/i);
        if (isVideo) {
            mediaWrap.innerHTML = `<video src="${videoUrl}" autoplay muted loop playsinline controls style="width:100%;max-height:400px;object-fit:cover;display:block"></video>`;
        } else {
            mediaWrap.innerHTML = '<img id="eventCoverDetail" src="' + (e.cover_image_url || 'https://via.placeholder.com/800x400') + '" alt="Event" class="event-detail-cover" style="width:100%;display:block">';
        }
    }

    // Add External Link if exists
    var eventDesc = e.description || '';
    if (e.external_link) {
        eventDesc += '\n\nMore info: ' + e.external_link;
    }
    document.getElementById('eventDescDetail').textContent = eventDesc;

    var ticketBtn = document.getElementById('eventTicketBtnDetail');
    if (ticketBtn) {
        if (e.ticketing_url) {
            ticketBtn.href = e.ticketing_url;
            ticketBtn.style.display = 'block';
        } else {
            ticketBtn.style.display = 'none';
        }
    }

    // Set up the premium payment gate button
    var joinBtn = document.getElementById('eventJoinBtn');
    if (joinBtn) {
        if (unlockedEvents.includes(e.id)) {
            joinBtn.textContent = '🎟️ Access Granted';
            joinBtn.disabled = true;
            joinBtn.classList.add('btn-success');
        } else {
            joinBtn.textContent = 'Join Exclusive Event';
            joinBtn.disabled = false;
            joinBtn.classList.remove('btn-success');
            joinBtn.onclick = function() { 
                window.currentEvent = e; // Set current event for processEventPayment
                processEventPayment(); 
            };
        }
    }

    document.getElementById('eventDetail').classList.add('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== INFLUENCERS IMPLEMENTATION =====
function renderInfluencers(targetGridId, list) {
    var grid = document.getElementById(targetGridId); if (!grid) return;
    if (!list.length) { grid.innerHTML = '<div class="empty-state"><p>No influencers yet.</p></div>'; return; }
    grid.innerHTML = list.map(function (a) {
        var imgHtml = a.profile_image_url ? '<img src="' + a.profile_image_url + '" alt="' + a.name + '" loading="lazy">' : '';
        return '<div class="artist-card" onclick="openInfluencerDetail(\'' + a.id + '\')">' +
            '<div class="artist-card-img">' + imgHtml + '</div>' +
            '<div class="artist-card-body">' +
            '<h3 class="artist-card-name">' + a.name + '</h3>' +
            '<p class="artist-card-release">🌟 ' + (a.category || 'Cultural Icon') + '</p>' +
            '<div class="artist-card-actions">' +
            '<button class="btn-sm btn-view-profile" onclick="event.stopPropagation();openInfluencerDetail(\'' + a.id + '\')">View Profile</button>' +
            '</div></div></div>';
    }).join('');
}

async function loadInfluencers() {
    if (!sbClient) { influencers = demoInfluencers; renderInfluencers('allInfluencersGrid', influencers); return; }
    try {
        var res = await sbClient.from(INFLUENCERS_TABLE).select('*').order('name');
        influencers = res.data || demoInfluencers;
        renderInfluencers('allInfluencersGrid', influencers);
    } catch (e) { influencers = demoInfluencers; renderInfluencers('allInfluencersGrid', influencers); }
}

function openInfluencerDetail(id) {
    // Hide any other details first
    document.querySelectorAll('.overlay').forEach(ov => ov.classList.remove('open'));
    var a = influencers.find(function (x) { return x.id == id; });
    if (!a) return;
    var overlay = document.getElementById('influencerDetail');
    if (overlay) {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        document.getElementById('influencerNameDetail').textContent = a.name;
        document.getElementById('influencerBioDetail').textContent = a.bio || '';
        document.getElementById('influencerProfileImgDetail').src = a.profile_image_url || '';
        
        var ig = document.getElementById('influencerInstaDetail');
        if (ig) { ig.href = a.ig_url || '#'; ig.style.display = a.ig_url ? 'inline-flex' : 'none'; }
        var yt = document.getElementById('influencerYoutubeDetail');
        if (yt) { yt.href = a.yt_url || '#'; yt.style.display = a.yt_url ? 'inline-flex' : 'none'; }
        var tiktok = document.getElementById('influencerTikTokDetail');
        if (tiktok) { tiktok.href = a.tiktok_spotify_url || '#'; tiktok.style.display = a.tiktok_spotify_url ? 'inline-flex' : 'none'; }
    }
}

function closeDetail() {
    document.getElementById('artistDetail').classList.remove('open');
    document.getElementById('articleDetail').classList.remove('open');
    document.getElementById('eventDetail').classList.remove('open');
    document.getElementById('influencerDetail').classList.remove('open');
    window.location.hash = currentPage;
}

function closeArtistDetail() { closeDetail(); }
function closeArticleDetail() { closeDetail(); }

// ===== UTILITIES =====
function fmt(n) { return Number(n).toLocaleString('fr-FR') + ' FCFA'; }
function fmtUSD(n) { return (n / 655).toFixed(2); }
function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    return d.toLocaleDateString(window.getLang() === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
async function handleAdminMediaUpload(event, targetInputId, bucket) {
    const file = event.target.files[0];
    if (!file) return;

    const targetInput = document.getElementById(targetInputId);
    if (!targetInput) return;

    // Memory-efficient preview using Object URL (v1.0.4 fix for crashes)
    const previewUrl = URL.createObjectURL(file);
    const previewBtn = event.target.previousElementSibling;
    if (previewBtn && previewBtn.classList.contains('btn-upload-trigger')) {
        previewBtn.style.color = 'var(--primary)';
        if (file.type.startsWith('video/')) {
            previewBtn.innerHTML = '🎥';
        } else {
            previewBtn.innerHTML = '📷';
        }
    }
    targetInput.value = 'Uploading...';

    showToast('Uploading...', 'Please wait while we fuel the tribe media.', '#3b82f6');

    try {
        const userRes = await sbClient.auth.getUser();
        if (!userRes.data.user) throw new Error('Not authenticated');

        let ext = file.name.split('.').pop().toLowerCase();
        // Force video extensions for reliable detection on load
        if (file.type.startsWith('video/') && !['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
            ext = 'mp4';
        }

        const path = `${bucket}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const upRes = await sbClient.storage.from(STORAGE_BUCKET).upload(path, file, { 
            contentType: file.type, 
            upsert: false 
        });

        if (upRes.error) throw upRes.error;

        const urlData = sbClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        targetInput.value = urlData.data.publicUrl;
        
        // Clean up object URL
        URL.revokeObjectURL(previewUrl);
        
        showToast('Success!', 'Media uploaded successfully.', '#22c55e');
    } catch (e) {
        console.error('Admin upload error:', e);
        targetInput.value = '';
        var msg = e.message || 'Check connection.';
        if (msg.includes('payload too large') || msg.includes('oversized') || e.status === 413) {
            msg = 'File too large (Max 50MB for video).';
        }
        showToast('Upload Error', msg, '#ef4444');
    }
}

function showToast(title, body, borderColor) {
    borderColor = borderColor || '#22c55e';
    var t = document.getElementById('toast');
    t.style.borderLeftColor = borderColor;
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastBody').textContent = body;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 3500);
}

function applyTranslations() {
    if (!window.i18n) return;
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = window.i18n.t(key);
    });

    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = window.i18n.t(key);
    });
}



window.shareContent = async function (title, link) {
    var shareText = "Download the app and join the community: ";
    
    // Attempt native share if available (Capacitor)
    try {
        const Share = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share;
        if (Share) {
            await Share.share({
                title: title,
                text: shareText,
                url: link,
                dialogTitle: 'Share with the Tribe'
            });
            return;
        }
    } catch (err) {
        console.warn('Native share failed, falling back:', err);
    }

    // Web Share API fallback
    if (navigator.share) {
        navigator.share({
            title: title,
            text: shareText,
            url: link
        }).catch(function (err) {
            console.error('Web share error:', err);
        });
    } else {
        // Clipboard fallback
        navigator.clipboard.writeText(shareText + "\n" + link).then(function () {
            showToast('Link Copied', 'Share link copied to clipboard.', '#3b82f6');
        });
    }
};


// ===================================================================
// ===== COMMUNITY CONTENT: UPLOADS & HOT TOPICS ====================
// ===================================================================
var contentUploadedUrl = '';

function openContentUpload() {
    document.getElementById('contentTitle').value = '';
    document.getElementById('contentCategory').value = 'thread';
    document.getElementById('contentBody').value = '';
    document.getElementById('contentExternalLink').value = '';
    document.getElementById('contentMediaType').value = 'image';
    document.getElementById('contentEventDate').value = '';
    document.getElementById('contentEventLocation').value = '';
    contentUploadedUrl = '';
    document.getElementById('contentMediaPreview').innerHTML = '📷 Click to upload image';
    document.getElementById('contentUploadOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    toggleContentFields();
}

function closeContentUpload() {
    document.getElementById('contentUploadOverlay').classList.remove('open');
    document.body.style.overflow = '';
}

function toggleContentFields() {
    var category = document.getElementById('contentCategory').value;
    document.getElementById('eventFields').style.display = (category === 'event') ? 'block' : 'none';
}

async function handleContentFileSelect(event) {
    var file = event.target.files[0];
    if (!file) return;

    var progress = document.getElementById('contentUploadProgress');
    var preview = document.getElementById('contentMediaPreview');
    progress.classList.add('show');
    preview.style.opacity = '0.3';

    try {
        // Ensure user is logged in if RLS requires it, or handle as public if allowed
        // Note: content_utils.js uses window.sbClient
        // Efficient preview (v1.0.4)
        const previewUrl = URL.createObjectURL(file);
        if (file.type.startsWith('video/')) {
            preview.innerHTML = '<video src="' + previewUrl + '" style="width:100%; height:100%; object-fit:cover; border-radius:12px" controls autoplay muted loop playsinline></video>';
            document.getElementById('contentMediaType').value = 'video';
        } else {
            preview.innerHTML = '<img src="' + previewUrl + '" style="width:100%; height:100%; object-fit:cover; border-radius:12px">';
            document.getElementById('contentMediaType').value = 'image';
        }

        contentUploadedUrl = await window.uploadContentFile(file);
        
        // Clean up object URL after upload completes or updates
        // URL.revokeObjectURL(previewUrl); // Keep it for the preview display though
        
        showToast('Media Ready ✓', 'Your media has been uploaded to the cloud.');
    } catch (e) {
        console.error('Content upload failed:', e);
        showToast('Upload Failed', e.message || 'Supabase Storage error.', '#ef4444');
    } finally {
        progress.classList.remove('show');
        preview.style.opacity = '1';
    }
}

async function submitCommunityContent() {
    var title = document.getElementById('contentTitle').value.trim();
    var body = document.getElementById('contentBody').value.trim();
    var category = document.getElementById('contentCategory').value;

    if (!title || !body) {
        showToast('Required Fields', 'Title and Content are required.', '#f59e0b');
        return;
    }

    var btn = document.getElementById('btnContentSubmit');
    var originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
        var payload = {
            title: title,
            content: body,
            category: category,
            media_url: contentUploadedUrl || null,
            media_type: document.getElementById('contentMediaType').value,
            external_link: document.getElementById('contentExternalLink').value.trim() || null,
            user_id: currentUser ? currentUser.id : null,
            is_pinned: false // Initially false
        };

        if (category === 'event') {
            payload.event_date = document.getElementById('contentEventDate').value || null;
            payload.location = document.getElementById('contentEventLocation').value.trim() || null;
        }

        await window.saveCommunityTopic(payload);
        showToast('Success! 🚀', 'Your contribution has been fueled to the tribe.');
        closeContentUpload();
        loadHotTopics(); // Refresh the feed
    } catch (e) {
        console.error('submitCommunityContent error:', e);
        showToast('Submission Failed', e.message || 'Check your connection.', '#ef4444');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

async function loadHotTopics() {
    var container = document.getElementById('allThreadsList');
    var pinnedWrap = document.getElementById('pinnedArticleWrap');
    if (!container) return;

    try {
        var threads = await window.fetchCommunityTopics();
        if (!threads || threads.length === 0) return;

        // Extract Pinned Item
        var pinnedItem = threads.find(x => x.is_pinned);
        var regularTopics = threads.filter(x => !x.is_pinned);

        if (pinnedWrap) {
            if (pinnedItem) {
                var mediaHtml = '';
                if (pinnedItem.media_url) {
                    if (pinnedItem.media_type === 'video') {
                        mediaHtml = '<video src="' + pinnedItem.media_url + '" autoplay muted loop playsinline controls style="width:100%; height:100%; object-fit:contain;"></video>';
                    } else {
                        mediaHtml = '<img src="' + pinnedItem.media_url + '" alt="Pinned">';
                    }
                }
                pinnedWrap.innerHTML = `
                    <div class="pinned-article-card" onclick="viewTopicDetail('${pinnedItem.id}')">
                        <div class="pinned-media">${mediaHtml}</div>
                        <div class="pinned-content">
                            <span class="badge-featured">PINNED</span>
                            <h3 class="pinned-title">${pinnedItem.title}</h3>
                            <p class="pinned-hook">${pinnedItem.content.substring(0, 150)}...</p>
                            <span class="pinned-cta">Read the full story →</span>
                        </div>
                    </div>
                `;
            } else {
                pinnedWrap.innerHTML = '';
            }
        }

        container.innerHTML = regularTopics.map(function (t) {
            var score = (t.likes_count * 2) + t.comments_count + t.views_count;
            var isHot = score > 15;
            var catIcon = t.category === 'article' ? '📰' : (t.category === 'event' ? '🎫' : '💬');
            
            var mediaHtml = '';
            if (t.media_url) {
                if (t.media_type === 'video' || t.media_url.split('?')[0].match(/\.(mp4|webm|ogg|mov)$|^data:video/i)) {
                    mediaHtml = '<div class="thread-media-preview video" style="height: 180px; width: 100%; border-radius: 12px; overflow: hidden; margin-bottom: 1rem;"><video src="' + t.media_url + '" autoplay muted loop playsinline style="width:100%; height:100%; object-fit:cover;" controls></video></div>';
                } else {
                    mediaHtml = '<div class="thread-media-preview" style="background-image:url(\'' + t.media_url + '\')"></div>';
                }
            }

            return '<div class="thread-card ' + (isHot ? 'hot-item' : '') + '" onclick="viewTopicDetail(\'' + t.id + '\')">' +
                mediaHtml +
                '<div class="thread-info-wrap">' +
                '<div class="thread-tag-wrap">' +
                '<span class="thread-tag ' + (t.category === 'event' ? 'news' : (isHot ? 'hot' : 'trend')) + '">' +
                (isHot ? '🔥 ' : '') + catIcon + ' ' + t.category.toUpperCase() +
                '</span>' +
                '</div>' +
                '<div class="thread-info">' +
                '<h4 class="thread-title">' + t.title + '</h4>' +
                '<p class="thread-hook">' + (t.content.substring(0, 100)) + '...</p>' +
                '</div>' +
                '<div class="thread-actions-grid">' +
                '<button class="thread-action-btn" onclick="event.stopPropagation();handleTopicLike(\'' + t.id + '\')">' +
                '<span>❤️</span><span class="count">' + (t.likes_count || 0) + '</span>' +
                '</button>' +
                '<div class="thread-action-btn"><span>💬</span><span class="count">' + (t.comments_count || 0) + '</span></div>' +
                '<div class="thread-action-btn"><span>👀</span><span class="count">' + (t.views_count || 0) + '</span></div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }).join('');

    } catch (e) {
        console.error('Error loading hot topics:', e);
        // FALLBACK: Use demo data if table is missing or connection fails
        if (typeof demoThreads !== 'undefined') {
            console.log('Falling back to demo threads...');
            renderThreads('allThreadsList', demoThreads);
        }
    }
}

function loadHeroMedia() {
    var heroMedia = document.getElementById('heroMedia');
    if (!heroMedia) return;
    var url = currentHeroUrl;
    // Strip query string for extension detection
    var urlWithoutQuery = url.split('?')[0].toLowerCase();
    var isVideo = urlWithoutQuery.match(/\.(mp4|webm|ogg|mov|m4v)$/) || url.includes('play_480p') || url.includes('play_720p') || url.includes('b-cdn.net');
    var isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    var isVimeo = url.includes('vimeo.com');

    if (isYouTube) {
        var videoId = '';
        if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
        else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
        heroMedia.innerHTML = '<iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&mute=1&loop=1&playlist=' + videoId + '&controls=0&showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    } else if (isVimeo) {
        var vimeoId = url.split('vimeo.com/')[1].split('?')[0];
        heroMedia.innerHTML = '<iframe src="https://player.vimeo.com/video/' + vimeoId + '?autoplay=1&muted=1&loop=1&background=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
    } else if (isVideo) {
        heroMedia.innerHTML = '<video src="' + url + '" autoplay muted loop playsinline></video>';
    } else {
        heroMedia.innerHTML = '<img src="' + url + '" alt="Hero">';
    }
}

function loadSectionHeroMedia(sectionName, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var url = sectionHeroes[sectionName];
    
    // Clear the container (keep only the overlay)
    Array.from(container.children).forEach(child => {
        if (!child.classList.contains('section-hero-overlay')) {
            child.remove();
        }
    });

    if (!url) return;

    var isVideo = url.split('?')[0].match(/\.(mp4|webm|ogg|mov)$/i) || url.match(/^data:video/i);
    var isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    var isVimeo = url.includes('vimeo.com');

    var mediaHtml = '';
    if(isVideo) {
        mediaHtml = '<video src="' + url + '" autoplay muted loop playsinline></video>';
    } else if (isYoutube) {
        var ytId = url.includes('v') ? url.split('v=')[1]?.split('&')[0] : url.split('youtu.be/')[1]?.split('?')[0];
        mediaHtml = '<iframe src="https://www.youtube.com/embed/' + ytId + '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + ytId + '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    } else if (isVimeo) {
        var vimeoId = url.split('vimeo.com/')[1].split('?')[0];
        mediaHtml = '<iframe src="https://player.vimeo.com/video/' + vimeoId + '?autoplay=1&muted=1&loop=1&background=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
    } else {
        mediaHtml = '<img src="' + url + '" alt="' + sectionName + ' Hero">';
    }
    
    container.insertAdjacentHTML('afterbegin', mediaHtml);
}

async function handleTopicLike(id) {
    // Optimistic UI Update: Instantly change the heart to red
    const btnArr = Array.from(document.querySelectorAll(`button[onclick="event.stopPropagation();handleTopicLike('${id}')"]`));
    btnArr.forEach(btn => {
        btn.classList.add('active');
        const countSpan = btn.querySelector('.count');
        if (countSpan && !btn.hasAttribute('data-liked')) {
            countSpan.textContent = parseInt(countSpan.textContent || '0') + 1;
            btn.setAttribute('data-liked', 'true');
        } else if (countSpan && btn.hasAttribute('data-liked')) {
            countSpan.textContent = parseInt(countSpan.textContent || '1') - 1;
            btn.removeAttribute('data-liked');
            btn.classList.remove('active');
        }
    });

    try {
        const userId = currentUser ? currentUser.id : null;
        await window.toggleTopicLike(id, userId);
        // We only reload if we actually need the real numbers synced, but optimistic is usually enough.
        // loadHotTopics(); 
    } catch (e) {
        console.error('Like failed:', e);
        showToast('Like failed', 'Server error.', '#ef4444');
    }
}

// Global state to track currently open topic
let currentTopicId = null;

async function viewTopicDetail(id) {
    currentTopicId = id;
    await window.incrementTopicViews(id);
    
    // Increment optimistic view count in feed
    const topicsArr = document.querySelectorAll(`div[onclick="viewTopicDetail('${id}')"]`);
    topicsArr.forEach(t => {
        const viewSpan = t.querySelector('.thread-action-btn:last-child .count');
        if(viewSpan) viewSpan.textContent = parseInt(viewSpan.textContent || '0') + 1;
    });

    const threads = await window.fetchCommunityTopics();
    const t = threads.find(x => x.id === id);
    if (!t) return;

    // Build the topic main content
    let mediaHtml = '';
    if (t.media_url) {
        if (t.media_type === 'video' || t.media_url.split('?')[0].match(/\.(mp4|webm|ogg|mov)$|^data:video/i)) {
            mediaHtml = `<div class="topic-main-media"><video src="${t.media_url}" autoplay muted loop playsinline controls></video></div>`;
        } else {
            mediaHtml = `<div class="topic-main-media"><img src="${t.media_url}" alt="Media"></div>`;
        }
    }

    const tContent = `
        ${mediaHtml}
        <h2 class="topic-main-title">${t.title}</h2>
        <div class="topic-main-body">${t.content}</div>
        
        ${t.external_link ? `<a href="${t.external_link}" target="_blank" class="btn-primary" style="display:inline-block; margin-top: 1rem;">View External Link ↗</a>` : ''}
        
        <div class="topic-main-stats">
            <button class="topic-stat-btn" onclick="handleTopicLike('${id}')">
                <span class="icon">❤️</span> <span class="count">${t.likes_count || 0}</span>
            </button>
            <div class="topic-stat-btn">
                <span>💬</span> <span class="count">${t.comments_count || 0}</span>
            </div>
            <div class="topic-stat-btn">
                <span>👀</span> <span class="count">${t.views_count || 0}</span>
            </div>
        </div>
    `;

    document.getElementById('topicDetailContent').innerHTML = tContent;
    document.getElementById('topicCommentsList').innerHTML = '<p style="color:#888; text-align:center; padding: 2rem;">Loading comments...</p>';
    
    const overlay = document.getElementById('topicDetailOverlay');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    await loadCommentsForTopic(id);
}

function closeTopicDetail() {
    document.getElementById('topicDetailOverlay').classList.remove('open');
    document.body.style.overflow = '';
    currentTopicId = null;
}

async function loadCommentsForTopic(id) {
    if (!sbClient) return;
    try {
        const { data: comments, error } = await sbClient
            .from('comments')
            .select('*')
            .eq('topic_id', id)
            .order('created_at', { ascending: true }); // Oldest first for a standard chat thread

        if (error) throw error;
        renderComments(comments);
    } catch (e) {
        console.error('Failed to load comments:', e);
        document.getElementById('topicCommentsList').innerHTML = '<p class="empty-comments">Failed to load comments.</p>';
    }
}

function renderComments(comments) {
    const list = document.getElementById('topicCommentsList');
    if (!comments || comments.length === 0) {
        list.innerHTML = `
            <div class="empty-comments">
                <div style="font-size:2rem; margin-bottom: 0.5rem;">🤫</div>
                <p>No comments yet. Be the first to start the conversation!</p>
            </div>
        `;
        return;
    }

    list.innerHTML = comments.map(c => {
        // Since we don't have user profiles heavily fleshed out yet, we use generic avatars or anon names.
        // We can extract initials if user_name was stored, but falling back to simple icons.
        const fallbackName = c.user_id ? 'Tribe Member' : 'Anonymous';
        return `
            <div class="comment-item">
                <div class="comment-avatar">👤</div>
                <div class="comment-bubble">
                    <div class="comment-meta">
                        <span class="comment-author">${fallbackName}</span>
                        <span>${new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="comment-text">${c.content}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Auto-scroll to bottom of comments
    const scrollBox = document.querySelector('.topic-body-scroll');
    if(scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
}

window.submitNewComment = async function() {
    if (!currentTopicId) return;
    const input = document.getElementById('newCommentInput');
    const content = input.value.trim();
    if (!content) return;

    // For now we allow anonymous commenting to lower friction, unless RLS blocks it inside sbClient
    const userId = currentUser ? currentUser.id : null; 
    
    const originalText = input.value;
    input.value = 'Sending...';
    input.disabled = true;

    try {
        await window.submitTopicComment(currentTopicId, userId, content);
        input.value = '';
        await loadCommentsForTopic(currentTopicId);
        showToast('Comment Posted', 'Your voice was added to the tribe.', '#22c55e');
    } catch (e) {
        input.value = originalText;
        console.error('Failed to comment:', e);
        showToast('Error', 'Failed to post comment. Ensure you are signed in.', '#ef4444');
    } finally {
        input.disabled = false;
        input.focus();
    }
};

// Expose close function securely
window.closeTopicDetail = closeTopicDetail;
window.handleTopicLike = handleTopicLike;
window.viewTopicDetail = viewTopicDetail;

// ===== EVENT PAYMENT GATE =====
var currentEvent = null;
var unlockedEvents = []; // Track paid events in this session

async function openEventPaymentGate(id) {
    console.log('Opening Event Payment Gate for:', id);
    // Find the event in demo or live data
    var e = demoEvents.find(function(x) { return x.id === id; });
    if (!e && window.sbClient) {
        try {
            var res = await window.sbClient.from('events').select('*').eq('id', id).single();
            if (res.data) e = res.data;
        } catch (err) { console.error('Gate fetch error:', err); }
    }
    
    // Crucial: Update global state
    window.currentEvent = e;
    
    if (!e) {
        console.warn('Event not found for gate:', id);
    }
    
    var gateTitle = document.getElementById('gateEventTitle');
    if (gateTitle) gateTitle.textContent = e ? e.title : 'Exclusive FBC Event';
    
    var overlay = document.getElementById('eventPaymentOverlay');
    if (overlay) {
        overlay.classList.add('open');
    }
}



function closeEventPaymentGate() {
    var overlay = document.getElementById('eventPaymentOverlay');
    if (overlay) {
        overlay.classList.remove('open');
        overlay.style.display = 'none'; // Explicitly hide
    }
    document.body.style.overflow = '';
}


async function processEventPayment() {
    if (!window.currentEvent) {
        console.error('No event selected for payment.');
        showToast('Error', 'Please select an event first.');
        return;
    }
    
    // Close the gate and open the real checkout
    closeEventPaymentGate();
    
    // Add the event to the cart as a special checkout item
    // This allows us to use the professional checkout flow
    var eventItem = {
        id: window.currentEvent.id,
        name: '🎟️ ' + window.currentEvent.title,
        price: 0, // Events are often free or handle payment at redirect, but we want the form
        qty: 1,
        img: window.currentEvent.cover_image_url || ''
    };
    
    // For events, we clear the cart to focus on the ticket
    cart = [{ key: 'event-' + eventItem.id, ...eventItem }];
    renderCart();
    openCheckout();
}




// Ensure Hot Topics load on trends page switch
var originalSwitchPage = switchPage;
switchPage = function (page) {
    originalSwitchPage(page);
    if (page === 'trends') loadHotTopics();
};

// Auto-load if landing on trends
if (currentPage === 'trends') loadHotTopics();


// ===== GLOBAL EXPORTS FOR HTML INTERACTION =====
// This is critical because app.js is a module, but index.html uses inline onclick handlers.

window.sbClient = sbClient;
window.currentUser = currentUser;
window.products = products;
window.cart = cart;
window.currentPage = currentPage;
window.currentEvent = currentEvent;
window.unlockedEvents = unlockedEvents;

window.switchPage = switchPage;
window.handleRouting = handleRouting;
window.toggleMobileMenu = toggleMobileMenu;
window.showToast = showToast;
window.formatDate = formatDate;
window.toggleChat = toggleChat;
window.shareContent = shareContent;

window.loadProducts = loadProducts;
window.showLoadedCatalogue = showLoadedCatalogue;
window.filterProducts = filterProducts;
window.handleOverlayClick = handleOverlayClick;
window.openProduct = openProduct;
window.closeProduct = closeProduct;
window.selectThumb = selectThumb;
window.selectSize = selectSize;
window.changeQty = changeQty;
window.quickAddToCart = quickAddToCart;
window.addToCartFromModal = addToCartFromModal;
window.toggleCart = toggleCart;
window.removeFromCart = removeFromCart;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.selectPayment = selectPayment;
window.submitOrder = submitOrder;
window.payWithPayPal = payWithPayPal;
window.payWithOrange = payWithOrange;
window.payWithDjamo = payWithDjamo;
window.payWithWave = payWithWave;
window.buyViaYango = buyViaYango;
window.buyViaWhatsApp = buyViaWhatsApp;

window.openArtistDetail = openArtistDetail;
window.closeArtistDetail = closeArtistDetail;
window.openArticleDetail = openArticleDetail;
window.closeArticleDetail = closeArticleDetail;
window.openEventDetail = openEventDetail;
window.closeDetail = closeDetail;
window.openEventPaymentGate = openEventPaymentGate;
window.closeEventPaymentGate = closeEventPaymentGate;
window.processEventPayment = processEventPayment;

window.loadHotTopics = loadHotTopics;
window.filterTrends = filterTrends;
window.handleTopicLike = handleTopicLike;
window.viewTopicDetail = viewTopicDetail;

window.fmt = fmt;
window.fmtUSD = fmtUSD;

window.openContentUpload = openContentUpload;
window.closeContentUpload = closeContentUpload;
window.submitCommunityContent = submitCommunityContent;
window.handleContentFileSelect = handleContentFileSelect;
window.toggleContentFields = toggleContentFields;

window.openLogin = openLogin;
window.closeLogin = closeLogin;
window.doLogin = doLogin;
window.doLogout = doLogout;
window.handleAdminClick = handleAdminClick;
window.updateAdminUI = updateAdminUI;
window.openAdmin = openAdmin;
window.closeAdmin = closeAdmin;
window.showAdminTab = showAdminTab;
window.saveHeroConfig = saveHeroConfig;
window.saveFeaturedPromoConfig = saveFeaturedPromoConfig;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.cancelEditProduct = cancelEditProduct;
window.clearSlot = clearSlot;
window.uploadImageToStorage = uploadImageToStorage;
window.saveArtist = saveArtist;
window.editArtist = editArtist;
window.deleteArtist = deleteArtist;
window.cancelEditArtist = cancelEditArtist;
window.saveArticle = saveArticle;
window.editArticle = editArticle;
window.deleteArticle = deleteArticle;
window.cancelEditArticle = cancelEditArticle;
window.saveThread = saveThread;
window.editThread = editThread;
window.deleteThread = deleteThread;
window.cancelEditThread = cancelEditThread;
window.saveEvent = saveEvent;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.cancelEditEvent = cancelEditEvent;
window.saveNotification = saveNotification;
window.sendNotification = sendNotification;
window.deleteNotification = deleteNotification;
window.cancelEditNotification = cancelEditNotification;
window.handleAdminMediaUpload = handleAdminMediaUpload;
window.updateAdminImgSlotFromInput = updateAdminImgSlotFromInput;

// ===== BOOTSTRAP =====
document.addEventListener('DOMContentLoaded', function () {
    console.log('FBC App Initializing...');
    
    // Auth & Supabase
    initSupabase();
    updateAdminUI();

    // Translations & Locales
    localizeDemoData();
    applyTranslations();

    // Data Loading
    loadHeroConfig();
    loadFeaturedPromoConfig();
    loadHeroMedia();
    loadProducts();
    
    // Initial Render (Database first, then fallback to demo)
    refreshFrontendData();
    loadHotTopics(); // Specifically for Trends page

    // Routing
    handleRouting();
    window.addEventListener('hashchange', handleRouting);

    if (currentPage === 'trends') loadHotTopics();
});
