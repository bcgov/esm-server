'use strict';

angular.module('organizations').run(['Menus','MenuControl',
	function (Menus, MenuControl) {
		Menus.addMenuItem('systemMenu', {
			title: 'Organizations',
			state: 'admin.organization.list',
			roles: ['eao', 'admin']
			// roles: ['sally']
			// roles: MenuControl.menuAccess ('organization')
		});
	}
]);
