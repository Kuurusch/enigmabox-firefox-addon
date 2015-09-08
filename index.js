var self = require("sdk/self");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
ss = require("sdk/simple-storage");
var prefsvc = require("sdk/preferences/service");
var tmr = require('sdk/timers');
var xhrObject = require('sdk/net/xhr');
var winUtils = require("sdk/deprecated/window-utils"); // for new style sdk
var _ = require("sdk/l10n").get;	//Für multilingual Funktionalität

if (typeof ss.storage.automaticUse == 'undefined')
{
	ss.storage.automaticUse = true;
}


if (typeof ss.storage.activation == 'undefined')
{
	ss.storage.activation = true;
}

adress = "http://82.221.104.119:8080";	//enigmabox.net //82.221.104.119

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
		
	var menuitem11 = document.createElement('menuitem');
    menuitem11.setAttribute('id', 'menuitem11');
    menuitem11.setAttribute('label', _("help"));
	menuitem11.setAttribute('image', self.data.url("./question.png"));
    menuitem11.setAttribute('class', 'menuitem-iconic');
	menuitem11.setAttribute('validate', 'always');
	//menuitem10.dir = "reverse";
    menuitem11.addEventListener('command', function(event) {
            tabs.open("https://wiki.enigmabox.net/howto/adblocker", "tab");
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

    menupopup.appendChild(menuitem1);
	menupopup.appendChild(menuitem10);
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
    btn.appendChild(menupopup);
    navBar.appendChild(btn);

    console.log("window tracked");
	intervalID = tmr.setInterval(function() {checkConnection(btn, menupopup);}, 6000);

	checkConnection(btn, menupopup);	//Erste Ausführung beim Start von Firefox
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
	  
	  	if(doesConnectionExist(adress))
	  	{
	  		activation(btn);
	  	}
  	}
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
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

function checkConnection(btn, menupopup)
{
	if(ss.storage.activation == true)
	{
		if(doesConnectionExist(adress))
		{
			//button.state(button, activatedState);
			btn.setAttribute("tooltiptext", _("activated"));
    		btn.setAttribute('image', self.data.url("./icon_activated.ico"));
			activation(btn);
		}
		
		else
		{
			//button.state(button, problemState);
			btn.setAttribute("tooltiptext", _("activated"));
    		btn.setAttribute('image', self.data.url("./icon_problem.ico"));
			deactivation(btn);
		}
	}
	
	else
	{
		deactivation(btn);
	}
	
	var children = menupopup.childNodes;
	
	if(doesConnectionExist(adress))
	{
		children[7].setAttribute('image', self.data.url("./ok-icon.png"));
	}
	
	else
	{
		children[7].setAttribute('image', self.data.url("./error-icon.png"));
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
