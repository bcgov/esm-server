'use strict';

angular.module('recent-activity').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('projectMenu', {
			title: 'Value Components',
			state: 'p.vc.list',
			roles: MenuControl.menuRoles ('', 'any', 'edit-vcs')
		});
	}
]);
