function Revista(_data) {
    //Require das funções do indice, página e variável global.
    var Page = require('ui/common/ViewPage');
    var Nav = require('ui/common/Nav');
    //FIM BLOCO-------------------------------------------------------------------------------------------------------------------------------

    //Create da Window self.
    var self = Ti.UI.createWindow({
        backgroundColor : '#000',
        width : 'auto',
        fullscreen : true,
        navBarHidden : true
    });

    self.postlayout = false;
    self.orientationModes = [Titanium.UI.PORTRAIT];

    //Toolbar.---------------------------------------------------
    var flexSpace = Ti.UI.createButton({
        systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });

    var backButton = Ti.UI.createButton({
        title : "Edições",
        style : Ti.UI.iPhone.SystemButtonStyle.DONE,
        zIndex : 9
    });

    backButton.addEventListener("click", function() {
        self.close();
    });

    var titleLabel = Ti.UI.createLabel({
        text : _data.nome,
        font : {
            fontSize : 20,
            fontWeight : 'bold'
        },
        color : '#ffffff',
        textAlign : 'center'
    });

    var topToolbar = Titanium.UI.iOS.createToolbar({
        top : -50,
        borderTop : false,
        borderBottom : true,
        translucent : false,
        backgroundColor : 'black',
        barColor : '#000',
        zIndex : 10
    });

    topToolbar.items = [backButton, flexSpace, titleLabel, flexSpace];

    self.add(topToolbar);
    //FIM BLOCO-------------------------------------------------------------------------------------------------------------------------------

    self.addEventListener('postlayout', function(e) {
        if (!self.postlayout) {
            self.postlayout = true;
            self.inicio();
        }
    });
    //FIM BLOCO-------------------------------------------------------------------------------------------------------------------------------
    self.inicio = function() {
        var currentPage;
        var data = [];
        var path = "";

        var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, _data.id + Ti.Filesystem.separator + "files");
        path = Ti.Filesystem.applicationDataDirectory + _data.id + "/files";
        //Arquivo onde contém as propriedades da Revista----------------------------
        var file = Titanium.Filesystem.getFile(path, "edicao.json");
        Ti.API.info('path: ' + path);

        if (file.exists()) {
            var json = file.read();
            var d = JSON.parse(json);
            json = null;

            var order = function(pag_a, pag_b) {
                return pag_a.numero_pag - pag_b.numero_pag;
            };

            data = d.paginas;

            data.sort(order);

            var imgApp = data[0].imagem_app;
            imgApp = imgApp.split("/");
            imgApp.reverse();

            var img = Ti.UI.createImageView({
                image : path + '/' + imgApp[0],
                width : 'auto',
                height : 'auto'
            });

            Ti.App.image = img.toImage();

        } else {
            Ti.API.info("Arquivo Faltando.");
        }
        dir = null;
        file = null;

        var pages = [];

        for (var i = 0, count = data.length; i < count; i++) {
            data[i].index = i;
            var page = new Page(data[i], self.rect, path);

            page.addEventListener('swipe', function(e) {
                var currentPage = scrollableView.currentPage;
                if (e.direction == 'right') {
                    if (currentPage != 0)
                        scrollableView.scrollToView(parseInt(scrollableView.currentPage) - 1);
                } else if (e.direction == 'left') {
                    if (currentPage != scrollableView.views.length - 1)
                        scrollableView.scrollToView(parseInt(scrollableView.currentPage) + 1);
                }
            });

            page.addEventListener('linkPage', function(e) {
                scrollableView.scrollToView(parseInt(e.value));
            });

            page.addEventListener('page:canScroll', function(e) {
                scrollableView.scrollingEnabled = e.scroll;
            });

            var visible = true;
            page.addEventListener('singletap', function(e) {
                if (visible === false) {
                    visible = true;
                    hideButtons();
                    Ti.App.hideThumbnail();
                } else {
                    visible = false;
                    showButtons();
                    Ti.App.showThumbnail();
                }
            });

            pages.push(page);
        }

        //----------------------------------------------------------------------------------------------------------------------------------------//
        //                                                                                                                                        //
        //**************************************************BLOCO DE CÓDIGOS DO SCROLL************************************************************//
        //                                                                                                                                        //
        //----------------------------------------------------------------------------------------------------------------------------------------//
        var scrollableView = Ti.UI.createScrollableView({
            width : "auto",
            height : "auto",
            scrollingEnabled : true
        });

        scrollableView.views = pages;

        Ti.API.info('self.rect.width: ' + self.rect.width + ' self.rect.height: ' + self.rect.height)

        var nav = new Nav(data, self.rect, path);

        scrollableView.addEventListener('scrollEnd', function(e) {
            scrollableView.scrollingEnabled = e.view.canScroll;
            var i = e.currentPage;
            currentPage = scrollableView.views[i];

            for (var v = 0; v < scrollableView.views.length; v++) {
                if (v != i) {
                    var p = scrollableView.views[v];
                    if (!p.canScroll)
                        p.fitPage();
                }
            }

            nav.goTo(i);
        });

        self.loop = -1;
        self.closed = false;
        self.initialized = false;

        scrollableView.addEventListener('postlayout', function(e) {
            if (self.initialized)
                return;
            pageUpdate();
            currentPage = scrollableView.views[0];

            self.initialized = true;
        });

        function pageUpdate() {
            if (!self.closed) {
                self.loop = setTimeout(pageUpdate, 50);
            } else {
                clearTimeout(self.loop);
            }

            if (currentPage == null)
                return;
            try {
                currentPage.update();
            } catch(err) {
            }
        }

        function lag(e) {
            scrollableView.scrollingEnabled = e;
        }


        nav.addEventListener('nav:thumbClick', function(e) {
            scrollableView.scrollToView(e.index);
        });

        // var scrollView = Titanium.UI.createScrollView({
        // width : "auto",
        // height : "auto",
        // contentHeight : "auto",
        // contentWidth : "auto"
        // });
        //
        // scrollView.add(scrollableView);

        self.fechar = function() {
            self.closed = true;
            for (var v = 0; v < pages.length; v++) {
                pages[v] = null;
            }

            self.remove(scrollableView);
            self.remove(nav);
            scrollableView = null;
            nav = null;
            pages = [];
            pages = null;
            currentPage = null;
            data = null;
        }
        // self.add(scrollView);
        self.add(scrollableView);

        self.add(nav);
        //FIM BLOCO-------------------------------------------------------------------------------------------------------------------------------

        //----------------------------------------------------------------------------------------------------------------------------------------//
        //                                                                                                                                        //
        //**************************************************BLOCO DE CÓDIGOS DOS BOTÕES***********************************************************//
        //                                                                                                                                        //
        //----------------------------------------------------------------------------------------------------------------------------------------//
        var nextFastButton = Ti.UI.createButton({
            backgroundImage : 'images/nextFastButton.png',
            backgroundSelectedImage : 'images/nextFastButtonClick.png',
            width : '8%',
            height : '10%',
            bottom : -1,
            right : -55, //Tamanho deve ser igual a Largura (width)
            zIndex : 9
        });

        nextFastButton.addEventListener('click', function() {
            Ti.App.nextFast();
        });

        self.add(nextFastButton);

        //Botão voltar ao inicio do THUMBNAIL
        var previousFastButton = Ti.UI.createButton({
            backgroundImage : 'images/previousFastButton.png',
            backgroundSelectedImage : 'images/previousFastButtonClick.png',
            width : '8%',
            height : '10%',
            bottom : -1,
            left : -55, //Tamanho deve ser igual a Largura (width)
            zIndex : 9
        });

        previousFastButton.addEventListener('click', function() {
            Ti.App.previousFast();
        });

        self.add(previousFastButton);

        //Botão voltar uma página
        var previousButton = Ti.UI.createButton({
            backgroundImage : 'images/previousButton.png',
            backgroundSelectedImage : 'images/previousButtonClick.png',
            width : '8%',
            height : '10%',
            bottom : '9%',
            left : -55, //Tamanho deve ser igual a Largura (width)
            zIndex : 9
        });

        previousButton.addEventListener('click', function(e) {
            var currentPage = scrollableView.currentPage;
            if (currentPage != 0)
                scrollableView.scrollToView(parseInt(scrollableView.currentPage) - 1);
        });

        self.add(previousButton);
        //-----------------------------------

        //Botão avança uma página
        var nextButton = Ti.UI.createButton({
            backgroundImage : 'images/nextButton.png',
            backgroundSelectedImage : 'images/nextButtonClick.png',
            width : '8%',
            height : '10%',
            bottom : '9%',
            right : -55, //Tamanho deve ser igual a Largura (width)
            zIndex : 9
        });

        nextButton.addEventListener('click', function(e) {
            var currentPage = scrollableView.currentPage;

            if (currentPage != scrollableView.views.length - 1)
                scrollableView.scrollToView(parseInt(scrollableView.currentPage) + 1);
        });

        self.add(nextButton);

        function hideButtons() {
            nextFastButton.animate({
                right : -55,
                duration : 500
            });
            previousFastButton.animate({
                left : -55,
                duration : 500
            });
            nextButton.animate({
                right : -55,
                duration : 500
            });
            previousButton.animate({
                left : -55,
                duration : 500
            });
            topToolbar.animate({
                top : -50,
                duration : 500
            });
        }

        function showButtons() {
            nextFastButton.animate({
                right : 0,
                duration : 500
            });
            previousFastButton.animate({
                left : 0,
                duration : 500
            });
            nextButton.animate({
                right : 0,
                duration : 500
            });
            previousButton.animate({
                left : 0,
                duration : 500
            });
            topToolbar.animate({
                top : 0,
                duration : 500
            });
        }

    };

    return self;
}

//make constructor function the public component interface
module.exports = Revista;
