'use strict';

angular.module('documents').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectMenu', {
			title: 'Documents',
			state: 'p.documents',
			roles: ['user']
		});
	}
]);
