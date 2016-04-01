'use strict';

angular.module('irs').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('projectMenu', {
			title: 'Inspection Reports',
			state: 'p.ir.list',
			roles: MenuControl.menuRoles ('', 'eao', 'edit-inspections')
		});
	}
]);
