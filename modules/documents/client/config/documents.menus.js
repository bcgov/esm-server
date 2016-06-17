'use strict';

angular.module('documents').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		// Menus.addMenuItem('projectMenu', {
		// 	title: 'Documents',
		// 	state: 'p.documents',
		// 	roles: MenuControl.menuRolesBuilder (['admin','user','public'], '*', '*', ['eao:admin', 'eao:member', 'responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'pro:admin', 'pro:member', 'sub'])
		// });
	}
]);
