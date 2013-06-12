function getInfo() {
    /*
     > id_revista
     > id_edicao
     > data_download
     > hora_download
     > os_name
     > os_version
     */
    var relatorio = new Array();
    var urlPOST = Ti.App.pathURL;

    //----------------------------------------------------------------------------Gerando relatório
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

    // Variáveis contendo as informações para montar o JSON
    var osname = Ti.Platform.osname, version = Ti.Platform.version, username = Ti.Platform.username, hour = getHour(), day = getDay();

    relatorio.push(new Relatorio(Ti.App.revistaDataID, data.id, day, hour, osname, version));
    relatorio = '{"relatorio":' + JSON.stringify(relatorio) + "}";

    Ti.API.info(relatorio);

    var xhr = Ti.Network.createHTTPClient({
        // function called when the response data is available

        // onload : function(e) {
        // Ti.API.info('Onload');
        // },

        // function called when an error occurs, including a timeout
        onerror : function(e) {
            Ti.API.debug(e.error);
            Ti.API.info('XHR onerror: ' + e.error);
        },
        timeout : 10000 // in milliseconds
    });
    // Prepare the connection.
    xhr.open("POST", urlPOST);
    // Send the request.
    xhr.send(relatorio);
}