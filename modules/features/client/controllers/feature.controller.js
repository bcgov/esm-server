'use strict';

angular.module ('features')

// -------------------------------------------------------------------------
//
// controller for listing features
//
// -------------------------------------------------------------------------
.controller ('controllerFeatureList',
	['$scope','$rootScope','$stateParams','FeatureModel','NgTableParams',
	function ($scope,$rootScope,$stateParams,FeatureModel,NgTableParams) {


	if ($stateParams.project) {
		console.log ('we have a project : ', $stateParams.project);
		this.title = 'Project Features';
		this.projectId = $stateParams.project;
		this.base = false;
	}
	else {
		console.log ('there is no project');
		this.title = 'Base Features';
		this.projectId = null;
		this.base = true;
	}

	var self = this;

	this.setData = function () {
		var p = (this.base) ? FeatureModel.base () : FeatureModel.forProject (this.projectId);
		p.then (function (data) {
			console.log (data);
			self.collection = data;
			self.tableParams = new NgTableParams ({
				count:50,
				sorting: {name:"asc"}
			}, {dataset: data});
		});
	};

	var unbind = $rootScope.$on('refreshFeatureList', function() {
		self.setData();
	});
	$scope.$on('$destroy', unbind);

	this.setData();
}])


// -------------------------------------------------------------------------
//
// controller for editing or adding features
//
// -------------------------------------------------------------------------
.controller ('controllerEditFeatureModal',
	['$modalInstance','$scope','_','codeFromTitle','FeatureModel','RoleModel',
	function ($modalInstance, $scope,_, codeFromTitle,FeatureModel,RoleModel) {

	var self = this;

	this.mode = $scope.mode;

	this.getRoles = function (project) {
		if (!project) {
			RoleModel.getSystemRoles ().then (function (roles) {
				self.roles = roles.map (function (role) { return role.code; });
				$scope.$apply ();
			});
		} else {
			RoleModel.getRolesInProject (project).then (function (roles) {
				self.roles = roles;
				$scope.$apply ();
			});
		}
	};
	console.log ('project = ',$scope.project);
	if (!$scope.project) {
		this.rolename = 'System Roles';
	} else {
		this.rolename = 'Project Roles';
	}

	if (this.mode === 'add') {
		this.dmode = 'Add';
		FeatureModel.getNew ().then (function (model) {
			self.feature = model;
			self.feature.project = $scope.project;
			self.getRoles ($scope.project);
		});
	} else if (this.mode === 'edit') {
		this.dmode = 'Edit';
		this.feature = FeatureModel.getCopy ($scope.feature);
		FeatureModel.setModel (this.feature);
		self.getRoles (this.feature.project);
	} else {
		this.dmode = 'View';
		this.feature = $scope.feature;
		self.getRoles (this.feature.project);
	}

	this.ok = function () {
		console.log ('roles = ',self.roles);
		this.feature.code = codeFromTitle (this.feature.name);
		if (this.mode === 'add') {
			FeatureModel.saveModel ().then (function (result) {
				$modalInstance.close(result);
			});
		}
		else if (this.mode === 'edit') {
			FeatureModel.saveModel ().then (function (result) {
				$scope.feature = _.cloneDeep (result);
				$modalInstance.close(result);
			});
		}
		else {
			$modalInstance.dismiss ('cancel');
		}
	};
	this.cancel = function () {
		console.log ('cancel clicked');
		$modalInstance.dismiss('cancel');
	};


}])

;

