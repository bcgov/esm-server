'use strict';

angular.module('groups').factory ('GroupModel', function (ModelBase, _) {
	var Class = ModelBase.extend ({
		urlName : 'group',
		forProject: function (id) {
			return this.get ('/api/group/for/project/'+id);
		}
	});
	return new Class ();
});
