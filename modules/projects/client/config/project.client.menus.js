'use strict';

angular.module('project').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectMenu', {
			title: 'Add Project',
			state: 'projectnew',
			roles: ['user', 'admin']
		});
	}
]);
