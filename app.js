/* ===== FUELED BY CREATION — Application Logic ===== */

var sbClient = null;
var currentUser = null;
var products = [];
var activeFilter = 'all';
var adminImgSlots = ['', '', '', '', ''];
var selectedPayment = 'paypal';
var currentProduct = null;
var cart = [];
var currentPage = 'home';

// ===== DEMO DATA (used until Supabase tables are populated) =====
var demoArtists = [
    { id: 'a1', name: 'Kwame Blaze', bio: 'Afrobeat sensation blending culture with rhythm.', profile_image_url: '', banner_image_url: '', promo_video_url: '', latest_release_title: 'Fire & Gold EP', latest_release_cover_url: '', latest_release_listen_url: '#', latest_release_date: '2026-02-15', merch_product_id: '', instagram_url: '#', youtube_url: '#', tiktok_spotify_url: '#', status: 'Published', is_featured: true },
    { id: 'a2', name: 'Nia Vox', bio: 'R&B vocalist with soul-stirring melodies.', profile_image_url: '', banner_image_url: '', promo_video_url: '', latest_release_title: 'Midnight Session', latest_release_cover_url: '', latest_release_listen_url: '#', latest_release_date: '2026-01-20', merch_product_id: '', instagram_url: '#', youtube_url: '#', tiktok_spotify_url: '#', status: 'Published', is_featured: true },
    { id: 'a3', name: 'DJ Phantom', bio: 'Electronic beats and culture-defining sounds.', profile_image_url: '', banner_image_url: '', promo_video_url: '', latest_release_title: 'Neon Pulse', latest_release_cover_url: '', latest_release_listen_url: '#', latest_release_date: '2026-03-01', merch_product_id: '', instagram_url: '#', youtube_url: '#', tiktok_spotify_url: '#', status: 'Published', is_featured: false },
];

var demoArticles = [
    { id: 'art1', title: 'The Rise of Afrobeat in Global Culture', category: 'article', cover_image_url: '', excerpt: 'How African rhythms are becoming the soundtrack of a generation.', body_content: '<p>Afrobeat has transcended borders. What started as a movement in West Africa is now a global phenomenon, influencing pop, hip-hop, and electronic music worldwide.</p><p>Artists like Kwame Blaze are at the forefront of this cultural revolution, blending traditional sounds with modern production techniques.</p>', author: 'FBC Editorial', publish_date: '2026-03-01', status: 'Published', is_featured: true, is_trending: true },
    { id: 'art2', title: '5 Ways to Build Your Brand as an Independent Artist', category: 'howto', cover_image_url: '', excerpt: 'Practical tips for emerging artists to grow their audience.', body_content: '<p>Building a brand as an independent artist requires strategy, consistency, and authenticity. Here are five proven methods to accelerate your growth.</p>', author: 'FBC Editorial', publish_date: '2026-02-20', status: 'Published', is_featured: false, is_trending: false },
    { id: 'art3', title: 'Behind the Scenes: FBC Studio Session', category: 'vlog', cover_image_url: '', excerpt: 'An exclusive look inside the creative process.', body_content: '<p>We took cameras inside the studio to capture the magic behind the latest FBC artist collaborations.</p>', author: 'FBC Media', publish_date: '2026-02-28', status: 'Published', is_featured: true, is_trending: true },
];

var demoThreads = [
    { id: 't1', title: 'Who is the most underrated artist right now?', tag: 'Hot', hook_text: 'Drop your picks — the culture needs to hear them.', cover_image_url: '', status: 'Active', priority_order: 1, is_pinned: true },
    { id: 't2', title: 'Merch drop incoming 🔥', tag: 'Trend', hook_text: 'New FBC collection dropping this weekend. What pieces are you eyeing?', cover_image_url: '', status: 'Active', priority_order: 2, is_pinned: false },
    { id: 't3', title: 'Afrobeat vs Amapiano — which one defines 2026?', tag: 'News', hook_text: 'The debate that\'s been heating up all month.', cover_image_url: '', status: 'Active', priority_order: 3, is_pinned: false },
];

var demoEvents = [
    { id: 'e1', title: 'FBC Live: Kwame Blaze in Concert', description: 'An electrifying night of Afrobeat, live performances, and exclusive merch drops.', event_date: '2026-04-15T20:00:00', location_name: 'Sofitel Abidjan', location_address: 'Abidjan, Côte d\'Ivoire', cover_image_url: '', ticketing_url: '#', featured_artist_id: 'a1', status: 'Published' },
    { id: 'e2', title: 'Culture Night: Art × Music × Fashion', description: 'A multi-disciplinary evening celebrating the intersection of culture.', event_date: '2026-05-10T19:00:00', location_name: 'Ivoire Trade Center', location_address: 'Plateau, Abidjan', cover_image_url: '', ticketing_url: '#', featured_artist_id: null, status: 'Published' },
    { id: 'e3', title: 'FBC Pop-Up Shop', description: 'Exclusive in-person merch experience. Limited drops only.', event_date: '2026-04-28T10:00:00', location_name: 'Zone 4, Marcory', location_address: 'Abidjan', cover_image_url: '', ticketing_url: '#', featured_artist_id: null, status: 'Published' },
];

// ===== INIT =====
function initSupabase() {
    try {
        var _sb = window['supabase'] || window['supabaseJs'];
        if (!_sb || typeof _sb.createClient !== 'function') throw new Error('Supabase library not loaded');
        sbClient = _sb.createClient(SUPABASE_URL, SUPABASE_ANON, {
            auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, storage: window.localStorage }
        });
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
    // Hide details if we switch to a main page
    document.getElementById('artistDetail').style.display = 'none';
    document.getElementById('articleDetail').style.display = 'none';
    document.getElementById('eventDetail').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    } else if (hash === '#shop') {
        document.getElementById('shop').scrollIntoView();
    } else if (hash === '#artists') {
        document.getElementById('artists').scrollIntoView();
    }
}

function toggleMobileMenu() {
    var nav = document.getElementById('mainNav');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    if (nav.style.display === 'flex') {
        nav.style.position = 'fixed'; nav.style.top = '68px'; nav.style.left = '0'; nav.style.right = '0';
        nav.style.background = 'var(--dark)'; nav.style.flexDirection = 'column'; nav.style.padding = '1rem';
        nav.style.zIndex = '99'; nav.style.borderBottom = '2px solid var(--primary)';
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
            images: ['/assets/black_classic_tee.png'],
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
            images: ['/assets/bone_premium_hoodie.png'],
            description: 'Heavyweight comfort for the culture.',
            sizes: ['M', 'L', 'XL'],
            badge: 'Essentials'
        },
        { id: 'p3', name: 'Culture Set', category: 'ensemble', price: 35000, old_price: 40000, description: 'Full set for sport and daily life.', badge: 'Limited', sizes: ['S', 'M', 'L', 'XL', 'XXL'], images: [] },
        { id: 'p4', name: 'Premium Tee', category: 't-shirt', price: 15000, old_price: 20000, description: 'Premium quality cotton tee.', badge: '', sizes: ['S', 'M', 'L', 'XL'], images: [] },
    ];
}

// ===== RENDER FUNCTIONS =====
function renderCatalogue(filter) {
    filter = filter || 'all'; activeFilter = filter;
    var grid = document.getElementById('productsGrid'); if (!grid) return;
    var filtered = filter === 'all' ? products : products.filter(function (p) { return p.cat === filter; });
    if (!filtered.length) { grid.innerHTML = '<div class="empty-state"><div class="empty-icon">📦</div><p>No products in this category.</p></div>'; return; }
    grid.innerHTML = filtered.map(function (p) {
        var disc = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0;
        var imgSrc = p.imgs && p.imgs[0];
        var imgHtml = imgSrc ? '<img src="' + imgSrc + '" alt="' + p.name + '" loading="lazy">' : '<div class="product-img-placeholder"><span style="font-size:4rem;opacity:0.15">👕</span></div>';
        var badgeHtml = p.badge ? '<span class="product-badge">' + p.badge + '</span>' : '';
        var discHtml = p.old_price ? '<span class="product-old">' + fmt(p.old_price) + '</span><span class="product-discount">-' + disc + '%</span>' : '';
        return '<article class="product-card" onclick="openProduct(' + p.id + ')" tabindex="0">' +
            '<div class="product-img-wrap">' + imgHtml + badgeHtml +
            '<button class="product-quick-view" onclick="event.stopPropagation();openProduct(' + p.id + ')">View Details →</button></div>' +
            '<div class="product-info">' +
            '<div class="product-cat">' + (p.cat === 't-shirt' ? 'T-Shirts' : 'Sets') + '</div>' +
            '<h3 class="product-name">' + p.name + '</h3>' +
            '<div class="product-pricing"><span class="product-price">' + fmt(p.price) + '</span>' + discHtml + '</div>' +
            '<button class="btn-add-cart" onclick="event.stopPropagation();quickAddToCart(' + p.id + ')">+ Add to Cart</button>' +
            '</div></article>';
    }).join('');
}

function renderArtists(targetGridId, artistList) {
    var grid = document.getElementById(targetGridId); if (!grid) return;
    if (!artistList.length) { grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🎤</div><p>No artists to display yet.</p></div>'; return; }
    grid.innerHTML = artistList.map(function (a) {
        var imgHtml = a.profile_image_url ? '<img src="' + a.profile_image_url + '" alt="' + a.name + '" loading="lazy">' : '';
        var featuredBadge = a.is_featured ? '<span class="featured-badge">⭐ Featured</span>' : '';
        return '<div class="artist-card" onclick="openArtistDetail(\'' + a.id + '\')">' +
            '<div class="artist-card-img">' + imgHtml + featuredBadge + '</div>' +
            '<div class="artist-card-body">' +
            '<h3 class="artist-card-name">' + a.name + '</h3>' +
            '<p class="artist-card-release">🎵 ' + (a.latest_release_title || 'Coming soon') + '</p>' +
            '<div class="artist-card-actions">' +
            '<button class="btn-sm btn-view-profile" onclick="event.stopPropagation();openArtistDetail(\'' + a.id + '\')">View Profile</button>' +
            (a.latest_release_listen_url && a.latest_release_listen_url !== '#' ? '<a href="' + a.latest_release_listen_url + '" target="_blank" class="btn-sm btn-listen" onclick="event.stopPropagation()">▶ Listen</a>' : '') +
            '</div></div></div>';
    }).join('');
}

function renderArticles(targetGridId, articleList) {
    var grid = document.getElementById(targetGridId); if (!grid) return;
    if (!articleList.length) { grid.innerHTML = '<div class="empty-state"><div class="empty-icon">📰</div><p>No articles yet.</p></div>'; return; }
    grid.innerHTML = articleList.map(function (a) {
        var imgHtml = a.cover_image_url ? '<img src="' + a.cover_image_url + '" alt="' + a.title + '" loading="lazy">' : '';
        var catLabel = { article: '📰 Article', vlog: '🎥 Vlog', howto: '💡 How-To', hot: '🔥 Hot Topic' }[a.category] || a.category;
        return '<div class="article-card" onclick="openArticleDetail(\'' + a.id + '\')">' +
            '<div class="article-card-img">' + imgHtml + '</div>' +
            '<div class="article-card-body">' +
            '<span class="article-card-tag">' + catLabel + '</span>' +
            '<h3 class="article-card-title">' + a.title + '</h3>' +
            '<p class="article-card-excerpt">' + (a.excerpt || '') + '</p>' +
            '<div class="article-card-meta"><span>By ' + (a.author || 'FBC') + '</span><span>' + formatDate(a.publish_date) + '</span></div>' +
            '</div></div>';
    }).join('');
}

function renderThreads(targetListId, threadList) {
    var list = document.getElementById(targetListId); if (!list) return;
    if (!threadList.length) { list.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><p>No threads yet.</p></div>'; return; }
    var sortedThreads = threadList.slice().sort(function (a, b) { return (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0) || a.priority_order - b.priority_order; });
    list.innerHTML = sortedThreads.map(function (t) {
        var tagClass = { Hot: 'hot', Trend: 'trend', News: 'news' }[t.tag] || 'trend';
        return '<div class="thread-card">' +
            '<span class="thread-tag ' + tagClass + '">' + (t.is_pinned ? '📌 ' : '') + t.tag + '</span>' +
            '<div class="thread-info"><h4 class="thread-title">' + t.title + '</h4><p class="thread-hook">' + (t.hook_text || '') + '</p></div>' +
            '<div class="thread-reactions"><span>🔥</span><span>💬</span><span>👀</span></div>' +
            '</div>';
    }).join('');
}

function renderEvents(targetGridId, eventList) {
    var grid = document.getElementById(targetGridId); if (!grid) return;
    if (!eventList.length) { grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🎫</div><p>No events scheduled yet.</p></div>'; return; }
    grid.innerHTML = eventList.map(function (e) {
        var d = new Date(e.event_date);
        var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        var imgHtml = e.cover_image_url ? '<img src="' + e.cover_image_url + '" alt="' + e.title + '" loading="lazy">' : '';
        return '<div class="event-card">' +
            '<div class="event-card-img">' + imgHtml +
            '<div class="event-date-badge"><div class="edb-month">' + months[d.getMonth()] + '</div><div class="edb-day">' + d.getDate() + '</div></div>' +
            '</div>' +
            '<div class="event-card-body">' +
            '<h3 class="event-card-title">' + e.title + '</h3>' +
            '<p class="event-card-location">📍 ' + e.location_name + '</p>' +
            (e.ticketing_url ? '<a href="' + e.ticketing_url + '" target="_blank" class="event-card-cta" onclick="event.stopPropagation()">🎫 Get Tickets</a>' : '') +
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
function openProduct(id) {
    var p = products.find(function (x) { return x.id === id; }); if (!p) return;
    currentProduct = p;
    document.getElementById('modalCat').textContent = p.name;
    document.getElementById('modalCatLabel').textContent = p.cat === 't-shirt' ? 'T-Shirts' : 'Sets';
    document.getElementById('modalName').textContent = p.name;
    document.getElementById('modalPrice').textContent = fmt(p.price);
    var disc = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0;
    document.getElementById('modalOld').textContent = p.old_price ? fmt(p.old_price) : '';
    document.getElementById('modalDisc').textContent = disc ? '-' + disc + '%' : '';
    document.getElementById('modalDesc').textContent = p.description || '';
    document.getElementById('qtyInput').value = 1;
    var mainWrap = document.getElementById('mainImgWrap');
    mainWrap.innerHTML = p.imgs && p.imgs[0] ? '<img src="' + p.imgs[0] + '" alt="' + p.name + '">' : '<div class="main-img-placeholder">👕</div>';
    document.getElementById('thumbRow').innerHTML = [0, 1, 2, 3].map(function (i) {
        var src = p.imgs && p.imgs[i + 1];
        return '<div class="thumb ' + (i === 0 ? 'active' : '') + '" onclick="selectThumb(this,\'' + (src || '') + '\')">' +
            (src ? '<img src="' + src + '" alt="Photo ' + (i + 2) + '">' : '<div class="thumb-placeholder">👕</div>') + '</div>';
    }).join('');
    document.getElementById('sizeBtns').innerHTML = (p.sizes || []).map(function (s, i) {
        return '<button class="size-btn' + (i === 0 ? ' selected' : '') + '" onclick="selectSize(this)">' + s + '</button>';
    }).join('');
    document.getElementById('sizeSection').style.display = p.sizes && p.sizes.length ? '' : 'none';
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
    }
}

// ===== CART =====
function quickAddToCart(id) { var p = products.find(function (x) { return x.id === id; }); if (p) addCartItem(p, 1, p.sizes && p.sizes[0] || ''); }
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
    ['Paypal', 'Wave', 'Yango', 'Whatsapp'].forEach(function (x) { document.getElementById('payOpt' + x).classList.remove('selected'); });
    var map = { paypal: 'Paypal', wave: 'Wave', yango: 'Yango', whatsapp: 'Whatsapp' };
    document.getElementById('payOpt' + map[m]).classList.add('selected');
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
function finishOrder(name) { closeCheckout(); cart = []; renderCart(); showToast('Order confirmed! 🎉', 'Thanks ' + name + '! We\'ll contact you within 24h.'); }

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
function handleAdminClick() { if (currentUser) openAdmin(); else openLogin(); }
function openLogin() {
    document.getElementById('loginEmail').value = ''; document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').textContent = '';
    document.getElementById('loginOverlay').classList.add('open');
}
function closeLogin() { document.getElementById('loginOverlay').classList.remove('open'); }
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
    renderAdminImgSlots();
    document.getElementById('adminOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    loadAdminProducts(); checkSupabaseConnection();
    // Pre-load data for all admin tabs
    loadAdminArtists(); loadAdminArticles(); loadAdminThreads(); loadAdminEvents(); loadAdminNotifications();
}
function closeAdmin() { document.getElementById('adminOverlay').classList.remove('open'); document.body.style.overflow = ''; }
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
            '<p>' + priceInfo + ' · ' + (p.cat === 't-shirt' ? 'T-Shirts' : 'Sets') + ' · ' + ((p.sizes || []).join(', ') || '—') + '</p></div>' +
            '<div class="admin-product-actions">' +
            '<button class="btn-edit" onclick="editProduct(' + p.id + ')">✏ Edit</button>' +
            '<button class="btn-delete" onclick="deleteProduct(' + p.id + ')">🗑 Delete</button></div></div>';
    }).join('') : '<div style="text-align:center;padding:3rem;color:#555"><div style="font-size:2.5rem;margin-bottom:1rem">📦</div><p>No products. Click <strong style="color:var(--primary)">+ Add Product</strong>.</p></div>';
}
function editProduct(id) {
    var p = products.find(function (x) { return x.id === id; }); if (!p) return;
    document.getElementById('editProductId').value = id;
    document.getElementById('adminName').value = p.name;
    document.getElementById('adminCat').value = p.cat;
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
    try {
        var res = await sbClient.from(PRODUCTS_TABLE).delete().eq('id', id);
        if (res.error) throw res.error;
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
    if (!name || !price) { showToast('Required fields', 'Name and price are required.', '#f59e0b'); return; }
    var payload = { name: name, cat: cat, price: price, old_price: old_price, description: description, badge: badge, sizes: sizes, imgs: imgs };
    try {
        if (editId) {
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
        'threads-admin': 'adminTabThreads', 'events-admin': 'adminTabEvents',
        'notifications-admin': 'adminTabNotifications'
    };
    Object.values(tabMap).forEach(function (id) { var el2 = document.getElementById(id); if (el2) el2.style.display = 'none'; });
    var target = document.getElementById(tabMap[tab]);
    if (target) target.style.display = '';
    // Lazy-load data when switching tabs
    if (tab === 'artists-admin') loadAdminArtists();
    else if (tab === 'articles-admin') loadAdminArticles();
    else if (tab === 'threads-admin') loadAdminThreads();
    else if (tab === 'events-admin') loadAdminEvents();
    else if (tab === 'notifications-admin') loadAdminNotifications();
    else if (tab === 'products') loadAdminProducts();
}
function renderAdminImgSlots() {
    var labels = ['Main', 'Photo 2', 'Photo 3', 'Photo 4', 'Photo 5'];
    var slotsEl = document.getElementById('adminImgSlots'); if (!slotsEl) return;
    slotsEl.innerHTML = adminImgSlots.map(function (src, i) {
        return '<div class="img-slot" id="slot_' + i + '">' +
            (src ? '<img src="' + src + '" alt="Slot ' + (i + 1) + '" id="slotImg_' + i + '">' : '<div class="img-slot-icon">📷</div>') +
            '<span class="img-slot-label">' + labels[i] + '</span>' +
            (src ? '<button class="img-slot-clear" onclick="clearSlot(event,' + i + ')">✕</button>' : '') +
            '<div class="upload-progress" id="slotProgress_' + i + '">↻ Upload...</div>' +
            '<input type="file" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;z-index:2" onchange="uploadImageToStorage(event,' + i + ')">' +
            '</div>';
    }).join('');
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
        renderAdminImgSlots();
        showToast('Photo uploaded ✓', 'Image saved to Supabase Storage.');
    } catch (e) {
        if (prog) prog.classList.remove('show');
        if (e.message && (e.message.includes('bucket') || e.message.includes('Bucket') || e.message.includes('not found'))) {
            var reader = new FileReader();
            reader.onload = function (ev) { adminImgSlots[slotIndex] = ev.target.result; renderAdminImgSlots(); showToast('Photo loaded (local)', 'Create the "product-images" bucket in Supabase Storage.', '#f59e0b'); };
            reader.readAsDataURL(file);
        } else { showToast('Upload error', e.message || 'Check bucket config.', '#ef4444'); }
    }
}

// ===================================================================
// ===== ADMIN CRUD: ARTISTS ========================================
// ===================================================================
var adminArtists = [];

async function loadAdminArtists() {
    var list = document.getElementById('adminArtistList'); if (!list) return;
    list.innerHTML = '<p style="color:#666;text-align:center;padding:2rem">Loading artists...</p>';
    try {
        var res = await sbClient.from('artists').select('*').order('created_at', { ascending: false });
        if (res.error) throw res.error;
        adminArtists = res.data || [];
    } catch (e) { adminArtists = demoArtists.slice(); }
    renderAdminArtistList();
}

function renderAdminArtistList() {
    var list = document.getElementById('adminArtistList');
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
    try {
        if (editId) {
            var res = await sbClient.from('artists').update(payload).eq('id', editId);
            if (res.error) throw res.error;
        } else {
            var res2 = await sbClient.from('artists').insert(payload);
            if (res2.error) throw res2.error;
        }
        cancelEditArtist(); await loadAdminArtists(); refreshFrontendData();
        showToast('Saved! ✓', '"' + name + '" saved to Supabase.');
    } catch (e) { showToast('Error', e.message || 'Could not save artist.', '#ef4444'); }
}

async function deleteArtist(id) {
    if (!confirm('Delete this artist permanently?')) return;
    try {
        var res = await sbClient.from('artists').delete().eq('id', id);
        if (res.error) throw res.error;
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
        if (res.error) throw res.error;
        adminArticles = res.data || [];
    } catch (e) { adminArticles = demoArticles.slice(); }
    renderAdminArticleList();
}

function renderAdminArticleList() {
    var list = document.getElementById('adminArticleList');
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
    ['articleTitle', 'articleAuthor', 'articleCoverImg', 'articleExcerpt', 'articleBody', 'articlePublishDate'].forEach(function (id) { document.getElementById(id).value = ''; });
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
        excerpt: document.getElementById('articleExcerpt').value.trim() || null,
        body_content: document.getElementById('articleBody').value || null,
        publish_date: document.getElementById('articlePublishDate').value || null,
        status: document.getElementById('articleStatus').value,
        is_featured: document.getElementById('articleFeatured').checked,
        is_trending: document.getElementById('articleTrending').checked
    };
    var editId = document.getElementById('editArticleId').value;
    try {
        if (editId) {
            var res = await sbClient.from('articles').update(payload).eq('id', editId);
            if (res.error) throw res.error;
        } else {
            var res2 = await sbClient.from('articles').insert(payload);
            if (res2.error) throw res2.error;
        }
        cancelEditArticle(); await loadAdminArticles(); refreshFrontendData();
        showToast('Saved! ✓', '"' + title + '" saved.');
    } catch (e) { showToast('Error', e.message || 'Could not save article.', '#ef4444'); }
}

async function deleteArticle(id) {
    if (!confirm('Delete this article permanently?')) return;
    try {
        var res = await sbClient.from('articles').delete().eq('id', id);
        if (res.error) throw res.error;
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
        if (res.error) throw res.error;
        adminThreads = res.data || [];
    } catch (e) { adminThreads = demoThreads.slice(); }
    renderAdminThreadList();
}

function renderAdminThreadList() {
    var list = document.getElementById('adminThreadList');
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
    document.getElementById('threadExtLink').value = t.external_link || '';
    document.getElementById('threadStatus').value = t.status || 'Active';
    document.getElementById('threadPriority').value = t.priority_order || 0;
    document.getElementById('threadPinned').checked = t.is_pinned || false;
    document.getElementById('threadFormTitle').textContent = '✏ Edit — ' + t.title;
}

function cancelEditThread() {
    document.getElementById('editThreadId').value = '';
    ['threadTitle', 'threadHook', 'threadCoverImg', 'threadExtLink'].forEach(function (id) { document.getElementById(id).value = ''; });
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
        external_link: document.getElementById('threadExtLink').value.trim() || null,
        status: document.getElementById('threadStatus').value,
        priority_order: parseInt(document.getElementById('threadPriority').value) || 0,
        is_pinned: document.getElementById('threadPinned').checked
    };
    var editId = document.getElementById('editThreadId').value;
    try {
        if (editId) {
            var res = await sbClient.from('threads').update(payload).eq('id', editId);
            if (res.error) throw res.error;
        } else {
            var res2 = await sbClient.from('threads').insert(payload);
            if (res2.error) throw res2.error;
        }
        cancelEditThread(); await loadAdminThreads(); refreshFrontendData();
        showToast('Saved! ✓', '"' + title + '" saved.');
    } catch (e) { showToast('Error', e.message || 'Could not save thread.', '#ef4444'); }
}

async function deleteThread(id) {
    if (!confirm('Delete this thread permanently?')) return;
    try {
        var res = await sbClient.from('threads').delete().eq('id', id);
        if (res.error) throw res.error;
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
        if (res.error) throw res.error;
        adminEvents = res.data || [];
    } catch (e) { adminEvents = demoEvents.slice(); }
    renderAdminEventList();
}

function renderAdminEventList() {
    var list = document.getElementById('adminEventList');
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
    document.getElementById('eventTicketUrl').value = e.ticketing_url || '';
    document.getElementById('eventArtistId').value = e.featured_artist_id || '';
    document.getElementById('eventStatus').value = e.status || 'Draft';
    document.getElementById('eventFormTitle').textContent = '✏ Edit — ' + e.title;
}

function cancelEditEvent() {
    document.getElementById('editEventId').value = '';
    ['eventTitle', 'eventDate', 'eventDescription', 'eventVenue', 'eventAddress', 'eventCoverImg', 'eventTicketUrl', 'eventArtistId'].forEach(function (id) { document.getElementById(id).value = ''; });
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
        ticketing_url: document.getElementById('eventTicketUrl').value.trim() || null,
        featured_artist_id: document.getElementById('eventArtistId').value.trim() || null,
        status: document.getElementById('eventStatus').value
    };
    var editId = document.getElementById('editEventId').value;
    try {
        if (editId) {
            var res = await sbClient.from('events').update(payload).eq('id', editId);
            if (res.error) throw res.error;
        } else {
            var res2 = await sbClient.from('events').insert(payload);
            if (res2.error) throw res2.error;
        }
        cancelEditEvent(); await loadAdminEvents(); refreshFrontendData();
        showToast('Saved! ✓', '"' + title + '" saved.');
    } catch (e) { showToast('Error', e.message || 'Could not save event.', '#ef4444'); }
}

async function deleteEvent(id) {
    if (!confirm('Delete this event permanently?')) return;
    try {
        var res = await sbClient.from('events').delete().eq('id', id);
        if (res.error) throw res.error;
        adminEvents = adminEvents.filter(function (e) { return e.id !== id; });
        renderAdminEventList(); refreshFrontendData();
        showToast('Deleted', 'Event removed.');
    } catch (e) { showToast('Error', 'Could not delete event.', '#ef4444'); }
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
    try {
        var aRes = await sbClient.from('artists').select('*').eq('status', 'Published').order('created_at', { ascending: false });
        if (!aRes.error && aRes.data) {
            demoArtists = aRes.data;
            renderArtists('featuredArtistsGrid', demoArtists.filter(function (a) { return a.is_featured; }));
            renderArtists('allArtistsGrid', demoArtists);
        }
    } catch (e) { /* keep demo data */ }
    try {
        var artRes = await sbClient.from('articles').select('*').eq('status', 'Published').order('publish_date', { ascending: false });
        if (!artRes.error && artRes.data) {
            demoArticles = artRes.data;
            renderArticles('featuredArticlesGrid', demoArticles.filter(function (a) { return a.is_featured; }));
            renderArticles('allArticlesGrid', demoArticles);
        }
    } catch (e) { /* keep demo data */ }
    try {
        var tRes = await sbClient.from('threads').select('*').eq('status', 'Active').order('priority_order');
        if (!tRes.error && tRes.data) { demoThreads = tRes.data; renderThreads('allThreadsList', demoThreads); }
    } catch (e) { /* keep demo data */ }
    try {
        var eRes = await sbClient.from('events').select('*').eq('status', 'Published').order('event_date');
        if (!eRes.error && eRes.data) {
            demoEvents = eRes.data;
            renderEvents('featuredEventsGrid', demoEvents.slice(0, 3));
            renderEvents('allEventsGrid', demoEvents);
        }
    } catch (e) { /* keep demo data */ }
}

// ===== NEWSLETTER =====
function handleNewsletter(e) {
    e.preventDefault();
    var name = e.target.name.value;
    fetch('https://formsubmit.co/ajax/ovrg.apparel@gmail.com', { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(e.target) }).catch(function () { });
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
    switchPage('artists');
    var a = demoArtists.find(x => x.id === id);
    if (!a && sbClient) {
        var res = await sbClient.from('artists').select('*').eq('id', id).single();
        if (!res.error) a = res.data;
    }
    if (!a) return;

    document.getElementById('artistNameDetail').textContent = a.name;
    document.getElementById('artistBioDetail').textContent = a.bio || '';
    document.getElementById('artistHero').style.backgroundImage = a.banner_image_url ? `url(${a.banner_image_url})` : 'linear-gradient(135deg, #1a1a1a, #0d0d0d)';
    document.getElementById('artistProfileImgDetail').src = a.profile_image_url || 'https://via.placeholder.com/150';

    // Release
    document.getElementById('releaseTitleDetail').textContent = a.latest_release_title || 'No recent release';
    document.getElementById('releaseCoverDetail').src = a.latest_release_cover_url || 'https://via.placeholder.com/300';
    document.getElementById('releaseLinkDetail').href = a.latest_release_listen_url || '#';

    // Social
    document.getElementById('artistInstaDetail').href = a.instagram_url || '#';
    document.getElementById('artistYoutubeDetail').href = a.youtube_url || '#';

    document.getElementById('artistDetail').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function openArticleDetail(id) {
    switchPage('trends');
    var a = demoArticles.find(x => x.id === id);
    if (!a && sbClient) {
        var res = await sbClient.from('articles').select('*').eq('id', id).single();
        if (!res.error) a = res.data;
    }
    if (!a) return;

    document.getElementById('articleTitleDetail').textContent = a.title;
    document.getElementById('articleAuthorDetail').textContent = a.author + ' · ' + formatDate(a.publish_date);
    document.getElementById('articleCoverDetail').src = a.cover_image_url || 'https://via.placeholder.com/800x400';
    document.getElementById('articleBodyDetail').innerHTML = a.body_content || '';

    document.getElementById('articleDetail').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function openEventDetail(id) {
    switchPage('events');
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
    document.getElementById('eventCoverDetail').src = e.cover_image_url || 'https://via.placeholder.com/800x400';
    document.getElementById('eventTicketBtnDetail').href = e.ticketing_url || '#';

    document.getElementById('eventDetail').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeDetail() {
    document.getElementById('artistDetail').style.display = 'none';
    document.getElementById('articleDetail').style.display = 'none';
    document.getElementById('eventDetail').style.display = 'none';
    window.location.hash = currentPage;
}

// ===== UTILITIES =====
function fmt(n) { return Number(n).toLocaleString('fr-FR') + ' FCFA'; }
function fmtUSD(n) { return (n / 655).toFixed(2); }
function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
        el.textContent = window.i18n.t(key);
    });
}

// ===== BOOTSTRAP =====
document.addEventListener('DOMContentLoaded', function () {
    // Initial Route
    handleRouting();
    window.addEventListener('hashchange', handleRouting);

    // Apply translations on load
    applyTranslations();

    // Initial load of content
    initSupabase();
    loadProducts();
    // Render demo data for new sections
    renderArtists('featuredArtistsGrid', demoArtists.filter(function (a) { return a.is_featured; }));
    renderArtists('allArtistsGrid', demoArtists);
    renderArticles('featuredArticlesGrid', demoArticles.filter(function (a) { return a.is_featured; }));
    renderArticles('allArticlesGrid', demoArticles);
    renderThreads('allThreadsList', demoThreads);
    renderEvents('featuredEventsGrid', demoEvents.slice(0, 3));
    renderEvents('allEventsGrid', demoEvents);
    // Initial Route
    handleRouting();
});
