var _                       = require('lodash');
var csv                     = require('csv-parser');
var fs                      = require('fs');
var ObjectID                = require('mongodb').ObjectID;
var TreeModel               = require('tree-model');
var MongoClient             = require('mongodb').MongoClient;
var defaultConnectionString = "mongodb://localhost:27017/esm";
var username                = "";
var password                = "";
var host                    = "";
var db                      = "";


console.log("Starting migration.");

var args = process.argv.slice(2);
if (args.length !== 4) {
	console.log("Using default localhost connection:", defaultConnectionString);
} else {
	username = args[0];
	password = args[1];
	host = args[2];
	db = args[3];
	defaultConnectionString = "mongodb://" + username + ":" + password + "@" + host + ":27017/" + db;
}

MongoClient.connect(defaultConnectionString, function (err, db) {
	if (err) {
		console.error(err);
		process.exit(-1);
	}

	var auths = [];

	fs.createReadStream('authorisations.csv')
	.pipe(csv())
	.on('data', function (data) {
		var location = data['location'];
		var displayName = data['title'];
		var agency = data['agency'];
		console.log("location:", location);
		// console.log("data:", data);
		if (agency === "Ministry of Environment" || agency === "Ministry of Energy and Mines") {
			auths.push({location: location, displayName: displayName});
		}
	})
	.on('end', function (end) {
		console.log("processing data:");
		_.each(auths, function (a) {
			console.log("auth:", a);
			var o = a.location.replace(/.*document\//g,'').replace(/\/fetch$/g, '');
			try {
				var oID = new ObjectID(o);
				console.log("objectID:", oID);
				var collection = db.collection('documents');
				collection.findOne({_id: oID}, function (err, item) {
					console.log("oID:", oID);
					if (!err && item) {
						// Get auths (a) into collection('documents');
						collection.update( { _id: item._id }, { $set: { displayName: a.displayName }});
					} else {
						if (err) {
							console.log("err:", err);
						} else {
							console.log("Document Was Not Found:", oID);
						}
					}
				});
			} catch (e) {
				console.log("e:", e);
			}
		});
	});
});
