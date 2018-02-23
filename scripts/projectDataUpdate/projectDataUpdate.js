'use strict';
var fs = require('fs');
var argv = require('argv');
var csv = require('csvtojson');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var _ = require('lodash');
var ArgumentParser = require('argparse').ArgumentParser;

var url = 'mongodb://localhost:27017/esm';

var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: "Welcome to populate.js!\n"
   + "This script is used to update the mongo database for EPIC/MEM projects depending on where it's "
   + "run from. If you want to upload new data to projects, or update existing data, make sure to use "
   + "the script's 'generate' function to create a new csv. This will copy all the names of the projects "
   + "exactly for easy uploading. Only add one column to the generated csv, and be sure to name the "
   + "header with the exact data field name you want to update/create. Also, when uploading, be sure "
   + "to specify the type of data you are uploading, as detailed below.\n"
});
parser.addArgument(
  ['-g', '--generate'],
  {
    nargs: 0,
    help: 'Generates a csv with the names of all projects in column A. Be sure to include the '
    + 'filename argument.\n '
  }
);
parser.addArgument(
  ['-u', '--update'],
  {
    nargs: 0,
    help: 'Updates the database with the contents of the csv, using "name" as the project identifier. '
    + 'Be sure to include the filename argument, as well as the data type being uploaded.\nNOTE: if '
    + 'a cell in column B (input column) is left blank, the field will be populated with null/0/empty '
    + 'string.\n'
  }
);
parser.addArgument(
  ['-f', '--file'],
  {
    nargs: 1,
    required: true,
    help: 'Specifies the name of the csv file to be uploaded (with --update) or created (with --generate). '
    + 'If uploading, ensure the csv was created from the --generate command so that project names match up.\n'
  }
);
parser.addArgument(
  ['-t', '--type'],
  {
    nargs: 1,
    choices: ['string', 'bool', 'date', 'int', 'float'],
    help: 'Specifies the data type being uploaded. Not applicable when generating a csv file.\n'
    + 'NOTE: if inputting a date, format must be yyyy-mm-dd.'
  }
)
var args = parser.parseArgs();
var filename = args.file[0];

//Logic to determine program function based on arguments
if ((args.generate && args.update) || (!args.generate && !args.update)) {
  console.log('Error: please specify ONE of update(-u) or generate(-g), or specify help(-h) for help.');
  process.exit();
} else if (args.generate) {
  dbCreateList();
  console.log('Creating csv file: ' + filename);
} else if (args.update) {
  if (!args.type) {
    console.log('Error: please specify a data type(-t) when uploading data, or specify help(-h) for help.');
    process.exit();
  } else {
    var stream = fs.createReadStream(filename);
    var data = [];
    var type = args.type[0];
    tokenize_csv(stream, data, type).then(function(success) {
      dbUpdate(data);
    }).catch(function(error) {
      console.log('One or more error(s) occured.');
      process.exit();
    });
  }
}

//Retrieve data from csv file, and store in the 'data' array
function tokenize_csv (stream, data, type) {
  return new Promise(function(resolve, reject) {
    //Create variable to store name of new data field
    var keyName;
    csv().fromStream(stream)
    .on('json', (token) => {
      keyName = Object.keys(token)[1];
      //Process differs depending on data type being uploaded.
      switch(type) {
        case 'string':
          data.push(token);
          break;
        case 'bool':
          if (token[keyName].toLowerCase() == 'true' || token[keyName].toLowerCase() == 't') {
            token[keyName] = true;
          } else if (token[keyName].toLowerCase() == 'false' || token[keyName].toLowerCase() == 'f' || !token[keyName].length){
            token[keyName] = false;
          } else {
            console.log("Error: " + token.name + " does not contain valid boolean input.");
            reject();
          }
          data.push(token);
          break;
        case 'date':
          if (token[keyName].length) {
            var dt = _.split(token[keyName], '-');
            token[keyName] = new Date(dt[0], dt[1]-1, dt[2]);
            if (token[keyName].toString() == 'Invalid Date') {
              console.log("Error: " + token.name + " does not contain valid date string.");
              reject();
            }
          } else {
            token[keyName] = null;
          }
          data.push(token);
          break;
        case 'int':
          if (token[keyName].length) {
            token[keyName] = parseInt(token[keyName], 10);
            if (token[keyName] == NaN) {
              console.log("Error: " + token.name + " does not contain a valid Int.");
              reject();
            }
          } else {
            token[keyName] = 0;
          }
          data.push(token);
          break;
        case 'float':
          if (token[keyName].length) {
            token[keyName] = parseFloat(token[keyName]);
            if (token[keyName] == NaN) {
              console.log("Error: " + token.name + " does not contain a valid Float.");
              reject();
            }
          } else {
            token[keyName] = 0.0;
          }
          data.push(token);
          break;
      }
    })
    .on('done', () => {
      console.log('Successfully tokenized ' + filename);
      resolve(':)');
    })
  });
  
}

//Create a new project data field or update an existing one
function dbUpdate () {
  return new Promise (function (resolve, reject) {
    MongoClient.connect(url, (err, client) => {
      if (err) {
        return reject(err);
      }
      var collection = client.collection('projects');
      var number_updated = 0;
      var count = collection.find({}).count()
      .then(function(count) {
        collection.find({},{name: 1, _id: 1}).sort({name: 1}).forEach(function(document) {
          //Examine each project in the collection, as a 'document'
          if (!document) {
            console.log('Error: received erroneous data from database');
            return reject();
          } else if (!document.name) {
            console.log('Error: nameless document found with _id: ' + document._id);
            return reject();
          }
          //Cross-reference document with csv file
          var foundObject = _.find(data, function(o) {
            return (o.name == document.name.trim());
          });
          //If document was in csv file, update it with csv data
          if(foundObject) {
            number_updated++;
            collection.update({
              _id: document._id
            }, {
              $set: foundObject
            }, function(err, result) {
              if (err) return reject(err);
            })
          } else {
            console.log('Could not find: ' + document.name + '. It will not be updated.');
          } 
        }, function(err) {
          client.close();
          console.log('Finished updating. Projects updated: ' + number_updated + ' of ' + count);
          return resolve(data);
        })
      })      
    });
  });
}

//Create a new csv file containing the exact string literals of all project names
function dbCreateList () {
  return new Promise (function (resolve, reject) {
    MongoClient.connect(url, (err, client) => {
      if (err) {
        return reject(err);
      }
      var collection = client.collection('projects');
      var count = collection.find({}).count()
      .then(function(count) {
        collection.find({},{name: 1, _id: 1}).sort({name: 1}).forEach(function(document) {
          //Examine each project in the collection, as a 'document'
          if (!document) {
            console.log('Error: received erroneous data from database');
            return reject();
          } else if (!document.name) {
            console.log('Error: nameless document found with _id: ' + document._id);
          }
          //Append document names to new csv file
          fs.appendFile(filename, document.name + ',\n', function(err) {
            if (err) console.log(err);
          })
        }, function(err) {
          client.close();
          return resolve();
        })
      })      
    });
  });
}
