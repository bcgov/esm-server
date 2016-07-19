'use strict';
// =========================================================================
//
// Document Model
//
// This has awhole bunch of historical stuff in it that deals with the ETL
// from the old EPIC system.
//
//    ------------------------------------------------------------
//    Short form rules for e-PIC
//    ------------------------------------------------------------
//
//    Folder Type:
//    ------------------------------
//    r= Under Review
//    p= Pre-Application
//    w= Withdrawn
//    t= Terminated
//    a= Certificate Issued
//    k= Amendments
//
//    Folder Name short form:
//    ------------------------------
//    abo = Aboriginal Comments/Submissions
//    amd = Amendment Certificate
//    yaa = Amendment to Certificate Documentation
//    ama = Amendment - Application
//    app = Application and Supporting Studies
//    tor = Application Terms of Reference/Information Requirements
//    cag = Community Advisory Group
//    cpp = Compendium: Public Comments / Proponent Responses
//    crr = Compliance Reports/Reviews
//    cpm = Concurrent Permitting
//    waa = EA Certificate Documentation
//    com = EAO Generated Documents
//    fed = Federal Comments/Submissions
//    gcd = General Consultiation Documents
//    loc = Local Government Comments/Submissions
//    mno = Ministerial Order
//    new = Notices - News Releases
//    ojc = Other Jurisdictions Comments/Submissions
//    xaa = Post Certificate Documentation
//    abc = Pre Application Documents
//    pro = Proponent Comments/Correspondence
//    pga = Provincial Govt Comments/Submissions
//    pub = Public Comments/Submissions
//    ------------------------------
//
//    Example Links:
//    ------------------------------
//    // 1: Root level project page - shows root level folder type options for the project.
// https://a100.gov.bc.ca/appsdata/epic/html/deploy/epic_project_home_362.html
// 362=[projectID]
//
//    // 2: Root level folder lists available Folder Type+Folder Name folders.
//    // The Under Review/Pre-application/Withdrawn/etc. set of folders and their subfolders
// https://a100.gov.bc.ca/appsdata/epic/html/deploy/epic_project_doc_list_362_r_app.html
// 362= [projectID]
//    Folder Type: r= [Under Review]
// Folder Name Short Form: app= [Application and Supporting Studies]
//
//    // 3: FolderName - The title of the folder containing the collection of documents
//    EG: Application Main Report received January 18, 2016
//    // This exists as content in "2: Root level folder lists available..." above
//
//    // 4: Child folder where the collection of documents related to a specific Folder Type+Folder Name
//    // can be found.
//    https://a100.gov.bc.ca/appsdata/epic/html/deploy/epic_document_362_39700.html
//    362= [projectID]
//    39700= EPIC DirectoryID (becomes d39700) Not related to the specific project
//
//
//    Actual Document Link:
//    ------------------------------
//    https://a100.gov.bc.ca/appsdata/epic/documents/p362/d39700/1453141986150_QzJ9WdsMpRJvp1GtL2JJmYjYw0jptTxFgrx6SyVKDJxRgQFvZ9Jq!1143392206!1453141196524.pdf
//    p362= [ProjectID]
//    d39700= [DirectoryID] Not related to the specific project
//    1453141986150= (RANDOM) Probably the uploadID when it was originally placed
//    QzJ9WdsMpRJvp1GtL2JJmYjYw0jptTxFgrx6SyVKDJxRgQFvZ9Jq!1143392206!1453141196524= (RANDOM) Probably the SessionID for a group of uploaded assets (in a folder only?)
//
//
// CC: converted to new schema pre-processor
//
// =========================================================================
var genSchema = require ('../../../core/server/controllers/core.schema.controller');

genSchema ('TypesSchema', {
	projectFolderType           : { type:String, default:'' },
	projectFolderSubTypeObjects : []
});

genSchema ('SubTypesSchema', {
	projectFolderSubType : { type:String, default:'' },
	projectFolderNames   : []
});

module.exports = genSchema ('Document', {
	__audit                 : true,  // who what when
	__access                : [      // read / write / delete are automatic
		'download',
		'uploadNewVersion',
		'viewOldVersions',
		'downloadOldVersions'
	],
	project                 : { type:'ObjectId', ref:'Project', default:null },
	dateAdded               : { type: Date, default: Date.now },
	dateUpdated             : { type: Date, default: Date.now },
	updatedBy               : { type:'ObjectId', ref:'User', default:null },
	projectFolderType       : { type:String, default:'' }, // r=/p=/w=/t=/a=/k=
	projectFolderSubType    : { type:String, default:'' }, // abo/amd/etc.
	projectFolderName       : { type:String, default:'' }, // Title of the folder that's within the Folder Type+SubType
	projectFolderURL        : { type:String, default:'' }, // The specific DirectoryID instance of a collection of documents
	projectFolderDatePosted : { type: Date, default: Date.now }, // We'll want to convert any incoming date to this fmt.
	projectFolderAuthor     : { type:String, default:'' },
	documentEPICId          : { type:Number, default:0, index:true },
	documentEPICProjectId   : { type:Number, default:0, index:true },
	documentFileName        : { type:String, default:'' }, // A.K.A. Document File Name in EPIC
	documentFileURL         : { type:String, default:'' },
	documentFileSize        : { type:String, default:'' }, // Looks like everything is in KB
	documentFileFormat      : { type:String, default:'' },
	documentVersion         : { type:Number, default:0 }, // Used for keeping track of this documents version.
	documentIsLatestVersion : { type:Boolean, default:true }, // We assume we are the latest. Default will be false
	documentSource 			: { type:String, default:'' }, // Source = comments or generic
	// when we hook in the reviewable interface which will
	// decide what is the latest based on approval of such
	documentIsInReview      : { type:Boolean, default:false }, // Used to flag if this entry is a reviewable entry.
	documentAuthor          : { type:String, default:'' },  // NB: We should add a document author in addition to the folderAuthor.
	documentType            : { type:String, default:'' },
	internalURL             : { type:String, default:'' },
	internalOriginalName    : { type:String, default:'' },
	internalName            : { type:String, default:'' },
	internalMime            : { type:String, default:'' },
	internalExt             : { type:String, default:'' },
	internalSize            : { type:Number, default:0 },
	internalEncoding        : { type:String, default:'' },
	oldData                 : { type:String, default:'' },
	order                   : { type: Number, default: 0}, // this will be used to sort supporting documents in artifacts, the order will be arbitrary and determined by the user.
	eaoStatus               : { type:String, default:'', enum:['', 'Unvetted', 'Rejected', 'Deferred', 'Accepted', 'Published', 'Spam'] } // for use with Public Comment Attachments...
	
});
