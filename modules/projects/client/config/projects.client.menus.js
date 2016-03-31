'use strict';

angular.module('projects').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectsMenu', {
			title: 'Add Project',
			state: "p.edit({projectid:'new'})",
			roles: ['proponent', 'admin'],
			// data: {projectid:'new'}
		});
	}
]);
