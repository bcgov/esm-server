'use strict';
// =========================================================================
//
// this is the project data model (service). This is how all project data
// is accessed through the front end
//
// =========================================================================
angular.module('inspectionReport').factory ('InspectionReportModel', function (ModelBase, _) {
    //
    // build the project model by extending the base model. the base model will
    // have all the basic crud stuff built in
    //
    var InspectionReportClass = ModelBase.extend ({
        urlName: 'inspectionreport',
        forProject: function (projectid) {
			return this.get ('/api/inspectionreport/for/project/'+projectid);
		},
    });

    return new InspectionReportClass ();
});
