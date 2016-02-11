/*
controllerEAOProjectNew.$inject = ['Project', '$state'];
// @ngInject
function controllerEAOProjectNew(Project, $state) {
    var projectEntry = this;

    projectEntry.questions = Project.getProjectIntakeQuestions();
    projectEntry.form = {curTab:''};

    // Get blank project
    Project.getNewProject().then( function(res) {
        projectEntry.project = res.data;
    });

    projectEntry.submitProject = function() {
        projectEntry.project.status = 'Submitted';
        projectEntry.saveProject();
    };

    projectEntry.saveProject = function() {
        Project.addProject(projectEntry.project).then( function(res) {
            // go to the edit page for the same project.
            // this time provide a tab for continuty
            $state.go('eao.editproject', { id: res.data._id, tab: projectEntry.form.curTab });
        });
    };

} */

'use strict';

angular.module('organizations').controller('controllerOrganizationsDisplayEdit', ['$scope', '$filter', 'Organizations', '$state',
    function ($scope, $filter, Organizations, $state ) {
        var displayEdit = this;

        displayEdit.options = JSON.parse($scope.options); // Why must I use scope? Why doesn't controllerAs take care of making displayEdit synonymous with displayEdit?

        console.log (displayEdit.options);

        Organizations.getOrganization({id: displayEdit.options.organizationId}).then(
            function(res) {
                displayEdit.organization = res.data;
            },
            function(data) {
                $state.go('list');
            }
        );

        displayEdit.provs = ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK", "NT", "NU", "YT"];

        displayEdit.submit = function() {
            console.log("submit called");

            Organizations.updateOrganization(displayEdit.organization).then( function(res) {
                console.log(res);
                // go to the edit page for the same project.
                // this time provide a tab for continuty
                $state.go('view', { organizationId: res.data._id});
            });
        };


    }
]);
