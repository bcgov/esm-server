'use strict';

var request 				= require ('request');
var requestWithRetry 		= require('requestretry');
var csv 					= require('csv-parser');
var fs 						= require('fs');
var _ 						= require('lodash');
var https 					= require('https');
var TreeModel 				= require('tree-model');
var documentIDtoFolderName 	= [];
var folders 				= require('./folders.json');
var filesasfolders 			= require('./filesasfolders.json');
var labels 					= require('./labels.json');
var files 					= require('./files.json');
var projects;

var base = "http://localhost:3000";
var Cookie = "sessionId=";

console.log("Count of filesasfolders:", filesasfolders.length);
console.log("Count of folders:", folders.length);
console.log("Count of labels:", labels.length);
console.log("Count of files:", files.length);

Array.prototype.getIndexBy = function (name, value) {
	for (var i = 0; i < this.length; i++) {
		if (this[i][name] == value) {
			return i;
		}
	}
	return -1;
};

function addDownloadedObject(obj){
	var configFile = fs.readFileSync('./files_uploaded.json');
	var config = JSON.parse(configFile);
	config.push(obj);
	var configJSON = JSON.stringify(config);
	fs.writeFileSync('./files_uploaded.json', configJSON);
}
function checkIfExists(obj) {
	var configFile = fs.readFileSync('./files_uploaded.json');
	var arr = JSON.parse(configFile);
	if (_.indexOf(arr, obj) === -1) {
		return false;
	}
	return true;
}

function addErrorObject(obj){
	var configFile = fs.readFileSync('./errorObject.json');
	var config = JSON.parse(configFile);
	config.push(obj);
	var configJSON = JSON.stringify(config);
	fs.writeFileSync('./errorObject.json', configJSON);
}

var download = function(item, project) {
	console.log("Downloading:", item.projectFolderURL, "for project:", item.project_id);
	return new Promise(function (resolve, reject) {
		var url = item.projectFolderURL;
		var fname = item.projectFolderURL.replace(/\\/g, '/');
		var idx = fname.lastIndexOf('/');
		var dest = project.code + "/" + fname.substr(idx+1);

		// Check if directory exists.
		if (!fs.existsSync(project.code)) {
			console.log("Downloads dir does not exist. Creating...", project.code);
			fs.mkdirSync(project.code);
		}

		var url = "https://a100.gov.bc.ca/appsdata/epic/documents/" + fname;
		// console.log("getting:", url, "to:", dest);
		var file = fs.createWriteStream(dest);
		var request = https.get(url, function(response) {
			response.pipe(file);
			file.on('error', function(err) {
				console.log("ERROR:", err);
				// add the error object, however a reject will halt execution.
				addErrorObject(item);
				reject();
			});
			file.on('finish', function() {
				console.log("Download Complete.");
				file.close(function () {
					resolve(item);
				});
			});
		});
	});
};

var createFolder = function (project, parentNode, newNodeName) {
	return new Promise (function (resolve, reject) {
		requestWithRetry ({
			url				: base + '/api/project/' + project + '/directory/add/' + parentNode.model.id,
			method			: 'PUT',
			json			: {foldername: newNodeName},
			maxAttempts		: 25,
			retryDelay		: 5000,
			retryStrategy	: requestWithRetry.RetryStrategies.HTTPOrNetworkError,
			headers: {
				'User-Agent': 'request',
				'Cookie': Cookie
			}
		}, function (err, res, body) {
			if (err) {
				console.log (': Error adding directory.'+err);
				reject();
			} else if (res.statusCode != 200) {
				console.log ('-: '+res.statusCode+' '+body);
				reject();
			} else {
				console.log ('Directory Creation Complete.');
				// Figure out the node we created - walk until we get the node ID that was created.
				var tree = new TreeModel();
				var r = tree.parse(body);
				r.walk(function (node) {
					if (node.model.id === body.createdNodeId) {
						// console.log("created this:", node);
						resolve(node);
					}
				})
			}
		});
	});
}

var uploadFile = function(item) {
	return new Promise (function (resolve, reject) {
		console.log("Uploading to EPIC Project:", item.projectID);

		// Sanitize the header data:
		item.documentFileName = item.documentFileName.trim();
		item.documentFileName = item.documentFileName.replace(/\r?\n|\r/g, " ");

		console.log("uploading to:", base + '/api/document/'+item.project_id+'/upload');
		// console.log("uploading documentFileName:", item.documentFileName);
		// console.log("uploading projectFolderURL:", item.projectFolderURL);

		var fname = item.projectFolderURL.replace(/\\/g, '/');
		var idx = fname.lastIndexOf('/');
		var dest = item.project_code + "/" + fname.substr(idx+1);

		// console.log("------------------projectFolderDatePosted:", new Date(item.projectFolderDatePosted));
		// console.log("------------------projectFolderDateReceived:", new Date(item.projectFolderDateReceived));

		requestWithRetry ({
			url					: base + '/api/document/'+item.project_id+'/upload',
			method				: 'POST',
			maxAttempts			: 25,
			retryDelay			: 5000,
			retryStrategy		: requestWithRetry.RetryStrategies.HTTPOrNetworkError,
			headers: {
				'User-Agent': 'request',
				'Cookie'	: Cookie,

				"documentepicprojectid"	: item.projectID,
				"documentauthor"		: item.documentAuthor,
				"documentfilename"		: item.documentFileName,
				"olddata"				: item.oldData,
				"directoryid"			: item.keepTrackOfNodeToUse,
				"dateposted" 			: new Date(item.projectFolderDatePosted),
				"datereceived" 			: new Date(item.projectFolderDateReceived),

				// All documents are getting published automatically
				"publishafterupload"    : true,

				// Original references in old EPIC
				"documentfileurl"		: item.projectFolderURL,
				"documentfilesize"		: item.documentFileSize,
				"documentfileformat"	: item.documentFileFormat,
				"documentfileformat"	: item.documentFileFormat,
				"documentepicprojectid"	: item.projectID,
				"documentepicid"		: item.docId
			},
			formData: {
				file: fs.createReadStream(dest)
			}
		}, function (err, res, body) {
			if (err) {
				console.log (': Error adding blob.'+err);
				reject();
			} else if (res.statusCode != 200) {
				console.log ('-: '+res.statusCode+' '+body);
				reject();
			} else {
				console.log ('Uploading Complete.');
				fs.unlink(dest);
				// Record that we did this so we don't do it again
				addDownloadedObject(item.projectFolderURL);
				resolve(item);
			}
		});
});
};

function getProject(projectID) {
	return new Promise ( function (resolve, reject) {
		console.log("getting:", base + "/api/project/" + projectID);
		requestWithRetry({
			url				: base + "/api/project/" + projectID,
			json			: true,
			maxAttempts		: 25,
			retryDelay		: 5000,
			retryStrategy	: requestWithRetry.RetryStrategies.HTTPOrNetworkError
		}, function (err, response, body){
		  // this callback will only be called when the request succeeded or after maxAttempts or on error
		  if (response) {
			console.log('The number of request attempts: ' + response.attempts);
			if (response.attempts > 1) {
				console.log('**************************************: ' + response.attempts);
			}
			resolve(body);
		  }
		});
	});
};

function createDirectoryStructure(item) {
	return new Promise(function (resolve, reject) {
		console.log("createDirectoryStructure for EPIC ID:", item.projectID);
		if (item.docId)
			console.log("Processing docId:", item.docId);
		if (item.documentEPICId)
			console.log("Processing documentEPICId:", item.documentEPICId);

		var idx = projects.getIndexBy('epicProjectID', item.projectID);
		var theProject = projects[idx];
		// console.log("projects:", projects);
		console.log("theProject:", theProject._id);
		// iterate through each entry in the folders, and attempt to create the file strcture by
		// walking through the tree and calling add directory appropriately to the node.
		getProject(theProject._id)
		.then(function (p) {
			console.log("processing getProject:",p.code);
			var tree = new TreeModel();
			if (p.directoryStructure === null) {
				p.directoryStructure = {id: 1, name: 'ROOT', lastId: 1};
			}
			var root = tree.parse(p.directoryStructure);
			// console.log("item:", item);

			var firstFolder = item["1"].replace(/\r?\n|\r/g, " ").trim();
			var secondFolder = item["2"].replace(/\r?\n|\r/g, " ").trim();
			// When doing labels, this is always null.
			var item3 = item["3"];
			var thirdFolder = item3 === undefined ?  undefined : item3.replace(/\r?\n|\r/g, " ").trim();
			
			if (thirdFolder) {
				console.log("need to create directory structure:", firstFolder + "/" + secondFolder + "/" + thirdFolder);
			} else {
				console.log("need to create directory structure:", firstFolder + "/" + secondFolder);
			}
			var keepTrackOfNodeToUse = 0;

			var bFirstFolderNode, bSecondFolderNode, bThirdFolderNode;
			_.each(root.children, function (child) {
				// console.log("child:", child.model.name);
				if (child.model.name === firstFolder) {
					bFirstFolderNode = child;
					keepTrackOfNodeToUse = child.model.id;
					_.each(child.children, function (child2) {
						// console.log("child2:", child2);
						if (child2.model.name === secondFolder) {
							bSecondFolderNode = child2;
							keepTrackOfNodeToUse = child2.model.id;
							// Don't bother going through 3rd folder if we're not creating one.
							if (thirdFolder) {
								_.each(child2.children, function (child3) {
									// console.log("child3:", child3);
									if (child3.model.name === thirdFolder) {
										bThirdFolderNode = child2;
										keepTrackOfNodeToUse = child3.model.id;
									}
								});
							}
						}
					});
				}
			});
			if (!bFirstFolderNode) {
				// Create it, and then all subs
				console.log("creating structure from first folder");
				createFolder(p._id, root, firstFolder)
				.then(function (node) {
					console.log("newnode1:", node.model.name);
					return createFolder(p._id, node, secondFolder);
				})
				.then(function (node) {
					// Don't bother if no 3rd folder
					if (!thirdFolder) return node;
					console.log("newnode2:", node.model.name);
					return createFolder(p._id, node, thirdFolder);
				})
				.then(function (node) {
					// console.log("newnode3:", node.model.name);
					console.log("created id:", node.model.id);
					p.keepTrackOfNodeToUse = node.model.id;
					resolve(p);
				});
			} else if (!bSecondFolderNode) {
				console.log("creating structure from second folder");
				createFolder(p._id, bFirstFolderNode, secondFolder)
				.then(function (node) {
					// Don't bother if no 3rd folder
					if (!thirdFolder) return node;
					console.log("newnode2:", node.model.name);
					return createFolder(p._id, node, thirdFolder);
				})
				.then(function (node) {
					// console.log("newnode3:", node.model.name);
					console.log("created id:", node.model.id);
					p.keepTrackOfNodeToUse = node.model.id;
					resolve(p);
				});
			} else if (!bThirdFolderNode) {
				// Don't bother if no 3rd folder
				if (!thirdFolder) {
					// console.log("This was a label:",item.documentEPICId);
					p.keepTrackOfNodeToUse = keepTrackOfNodeToUse;
					resolve(p);
				} else {
					console.log("creating structure from third folder");
					createFolder(p._id, bSecondFolderNode, thirdFolder)
					.then( function (node) {
						console.log("created id:", node.model.id);
						p.keepTrackOfNodeToUse = node.model.id;
						resolve(p);
					});
				}
			} else {
				// All 3 dirs were created
				console.log("Directory was already created.");
				p.keepTrackOfNodeToUse = keepTrackOfNodeToUse;
				resolve(p);
			}
		});
});
}

// Get the project listing first.
// Get the objectID for the project in question.
var url = "";
request ({
	url    : base + "/api/project",
	method : 'GET'
}, function (err, res, body) {
	if (err) {
		console.log("error:",err);
		reject();  // TODO FIX
	} else if (res.statusCode != 200) {
		console.log("error:",err);
		reject();  // TODO FIX
	} else {
		console.log("200 OK.");
		projects = JSON.parse(body);
		var promises = [];
		_.each(filesasfolders, function (promise) {
			promises.push(promise);
		});
		_.each(folders, function (promise) {
			promises.push(promise);
		});
		_.each(labels, function (promise) {
			promises.push(promise);
		});
		_.each(files, function (promise) {
			promises.push(promise);
		});		
		Promise.resolve ()
		.then (function () {
			return promises.reduce (function (current, item) {
				return current.then (function () {
					// These ones have been merged into p286
					// NB: These projects have had their documents already uploaded into the newer project
					if (item.projectID === 38) return Promise.resolve();
					if (item.projectID === 404) return Promise.resolve();

					// This has been merged into p348
					// NB: These projects have had their documents already uploaded into the newer project
					if (item.projectID === 278) return Promise.resolve();
					// This has been merged into p6
					// NB: These projects have had their documents already uploaded into the newer project
					if (item.projectID === 345) return Promise.resolve();

					// The following were not actually projects, so safe to ignore.
					if (item.projectID === 20) return Promise.resolve();
					if (item.projectID === 53) return Promise.resolve();
					if (item.projectID === 60) return Promise.resolve();

					// Decision to be made yet.
					if (item.projectID === 444) return Promise.resolve();
					if (item.projectID === 445) return Promise.resolve();
					if (item.projectID === 446) return Promise.resolve();
					if (item.projectID === 447) return Promise.resolve();
					if (item.projectID === 448) return Promise.resolve();
					if (item.projectID === 449) return Promise.resolve();
					if (item.projectID === 450) return Promise.resolve();
					if (item.projectID === 451) return Promise.resolve();
					if (item.projectID === 452) return Promise.resolve();
					if (item.projectID === 453) return Promise.resolve();

					// Skip already completed from prior upload
					if (item.projectFolderURL && checkIfExists(item.projectFolderURL)) return Promise.resolve();

					// For formatting output
					console.log("");
					return createDirectoryStructure(item)
					.then(function (project) {
						// console.log("-------------------------------:", project.keepTrackOfNodeToUse);
						// Save this
						item.project_id = project._id;
						item.project_code = project.code;
						item.keepTrackOfNodeToUse = project.keepTrackOfNodeToUse;

						// Determine if there's a file to upload (non-digitized formats will be dealt with later)
						if (item.projectFolderURL && item.projectFolderURL !== 'DEFAULTPDF') {
							return download(item, project);
						} else {
							// This wasn't a file to download
							return Promise.resolve();
						}
					})
					.then(function (dl) {
						// update the DB for the downloaded item.
						if (dl) {
							console.log("downloaded:", dl.projectFolderURL, "for project:", dl.project_id);
							// Now upload it.
							return uploadFile(dl);
						}
						return Promise.resolve();
					})
					.then(function (uploaded) {
						if (uploaded) {
							console.log("uploaded:", uploaded.projectFolderURL);
						}
						return Promise.resolve();
					});
				});
			}, Promise.resolve());
		});
	}
});

