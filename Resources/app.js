(function() {
	Titanium.UI.orientation = Titanium.UI.PORTRAIT;
	//determine platform and form factor and render approproate components
	var osname = Ti.Platform.osname, version = Ti.Platform.version, height = Ti.Platform.displayCaps.platformHeight, width = Ti.Platform.displayCaps.platformWidth;
	Ti.API.info(osname);
	//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
	//yourself what you consider a tablet form factor for android
	var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
	if(osname == 'ipad') {
		var Window = require('views/Edicoes_ipad');
	} else {
		var Window = require('views/Edicoes_iphone');
	}
	
	new Window().open();
})();