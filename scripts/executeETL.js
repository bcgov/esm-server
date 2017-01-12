'use strict';

var Promise 				= require('es6-promise').Promise;
var request 				= require ('request');
var requestWithRetry 		= require('requestretry');
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
var specificProject = process.argv[4];

var DOWNLOAD_ONLY = true;
var UPLOAD_ONLY = false;

var action = process.argv[2];
if (action === 'upload') {
	console.log("---------uploading");
	DOWNLOAD_ONLY = false;
	UPLOAD_ONLY = true;
} else if (action === 'download') {
	console.log("---------downloading");
} else {
	console.log("wrong arguments.");
	return;
}

// Second argument is the filename to use for importing (files.json by default)
var filenameimport = process.argv[3];
files = require("./" + filenameimport);

// Third argument is projectID to process
if (specificProject) {
	console.log("Processing specific project:", specificProject);
	specificProject = parseInt(specificProject, 10);
}

//require('events').EventEmitter.prototype._maxListeners = 100;


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

function addUploadedObject(obj){
	var configFile = fs.readFileSync('./files_uploaded.json');
	var config = JSON.parse(configFile);
	config.push(obj);
	var configJSON = JSON.stringify(config);
	fs.writeFileSync('./files_uploaded.json', configJSON);
}
function addDownloadedObject(obj){
	var configFile = fs.readFileSync('./files_downloaded.json');
	var config = JSON.parse(configFile);
	config.push(obj);
	var configJSON = JSON.stringify(config);
	fs.writeFileSync('./files_downloaded.json', configJSON);
}
function checkIfExistsDown(obj) {
	var configFile = fs.readFileSync('./files_downloaded.json');
	var arr = JSON.parse(configFile);
	if (_.indexOf(arr, obj) === -1) {
		return false;
	}
	return true;
}
function checkIfExistsUp(obj) {
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
function addErrorObjectUp(obj){
	var configFile = fs.readFileSync('./errorObjectUp.json');
	var config = JSON.parse(configFile);
	config.push(obj);
	var configJSON = JSON.stringify(config);
	fs.writeFileSync('./errorObjectUp.json', configJSON);
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
		url = url.replace("https://a100.gov.bc.ca", "http://142.34.222.76");
		console.log("getting:", url, "to:", dest);
		var file = fs.createWriteStream(dest);
		request({    url: url,
                            headers: {
                                'Host': 'a100.gov.bc.ca'
                            }
                        })
	    .on('data', function (chunk) {
	        file.write(chunk);
	    })
	    .on('error', function(err) {
	        console.log("-----------------ERROR:", err);
	        // add the error object, however a reject will halt execution.
	        addErrorObject(item);
	        resolve();
	    })
	    .on('end', function() {
	        console.log("Download Complete.");
	        file.close(function () {
	  	    addDownloadedObject(item.projectFolderURL);
	            console.log("done");
	            resolve(item);
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
		item.documentFileName = item.documentFileName.replace(/\'/g, "");
		//item.documentFileName = item.documentFileName.replace("�", "e");
		//item.documentFileName = item.documentFileName.replace("í", "i");
		//item.documentFileName = item.documentFileName.replace("�", "a");


		console.log("uploading to:", base + '/api/document/'+item.project_id+'/upload');
		// console.log("uploading documentFileName:", item.documentFileName);
		// console.log("uploading item:", item);

		var fname = item.projectFolderURL.replace(/\\/g, '/');
		var idx = fname.lastIndexOf('/');
		var dest = item.project_code + "/" + fname.substr(idx+1);

		// console.log("------------------projectFolderDatePosted:", new Date(item.projectFolderDatePosted));
		// console.log("------------------projectFolderDateReceived:", new Date(item.projectFolderDateReceived));

		console.log("uploading about to start");
		var formData = {
			file: fs.createReadStream(dest),
			documentfilename: item.documentFileName,
			documentauthor		: item.documentAuthor,
			olddata				: item.oldData,
			directoryid			: item.keepTrackOfNodeToUse,
			documentfileurl		: item.projectFolderURL,
			documentfilesize		: item.documentFileSize,
			documentfileformat	: item.documentFileFormat,
			documentepicprojectid	: item.projectID,
			documentepicid		: item.docId
		};

		request.post({ url                             : base + '/api/document/'+item.project_id+'/upload',
                        method                          : 'POST',
                //      maxAttempts                     : 25,
                //      retryDelay                      : 500,
                        //retryStrategy         : requestWithRetry.RetryStrategies.HTTPOrNetworkError,
                        headers: {
                                'User-Agent': 'request',
                                'Cookie'        : Cookie,
                                dateposted                      : new Date(item.projectFolderDatePosted),
                                datereceived                    : new Date(item.projectFolderDateReceived),
                                publishafterupload    : true
                        }, formData: formData}, function optionalCallback(err, httpResponse, body) {
		  if (err) {
		    console.error('upload failed:', err);
		    addErrorObjectUp(item);
			resolve();
		  } else {
		  	console.log('Upload successful!');
			addUploadedObject(item.projectFolderURL);
		  	//fs.unlink(dest);
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
		// _.each(filesasfolders, function (promise) {
		// 	promises.push(promise);
		// });
		// _.each(folders, function (promise) {
		// 	promises.push(promise);
		// });
		// _.each(labels, function (promise) {
		// 	promises.push(promise);
		// });
		_.each(files, function (promise) {
			if (specificProject) {
				if (promise.projectID === specificProject) {
					promises.push(promise);
				}
			} else {
				promises.push(promise);
			}
		});		
		Promise.resolve (1)
		.then (function () {
			return promises.reduce (function (current, item) {
				return current.then (function () {
					// console.log("i:",item.projectFolderURL);
					item.documentFileName = item.documentFileName.trim();
					item.documentFileName = item.documentFileName.replace(/\r?\n|\r/g, " ");
					item.documentFileName = item.documentFileName.replace(/\'/g, "");

					// These ones have been merged into p286
					// NB: These projects have had their documents already uploaded into the newer project
					if (item.projectID === 38) return Promise.resolve(1);
					if (item.projectID === 404) return Promise.resolve(1);

					// This has been merged into p348
					// NB: These projects have had their documents already uploaded into the newer project
					if (item.projectID === 278) return Promise.resolve(1);
					// This has been merged into p6
					// NB: These projects have had their documents already uploaded into the newer project
					if (item.projectID === 345) return Promise.resolve(1);

					// The following were not actually projects, so safe to ignore.
					if (item.projectID === 20) return Promise.resolve(1);
					if (item.projectID === 53) return Promise.resolve(1);
					if (item.projectID === 60) return Promise.resolve(1);

					// Decision to be made yet.
					if (item.projectID === 444) return Promise.resolve(1);
					if (item.projectID === 445) return Promise.resolve(1);
					if (item.projectID === 446) return Promise.resolve(1);
					if (item.projectID === 447) return Promise.resolve(1);
					if (item.projectID === 448) return Promise.resolve(1);
					if (item.projectID === 449) return Promise.resolve(1);
					if (item.projectID === 450) return Promise.resolve(1);
					if (item.projectID === 451) return Promise.resolve(1);
					if (item.projectID === 452) return Promise.resolve(1);
					if (item.projectID === 453) return Promise.resolve(1);

					// Skip already completed from prior upload
					if (DOWNLOAD_ONLY) {
						if (item.projectFolderURL && checkIfExistsDown(item.projectFolderURL)) {
							console.log("already downloaded: ", item.projectFolderURL);
							return Promise.resolve(1);	
						}
					} else if (UPLOAD_ONLY) {
						if (item.projectFolderURL && checkIfExistsUp(item.projectFolderURL)) {
							console.log("already uploaded: ", item.projectFolderURL);
							return Promise.resolve(1);	
						}
					}

					// For formatting output
					console.log("name:",item.documentFileName);
					console.log("");
					return createDirectoryStructure(item)
					.then(function (project) {
						// console.log("-------------------------------:", project.keepTrackOfNodeToUse);
						// Save this
						item.project_id = project._id;
						item.project_code = project.code;
						item.keepTrackOfNodeToUse = project.keepTrackOfNodeToUse;

						if (!DOWNLOAD_ONLY) return item;

						// Determine if there's a file to upload (non-digitized formats will be dealt with later)
						if (item.projectFolderURL && item.projectFolderURL !== 'DEFAULTPDF') {
							return download(item, project);
						} else {
							// This wasn't a file to download
							return Promise.resolve(1);
						}
					})
					.then(function (dl) {
						// update the DB for the downloaded item.
						if (dl && UPLOAD_ONLY) {
							console.log("uploading:", dl.projectFolderURL, "for project:", dl.project_id);
							// Now upload it.
							return uploadFile(dl);
						}
						return Promise.resolve(1);
					})
					.then(function (uploaded) {
						if (uploaded) {
							console.log("uploaded:", uploaded.projectFolderURL);
							console.log("Document Name:", uploaded.documentFileName);
							console.log("-------------------------------------------------");
						}
						return Promise.resolve(1);
					});
				});
			}, Promise.resolve(1));
		});
	}
});

