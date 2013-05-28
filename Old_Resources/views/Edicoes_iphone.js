function Edicoes() {
	var Revista = require('views/Revista');
	var Edicao = require('views/Edicao_iphone');
	// var pathUpdate = "https://dl.dropbox.com/u/19460864/app-revista/revista.json";
	var pathUpdate = "http://10.0.1.69:8000/media/revista/revista-teste-megamida/revista.json";
	var revistaData;

	var db = Ti.Database.open('revistaDB');
	db.execute('CREATE TABLE IF NOT EXISTS revista (nome TEXT, descricao_capa TEXT, id INT, thumbnail TEXT, zip TEXT, titulo_capa TEXT, publicada BOOLEAN, downloaded BOOLEAN)');
	db.close();

	//Create da Window, todo conteúdo será adicionado nela
	var self = Ti.UI.createWindow({
		exitOnClose : true,
		backgroundColor : '#323030',
		width : 'auto',
		fullscreen : true,
		navBarHidden : true
	});

	//ImageView para a Logo da Revista.
	var imageView = Ti.UI.createImageView({
		image : 'views/logo-revistaria.png',
		top : 0,
		width : '100%',
		height : '25%',
		backgroundColor : '#323030'
	});

	self.add(imageView);

	cleanDataBase();
	clearPublicada();
	updateData();
	offLine();

	self.orientationModes = [Titanium.UI.PORTRAIT];

	var btReload = Ti.UI.createButton({
		backgroundImage : 'views/butReload.png',
		backgroundSelectedImage : 'views/butReloadClick.png',
		top : 10,
		left : 10,
		width : 40,
		height : 40,
		zIndex : 9
	});

	self.add(btReload);

	btReload.addEventListener('click', function() {
		if (Ti.Network.online) {
			cleanDataBase();
			clearPublicada();
			updateData();
		} else {
			alert('Sem conexão com a Internet');
			offLine();
		}
	});

	//FUNCÕES-------------------------------------------------------------------------------------------------------
	function offLine() {
		if (!Ti.Network.online)
			addEdicoes();
	}

	//--------------------------------------------------------------------------------------------------------------

	function addEdicoes() {
		var db = Ti.Database.open('revistaDB');
		var rows = db.execute("SELECT * FROM revista ORDER BY id DESC");

		var scrollView = Ti.UI.createScrollView({
			showVerticalScrollIndicator : true,
			backgroundColor : '#F1F1F1',
			scrollType : 'vertical',
			layout : 'vertical',
			borderRadius : 10,
			width : 'auto',
			height : 'auto',
			top : '25.5%',
			left : 10,
			right : 10,
			bottom : 10,
			cond : false
		});

		if (scrollView.cond == true) {
			self.remove(scrollView);
		}
		self.add(scrollView);
		scrollView.cond = true;

		if (rows.rowCount == 0) {
			alert("Sem conteúdo");
		} else {
			while (rows.isValidRow()) {
				var edicaoData = {};
				edicaoData.nome = rows.fieldByName('nome');
				edicaoData.descricao_capa = rows.fieldByName('descricao_capa');
				edicaoData.id = rows.fieldByName('id');
				edicaoData.thumbnail = rows.fieldByName('thumbnail');
				edicaoData.zip = rows.fieldByName('zip');
				edicaoData.titulo_capa = rows.fieldByName('titulo_capa');
				edicaoData.publicada = rows.fieldByName('publicada');
				edicaoData.downloaded = rows.fieldByName('downloaded');

				var edicao = new Edicao(edicaoData);
				scrollView.add(edicao);

				rows.next();
			}
		}
		rows.close();
		db.close();
	}

	//--------------------------------------------------------------------------------------------------------------

	function updateData() {
		if (Ti.Network.online) {
			var update = Ti.Network.createHTTPClient({
				// function called when the response data is available
				onload : function(e) {
					revistaData = JSON.parse(this.responseText);
					if (revistaData.edicoes.length > 0) {
						for (nome in revistaData.edicoes) {
							if (revistaData.edicoes[nome].publicada == true) {
								updateDataBase(revistaData.edicoes[nome]);
							}
						}
					}

					addEdicoes();
				},
				// function called when an error occurs, including a timeout
				onerror : function(e) {
					Ti.API.debug(e.error);
					alert('Sem conexão com a Internet');
					offLine();
				},
				timeout : 10000 // in milliseconds
			});
			// Prepare the connection.
			update.open("GET", pathUpdate + "?r=" + Math.random());
			// Send the request.
			update.send();
		}
	}

	//--------------------------------------------------------------------------------------------------------------

	function updateDataBase(data) {
		var db = Ti.Database.open('revistaDB');
		var rows = db.execute("SELECT * FROM revista WHERE id='" + data.id + "'");
		if (rows.rowCount == 0) {
			db.execute('INSERT INTO revista (nome, descricao_capa, id, thumbnail, zip, titulo_capa, publicada, downloaded) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', data.nome, data.descricao_capa, data.id, data.thumbnail, data.zip, data.titulo_capa, data.publicada, 0);
		} else {
			db.execute("UPDATE revista SET nome='" + data.nome + "', descricao_capa='" + data.descricao_capa + "', thumbnail='" + data.thumbnail + "', zip='" + data.zip + "', titulo_capa='" + data.titulo_capa + "', publicada='" + data.publicada + "' WHERE id='" + data.id + "'");
		}

		rows.close();
		db.close();
	}

	//--------------------------------------------------------------------------------------------------------------

	function clearPublicada() {
		if (Ti.Network.online) {
			var update = Ti.Network.createHTTPClient({
				// function called when the response data is available
				onload : function(e) {
					var listPUB = [];
					var db = Ti.Database.open('revistaDB');
					var rows = db.execute('SELECT id FROM revista');
					revistaData = JSON.parse(this.responseText);
					if (revistaData.edicoes.length > 0) {
						for (nome in revistaData.edicoes) {
							var e = revistaData.edicoes[nome];
							listPUB.push(e.publicada);
						}
					}

					var cont = 0;
					while (rows.isValidRow()) {
						if (listPUB[cont] == false) {
							var ID = rows.fieldByName('id');
							db.execute('DELETE FROM revista WHERE id=' + ID);
							var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, ID);

							if (dir.exists()) {
								dir.deleteDirectory(true);
							}

							dir = null;
						}

						cont++;
						rows.next();
					}

					rows.close();
					db.close();
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

	//--------------------------------------------------------------------------------------------------------------

	function cleanDataBase() {
		var update = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload : function(e) {
				var listID = [];
				var db = Ti.Database.open('revistaDB');
				var rows = db.execute('SELECT id FROM revista');
				revistaData = JSON.parse(this.responseText);
				for (nome in revistaData.edicoes) {
					listID.push(revistaData.edicoes[nome].id);
				}

				while (rows.isValidRow()) {
					var ID = rows.fieldByName('id');
					var search = false;
					for (var i in listID) {
						if (listID[i] == ID) {
							search = true;
						}
					}

					if (search == false) {
						db.execute('DELETE FROM revista WHERE id=' + ID);
						var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, ID);

						if (dir.exists()) {
							dir.deleteDirectory(true);
						}

						dir = null;
					} else {
						search = false;
					}

					rows.next();
				}

				rows.close();
				db.close();
			},
			// function called when an error occurs, including a timeout
			onerror : function(e) {
				Ti.API.debug(e.error);
			},
			timeout : 10000 // in milliseconds
		});
		update.open("GET", pathUpdate + "?r=" + Math.random());
		// Send the request.
		update.send();
	}

	//--------------------------------------------------------------------------------------------------------------
	return self;
}

//make constructor function the public component interface
module.exports = Edicoes;
