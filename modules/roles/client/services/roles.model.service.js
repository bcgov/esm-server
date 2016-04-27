'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('roles').factory ('RoleModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'role',
		getUsersForRole : function (rolecode) {
			return this.get ('/api/users/in/role/'+rolecode);
		},
		getRolesInProject : function (projectId) {
			return this.get ('/api/roles/project/'+projectId);
		},
		getUsersInRolesInProject: function (projectId) {
			return this.get ('/api/users/roles/project/'+projectId);
		},
		getProjectsWithRole: function (rolecode) {
			return this.get ('/api/projects/with/role/'+rolecode);
		},
		addSystemRole: function (rolecode) {
			return this.add ({code:rolecode});
		},
		addProjectRole: function (projectCode, orgCode, rolecode) {
			return this.add ({code:projectCode+':'+orgCode+':'+rolecode});
		},
		setRoleUsers: function (rolecode, userIdArray) {
			return this.put ('/api/role/'+rolecode, {users:userIdArray});
		},
		getSystemRoles: function () {
			return this.get ('/api/system/roles/assignable');
		}
	});
	return new Class ();
});
