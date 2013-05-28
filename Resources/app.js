/*
* Single Window Application Template:
* A basic starting point for your application.  Mostly a blank canvas.
*
* In app.js, we generally take care of a few things:
* - Bootstrap da aplicação com todos os dados que precisamos
* - Verifique se há dependências, como tipo de dispositivo, versão de plataforma ou de conexão de rede
* - Require e open de componentes UI de nível superior
*
*/

//bootstrap and check dependencies
if (Ti.version < 1.8) {
    alert('Desculpe - este modelo de aplicativo requer Titanium Mobile SDK 1.8 ou posterior');
}

// Links do Portal de Criação
// Ti.App.pathUpdate = "https://dl.dropbox.com/u/19460864/app-revista/revista.json";
Ti.App.pathUpdate = "http://10.0.1.135:83/media/revista/revista-megamidia/revista.json";
// Ti.App.source = '';
Ti.App.source = 'http://10.0.1.135:83/media/';

// This is a single context application with multiple windows in a stack
(function() {
    //render appropriate components based on the platform and form factor
    var osname = Ti.Platform.osname, version = Ti.Platform.version,
    height = Ti.Platform.displayCaps.platformHeight,
    width = Ti.Platform.displayCaps.platformWidth,
    username = Ti.Platform.username;

    //Aplicativo reconhece em qual dispositivo foi instalado.
    var isTablet = osname;

    var Window;
    if (isTablet === 'ipad') {
        // iPAD
        Window = require('ui/tablet/ApplicationWindow');
    } else {
        // iPhone/iPOD
        Window = require('ui/handheld/ApplicationWindow');
    }
    new Window().open();
})();
