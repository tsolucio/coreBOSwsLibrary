/**
 * Static wrapper class over Google Gears.
 */
var Vtiger_Gears = function() {
	// Instance of Gears Localserver
	this._gear = google.gears.factory.create('beta.localserver', '1.0');
	// Instance of Gears Database
	this._db   = google.gears.factory.create('beta.database');
	// Current database name in use
	this._dbname=false;

	/**
	 * Check if client cannot reach server.
	 */
	this.checkOffline = function(useurl, callback) {
		jQuery.ajax({
			url : useurl,
			type: 'GET',
			data: {'isalive':'true', 'timestamp':(new Date()).getTime()},
			async: false,
			complete : function(res, status) {
				var isalive = true;
				if(status == 'error') isalive = false;
				if(typeof(callback) == 'function') callback(isalive);
			}
		});
	};		

	/**
	 * Initialize this instance.
	 */
	this.initialize = function(appid, manifesturl, dbname) {
		this._store = 
			this._gear.openManagedStore(appid) || 
			this._gear.createManagedStore(appid);
		
		this._store.manifestUrl = manifesturl;
		this._store.checkForUpdate();

		if(dbname != null) this.openDB(dbname);

		Vtiger_Gears._store = this._store;

		Vtiger_Gears.checkForUpdate = function() {
			if(typeof(vtoffline) != 'undefined') vtoffline.showProgressBar('Initializing...');
			if(Vtiger_Gears._store.updateStatus == 3) {
				// Update failed: Vtiger_Gears._store.lastErrorMessage
			} else if(Vtiger_Gears._store.updateStatus == 0) {
				if(typeof(vtoffline) != 'undefined') vtoffline.hideProgressBar();
			} else {
				window.setTimeout('Vtiger_Gears.checkForUpdate();', 500);
			}
		}
		window.setTimeout('Vtiger_Gears.checkForUpdate();', 500);		
	};


	/**
	 * Open required database.
	 */
	this.openDB = function(dbname) {
		if(!this._dbname || dbname != this._dbname) {
			this._dbname = dbname;
			this._db.open(dbname);
		}
	};

	/**
	 * Close the open database.
	 */
	this.closeDB = function() {
		if(this._dbname) {
			this._db.close();
			this._dbname = false;
		}
	};

	/**
	 * Initialize database schema. Execute SQL statements given.
	 */
	this.initSchema = function(sqlarray) {
		for(var index = 0; index < sqlarray.length; ++index) {
			var sql = sqlarray[index];
			this.executeSQL(sql, null);
		}
	};
	/**
	 * Execute SQL statement.
	 */
	this.executeSQL = function(sql, params) {
		var result = false;
		if(params != null) result = this._db.execute(sql, params);
		else result = this._db.execute(sql);
		return result;
	};
	/**
	 * Get last inserted id.
	 */
	this.lastInsertId = function() {
		return this._db.lastInsertRowId;
	};
}


