const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    // Click the admin toggle button
    await page.click('#adminToggleBtn');
    await page.waitForTimeout(1000);

    // Click the Articles tab
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.admin-tab'));
        const articlesTab = tabs.find(t => t.textContent.includes('Articles'));
        if (articlesTab) articlesTab.click();
    });
    
    await page.waitForTimeout(2000);
    
    // Get the HTML of the articles list
    const html = await page.$eval('#adminArticleList', el => el.outerHTML);
    console.log("--- ADMIN ARTICLE LIST HTML ---");
    console.log(html);

    await browser.close();
})();
