'use strict';

angular.module('control')
	.controller('controllerControlOrderDetail', controllerControlOrderDetail);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Ordr Detail
//
// -----------------------------------------------------------------------------------
controllerControlOrderDetail.$inject = ['$modalInstance', 'rProject', 'rContext'];
//
function controllerControlOrderDetail($modalInstance, rProject, rContext) {
	var ctrlOrderDetail = this;

	ctrlOrderDetail.project = rProject;
	ctrlOrderDetail.context = rContext;
 
	// TODO: attach an order to a project

	ctrlOrderDetail.ok = function () { $modalInstance.close(); };
	ctrlOrderDetail.cancel = function () { $modalInstance.dismiss('cancel'); };

}    
