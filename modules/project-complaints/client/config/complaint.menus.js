'use strict';

angular.module('complaints').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('projectMenu', {
			title: 'Complaints',
			state: 'p.complaint.list',
			roles: MenuControl.menuRolesBuilder (undefined, '*', '*', ['ce-lead', 'ce-officer'])
		});
	}
]);
