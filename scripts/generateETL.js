'use strict';

var request 				= require ('request');
var csv 					= require('csv-parser');
var fs 						= require('fs');
var _ 						= require('lodash');
var directories 			= [];
var docfiles 				= [];
var labels 					= [];
var documentIDtoFolderName 	= [];
var documentIDFile 			= require('./folders.json');

var filesasfolders 			= [];
var filesasfoldersobj 		= [];

// Implement getIndexBy
Array.prototype.getIndexBy = function (name, value) {
	for (var i = 0; i < this.length; i++) {
		if (this[i][name] == value) {
			return i;
		}
	}
	return -1;
};

function writeObjUnique(obj, name){
	var uniques = _.uniqWith(obj, _.isEqual);
	var newFile = JSON.stringify(uniques);
	fs.writeFileSync(name, newFile);
}
function writeObj(obj, name){
	var newFile = JSON.stringify(obj);
	fs.writeFileSync(name, newFile);
}
// Lookups
var firstLookups = {
	"A": "Certificate Issued",
	"B": "Certificate Refused",
	"C": "Pre-EA",
	"D": "Decision",
	"E": "Projects that do not require an EA certificate",
	"F": "Certificate Extension",
	"G": "Further Assessment",
	"H": "Compliance Documentation",
	"I": "Certificate Expired",
	"K": "Amendments",
	"P": "Pre-Application",
	"R": "Under Review",
	"T": "Terminated",
	"W": "Withdrawn"
};
var secondLookups = {
	"ABO": "Aboriginal Comments/Submissions",
	"AMA": "Amendment - Application",
	"ATB": "Amendment - Barging - Tulsequah",
	"WNC": "Amendment - Legacy Trails - WNC",
	"ARO": "Amendment - Road Option - Tulsequah",
	"AMD": "Amendment Certificate",
	"YAA": "Amendment to Certificate Documentation",
	"APP": "Application and Supporting Studies",
	"TOR": "Application Terms of Reference/Information Requirements",
	"Q01": "Certificate Decision 2015",
	"CEX": "Certificate Extension",
	"CID": "Certificate Issued",
	"CAG": "Community Advisory Group",
	"COP": "Compendium: Agency Comments / Proponent Responses",
	"CPP": "Compendium: Public Comments / Proponent Responses",
	"CIR": "Compliance Inspection Reports",
	"CRR": "Compliance Reports/Reviews",
	"CPM": "Concurrent Permitting",
	"CMA": "Consent for Material Alteration",
	"DIS": "Discussion Papers",
	"GAR": "Draft - Application/Supporting Studies",
	"WAA": "EA Certificate Documentation",
	"COM": "EAO Generated Documents",
	"EDR": "Executive Director Review",
	"FED": "Federal Comments/Submissions",
	"FPR": "Final Panel Report",
	"FAR": "Further Assessment",
	"GCD": "General Consultation Documents",
	"GTD": "General Technical Documents",
	"LOC": "Local Government Comments/Submissions",
	"MNO": "Ministerial Order",
	"NEW": "Notices - News Releases",
	"OJC": "Other Jurisdictions Comments/Submissions",
	"PAN": "Panel",
	"PAR": "Panel - Proponent EIA Report",
	"XAA": "Post Certificate Documentation",
	"ABC": "Pre Application Documents",
	"PRO": "Proponent Comments/Correspondence",
	"PGA": "Provincial Govt Comments/Submissions",
	"PAC": "Public Advisory Committee Generated Docs",
	"PUB": "Public Comments/Submissions",
	"ZZZ": "Review Committee - Public Submissions",
	"SSD": "Substantially Started Documentation"
};

var doWork = function (option) {
	fs.createReadStream('importFile.csv')
	.pipe(csv())
	.on('data', function (data) {
		if (option === 'filesasfolders') {
			if (data['Line Type'] === 'File') {
				// we are looking for duplicate DOCUMENT_ID's where the line type was File.  This will require
				// multiple passes.
				var docId = parseInt(data.DOCUMENT_ID.replace(',', ''));
				// console.log("docid: ", docid);

				// Only push it if it's not already in the folders file.
				var folderNameIdx;
				_.each(documentIDFile, function (data, idx) { 
					if (_.isEqual(data.docId, docId)) {
						folderNameIdx = idx;
						return;
					}
				});

				if (folderNameIdx === undefined) {
					var projectID = parseInt(data.PROJECT_ID);
					var rootFolder = firstLookups[data.PROJECT_STATUS_CD.toUpperCase()];
					var secondFolder = secondLookups[data.DOCUMENT_TYPE_CD.toUpperCase()];
					var thirdFolder = data.DESCRIPTION;

					// This makes the 1, 2, 3 folder entries.
					var obj = {	projectID: projectID,
						docId: docId,
						1: rootFolder,
						2: secondFolder,
						3: thirdFolder};
					if (rootFolder !== undefined) {
						filesasfoldersobj.push(obj);
					}
					filesasfolders.push(docId);
				}
			}
		} else if (option === 'Folder' && data['Line Type'] === 'Folder') {
			var folderID = parseInt(data.DOCUMENT_ID.replace(',',''));
			// console.log('DOCUMENT_ID: %s', folderID);
			if (data.PROJECT_STATUS_CD ==='x') {
				console.log("skipping X");
				return;
			}
			var projectID = parseInt(data.PROJECT_ID);
			var docID = parseInt(data.DOCUMENT_ID.replace(',', ''));
			
			// If we choose to keep old epic structure in tact.
			var rootFolder = firstLookups[data.PROJECT_STATUS_CD.toUpperCase()];
			var secondFolder = secondLookups[data.DOCUMENT_TYPE_CD.toUpperCase()];
			var thirdFolder = data.DESCRIPTION;

			// This makes the 1, 2, 3 folder entries.
			var obj = {	projectID: projectID,
				docId: docID,
				1: rootFolder,
				2: secondFolder,
				3: thirdFolder };
			// console.log(obj);
			directories.push(obj);
		} else if (option === 'Label' && data['Line Type'] === 'Label') {
			// Just a label - document doesn't exist!
			var docId = parseInt(data.DOCUMENT_ID.replace(',', ''));
			// TODO: Make this reference a generic document
			var newObj = {
				projectID 	: parseInt(data.PROJECT_ID),

				// Here for historical reference only.
				documentEPICId 			: docId,
				// var rootFolder = firstLookups[data.PROJECT_STATUS_CD.toUpperCase()];
				// var secondFolder = secondLookups[data.DOCUMENT_TYPE_CD.toUpperCase()];
				// var thirdFolder = data.DESCRIPTION;

				1 : firstLookups[data.PROJECT_STATUS_CD.toUpperCase()],
				2 : secondLookups[data.DOCUMENT_TYPE_CD.toUpperCase()],
				
				// There are no foldernames for labelled files.  They all exist within first or second folder
				// projectFolderName       : documentIDFile[folderNameIdx],
				// This is the location it existed in old EPIC
				projectFolderURL 		: "DEFAULTPDF",
				projectFolderDatePosted : new Date(data.DATE_POSTED),
				projectFolderDateReceived : new Date(data.DATE_RECEIVED),
				documentFileName 		: data.DESCRIPTION,
				// documentFileURL 		: URLPrefix + data.DOCUMENT_POINTER.replace(/\\/g,"/"),
				documentFileSize 	: data.FILE_SIZE,
				documentFileFormat 	: data.FILE_TYPE.toLowerCase(),
				documentAuthor 		: data.WHO_CREATED,
				oldData 			: JSON.stringify({DATE_RECEIVED: data.DATE_RECEIVED,
					ARCS_ORCS_FILE_NUMBER: data.ARCS_ORCS_FILE_NUMBER,
					WHEN_CREATED: data.WHEN_CREATED,
					WHO_UPDATED: data.WHO_UPDATED,
					WHEN_UPDATED: data.WHEN_UPDATED})
			};
			labels.push(newObj);
			// console.log("newObj:", newObj);
		} else if (option === 'File' && data['Line Type'] === 'File') {

			// This is a file, do something with it.
			var docId = parseInt(data.DOCUMENT_ID.replace(',', ''));
			// console.log("docid:", docId);

			var folderNameIdx;
			_.each(documentIDtoFolderName, function (data, idx) { 
				if (_.isEqual(data.docId, docId)) {
					folderNameIdx = idx;
					return;
				}
			});

			var rootFolder, secondFolder, thirdFolder;

			if (data.PROJECT_STATUS_CD.toUpperCase() !== 'N/A') {
				rootFolder = firstLookups[data.PROJECT_STATUS_CD.toUpperCase()];
				secondFolder = secondLookups[data.DOCUMENT_TYPE_CD.toUpperCase()];
				thirdFolder = data.DESCRIPTION;
			} else {
				// we should look it up against the docId in folders, or filesasfolders
				console.log("docId:", docId);
				// console.log("a:", documentIDtoFolderName[folderNameIdx]);
				rootFolder = documentIDtoFolderName[folderNameIdx]["1"];
				secondFolder = documentIDtoFolderName[folderNameIdx]["2"];
				thirdFolder = documentIDtoFolderName[folderNameIdx]["3"];
			}

			var newObj = {
				projectID 	: parseInt(data.PROJECT_ID),

				// Here for historical reference only.
				docId 			: docId,

				// If it belongs in folders, then folderNameIdx lookup will resolve,
				// otherwise, it will exist in first, second, and description.
				1: rootFolder,
				2: secondFolder,
				3: thirdFolder,

				// Leverage documentIDFile as it was pre-processed during the folder pass
				// projectFolderName       : (folderNameIdx !== undefined) ? documentIDtoFolderName[folderNameIdx].descrition : data.DESCRIPTION,
				// This is the location it existed in old EPIC
				projectFolderURL 		: data.DOC_PTR,
				projectFolderDatePosted : new Date(data.DATE_POSTED),
				projectFolderDateReceived : new Date(data.DATE_RECEIVED),
				documentFileName 		: data.DESCRIPTION,
				// documentFileURL 		: URLPrefix + data.DOCUMENT_POINTER.replace(/\\/g,"/"),
				documentFileSize 	: data.FILE_SIZE,
				documentFileFormat 	: data.FILE_TYPE.toLowerCase(),
				documentAuthor 		: data.WHO_CREATED,
				oldData 			: JSON.stringify({DATE_RECEIVED: data.DATE_RECEIVED,
					ARCS_ORCS_FILE_NUMBER: data.ARCS_ORCS_FILE_NUMBER,
					WHEN_CREATED: data.WHEN_CREATED,
					WHO_UPDATED: data.WHO_UPDATED,
					WHEN_UPDATED: data.WHEN_UPDATED})
			};
			docfiles.push(newObj);
			// console.log("newObj:", newObj);
		}
	})
	.on('end', function () {
		switch(option) {
			case "Folder":
			console.log("writing directories:",directories.length);
			// console.log("writing documentIDtoFolderName:",documentIDtoFolderName.length);
			writeObjUnique(directories, './folders.json');
			// writeObj(documentIDtoFolderName, './documentidfolders.json');
			break;
			case "File":
			console.log("writing files:",docfiles.length);
			writeObj(docfiles, './files.json');
			break;
			case "Label":
			console.log("writing labels",labels.length);
			writeObj(labels, './labels.json');
			break;
			case "filesasfolders":
			var trans = _.transform(_.countBy(filesasfolders),
				function (result, count, value) {
					if (count > 1) {
						result.push(value);
					}
				},
				[]
				);
			console.log("writing filesasfolders",trans.length);
			var newObj = [];
			_.each(trans, function (i) {
					// console.log("i:", i);
					var idx = filesasfoldersobj.getIndexBy('docId', i);
					if (idx) {
					// console.log("idx:", filesasfoldersobj[idx]);
					newObj.push(filesasfoldersobj[idx]);
				} else {
					console.log(":", i);
				}
			});
			console.log("writing newObj",newObj.length);
			writeObj(newObj, './filesasfolders.json');
			break;
		}
	});
};

var args = process.argv.slice(2);
console.log("args passed:", args);
if (args.length === 1) {
	switch(args[0]) {
		case "folders":
			doWork("Folder");
		break;
		case "labels":
			doWork("Label");
		break;
		case "files":
			// First combine the two folder/filesasfolders json blobs.
			var f = require('./folders.json');
			var faf = require('./filesasfolders.json');
			_.each(f, function (i) {
				documentIDtoFolderName.push(i);
			});
			_.each(faf, function (i) {
				documentIDtoFolderName.push(i);
			});
			doWork("File");
		break;
		case "filesasfolders":
			doWork("filesasfolders");
		break;
	}
} else {
	console.log("--------------------------------------------------------------------------");
	console.log("Generate ETL script examples.");
	console.log("The options should be run in order.");
	console.log("--------------------------------------------------------------------------");
	console.log("Usage: node generateETL [option]");
	console.log("");
	console.log("");
	console.log("Options:");
	console.log("");
	console.log("folders            generates folders.json, process items labelled as folders.");
	console.log("filesasfolders     generates filesasfolders.json, process items labelled as files, but are really folders.");
	console.log("labels             generates labels.json, process items labelled as labels");
	console.log("files              generates files.json, process items labelled as files.");
}

