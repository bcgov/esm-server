'use strict';

angular.module('projectconditions').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('projectMenu', {
			title: 'Project Conditions',
			state: 'p.projectcondition.list',
			roles: ['user']
		});
	}
]);
