function Nav(data, rect, path) {
    //Cria o ScrollView onde o Thumbnail será construido.
    var self = Ti.UI.createScrollView({
        backgroundImage : 'images/texture_dark.png',
        scrollType : 'horizontal',
        bottom : -154,
        width : '100%',
        height : 154,
        disableBounce : true
    });

    Ti.App.hideThumbnail = function() {
        self.animate({
            bottom : -154,
            duration : 500
        });
    }

    Ti.App.showThumbnail = function() {
        self.animate({
            bottom : 0,
            duration : 500
        });
    }
    //FIM BLOCO-------------------------------------------------------------------------------------------------------------------------------

    //Insere o thumbnail no ScrollView
    var w = rect.width;
    var thumbWidth = 165;
    var left = (w - thumbWidth) / 2;
    var right = (w - thumbWidth) / 2;
    var centro = (w - thumbWidth) / 2;

    for (var i = 0, count = data.length; i < count; i++) {
        if (i % 2 == 0)
            left = left - 20;

        var imgThumb = data[i].thumbnail;
        imgThumb = imgThumb.split('/');
        imgThumb.reverse();
        
        var pg = Ti.UI.createView({
            index : i,
            // borderColor : 'red',
            // borderRadius : 2,
            // borderWidth : 2,
            left : left,
            right : right,
            // height : 'auto',
            width : 120,
        })
        
        // var pg = Ti.UI.createImageView({image : path + '/' + imgThumb[0], index : i, // top : 5,
        // bottom : 5, left : left, right : right, // height : 'auto', width : 120,});
        
        var img = Ti.UI.createImageView({
            image : path + '/' + imgThumb[0],
            index : i,
            // top : 5,
            // bottom : 5,
            // left : 'auto',
            // right : 'auto',
            // height : 'auto',
            // width : 120,
        });

        left += thumbWidth - 30;
        
        pg.add(img);

        //EventListener de click na página do Thumbnail: Clicke na página para mudar a página da revista.
        pg.addEventListener('singletap', function(e) {
            self.fireEvent('nav:thumbClick', {
                index : e.source.index
            });
        });

        // pg.addEventListener('load', function(e) {
        // });
        
        self.add(pg);
    }
    //FIM BLOCO-------------------------------------------------------------------------------------------------------------------------------

    //Função onde centraliza a imagem do Thumbnail com a imagem que está na tela da revista.
    self.goTo = function(index) {
        self.scrollTo((self.children[index].rect.x - centro + 20), 0);
    };
    //FIM BLOCO-------------------------------------------------------------------------------------------------------------------------------

    //Funções Avaçar até o fim do Thumbnail e Retornar para o Início.
    Ti.App.nextFast = function() {
        self.scrollToBottom();
    };

    Ti.App.previousFast = function() {
        self.scrollTo(0, 0);
    };
    //FIM BLOCO-------------------------------------------------------------------------------------------------------------------------------

    return self;
}

//make constructor function the public component interface
module.exports = Nav;
