// server.js
const { create } = require('@open-wa/wa-automate');
const express = require('express');
const bodyParser = require('body-parser');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = 'Africa/Cairo';

const app = express();
app.use(bodyParser.json());

// لمنع الإرسال المكرر في نفس اليوم
const sentToday = new Set();

create().then((client) => {
    console.log("WhatsApp Bot Ready!");

    app.post("/send", async (req, res) => {
        const data = req.body;

        if (!Array.isArray(data)) {
            return res.status(400).json({ error: "Expected array of clients" });
        }

        const today = dayjs().tz(TIMEZONE);
        const results = [];

        for (const item of data) {
            const { phone, name, amount, due_date, row_number } = item;

            if (!phone || !name || !amount || !due_date || !row_number) {
                results.push({
                    phone,
                    row_number,
                    success: false,
                    message: "Missing fields"
                });
                continue;
            }

            // تحويل الرقم إلى صيغة واتساب صحيحة
            const recipient = phone.toString().includes("@c.us")
                ? phone.toString()
                : `${phone}@c.us`;

            // استخراج يوم الاشتراك فقط
            const [day] = due_date.split("/");
            const subscriptionDay = parseInt(day.trim(), 10);

            // هل النهارده هو يوم القسط؟
            if (today.date() === subscriptionDay && !sentToday.has(recipient)) {
                try {
                    await client.sendText(
                        recipient,
                        `عميلنا العزيز ${name.trim()}:\nنذكّرك بأنه حان موعد سداد قسطك المستحق بقيمة ${amount} جنيه. برجاء السداد.\nشكرًا لتعاملكم معنا.`
                    );

                    sentToday.add(recipient);

                    results.push({
                        phone,
                        row_number,
                        success: true,
                        message: "Message sent"
                    });

                } catch (err) {
                    results.push({
                        phone,
                        row_number,
                        success: false,
                        message: err.message
                    });
                }

            } else {
                results.push({
                    phone,
                    row_number,
                    success: false,
                    message: "Not due today or already sent"
                });
            }
        }

        res.json(results);
    });

    app.listen(3001, () => {
        console.log("Server running at http://localhost:3001");
    });
});
