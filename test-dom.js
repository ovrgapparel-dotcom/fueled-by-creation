const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Mock enough of the environment for app.js to run its render function
window.supabase = null;
window.getLang = () => 'en';
window.t = (k) => k;

// Read and evaluate app.js
const appJsCode = fs.readFileSync('app.js', 'utf8');
const scriptEl = document.createElement('script');
scriptEl.textContent = appJsCode;
document.body.appendChild(scriptEl);

// Wait a bit for DOM to settle
setTimeout(() => {
    // Force call the render function with demo data
    if (window.loadAdminArticles) {
        window.loadAdminArticles().then(() => {
            console.log("--- ADMIN ARTICLE LIST HTML ---");
            console.log(document.getElementById('adminArticleList').innerHTML);
        }).catch(e => console.error(e));
    } else {
        console.log("loadAdminArticles not found on window");
        
        // Let's just manually run the logic if it's not exported
        const list = document.getElementById('adminArticleList');
        console.log("List found?", !!list);
        if (list) {
            console.log("--- INITIAL ADMIN ARTICLE LIST HTML ---");
            console.log(list.innerHTML);
        }
    }
}, 500);
