'use strict';

angular.module('core.admin').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('systemMenu', {
			title: 'Configuration',
			state: 'configuration',
			roles: ['admin']
		});
	}
]);
