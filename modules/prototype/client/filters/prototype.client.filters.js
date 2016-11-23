'use strict';

angular.module('prototype')
	.filter('keywordsFilter', filterKeywordsFilter)
	.filter('topicsFilter', filterTopicsFilter)
	.filter('titleFilter', filterTitleFilter)
	.filter('orderIdFilter', filterOrderIdFilter)
	;

filterKeywordsFilter.$inject = ['$filter', '_'];
function filterKeywordsFilter($filter, _) {
	return function(dataset, keywords){
		if (!_.isEmpty(keywords)) {
			var recs = [];
			_.each(dataset, function(d) {
				_.each(d.keywords, function(k) {
					if (k === keywords) {
						recs.push(d);
					}
				});
			});
			return _.uniq(recs);
		} else {
			return dataset;
		}
	};
}
filterTopicsFilter.$inject = ['$filter', '_'];
function filterTopicsFilter($filter, _) {
	return function(dataset, topics){
		if (!_.isEmpty(topics)) {
			var recs = [];
			_.each(dataset, function(d) {
				if (_.size(_.intersection(d.topics, topics)) > 0) {
					recs.push(d);
				}
			});
			return _.uniq(recs);
		} else {
			return dataset;
		}
	};
}
filterTitleFilter.$inject = ['$filter', '_'];
function filterTitleFilter($filter, _) {
	return function(dataset, title){
		if (!_.isEmpty(title)) {
			var re = new RegExp(title, 'i');
			var recs = [];
			_.each(dataset, function(d) {
				if (re.test(d.title)) {
					recs.push(d);
				}
			});
			return _.uniq(recs);
		} else {
			return dataset;
		}
	};
}
filterOrderIdFilter.$inject = ['$filter', '_'];
function filterOrderIdFilter($filter, _) {
	return function(dataset, orderId){
		if (!_.isEmpty(orderId)) {
			var re = new RegExp(orderId, 'i');
			var recs = [];
			_.each(dataset, function(d) {
				if (re.test(d.orderId)) {
					recs.push(d);
				}
			});
			return _.uniq(recs);
		} else {
			return dataset;
		}
	};
}