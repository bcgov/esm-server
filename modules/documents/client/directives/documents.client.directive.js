'use strict';

angular.module('documents')
    .directive('tmplDocumentsUploadGeneral', directiveDocumentsUploadGeneral)
    .directive('tmplDocumentsUploadClassify', directiveDocumentsUploadClassify)        
    .directive('tmplDocumentsList', directiveDocumentsList)   
    .directive('tmplDocumentsBrowser', directiveDocumentsBrowser) 
    .directive('tmplDocumentsApprovals', directiveDocumentsApprovals)                
    .directive('modalDocumentUploadClassify', directiveModalDocumentUploadClassify);

    // .directive('modalDocumentViewer', directiveModalDocumentViewer)
    // .directive('modalDocumentBuckets', directiveModalDocumentBuckets);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Document Upload General
//
// -----------------------------------------------------------------------------------
function directiveDocumentsUploadGeneral() {

    var directive = {
        restrict: 'E',
        templateUrl: 'modules/documents/client/views/partials/document-upload-general.html',
        scope: {
            project: '=',
            type: '@',
            hideUploadButton: '=',
            parentId: '='
        },
        controller: 'controllerDocumentUploadGlobal',
        controllerAs: 'docUpload'
    };

    return directive;
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Document Upload General
//
// -----------------------------------------------------------------------------------
function directiveDocumentsUploadClassify() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/documents/client/views/partials/document-upload-classify.html',
        scope: {
            project: '=',
            type: '@',  //project or comment
            hideUploadButton: '=',
            parentId: '='
        },
        controller: 'controllerDocumentUploadGlobal',
        controllerAs: 'docUpload'
    };

    return directive;
}    
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Document List Table
//
// -----------------------------------------------------------------------------------
function directiveDocumentsList() {

    var directive = {
        restrict: 'E',
        templateUrl: 'modules/documents/client/views/partials/document-list.html',
        controller: 'controllerDocumentList',
        controllerAs: 'docList',
        scope: {
            documents: '=',
            filterBy: '='
        }
    };

    return directive;
}    
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Document Browser
//
// -----------------------------------------------------------------------------------
directiveDocumentsBrowser.$inject = ['$modal'];
/* @ngInject */
function directiveDocumentsBrowser() {

    var directive = {
        restrict: 'E',
        replace: true,
        templateUrl: 'modules/documents/client/views/partials/document-browser.html',
        controller: 'controllerDocumentBrowser',
        controllerAs: 'docBrowser',
        scope: {
            project: '=',
        }
    };

    return directive;
}   
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Documents for Approval
//
// -----------------------------------------------------------------------------------
directiveDocumentsApprovals.$inject = ['$modal'];
/* @ngInject */
function directiveDocumentsApprovals() {

    var directive = {
        restrict: 'E',
        replace: true,
        templateUrl: 'modules/documents/client/views/partials/document-approvals.html',
        controller: 'controllerDocumentBrowser',
        controllerAs: 'docBrowser',
        scope: {
            project: '=',
        }
    };

    return directive;
}   


// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal document viewer
//
// -----------------------------------------------------------------------------------
directiveModalDocumentViewer.$inject = ['$modal'];
/* @ngInject */
function directiveModalDocumentViewer($modal) {
    var directive = {
        restrict:'A',
        link : function(scope, element, attrs) {
            element.on('click', function() {
                var modalDocView = $modal.open({
                    animation: true,
                    templateUrl: 'modules/documents/client/views/partials/modal_document_viewer.html',
                    controller: 'controllerModalDocumentViewer',
                    controllerAs: 'md',
                    size: 'lg'
                });
                modalDocView.result.then(function () {}, function () {});
            });
        }
    };
    return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Upload in a modal
//
// -----------------------------------------------------------------------------------
directiveModalDocumentUploadClassify.$inject = ['$modal'];
/* @ngInject */
function directiveModalDocumentUploadClassify($modal) {
    var directive = {
        restrict:'A',
        scope: {
            doc: '=',
            project: '='
        },
        link : function(scope, element, attrs) {
            element.on('click', function() {
                var modalDocBuckets = $modal.open({
                    animation: true,
                    templateUrl: 'modules/documents/client/views/partials/modal-document-upload-classify.html',
                    controller: 'controllerModalDocumentBuckets',
                    controllerAs: 'docUpload',
                    size: 'md',
                    resolve: {
                        rDoc: function() { return scope.doc; },
                        rProject: function() { return scope.project; }
                    }
                });
                modalDocBuckets.result.then(function (data) {
                    scope.doc = data;
                }, function () {});
            });
        }
    };
    return directive;
}   

// // -----------------------------------------------------------------------------------
// //
// // DIRECTIVE: Modal document Tags
// //
// // -----------------------------------------------------------------------------------
// directiveModalDocumentBuckets.$inject = ['$modal'];
// /* @ngInject */
// function directiveModalDocumentBuckets($modal) {
//     var directive = {
//         restrict:'A',
//         scope: {
//             doc: '=',
//             project: '='
//         },
//         link : function(scope, element, attrs) {
//             element.on('click', function() {
//                 var modalDocBuckets = $modal.open({
//                     animation: true,
//                     templateUrl: 'modules/documents/client/views/partials/modal_document_buckets.html',
//                     controller: 'controllerModalDocumentBuckets',
//                     controllerAs: 'docBuckets',
//                     size: 'md',
//                     resolve: {
//                         rDoc: function() { return scope.doc; },
//                         rProject: function() { return scope.project; }
//                     }
//                 });
//                 modalDocBuckets.result.then(function (data) {
//                     scope.doc = data;
//                 }, function () {});
//             });
//         }
//     };
//     return directive;
// }   
