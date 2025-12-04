// server.js
const { create, Client } = require('@open-wa/wa-automate');
const express = require('express');
const bodyParser = require('body-parser');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// ضبط التوقيت المحلي
const TIMEZONE = 'Africa/Cairo';
const today = dayjs().tz(TIMEZONE).format('YYYY-MM-DD');

const app = express();
app.use(bodyParser.json());

// لتخزين الأرقام اللي اتبعت لهم الرسائل اليوم
const sentToday = new Set();

create().then(client => {
    console.log('✅ WhatsApp Bot is ready!');

    app.post('/send', async (req, res) => {
        const data = req.body;

        if (!Array.isArray(data)) {
            return res.status(400).json({ error: 'Expected array of clients' });
        }

        const results = [];

        for (const item of data) {
            const { phone, name, amount, due_date } = item;

            if (!phone || !name || !amount || !due_date) {
                results.push({ phone, success: false, message: 'Missing fields' });
                continue;
            }

            const recipient = phone.toString().includes('@c.us') ? phone.toString() : `${phone}@c.us`;

            // تحويل تاريخ الـ due_date إلى صيغة YYYY-MM-DD
            const [day, month, year] = due_date.trim().split('/');
            const formattedDue = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;

            if (formattedDue === today && !sentToday.has(recipient)) {
                try {
                    const response = await client.sendText(
                        recipient,
                        `عميلنا العزيز ${name.trim()},\nنذكّرك بأنه حان موعد سداد قسطك المستحق بقيمة ${amount} جنيه. برجاء السداد في أقرب وقت.\nشكرًا لتعاملكم معنا.`
                    );
                    results.push({ phone, success: true, response });
                    sentToday.add(recipient);
                    console.log('✅ Message sent:', phone);
                } catch (error) {
                    results.push({ phone, success: false, message: error.message });
                    console.error('❌ Error sending message:', phone, error.message);
                }
            } else {
                results.push({ phone, success: false, message: 'Not due today or already sent' });
            }
        }

        res.json(results);
    });

    app.listen(3001, () => {
        console.log('🚀 Server running on http://localhost:3001');
    });
});
