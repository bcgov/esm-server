'use strict';

angular.module('utils')
    .filter('projectPhaseContributor', filterProjectPhaseContributor)
    .filter('kebab', filterKebab)
	.filter('contains', filterContains)
	.filter('projectBucketNotComplete', filterProjectBucketNotComplete)
	.filter('projects', filterProjects)
	.filter('isInTheFuture', filterIsInTheFuture)
	.filter('isInThePast', filterIsInThePast)
	.filter('max15Words', filterMax15Words)
	.filter('safeHtml', filterSafeHtml);

// -----------------------------------------------------------------------------------
//
// FILTER: Projects Phases - mark up the project to show what group owns it.
//
// -----------------------------------------------------------------------------------
filterProjectPhaseContributor.$inject = ['Global', '$filter', '_'];
/* @ngInject */
function filterProjectPhaseContributor(Global, $filter, _) {
	return function(input) {
		var cur = _.findWhere(Global.projectPhases, {name: input});
		if (cur) {
			if (cur.groups.indexOf( Global.user.type ) !== -1) {
				return true;
			}
		} 
		return false;
	}
}
// -----------------------------------------------------------------------------------
//
// FILTER: Projects Phases - mark up the project to show what group owns it.
//
// -----------------------------------------------------------------------------------
filterKebab.$inject = [];
/* @ngInject */
function filterKebab() {
	return function(input) {
		return _.kebabCase(input);
	}
}
// -----------------------------------------------------------------------------------
//
// FILTER: Contains - Retuns true or false if string is in.
//
// -----------------------------------------------------------------------------------
filterContains.$inject = [];
/* @ngInject */
function filterContains() {
	return function(input, term) {
		return (_.indexOf(input, term) > -1);
	}
}
// -----------------------------------------------------------------------------------
//
// FILTER: Project Buckets - not complete
//
// -----------------------------------------------------------------------------------
filterProjectBucketNotComplete.$inject = [];
/* @ngInject */
function filterProjectBucketNotComplete() {
	return function(input) {
		var output = [];
		_.each(input, function(item) {
			if (item.progress < 100) {
				output.push(item);
			}
		});
		return output;
	}
}
// -----------------------------------------------------------------------------------
//
// FILTER: Projects Page, filter  TODO: actually filter something
//
// -----------------------------------------------------------------------------------
filterProjects.$inject = [];
/* @ngInject */
function filterProjects() {
	return function(input) {
		var output = [];
		_.each(input, function(item) {
			output.push(item);
		});
		return output;
	}
}    
// -----------------------------------------------------------------------------------
//
// FILTER: Is in the future
//
// -----------------------------------------------------------------------------------
filterIsInTheFuture.$inject = [];
/* @ngInject */
// Just take it easy and you'll be fine... and be careful in the future.
function filterIsInTheFuture() {
	return function(input) {
		return moment(input) > moment();
	}
}   
// -----------------------------------------------------------------------------------
//
// FILTER: Is in the future
//
// -----------------------------------------------------------------------------------
filterIsInThePast.$inject = [];
/* @ngInject */
// So tell me Future Boy, who's President of the United States in 1985?
function filterIsInThePast() {
	return function(input) {
		return moment(input) < moment();
	}
}   

filterMax15Words.$inject = [];

function filterMax15Words() {
	return function(input) {
    	return _.take(_.words(input), 15).join(' ');
    }
}


filterSafeHtml.$inject = ['$sce'];

function filterSafeHtml($sce) {
	return function(input) {
    	return $sce.trustAsHtml(input);
    }
}
