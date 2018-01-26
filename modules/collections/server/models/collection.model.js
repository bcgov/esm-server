'use strict';
// =========================================================================
//
// Collection Model
//
var path = require('path');

module.exports = require(path.resolve('./modules/core/server/controllers/core.schema.controller'))('Collection', {
  __audit        : true, // who what when
  __access       : ['publish', 'unPublish'],

  project        : { type: 'ObjectId', ref: 'Project', default: null },

  dateAdded      : { type: Date, default: Date.now },
  dateUpdated    : { type: Date, default: Date.now },
  updatedBy      : { type: 'ObjectId', ref:'User', default: null },

  displayName    : { type: String, default: '' },
  description    : { type: String, default: '' },
  parentType     : { type: String, default: '' },
  type           : { type: String, default: '' },
  status         : { type: String, default: '' },
  date           : { type: Date, default: Date.now },

  mainDocument   : { type: 'ObjectId', ref: 'Collectiondocument', default: null },
  otherDocuments : [{ type: 'ObjectId', ref: 'Collectiondocument', default: null }],
});
