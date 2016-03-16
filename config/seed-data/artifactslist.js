var milestonebases = [{
	code: 'project-description',
	name: 'Project Description',
	description: 'Project Description',
	artifactType: 'Project Description'
}];

var activitybases = [{
	code: 'edit',
	name: 'Edit Document',
	description: 'Edit Document',
	state: 'p.artifact.edit',
    read: ['project:eao:admin'],
    write: ['project:pro:member'],
    submit: ['project:pro:admin']
},{
	code: 'review',
	name: 'Review Document',
	description: 'Review Document',
	state: 'p.artifact.review',
    read: ['project:pro:admin','project:pro:member'],
    write: ['project:eao:member'],
    submit: ['project.eao.admin']
},{
	code: 'approve',
	name: 'Approve Document',
	description: 'Approve Document',
	state: 'p.artifact.approve',
    read: ['project:pro:admin','project:pro:member'],
    write: ['project:eao:member'],
    submit: ['project.eao.admin']
},{
	code: 'executive',
	name: 'Executive Approve Document',
	description: 'Executive Approve Document',
	state: 'p.artifact.executive',
    read: ['project:pro:admin','project:pro:member'],
    write: ['project:eao:member'],
    submit: ['project.eao.admin']
},{
	code: 'publish',
	name: 'Publish Document',
	description: 'Publish Document',
	state: 'p.artifact.publish',
    read: ['project:pro:admin','project:pro:member'],
    write: ['project:eao:member'],
    submit: ['project.eao.admin']
},{
	code: 'notify',
	name: 'Notify Document',
	description: 'Notify Document',
	state: 'p.artifact.notify',
    read: ['project:pro:admin','project:pro:member'],
    write: ['project:eao:member'],
    submit: ['project.eao.admin']
}];

var artifacttypes = [{
	type: 'Project Description',
	isTemplate: true,
	multiple: false,
	versions : [
		'Submission',
		'Draft',
		'Final',
		'Draft for Draft AIR',
		'Final for Draft AIR',
		'Draft for AIR',
		'Final for AIR',
		'Draft for Application',
		'Certified (Schedule A)'
	],
	milestone: 'project-description',
	stages: [{
		name: 'Edit',
        next: 'Review',
        prev: '',
		activity: 'edit'
	},{
		name: 'Review',
        next: 'Approval',
        prev: 'Edit',
		activity: 'review'
	},{
		name: 'Approval',
        next: 'Executive Approval',
        prev: 'Review',
		activity: 'approve'
	},{
		name: 'Executive Approval',
        next: 'Publishing',
        prev: 'Approval',
		activity: 'executive'
	},{
		name: 'Publishing',
        next: 'Notification',
        prev: 'Executive Approval',
		activity: 'publish'
	},{
		name: 'Notification',
        next: '',
        prev: 'Publishing',
		activity: 'notify'
	}]
}];

var templates = [{
    "sections" : [
        {
            "meta" : [
                {
                    "default" : "sad",
                    "label" : "Happy",
                    "type" : "Text",
                    "name" : "happy"
                }
            ],
            "footer" : "",
            "header" : "",
            "template" : "<h1>Executive Summary</h1>\n<p>{{happy}}</p>",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : false,
            "label" : "",
            "name" : "execsummary"
        },
        {
            "meta" : [
                {
                    "default" : "",
                    "label" : "Title",
                    "type" : "Text",
                    "name" : "title"
                },
                {
                    "default" : "",
                    "label" : "Foot Note",
                    "type" : "Text",
                    "name" : "footnote"
                },
                {
                    "default" : "",
                    "label" : "Apple Type",
                    "type" : "Text",
                    "name" : "apple"
                },
                {
                    "default" : "",
                    "label" : "Colour",
                    "type" : "Text",
                    "name" : "colour"
                },
                {
                    "default" : "",
                    "label" : "Fruit",
                    "type" : "Html",
                    "name" : "fruit"
                }
            ],
            "footer" : "<hr/>\n<div><i>all boundaries have been approved</i></div>",
            "header" : "<h1>Boundaries</h1>",
            "template" : "<h2>{{apple}} Apple</h2>\n<p>this is my apple and it is {{colour}}</p>\n\n<h3>Things about it</h3>\n{{fruit}}",
            "isfooter" : true,
            "isheader" : true,
            "multiple" : true,
            "optional" : false,
            "label" : "",
            "name" : "boundaries"
        },
        {
            "meta" : [],
            "footer" : "",
            "header" : "",
            "template" : "this is an optional final paragraph",
            "isfooter" : false,
            "isheader" : false,
            "multiple" : false,
            "optional" : true,
            "label" : "final",
            "name" : "fInal"
        }
    ],
    "versionNumber" : 10,
    "documentType" : "Project Description"
}];

module.exports = {
	templates:templates,
	milestonebases:milestonebases,
	activitybases:activitybases,
	artifacttypes:artifacttypes
};
