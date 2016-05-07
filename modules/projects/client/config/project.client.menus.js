'use strict';

angular.module('project').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('projectTopMenu', {
			title: 'Edit Project',
			state: 'p.edit',
			roles: MenuControl.menuRolesBuilder ('admin', '*', '*', '*')
		});
		Menus.addMenuItem('projectTopMenu', {
			title: 'Schedule',
			state: "p.schedule",
			roles: MenuControl.menuRolesBuilder ('admin', '*', '*', '*')
		});
		Menus.addMenuItem('projectTopMenu', {
			title: 'Compliance Oversight',
			state: "p.enforcements",
			roles: MenuControl.menuRolesBuilder ('admin', '*', '*', '*')
		});
		
		// Menus.addMenuItem('projectMenu', {
		// 	title: 'Edit Project Schedule',
		// 	state: 'p.edit',
		// 	roles: MenuControl.menuRoles ('', 'eao', 'edit-schedule')
		// });
	}
]);
