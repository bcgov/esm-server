'use strict';

angular.module('organizations').controller('controllerOrganizationsDisplayEdit', ['$scope', '$filter', 'Organizations', '$state', 'PROVINCES', 'COMPANY_TYPES',
    function ($scope, $filter, Organizations, $state, PROVINCES, COMPANY_TYPES ) {
        var displayEdit = this;

        displayEdit.options = JSON.parse($scope.options); // Why must I use scope? Why doesn't controllerAs take care of making displayEdit synonymous with displayEdit?
        displayEdit.provs = PROVINCES;
        displayEdit.companyTypes = COMPANY_TYPES;

        // Is this a new entry? If so, let's create it...
        if (displayEdit.options.mode === "add") {

        } else
        // If this isn't a new entry, If the ID is wrong let's go back to the list.
        {
            Organizations.getOrganization({id: displayEdit.options.organizationId}).then(
                function(res) {
                    displayEdit.organization = res.data;
                },
                function(data) {
                    $state.go('list');
                }
            );
        }

        displayEdit.submit = function() {
            if (displayEdit.options.mode === "add") {
                Organizations.addOrganization(displayEdit.organization).then( function(res) {
                    console.log(res);
                    $state.go('view', { organizationId: res.data._id});
                    // go to the edit page for the same project.
                    // this time provide a tab for continuty
                    // $state.go('eao.editproject', { id: res.data._id, tab: projectEntry.form.curTab });
                });
            } else {
                Organizations.updateOrganization(displayEdit.organization).then( function(res) {
                    console.log(res);
                    // go to the edit page for the same project.
                    // this time provide a tab for continuty
                    $state.go('view', { organizationId: res.data._id});
                });
            }
        };

        displayEdit.cancel = function() {
            if (displayEdit.options.mode === "add") {
                $state.go('list');
            } else {
                $state.go('view', {organizationId: displayEdit.organization._id});
            }
        };

        displayEdit.remove = function() {
            if (confirm('Are you sure you want to delete this organization?')) {
                Organizations.deleteOrganization({id: displayEdit.options.organizationId}).then(
                    function (res) {
                        $state.go('list');
                    }
                );
            }
        };
    }
]);
