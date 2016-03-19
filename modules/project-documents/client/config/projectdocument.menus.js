'use strict';

angular.module('recent-activity').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectMenu', {
			title: 'Documents',
			state: 'projectdocuments',
			roles: ['user']
		});
	}
]);
