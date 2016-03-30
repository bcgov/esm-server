'use strict';

angular.module('conditions').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('systemMenu', {
			title: 'Conditions',
			state: 'admin.condition.list',
			roles: ['admin']
		});
	}
]);
