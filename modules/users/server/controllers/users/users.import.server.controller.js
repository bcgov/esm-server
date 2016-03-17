'use strict';

/**
 * Module dependencies.
 */
var _             = require ('lodash'),
    fs            = require ('fs'),
    path          = require ('path'),
    mongoose      = require ('mongoose'),
    User          = mongoose.model('User'),
    CSVParse      = require ('csv-parse'),
    crypto        = require ('crypto'),
    Project       = mongoose.model ('Project'),
    GroupModel    = mongoose.model ('Group'),
    errorHandler  = require (path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

// Import a list of users
exports.loadUsers = function(file, req, res) {
  return new Promise (function (resolve, reject) {
    // Now parse and go through this thing.
    fs.readFile(file.path, 'utf8', function(err, data) {
      if (err) {
        reject("{err: "+err);
      }
      // console.log("FILE DATA:",data);
      var colArray = ['PERSON_ID','EAO_STAFF_FLAG','PROPONENT_FLAG','SALUTATION','FIRST_NAME','MIDDLE_NAME','LAST_NAME','TITLE','ORGANIZATION_NAME','DEPARTMENT','EMAIL_ADDRESS','PHONE_NUMBER','HOME_PHONE_NUMBER','FAX_NUMBER','CELL_PHONE_NUMBER','ADDRESS_LINE_1','ADDRESS_LINE_2','CITY','PROVINCE_STATE','COUNTRY','POSTAL_CODE','NOTES'];
      var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
        // Skip this many rows
        var length = Object.keys(output).length;
        var rowsProcessed = 0;
        // console.log("length",length);
        Object.keys(output).forEach(function(key, index) {
          if (index > 0) {
            var row = output[key];
            rowsProcessed++;
            User.findOne({personId: parseInt(row.PERSON_ID)}, function (err, doc) {
              var addOrChangeModel = function(model) {
                model.personId    = parseInt(row.PERSON_ID);
                model.orgName     = row.ORGANIZATION_NAME;
                model.title     = row.TITLE;
                model.contactName   = row.FIRST_NAME + " " + row.LAST_NAME;
                model.firstName   = row.FIRST_NAME;
                model.middleName  = row.MIDDLE_NAME;
                model.lastName    = row.LAST_NAME;
                model.phoneNumber   = row.PHONE_NUMBER;
                model.homePhoneNumber   = row.HOME_PHONE_NUMBER;
                model.email     = row.EMAIL_ADDRESS;
                model.eaoStaffFlag  = Boolean(row.EAO_STAFF_FLAG);
                model.proponentFlag = Boolean(row.PROPONENT_FLAG);
                model.salutation  = row.SALUTATION;
                model.department  = row.DEPARTMENT;
                model.faxNumber   = row.FAX_NUMBER;
                model.cellPhoneNumber = row.CELL_PHONE_NUMBER;
                model.address1    = row.ADDRESS_LINE_1;
                model.address2    = row.ADDRESS_LINE_2;
                model.city      = row.CITY;
                model.province    = row.PROVINCE_STATE;
                model.country     = row.COUNTRY;
                model.postalCode  = row.POSTAL_CODE;
                model.notes     = row.NOTES;
                model.username    = model.email;
                model.password    = crypto.randomBytes(8);
                model.save().then(function () {
                  // Am I done processing?
                  // console.log("INDEX:",index);
                  if (index === length-1) {
                    // console.log("rowsProcessed: ",rowsProcessed);
                    resolve("{done: true, rowsProcessed: "+rowsProcessed+"}");
                  }
                });

              };
              if (doc === null) {
                // Create new
                var c = new User();
                addOrChangeModel(c);
              } else {
                // Update:
                addOrChangeModel(doc);
              }
            });
          }
        });
      });
    });
  });
};

exports.loadGroupUsers = function(file, req, res) {
  return new Promise (function (resolve, reject) {
    // Now parse and go through this thing.
    fs.readFile(file.path, 'utf8', function(err, data) {
      if (err) {
        reject("{err: "+err);
      }
      // console.log("FILE DATA:",data);
      var colArray = ['GROUP_ID','NAME','CONTACT_GROUP_TYPE','PERSON_ID','PROJECT_ID'];
      var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
        // Skip this many rows
        var length = Object.keys(output).length;
        var rowsProcessed = 0;
        console.log("length",length);
        Object.keys(output).forEach(function(key, index) {
          if (index > 0) {
            var row = output[key];
            rowsProcessed++;
            // console.log("rowData:",row);
            GroupModel.findOne({groupId: parseInt(row.GROUP_ID), personId: parseInt(row.PERSON_ID)}, function (err, doc) {
              var addOrChangeModel = function(model) {
                // console.log("Nothing Found");
                model.groupId     = parseInt(row.GROUP_ID);
                model.groupName   = row.NAME;
                model.groupType   = row.CONTACT_GROUP_TYPE;
                model.personId    = parseInt(row.PERSON_ID);
                model.epicProjectID  = parseInt(row.PROJECT_ID); // Save epic data just in case
                model.save().then(function () {
                  // Am I done processing?
                  // console.log("INDEX:",index);
                  if (index === length-1) {
                    console.log("rowsProcessed: ",rowsProcessed);
                    resolve("{done: true, rowsProcessed: "+rowsProcessed+"}");
                  }
                });
                // Attempt to link up the project if it's loaded.
                Project.findOne({epicProjectID: parseInt(row.PROJECT_ID)}).then(function(p) {
                  if (p) {
                    model.project = p;
                    model.save();
                  }
                });
              };
              if (doc === null) {
                // Create new
                var g = new GroupModel ();
                addOrChangeModel(g);
              } else {
                // Update:
                addOrChangeModel(doc);
              }
            });
          }
        });
      });
    });
  });
};