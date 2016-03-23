'use strict';

angular.module('organizations').controller('controllerOrganizationsDisplayEdit', ['$scope', '$filter', 'OrganizationModel', '$state', 'PROVINCES', 'COMPANY_TYPES',
    function ($scope, $filter, sOrganizationModel, $state, PROVINCES, COMPANY_TYPES ) {
        var displayEdit = this;

        displayEdit.organizationId = $scope.organizationId;
        displayEdit.mode = $scope.mode;

        displayEdit.provs = PROVINCES;
        displayEdit.companyTypes = COMPANY_TYPES;

        $scope.$watch( 'organizationId', function(newValue) {
            if (newValue) {
                if (newValue === 'new') {
                    // console.log('new');
                    sOrganizationModel.getNew().then( function(data) {
                        // console.log(data);
                        displayEdit.organization = data;
                        $scope.$apply();
                    });
                } else {
                    // console.log('edit');
                    sOrganizationModel.getModel({id: newValue}).then( function(data) {
                        displayEdit.organization = data;
                    });
                }
            }
        });


        displayEdit.submit = function(form) {
            // console.log('submit', form);

            sOrganizationModel.setModel(displayEdit.organization);

            if (form.$valid) {
                sOrganizationModel.saveModel().then( function(data) {
                    $state.go('organization.view', { organizationId: data._id});
                });

            }

            // if (displayEdit.mode === "add") {
            //     sOrganizationModel.addOrganization(displayEdit.organization).then( function(res) {
            //         $state.go('organization.view', { organizationId: res.data._id});
            //     });
            // } else {
            //     sOrganizationModel.updateOrganization(displayEdit.organization).then( function(res) {
            //         $state.go('organization.view', { organizationId: res.data._id});
            //     });
            // }
        };

        displayEdit.cancel = function() {
            $state.go('organization.list');
        };

        // displayEdit.remove = function() {
        //     if (confirm('Are you sure you want to delete this organization?')) {
        //         sOrganizationModel.deleteOrganization({id: displayEdit.organizationId}).then(
        //             function (res) {
        //                 $state.go('organization.list');
        //             }
        //         );
        //     }
        // };
    }
]);
