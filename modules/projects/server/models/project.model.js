'use strict';

var mongoose = require ('mongoose');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema ({
	code        : { type:String, default:'New Project', index:true },
	name        : { type:String, default:'New Project' },
	description : { type:String, default:'' },
	type        : { type:String, default:'', index:true },
	nature      : { type:String, default:'', index:true },
	location    : { type:String, default:'' },
	region      : { type:String, default:'' },     // object id
	lat         : { type: Number, default:0 },
	lon         : { type: Number, default:0 },
	stream      : { type:'ObjectId', ref:'Stream'     , index:true },
	proponent   : { type:'ObjectId', ref:'Entity'     , index:true },
	hasAgreed   : { type:Boolean, default:false },
	//
	// location is a free form string entry
	//
	//
	// phase data is stored below, so these are merely keys into that data
	//
	status                       : { type: String, default:'Not Started', enum:['Not Started', 'In Progress', 'Complete'] },
	dateStarted                  : { type: Date, default: null }, // date in progress
	dateCompleted                : { type: Date, default: null }, // date complete
	currentPhase                 : { type:'ObjectId', ref:'Phase', index:true },
	nextPhase                    : { type:'ObjectId', ref:'Phase', index:true },
	currentPhaseCode             : { type: String, default:'' },
	dateCurrentPhaseEstimatedEnd : { type: Date, default: Date.now },
	nextPhaseCode                : { type: String, default:'' },
	dateNextPhaseEstimatedStart  : { type: Date, default: Date.now },
	overallProgress              : { type: Number, default:0 },
	commentsOpen                 : { type: Boolean, default:false},
	commentPeriods : [{
		dateOpen : { type: Date, default: null },
		dateClosed : { type: Date, default: null },
	}],
	dateAdded   : { type: Date},
	addedBy     : {type:'ObjectId', ref:'User'},
	dateUpdated : { type: Date},
	updatedBy   : {type:'ObjectId', ref:'User'}
});

ProjectSchema.pre ('save', function (next) {
	this.dateUpdated = Date.now;
	if ( !this.dateAdded ) this.dateAdded = this.dateUpdated;
	next();
});

var Project = mongoose.model ('Project', ProjectSchema);

module.exports = Project;
