import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Auto-accept confirmation dialogs (crucial for window.confirm in deleteArticle)
    page.on('dialog', async dialog => {
        console.log(`DIALOG: ${dialog.message()}`);
        await dialog.accept();
    });

    page.on('console', msg => {
        if (msg.type() === 'error' || msg.text().includes('ERROR')) {
            console.error('BROWSER ERROR:', msg.text());
        } else if (msg.type() !== 'warning') {
            console.log('BROWSER LOG:', msg.text());
        }
    });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);
    
    console.log('Opening admin panel...');
    await page.click('#adminToggleBtn');
    await page.waitForTimeout(500);

    console.log('Switching to Articles tab...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.admin-tab'));
        const articlesTab = tabs.find(t => t.textContent.includes('Articles'));
        if (articlesTab) articlesTab.click();
    });
    
    console.log('Waiting for articles to render...');
    await page.waitForSelector('.admin-product-actions', { timeout: 5000 }).catch(() => console.log('Timeout waiting for articles'));
    
    console.log('Clicking the first Delete button...');
    await page.evaluate(() => {
        const delBtns = document.querySelectorAll('#adminArticleList .btn-delete');
        if (delBtns.length > 0) delBtns[0].click();
        else console.log('No delete buttons found.');
    });

    await page.waitForTimeout(1000); // Wait for delete action and toast
    
    const toasts = await page.evaluate(() => {
        const ts = document.getElementById('toast');
        return ts ? ts.innerText : 'No toast';
    });
    console.log('TOAST RESULT:', toasts);

    await browser.close();
    console.log('Test completed.');
})();
