'use strict';
// =========================================================================
//
// this was all getting very, very messy. So now this is the ONE AND ONLY
// place to put menu definitions.  Menus are now defined as visible through
// a permision, or set of permissions, assigned to them
//
// =========================================================================
angular.module('core').run(['Menus', 'ENV', 'ADMIN_FEATURES', 'FEATURES', function (Menus, ENV, ADMIN_FEATURES, FEATURES) {
	// -------------------------------------------------------------------------
	//
	// System Menu
	//
	// -------------------------------------------------------------------------
	Menus.addMenu('systemMenu', {
		permissions: [
		//'application.listConditions',
		'application.listEmailTemplates',
		'application.listOrganizations',
		'application.listNews',
		'application.listTemplates',
		'application.listValuedComponents',
		'application.listContacts'
		]
	});
	Menus.addMenuItem('systemMenu', {
		title: 'Email Templates',
		state: 'admin.emailtemplate.list',
		permissions: ['application.listEmailTemplates'],
		enable: 'true' === ADMIN_FEATURES.enableEmailTemplates
	});
	Menus.addMenuItem('systemMenu', {
		title: 'Organizations',
		state: 'admin.organization.list',
		permissions: ['application.listOrganizations'],
		enable: 'true' === ADMIN_FEATURES.enableOrganizations
	});
	Menus.addMenuItem('systemMenu', {
		title: 'News & Announcements',
		state: 'admin.recentactivity.list',
		permissions: ['application.listNews'],
		enable: 'true' === ADMIN_FEATURES.enableNews
	});
	Menus.addMenuItem('systemMenu', {
		title: 'Templates',
		state: 'admin.template.list',
		permissions: ['application.listTemplates'],
		enable: 'true' === ADMIN_FEATURES.enableTemplates
	});
	Menus.addMenuItem('systemMenu', {
		title: 'Valued Components',
		state: 'admin.topic.list',
		permissions: ['application.listValuedComponents'],
		enable: 'true' === ADMIN_FEATURES.enableVcs
	});
	Menus.addMenuItem('systemMenu', {
		title: 'Contacts',
		state: 'admin.user.list',
		permissions: ['application.listContacts'],
		enable: 'true' === ADMIN_FEATURES.enableContacts
	});
	// -------------------------------------------------------------------------
	//
	// Projects Menu
	//
	// -------------------------------------------------------------------------
	Menus.addMenu('projectsMenu', {
		permissions: ['application.createProject', 'application.viewSchedule']
	});
	Menus.addMenuItem('projectsMenu', {
		title: 'Add Project',
		state: "p.edit({projectid:'new'})",
		permissions: ['application.createProject']
	});
	Menus.addMenuItem('projectsMenu', {
		title: 'Schedule',
		state: "projects.schedule",
		permissions: ['application.viewSchedule']
	});
	// -------------------------------------------------------------------------
	//
	// Add Project Top Menu Items
	//
	// -------------------------------------------------------------------------
	Menus.addMenu('projectTopMenu', {
		permissions: ['context.editProject','context.viewSchedule','context.listEnforcements','context.listCommentPeriods']
	});
	Menus.addMenuItem('projectTopMenu', {
		title: 'Edit Project',
		state: 'p.edit',
		permissions: ['context.editProject']
	});
 	Menus.addMenuItem('projectTopMenu', {
		title: 'Schedule',
		state: "p.schedule",
		permissions: ['context.viewSchedule'],
		enable: 'true' === FEATURES.enableSchedule
	});
	Menus.addMenuItem('projectTopMenu', {
		title: 'Comment Periods',
		state: "p.commentperiod.list",
		permissions: ['context.listCommentPeriods'],
		enable: 'true' === FEATURES.enablePcp
	});

	// -------------------------------------------------------------------------
	//
	// Add Project Menu Items
	//
	// -------------------------------------------------------------------------
	Menus.addMenu('projectMenu', {
		permissions: [
			'context.listDocuments',
			'context.listValuedComponents',
			'context.listProjectRoles',
			'context.listInspectionReports',
			'context.listProjectConditions',
			'context.listProjectComplaints',
			'context.listProjectInvitations',
			'context.listProjectUpdates',
			'context.listProjectGroups'
		]
	});
	Menus.addMenuItem('projectMenu', {
		title: 'Documents',
		state: 'p.documents',
		permissions: ['context.listDocuments'],
		enable: 'true' === FEATURES.enableDocuments
	});
	Menus.addMenuItem('projectMenu', {
		title: 'Invitations',
		state: 'p.invitation.list',
		permissions: ['context.listProjectInvitations'],
		enable: 'true' === FEATURES.enableInvitations
	});
	Menus.addMenuItem('projectMenu', {
		title: 'Groups',
		state: 'p.group.list',
		permissions: ['context.listProjectGroups'],
		enable: 'true' === FEATURES.enableGroups
	});
	Menus.addMenuItem('projectMenu', {
		title: 'Updates',
		state: 'p.communication.list',
		permissions: ['context.listProjectUpdates'],
		enable: 'true' === FEATURES.enableUpdates
	});
	 Menus.addMenuItem('projectMenu', {
		title: 'Complaints',
		state: 'p.complaint.list',
		permissions: ['context.listProjectComplaints'],
	  enable: 'true' === FEATURES.enableComplaints
	});
	Menus.addMenuItem('projectMenu', {
		title: 'Conditions',
		state: 'p.projectcondition.list',
		permissions: ['context.listProjectConditions'],
		enable: 'true' === FEATURES.enableConditions
	});
	Menus.addMenuItem('projectMenu', {
		title: 'Compliance Oversight',
		state: 'p.ir.list',
		permissions: ['context.listInspectionReports'],
		enable: 'true' === FEATURES.enableCompliance
	});
	Menus.addMenuItem('projectMenu', {
		title: 'Valued Components',
		state: 'p.vc.list',
		permissions: ['context.listValuedComponents'],
		enable: 'true' === FEATURES.enableVcs
	});


}]);

