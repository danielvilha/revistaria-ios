function ViewPage(data, path) {
    var self = Ti.UI.createView({
        width : '100%',
        height : '100%',
        // visible : false
    });
    
    self.bounds = self.rect;
    self.canScroll = true;
    self.path = path;

    // self.postlayout = true;

    self.inicio = function() {
        
        var baseWidth = Ti.App.image.width;
        var baseHeight = Ti.App.image.height;

        var imgApp = data.imagem_app;
        imgApp = imgApp.split('/');
        imgApp.reverse();

        var img = Ti.UI.createImageView({
            // touchEnabled : false,
            image : path + "/" + imgApp[0],
            layout : 'center',
            width : 'auto',
            height : 'auto',
            // top : 0
        });
        
        // page.add(img);

        //TODO: Adicionando os componentes das páginas

        self.add(img);
        //----------------------------------------------------------------------------------------------------------------------------------------//
        //                                                                                                                                        //
        //*************************************************************EVENTO BOTÕES**************************************************************//
        //                                                                                                                                        //
        //----------------------------------------------------------------------------------------------------------------------------------------//
        //FUNÇÃO BOTÕES. TODO: Criar os eventos de link, Galeria, Musica e Vídeo.
        
        
        //Recuperrar estes eventos no backup que eu fiz no Old_Resources

        self.visible = true;
    };

    self.inicio();

    return self;
}

//make constructor function the public component interface
module.exports = ViewPage;
