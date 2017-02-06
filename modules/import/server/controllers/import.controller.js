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



var importOrganizations = function(opts, data, startRow) {
	var OrgCtrl = new OrganizationController(opts);
	return new Promise(function(resolve, reject) {

		var columnNames = ['name','legalName','orgCode','orgType','website','address1','address2','city','province','country','postal','description'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name            : row.name,
				legalName       : row.legalName,
				orgCode         : row.orgCode,
				orgType         : row.orgType,
				website         : row.website,
				address1        : row.address1,
				address2        : row.address2,
				city            : row.city,
				province        : row.province,
				country         : row.country,
				postal          : row.postal,
				description     : row.description
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

			var importOrganization = function(row) {
				return new Promise(function(rs, rj) {
					// console.log("item:", item);
					if (row.name === '') {
						// console.log("resolving nothing for org, it was null.");
						rs(null);
					} else {
						Organization.findOne ({name: row.name}, function (err, result) {
							if (err) {
								rj(err);
							}
							if (result === null) {
								var o = new Organization();
								setValues(o, row);
								console.log("creating:", row.name);
								OrgCtrl.create(o).then(rs, rj);
							} else {
								setValues(result, row);
								result.save().then(rs, rj);
							}
						});
					}
				});
			};

			Promise.resolve ()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importOrganization(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});

};

var importProjects = function(opts, data, startRow) {
	var ProjCtrl = new ProjectController(opts);

	return new Promise(function(resolve, reject) {

		var columnNames = ['name', 'subtitle', 'memId', 'epicId', 'lat', 'lon', 'operator', 'owner', 'commodityType', 'commodities', 'tailingsImpoundments', 'status', 'design', 'construction', 'operation', 'closure', 'reclamation', 'monitoring'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name: row.name,
				subtitle: row.subtitle,
				memId: row.memId,
				epicId: row.epicId,
				lat: row.lat,
				lon: row.lon,
				operator: row.operator,
				owner: row.owner,
				commodityType: row.commodityType,
				commodities: row.commodities,
				tailingsImpoundments: row.tailingsImpoundments,
				status: row.status,
				design: row.design,
				construction: row.construction,
				operation: row.operation,
				closure: row.closure,
				reclamation: row.reclamation,
				monitoring: row.monitoring
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
					obj.externalIDs.push({ source: 'Import', type: 'MEM_ID', referenceID: row.memId });
				}

				if (!_.isEmpty(row.epicId)) {
					obj.externalIDs.push({ source: 'Import', type: 'EPIC_ID', referenceID: row.epicId });
				}
				obj.externalIDs = [];
				obj.externalIDs = externalIDs;
				obj.markModified('externalIDs');

				try {
					obj.lat = parseFloat(row.lat);
				} catch (e) {}

				try {
					obj.lon = parseFloat(row.lon);
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

			var importProject = function(row) {
				return new Promise(function(rs, rj) {
					Project.findOne ({name: row.name}, function (err, result) {
						if (err) {
							rj(err);
						}
						if (result === null) {
							var p = new Project();
							setValues(p, row);
							console.log("creating:", row.name);
							ProjCtrl.create(p).then(rs, rj);
						} else {
							setValues(result, row);
							result.save().then(rs, rj);
						}
					});
				});
			};

			Promise.resolve ()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importProject(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});
};

var importDetails = function(opts, data, startRow) {
	var ProjCtrl = new ProjectController(opts);

	return new Promise(function(resolve, reject) {

		var columnNames = ['name', 'title', 'link', 'introText', 'introHtml'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name: row.name,
				title: row.title,
				link: row.link,
				introText: row.introText,
				introHtml: row.introHtml
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
					links.push({ source: 'IMPORT', type: 'EXTERNAL_LINK', page: 'DETAILS', title: row.title, link: row.link});
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

			var importProject = function(row) {
				return new Promise(function(rs, rj) {

					Project.findOne ({name: row.name}, function (err, result) {
						if (err) {
							rj(err);
						}
						if (result === null) {
							console.log("Could not find project to update details: ", row.name);
							rs();
						} else {
							setValues(result, row);
							result.save().then(rs, rj);
						}
					});
				});
			};

			Promise.resolve ()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importProject(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});
};

var importCompliance = function(opts, data, startRow) {
	var ProjCtrl = new ProjectController(opts);

	return new Promise(function(resolve, reject) {

		var columnNames = ['name', 'title', 'link', 'introText', 'introHtml'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name: row.name,
				title: row.title,
				link: row.link,
				introText: row.introText,
				introHtml: row.introHtml
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
					links.push({ source: 'IMPORT', type: 'EXTERNAL_LINK', page: 'COMPLIANCE', title: row.title, link: row.link});
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

			var importProject = function(row) {
				return new Promise(function(rs, rj) {

					Project.findOne ({name: row.name}, function (err, result) {
						if (err) {
							rj(err);
						}
						if (result === null) {
							console.log("Could not find project to update details: ", row.name);
							rs();
						} else {
							setValues(result, row);
							result.save().then(rs, rj);
						}
					});
				});
			};

			Promise.resolve ()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importProject(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});
};

var importAuthorizations = function(opts, data, startRow) {
	var ProjCtrl = new ProjectController(opts);

	return new Promise(function(resolve, reject) {

		var columnNames = ['name', 'title', 'link', 'introText', 'introHtml'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name: row.name,
				title: row.title,
				link: row.link,
				introText: row.introText,
				introHtml: row.introHtml
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
					links.push({ source: 'IMPORT', type: 'EXTERNAL_LINK', page: 'AUTHORIZATION', title: row.title, link: row.link});
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

			var importProject = function(row) {
				return new Promise(function(rs, rj) {

					Project.findOne ({name: row.name}, function (err, result) {
						if (err) {
							rj(err);
						}
						if (result === null) {
							console.log("Could not find project to update details: ", row.name);
							rs();
						} else {
							setValues(result, row);
							result.save().then(rs, rj);
						}
					});
				});
			};

			Promise.resolve ()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importProject(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});
};

var importMinesList = function(opts, data, startRow) {
	var ProjCtrl = new ProjectController(opts);

	return new Promise(function(resolve, reject) {

		var columnNames = ['name', 'introText', 'introHtml'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name: row.name,
				introText: row.introText,
				introHtml: row.introHtml
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
					content.push({ source: 'Import', type: 'OVERVIEW_INTRO_TEXT', page: 'MINES', title: 'Introduction', text: row.introText, html: _.isEmpty(row.introHtml) ? row.introText : row.introHtml});
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

			var importProject = function(row) {
				return new Promise(function(rs, rj) {
					var p = new Project();
					setValues(p, row);

					Project.findOne ({name: p.name}, function (err, result) {
						if (err) {
							rj(err);
						}
						if (result === null) {
							console.log("Could not find project to update details: ", p.name);
							rs();
						} else {
							setValues(result, row);
							result.save().then(rs, rj);
						}
					});
				});
			};

			Promise.resolve ()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importProject(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});
};

var importOtherDocuments = function(opts, data, startRow) {
	var ProjCtrl = new ProjectController(opts);
	var OrgCtrl = new OrganizationController(opts);
	var OdCtrl = new OtherDocumentsController(opts);

	return new Promise(function(resolve, reject) {

		var columnNames = ['name', 'agency', 'title', 'link', 'documentType', 'date'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name: row.name,
				agency: row.agency,
				title: row.title,
				link: row.link,
				documentType: row.documentType,
				date: row.date
			};
			//console.log('v1: obj = ', JSON.stringify(obj, null, 4));
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
				obj.source = 'Import';
				obj.title = row.title;
				obj.link = row.link;
				obj.documentType = row.documentType;
				obj.date = row.date;
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

			var importData = function(row) {
				var project, agency, doc;

				return new Promise(function(rs, rj) {
					ProjCtrl.findOne({name: row.name})
						.then(function(res) {
							if (res) {
								project = res;
								return OrgCtrl.findOne({name: row.agency});
							} else {
								console.log('Could not find project for other document.  ', row.name);
								rs();
							}
						})
						.then(function(res) {
							if (res) {
								agency = res;
								var q = {project: project, agency: agency, link: row.link};
								return OdCtrl.findOne(q);
							} else {
								console.log('Could not find agency for other document.  ', row.agency);
								rs();
							}
						})
						.then(function(res) {
							if (!res) {
								res = new OtherDocument();
							}
							setValues(res, row);
							res.project = project;
							res.agency = agency;
							res.save().then(rs, rj);
						});
				});
			};

			Promise.resolve ()
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

			resolve(importer(opts, data, startRow));

		});
	});
};
