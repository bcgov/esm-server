'use strict';

angular.module('project').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectMenu', {
			title: 'Add Project',
			state: 'projectnew',
			roles: ['user', 'admin']
		});
		Menus.addMenuItem('projectMenu', {
			title: 'Activities',
			state: 'activities',
			roles: ['user', 'admin']
		});
	}
]);
