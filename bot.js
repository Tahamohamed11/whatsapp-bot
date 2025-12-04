const puppeteer = require("puppeteer");
const fs = require("fs");

async function start() {
    const browser = await puppeteer.launch({
        headless: false,   // مهم → عشان تشوف QR Code
        args: ["--no-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto("https://web.whatsapp.com");

    console.log("Open the QR code and scan it with your mobile phone...");

    // حفظ الجلسة تلقائيًا
    page.on("framenavigated", async () => {
        const cookies = await page.cookies();
        fs.writeFileSync("./session.json", JSON.stringify(cookies, null, 2));
    });
}

start();
