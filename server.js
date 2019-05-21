const proxyAgent = require('proxy-agent');
const WebSocket = require('ws');
const fs = require('fs');

const proxies = fs.readFileSync('./proxies.txt', 'utf-8').replace(/\r/g, '').split('\n');

const nick = 'Agar API';
const botAmount = 900;

class Bot {
    constructor(server, id) {
        this.id = id + 1;
        this.server = server;
        this.stopped = false;
        this.connect();
    }
    connect() {
        if (this.stopped) return;
        this.proxy = proxies[~~(Math.random() * proxies.length)];
        this.ws = new WebSocket(this.server, ['1', '3', 'WaWdft'].join(', '), {
            agent: new proxyAgent('http://' + this.proxy),
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Connection': 'Upgrade',
                'Origin': 'https://client.blobgame.io',
                'Pragma': 'no-cache',
                'Upgrade': 'websocket',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36'
            }
        });
        this.ws.binaryType = 'nodebuffer';
        this.ws.onmessage = this.onmessage.bind(this);
        this.ws.onopen = this.onopen.bind(this);
        this.ws.onclose = this.onclose.bind(this);
        this.ws.onerror = () => { };
        setInterval(() => {
            // this.sendChat('Agar API');
            this.spawn();
        }, 2500);
    }
    spawn() {
        var skins = ['fly', 'fish', 'amber', 'spider', 'small_chick', 'carp', 'lobster', 'wasp', 'gopher', 'chick', 'sea_turtle', 'octopus', 'lizard', 'rabbit', 'pug', 'mouse', 'birdie', 'bat', 'owl', 'squirrel', 'rooster', 'cat', 'snake', 'crow', 'parrot', 'prey', 'chihuahua', 'fox', 'desert_fox', 'pig', 'dog', 'blackcat', 'coyote', 'goat', 'deer', 'bullking', 'seal', 'fury_cat', 'penguin', 'blueswirl', 'sly', 'husky', 'sheep', 'panda', 'cute_panda', 'angry_panda', 'bear', 'bear_', 'bearr', 'rhino_boxer', 'cougar', 'wolf', 'wolff', 'spirxo', 'sabertooth', 'panther', 'kempo_tiger', 'dark_wings', 'firebird', 'wolf_', 'lion_', 'yeti', 'lion', 'leo', 'king_lion', 'crocodile', 'croc', 'jackal', 'taurus', 'shark', 'colossus', 'orc_grunt', 'behemoth', 'mammoth', 'silver_tusk', 'dragon', 'beast', 'raptor', 't_rex', 'godzilla', 'basilisk', 'sentinel', 'poseidon', 'kraken', 'red_fiend', 'wendigo', 'jotun', 'ice_lord', 'medusa', 'reaper'];
        var skin = skins[~~(Math.random() * skins.length)];
        var rand = Math.random().toString(36).slice(2 + ~~(Math.random() * 6)); // temporary
        var name = `<${skin}>${rand}`;
        var buf = Buffer.alloc(1 + Buffer.byteLength(name, 'utf16le'));
        buf.write(name, 1, 'utf16le');
        this.send(buf);
        buf = Buffer.alloc(1);
        buf.writeUInt8(1, 0);
        this.send(buf);
    }
    sendChat(message) {
        var buf = Buffer.alloc(2 + Buffer.byteLength(message, 'utf16le'));
        buf.writeUInt8(99, 0);
        buf.writeUInt8(64, 1);
        buf.write(message, 2, 'utf16le');
        this.send(buf);
    }
    onclose(err) {
        setTimeout(this.connect.bind(this), 2500);
    }
    onopen() {
        var buf = Buffer.alloc(5);
        buf.writeUInt8(254, 0);
        buf.writeUInt16LE(5, 1);
        this.send(buf);

        buf = Buffer.alloc(5);
        buf.writeUInt8(255, 0);
        buf.writeUInt32LE(154669603, 1);
        this.send(buf);

        buf = Buffer.from([5, 2, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 248, 127, 0, 0, 0, 0, 0, 131, 108, 101, 170]);
        this.send(buf);
    }
    stop() {
        this.stopped = true;
        this.ws.onclose();
    }
    send(buf) {
        if (this.stopped) return;
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(buf);
        }
    }
    split() {
        var buf = Buffer.alloc(1);
        buf.writeUInt8(17, 0);
        this.send(buf);
    }
    eject() {
        var buf = Buffer.alloc(1);
        buf.writeUInt8(21, 0);
        this.send(buf);
    }
    onmessage(message) {
        var buf = Buffer.from(message.data);
        var offset = 0;
        switch (buf.readUInt8(offset++)) {
            default:
                break;
        }
    }
}

class Client {
    constructor(ws) {
        this.ws = ws;
        this.bots = [];
        this.ws.on('message', m => this.onmessage(m));
        this.ws.on('close', e => this.onclose(e));
        this.botCount();
    }
    onclose() {
        clearInterval(this.int);
    }
    send(data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        }
    }
    botCount() {
        this.int = setInterval(() => {
            var count = this.bots.filter(b => b.ws && b.ws.readyState === WebSocket.OPEN).length;
            this.send(count + '/' + botAmount);
        }, 250);
    }
    onmessage(message) {
        var json = JSON.parse(message);
        try {
            switch (json.type) {
                case 'mouse':
                    if (typeof json.packet !== 'object') break;
                    var buf = Buffer.from(json.packet);
                    this.bots.forEach(bot => bot.send(buf));
                    break;

                case 'start':
                    this.bots = [];
                    for (var i = 0; i < botAmount; i++) {
                        var bot = new Bot(json.ip, i);
                        this.bots.push(bot);
                    }
                    break;

                case 'stop':
                    this.bots.forEach(bot => bot.stop());
                    break;

                case 'split':
                    this.bots.forEach(bot => bot.split());
                    break;

                case 'eject':
                    this.bots.forEach(bot => bot.eject());
                    break;
            }
        } catch (err) {
            console.log(err);
        }
    }
}

var useSSL = false;

if (useSSL) {
    var https = require('https');

    var app = https.createServer({
        key: fs.readFileSync('/root/key.pem'),
        cert: fs.readFileSync('/root/cert.pem')
    }).listen(8443);

    const wss = new WebSocket.Server({ server: app });

    wss.on('connection', (ws, req) => {
        ws.Client = new Client(ws, req);
    });
} else {
    const wss = new WebSocket.Server({ port: 8080 });

    wss.on('connection', (ws, req) => {
        ws.Client = new Client(ws, req);
    });
}
