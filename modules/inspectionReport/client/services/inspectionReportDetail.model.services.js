'use strict';
// =========================================================================
//
// this is the project data model (service). This is how all project data
// is accessed through the front end
//
// =========================================================================
angular.module('inspectionReport').factory ('InspectionReportDetailModel', function (ModelBase, _) {
    //
    // build the project model by extending the base model. the base model will
    // have all the basic crud stuff built in
    //
    var InspectionReportDetail = ModelBase.extend ({
        urlName: 'inspectionreportdetail'
    });

    return new InspectionReportDetail ();
});
