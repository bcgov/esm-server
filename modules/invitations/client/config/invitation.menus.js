'use strict';

angular.module('invitation').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('projectMenu', {
			title: 'Project Invitations',
			state: 'p.invitations',
			roles: MenuControl.menuRolesBuilder ('admin', '*', '*', '*')
		});
	}
]);
