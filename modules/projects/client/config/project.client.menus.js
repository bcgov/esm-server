'use strict';

angular.module('project').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('projectMenu', {
			title: 'Edit Project',
			state: 'p.edit',
			roles: MenuControl.menuRoles ('', 'eao', 'edit-project')
		});
	}
]);
