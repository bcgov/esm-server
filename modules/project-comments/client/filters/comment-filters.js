'use strict';

angular.module('comment')
	.filter('authorCommentFilter', authorCommentFilter)
;

authorCommentFilter.$inject = ['$filter', '_'];
function authorCommentFilter($filter, _) {
	return function(dataset, value){
		if (!_.isEmpty(value)) {
			//console.log('authorCommentFilter dataset.count = ' + _.size(dataset) + ' value = ' + value);
			var recs = [];
			_.each(dataset, function(d) {
				// if we match the comment author
				// or the comment
				// add this to the records...
				var pattern = new RegExp(value, 'gi');
				if (pattern.test(d.author)) {
					//console.log(' value = ' + value + ' matches author: ' + d.author);
					recs.push(d);
				} else if (pattern.test(d.comment)) {
					//console.log(' value = ' + value + ' matches comment: ' + d.comment);
					recs.push(d);
				}
			});
			return _.uniq(recs);
		} else {
			return dataset;
		}
	};
}