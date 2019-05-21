// ==UserScript==
// @name         Blob.io Bots
// @namespace    https://youtube.com/Lemons1337
// @version      1
// @description  Blob.io bots!
// @author       Lemons
// @match        *://client.blobgame.io/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

window.addEventListener("load", () => {
    let ui = document.createElement('div');
    ui.id = 'botcanvas';
    ui.style['background'] = 'rgba(0,0,0,0.4)';
    ui.style['top'] = '250px';
    ui.style['left'] = '17px';
    ui.style['display'] = 'block';
    ui.style['position'] = 'absolute';
    ui.style['text-align'] = 'center';
    ui.style['font-size'] = '15px';
    ui.style['color'] = '#FFFFFF';
    ui.style['padding'] = '7px';
    ui.style['z-index'] = '1000000';
    ui.innerHTML += 'Agar API';
    let count = document.createElement('span');
    ui.appendChild(count);
    document.body.appendChild(ui);
    html.onScriptDownloaded(function () {
        class User {
            constructor() {
                this.wsIp = 'ws://localhost:8080';
                this.started = false;
                this.x = this.y = 0;
                this.mouseInt = -1;
                this.byteLen = 0;
                this.server = '';
                this.mouse = 0;
                this.ws = null;
                this.connect();
            }

            connect() {
                this.ws = new WebSocket(this.wsIp);
                this.ws.onmessage = this.onmessage.bind(this);
                this.ws.onerror = this.onerror.bind(this);
                this.ws.onclose = this.onclose.bind(this);
                this.ws.onopen = this.onopen.bind(this);
            }

            onopen() {
                this.startMouseInt();
                this.started = false;
            }

            startMouseInt() {

                this.mouseInt = setInterval(() => {

                    let json = {};

                    json.type = "mouse";
                    json.packet = this.mouse;
                    //json.x = this.x;
                    //json.y = this.y;

                    this.send(json);

                }, 100);

            }

            onmessage(message) {}

            onclose() {
                setTimeout(this.connect(), 1500);
                clearInterval(this.mouseInt);
            }

            startBots() {
                let json = {};

                json.type = "start";
                json.ip = client.server;

                this.send(json);
            }

            stopBots() {
                this.send({
                    type: 'stop'
                });
            }

            onerror() { }

            send(message) {
                if (this.ws && this.ws.readyState == 1) this.ws.send(JSON.stringify(message));
            }

            get isTyping() {
                return document.querySelectorAll('input:focus').length;
            }

            keyDown(event) {
                if (this.isTyping || !event.key) return;
                switch (event.key.toLowerCase()) {
                    case 'e':
                        this.send({
                            type: 'split'
                        });
                        break;

                    case 'r':
                        this.send({
                            type: 'eject'
                        });
                        break;

                }
            }

        }
        window.client = new User();
        window.started = false;
        document.addEventListener('keydown', window.client.keyDown.bind(window.client));
        (function () {
            WebSocket.prototype._send = WebSocket.prototype.send;
            WebSocket.prototype.send = function (data) {
                this._send(data);
                var buf = new Uint8Array(data.buffer ? data.buffer : data);
                switch (buf[0]) {
                    case 16:
                        window.client.mouse = [...buf];
                        break;

                    case 255:
                        if (!window.started) client.startBots();
                        window.started = true;
                        break;

                    case 22:
                        client.send({
                            type: 'split'
                        });
                        break;

                    case 23:
                        this.send({
                            type: 'eject'
                        });
                        break;
                }
                window.client.server = this.url;
            };
        })();
    }.toString().split('\n').slice(1, -1).join('\n'));
});
