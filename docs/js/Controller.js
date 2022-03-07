!function(e){var t={};function s(a){if(t[a])return t[a].exports;var i=t[a]={i:a,l:!1,exports:{}};return e[a].call(i.exports,i,i.exports,s),i.l=!0,i.exports}s.m=e,s.c=t,s.d=function(e,t,a){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(s.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)s.d(a,i,function(t){return e[t]}.bind(null,i));return a},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="",s(s.s=1)}([,function(e,t,s){"use strict";s.r(t);var a=self.localStorage||{setItem:(e,t)=>chrome.storage.local.set({[e]:t}),getItem:e=>chrome.storage.local.get(e).then(({[e]:t})=>t),removeItem:e=>chrome.storage.local.remove(e),clear:()=>chrome.storage.local.clear()};let i=null,n=null;const o=[],r=()=>{chrome.windows.create({url:"popup.html",type:"popup",width:400,height:600,top:0,left:0},e=>{})},d=TonWeb.utils.BN,c=TonWeb.utils.nacl,l=TonWeb.utils.Address,h=TonWeb.utils.fromNano;const w=self.location.href.indexOf("testnet")>-1,p=!!(self.chrome&&chrome.runtime&&chrome.runtime.onConnect);class m{constructor(){this.myAddress=null,this.publicKeyHex=null,this.myMnemonicWords=null,this.balance=null,this.walletContract=null,this.transactions=[],this.updateIntervalId=0,this.lastTransactionTime=0,this.isContractInitialized=!1,this.sendingData=null,this.processingVisible=!1,this.ledgerApp=null,this.isLedger=!1,self.view&&(self.view.controller=this),this.pendingMessageResolvers=new Map,this._lastMsgId=1,this.sendToView("setIsTestnet",w),this.whenReady=this._init()}static async wordsToPrivateKey(e){const t=await TonWeb.mnemonic.mnemonicToKeyPair(e);return TonWeb.utils.bytesToBase64(t.secretKey.slice(0,32))}static async saveWords(e,t){await a.setItem("words",await async function(e,t){const s=(new TextEncoder).encode(t),a=await crypto.subtle.digest("SHA-256",s),i=crypto.getRandomValues(new Uint8Array(12)),n={name:"AES-GCM",iv:i},o=await crypto.subtle.importKey("raw",a,n,!1,["encrypt"]),r=(new TextEncoder).encode(e),d=await crypto.subtle.encrypt(n,o,r),c=Array.from(new Uint8Array(d)).map(e=>String.fromCharCode(e)).join(""),l=btoa(c);return Array.from(i).map(e=>("00"+e.toString(16)).slice(-2)).join("")+l}(e.join(","),t))}static async loadWords(e){return(await async function(e,t){const s=(new TextEncoder).encode(t),a=await crypto.subtle.digest("SHA-256",s),i=e.slice(0,24).match(/.{2}/g).map(e=>parseInt(e,16)),n={name:"AES-GCM",iv:new Uint8Array(i)},o=await crypto.subtle.importKey("raw",a,n,!1,["decrypt"]),r=atob(e.slice(24)),d=new Uint8Array(r.match(/[\s\S]/g).map(e=>e.charCodeAt(0))),c=await crypto.subtle.decrypt(n,o,d);return(new TextDecoder).decode(c)}(await a.getItem("words"),e)).split(",")}async getWallet(){return this.ton.provider.getWalletInfo(this.myAddress)}checkContractInitialized(e){return"active"===e.account_state}getBalance(e){return new d(e.balance)}async _init(){return new Promise(async e=>{await a.removeItem("pwdHash");p&&!await a.getItem("address")&&await this._restoreDeprecatedStorage(),this.ton=new TonWeb(new TonWeb.HttpProvider(w?"https://testnet.toncenter.com/api/v2/jsonRPC":"https://toncenter.com/api/v2/jsonRPC",{apiKey:p?"503af517296765c3f1729fcb301b063a00650a50a881eeaddb6307d5d45e21aa":"4f96a149e04e0821d20f9e99ee716e20ff52db7238f38663226b1c0f303003e0"})),this.myAddress=await a.getItem("address"),this.publicKeyHex=await a.getItem("publicKey"),this.myAddress&&await a.getItem("words")?("true"===await a.getItem("isLedger")&&(this.isLedger=!0,this.sendToView("setIsLedger",this.isLedger)),await this.showMain()):(await a.clear(),this.sendToView("showScreen",{name:"start",noAnimation:!0})),e()})}async _restoreDeprecatedStorage(){const{address:e,words:t,walletVersion:s,magic:i,proxy:n}=await this.sendToView("restoreDeprecatedStorage",void 0,!0,!0);e&&t&&await Promise.all([a.setItem("address",e),a.setItem("words",t),a.setItem("walletVersion",s),a.setItem("magic",i),a.setItem("proxy",n)])}async getTransactions(e=20){function t(e){if(!e.msg_data)return"";if("msg.dataText"!==e.msg_data["@type"])return"";const t=e.msg_data.text;return(new TextDecoder).decode(TonWeb.utils.base64ToBytes(t))}const s=[],a=await this.ton.getTransactions(this.myAddress,e);for(let e of a){let a=new d(e.in_msg.value);for(let t of e.out_msgs)a=a.sub(new d(t.value));let i="",n="",o="";e.in_msg.source?(i=e.in_msg.source,n=e.in_msg.destination,o=t(e.in_msg)):e.out_msgs.length&&(i=e.out_msgs[0].source,n=e.out_msgs[0].destination,o=t(e.out_msgs[0])),n&&s.push({amount:a.toString(),from_addr:i,to_addr:n,fee:e.fee.toString(),storageFee:e.storage_fee.toString(),otherFee:e.other_fee.toString(),comment:o,date:1e3*e.utime})}return s}async sign(e,t,s,a,i){let n=(await this.getWallet(this.myAddress)).seqno;n||(n=0);const o=a?a.secretKey:null;return this.walletContract.methods.transfer({secretKey:o,toAddress:e,amount:t,seqno:n,payload:s,sendMode:3,stateInit:i})}async showCreated(){this.sendToView("showScreen",{name:"created"}),this.sendToView("disableCreated",!0),this.myMnemonicWords=await TonWeb.mnemonic.generateMnemonic();const e=await m.wordsToPrivateKey(this.myMnemonicWords),t=c.sign.keyPair.fromSeed(TonWeb.utils.base64ToBytes(e)),s=this.ton.wallet.all.v3R2;this.walletContract=new s(this.ton.provider,{publicKey:t.publicKey,wc:0}),this.myAddress=(await this.walletContract.getAddress()).toString(!0,!0,!0),this.publicKeyHex=TonWeb.utils.bytesToHex(t.publicKey),await a.setItem("publicKey",this.publicKeyHex),await a.setItem("walletVersion","v3R2"),this.sendToView("disableCreated",!1)}async createPrivateKey(){this.showBackup(this.myMnemonicWords,!0)}onBackupWalletClick(){this.afterEnterPassword=async e=>{this.showBackup(e)},this.sendToView("showPopup",{name:"enterPassword"})}showBackup(e,t){this.sendToView("showScreen",{name:"backup",words:e,isFirst:t})}async onBackupDone(){await a.getItem("words")?this.sendToView("showScreen",{name:"main"}):this.sendToView("showScreen",{name:"wordsConfirm",words:this.myMnemonicWords})}onConfirmDone(e){if(e){let t=!0;if(Object.keys(e).forEach(s=>{this.myMnemonicWords[s]!==e[s]&&(t=!1)}),!t)return;this.showCreatePassword()}}async createLedger(e){let t;switch(e){case"hid":t=await TonWeb.ledger.TransportWebHID.create();break;case"ble":t=await TonWeb.ledger.BluetoothTransport.create();break;default:throw new Error("unknown transportType"+e)}t.setDebugMode(!0),this.isLedger=!0,this.ledgerApp=new TonWeb.ledger.AppTon(t,this.ton);const s=(await this.ledgerApp.getAppConfiguration()).version;if(console.log("ledgerAppConfig=",s),!s.startsWith("2"))throw alert("Please update your Ledger TON-app to v2.0.1 or upper or use old wallet version https://tonwallet.me/prev/"),new Error("outdated ledger ton-app version");const{publicKey:a}=await this.ledgerApp.getPublicKey(0,!1),i=new(0,this.ton.wallet.all.v3R1)(this.ton.provider,{publicKey:a,wc:0});this.walletContract=i;const n=await i.getAddress();this.myAddress=n.toString(!0,!0,!0),this.publicKeyHex=TonWeb.utils.bytesToHex(a)}async importLedger(e){await this.createLedger(e),await a.setItem("walletVersion",this.walletContract.getName()),await a.setItem("address",this.myAddress),await a.setItem("isLedger","true"),await a.setItem("ledgerTransportType",e),await a.setItem("words","ledger"),await a.setItem("publicKey",this.publicKeyHex),this.sendToView("setIsLedger",this.isLedger),this.sendToView("showScreen",{name:"readyToGo"})}showImport(){this.sendToView("showScreen",{name:"import"})}async import(e){if(this.myMnemonicWords=e,this.myMnemonicWords)try{const e=await m.wordsToPrivateKey(this.myMnemonicWords),t=c.sign.keyPair.fromSeed(TonWeb.utils.base64ToBytes(e));let s=[];for(let e of this.ton.wallet.list){const a=new e(this.ton.provider,{publicKey:t.publicKey,wc:0}),i=(await a.getAddress()).toString(!0,!0,!0),n=await this.ton.provider.getWalletInfo(i),o=this.getBalance(n);o.gt(new d(0))&&s.push({balance:o,clazz:e}),console.log(a.getName(),i,n,o.toString())}let a=this.ton.wallet.all.v3R2;s.length>0&&(s.sort((e,t)=>e.balance.cmp(t.balance)),a=s[s.length-1].clazz),await this.importImpl(t,a),this.sendToView("importCompleted",{state:"success"})}catch(e){console.error(e),this.sendToView("importCompleted",{state:"failure"})}else this.sendToView("importCompleted",{state:"failure"})}async importImpl(e,t){this.walletContract=new t(this.ton.provider,{publicKey:e.publicKey,wc:0}),this.myAddress=(await this.walletContract.getAddress()).toString(!0,!0,!0),this.publicKeyHex=TonWeb.utils.bytesToHex(e.publicKey),await a.setItem("publicKey",this.publicKeyHex),await a.setItem("walletVersion",this.walletContract.getName()),this.showCreatePassword()}showCreatePassword(){this.sendToView("showScreen",{name:"createPassword"})}async savePrivateKey(e){this.isLedger=!1,await a.setItem("isLedger","false"),await a.setItem("address",this.myAddress),await m.saveWords(this.myMnemonicWords,e),this.myMnemonicWords=null,this.sendToView("setIsLedger",this.isLedger),this.sendToView("showScreen",{name:"readyToGo"}),this.sendToView("privateKeySaved")}async onChangePassword(e,t){let s;try{s=await m.loadWords(e)}catch(e){return void this.sendToView("showChangePasswordError")}await m.saveWords(s,t),this.sendToView("closePopup"),this.sendToView("passwordChanged")}async onEnterPassword(e){let t;try{t=await m.loadWords(e)}catch(e){return void this.sendToView("showEnterPasswordError")}this.afterEnterPassword(t),this.sendToView("passwordEntered")}async showMain(){if(this.sendToView("showScreen",{name:"main",myAddress:this.myAddress}),!this.walletContract){const e=await a.getItem("walletVersion"),t=e?this.ton.wallet.all[e]:this.ton.wallet.default;this.walletContract=new t(this.ton.provider,{address:this.myAddress,publicKey:this.publicKeyHex?TonWeb.utils.hexToBytes(this.publicKeyHex):void 0,wc:0})}this.updateIntervalId=setInterval(()=>this.update(),5e3),this.update(!0),this.sendToDapp("ton_accounts",[this.myAddress])}async initDapp(){this.sendToDapp("ton_accounts",this.myAddress?[this.myAddress]:[]),this.doMagic("true"===await a.getItem("magic")),this.doProxy("true"===await a.getItem("proxy"))}async initView(){this.myAddress&&await a.getItem("words")?(this.sendToView("showScreen",{name:"main",myAddress:this.myAddress}),null!==this.balance&&this.sendToView("setBalance",{balance:this.balance.toString(),txs:this.transactions})):this.sendToView("showScreen",{name:"start",noAnimation:!0}),this.sendToView("setIsMagic","true"===await a.getItem("magic")),this.sendToView("setIsProxy","true"===await a.getItem("proxy"))}update(e){(this.processingVisible&&this.sendingData||null===this.balance||e)&&this.getWallet().then(e=>{const t=this.getBalance(e),s=null===this.balance||0!==this.balance.cmp(t);this.balance=t;const a=this.checkContractInitialized(e)&&e.seqno;!this.isContractInitialized&&a&&(this.isContractInitialized=!0),s?this.getTransactions().then(e=>{if(e.length>0){this.transactions=e;const t=e.filter(e=>Number(e.date)>this.lastTransactionTime);if(this.lastTransactionTime=Number(e[0].date),this.processingVisible&&this.sendingData)for(let e of t){const t=new l(e.to_addr).toString(!0,!0,!0),s=new l(this.sendingData.toAddress).toString(!0,!0,!0),a=e.amount,i="-"+this.sendingData.amount.toString();if(t===s&&a===i){this.sendToView("showPopup",{name:"done",message:h(this.sendingData.amount)+" TON have been sent"}),this.processingVisible=!1,this.sendingData=null;break}}}this.sendToView("setBalance",{balance:t.toString(),txs:e})}):this.sendToView("setBalance",{balance:t.toString(),txs:this.transactions})})}async showAddressOnDevice(){this.ledgerApp||await this.createLedger(await a.getItem("ledgerTransportType")||"hid");const{address:e}=await this.ledgerApp.getAddress(0,!0,this.ledgerApp.ADDRESS_FORMAT_USER_FRIENDLY+this.ledgerApp.ADDRESS_FORMAT_URL_SAFE+this.ledgerApp.ADDRESS_FORMAT_BOUNCEABLE);console.log(e.toString(!0,!0,!0))}async getFees(e,t,s,a){if(!this.isContractInitialized&&!this.publicKeyHex)return TonWeb.utils.toNano(.010966001);const i=await this.sign(t,e,s,null,a),n=(await i.estimateFee()).source_fees,o=new d(n.in_fwd_fee),r=new d(n.storage_fee),c=new d(n.gas_fee),l=new d(n.fwd_fee);return o.add(r).add(c).add(l)}async showSendConfirm(e,t,s,a,i){if(!e.gt(new d(0))||this.balance.lt(e))return void this.sendToView("sendCheckFailed");if(!l.isValid(t))return void this.sendToView("sendCheckFailed");let n;try{n=await this.getFees(e,t,s,i)}catch(e){return console.error(e),void this.sendToView("sendCheckFailed")}this.balance.sub(n).lt(e)?this.sendToView("sendCheckCantPayFee",{fee:n}):(this.isLedger?(this.sendToView("showPopup",{name:"sendConfirm",amount:e.toString(),toAddress:t,fee:n.toString()},a),this.send(t,e,s,null,i)):(this.afterEnterPassword=async a=>{this.processingVisible=!0,this.sendToView("showPopup",{name:"processing"});const n=await m.wordsToPrivateKey(a);this.send(t,e,s,n,i)},this.sendToView("showPopup",{name:"sendConfirm",amount:e.toString(),toAddress:t,fee:n.toString()},a)),this.sendToView("sendCheckSucceeded"))}showSignConfirm(e,t){return new Promise((s,a)=>{this.isLedger?(alert("sign not supported by Ledger"),a()):(this.afterEnterPassword=async t=>{this.sendToView("closePopup");const a=await m.wordsToPrivateKey(t),i=this.rawSign(e,a);s(i)},this.sendToView("showPopup",{name:"signConfirm",data:e},t))})}async send(e,t,s,i,n){try{let o=0;if(this.isLedger){if(n)throw new Error("stateInit dont supported by Ledger");this.ledgerApp||await this.createLedger(await a.getItem("ledgerTransportType")||"hid");const t=new l(e);t.isUserFriendly&&(o+=this.ledgerApp.ADDRESS_FORMAT_USER_FRIENDLY,t.isUrlSafe&&(o+=this.ledgerApp.ADDRESS_FORMAT_URL_SAFE),t.isBounceable&&(o+=this.ledgerApp.ADDRESS_FORMAT_BOUNCEABLE),t.isTestOnly&&(o+=this.ledgerApp.ADDRESS_FORMAT_TEST_ONLY))}if(this.checkContractInitialized(await this.ton.provider.getWalletInfo(e))||(e=new l(e).toString(!0,!0,!1)),this.isLedger){let a=(await this.getWallet(this.myAddress)).seqno;a||(a=0);const i=await this.ledgerApp.transfer(0,this.walletContract,e,t,a,o);this.sendingData={toAddress:e,amount:t,comment:s,query:i},this.sendToView("showPopup",{name:"processing"}),this.processingVisible=!0,await this.sendQuery(i)}else{const a=c.sign.keyPair.fromSeed(TonWeb.utils.base64ToBytes(i)),o=await this.sign(e,t,s,a,n);this.sendingData={toAddress:e,amount:t,comment:s,query:o},await this.sendQuery(o)}}catch(e){console.error(e),this.sendToView("closePopup"),alert("Error sending")}}rawSign(e,t){const s=c.sign.keyPair.fromSeed(TonWeb.utils.base64ToBytes(t)),a=c.sign.detached(TonWeb.utils.hexToBytes(e),s.secretKey);return TonWeb.utils.bytesToHex(a)}async sendQuery(e){console.log("Send"),"ok"===(await e.send())["@type"]||(this.sendToView("closePopup"),alert("Send error"))}async onDisconnectClick(){this.myAddress=null,this.publicKeyHex=null,this.balance=null,this.walletContract=null,this.transactions=[],this.lastTransactionTime=0,this.isContractInitialized=!1,this.sendingData=null,this.processingVisible=!1,this.isLedger=!1,this.ledgerApp=null,clearInterval(this.updateIntervalId),await a.clear(),this.sendToView("showScreen",{name:"start"}),this.sendToDapp("ton_accounts",[])}doMagic(e){try{this.sendToDapp("ton_doMagic",e)}catch(e){}}doProxy(e){}sendToView(e,t,s,a){if(!self.view){const i={method:e,params:t},r=()=>{n?n.postMessage(i):s&&o.push(i)};return a?new Promise(e=>{i.id=this._lastMsgId++,this.pendingMessageResolvers.set(i.id,e),r()}):void r()}{const s=self.view.onMessage(e,t);if(a)return s}}async onViewMessage(e,t){switch(e){case"showScreen":switch(t.name){case"created":await this.showCreated();break;case"import":this.showImport();break;case"importLedger":await this.importLedger(t.transportType)}break;case"import":await this.import(t.words);break;case"createPrivateKey":await this.createPrivateKey();break;case"passwordCreated":await this.savePrivateKey(t.password);break;case"update":this.update(!0);break;case"showAddressOnDevice":await this.showAddressOnDevice();break;case"onEnterPassword":await this.onEnterPassword(t.password);break;case"onChangePassword":await this.onChangePassword(t.oldPassword,t.newPassword);break;case"onSend":await this.showSendConfirm(new d(t.amount),t.toAddress,t.comment);break;case"onBackupDone":await this.onBackupDone();break;case"onConfirmBack":this.showBackup(this.myMnemonicWords);break;case"onImportBack":this.sendToView("showScreen",{name:"start"});break;case"onConfirmDone":this.onConfirmDone(t.words);break;case"showMain":await this.showMain();break;case"onBackupWalletClick":this.onBackupWalletClick();break;case"disconnect":await this.onDisconnectClick();break;case"onClosePopup":this.processingVisible=!1;break;case"onMagicClick":await a.setItem("magic",t?"true":"false"),this.doMagic(t);break;case"onProxyClick":await a.setItem("proxy",t?"true":"false"),this.doProxy(t)}}sendToDapp(e,t){i&&i.postMessage(JSON.stringify({type:"gramWalletAPI",message:{jsonrpc:"2.0",method:e,params:t}}))}requestPublicKey(e){return new Promise((t,s)=>{n||r(),this.afterEnterPassword=async e=>{const s=await m.wordsToPrivateKey(e),i=c.sign.keyPair.fromSeed(TonWeb.utils.base64ToBytes(s));this.publicKeyHex=TonWeb.utils.bytesToHex(i.publicKey),await a.setItem("publicKey",this.publicKeyHex),t()},this.sendToView("showPopup",{name:"enterPassword"},e)})}async onDappMessage(e,t){const s=!n;switch(e){case"ton_requestAccounts":return this.myAddress?[this.myAddress]:[];case"ton_requestWallets":if(!this.myAddress)return[];this.publicKeyHex||await this.requestPublicKey(s);const e=await a.getItem("walletVersion");return[{address:this.myAddress,publicKey:this.publicKeyHex,walletVersion:e}];case"ton_getBalance":return this.balance?this.balance.toString():"";case"ton_sendTransaction":const i=t[0];return n||r(),i.data&&("hex"===i.dataType?i.data=TonWeb.utils.hexToBytes(i.data):"base64"===i.dataType?i.data=TonWeb.utils.base64ToBytes(i.data):"boc"===i.dataType&&(i.data=TonWeb.boc.Cell.oneFromBoc(TonWeb.utils.base64ToBytes(i.data)))),i.stateInit&&(i.stateInit=TonWeb.boc.Cell.oneFromBoc(TonWeb.utils.base64ToBytes(i.stateInit))),this.showSendConfirm(new d(i.value),i.to,i.data,s,i.stateInit),!0;case"ton_rawSign":const o=t[0];return n||r(),this.showSignConfirm(o.data,s);case"flushMemoryCache":return await chrome.webRequest.handlerBehaviorChanged(),!0}}}const u=new m;p&&chrome.runtime.onConnect.addListener(e=>{if("gramWalletContentScript"===e.name)i=e,i.onMessage.addListener(async e=>{if(!e.message)return;const t=await u.onDappMessage(e.message.method,e.message.params);i&&i.postMessage(JSON.stringify({type:"gramWalletAPI",message:{jsonrpc:"2.0",id:e.message.id,method:e.message.method,result:t}}))}),i.onDisconnect.addListener(()=>{i=null}),u.whenReady.then(()=>{u.initDapp()});else if("gramWalletPopup"===e.name){n=e,n.onMessage.addListener((function(e){if("response"===e.method){const t=u.pendingMessageResolvers.get(e.id);t&&(t(e.result),u.pendingMessageResolvers.delete(e.id))}else u.onViewMessage(e.method,e.params)})),n.onDisconnect.addListener(()=>{n=null});const t=()=>{o.forEach(e=>n.postMessage(e)),o.length=0};u.myAddress||t(),u.whenReady.then(async()=>{await u.initView(),t()})}})}]);