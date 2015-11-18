'use strict';
// =========================================================================
//
// Model for streams
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var AccessSchema = require ('../../../common/models/schema.access');

var StreamSchema  = new Schema ({
	code        : { type:String, default:'code' },
	name        : { type:String, default:'New stream' },
	description : { type:String, default:'New stream' },
	access      : {
		read  : { type:String, default:'' },
		write : { type:String, default:'' },
		watch : { type:String, default:'' }
	}
});

var Stream = mongoose.model ('Stream', StreamSchema);

module.exports = Stream;

