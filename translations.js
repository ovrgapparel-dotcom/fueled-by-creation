const translations = {
    en: {
        home: "Home",
        shop: "Shop",
        artists: "Artists",
        articles: "Articles",
        events: "Events",
        tickets: "Tickets",
        merch: "Merch",
        bio: "Bio",
        latest_release: "Latest Release",
        listen_now: "Listen Now",
        view_profile: "View Profile",
        buy_tickets: "Buy Tickets",
        featured_artist: "Featured Artist",
        location: "Location",
        date: "Date",
        trending: "Trending",
        hot: "Hot",
        news: "News",
        loading: "Loading...",
        no_content: "No content available.",
        admin_panel: "Admin Panel",
        footer_tagline: "Fueled By Creation — Culture · Music · Merch",
        contact: "Contact",
        partners: "Partners"
    },
    fr: {
        home: "Accueil",
        shop: "Boutique",
        artists: "Artistes",
        articles: "Articles",
        events: "Événements",
        tickets: "Billets",
        merch: "Produits",
        bio: "Biographie",
        latest_release: "Dernière Sortie",
        listen_now: "Écouter",
        view_profile: "Voir Profil",
        buy_tickets: "Acheter Billets",
        featured_artist: "Artiste Vedette",
        location: "Lieu",
        date: "Date",
        trending: "Tendances",
        hot: "Chaud",
        news: "Actualités",
        loading: "Chargement...",
        no_content: "Aucun contenu disponible.",
        admin_panel: "Panneau d'administration",
        footer_tagline: "Propulsé par la Création — Culture · Musique · Mode",
        contact: "Contact",
        partners: "Partenaires"
    }
};

function getLang() {
    const userLang = navigator.language || navigator.userLanguage;
    return userLang.startsWith('fr') ? 'fr' : 'en';
}

function t(key) {
    const lang = getLang();
    return translations[lang][key] || translations['en'][key] || key;
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { t, getLang };
} else {
    window.i18n = { t, getLang };
}
