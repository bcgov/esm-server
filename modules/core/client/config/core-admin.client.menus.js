'use strict';

angular.module('core.admin').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('systemMenu', {
			title: 'Configuration',
			state: 'configuration',
			roles: MenuControl.menuRolesBuilder(['admin'])
		});
	}
]);
