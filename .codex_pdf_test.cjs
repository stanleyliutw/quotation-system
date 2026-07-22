const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
    const outputDir = path.join(__dirname, 'tmp', 'pdfs');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'production-spec-test.pdf');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();

    await page.route('https://www.gstatic.com/firebasejs/**', route => {
        route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    });
    await page.route('http://127.0.0.1:8765/firebase-auth.js', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: `
                window.firebase = {
                    apps: [{}],
                    initializeApp() {},
                    firestore() { return { collection() { return {}; } }; }
                };
                window.firebaseAuthReady = Promise.resolve({ email: 'test@example.com' });
            `
        });
    });

    await page.goto('http://127.0.0.1:8765/%E7%94%9F%E7%94%A2%E8%A6%8F%E6%A0%BC%E7%A2%BA%E8%AA%8D%E5%96%AEV1_firebase.html', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => typeof window.html2pdf === 'function' && typeof window.downloadCurrentSpecPDF === 'function');

    await page.evaluate(() => {
        const values = {
            docId: 'MFG-TEST-001',
            custName: '測試客戶股份有限公司',
            projectName: 'PDF 下載驗證',
            reqDate: '2026-07-22',
            dueDate: '2026-08-15',
            salesName: '測試業務'
        };
        Object.entries(values).forEach(([id, value]) => { document.getElementById(id).value = value; });
        document.getElementById('prodName').textContent = '碳纖維圓管';
        document.getElementById('materialSpec').textContent = '3K Twill / T700';
        document.getElementById('orderQty').textContent = '100 pcs';
        document.getElementById('specialNotes').textContent = '尺寸與外觀須依承認樣品確認。';
    });

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: '📥 下載 PDF', exact: true }).click();
    const download = await downloadPromise;
    await download.saveAs(outputPath);

    console.log(outputPath);
    await browser.close();
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
