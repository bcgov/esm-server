'use strict';

angular.module('documents').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('projectMenu', {
			title: 'Documents',
			state: 'p.documents',
			roles: MenuControl.menuRolesBuilder ('admin', '*', '*', '*')
		});
	}
]);
