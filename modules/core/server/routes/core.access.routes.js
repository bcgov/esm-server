'use strict';
// =========================================================================
//
// Routes for Access Control Management
//
// =========================================================================
var dbcontroller = require('../controllers/core.db.controller');
var App = require('../controllers/core.application.controller');
var access = require('../controllers/core.access.controller');

var routes = require('../../../core/server/controllers/core.routes.controller');
var policy = require('../../../core/server/controllers/core.policy.controller');


module.exports = function (app) {
	app.route('/api/access/permission')
	.post(access.routes.addPermission)
	.delete(access.routes.deletePermission);
	
	app.route('/api/access/permissions')
	.post(access.routes.addPermissions)
	.delete(access.routes.deletePermissions);
	
	app.route('/api/access/permission/definition')
	.post(access.routes.addPermissionDefinition)
	.delete(access.routes.deletePermissionDefinition);
	
	app.route('/api/access/permission/definitions')
	.post(access.routes.addPermissionDefinitions)
	.delete(access.routes.deletePermissionDefinitions);
	
	app.route('/api/access/permissionlist/resource/:resource')
	.get(access.routes.getPermissionList);
	
	app.route('/api/access/permissionroles/resource/:resource')
	.get(access.routes.getPermissionRoles);
	
	app.route('/api/access/permissionroleindex/resource/:resource')
	.get(access.routes.getPermissionRoleIndex)
	.put(access.routes.setPermissionRoleIndex);
	
	app.route('/api/access/role')
	.post(access.routes.addRole)
	.delete(access.routes.deleteRole);
	
	app.route('/api/access/roles')
	.post(access.routes.addRoles)
	.delete(access.routes.deleteRoles);
	
	app.route('/api/access/role/definition')
	.post(access.routes.addRoleDefinition)
	.delete(access.routes.deleteRoleDefinition);
	
	app.route('/api/access/role/definitions')
	.post(access.routes.addRoleDefinitions)
	.delete(access.routes.deleteRoleDefinitions);
	
	app.route('/api/access/rolelist/context/:context')
	.get(access.routes.getRoleList);
	
	app.route('/api/access/roleusers/context/:context')
	.get(access.routes.getRoleUsers);

	app.route('/api/access/roleuserindex/context/:context')
		.get(access.routes.getRoleUserIndex)
		.put(access.routes.setRoleUserIndex);

	app.route('/api/access/userroles/purge')
		.put(access.routes.purgeUserRoles);
	app.route('/api/access/userroles/assign')
		.put(access.routes.assignUserRoles);

	app.route('/api/access/userroles/context/:context')
	.get(access.routes.getUserRoles);
	app.route('/api/access/userroles/context/:context/user/:username')
	.get(access.routes.getUserRoles);
	
	app.route('/api/access/alluserroles/context/:context')
	.get(access.routes.getAllUserRoles);
	app.route('/api/access/alluserroles/context/:context/user/:username')
	.get(access.routes.getAllUserRoles);


	app.route('/api/access/globalprojectroles')
		.get(access.routes.getGlobalProjectRoles);


	app.route('/api/access/permissions/context/:context/resource/:resource')
	.get(access.routes.userPermissions);
	app.route('/api/access/permissions/context/:context/resource/:resource/user/:username')
	.get(access.routes.userPermissions);
	
	app.route('/api/access/addroleifunique/context/:context')
	.put(access.routes.addRoleIfUnique);
	
	app.route('/api/access/allusers')
	.get(access.routes.allusers);

	app.route('/api/access/users/context/:context')
		.get(access.routes.getContextUsers);

	app.route('/api/access/session/reset')
		.get(routes.resetSessionContext(function (opts, req) {
			//console.log('return opts = ', JSON.stringify(opts));
			return opts;
		}));

	
	app.route('/api/application')
	.all(routes.setModel(App))
	.get(routes.runModel(function (model, req) {
		//console.log('about to run get the one');
		return model.getTheOne();
	}));
	//
	// allow database modifications
	//
	app.route('/api/db/modify')
	.all(policy('admin'))
	.post(dbcontroller.post)
	.put(dbcontroller.put)
	.delete(dbcontroller.delete);

	app.route('/api/db/:model')
	.all(policy('admin'))
	.get(dbcontroller.get);

	app.route('/api/access/conversion')
	.all(policy('admin'))
	.get(access.routes.allusers)
	.put(access.routes.convertusers);
};

