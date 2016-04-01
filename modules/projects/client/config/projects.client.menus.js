'use strict';

angular.module('projects').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectsMenu', {
			title: 'Add Project',
			state: "p.edit({projectid:'new'})",
			roles: ['proponent', 'admin']
		});
		Menus.addMenuItem('projectsMenu', {
			title: 'Schedule',
			state: "projects.schedule",
			roles: ['eao', 'admin']
		});
	}
]);
