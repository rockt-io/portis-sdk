(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define('portis', ['exports'], factory) :
	(factory((global.Portis = {})));
}(this, (function (exports) { 'use strict';

function isMobile() {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
        check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

var sdkVersion = '1.2.0';
var postMessages = {
    PT_RESPONSE: 'PT_RESPONSE',
    PT_HANDLE_REQUEST: 'PT_HANDLE_REQUEST',
    PT_AUTHENTICATED: 'PT_AUTHENTICATED',
    PT_SHOW_IFRAME: 'PT_SHOW_IFRAME',
    PT_HIDE_IFRAME: 'PT_HIDE_IFRAME',
    PT_USER_DENIED: 'PT_USER_DENIED',
};
var PortisProvider = /** @class */ (function () {
    function PortisProvider(opts) {
        this.portisClient = 'https://app.portis.io';
        this.requests = {};
        this.queue = [];
        this.authenticated = false;
        this.account = null;
        this.network = null;
        this.isPortis = true;
        if (!opts.apiKey) {
            throw 'apiKey is missing. Please check your apiKey in the Portis dashboard: https://app.portis.io/dashboard';
        }
        this.referrerAppOptions = {
            sdkVersion: sdkVersion,
            network: opts.network || 'mainnet',
            apiKey: opts.apiKey,
        };
        this.iframe = this.createIframe();
        this.listen();
    }
    PortisProvider.prototype.sendAsync = function (payload, cb) {
        this.enqueue(payload, cb);
    };
    PortisProvider.prototype.send = function (payload) {
        var result;
        switch (payload.method) {
            case 'eth_accounts':
                var account = this.account;
                result = account ? [account] : [];
                break;
            case 'eth_coinbase':
                result = this.account;
                break;
            case 'net_version':
                result = this.network;
                break;
            case 'eth_uninstallFilter':
                this.sendAsync(payload, function (_) { return _; });
                result = true;
                break;
            default:
                throw new Error("The Portis Web3 object does not support synchronous methods like " + payload.method + " without a callback parameter.");
        }
        return {
            id: payload.id,
            jsonrpc: payload.jsonrpc,
            result: result,
        };
    };
    PortisProvider.prototype.isConnected = function () {
        return true;
    };
    PortisProvider.prototype.createIframe = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            window.addEventListener('load', function () {
                var iframe = document.createElement('iframe');
                var iframeStyleProps = {
                    'display': 'none',
                    'position': 'fixed',
                    'top': '10px',
                    'right': '20px',
                    'height': '525px',
                    'width': '390px',
                    'z-index': '2147483647',
                    'box-shadow': '0 5px 40px rgba(0,0,0,.16)',
                    'border-radius': '8px',
                    'border': 'none',
                    'animation': 'portis-entrance 250ms ease-in-out forwards',
                    'opacity': '0',
                };
                var iframeMobileStyleProps = {
                    'display': 'none',
                    'position': 'fixed',
                    'z-index': '2147483647',
                    'width': '100%',
                    'height': '100%',
                    'top': '0',
                    'left': '0',
                    'right': '0',
                    'border': 'none',
                };
                var style = document.createElement('style');
                style.innerHTML = '@keyframes portis-entrance { 100% { opacity: 1; top: 20px; } }';
                if (isMobile()) {
                    Object.keys(iframeMobileStyleProps).forEach(function (prop) { return iframe.style[prop] = iframeMobileStyleProps[prop]; });
                }
                else {
                    Object.keys(iframeStyleProps).forEach(function (prop) { return iframe.style[prop] = iframeStyleProps[prop]; });
                }
                iframe.scrolling = 'no';
                iframe.id = 'PT_IFRAME';
                iframe.src = _this.portisClient + "/send/?p=" + btoa(JSON.stringify(_this.referrerAppOptions));
                document.body.appendChild(iframe);
                document.head.appendChild(style);
                resolve(iframe);
            }, false);
        });
    };
    PortisProvider.prototype.showIframe = function () {
        this.iframe.then(function (iframe) {
            iframe.style.display = 'block';
            if (isMobile()) {
                document.body.style.overflow = 'hidden';
            }
        });
    };
    PortisProvider.prototype.hideIframe = function () {
        this.iframe.then(function (iframe) {
            iframe.style.display = 'none';
            if (isMobile()) {
                document.body.style.overflow = 'inherit';
            }
        });
    };
    PortisProvider.prototype.enqueue = function (payload, cb) {
        this.queue.push({ payload: payload, cb: cb });
        if (this.authenticated) {
            this.dequeue();
        }
        else if (this.queue.length == 1) {
            // show iframe in order to authenticate the user
            this.showIframe();
        }
    };
    PortisProvider.prototype.dequeue = function () {
        if (this.queue.length == 0) {
            return;
        }
        var item = this.queue.shift();
        if (item) {
            var payload = item.payload;
            var cb = item.cb;
            this.sendPostMessage(postMessages.PT_HANDLE_REQUEST, payload);
            this.requests[payload.id] = { payload: payload, cb: cb };
            this.dequeue();
        }
    };
    PortisProvider.prototype.sendPostMessage = function (msgType, payload) {
        this.iframe.then(function (iframe) {
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({ msgType: msgType, payload: payload }, '*');
            }
        });
    };
    PortisProvider.prototype.listen = function () {
        var _this = this;
        window.addEventListener('message', function (evt) {
            if (evt.origin === _this.portisClient) {
                switch (evt.data.msgType) {
                    case postMessages.PT_AUTHENTICATED: {
                        _this.authenticated = true;
                        _this.dequeue();
                        break;
                    }
                    case postMessages.PT_RESPONSE: {
                        var id = evt.data.response.id;
                        _this.requests[id].cb(null, evt.data.response);
                        if (_this.requests[id].payload.method === 'eth_accounts' || _this.requests[id].payload.method === 'eth_coinbase') {
                            _this.account = evt.data.response.result[0];
                        }
                        if (_this.requests[id].payload.method === 'net_version') {
                            _this.network = evt.data.response.result;
                        }
                        _this.dequeue();
                        break;
                    }
                    case postMessages.PT_SHOW_IFRAME: {
                        _this.showIframe();
                        break;
                    }
                    case postMessages.PT_HIDE_IFRAME: {
                        _this.hideIframe();
                        break;
                    }
                    case postMessages.PT_USER_DENIED: {
                        var id = evt.data.response ? evt.data.response.id : null;
                        if (id) {
                            _this.requests[id].cb(new Error('User denied transaction signature.'));
                        }
                        else {
                            _this.queue.forEach(function (item) { return item.cb(new Error('User denied transaction signature.')); });
                        }
                        _this.dequeue();
                        break;
                    }
                }
            }
        }, false);
    };
    return PortisProvider;
}());

exports.PortisProvider = PortisProvider;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=bundle.js.map
