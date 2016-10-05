'use strict';
// =========================================================================
//
// Model for templates
//
// =========================================================================
var mongoose = require ('mongoose');

var templateMeta = new mongoose.Schema ({
	name     : { type:String, default:'' },
	type     : { type:String, default:'Text', enum:['Text', 'Html', 'Auto', 'List', 'Artifact', 'Document List'] },
	label    : { type:String, default:'' },
	default  : { type:String, default:'' }
});
var templateSection = new mongoose.Schema ({
	name     : { type:String, default:'' },
	label    : { type:String, default:'' },
	optional : { type:Boolean, default:false },
	multiple : { type:Boolean, default:false },
	isheader : { type:Boolean, default:false },
	isfooter : { type:Boolean, default:false },
	template : { type:String, default:'' },
	header   : { type:String, default:'' },
	footer   : { type:String, default:'' },
	meta     : [ templateMeta ]
});

// =========================================================================
//
// A template can be for many purposes, but primarily for artifacts. If
// it is an artifact type then we link the artifact type record here as well
// so that they can be linked at the time that an actual instance of the
// artifact is created
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Template', {
	__audit       : true,
	code          : { type:String, default: '', index:true},
	documentType  : { type:String, default: '', index:true},
	versionNumber : { type:Number, default:0, index:true },
	sections      : [ templateSection ],
	templateType  : { type:String, default:'Artifact', enum:['Artifact','Notification Letter','Notification Email']},
	artifact      : { type:'ObjectId', ref:'ArtifactType', default:null , index:true},
	signatureStage : { type: String, default: null}
});

