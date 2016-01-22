'use strict';

angular.module('projects').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectsMenu', {
			title: 'Add Project',
			state: 'projectnew',
			roles: ['user', 'admin']
		});
	}
]);
