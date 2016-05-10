'use strict';

angular.module('project').run(['Menus', 'MenuControl', function (Menus, MenuControl) {
		Menus.addMenuItem('projectTopMenu', {
			title: 'Edit Project',
			state: 'p.edit',
			roles: MenuControl.menuRolesBuilder (undefined, '*', '*', ['responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer', 'pro:admin', 'pro:member'])
		});
		Menus.addMenuItem('projectTopMenu', {
			title: 'Schedule',
			state: "p.schedule",
			roles: MenuControl.menuRolesBuilder (undefined, '*', '*', ['responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'minister-office', 'qa-officer', 'ce-lead', 'ce-officer', 'wg', 'ceaa', 'pro:admin', 'pro:member', 'sub'])
		});
		Menus.addMenuItem('projectTopMenu', {
			title: 'Compliance Oversight',
			state: "p.enforcements",
			roles: MenuControl.menuRolesBuilder (['user'], '*', '*', '*')
		});
		
		// Menus.addMenuItem('projectMenu', {
		// 	title: 'Edit Project Schedule',
		// 	state: 'p.edit',
		// 	roles: MenuControl.menuRoles ('', 'eao', 'edit-schedule')
		// });
	}
]);
