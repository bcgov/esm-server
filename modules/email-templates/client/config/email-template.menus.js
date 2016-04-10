'use strict';

angular.module('email-template').run(['Menus',
	function (Menus) {
		Menus.addMenuItem('systemMenu', {
			title: 'Email Templates',
			state: 'admin.emailtemplate.list',
			roles: ['admin','eao']
		});
	}
]);
