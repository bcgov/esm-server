/**
 * Script to test db connection by executing a query.
 */
'use strict';
var etl            = require('./etlHelper');

var argv           = require('minimist')(process.argv.slice(2));
argv.scriptName    = process.argv[1].split('/').pop();

etl.init(argv);

var connectionString = etl.getConnectString();
var query1 = { $or: [ {displayName: {$eq: null}}, {displayName: {$eq: ''}} ] };
console.log("Starting Ping.");
etl.pingTest(connectionString,'documents', query1)
.then( function() {
	console.log("Ending Ping Test.");
	process.exit();
})
.catch( function (err) {
	console.log("Error: ", err);
	process.exit(1);
})
;

