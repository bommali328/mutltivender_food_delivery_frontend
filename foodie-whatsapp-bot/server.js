import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import express from 'express';

const app = express();
app.use(express.json());

let sock;

// వాట్సాప్ కనెక్షన్ క్రియేట్ చేసే ఫంక్షన్
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    // 👇 ఒకవేళ రిజిస్టర్ కాకపోతే Pairing Code (నంబర్ ద్వారా) కనెక్ట్ అవ్వడానికి ఆప్షన్
    if (!sock.authState.creds.registered) {
        const phoneNumber = "917893521159"; // మీ నంబర్
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                console.log(`\n🔗 మీ వాట్సాప్ పేరింగ్ కోడ్ (Pairing Code): \x1b[32m${code}\x1b[0m`);
                console.log(`(మీ వాట్సాప్ -> Linked Devices -> Link with phone number instead లో ఈ కోడ్ ఎంటర్ చేయండి)\n`);
            } catch (err) {
                console.log('Pairing code generation error:', err);
            }
        }, 3000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('📱 దయచేసి మీ వాట్సాప్ నుండి ఈ QR కోడ్ ని స్కాన్ చేయండి:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('⚠️ కనెక్షన్ క్లోజ్ అయింది. తిరిగి కనెక్ట్ అవుతోంది...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                console.log('❌ లాగౌట్ అయ్యారు. దయచేసి `auth_info_baileys` ఫోల్డర్ డిలీట్ చేసి మళ్లీ రన్ చేయండి.');
            }
        } else if (connection === 'open') {
            console.log('✅ వాట్సాప్ విజయవంతంగా AWS సర్వర్‌కి కనెక్ట్ అయింది!');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// హెల్త్ చెక్ API (సర్వర్ రన్ అవుతుందో లేదో చూడటానికి)
app.get('/', (req, res) => {
    res.json({ status: 'Foodiee WhatsApp Bot is running live on AWS!' });
});

// ఆర్డర్ వచ్చినప్పుడు వాట్సాప్ మెసేజ్ పంపే API ఎండ్‌పాయింట్
 app.post('/send-message', async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ success: false, message: 'Phone number and message are required' });
        }

        // వాట్సాప్ నంబర్ ఫార్మాట్ సరిగ్గా ఉండేలా చూసుకోవడం (91 జోడించడం)
        let formattedPhone = phone.replace(/[^0-9]/g, '');
        if (!formattedPhone.startsWith('91')) {
            formattedPhone = '91' + formattedPhone;
        }
        const jid = `${formattedPhone}@s.whatsapp.net`;

        // జావా నుండి వచ్చిన పూర్తి మెసేజ్‌ని నేరుగా కస్టమర్‌కి పంపడం
        await sock.sendMessage(jid, { text: message });

        res.json({ success: true, message: 'WhatsApp message sent successfully via AWS!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// AWS సర్వర్ కోసం పోర్ట్ కాన్ఫిగరేషన్
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 వాట్సాప్ బాట్ సర్వర్ ${PORT} పోర్ట్‌లో రన్ అవుతుంది...`);
    connectToWhatsApp();
});