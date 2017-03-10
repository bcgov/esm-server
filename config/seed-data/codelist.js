'use strict';
var _             = require ('lodash');
var mongoose      = require('mongoose');
var promise       = require('promise');
var CodeList      = mongoose.model('CodeList');
var codeListData  = require ('./codelist-data');

module.exports = function () {

	var data = _.map(codeListData.lists, function(d) {
		return new CodeList(d);
	});

	console.log('Code List seeding starting...');
	return promise.all(data.map(function (d) {
		console.log('d = ', JSON.stringify(d, null, 4));
		return new promise(function (resolve, reject) {
			// need to tweak the data for upserting...
			var upsertData = d.toObject();
			delete upsertData._id;

			// use case insensitive searches... more reliable.
			CodeList.findOneAndUpdate({
				name: {$regex: new RegExp(d.name, "i")}
			}, upsertData, {upsert: true, 'new': true}, function (err, doc) {
				if (err) {
					console.log('Code List upsert failed: ' + err.toString() + ': ' + JSON.stringify(d));
					reject(new Error(err));
				} else {
					//console.log('Code List upsert completed');
					resolve(doc);
				}
			});
		});
	}))
	.then(function () {
		console.log('Code List seeding done.');
	});

};
