'use strict';

var MongoClient = require('mongodb').MongoClient;
var Promise = require('Promise');
var _ = require('lodash');
var fs = require('fs');
var os = require('os');
var path = require('path');
var resetdefaults = require(path.resolve('reset-defaults-collection'));

var _URL = 'mongodb://localhost/esm';

var HEADER = [
	'','',
	'aboriginal-group',
	'assessment-admin',
	'assessment-lead',
	'assessment-team',
	'assistant-dm',
	'assistant-dmo',
	'associate-dm',
	'associate-dmo',
	'compliance-lead',
	'compliance-officer',
	'minister',
	'minister-office',
	'project-eao-staff',
	'project-epd',
	'project-intake',
	'project-participant',
	'project-qa-officer',
	'project-system-admin',
	'project-technical-working-group',
	'project-working-group',
	'proponent-lead',
	'proponent-team',
	'public',
	'sysadmin',
	'eao',
	'proponent'
];

var find = function(url, collectionName, query, fields) {
	return new Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {

			var collection = db.collection(collectionName);

			collection.find(query, fields).toArray(function(err, docs) {
				if (err) reject(err);
				db.close();
				resolve(docs);
			});

		});
	});
};

var parseDefault = function(folder, rwdfirst, dflt) {
	return new Promise(function(resolve, reject) {
		const OUTPUT = path.resolve(folder, dflt.resource + '.csv');

		// surface these ones first, then add the others alphabetically.
		var firstLevelPerms = rwdfirst ? ['read', 'write', 'delete', 'publish', 'unPublish'] : [];

		var lines = [];
		lines.push(HEADER.join(',') + os.EOL);

		var permissions = _.keys(dflt.defaults.permissions);
		var others = _.sortBy(_.difference(permissions, firstLevelPerms));

		_.each(firstLevelPerms, function(p) {
			var row = [p];
			_.each(HEADER, function(h) {
				if (!_.isEmpty(h)) {
					if (_.includes(dflt.defaults.permissions[p], h)) {
						row.push('X');
					} else {
						row.push(' ');
					}
				}
			});
			lines.push(row.join(',') + os.EOL);
		});

		_.each(others, function(p) {
			var row = [p];
			_.each(HEADER, function(h) {
				if (!_.isEmpty(h)) {
					if (_.includes(dflt.defaults.permissions[p], h)) {
						row.push('X');
					} else {
						row.push(' ');
					}
				}
			});
			lines.push(row.join(',') + os.EOL);
		});

		fs.writeFile(OUTPUT, lines, {encoding: 'utf8'}, function (err, data) {
			if (err) reject(err);
			console.log("saved to file ", OUTPUT);
			resolve();
		});

	});
};

var resetDefaultsData = function(url, reset) {
	if (reset === 'true') {
		console.log('Reset the defaults.');
		return resetdefaults.run(url)	;
	} else {
		console.log('Reset defaults not requested.');
		return Promise.resolve();
	}
}

var run = function() {

	var reset = false;
	var url = _URL;
	var path = __dirname;
	var rwdfirst = false;

	process.argv.forEach(function (val, index, array) {
		if (_.startsWith(val, 'url=')) {
			url = val.split('=')[1];
		}
		if (_.startsWith(val, 'reset=')) {
			reset = val.split('=')[1];
		}
		if (_.startsWith(val, 'path=')) {
			path = val.split('=')[1];
		}
		if (_.startsWith(val, 'rwdfirst=')) {
			rwdfirst = val.split('=')[1];
		}
	});

	return new Promise(function (resolve, reject) {
		console.log('start');
		console.log('url = ', url);
		console.log('reset = ', reset);
		console.log('path = ', path);
		console.log('rwdfirst = ', rwdfirst);
		resetDefaultsData(url, reset)
			.then(function(data) {
				// get all the default-permissions...
				return find(url, '_defaults', {type: 'default-permissions'});
			})
			.then(function(data) {
				//console.log('data = ', JSON.stringify(data, null, 4));
				var sorted = _.sortBy(data, 'resource');
				var p = _.transform(sorted, function(result, d) {
					result.push(parseDefault(path, rwdfirst, d));
				}, []);
				return Promise.all(p);
			})
			.then(function(data) {
				console.log('end');
				//console.log('end data = ', JSON.stringify(data));
				resolve(':)');
			}, function(err) {
				console.log('ERROR: end');
				console.log('ERROR: end err = ', JSON.stringify(err));
				reject(err);
			});
	});
};


run()
	.then(function(success) {
		console.log('success ', success);
		process.exit();
	})
	.catch(function(error) {
		console.error('error ', error);
		process.exit();
	});