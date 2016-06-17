'use strict';

angular.module('projects').run(['Menus','MenuControl',
	function (Menus, MenuControl) {
		// Menus.addMenuItem('projectsMenu', {
		// 	title: 'Add Project',
		// 	state: "p.edit({projectid:'new'})",
		// 	roles: MenuControl.menuRolesBuilder(['admin','proponent'])
		// });
		// Menus.addMenuItem('projectsMenu', {
		// 	title: 'Schedule',
		// 	state: "projects.schedule",
		// 	roles: MenuControl.menuRolesBuilder(undefined,  '*', '*', ['responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'minister-office', 'qa-officer', 'ce-lead', 'ce-officer', 'wg', 'ceaa', 'pro:admin', 'pro:member', 'sub'])
		// });
	}
]);
