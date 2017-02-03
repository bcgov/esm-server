'use strict';

var MongoClient = require('mongodb').MongoClient;
var Promise = require('Promise');
var _ = require('lodash');
var path = require('path');



function loadData() {
	return [
		{
			projectId: "p1",
			orgCode: 'MEM',
			inspectionNum: '61307',
			inspectionDate: '2016-01-12',
			inspectionSummary: 'On January 12, 2016, Rory Cumming, Inspector of Mines, Electrical visited the Mount Milligan mine site to conduct an electrical inspection.'
		},
		{
			projectId: "p1",
			orgCode: 'ENV',
			inspectionNum: '24765',
			inspectionDate: '2016-02-02',
			inspectionSummary: "File review of reports submitted by the Permittee for the Thompson Creek Metals Company Inc. gold-copper mill and mine complex Environmental Management Act 104777 permit. This file review was for the time period from 2013-09-01 to 2016-01-07. The following reports were reviewed in completing this file review; 2013 Annual Report,2013 Q3 and Q4 reports, 2015 Q1 report, 2015 Q2 Report, 2015 Q3 report and 2015 Q4 Report. No non-compliances were noted during this file review."
		},
		{
			projectId: "p1",
			orgCode: 'MEM',
			inspectionNum: '62156',
			inspectionDate: '2016-03-03',
			inspectionSummary: "On March 3, 2016, Laurie Meade and Kris Bailey, Inspectors of Mines, Health and Safety conducted an inspection at the Mount Milligan mine. The inspectors reviewed the mine's first aid records, training records and mine rescue training records and inspected the warehouse and shops."
		},
		{
			projectId: "p1",
			orgCode: 'MEM',
			inspectionNum: '63456',
			inspectionDate: '2016-04-26',
			inspectionSummary: "On April 26, 2016, James Robinson and Laurie Meade, Inspectors of Mines, Health and Safety, and Aaron Unger, Inspector of Mines, Ergonomics, visited the Mount Milligan mine to conduct a comprehensive inspection.",
			followUpDocuments: [
				{
					name: "Inspection Report - MEM-63456",
					ref: "https://mines.empr.gov.bc.ca/api/document/582294086d6ad30017ce0b36/fetch"
				},
				{
					name: "Mine Managers Response - MEM-63456",
					ref: "https://mines.empr.gov.bc.ca/api/document/582294086d6ad30017ce0b36/fetch"
				}
			]
		}
	];
}

var run = function () {
	var connectUrl = "mongodb://localhost:27017/mmti-dev";
	var complianceData = loadData();
	var collectionName = 'complianceOversight';
	var collection;
	return new Promise(function (resolve, reject) {

		console.log('start');
		MongoClient.connect(connectUrl)
			.then(function(db) {
				console.log(db);
				collection = db.collection(collectionName);
				// remove all entries
				return collection.remove({});
			})
			.then(function () {
				collection.insertMany(complianceData);
			})
			.then(function (data) {
				console.log('end');
				//console.log('end data = ', JSON.stringify(data));
				resolve(':)');
			}, function (err) {
				console.log('ERROR: end');
				console.log('ERROR: end err = ', JSON.stringify(err));
				reject(err);
			});


	});
};


run()
	.then(function (success) {
		console.log('success ', success);
		process.exit();
	})
	.catch(function (error) {
		console.error('error ', error);
		process.exit();
	});

