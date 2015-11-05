// var _ = require('lodash');

// module.exports = function respond( res, keeparray ) {
//     return function ( err, data ) {
//         if (err) {
//             console.error(err);
//             res.status(400).send('Server error.');
//         } else {
//             if(process.env.DEBUG && process.env.NOISY) console.log('success',data);
//             // if(_.isArray(data) && data.length === 1) {
//             //     if (!keeparray) data = data.shift();
//             // }
//             res.status(200).send(data);
//         }
//     }
// }


var mongoose = require ('mongoose');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema ({
	name             : { type:String, default:'New Project' },
});

var Project = mongoose.model ('Project', ProjectSchema);

module.exports = Project;
