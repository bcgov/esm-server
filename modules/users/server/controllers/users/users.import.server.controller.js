'use strict';

/**
 * Module dependencies.
 */
var _ = require ('lodash'),
  fs = require ('fs'),
  path = require ('path'),
  mongoose = require ('mongoose'),
  User = mongoose.model('User'),
  CSVParse = require ('csv-parse'),
  crypto = require ('crypto'),
  Project = mongoose.model ('Project'),
  ProjectGroup = mongoose.model ('ProjectGroup'),
  OrganizationController = require (path.resolve('./modules/organizations/server/controllers/organization.controller')),
  Organization = mongoose.model ('Organization'),
  errorHandler = require (path.resolve('./modules/core/server/controllers/errors.server.controller'));


var access = require(path.resolve('./modules/core/server/controllers/core.access.controller'));

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
exports.loadUsers = function(file, req, res, opts) {
  var OrgCtrl = new OrganizationController(opts);
  return new Promise (function (resolve, reject) {
    // Now parse and go through this thing.
    fs.readFile(file.path, 'utf8', function(err, data) {
      if (err) {
        reject("{err: "+err);
      }
      var v1ColArray = ['PERSON_ID','EAO_STAFF_FLAG','PROPONENT_FLAG','SALUTATION','FIRST_NAME','MIDDLE_NAME','LAST_NAME','TITLE','ORGANIZATION_NAME','DEPARTMENT','EMAIL_ADDRESS','PHONE_NUMBER','HOME_PHONE_NUMBER','FAX_NUMBER','CELL_PHONE_NUMBER','ADDRESS_LINE_1','ADDRESS_LINE_2','CITY','PROVINCE_STATE','COUNTRY','POSTAL_CODE','NOTES'];
      var v1RowToObject = function(row) {
        if (_.isEmpty(row.FIRST_NAME)) {
          return null;
        }
        row.EMAIL_ADDRESS = row.EMAIL_ADDRESS ? row.EMAIL_ADDRESS.trim() : "";
        var obj = {
          personId      : parseInt(row.PERSON_ID),
          orgName       : row.ORGANIZATION_NAME,
          title         : row.TITLE,
          displayName   : row.FIRST_NAME + " " + row.LAST_NAME,
          firstName     : row.FIRST_NAME,
          middleName    : row.MIDDLE_NAME,
          lastName      : row.LAST_NAME,
          phoneNumber   : row.PHONE_NUMBER,
          homePhoneNumber : row.HOME_PHONE_NUMBER,
          email         : row.EMAIL_ADDRESS,
          viaEmail      : !_.isEmpty(row.EMAIL_ADDRESS),
          eaoStaffFlag  : Boolean(row.EAO_STAFF_FLAG),
          proponentFlag : Boolean(row.PROPONENT_FLAG),
          salutation    : row.SALUTATION,
          department    : row.DEPARTMENT,
          faxNumber     : row.FAX_NUMBER,
          cellPhoneNumber : row.CELL_PHONE_NUMBER,
          address1      : row.ADDRESS_LINE_1,
          address2      : row.ADDRESS_LINE_2,
          city          : row.CITY,
          province      : row.PROVINCE_STATE,
          country       : row.COUNTRY,
          postalCode    : row.POSTAL_CODE,
          viaMail       : _.isEmpty(row.EMAIL_ADDRESS) && !_.isEmpty(row.ADDRESS_LINE_1),
          notes         : row.NOTES,
          username      : row.EMAIL_ADDRESS !== "" ? row.EMAIL_ADDRESS : row.FIRST_NAME +"."+ row.LAST_NAME +"."+ row.ORGANIZATION_NAME,
          password      : crypto.randomBytes(8)
        };
        return obj;
      };

      var v2ColArray = _.concat(v1ColArray, 'DISPLAY_NAME', 'USERNAME', 'PASSWORD', 'SALT');
      var v2RowToObject = function(row) {
        if (_.isEmpty(row.FIRST_NAME)) {
          return null;
        }
        row.EMAIL_ADDRESS = row.EMAIL_ADDRESS ? row.EMAIL_ADDRESS.trim() : "";
        var obj = {
          personId      : parseInt(row.PERSON_ID),
          orgName       : row.ORGANIZATION_NAME,
          title         : row.TITLE,
          displayName   : row.DISPLAY_NAME,
          firstName     : row.FIRST_NAME,
          middleName    : row.MIDDLE_NAME,
          lastName      : row.LAST_NAME,
          phoneNumber   : row.PHONE_NUMBER,
          homePhoneNumber : row.HOME_PHONE_NUMBER,
          email         : row.EMAIL_ADDRESS,
          viaEmail      : !_.isEmpty(row.EMAIL_ADDRESS),
          eaoStaffFlag  : Boolean(row.EAO_STAFF_FLAG),
          proponentFlag : Boolean(row.PROPONENT_FLAG),
          salutation    : row.SALUTATION,
          department    : row.DEPARTMENT,
          faxNumber     : row.FAX_NUMBER,
          cellPhoneNumber : row.CELL_PHONE_NUMBER,
          address1      : row.ADDRESS_LINE_1,
          address2      : row.ADDRESS_LINE_2,
          city          : row.CITY,
          province      : row.PROVINCE_STATE,
          country       : row.COUNTRY,
          postalCode    : row.POSTAL_CODE,
          viaMail       : _.isEmpty(row.EMAIL_ADDRESS) && !_.isEmpty(row.ADDRESS_LINE_1),
          notes         : row.NOTES,
          username      : row.USERNAME,
          password      : row.PASSWORD,
          salt          : row.SALT
        };
        return obj;
      };
      var v3ColArray = ['SALUTATION','FIRST_NAME','MIDDLE_NAME','LAST_NAME','DISPLAY_NAME','USERNAME','VIA_EMAIL','VIA_MAIL','EMAIL','PHONE','MOBILE','FAX','ADDRESS_1','ADDRESS_2','CITY','PROVINCE','COUNTRY','POSTAL','ORGANIZATION_NAME','DEPARTMENT','TITLE','NOTES','HOME_PHONE','PERSON_ID','EAO_STAFF_FLAG','PROPONENT_FLAG','PASSWORD'];
      var v3RowToObject = function(row) {
        if (_.isEmpty(row.FIRST_NAME)) {
          return null;
        }
        var obj = {
          salutation    : row.SALUTATION,
          firstName     : row.FIRST_NAME,
          middleName    : row.MIDDLE_NAME,
          lastName      : row.LAST_NAME,
          displayName   : row.DISPLAY_NAME,
          username      : row.USERNAME,
          viaEmail      : _.isEmpty(row.VIA_EMAIL) ? false : Boolean(row.VIA_EMAIL),
          viaMail       : _.isEmpty(row.VIA_MAIL) ? false : Boolean(row.VIA_MAIL),
          email         : row.EMAIL ? row.EMAIL.trim() : "",
          phoneNumber   : row.PHONE,
          cellPhoneNumber : row.MOBILE,
          faxNumber     : row.FAX_NUMBER,
          address1      : row.ADDRESS_1,
          address2      : row.ADDRESS_2,
          city          : row.CITY,
          province      : row.PROVINCE,
          country       : row.COUNTRY,
          postalCode    : row.POSTAL,
          orgName       : row.ORGANIZATION_NAME,
          department    : row.DEPARTMENT,
          title         : row.TITLE,
          notes         : row.NOTES,
          homePhoneNumber : row.HOME_PHONE,
          personId      : _.isEmpty(row.PERSON_ID) ? null: parseInt(row.PERSON_ID),
          eaoStaffFlag  : _.isEmpty(row.EAO_STAFF_FLAG) ? false : Boolean(row.EAO_STAFF_FLAG),
          proponentFlag : _.isEmpty(row.PROPONENT_FLAG) ? false : Boolean(row.PROPONENT_FLAG),
          password      : _.isEmpty(row.PASSWORD) ? crypto.randomBytes(8): row.PASSWORD
        };
        return obj;
      };


      var lines = data.split(/\r\n|\r|\n/g);
      var colArray = v1ColArray;
      var rowParser = v1RowToObject;

      var checkImportVersion = function() {
        colArray = undefined;
        rowParser = undefined;
        if (_.size(lines) > 0) {
          if (lines[0].toLowerCase() === v1ColArray.join(',').toLowerCase()) {
            colArray = v1ColArray;
            rowParser = v1RowToObject;
          } else if (lines[0].toLowerCase() === v2ColArray.join(',').toLowerCase()) {
            colArray = v2ColArray;
            rowParser = v2RowToObject;
          } else if (lines[0].toLowerCase() === v3ColArray.join(',').toLowerCase()) {
            colArray = v3ColArray;
            rowParser = v3RowToObject;
          }
        }
        return (colArray !== undefined);
      };

      if (checkImportVersion()) {
        // eslint-disable-next-line no-unused-vars
        var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
          // Skip this many rows
          var promises = [];
          Object.keys(output).forEach(function(key, index) {
            if (index > 0) {
              var row = output[key];
              var obj = rowParser(row);
              if (obj) {
                promises.push(rowParser(row));
              }
            }
          });

          var doOrgWork = function(item) {
            return new Promise(function(rs, rj) {
              if (item.orgName === '') {
                rs(null);
              } else {
                Organization.findOne ({name:item.orgName}, function (err, result) {
                  if (result === null) {
                    // Create it
                    var o = new Organization({name: item.orgName});
                    OrgCtrl.create(o).then (rs, rj);
                  } else {
                    rs(result);
                  }
                });
              }
            });
          };

          var doUserWork = function(user, org) {
            return new Promise(function(rs, rj) {
              if (org) {
                user.org = org;
              }
              User.findOne ({email:user.email.toLowerCase()}, function (err, result) {
                if (result === null) {
                  // Create it
                  var o = new User(user);
                  o.save()
                    .then(function (obj) {
                      rs(obj);
                    }, function (err) {
                      rj(err);
                    });
                } else {
                  result.org = org;
                  result.save()
                    .then(rs,rj);
                }
              });
            });
          };

          var doOrgToUserWork = function(user) {
            return new Promise(function(rs, rj) {
              if (!user.org) {
                rs(null);
              }
              Organization.findOne({name: user.orgName})
                .then(function (org) {
                  // Push this user into the org.
                  var index = -1;
                  for (var i=0; i<org.users.length; i++) {
                    if (org.users[i].equals(user._id)) {
                      index = i;
                      break;
                    }
                  }
                  if (index === -1) {
                    org.users.push(user._id);
                    return org.save();
                  } else {
                    return org;
                  }
                })
                .then(rs, rj);
            });
          };


          Promise.resolve ()
            .then (function () {
              return promises.reduce (function (current, item) {
                return current.then (function () {
                  return doOrgWork(item)
                    .then(function (org) {
                      return doUserWork(item, org);
                    })
                    .then(function (user) {
                      return doOrgToUserWork(user);
                    });
                });
              }, Promise.resolve());
            })
            .then (resolve, reject);
        });
      } else {
        reject("{err: 'Unknown file import version.'}");
      }

    });
  });
};

exports.loadGroupUsers = function(file) {
  return new Promise (function (resolve, reject) {
    // Now parse and go through this thing.
    fs.readFile(file.path, 'utf8', function(err, data) {
      if (err) {
        reject("{err: "+err);
      }
      var colArray = ['GROUP_ID','NAME','CONTACT_GROUP_TYPE','PERSON_ID','PROJECT_ID'];

      // eslint-disable-next-line no-unused-vars
      var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
        // Skip this many rows
        var promises = [];
        Object.keys(output).forEach(function(key, index) {
          if (index > 0) {
            var row = output[key];
            var newObj = {
              groupId     : parseInt(row.GROUP_ID),
              groupName   : row.NAME,
              groupType   : row.CONTACT_GROUP_TYPE,
              personId    : parseInt(row.PERSON_ID),
              epicProjectID  : parseInt(row.PROJECT_ID) // Save epic data just in case
            };
            promises.push(newObj);
          }
        });

        var getProject = function(item) {
          return new Promise(function(resolve, reject) {
            Project.findOne({epicProjectID: item.epicProjectID}, function (err, result) {
              if (err) {
                reject(new Error(err));
              } else {
                resolve(result);
              }
            });
          });
        };

        var getGroup = function(item, project) {
          return new Promise(function(resolve, reject) {
            ProjectGroup.findOne({groupId: parseInt(item.groupId)}, function (err, result) {
              if (err) {
                reject(new Error(err));
              } else {
                if (result === null) {
                  // Create it
                  var o = new ProjectGroup({groupId: item.groupId, name: item.groupName, type: item.groupType, epicProjectID: item.epicProjectID, project: project});
                  o.save().then(resolve, reject);
                } else {
                  resolve(result);
                }
              }
            });
          });
        };

        var addUser = function(item, group) {
          return new Promise(function(resolve, reject) {
            User.findOne({personId: item.personId}, function (err, result) {
              if (err) {
                reject(new Error(err));
              } else {
                if (result !== null) {
                  // Add member?
                  var member = _.find(group.members, function(o) { return o.toString() === result._id.toString(); });
                  if (!member) {
                    group.members.push(result._id);
                    group.save().then(resolve, reject);
                  } else {
                    resolve(group);
                  }
                } else {
                  resolve(group);
                }
              }
            });
          });
        };

        Promise.resolve ()
          .then (function () {
            return promises.reduce (function (current, item) {
              return current.then (function () {
                return getProject(item)
                  .then(function (project) {
                    if (project) {
                      return getGroup(item, project);
                    } else {
                      return null;
                    }
                  })
                  .then(function(group) {
                    if(group) {
                      return addUser(item, group);
                    } else {
                      return null;
                    }
                  });
              });
            }, Promise.resolve());
          })
          .then (resolve, reject);
      });
    });
  });
};

exports.loadProjectUserRoles = function(file) {
  return new Promise (function (resolve, reject) {
    // Now parse and go through this thing.
    fs.readFile(file.path, 'utf8', function(err, data) {
      if (err) {
        reject("{err: "+err);
      }

      var v1ColArray = ['email', 'projectCode', 'project-proponent', 'project-admin', 'project-team', 'project-system-admin'];
      var v1RowToObject = function(row) {
        var obj = {
          email         : row.email,
          projectCode   : row.projectCode,
          roles         : []
        };
        _.each(v1ColArray, function(role) {
          if (row[role] === 'X' || row[role] === 'x') {
            obj.roles.push(role);
          }
        });
        return obj;
      };

      var lines = data.split(/\r\n|\r|\n/g);
      var v1 = _.size(lines) > 0 && (lines[0].split(',')[0] === 'project-role-user-import-v1');
      var colArray = v1 ? v1ColArray : undefined;
      var rowParser = v1 ? v1RowToObject : undefined;

      if (colArray === undefined) {
        reject("{err: 'Unknown file import version.'}");
      } else {

        // eslint-disable-next-line no-unused-vars
        var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
          // Skip this many rows
          var promises = [];
          Object.keys(output).forEach(function(key, index) {
            if (index > 0) {
              var row = output[key];
              promises.push(rowParser(row));
            }
          });

          var getUser = function(item) {
            return new Promise(function(resolve, reject) {
              User.findOne({email: new RegExp(item.email, 'i')}, function (err, result) {
                if (err) {
                  reject(new Error(err));
                } else {
                  if (result) {
                    resolve(result);
                  } else {
                    resolve(result);
                  }
                }
              });
            });
          };

          var getProject = function(item) {
            return new Promise(function(resolve, reject) {
              Project.findOne({code: item.projectCode}, function (err, result) {
                if (err) {
                  reject(new Error(err));
                } else {
                  if (result) {
                    resolve(result);
                  } else {
                    resolve(result);
                  }
                }
              });
            });
          };

          var addUserToProject = function(project, user, item) {
            var promiseArray = [];

            _.each (item.roles, function (role) {
              promiseArray.push (access.addRole ({
                context : project._id,
                user    : user.username,
                role    : role
              }));
            });
            return Promise.all(promiseArray);
          };


          Promise.resolve ()
            .then (function () {
              return promises.reduce (function (current, item) {
                return current.then (function () {
                  var project, user;
                  return getProject(item)
                    .then(function (data) {
                      if (data) {
                        project = data;
                        return getUser(item);
                      } else {
                        return null;
                      }
                    })
                    .then(function(data) {
                      if(data) {
                        user = data;
                        return addUserToProject(project, user, item);
                      } else {
                        return null;
                      }
                    })
                    .then(function(data) {
                      if(data) {
                        return data;
                      } else {
                        return null;
                      }
                    });
                });
              }, Promise.resolve());
            })
            .then (resolve, reject);
        });
      }
    });
  });
};


exports.loadSystemUserRoles = function(file) {
  return new Promise (function (resolve, reject) {
    // Now parse and go through this thing.
    fs.readFile(file.path, 'utf8', function(err, data) {
      if (err) {
        reject("{err: "+err);
      }

      var v1ColArray = ['email', 'projectCode', 'system-admin', 'system-proponent', 'project-intake', 'system-eao'];
      var v1RowToObject = function(row) {
        var obj = {
          email         : row.email,
          projectCode   : row.projectCode,
          roles         : []
        };
        _.each(v1ColArray, function(role) {
          if (row[role] === 'X' || row[role] === 'x') {
            obj.roles.push(role);
          }
        });
        return obj;
      };

      var lines = data.split(/\r\n|\r|\n/g);
      var v1 = _.size(lines) > 0 && (lines[0].split(',')[0] === 'system-role-user-import-v1');
      var colArray = v1 ? v1ColArray : undefined;
      var rowParser = v1 ? v1RowToObject : undefined;

      if (colArray === undefined) {
        reject("{err: 'Unknown file import version.'}");
      } else {

        // eslint-disable-next-line no-unused-vars
        var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
          // Skip this many rows
          var promises = [];
          Object.keys(output).forEach(function(key, index) {
            if (index > 0) {
              var row = output[key];
              promises.push(rowParser(row));
            }
          });

          var getUser = function(item) {
            return new Promise(function(resolve, reject) {
              User.findOne({email: new RegExp(item.email, 'i')}, function (err, result) {
                if (err) {
                  reject(new Error(err));
                } else {
                  if (result) {
                    resolve(result);
                  } else {
                    resolve(result);
                  }
                }
              });
            });
          };

          var getProject = function(item) {
            return new Promise(function(resolve, reject) {
              Project.findOne({code: item.projectCode}, function (err, result) {
                if (err) {
                  reject(new Error(err));
                } else {
                  if (result) {
                    resolve(result);
                  } else {
                    resolve(result);
                  }
                }
              });
            });
          };

          var addUserToProjectAndSystem = function(project, user, item) {
            var promiseArray = [];
            _.each (item.roles, function (role) {
              promiseArray.push (access.addRole ({
                context : 'application',
                user    : user.username,
                role    : role
              }));
              promiseArray.push (access.addRole ({
                context : project._id,
                user    : user.username,
                role    : role
              }));
            });
            return Promise.all(promiseArray);
          };

          Promise.resolve ()
            .then (function () {
              return promises.reduce (function (current, item) {
                return current.then (function () {
                  var project, user;
                  return getProject(item)
                    .then(function (data) {
                      if (data) {
                        project = data;
                        return getUser(item);
                      } else {
                        return null;
                      }
                    })
                    .then(function(data) {
                      if(data) {
                        user = data;
                        return addUserToProjectAndSystem(project, user, item);
                      } else {
                        return null;
                      }
                    })
                    .then(function(data) {
                      if(data) {
                        return data;
                      } else {
                        return null;
                      }
                    })
                    .then(function(data) {
                      if(data) {
                        return data;
                      } else {
                        return null;
                      }
                    });
                });
              }, Promise.resolve());
            })
            .then(function(data) {
              if(data) {
                return access.syncGlobalProjectUsers();
              } else {
                return null;
              }
            })
            .then (resolve, reject);
        });
      }
    });
  });
};
