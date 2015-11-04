var self = require("sdk/self");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
ss = require("sdk/simple-storage");
var prefsvc = require("sdk/preferences/service");
var tmr = require('sdk/timers');
var xhrObject = require('sdk/net/xhr');
var winUtils = require("sdk/deprecated/window-utils"); // for new style sdk
var _ = require("sdk/l10n").get;	//Für multilingual Funktionalität
var notifications = require("sdk/notifications");

if(typeof ss.storage.automaticUse == 'undefined')
{
	ss.storage.automaticUse = true;
}


if(typeof ss.storage.activation == 'undefined')
{
	ss.storage.activation = true;
}

//Für die Wiederherstellung der Firefoxeinstellung nach einer Deinstallation des Addon:
if(typeof ss.storage.http == 'undefined')
{
	ss.storage.http = prefsvc.get("network.proxy.http");
}

if(typeof ss.storage.http_port == 'undefined')
{
	ss.storage.http_port = prefsvc.get("network.proxy.http_port");
}

if(typeof ss.storage.ssl == 'undefined')
{
	ss.storage.ssl = prefsvc.get("network.proxy.ssl");
}

if(typeof ss.storage.ssl_port == 'undefined')
{
	ss.storage.ssl_port = prefsvc.get("network.proxy.ssl_port");
}

if(typeof ss.storage.socks_version == 'undefined')
{
	ss.storage.socks_version = prefsvc.get("network.proxy.socks_version");
}

if(typeof ss.storage.no_proxies_on == 'undefined')
{
	ss.storage.no_proxies_on = prefsvc.get("network.proxy.no_proxies_on");
}

if(typeof ss.storage.type == 'undefined')
{
	ss.storage.type = prefsvc.get("network.proxy.type");
}

adress = "http://173.194.112.159";	//google-server//"http://82.221.104.119:8080";	//enigmabox.net //82.221.104.119

var language = new Array();
language['ch'] = _("ch");
language['de'] = _("de");
language['se'] = _("se");
language['hu'] = _("hu");
language['us'] = _("us");


//Statusvariablen initialisieren:
ip_from_Router = 0;
regular_Internet = 0;
network_service = 0;
cjdns_network = 0;
webfilter_status = 0;
expiration_date = 0;
current_country = "";
teletext_status = 0;
personal_website_status = 0;
dokuwiki_status = 0;
owncloud_status = 0;
pastebin_status = 0;
ipv6_adress = "";
ipv6_adress_old = "";

handler = function(event){
        tabs.open("http://box/subscription/", "tab");
    };
handler1_old = function(event){
        tabs.open("http://[]", "tab");
    };
handler2_old = function(event){
        tabs.open("http://[]/owncloud", "tab");
    };
handler3_old = function(event){
        tabs.open("http://[]/wiki", "tab");
    };
handler4_old = function(event){
        tabs.open("http://[]/pastebin", "tab");
    };

var randomNum = Math.round(Math.random() * 10000);	//Damit nicht aus Cach geladen wird
var timeout = 1000; 
var xhr = new xhrObject.XMLHttpRequest();
xhr.open('GET', 'http://box/api/v1/get_firefoxAddon_info?rand=' + randomNum, false);

tmr.setTimeout(function () {xhr.abort()}, timeout);

try {
	xhr.send();
	var str = xhr.responseText;
	var boxStatus = str.split("\n");
	expiration_date = boxStatus[4];
	var date = new Date();
	var expiration_date_object = new Date(expiration_date);
	var expiration_date_unix = expiration_date_object.getTime();
	
	if((expiration_date_unix - date)/(1000*60*60*24*30) < 3 && (expiration_date_unix - date)/(1000*60*60*24*30) >= 0)
	{
		showNotification(_("subNotificationTitle"), _("subNotificationWarning"));
	}
	
	else if((expiration_date_unix - date)/(1000*60*60*24*30) < 0)
	{
		showNotification(_("subNotificationTitle"), _("subNotification"));
	}
} 

catch (e) 
{
}

//Deinstallationsfunktion:
exports.onUnload = function (reason) 
{
	if(reason == "uninstall" || reason == "disable")
	{	
		prefsvc.set("network.proxy.http", ss.storage.http);
		prefsvc.set("network.proxy.http_port", ss.storage.http_port);
		prefsvc.set("network.proxy.ssl", ss.storage.ssl);
		prefsvc.set("network.proxy.ssl_port", ss.storage.ssl_port);
		prefsvc.set("network.proxy.socks_version", ss.storage.socks_version);
		prefsvc.set("network.proxy.no_proxies_on", ss.storage.no_proxies_on);
		prefsvc.set("network.proxy.type", ss.storage.type);	//Manuelle Proxy-Einstellungen
		
		//Die Variablen mit den Werten vor der Installation löschen, damit sie bei einer neuen Installation neu initialisiert werden:
		delete ss.storage.http;
		delete ss.storage.http_port;
		delete ss.storage.ssl;
		delete ss.storage.ssl_port;
		delete ss.storage.socks_version;
		delete ss.storage.no_proxies_on;
		delete ss.storage.type;
	}
};

var delegate = {
onTrack: function(window) {

		if(window.location != "chrome://browser/content/browser.xul") {
			// console.log("=> win location false");
			return;
		}
	
		var document = window.document;
		var navBar = document.getElementById('addon-bar');
	
		btn = document.createElement('toolbarbutton');
		btn.setAttribute('id', 'WebfilterControl');
		btn.setAttribute("tooltiptext", _("activated"));
		btn.setAttribute('type', 'menu-button');
		btn.setAttribute('class', 'toolbarbutton-1');
		btn.setAttribute('image', self.data.url("./icon_activated.ico"));	//http://www.facebook.com/favicon.ico
	
		btn.addEventListener('command', function(event) {
				console.log("this=" + this.id);
				console.log(event.target.id);
				if(event.target.id == 'WebfilterControl')
				{
					handleClick(btn);
				}
			}
			, false);
	
		var menupopup = document.createElement('menupopup');
		menupopup.setAttribute('id', 'menupopup');
		menupopup.addEventListener('command', function(event) {
				// TODO your callback
			}
			, false);
	
		//menu items
		var menuitem1 = document.createElement('menuitem');
		menuitem1.setAttribute('id', 'menuitem1');
		menuitem1.setAttribute('label', _("admin-interface"));
		menuitem1.setAttribute('image', self.data.url("./settings.png"));
		menuitem1.setAttribute('class', 'menuitem-iconic');
		menuitem1.setAttribute('validate', 'always');
		//menuitem1.dir = "reverse";
		menuitem1.addEventListener('command', function(event) {
				tabs.open("http://box", "tab");
			}
			, false);
		
		var menuitem10 = document.createElement('menuitem');
		menuitem10.setAttribute('id', 'menuitem10');
		menuitem10.setAttribute('label', _("enigmaMail") + "  " + checkMail());
		menuitem10.setAttribute('image', self.data.url("./webmail.png"));
		menuitem10.setAttribute('class', 'menuitem-iconic');
		menuitem10.setAttribute('validate', 'always');
		//menuitem10.dir = "reverse";
		menuitem10.addEventListener('command', function(event) {
				tabs.open("http://mail.box", "tab");
			}
			, false);
			
		var menuitem17 = document.createElement('menuitem');
		menuitem17.setAttribute('id', 'menuitem17');
		menuitem17.setAttribute('label', _("teletext"));
		menuitem17.setAttribute('image', self.data.url("./TXT.png"));
		menuitem17.setAttribute('class', 'menuitem-iconic');
		menuitem17.setAttribute('validate', 'always');
		//menuitem10.dir = "reverse";
		menuitem17.addEventListener('command', function(event) {
				tabs.open("http://text.box", "tab");
			}
			, false);
			
		var menuitem13 = document.createElement('menuitem');
		menuitem13.setAttribute('id', 'menuitem13');
		menuitem13.setAttribute('label', _("ownWebsite"));
		menuitem13.setAttribute('image', self.data.url("./home.png"));
		menuitem13.setAttribute('class', 'menuitem-iconic');
		menuitem13.setAttribute('validate', 'always');
		//menuitem10.dir = "reverse";
		/*menuitem13.addEventListener('command', function(event) {
				tabs.open("http://[]", "tab");
			}
			, false);*/
			
		var menuitem14 = document.createElement('menuitem');
		menuitem14.setAttribute('id', 'menuitem14');
		menuitem14.setAttribute('label', _("ownCloud"));
		menuitem14.setAttribute('image', self.data.url("./OwnCloud.png"));
		menuitem14.setAttribute('class', 'menuitem-iconic');
		menuitem14.setAttribute('validate', 'always');
		//menuitem10.dir = "reverse";
		/*menuitem14.addEventListener('command', function(event) {
				tabs.open("http://[]/owncloud", "tab");
			}
			, false);*/
			
		var menuitem15 = document.createElement('menuitem');
		menuitem15.setAttribute('id', 'menuitem15');
		menuitem15.setAttribute('label', _("wiki"));
		menuitem15.setAttribute('image', self.data.url("./book.png"));
		menuitem15.setAttribute('class', 'menuitem-iconic');
		menuitem15.setAttribute('validate', 'always');
		//menuitem10.dir = "reverse";
		/*menuitem15.addEventListener('command', function(event) {
				tabs.open("http://[]/wiki", "tab");
			}
			, false);*/
			
		var menuitem16 = document.createElement('menuitem');
		menuitem16.setAttribute('id', 'menuitem16');
		menuitem16.setAttribute('label', _("pastebin"));
		menuitem16.setAttribute('image', self.data.url("./pastebin.png"));
		menuitem16.setAttribute('class', 'menuitem-iconic');
		menuitem16.setAttribute('validate', 'always');
		//menuitem10.dir = "reverse";
		/*menuitem16.addEventListener('command', function(event) {
				tabs.open("http://[]/pastebin", "tab");
			}
			, false);*/
			
		var menuitem11 = document.createElement('menuitem');
		menuitem11.setAttribute('id', 'menuitem11');
		menuitem11.setAttribute('label', _("help"));
		menuitem11.setAttribute('image', self.data.url("./question.png"));
		menuitem11.setAttribute('class', 'menuitem-iconic');
		menuitem11.setAttribute('validate', 'always');
		//menuitem10.dir = "reverse";
		menuitem11.addEventListener('command', function(event) {
				tabs.open("https://docs.enigmabox.net/de/internet.html#werbeblocker-konfigurieren", "tab");
			}
			, false);
		
		var menuseparator1 = document.createElement('menuseparator');
		menuseparator1.setAttribute('id', 'menuseparator1');
		menuseparator1.setAttribute('height', '20px');
		
		var menuitem8 = document.createElement('menuitem');
		menuitem8.setAttribute('id', 'menuitem8');
		menuitem8.setAttribute('disabled', true);
		menuitem8.setAttribute('label', _("computerConnection"));
		menuitem8.setAttribute('class', 'menuitem-iconic');
		menuitem8.dir = "reverse";
		
		var menuseparator4 = document.createElement('menuseparator');
		menuseparator4.setAttribute('id', 'menuseparator4');
		
		var menuitem2 = document.createElement('menuitem');
		menuitem2.setAttribute('id', 'menuitem2');
		menuitem2.setAttribute('disabled', true);
		menuitem2.setAttribute('label', _("enigmaBoxConnection"));
		menuitem2.setAttribute('image', self.data.url("./error-icon.png"));
		menuitem2.setAttribute('class', 'menuitem-iconic');
		menuitem2.setAttribute('validate', 'always');
		menuitem2.dir = "reverse";
		
		var menuitem9 = document.createElement('menuitem');
		menuitem9.setAttribute('id', 'menuitem9');
		menuitem9.setAttribute('disabled', true);
		menuitem9.setAttribute('label', _("internetConnection"));
		menuitem9.setAttribute('image', self.data.url("./error-icon.png"));
		menuitem9.setAttribute('class', 'menuitem-iconic');
		menuitem9.setAttribute('validate', 'always');
		menuitem9.dir = "reverse";
		
		var menuseparator2 = document.createElement('menuseparator');
		menuseparator2.setAttribute('id', 'menuseparator2');
		menuseparator2.setAttribute('height', '20px');
			
		var menuitem7 = document.createElement('menuitem');
		menuitem7.setAttribute('id', 'menuitem7');
		menuitem7.setAttribute('disabled', true);
		menuitem7.setAttribute('label', _("enigmaBoxStatus"));
		menuitem7.setAttribute('class', 'menuitem-iconic');
		menuitem7.setAttribute('validate', 'always');
		menuitem7.dir = "reverse";
		
		var menuseparator3 = document.createElement('menuseparator');
		menuseparator3.setAttribute('id', 'menuseparator3');
		
		var menuitem3 = document.createElement('menuitem');
		menuitem3.setAttribute('id', 'menuitem3');
		menuitem3.setAttribute('disabled', true);
		menuitem3.setAttribute('label', _("routerIP"));
		menuitem3.setAttribute('image', self.data.url("./error-icon.png"));
		menuitem3.setAttribute('class', 'menuitem-iconic');
		menuitem3.setAttribute('validate', 'always');
		menuitem3.dir = "reverse";
		
		var menuitem4 = document.createElement('menuitem');
		menuitem4.setAttribute('id', 'menuitem4');
		menuitem4.setAttribute('disabled', true);
		menuitem4.setAttribute('label', _("regularInternet"));
		menuitem4.setAttribute('image', self.data.url("./error-icon.png"));
		menuitem4.setAttribute('class', 'menuitem-iconic');
		menuitem4.setAttribute('validate', 'always');
		menuitem4.dir = "reverse";
		
		var menuitem5 = document.createElement('menuitem');
		menuitem5.setAttribute('id', 'menuitem5');
		menuitem5.setAttribute('disabled', true);
		menuitem5.setAttribute('label', _("cjdnsConnection"));
		menuitem5.setAttribute('image', self.data.url("./error-icon.png"));
		menuitem5.setAttribute('class', 'menuitem-iconic');
		menuitem5.setAttribute('validate', 'always');
		menuitem5.dir = "reverse";
		
		var menuitem6 = document.createElement('menuitem');
		menuitem6.setAttribute('id', 'menuitem6');
		menuitem6.setAttribute('disabled', true);
		menuitem6.setAttribute('label', _("encryptedInternet"));
		menuitem6.setAttribute('image', self.data.url("./error-icon.png"));
		menuitem6.setAttribute('class', 'menuitem-iconic');
		menuitem6.setAttribute('validate', 'always');
		menuitem6.dir = "reverse";
		
		var menuitem18 = document.createElement('menuitem');
		menuitem18.setAttribute('id', 'menuitem18');
		menuitem18.setAttribute('disabled', true);
		menuitem18.setAttribute('label', _("country") + ": ");
		menuitem18.setAttribute('class', 'menuitem-iconic');
		menuitem18.setAttribute('validate', 'always');
		menuitem18.dir = "reverse";
		
		var menuitem12 = document.createElement('menuitem');
		menuitem12.setAttribute('id', 'menuitem12');
		menuitem12.setAttribute('disabled', true);
		menuitem12.setAttribute('label', _("sub") + ": " + _("valid"));
		menuitem12.setAttribute('image', self.data.url("./error-icon.png"));
		menuitem12.setAttribute('class', 'menuitem-iconic');
		menuitem12.setAttribute('validate', 'always');
		menuitem12.dir = "reverse";
	
		menupopup.appendChild(menuitem1);
		menupopup.appendChild(menuitem10);
		menupopup.appendChild(menuitem17);
		menupopup.appendChild(menuitem13);
		menupopup.appendChild(menuitem14);
		menupopup.appendChild(menuitem15);
		menupopup.appendChild(menuitem16);
		menupopup.appendChild(menuitem11);
		menupopup.appendChild(menuseparator1);
		menupopup.appendChild(menuitem8);
		menupopup.appendChild(menuseparator4);
		menupopup.appendChild(menuitem2);
		menupopup.appendChild(menuitem9);
		menupopup.appendChild(menuseparator2);
		menupopup.appendChild(menuitem7);
		menupopup.appendChild(menuseparator3);
		menupopup.appendChild(menuitem3);
		menupopup.appendChild(menuitem4);
		menupopup.appendChild(menuitem5);
		menupopup.appendChild(menuitem6);
		menupopup.appendChild(menuitem18);
		menupopup.appendChild(menuitem12);
		
		btn.appendChild(menupopup);
		navBar.appendChild(btn);
	
		console.log("window tracked");
		intervalID = tmr.setInterval(function() {checkConnection(btn, menupopup);}, 6000);
	
		checkConnection(btn, menupopup);	//Erste Ausführung beim Start von Firefox
		
		//Bei erster Ausführung testen, ob Internetverbindung:
		/*if(ss.storage.activation == true)
		{
			if(window.navigator.onLine)
			{
				if(AdBlockerActivated())
				{
					activation(btn);
				}
				
				else
				{
					standby(btn);
				}
				
				menuitem9.setAttribute('image', self.data.url("./ok-icon.png"));
			}
			
			else
			{
				menuitem9.setAttribute('image', self.data.url("./error-icon.png"));
			}
		}
		
		else
		{
			deactivation(btn);
		}
		
	
		window.addEventListener("offline", function(e) 
		{
			if(ss.storage.activation == true)
			{
				standby(btn);
			}
			
			else
			{
				deactivation(btn);
			}
			
			menuitem9.setAttribute('image', self.data.url("./error-icon.png"));
		});
		
		window.addEventListener("online", function(e) 
		{ 
			if(ss.storage.activation == true)
			{
				if(AdBlockerActivated())
				{
					activation(btn);
				}
				
				else
				{
					standby(btn);
				}
			}
			
			else
			{
				deactivation(btn);
			}
			
			menuitem9.setAttribute('image', self.data.url("./ok-icon.png"));
		});*/
    }
};

winUtils.WindowTracker(delegate);

/*var panel = panels.Panel({
  contentURL: self.data.url("panel.html"),
  onHide: handleHide
});*/


function deactivation(btn)
{
	//button.state(button, deactivatedState);
	btn.setAttribute("tooltiptext", _("deactivated"));
    btn.setAttribute('image', self.data.url("./icon_deactivated.ico"));
	ss.storage.activation = false;
	prefsvc.set("network.proxy.type", 5);	//Proxy des Systems verwenden
}

function activation(btn)
{
	//button.state(button, activatedState);
	btn.setAttribute("tooltiptext", _("activated"));
    btn.setAttribute('image', self.data.url("./icon_activated.ico"));
	ss.storage.activation = true;
	prefsvc.set("network.proxy.http", "box");
	prefsvc.set("network.proxy.http_port", 8888);
	prefsvc.set("network.proxy.ssl", "box");
	prefsvc.set("network.proxy.ssl_port", 8888);
	prefsvc.set("network.proxy.socks_version", 5);
	prefsvc.set("network.proxy.no_proxies_on", "localhost, 127.0.0.1");
	prefsvc.set("network.proxy.type", 1);	//Manuelle Proxy-Einstellungen
}

function standby(btn)
{
	//button.state(button, activatedState);
	btn.setAttribute("tooltiptext", _("standby"));
    btn.setAttribute('image', self.data.url("./icon_problem.ico"));
	ss.storage.activation = true;
	prefsvc.set("network.proxy.type", 5);	//Proxy des Systems verwenden
}

function handleClick(btn)	//state
{	
  	if(ss.storage.activation == true)
  	{
	  	deactivation(btn);
  	}
  
  	else
  	{
	  	btn.setAttribute("tooltiptext", _("activated"));
 		btn.setAttribute('image', self.data.url("./icon_problem.ico"));
	  
	  	if(doesConnectionExist(adress) == 1)
	  	{
	  		activation(btn);
	  	}
  	}
}

function set_Node_state(node, state)
{
	if(state == 2)
	{
		node.setAttribute('image', self.data.url("./warning-icon.png"));
	}
	
	else if(state == 1)
	{
		node.setAttribute('image', self.data.url("./ok-icon.png"));
	}
	
	else
	{
		node.setAttribute('image', self.data.url("./error-icon.png"));
	}
}

function set_Node_access(node, state)
{
	if(state == 1)
	{
		node.setAttribute('disabled', false);
	}
	
	else
	{
		node.setAttribute('disabled', true);
	}
}

function replaceEventListener(node, handler, handler_old)
{
	node.removeEventListener('command', handler_old, false);
	node.addEventListener('command', handler, false);
}

function addTabsEvent(adress)
{
	tabs.open(adress, "tab");
}

function showNotification(notificationTitle, notificationText)
{
	notifications.notify({
  		title: notificationTitle,
  		text: notificationText,
		iconURL: "./icon_activated-64.png",
  		onClick: function (data) {
    		tabs.open("http://box", "tab");
  		}
	});
}

function doesConnectionExist(address) {
	var xhr = new xhrObject.XMLHttpRequest();
    var randomNum = Math.round(Math.random() * 10000);	//Damit nicht aus Cach geladen wird
    var timeout = 5000; 
	 
    xhr.open('HEAD', address + "?rand=" + randomNum, false);
	
	tmr.setTimeout(function () {xhr.abort()}, timeout);
     
    try {
        xhr.send(null);
         
        if (xhr.status >= 200 && xhr.status < 304) {
            return 1;
        } else {
            return 0;
        }
    } catch (e) {
        return 0;
    }
}

function checkConnection(btn, menupopup)
{
	var randomNum = Math.round(Math.random() * 10000);	//Damit nicht aus Cach geladen wird
	var timeout = 1000; 
	var children = menupopup.childNodes;
	
	if(ss.storage.activation == true)
	{
		var xhr = new xhrObject.XMLHttpRequest();
		xhr.open('GET', 'http://box/api/v1/get_firefoxAddon_info?rand=' + randomNum, false);
		
		tmr.setTimeout(function () {xhr.abort()}, timeout);
		
		try {
			xhr.send();
			var str = xhr.responseText;
			var boxStatus = str.split("\n");
			ip_from_Router = boxStatus[0];
			regular_Internet = boxStatus[3];
			network_service = boxStatus[2];
			cjdns_network = boxStatus[1];
			expiration_date = boxStatus[4];
			webfilter_status = boxStatus[5];
			current_country = boxStatus[6];
			teletext_status = boxStatus[7];
			personal_website_status = boxStatus[8];
			dokuwiki_status = boxStatus[9];
			owncloud_status = boxStatus[10];
			pastebin_status = boxStatus[11];
			ipv6_adress_old = ipv6_adress;
			ipv6_adress = boxStatus[12]
		} 
		
		catch (e) 
		{
			standby(btn);
			set_Node_state(children[11], 0);
			set_Node_state(children[12], 0);
			set_Node_state(children[16], 0);
			set_Node_state(children[17], 0);
			set_Node_state(children[18], 0);
			set_Node_state(children[19], 0);
        	return false;
    	}
		
		if(webfilter_status == 1)
		{
			activation(btn);
			set_Node_state(children[11], 1);	//Statusanzeige Verbindung zur Enigmabox => on
		}
		
		else
		{
			standby(btn);
			set_Node_state(children[11], 0);	//Statusanzeige Verbindung zur Enigmabox => off
		}
	}
	
	else
	{
		deactivation(btn);
	}
	
	set_Node_state(children[12], doesConnectionExist(adress));
	set_Node_state(children[16], ip_from_Router);
	set_Node_state(children[17], regular_Internet);
	set_Node_state(children[18], network_service);
	set_Node_state(children[19], cjdns_network);
	
	children[20].setAttribute('label', _("country") + ": " + language[current_country]);
	
	var date = new Date();
	var expiration_date_object = new Date(expiration_date);
	var expiration_date_unix = expiration_date_object.getTime();
	var expiration_date_string = "";
	
	if(prefsvc.get("general.useragent.locale") == "en")
	{
		expiration_date_string = expiration_date_object.getFullYear() + "." + (expiration_date_object.getMonth() + 1) + "." + expiration_date_object.getDate();
	}
	
	else
	{
		expiration_date_string = expiration_date_object.getDate() + "." + (expiration_date_object.getMonth() + 1) + "." + expiration_date_object.getFullYear();
	}
	
	if((date - expiration_date_unix)/(1000*60*60*24*30) > 3)
	{
		set_Node_state(children[21], 1);
		
		if(children[21].getAttribute('disabled') == false)
		{
			children[21].removeEventListener('command', handler, false);
			children[21].setAttribute('disabled', true);
		}
	}
	
	else if((expiration_date_unix - date)/(1000*60*60*24*30) < 3 && (expiration_date_unix - date)/(1000*60*60*24*30) >= 0)
	{
		set_Node_state(children[21], 2);	//Warnmodus
		
		if(children[21].getAttribute('disabled'))
		{
			children[21].addEventListener('command', handler, false);
			children[21].setAttribute('disabled', false);
		}
	}
	
	else
	{
		set_Node_state(children[21], 0);
		
		if(children[21].getAttribute('disabled'))
		{
			children[21].addEventListener('command', handler, false);
			children[21].setAttribute('disabled', false);
		}
	}
	
	children[21].setAttribute('label', _("sub") + ": " + _("valid") + " " + expiration_date_string);
	set_Node_access(children[2], teletext_status);
	set_Node_access(children[3], personal_website_status);
	set_Node_access(children[4], owncloud_status);
	set_Node_access(children[5], dokuwiki_status);
	set_Node_access(children[6], pastebin_status);
	
	if(ipv6_adress != ipv6_adress_old)
	{
		handler1 = function(event){
			tabs.open("http://[" + ipv6_adress + "]", "tab");
		};
		handler2 = function(event){
			tabs.open("http://[" + ipv6_adress + "]/owncloud", "tab");
		};
		handler3 = function(event){
			tabs.open("http://[" + ipv6_adress + "]/wiki", "tab");
		};
		handler4 = function(event){
			tabs.open("http://[" + ipv6_adress + "]/pastebin", "tab");
		};
		
		replaceEventListener(children[3], handler1, handler1_old);
		replaceEventListener(children[4], handler2, handler2_old);
		replaceEventListener(children[5], handler3, handler3_old);
		replaceEventListener(children[6], handler4, handler4_old);
		handler1_old = handler1;
		handler2_old = handler2;
		handler3_old = handler3;
		handler4_old = handler4;
	}
}

function checkMail()
{
	var count = 0;
	
	if(count != 0)
	{
		return "  (" + count + " " + _("unread") + ")";
	}
	
	else
	{
		return "";
	}
}
