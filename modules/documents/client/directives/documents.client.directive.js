'use strict';

angular.module('documents')
    .directive('tmplDocumentsUploadGeneral', directiveDocumentsUploadGeneral)
    .directive('tmplDocumentsLink', directiveDocumentsLink)
    .directive('tmplDocumentsUploadClassify', directiveDocumentsUploadClassify)        
    .directive('tmplDocumentsList', directiveDocumentsList)   
    .directive('tmplDocumentsBrowser', directiveDocumentsBrowser) 
    .directive('tmplDocumentsApprovals', directiveDocumentsApprovals)                
    .directive('modalDocumentUploadReview', directiveModalDocumentUploadReview)
    .directive('modalDocumentLink', directiveModalDocumentLink)
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
// CONTROLLER: Document Link General
//
// -----------------------------------------------------------------------------------
function directiveDocumentsLink() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/documents/client/views/partials/document-link.html',
        scope: {
            project: '=',
            type: '@',  //project or comment
            current: '=',
            parentId: '=',
        },
        controller: 'controllerDocumentLinkGlobal',
        controllerAs: 'docLink'
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
            project: '='
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
// DIRECTIVE: Link in a modal
//
// -----------------------------------------------------------------------------------
directiveModalDocumentLink.$inject = ['$modal', '$rootScope'];
/* @ngInject */
function directiveModalDocumentLink($modal, $rootScope) {
    var directive = {
        restrict:'A',
        scope: {
            project: '=',
            current: '='
        },
        link : function(scope, element, attrs) {
            element.on('click', function() {
                console.log("Docs Current: ",attrs.current);
                var modalDocLink = $modal.open({
                    animation: true,
                    templateUrl: 'modules/documents/client/views/partials/modal-document-link.html',
                    controller: 'controllerModalDocumentLink',
                    controllerAs: 'docLinkModal',
                    size: 'lg',
                    resolve: {
                        rProject: function() { return scope.project; },
                        rCurrent: function() { return scope.current; }
                    }
                });
                modalDocLink.result.then(function (data) {
                    console.log("New set of Documents:",data);
                    $rootScope.$broadcast('refreshDocumentList');
                }, function () {});
            });
        }
    };
    return directive;
}   // -----------------------------------------------------------------------------------
//
// DIRECTIVE: Upload in a modal
//
// -----------------------------------------------------------------------------------
directiveModalDocumentUploadClassify.$inject = ['$modal', '$rootScope'];
/* @ngInject */
function directiveModalDocumentUploadClassify($modal, $rootScope) {
    var directive = {
        restrict:'A',
        scope: {
            project: '='
        },
        link : function(scope, element, attrs) {
            element.on('click', function() {
                var modalDocUpload = $modal.open({
                    animation: true,
                    templateUrl: 'modules/documents/client/views/partials/modal-document-upload-classify.html',
                    controller: 'controllerModalDocumentUploadClassify',
                    controllerAs: 'docUploadModal',
                    size: 'lg',
                    resolve: {
                        rProject: function() { return scope.project; }
                    }
                });
                modalDocUpload.result.then(function (data) {
                    $rootScope.$broadcast('refreshDocumentList');
                }, function () {});
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
directiveModalDocumentUploadReview.$inject = ['$modal', '$rootScope'];
/* @ngInject */
function directiveModalDocumentUploadReview($modal, $rootScope) {
    var directive = {
        restrict:'A',
        scope: {
            project: '='
        },
        link : function(scope, element, attrs) {
            element.on('click', function() {
                var modalDocUpload = $modal.open({
                    animation: true,
                    templateUrl: 'modules/documents/client/views/partials/modal-document-upload-review.html',
                    controller: 'controllerModalDocumentUploadReview',
                    controllerAs: 'docUploadModalReview',
                    size: 'lg',
                    resolve: {
                        rProject: function() { return scope.project; }
                    }
                });
                modalDocUpload.result.then(function (data) {
                    $rootScope.$broadcast('refreshDocumentList');
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
