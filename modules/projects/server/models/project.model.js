'use strict';

var mongoose = require ('mongoose');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema ({
	code       : { type:String, default:'New Project', index:true },
	stream     : { type:'ObjectId', ref:'Stream'     , index:true },
	name                           : { type:String, default:'New Project' },
	//proponent                      : { type:'ObjectId', ref:'Entity'},
	proponent                      : {
		name : { type:String, default:'' },
		type : { type:String, default:'' }
	},
	//type                           : { type:'ObjectId', ref:'ProjectType'},
	type                           : { type:String, default:'' },
	description                    : { type:String, default:'' },
	region                         : { type:String, default:'' },     // object id
	//
	// location is a free form string entry
	//
	location                       : { type:String, default:'' },
	//
	// phase data is stored below, so these are merely keys into that data
	//
	currentPhaseCode               : { type:String, default:'' },
	nextPhaseCode                  : { type:String, default:'' },
	dateCurrentPhaseEstimatedStart : { type: Date, default: Date.now },
	dateCurrentPhaseEstimatedEnd   : { type: Date, default: Date.now },
	dateNextPhaseEstimatedStart    : { type: Date, default: Date.now },
	overallProgress                : { type:Number, default:0 },
	lat                            : { type:Number, default:0 },
	lon                            : { type:Number, default:0 },
	currentCommentPeriod           : {
		code       : { type:String, default:'' },
		dateOpen   : { type: Date, default: Date.now },
		dateClosed : { type: Date, default: Date.now },
	},
	// intake :  [
	// 	{
	// 		q :  { type:String, default:'' }, // question1,
	// 		a :  { type:String, default:'' } // answer1
	// 	}
	// ],
	// phases :  {
	// 	intake : {
	// 		code :  { type:String, default:'' }, // intake,
	// 		name : { type:String, default:'' }, // Intake,
	// 		requirements : [],
	// 		progress : { type:Number, default:0 },
	// 		dateEstimatedStart : { type: Date, default: Date.now },
	// 		dateEstimatedEnd : { type: Date, default: Date.now },
	// 		dateActualStart : { type: Date, default: Date.now },
	// 		dateActualEnd : { type: Date, default: Date.now }
	// 	}
	// },
	// milestones :  [
	// 	{
	// 		code : { type:String, default:'' },
	// 		name : { type:String, default:'' },
	// 		phases : [], // an array of phase codes or ids,
	// 		dateEstimatedStart : { type: Date, default: Date.now },
	// 		dateEstimatedEnd : { type: Date, default: Date.now },
	// 		dateActualStart : { type: Date, default: Date.now },
	// 		dateActualEnd : { type: Date, default: Date.now },
	// 		preMetRequirements : [], // comma delimeted list of requirement codes, each needs to be met to transition to this milestone,
	// 		requirements : [{}],
	// 		buckets :  [], // list of buckets that this milestone enables,
	// 		access : {
	// 			notification : [],
	// 			visibility : [],
	// 			approval : []
	// 			// notification : [
	// 			// 	{type : "group", value : "name of group"},
	// 			// 	{type : "email", email : "email@email.com", name : "recipient name"}
	// 			// ],
	// 			// visibility : [
	// 			// 	{type : "group", value : "name of group"},
	// 			// 	{type : "email", email : "email@email.com", name : "recipient name"}
	// 			// ],
	// 			// approval : [
	// 			// 	{type : "group", value : "name of group"},
	// 			// 	{type : "email", email : "email@email.com", name : "recipient name"}
	// 			// ]
	// 		}
	// 	}
	// ],
	// activities :  [
	// 	{
	// 		name : { type:String, default:'' }, // Activity Name,
	// 		description : { type:String, default:'' }, // Desc,
	// 		phases : [], // an array of phase codes or ids,
	// 		dateStart : { type: Date, default: Date.now },
	// 		dateEnd : { type: Date, default: Date.now },
	// 		dateUpdated : { type: Date, default: Date.now },
	// 		status : { type:String, default:'' }, // open,
	// 		updatedBy :  { type:String, default:'' }, // user,
	// 		access : {
	// 			visibility : [],
	// 			// visibility : [
	// 			// 	{type : "group", value : "EAO"},
	// 			// 	{type : "email", email : "email@email.com", name : "recipient name"}
	// 			// ]
	// 		},
	// 		preMetRequirements : [], // comma delimeted requirement codes each needs to be met to start this activity,
	// 		tasks :  {
	// 			t1234 : {
	// 				code : { type:String, default:'' }, // taskname all lowercase,
	// 				name : { type:String, default:'' }, // Long Name,
	// 				currentStatusTitle : { type:String, default:'' }, // Not Started,
	// 				processCode : { type:String, default:'' }, // notifications,
	// 				statusValues :  [
	// 					{
	// 						title : { type:String, default:'' } // Not Started
	// 					},
	// 					{
	// 						title : { type:String, default:'' }, // In Progress,
	// 						preCanComplete : [{ type:String, default:'' } // projectRole]
	// 					},
	// 					{
	// 						title : { type:String, default:'' }, // Complete,
	// 						preCanComplete : [], // comma delimeted, project role codes that can transition to this value,
	// 						preMetRequirements : [], // comma delimeted requirement codes each needs to be met to transition to this,
	// 						postMetRequirements : [], // comma delimeted requirement codes each needs to met when this value is transitioned to,
	// 						alerts : [
	// 						]
	// 					},
	// 					{
	// 						title : { type:String, default:'' } // Not Applicable
	// 					}
	// 				],
	// 				data : { }
	// 			}
	// 		}
	// 	}
	// ],
	// team :  [
	// 	{
	// 		name :  { type:String, default:'' }, // user name,
	// 		systemRole :  [], // EAO,
	// 		projectRole :  [], // comma delimeted roles,
	// 		email : { type:String, default:'' }, // email@email.com,
	// 		country : { type:String, default:'' }, // country,
	// 		address : { type:String, default:'' }, // address,
	// 		city : { type:String, default:'' }, // city,
	// 		province : { type:String, default:'' }, // province,
	// 		postal : { type:String, default:'' }, // postal,
	// 		viaEmail : { type: Boolean, default:true },
	// 		viaMail : { type: Boolean, default:true }
	// 	}
	// ],
	// deliverables :  [
	// 	{
	// 		name :  { type:String, default:'' }, // document name,
	// 		synopsys :  { type:String, default:'' },
	// 		type : { type:String, default:'document', enum:['document','shapefile'] },
	// 		buckets : [], // list of buckets this can go in
	// 	}
	// ],
	// buckets :  [
	// 	{
	// 		code : { type:String, default:'' }, // bats,
	// 		name : { type:String, default:'' }, // Bats,
	// 		isValueComponment : { type: Boolean, default:true },
	// 		status : { type:String, default:'open', enum:['open','closed'] },
	// 		progress :  100,
	// 		requirements : [], // comma delimeted subset of requirement codes needed for this bucket,
	// 		data : {}
	// 	}
	// ],
	// requirements : [
	// 	{
	// 		code :  { type:String, default:'' }, // unique short string identifier,
	// 		type : { type:String, default:'document', enum:['document','approval'] },
	// 		name : { type:String, default:'' }, // Section 10-1c,
	// 		bucket : { type:String, default:'' }, // name of bucket grouping this belongs to,
	// 		dateComplete :  { type: Date, default: Date.now },
	// 		completedBy :  { type:String, default:'' }, // user,
	// 		deliverable : { type:String, default:'' }, // optional embed element,
	// 		completingTask : "milestoneShortId+taskID"
	// 	}
	// ],
	// spatial :  [
	// 	{
	// 		layerName : { type:String, default:'' },
	// 		type : { type:String, default:'poly', enum:['poly','line','point'] },
	// 		coords : { type:String, default:'' }
	// 	}
	// ],
	// data : {
	// 	audit :  [
	// 		{
	// 			taskId : { type:String, default:'' },
	// 			value : { type:String, default:'' }, // value,
	// 			dateValue : { type: Date, default: Date.now },
	// 			user :  {}
	// 		}
	// 	],
	// 	publicComments : [
	// 		{
	// 			author :  { type:String, default:'' },
	// 			instance :  { type:String, default:'' }, // currentCommentPeriod code,
	// 			comment :  { type:String, default:'' },
	// 			isSpam :  { type: Boolean, default:false },
	// 			dateCreated : { type: Date, default: Date.now },
	// 			vettedBy :  {user : { type:String, default:'' } // username},
	// 			dataVetted :  { type: Date, default: Date.now },
	// 			buckets : [],
	// 			issues : []
	// 		}
	// 	],
	// 	notifications : [
	// 		{
	// 			milestone :  { type:String, default:'' }, // milestone,
	// 			status : { type:String, default:'pending', enum:['pending','queued','sent'] },
	// 			dateSent : { type: Date, default: Date.now },
	// 			dateQueued : { type: Date, default: Date.now },
	// 			mailContent : { type:String, default:'' },
	// 			documents : { type:String, default:'' }, // comma separated list of documents objects attach,
	// 			recipientsDigital : [
	// 				{name : "name", email : "email"}
	// 			],
	// 			recipientsPhysical : [
	// 				{
	// 					name : { type:String, default:'' }, // name,
	// 					address : { type:String, default:'' }, // address,
	// 					city : { type:String, default:'' }, // city,
	// 					prov : { type:String, default:'' }, // prov,
	// 					postal : { type:String, default:'' }, // postal,
	// 					tracking : { type:String, default:'' }, // tracking,
	// 					dateSent : { type: Date, default: Date.now }
	// 				}
	// 			]
	// 		}
	// 	],
	// 	issues : [
	// 		{
	// 			description : { type:String, default:'' },
	// 			buckets : [],
	// 			identifiedBy : [],
	// 			dateCreated : { type: Date, default: Date.now },
	// 			response : [],
	// 			status : { type:String, default:'open', enum:['open','closed'] },
	// 			revision : 1,
	// 			publicComments : [],
	// 			responses : [
	// 				{
	// 					assigned : { type:String, default:'' }, // user,
	// 					comment : { type:String, default:'' }, // comment from working group member,
	// 					dateAssigned : { type: Date, default: Date.now },
	// 					dateReplied : { type: Date, default: Date.now },
	// 					deliverables : [
	// 					]
	// 				}
	// 			]
	// 		}
	// 	],
	// 	approvals : [
	// 		{
	// 			dateApproved : { type: Date, default: Date.now },
	// 			approvedBy : { type:String, default:'' } //'user',
	// 			comment : { type:String, default:'' }
	// 		}
	// 	],
	// 	conditions : [
	// 		{
	// 			dateCondition : { type: Date, default: Date.now },
	// 			createdBy : { type:String, default:'' }, // user,
	// 			condition : { type:String, default:'' },
	// 			status : { type:String, default:'draft', enum:['draft','approved','denied'] },
	// 			inspections : []
	// 		}
	// 	]
	// }
});

var Project = mongoose.model ('Project', ProjectSchema);

module.exports = Project;
