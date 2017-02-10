'use strict';

var fs                  = require ('fs');
var path                = require ('path');
var mongoose            = require ('mongoose');
var CSVParse            = require ('csv-parse');
var _                   = require ('lodash');

var OrganizationController = require (path.resolve('./modules/organizations/server/controllers/organization.controller')),
	Organization  = mongoose.model ('Organization');

var ProjectController = require (path.resolve('./modules/projects/server/controllers/project.controller')),
	Project  = mongoose.model ('Project');

var OtherDocumentsController = require (path.resolve('./modules/other-documents/server/controllers/other.documents.controller')),
	OtherDocument  = mongoose.model ('OtherDocument');

var getDate = function(s) {
	try {
		var d = new Date(s);
		if (isNaN(d)) {
			// try dd / mm / yyyy -> cannot be parsed by Date
			var dparts = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
			d = new Date(dparts[3], dparts[2] - 1, dparts[1]);
		}
		return d;
	} catch(e) {
		console.log('Error parsing date: ', s);
		return;
	}
};

var importOrganizations = function(opts, data, startRow, purge) {
	var OrgCtrl = new OrganizationController(opts);
	return new Promise(function(resolve, reject) {

		var columnNames = ['name','legalName','orgCode','orgType','website','address1','address2','city','province','country','postal','description'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name            : _.trim(row.name),
				legalName       : _.trim(row.legalName),
				orgCode         : _.trim(row.orgCode),
				orgType         : _.trim(row.orgType),
				website         : _.trim(row.website),
				address1        : _.trim(row.address1),
				address2        : _.trim(row.address2),
				city            : _.trim(row.city),
				province        : _.trim(row.province),
				country         : _.trim(row.country),
				postal          : _.trim(row.postal),
				description     : _.trim(row.description)
			};
			//console.log('v1: obj = ', JSON.stringify(obj, null, 4));
			return obj;
		};

		var setValues = function(obj, row) {
			if (_.isEmpty(row.name)) {
				// do nothing...
			} else {
				if (!obj) {
					obj = new Organization();
				}
				obj.name = row.name;
				obj.legalName = row.legalName;
				obj.orgCode = row.orgCode;
				obj.orgType = row.orgType;
				obj.website = row.website;
				obj.address1 = row.address1;
				obj.address2 = row.address2;
				obj.city = row.city;
				obj.province = row.province;
				obj.country = row.country;
				obj.postal = row.postal;
				obj.description = row.description;
				//console.log('setValues obj = ', JSON.stringify(obj, null, 4));
			}
		};


		var parse = new CSVParse(data, {delimiter: ',', columns: columnNames}, function(err, output){
			var promises = [];

			// assumption here is data is created in excel, and thought of as 1 based index...
			var firstRow = (startRow > 0) ? startRow - 1 : 0;

			Object.keys(output).forEach(function(key, index) {
				// row 1 - version
				// row 2 - notes
				// row 3 - headings
				// ???
				if (index >= firstRow) {
					var row = output[key];
					promises.push(rowParser(row));
				}
			});

			var cleanUp = function () {
				if (purge) {
					return new Promise(function (rs, rj) {
						Organization.remove({}, function(err, result) {
								if (err) {
									console.log('Organization cleanup error: ', JSON.stringify(err));
									rj(err);
								} else {
									console.log('Organization cleanup: ', JSON.stringify(result));
									rs();
								}
							}
						);
					});
				} else {
					console.log('Organization cleanup not requested');
					return Promise.resolve();
				}
			};

			var importData = function(row) {
				return new Promise(function(rs, rj) {
					// console.log("item:", item);
					if (row.name === '') {
						// console.log("resolving nothing for org, it was null.");
						rs(null);
					} else {
						Organization.findOne ({ name: {$regex: row.name, $options: "i"} }, function (err, result) {
							if (err) {
								rj(err);
							}
							if (result === null) {
								var o = new Organization();
								setValues(o, row);
								console.log("Organization create: ", row.name);
								OrgCtrl.create(o).then(rs, rj);
							} else {
								console.log("Organization update: ", row.name);
								setValues(result, row);
								result.save().then(rs, rj);
							}
						});
					}
				});
			};

			cleanUp()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importData(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});

};

var importProjects = function(opts, data, startRow, purge) {
	var ProjCtrl = new ProjectController(opts);

	return new Promise(function(resolve, reject) {

		var columnNames = ['name', 'subtitle', 'memId', 'epicId', 'lat', 'lon', 'operator', 'owner', 'commodityType', 'commodities', 'tailingsImpoundments', 'status', 'design', 'construction', 'operation', 'closure', 'reclamation', 'monitoring'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name: _.trim(row.name),
				subtitle: _.trim(row.subtitle),
				memId: _.trim(row.memId),
				epicId: _.trim(row.epicId),
				lat: _.trim(row.lat),
				lon: _.trim(row.lon),
				operator: _.trim(row.operator),
				owner: _.trim(row.owner),
				commodityType: _.trim(row.commodityType),
				commodities: _.trim(row.commodities),
				tailingsImpoundments: _.trim(row.tailingsImpoundments),
				status: _.trim(row.status),
				design: _.trim(row.design),
				construction: _.trim(row.construction),
				operation: _.trim(row.operation),
				closure: _.trim(row.closure),
				reclamation: _.trim(row.reclamation),
				monitoring: _.trim(row.monitoring)
			};
			//console.log('v1: obj = ', JSON.stringify(obj, null, 4));
			return obj;
		};

		var setValues = function(obj, row) {
			if (_.isEmpty(row.name)) {
				// do nothing...
			} else {
				if (!obj) {
					obj = new Project();
				}
				obj.name = row.name;
				obj.externalIDs = [];
				obj.activities = [];
				obj.content = [];

				// external ids..
				var externalIDs = [];
				if (obj.externalIDs) {
					_.each(obj.externalIDs, function(o) {
						if (o.type !== 'MEM_ID' || o.type !== 'EPIC_ID') {
							content.push({ source: o.source, type: o.type, referenceID: o.referenceID});
						}
					});
				}
				if (!_.isEmpty(row.memId)) {
					obj.externalIDs.push({ source: 'IMPORT', type: 'MEM_ID', referenceID: row.memId });
				}

				if (!_.isEmpty(row.epicId)) {
					obj.externalIDs.push({ source: 'IMPORT', type: 'EPIC_ID', referenceID: row.epicId });
				}
				obj.externalIDs = [];
				obj.externalIDs = externalIDs;
				obj.markModified('externalIDs');

				try {
					obj.latitude = parseFloat(row.lat);
				} catch (e) {}

				try {
					obj.longitude = parseFloat(row.lon);
				} catch (e) {}

				try {
					obj.tailingsImpoundments = parseInt(row.tailingsImpoundments);
				} catch (e) {}

				obj.operator = row.operator;
				// owner can be a bit gnarly, touch it up here.
				// some have \r, replace with ;  we only want ; separating different owners.
				try {
					var value = row.owner.replace(/[\r\n]/g, ";");
					value = value.replace(/^;+|;+(?=;|$)/g, ''); // make sure only one ; in a row
					var owners = [];
					_.each(value.split(';'), function(o) {
						owners.push(o.trim());
					});
					obj.ownership = owners.join(';');
				} catch(e) {
					obj.ownership = row.owner;
				}

				obj.commodityType = row.commodityType;
				obj.commodities = _.isEmpty(row.commodities) ? [] : _.split(row.commodities, ',');

				obj.status = row.status;

				// stages/phases/activities...
				var activities = [];
				activities.push({ name: 'Design', order: 1, status: row.design });
				activities.push({ name: 'Construction', order: 2, status: row.construction });
				activities.push({ name: 'Operation', order: 3, status: row.operation });
				activities.push({ name: 'Closure', order: 4, status: row.closure });
				activities.push({ name: 'Reclamation', order: 5, status: row.reclamation });
				activities.push({ name: 'Monitoring & Reporting', order: 5, status: row.monitoring });
				obj.activities = [];
				obj.activities = activities;
				obj.markModified('activities');

				if (!_.isEmpty(row.subtitle)) {
					var content = [];

					if (obj.content) {
						_.each(obj.content, function(o) {
							if (!(o.type === 'SUBTITLE' && o.page === 'DETAILS')) {
								content.push({ source: o.source, type: o.type, page: o.page, title: o.title, text: o.text, html: o.html});
							}
						});
					}

					content.push({ source: 'IMPORT', type: 'SUBTITLE', page: 'DETAILS', title: row.subtitle, text: row.subtitle, html: row.subtitle});
					obj.content = [];
					obj.content = content;
					obj.markModified('content');
				}

				//console.log('setValues obj = ', JSON.stringify(obj, null, 4));
			}
		};


		var parse = new CSVParse(data, {delimiter: ',', columns: columnNames}, function(err, output){
			var promises = [];

			// assumption here is data is created in excel, and thought of as 1 based index...
			var firstRow = (startRow > 0) ? startRow - 1 : 0;

			Object.keys(output).forEach(function(key, index) {
				// row 1 - version
				// row 2 - notes
				// row 3 - headings
				// ???
				if (index >= firstRow) {
					var row = output[key];
					promises.push(rowParser(row));
				}
			});

			var cleanUp = function () {
				if (purge) {
					return new Promise(function (rs, rj) {
						Project.remove({}, function(err, result) {
								if (err) {
									console.log('Project cleanup error: ', JSON.stringify(err));
									rj(err);
								} else {
									console.log('Project cleanup: ', JSON.stringify(result));
									rs();
								}
							}
						);
					});
				} else {
					console.log('Project cleanup not requested');
					return Promise.resolve();
				}
			};

			var importData = function(row) {
				return new Promise(function(rs, rj) {
					Project.findOne ({ name: {$regex: row.name, $options: "i"} }, function (err, result) {
						if (err) {
							rj(err);
						}
						if (result === null) {
							var p = new Project();
							setValues(p, row);
							console.log("Project create: ", row.name);
							ProjCtrl.create(p).then(rs, rj);
						} else {
							console.log("Project update: ", row.name);
							setValues(result, row);
							result.save().then(rs, rj);
						}
					});
				});
			};

			cleanUp()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importData(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});
};

var importDetails = function(opts, data, startRow, purge) {
	var ProjCtrl = new ProjectController(opts);

	return new Promise(function(resolve, reject) {

		var columnNames = ['name', 'title', 'link', 'introText', 'introHtml'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name: _.trim(row.name),
				title: _.trim(row.title),
				link: _.trim(row.link),
				introText: _.trim(row.introText),
				introHtml: _.trim(row.introHtml)
			};
			//console.log('v1: obj = ', JSON.stringify(obj, null, 4));
			return obj;
		};

		var setValues = function(obj, row) {
			if (_.isEmpty(row.name)) {
				// do nothing...
			} else {
				if (!obj) {
					obj = new Project();
				}
				obj.name = row.name;

				if (!_.isEmpty(row.introText)) {
					var content = [];
					_.each(obj.content, function(o) {
						if (!(o.type === 'INTRO_TEXT' && o.page === 'DETAILS')) {
							content.push({ source: o.source, type: o.type, page: o.page, title: o.title, text: o.text, html: o.html});
						}
					});
					content.push({ source: 'IMPORT', type: 'INTRO_TEXT', page: 'DETAILS', title: 'Introduction', text: row.introText, html: _.isEmpty(row.introHtml) ? row.introText : row.introHtml});
					obj.content = [];
					obj.content = content;
					obj.markModified('content');
				}

				if (!_.isEmpty(row.link)) {
					var links = [];
					_.each(obj.externalLinks, function(l) {
						if (!(l.type === 'EXTERNAL_LINK' && l.page === 'DETAILS' && l.link === row.link)) {
							links.push({ source: l.source, type: l.type, page: l.page, title: l.title, link: l.link});
						}
					});
					//
					// we need to parse out titles and links - they are ; separated
					//
					if (!_.isEmpty(row.title) && !_.isEmpty(row.link)) {
						var titles = row.title.split(';');
						var hrefs = row.link.split(';');
						if (_.size(titles) === _.size(hrefs)) {
							_.each(titles, function(value, index) {
								var title = value;
								var link = hrefs[index];
								links.push({ source: 'IMPORT', type: 'EXTERNAL_LINK', page: 'DETAILS', title: _.trim(title), link: _.trim(link)});
							});
						} else {
							console.log('Project (' + row.name + ') DETAILS external links.  Titles (' + _.size(titles) + ') and Links (' + _.size(hrefs) + ') do not pair up.');
						}

					}
					obj.externalLinks = [];
					obj.externalLinks = links;
					obj.markModified('externalLinks');
				}

				//console.log('setValues obj = ', JSON.stringify(obj, null, 4));
			}
		};


		var parse = new CSVParse(data, {delimiter: ',', columns: columnNames}, function(err, output){
			var promises = [];

			// assumption here is data is created in excel, and thought of as 1 based index...
			var firstRow = (startRow > 0) ? startRow - 1 : 0;

			Object.keys(output).forEach(function(key, index) {
				// row 1 - version
				// row 2 - notes
				// row 3 - headings
				// ???
				if (index >= firstRow) {
					var row = output[key];
					promises.push(rowParser(row));
				}
			});

			var cleanUp = function () {
				if (purge) {
					return new Promise(function (rs, rj) {
						Project.update({},
							{
								$pull: {
									content: {
										source: 'IMPORT', type: 'INTRO_TEXT', page: 'DETAILS', title: 'Introduction'
									},
									externalLinks: {
										source: 'IMPORT', type: 'EXTERNAL_LINK', page: 'DETAILS'
									}
								}

							},
							{multi: true},
							function (err, result) {
								if (err) {
									console.log('Project DETAILS cleanup error: ', JSON.stringify(err));
									rj(err);
								} else {
									console.log('Project DETAILS cleanup: ', JSON.stringify(result));
									rs();
								}
							}
						);
					});
				} else {
					console.log('Project DETAILS cleanup not requested');
					return Promise.resolve();
				}
			};

			var importData = function(row) {
				return new Promise(function(rs, rj) {

					Project.findOne ({ name: {$regex: row.name, $options: "i"} }, function (err, result) {
						if (err) {
							rj(err);
						}
						if (result === null) {
							console.log("Project DETAILS update, project not found: ", row.name);
							rs();
						} else {
							console.log("Project DETAILS update: ", row.name);
							setValues(result, row);
							result.save().then(rs, rj);
						}
					});
				});
			};

			cleanUp()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importData(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});
};

var importCompliance = function(opts, data, startRow, purge) {
	var ProjCtrl = new ProjectController(opts);

	return new Promise(function(resolve, reject) {

		var columnNames = ['name', 'title', 'link', 'introText', 'introHtml'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name: _.trim(row.name),
				title: _.trim(row.title),
				link: _.trim(row.link),
				introText: _.trim(row.introText),
				introHtml: _.trim(row.introHtml)
			};
			//console.log('v1: obj = ', JSON.stringify(obj, null, 4));
			return obj;
		};

		var setValues = function(obj, row) {
			if (_.isEmpty(row.name)) {
				// do nothing...
			} else {
				if (!obj) {
					obj = new Project();
				}
				obj.name = row.name;

				if (!_.isEmpty(row.introText)) {
					var content = [];
					_.each(obj.content, function(o) {
						if (!(o.type === 'INTRO_TEXT' && o.page === 'COMPLIANCE')) {
							content.push({ source: o.source, type: o.type, page: o.page, title: o.title, text: o.text, html: o.html});
						}
					});
					content.push({ source: 'IMPORT', type: 'INTRO_TEXT', title: 'Introduction', page: 'COMPLIANCE', text: row.introText, html: _.isEmpty(row.introHtml) ? row.introText : row.introHtml});
					obj.content = [];
					obj.content = content;
					obj.markModified('content');
				}

				if (!_.isEmpty(row.link)) {
					var links = [];
					_.each(obj.externalLinks, function(l) {
						if (!(l.type ==='EXTERNAL_LINK' && l.page === 'COMPLIANCE' && l.link === row.link)) {
							links.push({ source: l.source, type: l.type, page: l.page, title: l.title, link: l.link});
						}
					});
					//
					// we need to parse out titles and links - they are ; separated
					//
					if (!_.isEmpty(row.title) && !_.isEmpty(row.link)) {
						var titles = row.title.split(';');
						var hrefs = row.link.split(';');
						if (_.size(titles) === _.size(hrefs)) {
							_.each(titles, function(value, index) {
								var title = value;
								var link = hrefs[index];
								links.push({ source: 'IMPORT', type: 'EXTERNAL_LINK', page: 'COMPLIANCE', title: _.trim(title), link: _.trim(link)});
							});
						} else {
							console.log('Project (' + row.name + ') COMPLIANCE external links.  Titles (' + _.size(titles) + ') and Links (' + _.size(hrefs) + ') do not pair up.');
						}
					}
					obj.externalLinks = [];
					obj.externalLinks = links;
					obj.markModified('externalLinks');
				}

				//console.log('setValues obj = ', JSON.stringify(obj, null, 4));
			}
		};


		var parse = new CSVParse(data, {delimiter: ',', columns: columnNames}, function(err, output){
			var promises = [];

			// assumption here is data is created in excel, and thought of as 1 based index...
			var firstRow = (startRow > 0) ? startRow - 1 : 0;

			Object.keys(output).forEach(function(key, index) {
				// row 1 - version
				// row 2 - notes
				// row 3 - headings
				// ???
				if (index >= firstRow) {
					var row = output[key];
					promises.push(rowParser(row));
				}
			});

			var cleanUp = function () {
				if (purge) {
					return new Promise(function (rs, rj) {
						Project.update({},
							{
								$pull: {
									content: {
										source: 'IMPORT', type: 'INTRO_TEXT', page: 'COMPLIANCE', title: 'Introduction'
									},
									externalLinks: {
										source: 'IMPORT', type: 'EXTERNAL_LINK', page: 'COMPLIANCE'
									}
								}

							},
							{multi: true},
							function (err, result) {
								if (err) {
									console.log('Project COMPLIANCE cleanup error: ', JSON.stringify(err));
									rj(err);
								} else {
									console.log('Project COMPLIANCE cleanup: ', JSON.stringify(result));
									rs();
								}
							}
						);
					});
				} else {
					console.log('Project COMPLIANCE cleanup not requested');
					return Promise.resolve();
				}
			};

			var importData = function(row) {
				return new Promise(function(rs, rj) {

					Project.findOne ({ name: {$regex: row.name, $options: "i"} }, function (err, result) {
						if (err) {
							rj(err);
						}
						if (result === null) {
							console.log("Project COMPLIANCE update, project not found: ", row.name);
							rs();
						} else {
							console.log("Project COMPLIANCE update: ", row.name);
							setValues(result, row);
							result.save().then(rs, rj);
						}
					});
				});
			};

			cleanUp()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importData(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});
};

var importAuthorizations = function(opts, data, startRow, purge) {
	var ProjCtrl = new ProjectController(opts);

	return new Promise(function(resolve, reject) {

		var columnNames = ['name', 'title', 'link', 'introText', 'introHtml'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name: _.trim(row.name),
				title: _.trim(row.title),
				link: _.trim(row.link),
				introText: _.trim(row.introText),
				introHtml: _.trim(row.introHtml)
			};
			//console.log('v1: obj = ', JSON.stringify(obj, null, 4));
			return obj;
		};

		var setValues = function(obj, row) {
			if (_.isEmpty(row.name)) {
				// do nothing...
			} else {
				if (!obj) {
					obj = new Project();
				}
				obj.name = row.name;

				if (!_.isEmpty(row.introText)) {
					var content = [];
					_.each(obj.content, function(o) {
						if (!(o.type ==='INTRO_TEXT' && o.page === 'AUTHORIZATION')) {
							content.push({ source: o.source, type: o.type, page: o.page, title: o.title, text: o.text, html: o.html});
						}
					});
					content.push({ source: 'IMPORT', type: 'INTRO_TEXT', page: 'AUTHORIZATION', title: 'Introduction', text: row.introText, html: _.isEmpty(row.introHtml) ? row.introText : row.introHtml});
					obj.content = [];
					obj.content = content;
					obj.markModified('content');
				}

				if (!_.isEmpty(row.link)) {
					var links = [];
					_.each(obj.externalLinks, function(l) {
						if (!(l.type ==='EXTERNAL_LINK' && l.page === 'AUTHORIZATION' && l.link === row.link)) {
							links.push({ source: l.source, type: l.type, page: l.page, title: l.title, link: l.link});
						}
					});
					//
					// we need to parse out titles and links - they are ; separated
					//
					if (!_.isEmpty(row.title) && !_.isEmpty(row.link)) {
						var titles = row.title.split(';');
						var hrefs = row.link.split(';');
						if (_.size(titles) === _.size(hrefs)) {
							_.each(titles, function(value, index) {
								var title = value;
								var link = hrefs[index];
								links.push({ source: 'IMPORT', type: 'EXTERNAL_LINK', page: 'AUTHORIZATION', title: _.trim(title), link: _.trim(link)});
							});
						} else {
							console.log('Project (' + row.name + ') AUTHORIZATION external links.  Titles (' + _.size(titles) + ') and Links (' + _.size(hrefs) + ') do not pair up.');
						}
					}
					obj.externalLinks = [];
					obj.externalLinks = links;
					obj.markModified('externalLinks');
				}

				//console.log('setValues obj = ', JSON.stringify(obj, null, 4));
			}
		};


		var parse = new CSVParse(data, {delimiter: ',', columns: columnNames}, function(err, output){
			var promises = [];

			// assumption here is data is created in excel, and thought of as 1 based index...
			var firstRow = (startRow > 0) ? startRow - 1 : 0;

			Object.keys(output).forEach(function(key, index) {
				// row 1 - version
				// row 2 - notes
				// row 3 - headings
				// ???
				if (index >= firstRow) {
					var row = output[key];
					promises.push(rowParser(row));
				}
			});

			var cleanUp = function () {
				if (purge) {
					return new Promise(function (rs, rj) {
						Project.update({},
							{
								$pull: {
									content: {
										source: 'IMPORT', type: 'INTRO_TEXT', page: 'AUTHORIZATION', title: 'Introduction'
									},
									externalLinks: {
										source: 'IMPORT', type: 'EXTERNAL_LINK', page: 'AUTHORIZATION'
									}
								}

							},
							{multi: true},
							function (err, result) {
								if (err) {
									console.log('Project AUTHORIZATION cleanup error: ', JSON.stringify(err));
									rj(err);
								} else {
									console.log('Project AUTHORIZATION cleanup: ', JSON.stringify(result));
									rs();
								}
							}
						);
					});
				} else {
					console.log('Project AUTHORIZATION cleanup not requested');
					return Promise.resolve();
				}
			};

			var importData = function(row) {
				return new Promise(function(rs, rj) {

					Project.findOne ({ name: {$regex: row.name, $options: "i"} }, function (err, result) {
						if (err) {
							rj(err);
						}
						if (result === null) {
							console.log("Project AUTHORIZATION update, project not found: ", row.name);
							rs();
						} else {
							console.log("Project AUTHORIZATION update: ", row.name);
							setValues(result, row);
							result.save().then(rs, rj);
						}
					});
				});
			};

			cleanUp()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importData(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});
};

var importMinesList = function(opts, data, startRow, purge) {
	var ProjCtrl = new ProjectController(opts);

	return new Promise(function(resolve, reject) {

		var columnNames = ['name', 'introText', 'introHtml'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name: _.trim(row.name),
				introText: _.trim(row.introText),
				introHtml: _.trim(row.introHtml)
			};
			//console.log('v1: obj = ', JSON.stringify(obj, null, 4));
			return obj;
		};

		var setValues = function(obj, row) {
			if (_.isEmpty(row.name)) {
				// do nothing...
			} else {
				if (!obj) {
					obj = new Project();
				}
				obj.name = row.name;

				if (!_.isEmpty(row.introText)) {
					var content = [];
					_.each(obj.content, function(o) {
						if (!(o.type === 'OVERVIEW_INTRO_TEXT' && o.page === 'MINES')) {
							content.push({ source: o.source, type: o.type, page: o.page, title: o.title, text: o.text, html: o.html});
						}
					});
					content.push({ source: 'IMPORT', type: 'OVERVIEW_INTRO_TEXT', page: 'MINES', title: 'Introduction', text: row.introText, html: _.isEmpty(row.introHtml) ? row.introText : row.introHtml});
					obj.content = [];
					obj.content = content;
					obj.markModified('content');
				}

				//console.log('setValues obj = ', JSON.stringify(obj, null, 4));
			}
		};


		var parse = new CSVParse(data, {delimiter: ',', columns: columnNames}, function(err, output){
			var promises = [];

			// assumption here is data is created in excel, and thought of as 1 based index...
			var firstRow = (startRow > 0) ? startRow - 1 : 0;

			Object.keys(output).forEach(function(key, index) {
				// row 1 - version
				// row 2 - notes
				// row 3 - headings
				// ???
				if (index >= firstRow) {
					var row = output[key];
					promises.push(rowParser(row));
				}
			});

			var cleanUp = function () {
				if (purge) {
					return new Promise(function (rs, rj) {
						Project.update({},
							{
								$pull: {
									content: {
										source: 'IMPORT',
										type: 'OVERVIEW_INTRO_TEXT',
										page: 'MINES',
										title: 'Introduction'
									}
								}
							},
							{multi: true},
							function (err, result) {
								if (err) {
									console.log('Project MINES cleanup error: ', JSON.stringify(err));
									rj(err);
								} else {
									console.log('Project MINES cleanup: ', JSON.stringify(result));
									rs();
								}
							}
						);
					});
				} else {
					console.log('Project MINES cleanup not requested');
					return Promise.resolve();
				}
			};

			var importData = function(row) {
				return new Promise(function(rs, rj) {

					Project.findOne ({ name: {$regex: row.name, $options: "i"} }, function (err, result) {
						if (err) {
							rj(err);
						}
						if (result === null) {
							console.log("Project MINES update, project not found: ", row.name);
							rs();
						} else {
							console.log("Project MINES update: ", row.name);
							setValues(result, row);
							result.save().then(rs, rj);
						}
					});
				});
			};

			cleanUp()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importData(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});
};

var importOtherDocuments = function(opts, data, startRow, purge) {
	var ProjCtrl = new ProjectController(opts);
	var OrgCtrl = new OrganizationController(opts);
	var OdCtrl = new OtherDocumentsController(opts);

	return new Promise(function(resolve, reject) {

		var columnNames = ['agency', 'name', 'title', 'documentType', 'date', 'filename', 'link'];

		var rowParser = function(row) {
			var obj = {
					name: _.trim(row.name),
					agency: _.map(_.split(row.agency, ","), function(a) { return _.trim(a); }),
					title: _.trim(row.title),
					link: _.trim(row.link),
					filename: _.trim(row.filename),
					documentType: _.trim(row.documentType),
					date: _.trim(row.date)
				};
				//console.log('row to obj = ', JSON.stringify(obj, null, 4));
			return obj;
		};

		var setValues = function(obj, row) {
			if (_.isEmpty(row.name)) {
				// do nothing...
			} else {
				if (!obj) {
					obj = new OtherDocument();
				}

				// row name is for project
				// row agency is for agency
				obj.source = 'IMPORT';
				obj.title = row.title;
				obj.link = row.link;
				obj.documentType = row.documentType;
				obj.filename = row.filename;
				var d = getDate(row.date);
				if (!d ||isNaN(d)) {
					console.log('Project Other Documents Invalid date (' + row.date + ') error: ', JSON.stringify(obj));
					obj.date = new Date();
				} else {
					obj.date = d;
				}
				//console.log('setValues obj = ', JSON.stringify(obj, null, 4));
			}
		};


		var parse = new CSVParse(data, {delimiter: ',', columns: columnNames}, function(err, output){
			var promises = [];

			// assumption here is data is created in excel, and thought of as 1 based index...
			var firstRow = (startRow > 0) ? startRow - 1 : 0;

			Object.keys(output).forEach(function(key, index) {
				// row 1 - version
				// row 2 - notes
				// row 3 - headings
				// ???
				if (index >= firstRow) {
					var row = output[key];
					promises.push(rowParser(row));
				}
			});

			var cleanUp = function() {
				if (purge) {
					return new Promise(function(rs, rj) {
						OtherDocument.remove({}, function(err, result) {
								if (err) {
									console.log('Project Other Documents cleanup error: ', JSON.stringify(err));
									rj(err);
								} else {
									console.log('Project Other Documents cleanup: ', JSON.stringify(result));
									rs();
								}
							}
						);
					});
				} else {
					console.log('Project Other Documents cleanup not requested');
					return Promise.resolve();
				}
			};

			var importData = function(row) {
				var project, agencies, doc;

				return new Promise(function(rs, rj) {
					ProjCtrl.findOne({ name: {$regex: row.name, $options: "i"} })
						.then(function(res) {
							if (res) {
								project = res;
								return OrgCtrl.list({ 'orgCode': {$in: row.agency } });
							} else {
								console.log('Project Other Documents, project not found: ', row.name);
								rs();
							}
						})
						.then(function(res) {
							if (res) {
								agencies = res;
								var q = {project: project, link: {$regex: row.link, $options: "i"} };
								return OdCtrl.findOne(q);
							} else {
								console.log('Project Other Documents, agencies not found: ', row.agency);
								rs();
							}
						})
						.then(function(res) {
							if (!res) {
								console.log('Project (' + row.name + ') Other Documents creating: ', row.link);
								res = new OtherDocument();
							} else {
								console.log('Project (' + row.name + ') Other Documents updating: ', row.link);
							}
							setValues(res, row);
							res.project = project;
							res.agencies = agencies;
							res.save().then(rs, rj);
						});
				});
			};

			cleanUp()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importData(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});};


module.exports = function(file, req, res, opts) {
	//console.log(JSON.stringify(req.headers));
	var purge = 'true' === req.headers.purge;
	return new Promise (function (resolve, reject) {
		// Now parse and go through this thing.
		fs.readFile(file.path, 'utf8', function(err, data) {
			if (err) {
				reject(err);
				return;
			}
			var lines, importFileType, startRow, importer;

			try {
				lines = data.split(/\r\n|\r|\n/g);
			} catch(e) {
				reject(new Error('Error performing initial parse, cannot determine import type.'));
				return;
			}

			if (_.size(lines) === 0) {
				reject(new Error('No lines found in file, cannot determine import type.'));
				return;
			}

			try {
				importFileType = lines[0].split(',')[0];
			} catch(e) {
				reject(new Error('Error reading import file type from file, cannot determine import type.'));
				return;
			}

			try {
				var val = parseInt(lines[0].split(',')[1]);
				startRow = _.isNaN(val) ? 3 : val;
			} catch(e) {
				startRow = 3; // 1 - import file type, 2 - header/column names, 3 - data
			}

			switch(importFileType) {
				case 'mmti-organizations-v1':
					importer = importOrganizations;
					break;
				case 'mmti-projects-v1':
					importer = importProjects;
					break;
				case 'mmti-details-v1':
					importer = importDetails;
					break;
				case 'mmti-compliance-v1':
					importer = importCompliance;
					break;
				case 'mmti-authorizations-v1':
					importer = importAuthorizations;
					break;
				case 'mmti-mines-list-v1':
					importer = importMinesList;
					break;
				case 'mmti-other-documents-v1':
					importer = importOtherDocuments;
					break;
			}

			if (!importer) {
				reject(new Error("Import type '" + importFileType + "' is not supported."));
				return;
			}

			resolve(importer(opts, data, startRow, purge));

		});
	});
};
