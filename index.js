const { create, Client } = require('@open-wa/wa-automate');

create().then(client => start(client));

function start(client) {
    console.log("Bot جاهز!");
    
    // مثال: إرسال رسالة تجريبية لنفسك
    const myNumber = "+201050081574"; // مثال: "201234567890"
    client.sendText(myNumber + "@c.us", "مرحبا! هذا اختبار من bot.")
        .then(() => console.log("تم إرسال الرسالة!"))
        .catch(err => console.log("Error when send the maseege ", err));
}
