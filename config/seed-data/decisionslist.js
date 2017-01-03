var milestones = [{
    code: 'project-description',
    name: 'Project Description',
    description: 'Project Description',
    artifactType: 'Project Description'
},{
    code: 'section-10-1-a-order',
    name: 'Section 10(1)(a) Order',
    description: 'Section 10(1)(a) Order',
    artifactType: 'Section 10(1)(a) Order'
},{
    code: 'section-10-1-b-order',
    name: 'Section 10(1)(b) Order',
    description: 'Section 10(1)(b) Order',
    artifactType: 'Section 10(1)(b) Order'
},{
    code: 'section-10-1-c-order',
    name: 'Section 10(1)(c) Order',
    description: 'Section 10(1)(c) Order',
    artifactType: 'Section 10(1)(c) Order'
},{
    code: 'section-11-order',
    name: 'Section 11 Order',
    description: 'Section 11 Order',
    artifactType: 'Section 11 Order'
},{
    code: 'section-7-3-order',
    name: 'Section 7(3) Order',
    description: 'Section 7(3) Order',
    artifactType: 'Section 7(3) Order'
},{
    code: 'valued-component',
    name: 'Valued Component',
    description: 'Valued Component',
    artifactType: 'Valued Component'
},{
    code: 'section-11-schedule-a',
    name: 'Section 11 Schedule A',
    description: 'Section 11 Schedule A',
    artifactType: 'Section 11 Schedule A'
},{
    code: 'section-34-order',
    name: 'Section 34 Order',
    description: 'Section 34 Order',
    artifactType: 'Section 34 Order'
},{
    code: 'section-36-order',
    name: 'Section 36 Order',
    description: 'Section 36 Order',
    artifactType: 'Section 36 Order'
},{
    code: 'section-36-schedule-a',
    name: 'Section 36 Schedule A',
    description: 'Section 36 Schedule A',
    artifactType: 'Section 36 Schedule A'
},{
    code: 'section-36-schedule-b',
    name: 'Section 36 Schedule B',
    description: 'Section 36 Schedule B',
    artifactType: 'Section 36 Schedule B'
},{
    code: 'inspection-report',
    name: 'Inspection Report',
    description: 'Inspection Report',
    artifactType: 'Inspection Report'
},{
    code: 'environmental-assessment-certificate',
    name: 'Environmental Assessment Certificate',
    description: 'Environmental Assessment Certificate',
    artifactType: 'Environmental Assessment Certificate'
}];

var activities = [{
    code: 'decision',
    name: 'Artifact Decision',
    description: 'Decision on Artifact',
    state: 'p.artifact.decision'
}];

var templates = [{
    "artifact" : null,
    "templateType" : "Artifact",
    "sections" : [
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Memo to the Minister from the Associate Deputy Minister",
                    "type" : "Artifact",
                    "name" : "a"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{a}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Memo to the Minister from the Associate Deputy Minister",
            "name" : "memo1"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Recommendations of the Executive Director",
                    "type" : "Artifact",
                    "name" : "b"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{b}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Recommendations of the Executive Director",
            "name" : "memo2"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Environmental Certificate",
                    "type" : "Artifact",
                    "name" : "c"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{c}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Environmental Certificate",
            "name" : "memo3"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Schedule A: Certified Project Description",
                    "type" : "Artifact",
                    "name" : "d"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{d}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Schedule A: Certified Project Description",
            "name" : "pd"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Schedule B: Table of Conditions",
                    "type" : "Artifact",
                    "name" : "e"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{e}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Schedule B: Table of Conditions",
            "name" : "conds"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Application",
                    "type" : "Artifact",
                    "name" : "f"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{f}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Application",
            "name" : "app"
        }
    ],
    "versionNumber" : 1,
    "documentType" : "Referral Package",
    "code" : "referral-package"
},{
    "artifact" : null,
    "templateType" : "Artifact",
    "sections" : [
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Memo to the Minister from the Associate Deputy Minister",
                    "type" : "Artifact",
                    "name" : "a"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{a}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Memo to the Minister from the Associate Deputy Minister",
            "name" : "memo1"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Recommendations of the Executive Director",
                    "type" : "Artifact",
                    "name" : "b"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{b}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Recommendations of the Executive Director",
            "name" : "memo2"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Assessment Report",
                    "type" : "Artifact",
                    "name" : "ar"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{ar}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Assessment Report",
            "name" : "assessr"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Application",
                    "type" : "Artifact",
                    "name" : "f"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{f}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Application",
            "name" : "app"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Environmental Certificate",
                    "type" : "Artifact",
                    "name" : "c"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{c}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Environmental Certificate",
            "name" : "memo3"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Schedule A: Certified Project Description",
                    "type" : "Artifact",
                    "name" : "d"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{d}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Schedule A: Certified Project Description",
            "name" : "pd"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Schedule B: Table of Conditions",
                    "type" : "Artifact",
                    "name" : "e"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{e}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Schedule B: Table of Conditions",
            "name" : "conds"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Reasons for Ministers Decision",
                    "type" : "Artifact",
                    "name" : "g"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "{{g}}",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Reason for Ministers Decision",
            "name" : "rg"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Signature",
                    "type" : "Html",
                    "name" : "si"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "Signed<br><img src='{{si}}'>",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "Signature",
            "name" : "sig"
        }
    ],
    "versionNumber" : 1,
    "documentType" : "Decision Package",
    "code" : "decision-package"
}];

var artifacttypes = [
    { name: 'Application', phase: '', multiple: false, isTemplate: false, isDocument: true, code: 'application', milestone: 'application', versions : [ 'Final' ], stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
    //{ name: 'Decision Package', phase: 'decision', code: 'decision-package', milestone: 'decision-package', multiple: false, isTemplate: true, isDocument: false, versions : [ 'Final' ], stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
    { name: 'Documents', phase: '', multiple: true, isTemplate: false, isDocument: false, code: 'documents', milestone: 'documents', versions : [ 'Final' ], stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
    //{ name: 'Environmental Assessment Certificate Template', phase: '', milestone: 'environmental-assessment-certificate',code: 'environmental-assessment-certificate',multiple: false,versions: ['Draft','Final'], stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
    { name: 'Memo to the Minister from the Associate Deputy Minister', phase: 'review', multiple: false, isTemplate: false, isDocument:true, code: 'memo-adm', milestone: 'memo-adm', versions : [ 'Final'], stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
    { name: 'Recommendations of the Executive Director', phase: 'review', multiple: false, isTemplate: false, isDocument: true, code: 'memo-epd', milestone: 'memo-epd', versions : [ 'Final' ], stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
    //{ name: 'Referral Package', phase: 'review', code: 'referral-package', milestone: 'referral-package', multiple: false, isTemplate: true, isDocument: false, versions : [ 'Final' ], stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
];


module.exports = {
	templates:templates,
    activities:activities,
	milestones:milestones,
	artifacttypes:artifacttypes
};
