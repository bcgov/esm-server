'use strict';

angular.module('templates').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('systemMenu', {
			title: 'Templates',
			state: 'admin.template.list',
			roles: ['admin']
		});
	}
]);
