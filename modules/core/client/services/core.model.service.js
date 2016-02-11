'use strict';
// =========================================================================
//
// this is intended to be a sort of base class for all crud services in the
// client, just to avoid retyping everything over and over again
//
// =========================================================================
angular.module('core').factory ('ModelBase', ['EsmLog', '$http', '_', function (log, $http, _) {
	var ModelBase = function (o) {
		this.model      = null; // the current loaded model
		this.collection = null; // the current loaded collection
		this.modelIsNew = true;
		this._init (o);
	};
	_.extend (ModelBase.prototype, {
		//
		// this must be extended, it is used to build the service URLs
		//
		urlName : 'somemodel',
		// -------------------------------------------------------------------------
		//
		// initialize the object, set some instance vars
		//
		// -------------------------------------------------------------------------
		_init : function (o) {
			this.urlall  = '/api/'+this.urlName;
			this.urlbase = '/api/'+this.urlName+'/';
			this.urlnew  = '/api/new/'+this.urlName;
		},
		// -------------------------------------------------------------------------
		//
		// gets the listing of all whatever things this is and sets the local
		// collection to that. The collection can then be pivoted on or somehow
		// else manipulated for display purposes. also returns the listing through
		// the promise resolution.
		//
		// -------------------------------------------------------------------------
		getCollection: function () {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.all ().then (function (res) {
					self.collection = res.data;
					resolve (res.data);
				}).catch (function (res) {
					reject (res.data);
				});
			});
		},
		// -------------------------------------------------------------------------
		//
		// load a model from the server, set the local and resolve it
		//
		// -------------------------------------------------------------------------
		getModel: function (id) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.get (id).then (function (res) {
					self.model = res.data;
					self.modelIsNew = false;
					resolve (res.data);
				}).catch (function (res) {
					reject (res.data);
				});
			});
		},
		// -------------------------------------------------------------------------
		//
		// load a query result from the server, set the local and resolve it
		//
		// -------------------------------------------------------------------------
		getQuery: function (q) {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.query (q).then (function (res) {
					self.collection = res.data;
					resolve (res.data);
				}).catch (function (res) {
					reject (res.data);
				});
			});
		},
		// -------------------------------------------------------------------------
		//
		// get a new empty model
		//
		// -------------------------------------------------------------------------
		getNew: function () {
			var self = this;
			return new Promise (function (resolve, reject) {
				self.new ().then (function (res) {
					self.model = res.data;
					self.modelIsNew = true;
					resolve (res.data);
				}).catch (function (res) {
					reject (res.data);
				});
			});
		},
		// -------------------------------------------------------------------------
		//
		// get a copy of the current model
		//
		// -------------------------------------------------------------------------
		getCopy: function () {
			return _.cloneDeep (this.model);
		},
		// -------------------------------------------------------------------------
		//
		// set the current model
		//
		// -------------------------------------------------------------------------
		setModel: function (obj) {
			this.modelIsNew = false;
			this.model = obj;
		},
		// -------------------------------------------------------------------------
		//
		// short hand for saving a copy
		//
		// -------------------------------------------------------------------------
		saveCopy: function (obj) {
			this.model = obj;
			return this.saveModel ();
		},
		// -------------------------------------------------------------------------
		//
		// Save the current model
		//
		// -------------------------------------------------------------------------
		saveModel: function () {
			var self = this;
			console.log('save or add', self.modelIsNew, this);
			return new Promise (function (resolve, reject) {
				var p = (self.modelIsNew) ? self.add (self.model) : self.save (self.model);
				p.then (function (res) {
					self.model = res.data;
					self.modelIsNew = false;
					resolve (res.data);
				}).catch (function (res) {
					reject (res.data);
				});
			});
		},
		// -------------------------------------------------------------------------
		//
		// pivot the collection on some field. return an object with keys that are
		// the unique values of the field and values that are arrays of the models
		// that have that field value
		//
		// -------------------------------------------------------------------------
		pivot: function (field) {
			this.pivot = {};
			this.pivotField = field || null;
			if (!this.pivotField) return null;
			var value;
			_.each (this.collection, function (model) {
				value = model[field];
				if (_.isNil (value)) value = '_empty_';
				if (!this.pivot[value]) this.pivot[value] = [];
				this.pivot[value].push (model);
			});
			return this.pivot;
		},
		// -------------------------------------------------------------------------
		//
		// a bunch of crud stuff
		//
		// -------------------------------------------------------------------------
		new : function () {
			var self = this;
			return new Promise (function (resolve, reject) {
				$http ({method:'GET', url:self.urlnew })
				.then (resolve, log.reject (reject));
			});
		},
		all : function () {
			var self = this;
			return new Promise (function (resolve, reject) {
				$http ({method:'GET', url:self.urlall })
				.then (resolve, log.reject (reject));
			});
		},
		delete : function (id) {
			var self = this;
			return new Promise (function (resolve, reject) {
				$http ({method:'DELETE', url:self.urlbase+id })
				.then (resolve, log.reject (reject));
			});
		},
		get : function (id) {
			var self = this;
			return new Promise (function (resolve, reject) {
				$http ({method:'GET', url:self.urlbase+id })
				.then (resolve, log.reject (reject));
			});
		},
		save : function (obj) {
			var self = this;
			return new Promise (function (resolve, reject) {
				$http ({method:'PUT', url:self.urlbase+obj._id, data:obj })
				.then (resolve, log.reject (reject));
			});
		},
		add : function (obj) {
			var self = this;
			return new Promise (function (resolve, reject) {
				$http ({method:'POST', url:self.urlall, data:obj })
				.then (resolve, log.reject (reject));
			});
		},
		query : function (obj) {
			var self = this;
			return new Promise (function (resolve, reject) {
				$http ({method:'PUT', url:self.urlall, data:obj })
				.then (resolve, log.reject (reject));
			});
		},
	});
	ModelBase.extend = function (protoProps, staticProps) {
		var parent = this; var child;
		if (protoProps && _.has(protoProps, 'constructor')) {child = protoProps.constructor;}
		else {child = function(){ return parent.apply(this, arguments); }; }
		_.extend(child, parent, staticProps);
		var Surrogate = function(){ this.constructor = child; };
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate ();
		if (protoProps) _.extend(child.prototype, protoProps);
		child.__super__ = parent.prototype;
		return child;
	};
	return ModelBase;
}]);
