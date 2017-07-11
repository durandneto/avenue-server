var express = require('express');
var wagner = require('wagner-core');
var busboyBodyParser = require('busboy-body-parser');
var bodyparser = require('body-parser');
var cache = require('cache-control');

var cors = require('cors');

require('./models')(wagner);
require('./dependencies')(wagner);


module.exports = () => {
	var app = express();

	app.use(require('morgan')("combined"));

	app.use(bodyparser.urlencoded({ extended: false }))
	app.use(bodyparser.json());
	app.use(busboyBodyParser());   
 /**
  * @description: habilitando o CORS para a api funcionar em servidores diferentes
  * @developer : Durand Neto
  */ 

	var whitelist = [
	    'http://localhost:3000'
	];
	var corsOptions = {
	    origin: function(origin, callback){
	        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
	        callback(null, originIsWhitelisted);
	    },
	    credentials: true
	};
	app.use(cors(corsOptions));
	app.options('*', cors(corsOptions)); // include before other routes

	app.use('/api/v1/user', require('./routes/user')(wagner));
	app.use('/api/v1/product', require('./routes/product')(wagner));

	app.use(cache({
	  '/**': 1000
	}));

	// Serve up static HTML pages from the file system.
	app.use(express.static('../', { maxAge: 4 * 60 * 60 * 1000 /* 2hrs */ }));
	app.use('/files', express.static('files'));

	return app;
}

