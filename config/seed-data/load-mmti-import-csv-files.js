'use strict';

var fs                  = require ('fs');
var path                = require ('path');
var _                   = require ('lodash');

var ImportController = require (path.resolve('./modules/import/server/controllers/import.controller'));

module.exports = function() {
	return new Promise(function(resolve, reject) {
		console.log('start import files... organizations...');
		(new ImportController({path: path.resolve(__dirname, 'mmti-organizations-v1.csv')}, null, null, {context: 'application', user: {}}))
			.then(function(result) {
				console.log('... projects...');
				return (new ImportController({path: path.resolve(__dirname, 'mmti-projects-v1.csv')}, null, null, {context: 'application', user: {}}));
			})
			.then(function(result) {
				console.log('... details...');
				return (new ImportController({path: path.resolve(__dirname, 'mmti-details-v1.csv')}, null, null, {context: 'application', user: {}}));
			})
			.then(function(result) {
				console.log('... mines list...');
				return (new ImportController({path: path.resolve(__dirname, 'mmti-mines-list-v1.csv')}, null, null, {context: 'application', user: {}}));
			})
			.then(function(result) {
				console.log('... authorizations...');
				return (new ImportController({path: path.resolve(__dirname, 'mmti-authorizations-v1.csv')}, null, null, {context: 'application', user: {}}));
			})
			.then(function(result) {
				console.log('... compliance...');
				return (new ImportController({path: path.resolve(__dirname, 'mmti-compliance-v1.csv')}, null, null, {context: 'application', user: {}}));
			})
			.then(function(result) {
				console.log('... other docs...');
				return (new ImportController({path: path.resolve(__dirname, 'mmti-other-docs-v1.csv')}, null, null, {context: 'application', user: {}}));
			})
			.then(function(result) {
				console.log('end import files');
				resolve();
			})
		;
	});
};