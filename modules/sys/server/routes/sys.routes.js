'use strict';

// var mongoose = require ('mongoose');
// var ProjectType = mongoose.model ('ProjectType');

// function respond( res, keeparray ) {
//     return function ( err, data ) {
//         if (err) {
//             console.error(err);
//             res.status(400).send('Server error.');
//         } else {
//             if(process.env.DEBUG && process.env.NOISY) console.log('success',data);
//             // if(_.isArray(data) && data.length === 1) {
//             //     if (!keeparray) data = data.shift();
//             // }
//             res.status(200).send(data);
//         }
//     }
// }


module.exports = function (app) {


	app.get ('/api/testp1/:param1', function (req, res) {
		console.log ('req._param1 = ',req._param1);
	});
	app.get ('/api/testp2/:param2', function (req, res) {
		console.log ('req._param2 = ',req._param2);
	});
	app.get ('/api/testp3/:param3', function (req, res) {
		console.log ('req._param3 = ',req._param3);
	});
	app.get ('/api/testp123/:param1/:param2/:param3', function (req, res) {
		console.log ('req._param1 = ',req._param1);
		console.log ('req._param2 = ',req._param2);
		console.log ('req._param3 = ',req._param3);
	});
	app.get ('/api/testp321/:param3/:param2/:param1', function (req, res) {
		console.log ('req._param1 = ',req._param1);
		console.log ('req._param2 = ',req._param2);
		console.log ('req._param3 = ',req._param3);
	});


	app.param ('param1', function (req, res, next, id) {
		console.log ('parameter 1 run with ',id);
		req._param1 = id;
		next ();
	});
	app.param ('param2', function (req, res, next, id) {
		console.log ('parameter 2 run with ',id);
		req._param2 = id;
		next ();
	});
	app.param ('param3', function (req, res, next, id) {
		console.log ('parameter 3 run with ',id);
		if (req._param1) {
			req._param3 = id + ' is a '+req._param1;
		} else {
			req._param3 = 'ALL '+id ;

		}
		next ();
	});
};

