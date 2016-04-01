'use strict';

angular.module('projectconditions').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('projectMenu', {
			title: 'Project Conditions',
			state: 'p.projectcondition.list',
			roles: MenuControl.menuRoles ('', 'eao', 'edit-conditions')
		});
	}
]);
