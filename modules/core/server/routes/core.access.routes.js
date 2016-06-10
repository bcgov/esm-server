'use strict';
// =========================================================================
//
// Routes for Access Control Management
//
// =========================================================================
var dbcontroller = require ('../controllers/core.db.controller');
var access = require ('../controllers/core.access.controller');
var helpers      = require ('../controllers/core.helpers.controller');
var policy       = require ('../policies/core.route.policy');


module.exports = function (app) {
	app.route ('/api/access/permission')
		.post (access.routes.addPermission)
		.delete (access.routes.deletePermission);

	app.route ('/api/access/permissions')
		.post (access.routes.addPermissions)
		.delete (access.routes.deletePermissions);

	app.route ('/api/access/permission/definition')
		.post (access.routes.addPermissionDefinition)
		.delete (access.routes.deletePermissionDefinition);

	app.route ('/api/access/permission/definitions')
		.post (access.routes.addPermissionDefinitions)
		.delete (access.routes.deletePermissionDefinitions);

	app.route ('/api/access/permissionlist/resource/:resource')
		.get (access.routes.getPermissionList);

	app.route ('/api/access/permissionroles/resource/:resource')
		.get (access.routes.getPermissionRoles);


	app.route ('/api/access/role')
		.post (access.routes.addRole)
		.delete (access.routes.deleteRole);

	app.route ('/api/access/roles')
		.post (access.routes.addRoles)
		.delete (access.routes.deleteRoles);

	app.route ('/api/access/role/definition')
		.post (access.routes.addRoleDefinition)
		.delete (access.routes.deleteRoleDefinition);

	app.route ('/api/access/role/definitions')
		.post (access.routes.addRoleDefinitions)
		.delete (access.routes.deleteRoleDefinitions);

	app.route ('/api/access/rolelist/context/:context')
		.get (access.routes.getRoleList);

	app.route ('/api/access/roleusers/context/:context')
		.get (access.routes.getRoleUsers);

	app.route ('/api/access/userroles/context/:context')
		.get (access.routes.getUserRoles);

	app.route ('/api/access/userroles/context/:context/user/:username')
		.get (access.routes.getUserRoles);


	app.route ('/api/access/permissions/context/:context/resource/:resource')
		.get (access.routes.userPermissions);
	app.route ('/api/access/permissions/context/:context/resource/:resource/user/:username')
		.get (access.routes.userPermissions);
	//
	// allow database modifications
	//
	app.route ('/api/db/modify').all(helpers.isAdmin)
		.post (dbcontroller.post)
		.put (dbcontroller.put)
		.delete (dbcontroller.delete);
};

