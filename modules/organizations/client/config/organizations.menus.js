'use strict';

angular.module('organizations').run(['Menus','MenuControl',
	function (Menus, MenuControl) {
		Menus.addMenuItem('systemMenu', {
			title: 'Organizations',
			state: 'admin.organization.list',
			roles: MenuControl.menuRolesBuilder (['admin','eao'])
			// roles: ['sally']
			// roles: MenuControl.menuAccess ('organization')
		});
	}
]);
