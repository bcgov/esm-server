'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('comment').factory ('CommentModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'comment',
		lookup: function (commentID) {
			return this.get('/api/comment/' + commentID);
		},
		// -------------------------------------------------------------------------
		//
		// get all the comments for a comment period
		//
		// -------------------------------------------------------------------------
		getAllCommentsForPeriod: function (periodId) {
			return this.get ('/api/comments/period/'+periodId+'/all');
		},
		getPublishedCommentsForPeriod: function (periodId) {
			return this.get ('/api/comments/period/'+periodId+'/published');
		},
		getEAOCommentsForPeriod: function (periodId) {
			return this.get ('/api/eaocomments/period/'+periodId);
		},
		getProponentCommentsForPeriod: function (periodId) {
			return this.get ('/api/proponentcomments/period/'+periodId);
		},
		getCommentsForPeriod: function( periodId, eaoStatus, proponentStatus, isPublished,
									    commentId, authorComment, location, pillar, topic,
										start, limit, orderBy, reverse) {

			var obj = {
				// primary query...
				periodId: periodId,
				eaoStatus: eaoStatus,
				proponentStatus: proponentStatus,
				isPublished: isPublished,
				// filter fields...
				commentId: commentId,
				authorComment: authorComment,
				location: location,
				pillar: pillar,
				topic: topic,
				// pagination
				start: start,
				limit: limit,
				orderBy: orderBy,
				reverse: reverse
			};

			return this.put ('/api/comments/period/' + periodId + '/paginate', obj);
		},
		// -------------------------------------------------------------------------
		//
		// pass in the target type (Project Description, Document, AIR, etc)
		// and its Id (all as taken from the period or wherever you came from)
		// and the type of comments you are looking for (public, wg, ciaa, etc)
		// and this will return an array of conversations, sorted chronologically
		// with the internal messages in conversations also sorted the same
		//
		// -------------------------------------------------------------------------
		getCommentsForTarget : function (targetType, targetId, commentType) {
			return this.get ('/api/comments/type/'+commentType+'/target/'+targetType+'/'+targetId);
		},
		// -------------------------------------------------------------------------
		//
		// add a new top-level comment to the given target for the given project
		// for the given period (the period MUST be the current period object)
		// the reason for breaking out the params is to ensure they are provided
		//
		// -------------------------------------------------------------------------
		addNewComment: function (newComment, projectId, period, targetType, targetId) {
			newComment.ancestor   = newComment._id;
			newComment.parent     = null;
			newComment.project    = projectId;
			newComment.targetType = targetType;
			newComment.target     = targetId;
			newComment.period     = period._id;
			newComment.read       = period.write;
			newComment.type       = period.commentType;
			newComment.resolved   = false;
			newComment.published  = false;
			return this.add (newComment);
		},
		// -------------------------------------------------------------------------
		//
		// given an original and the new response, add the new response and link to
		// the original
		//
		// -------------------------------------------------------------------------
		addResponseToComment: function (originalComment, newComment) {
			newComment.ancestor   = originalComment.ancestor;
			newComment.parent     = originalComment._id;
			newComment.project    = originalComment.project;
			newComment.targetType = originalComment.targetType;
			newComment.target     = originalComment.target;
			newComment.period     = originalComment.period;
			newComment.read       = originalComment.read;
			newComment.type       = originalComment.type;
			newComment.resolved   = originalComment.resolved;
			newComment.published  = originalComment.published;
			return this.add (newComment);
		},
		// -------------------------------------------------------------------------
		//
		// given any comment in the chain, indicate that this chain has been
		// resolved.
		// returns the new chain, sorted chronologically
		//
		// -------------------------------------------------------------------------
		resolveCommentChain: function (comment) {
			return this.put ('/api/resolve/comment/'+comment.ancestor);
		},
		// -------------------------------------------------------------------------
		//
		// given any comment in the chain, indicate that this chain has been
		// published.
		// returns the new chain, sorted chronologically
		//
		// -------------------------------------------------------------------------
		publishCommentChain: function (comment) {
			return this.put ('/api/publish/comment/'+comment.ancestor);
		},
		// -------------------------------------------------------------------------
		//
		// given any comment in the chain, indicate that this chain has been
		// unpublished.
		// returns the new chain, sorted chronologically
		//
		// -------------------------------------------------------------------------
		unpublishCommentChain: function (comment) {
			return this.put ('/api/unpublish/comment/'+comment.ancestor);
		},
		// -------------------------------------------------------------------------
		//
		// gets just one conversation by passing in the top-level comment Id
		//
		// -------------------------------------------------------------------------
		getCommentChain: function (ancestorId) {
			return this.get ('/api/comments/ancestor/'+ancestorId);
		},
		getDocuments: function(commentId) {
			return this.get('/api/comment/' + commentId +'/documents');
		},
		updateDocument: function(doc) {
			return this.put('/api/document/' + doc._id, doc);
		},
		prepareCSV: function (tableParams) {
			// console.log("incoming tableparams:", tableParams);
			return new Promise (function (resolve, reject) {
				var data = "";
				var header = [
				'id',
				'comment',
				'date added',
				'author',
				'location',
				'pillars',
				'topics',
				'status',
				'attachments'
				];
				data += '"' + header.join ('","') + '"' + "\r\n";
				_.each (tableParams, function (row) {
					var a = [];
					a.push(row.commentId);
					var comment = row.comment
					.replace (/\•/g, '-')
					.replace (/\’/g, "'")
					.replace (/\r\n/g, "\n")
					.replace (/\n+/g, "\n")
					.replace (/\“/g, '"')
					.replace (/\”/g, '"')
					.replace (/"/g, '""');
					if (comment.length > 30000) {
						console.log ('comment > 32000');
						comment = comment.substr (0,32000) + ' --- TRUNCATED FOR IMPORT TO EXCEL --- ';
					}
					a.push (comment);
					a.push (row.dateAdded);
					a.push ((!row.isAnonymous) ? row.author : '');
					a.push (row.location);
					a.push (row.pillars.map (function (v) {
						return v.replace (/"/g, '""');
					}).join (', '));
					a.push (row.topics.map (function (v) {
						return v.replace (/"/g, '""');
					}).join (', '));
					a.push (row.eaoStatus);
					a.push (row.documents.map (function (v) {
						return '""' + window.location.protocol + '//' + window.location.host + '/api/document/'+v._id+'/fetch""';
					}).join (', '));

					data += '"' + a.join ('","') + '"' + "\r\n";
				});
				resolve(data);
			});
		}
	});
	return new Class ();
});


