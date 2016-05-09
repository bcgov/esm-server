'use strict';

angular.module('projects').run(['Menus','MenuControl',
	function (Menus, MenuControl) {
		Menus.addMenuItem('projectsMenu', {
			title: 'Add Project',
			state: "p.edit({projectid:'new'})",
			roles: MenuControl.menuRolesBuilder(['admin','proponent'])
		});
		Menus.addMenuItem('projectsMenu', {
			title: 'Schedule',
			state: "projects.schedule",
			roles: MenuControl.menuRolesBuilder(['admin','eao'])
		});
	}
]);
