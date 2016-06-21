'use strict';
// =========================================================================
//
// Shared Schema for access
//
// read and write indicate that access to the groups in a comma or space
// delimited list
//
// watch are those groups watching events on the object. events differe from
// object to object
//
// =========================================================================
module.exports = new require('mongoose').Schema ({
	read  : { type:String, default:'' },
	write : { type:String, default:'' },
	watch : { type:String, default:'' }
});

