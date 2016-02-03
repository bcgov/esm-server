'use strict';

var path     = require('path');
var control  = require (path.resolve('./modules/core/server/controllers/core.models.controller'));
var _ = require ('lodash');
var mongoose = require ('mongoose');
var Schema   = mongoose.Schema;

var OrganizationSchema = {
	__audit     : true,
	__access    : true,
	code        : { type:String, default:'New Organization', index:true },
	name        : { type:String, default:'New Organization' },
	/*description : { type:String, default:'' },
	type        : { type:String, default:'', index:true },
	region      : { type:String, default:'' },     // object id
	location    : { type:String, default:'' },
	stream      : { type:'ObjectId', ref:'Stream'     , index:true },
	proponent   : { type:'ObjectId', ref:'Entity'     , index:true },*/
	//
	// location is a free form string entry
	//
	//
	// phase data is stored below, so these are merely keys into that data
	//
/*	status                       : { type: String, default:'Initiated', enum:['Initiated', 'Submitted', 'In Progress', 'Certified', 'Decomissioned'] },
	dateStarted                  : { type: Date, default: null }, // date in progress
	dateCompleted                : { type: Date, default: null }, // date complete
	currentPhase                 : { type:'ObjectId', ref:'Phase', index:true },
	nextPhase                    : { type:'ObjectId', ref:'Phase', index:true },
	currentPhaseCode             : { type: String, default:'' },
	dateCurrentPhaseEstimatedEnd : { type: Date, default: Date.now },
	nextPhaseCode                : { type: String, default:'' },
	dateNextPhaseEstimatedStart  : { type: Date, default: Date.now },
	overallProgress              : { type: Number, default:0 },
	lat                          : { type: Number, default:0 },
	lon                          : { type: Number, default:0 },
	dateCommentsOpen   : { type: Date, default: null },
	dateCommentsClosed : { type: Date, default: null },*/

	company						: { type: String, default:'' },
	website						: { type: String, default:'' },
	companyLegal				: { type: String, default:'' },
	registeredIn				: { type: String, default:'' },
	parentCompany				: { type: String, default:'' },
	companyType					: { type: String, default:'' },
	address1					: { type: String, default:'' },
	address2					: { type: String, default:'' },
	city						: { type: String, default:'' },
	province					: { type: String, default:'' },
	postal						: { type: String, default:'' },

};

module.exports = control.generateModel ('Organization', OrganizationSchema);
// //
// // add the audit fields and access fields
// //
// _.extend (OrganizationSchema, control.auditFields);
// _.extend (OrganizationSchema, control.accessFields);
// //
// // make the schema
// //
// OrganizationSchema = new Schema (OrganizationSchema);
// //
// // hook the pre save audit stuff
// //
// // OrganizationSchema.pre ('save', control.auditSaveFunction);
// // //
// // // add the permission checking methods
// // //
// // OrganizationSchema.methods.hasPermission = control.hasPermission;
// // OrganizationSchema.methods.permissions   = control.permissions;

// var Organization = mongoose.model ('Organization', OrganizationSchema);

// module.exports = Organization;
