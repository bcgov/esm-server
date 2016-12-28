'use strict';
var _                = require ('lodash'),
	fs               = require ('fs'),
	path             = require ('path'),
	mongoose         = require ('mongoose'),
	Organization     = mongoose.model('Organization'),
	OrganizationCtrl = require (path.resolve('./modules/organizations/server/controllers/organization.controller')),
	CSVParse         = require ('csv-parse'),
	crypto           = require ('crypto'),
	errorHandler     = require (path.resolve('./modules/core/server/controllers/errors.server.controller'));


var access = require(path.resolve('./modules/core/server/controllers/core.access.controller'));

// Import a list of users
exports.loadOrgs = function(file, req, res, opts) {
	var OrgCtrl = new OrganizationCtrl(opts);

	return new Promise (function (resolve, reject) {
		// Now parse and go through this thing.
		fs.readFile(file.path, 'utf8', function(err, data) {
			if (err) {
				reject("{err: "+err);
			}


			var v1ColArray = ['NAME', 'DISPLAY_NAME','COMPANY_LEGAL','COMPANY_TYPE','REGISTERED_IN','WEBSITE','ADDRESS_1','ADDRESS_2','CITY','PROVINCE','COUNTRY','POSTAL','PARENT_COMPANY','DESCRIPTION'];
			var v1RowToObject = function(row) {
				// console.log('v1: row = ', row);
				var obj = {
					name          : row.NAME,
					company       : row.DISPLAY_NAME,
					companyLegal  : row.COMPANY_LEGAL,
					companyType   : row.COMPANY_TYPE,
					registeredIn  : row.REGISTERED_IN,
					website       : row.WEBSITE,
					address1      : row.ADDRESS_1,
					address2      : row.ADDRESS_2,
					city          : row.CITY,
					province      : row.PROVINCE,
					country       : row.COUNTRY,
					postal        : row.POSTAL,
					parentCompany : row.PARENT_COMPANY,
					description   : row.DESCRIPTION

				};
				// console.log('v1: obj = ', JSON.stringify(obj, null, 4));
				return obj;
			};

			var lines = data.split(/\r\n|\r|\n/g);
			// console.log('File line count =  ', _.size(lines));
			var v1 = _.size(lines) === 0 ? true : (lines[0].match(/,/g).length === v1ColArray.length-1);
			//console.log('File v1? ', v1);
			var colArray = v1 ? v1ColArray : undefined;
			var rowParser = v1 ? v1RowToObject : undefined;

			if (colArray === undefined) {
				//console.log('Unknown file import version.');
				reject("{err: 'Unknown file import version.'}");
			} else {
				var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
					// Skip this many rows
					var length = Object.keys(output).length;
					var promises = [];
					// console.log("length",length);
					Object.keys(output).forEach(function(key, index) {
						if (index > 0) {
							var row = output[key];
							promises.push(rowParser(row));
						}
					});

					var doOrgWork = function(item) {
						return new Promise(function(rs, rj) {
							// console.log("item:", item);
							if (item.name === '') {
								// console.log("resolving nothing for org, it was null.");
								rs(null);
							} else {
								Organization.findOne ({name: item.name}, function (err, result) {
									if (result === null) {
										// console.log("Creating org:", item.name);
										// Create it
										var o = new Organization(item);
										OrgCtrl.create(o).then (rs, rj);
									} else {
										// console.log("found the org:", result.name);
										rs(result);
									}
								});
							}
						});
					};

					Promise.resolve ()
						.then (function () {
							return promises.reduce (function (current, item) {
								return current.then (function () {
									return doOrgWork(item);
								});
							}, Promise.resolve());
						})
						.then (resolve, reject);
				});
			}

		});
	});
};


