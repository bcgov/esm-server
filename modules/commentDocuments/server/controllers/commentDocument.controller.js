'use strict';
// =========================================================================
//
// Controller for commentDocuments
//
// =========================================================================
var path     = require('path');
var mongoose = require ('mongoose');
var CRUD     = require (path.resolve('./modules/core/server/controllers/core.crud.controller'));
var Model    = mongoose.model ('CommentDocument');
var PublicComment = mongoose.model ('PublicComment');

var crud = new CRUD (Model);
// -------------------------------------------------------------------------
//
// Basic CRUD
//
// -------------------------------------------------------------------------
exports.new    = crud.new    ();
exports.create = crud.create ();
exports.read   = crud.read   ();
exports.update = crud.update ();
exports.delete = crud.delete ();
exports.list   = crud.list   ();
exports.getObject   = crud.getObject   ();


// -------------------------------------------------------------------------
//
// defer the document
//
// -------------------------------------------------------------------------
var eaodefer = function (req, res) {

};
exports.eaodefer = eaodefer;
// -------------------------------------------------------------------------
//
// accept the document
//
// -------------------------------------------------------------------------
var eaoaccept = function (req, res) {

};
exports.eaoaccept = eaoaccept;
// -------------------------------------------------------------------------
//
// reject the document
//
// -------------------------------------------------------------------------
var eaoreject = function (req, res) {

};
exports.eaoreject = eaoreject;
// -------------------------------------------------------------------------
//
// publish document
//
// -------------------------------------------------------------------------
var eaopublish = function (req, res) {

};
exports.eaopublish = eaopublish;
