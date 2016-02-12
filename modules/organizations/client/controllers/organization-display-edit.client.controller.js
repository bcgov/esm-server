'use strict';

angular.module('organizations').controller('controllerOrganizationsDisplayEdit', ['$scope', '$filter', 'Organizations', '$state', 'PROVINCES', 'COMPANY_TYPES',
    function ($scope, $filter, Organizations, $state, PROVINCES, COMPANY_TYPES ) {
        var displayEdit = this;

        displayEdit.organizationId = $scope.organizationId;
        displayEdit.mode = $scope.mode;

        displayEdit.provs = PROVINCES;
        displayEdit.companyTypes = COMPANY_TYPES;

        // Is this a new entry? If so, let's create it...
        if (displayEdit.mode === "add") {

        } else
        // If this isn't a new entry, If the ID is wrong let's go back to the list.
        {
            Organizations.getOrganization({id: displayEdit.organizationId}).then(
                function(res) {
                    displayEdit.organization = res.data;
                },
                function(data) {
                    $state.go('organization.list');
                }
            );
        }

        displayEdit.submit = function() {
            if (displayEdit.mode === "add") {
                Organizations.addOrganization(displayEdit.organization).then( function(res) {
                    $state.go('organization.view', { organizationId: res.data._id});
                });
            } else {
                Organizations.updateOrganization(displayEdit.organization).then( function(res) {
                    $state.go('organization.view', { organizationId: res.data._id});
                });
            }
        };

        displayEdit.cancel = function() {
            if (displayEdit.mode === "add") {
                $state.go('list');
            } else {
                $state.go('organization.view', {organizationId: displayEdit.organization._id});
            }
        };

        displayEdit.remove = function() {
            if (confirm('Are you sure you want to delete this organization?')) {
                Organizations.deleteOrganization({id: displayEdit.organizationId}).then(
                    function (res) {
                        $state.go('organization.list');
                    }
                );
            }
        };
    }
]);
