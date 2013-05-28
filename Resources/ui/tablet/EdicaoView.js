//Component Constructor for iPad
function EdicaoView(data) {
    var source = Ti.App.source;
    var Compression = require('ti.compression');
    var edicaoDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, data.id);
    //cria diretorio da revista se ainda nao existir, o nome é editionId
    if (!edicaoDir.exists()) {
        edicaoDir.createDirectory();
    }
    edicaoDir = null;

    //View onde é adicionada cada edição.
    var self = Ti.UI.createView({
        width : 'auto',
        height : '40%',
        backgroundImage : 'images/viewBG.png',
        top : 10,
        left : 10,
        right : 10
    });

    //---------------------------------------------------View da imagem da capa.
    var thumbView = Ti.UI.createView({
        // borderColor : 'red',
        // borderRadius : 2,
        // borderWidth : 2,
        left : 5,
        top : 5,
        bottom : 5,
        width : '22%'
    });

    var thumb = Ti.UI.createImageView({
        height : 'auto',
        width : 'auto'
    });

    thumbView.add(thumb);

    //---------------------------------------------------View das informações das edições.
    var textView = Ti.UI.createView({
        // borderColor : 'black',
        // borderRadius : 2,
        // borderWidth : 2,
        top : 5,
        left : '25%',
        right : 5,
        bottom : 50
    });

    //Label com o numero da edição
    var edition = Ti.UI.createLabel({
        color : '#323030',
        font : {
            fontSize : '26%',
            fontWeight : 'bold'
        },
        text : data.nome,
        top : 5
    });

    textView.add(edition);

    //Label com o títlulo da edição
    var title = Ti.UI.createLabel({
        color : '#323030',
        font : {
            fontSize : '20%',
            fontWeight : 'bold'
        },
        text : data.titulo_capa,
        top : 50,
        layout : 'center'

    });

    textView.add(title);

    //Label com a descrição da capa.
    var description = Ti.UI.createLabel({
        color : '#323030',
        font : {
            fontSize : '16%',
            fontWeight : 'normal'
        },
        text : data.descricao_capa,
        top : 95,
        width : 'auto'
    });

    textView.add(description);

    //---------------------------------------------------View dos botões.
    var buttonView = Ti.UI.createView({
        // borderColor : 'yellow',
        // borderRadius : 2,
        // borderWidth : 2,
        height : 50,
        left : '25%',
        right : 5,
        bottom : 5
    });

    var pb = Ti.UI.createProgressBar({
        width : '50%',
        height : 'auto',
        right : 10,
        min : 0,
        max : 100,
        value : 0,
        color : '#fff',
        message : 'Downloading',
        font : {
            fontSize : '5%',
            fontWeight : 'bold'
        },
        visible : false
    });

    buttonView.add(pb);

    var downloadBt = Ti.UI.createButton({
        backgroundImage : 'images/baixar.png',
        right : 10,
        height : '63.4%',
        width : '20%',
        visible : (data.downloaded == 1 ? false : true)
    });

    downloadBt.addEventListener('click', function(e) {
        if (Ti.Network.online) {
            downloadBt.visible = false;
            pb.visible = true;
            loadFile();
        } else {
            alert("Verifique sua conexão com a internet e tente fazer o download novamente.");
        }
    });

    buttonView.add(downloadBt);

    var deldBt = Ti.UI.createButton({
        backgroundImage : 'images/deletar.png',
        right : 10,
        height : '63.4%',
        width : '20%',
        visible : (data.downloaded == 0 ? false : true)
    });

    deldBt.addEventListener('click', function(e) {
        deldBt.visible = true;
        deleteFile();
    });

    buttonView.add(deldBt);

    var abrirBt = Ti.UI.createButton({
        backgroundImage : 'images/abrir.png',
        right : 125,
        height : '63.4%',
        width : '20%',
        visible : (data.downloaded == 0 ? false : true)
    });

    abrirBt.addEventListener('click', function(e) {
        var Window = require('ui/common/Revista');
        var w = new Window(data);

        var listener = function() {
            w.removeEventListener('close', listener);
            w.fechar();
            w = Ti.UI.createWindow();
            w = null;
            listener = null;
            Window = null;
            delete Window;
        }

        w.open();

        w.addEventListener('close', listener);
    });

    buttonView.add(abrirBt);

    self.add(thumbView);
    self.add(textView);
    self.add(buttonView);

    getThumb();
    /*
     * funcao q exibe a miniatura, verifica se o arquivo esta local, se nao estiver faz o download e atualiza o banco
     */
    function getThumb() {
        var remote = data.thumbnail;
        remote = remote.split("/");
        remote.reverse();
        var local = data.id + '/' + remote[0];
        var thumbName = remote[0];

        var imageFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + local);

        if (local != null) {
            var localA = local.split("/");
            localA.reverse();
            /*
             * verifica se o arquivo local tem o mesmo nome do remoto
             */
            if (localA[0] == remote[0]) {
                if (imageFile.exists()) {
                    // thumb.image = local;
                    thumb.image = imageFile;
                } else {
                    loadThumb(thumbName);
                }
            } else {
                loadThumb(thumbName);
            }
        } else {
            loadThumb(thumbName);
        }
    }

    function loadThumb(fileName) {
        if (!Ti.Network.online)
            return;
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function() {
            var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, data.id + Ti.Filesystem.separator + fileName);
            var dir = Ti.Filesystem.applicationDataDirectory + data.id + Ti.Filesystem.separator + fileName;
            f.write(this.responseData);

            if (f.exists()) {
                thumb.image = f;
            }

            var db = Ti.Database.open('revistaDB');

            // db.execute("UPDATE revista SET localThumb='" + f.resolve() + "' WHERE id='" + data.id + "'");
            db.execute("UPDATE revista SET localThumb='" + dir + "' WHERE id='" + data.id + "'");

            db.close();

            f = null;
        };

        xhr.open('GET', source + data.thumbnail);
        xhr.send();
    }

    function loadFile() {
        var xhr = Titanium.Network.createHTTPClient();

        xhr.onload = function() {
            var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, data.id + Ti.Filesystem.separator + "files");

            if (! dir.exists()) {
                dir.createDirectory();
            }

            var f = Ti.Filesystem.getFile(dir.resolve(), "file.zip");
            f.write(this.responseData);

            var outputDirectory = Ti.Filesystem.applicationDataDirectory + data.id + Ti.Filesystem.separator + 'files/';

            var zipFileName = outputDirectory + 'file.zip';
            var result = Compression.unzip(outputDirectory, zipFileName, true);

            f.deleteFile();

            var send = sendInfo();
            Ti.API.info(send);
            abrirBt.visible = true;
            deldBt.visible = true;
            pb.visible = false;

            var db = Ti.Database.open('revistaDB');
            db.execute("UPDATE revista SET downloaded='1' WHERE id='" + data.id + "'");
            db.close();

            dir = null;
            f = null;
        };

        xhr.ondatastream = function(e) {
            pb.value = e.progress * 100;
        }
        //TODO: Criar uma função que quando a conexão cai, apresentar na tela uma mensagem de erro.
        xhr.onerror = function(e) {
            Ti.API.debug(e.error);
            alert('Erro ao carregar arquivo, verifique a conexão e tente novamente.');
        }

        xhr.open('GET', source + data.zip);
        xhr.send();
    }

    function deleteFile() {
        var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, data.id + Ti.Filesystem.separator + "files");

        if (dir.exists()) {
            dir.deleteDirectory(true);
        }

        deldBt.visible = false;
        abrirBt.visible = false;
        downloadBt.visible = true;

        var db = Ti.Database.open('revistaDB');
        db.execute("UPDATE revista SET downloaded='0' WHERE id='" + data.id + "'");
        db.close();
        dir = null;
    }

    function sendInfo() {
        /*
         > id_revista
         > id_edicao
         > data_download
         > hora_download
         > os_name
         > os_version
         */
        var revistaData;
        var pathUpdate = Ti.App.pathUpdate;
        if (Ti.Network.online) {
            var update = Ti.Network.createHTTPClient({
                // function called when the response data is available
                onload : function(e) {
                    // Gerando relatório
                    function Relatorio(id_revista, id_edicao, data_download, hora_download, os_name, os_version) {
                        this.id_revista = id_revista;
                        this.id_edicao = id_edicao;
                        this.data_download = data_download;
                        this.hora_download = hora_download;
                        this.os_name = os_name;
                        this.os_version = os_version;
                    }

                    function getDay() {
                        var currentTime = new Date();
                        var month = currentTime.getMonth() + 1;
                        var day = currentTime.getDate();
                        var year = currentTime.getFullYear();

                        return day + "/" + month + "/" + year;
                    }

                    function getHour() {
                        var currentTime = new Date();
                        var hours = currentTime.getHours();
                        var minutes = currentTime.getMinutes();
                        var seconds = currentTime.getSeconds();

                        if (hours < 10) {
                            hours = "0" + hours
                        };
                        if (minutes < 10) {
                            minutes = "0" + minutes
                        };
                        if (seconds < 10) {
                            seconds = "0" + seconds
                        };

                        return hours + ":" + minutes + ":" + seconds;
                    }

                    revistaData = JSON.parse(this.responseText);

                    // Variáveis contendo as informações para montar o JSON
                    var osname = Ti.Platform.osname, version = Ti.Platform.version, username = Ti.Platform.username, hour = getHour(), day = getDay();

                    var relatorio = new Array();
                    var dataRelatorio;

                    relatorio.push(new Relatorio(revistaData.id, data.id, day, hour, osname, version));
                    dataRelatorio = '{"relatorio":' + JSON.stringify(relatorio) + "}";

                    // Ti.API.info(dataRelatorio);
                    // Ti.API.info(JSON.stringify(relatorio));
                },
                // function called when an error occurs, including a timeout
                onerror : function(e) {
                    Ti.API.debug(e.error);
                },
                timeout : 10000 // in milliseconds
            });
            // Prepare the connection.
            update.open("GET", pathUpdate + "?r=" + Math.random());
            // Send the request.
            update.send();
        }
    }

    return self;
}

//make constructor function the public component interface
module.exports = EdicaoView;
