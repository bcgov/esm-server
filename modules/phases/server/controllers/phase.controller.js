'use strict';
// =========================================================================
//
// Controller for phases
//
// =========================================================================
var path     = require('path');
var mongoose = require ('mongoose');
var CRUD     = require (path.resolve('./modules/core/server/controllers/core.crud.controller'));
var helpers  = require (path.resolve('./modules/core/server/controllers/core.helpers.controller'));
var Model    = mongoose.model ('Phase');

var crud = new CRUD (Model);
// -------------------------------------------------------------------------
//
// Basic CRUD
//
// -------------------------------------------------------------------------
exports.new    = crud.new    ();
exports.create = crud.create (function (m) {m.phase = m._id;});
exports.read   = crud.read   ();
exports.update = crud.update ();
exports.delete = crud.delete ();
exports.list   = crud.list   ();
exports.base   = crud.list	 ({ stream: null, project: null});
exports.getObject   = crud.getObject   ();


