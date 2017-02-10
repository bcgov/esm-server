'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var Integration = mongoose.model('Integration');
var Project = mongoose.model('Project');


module.exports = LoadWorker;


/*
 * This is a helper class used to import seed data into the database.

 TIP:  to clear all integrations and force a reseed run this in the mongo client
 db.integrations.update({"dataDate": {$exists:true}}, {$set: {dataDate: null}},{ multi: true })
 *
 *
 */
function LoadWorker() {

	/**
	 * 
	 * @param fPath: path to js file ready for a require() call. The file contains the json
	 * data to use to populate the collection.
	 * @param model
	 * @param createItemFunction: given ref to this base helper, json for one instance of the
	 * model this function is to return a promise that creates an instance of the model
	 * @returns {*}
	 */
	this.loader = function (fPath, model, createItemFunction, forceUpdate) {
		var _this = this;
		// load the data
		var results = require(fPath);
		console.log("Load base loader for ", model.modelName);

		return _this.checkIntegration(results)
			.then(function (results) {
				if(forceUpdate) {
					console.log("Projects updated so force update on", model.modelName);
					results.needsUpdate = true;
				}
				if (!results.needsUpdate) {
					results.seedData = false;
					return results;
				} else {
					return _this.loadWorker(results.data, model, createItemFunction)
						.then(function (loadResults) {
							results.seedData = true;
							return results;
						});
				}
			})
			.then(function (results) {
				if (results.seedData) {
					return _this.saveIntegration(results);
				}
				return results;
			})
			.catch(function (err) {
				console.error(err);
			});
	};

	/**
	 * Does work common to all models. Clears the collection. Creates an array of Promise to perform item creation.
	 * @param dataList
	 * @param model
	 * @param createItem
	 * @returns {*}
	 */
	this.loadWorker = function (dataList, model, createItem) {
		var _this = this;
		console.log("Load  " + model.modelName);
		return this.clearCollection(model)
			.then(function () {
				var allPromises = [];
				_.each(dataList, function (pItem) {
					var p = createItem(_this, pItem);
					allPromises.push(p);
				});
				return Promise.all(allPromises);
			});
	};

	/**
	 * Check if the data is new and needs to be updated.
	 * @param results
	 * @returns {Promise}
	 */
	this.checkIntegration = function (results) {
		return new Promise(function (resolve, reject) {
			var name = results.name.toLowerCase();
			Integration.findOne({module: name}, function (err, integrationRow) {
				if (err) {
					console.error('Error seeding ' + name + ' : ', err);
					reject(err);
				}
				var loadedDataDate = (new Date(results.date)).getTime();
				var dataDate = integrationRow && integrationRow.dataDate && integrationRow.dataDate.getTime();
				results.needsUpdate = (!dataDate || dataDate < loadedDataDate);
				console.log("Dates", dataDate, loadedDataDate, results.needsUpdate);
				if (!results.needsUpdate) {
					console.log('Seeding :' + name + ' has already been performed');
				}
				resolve(results);
			});
		});
	};

	/**
	 * After data has been updated in the db save a record of the seeding.
	 * @param results
	 * @returns {Promise}
	 */
	this.saveIntegration = function (results) {
		return new Promise(function (resolve, reject) {
			var name = results.name.toLowerCase();
			console.log('Seeded :' + name);
			var query = {module: name};
			var update = {dataDate: results.date};
			var options = {new: true, upsert: true};
			Integration.findOneAndUpdate(query, update, options, function (err, doc) {
				if (err) {
					reject(err);
				}
				resolve(results);
			});
		});
	};

	/**
	 * Clears a collection. We consider the seed data to be the source of truth.
	 * @param collection
	 * @returns {Promise}
	 */
	this.clearCollection = function (collection) {
		return new Promise(function (resolve, reject) {
			collection.remove({}, function (err) {
				if (err) {
					reject(err);
				} else {
					console.log(collection.modelName, ' cleared');
					resolve();
				}
			});
		});
	};

	/**
	 * Helper to locate a project by name
	 * @param queryFor
	 * @returns {*}
	 */
	this.findProject = function (queryFor) {
		return Project.find({name: queryFor})
			.then(function (project) {
				if (project.length === 0) {
					console.log("Load pItem failed.. Could not locate project  '" + queryFor + "'");
					return null;
				}
				if (project.length > 1) {
					console.log("Load pItem failed.. Found more than one project with  '" + queryFor + "'");
					return null;
				}
				return project[0];
			});
	};

}