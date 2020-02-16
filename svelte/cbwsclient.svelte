<script context="module">
	import {cbMD5} from './md5.svelte';

	// Version
	export const version = 'coreBOS2.1';

	const _servicebase = 'webservice.php';

	let _serviceurl = '';

	// Webservice user credentials
	let _serviceuser = false;
	let _servicekey  = false;

	// Webservice login validity
	let _servertime   = false;
	let _expiretime   = false;
	let _servicetoken =false;

	// Webservice login credentials
	let _sessionid = false;
	let _userid    = false;

	// Last operation error information
	let _lasterror = false;

	const fetchOptions = {
		mode: 'cors',
		headers: {
			'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
		}
	};

	export function setURL(url) {
		if (url!='' && url.substr(url.length - 1) != '/') {
			// Format the url before appending servicebase
			url = url + '/';
		}
		_serviceurl = url + _servicebase;
	}

	/**
	 * Get actual record id from the response id.
	 */
	export function getRecordId(id) {
		if (typeof id === 'undefined') {
			return 0;
		}
		var ids = id.split('x');
		return ids[1];
	};

	/**
	 * Check if result has any error.
	 */
	export function hasError(resultdata) {
		if (resultdata != null && resultdata['success'] == false) {
			_lasterror = resultdata['error'].code + ': ' + resultdata['error'].message;
			return true;
		}
		_lasterror = 'none';
		return false;
	};

	/**
	 * Get last operation error information
	 */
	export function lastError() {
		return _lasterror;
	};

	/* parse return status */
	export function status(response) {
		if (response.status >= 200 && response.status < 300) {
			return Promise.resolve(response);
		} else {
			return Promise.reject(new Error(response.statusText));
		}
	};

	/* get data from response */
	export function getData(response) {
		return response.json();
	};

	/**
	 * Perform the challenge
	 * @access private
	 */
	function __doChallenge(username) {
		// reqtype = 'GET';
		let params = '?operation=getchallenge&username=' + username;
		fetchOptions.method = 'get';
		return fetch(_serviceurl + params, fetchOptions)
			.then(status)
			.then(getData);
	};

	/**
	 * Check and perform login if requried.
	 */
	function __checkLogin() {
		return true;
	};

	/**
	 * Login Operation
	 */
	export function doLogin(username, accesskey, withpassword) {
		// reqtype = 'POST';
		_serviceuser = username;
		_servicekey = accesskey;
		if (withpassword == undefined) {
			withpassword = false;
		}

		return new Promise((resolve, reject) => {
			__doChallenge(username)
				.then(function (data) {
					if (hasError(data) == false) {
						let result = data['result'];
						_servicetoken = result.token;
						_servertime = result.serverTime;
						_expiretime = result.expireTime;
						fetchOptions.method = 'post';
						let postdata = 'operation=login&username=' + username;
						postdata += '&accessKey=' + (withpassword ? _servicetoken + accesskey : cbMD5(_servicetoken + accesskey));
						fetchOptions.body = postdata;

						fetch(_serviceurl, fetchOptions)
							.then(status)
							.then(getData)
							.then(logindata => {
								if (hasError(logindata) == false) {
									var result = logindata['result'];
									_sessionid = result.sessionName;
									_userid = result.userId;
									resolve(logindata);
								} else {
									reject(new Error('incorrect response: ' + lastError()));
								}
							})
							.catch(error => reject(error));
					} else {
						reject(new Error('incorrect response: ' + lastError()));
					}
				})
				.catch(error => reject(error));
		});
	};

	/**
	 * Logout Operation
	 */
	export function doLogout() {
		__checkLogin();

		// reqtype = 'POST';
		let postdata = 'operation=logout&sessionName=' + _sessionid;
		fetchOptions.body = postdata;
		fetchOptions.method = 'post';
		return fetch(_serviceurl, fetchOptions)
			.then(status)
			.then(getData)
			.then(function (data) {
				if (hasError(data) == false) {
					_servicetoken = false;
					_servertime = false;
					_expiretime = false;
					_sessionid  = false;
					_userid = false;
					return Promise.resolve(data['result']);
				} else {
					return Promise.reject(new Error('incorrect response: '+lastError()));
				}
			})
			.catch(function (error) {
				return Promise.reject(error);
			});
	};

	export function extendSession() {
		// reqtype = 'POST';
		let postdata = 'operation=extendsession';
		fetchOptions.body = postdata;
		fetchOptions.credentials = 'include';
		fetchOptions.method = 'post';
		return fetch(_serviceurl, fetchOptions)
			.then(status)
			.then(getData)
			.then(function (data) {
				if (hasError(data) == false) {
					_sessionid  = data['result'].sessionName;
					_userid = data['result'].userId;
					delete fetchOptions.credentials;
					return Promise.resolve(data['result']);
				} else {
					return Promise.reject(new Error('incorrect response: '+lastError()));
				}
			})
			.catch(function (error) {
				return Promise.reject(error);
			});
	};

	/**
	 * Query Operation.
	 */
	export function doQuery(query) {
		__checkLogin();

		if (query.indexOf(';') == -1) {
			query += ';';
		}

		// reqtype = 'GET';
		let params = '?operation=query&sessionName=' + _sessionid + '&query=' + query;
		fetchOptions.method = 'get';
		delete fetchOptions.body;
		return fetch(_serviceurl + params, fetchOptions)
			.then(status)
			.then(getData)
			.then(function (data) {
				if (hasError(data) == false) {
					return Promise.resolve(data['result']);
				} else {
					return Promise.reject(new Error('incorrect response: '+lastError()));
				}
			})
			.catch(function (error) {
				return Promise.reject(error);
			});
	};

	/**
	 * Get Result Column Names.
	 */
	export function getResultColumns(result) {
		let columns = [];
		if (result != null && result.length != 0) {
			let firstrecord = result[0];
			for (let key in firstrecord) {
				columns.push(key);
			}
		}
		return columns;
	};

	/**
	 * List types (modules) available.
	 */
	export function doListTypes() {
		__checkLogin();

		// reqtype = 'GET';
		let params = '?operation=listtypes&sessionName=' + _sessionid;
		fetchOptions.method = 'get';
		delete fetchOptions.body;
		return fetch(_serviceurl + params, fetchOptions)
			.then(status)
			.then(getData)
			.then(function (data) {
				if (hasError(data) == false) {
					let result = data['result'];
					let modulenames = result['types'];
					let returnvalue = { };
					for (let mindex = 0; mindex < modulenames.length; ++mindex) {
						let modulename = modulenames[mindex];
						returnvalue[modulename] = {
							'name' : modulename
						};
					}
					return Promise.resolve(returnvalue);
				} else {
					return Promise.reject(new Error('incorrect response: '+lastError()));
				}
			})
			.catch(function (error) {
				return Promise.reject(error);
			});
	};

	/**
	 * Describe Operation
	 */
	export function doDescribe(module) {
		__checkLogin();

		// reqtype = 'GET';
		let params = '?operation=describe&sessionName=' + _sessionid + '&elementType=' + module;
		fetchOptions.method = 'get';
		delete fetchOptions.body;
		return fetch(_serviceurl + params, fetchOptions)
			.then(status)
			.then(getData)
			.then(function (data) {
				if (hasError(data) == false) {
					return Promise.resolve(data['result']);
				} else {
					return Promise.reject(new Error('incorrect response: '+lastError()));
				}
			})
			.catch(function (error) {
				return Promise.reject(error);
			});
	};

	/**
	 * Retrieve details of record
	 */
	export function doRetrieve(record) {
		__checkLogin();

		// reqtype = 'GET';
		let params = '?operation=retrieve&sessionName=' + _sessionid + '&id=' + record;
		fetchOptions.method = 'get';
		delete fetchOptions.body;
		return fetch(_serviceurl + params, fetchOptions)
			.then(status)
			.then(getData)
			.then(function (data) {
				if (hasError(data) == false) {
					return Promise.resolve(data['result']);
				} else {
					return Promise.reject(new Error('incorrect response: '+lastError()));
				}
			})
			.catch(function (error) {
				return Promise.reject(error);
			});
	};

	/**
	 * Create Operation
	 */
	export function doCreate(module, valuemap) {
		__checkLogin();

		// Assign record to logged in user if not specified
		if (valuemap['assigned_user_id'] == null) {
			valuemap['assigned_user_id'] = _userid;
		}

		// reqtype = 'POST';
		let postdata = 'operation=create&sessionName=' + _sessionid + '&elementType=' + module + '&element=' + JSON.stringify(valuemap);
		fetchOptions.body = postdata;
		fetchOptions.method = 'post';
		return fetch(_serviceurl, fetchOptions)
			.then(status)
			.then(getData)
			.then(function (data) {
				if (hasError(data) == false) {
					return Promise.resolve(data['result']);
				} else {
					return Promise.reject(new Error('incorrect response: '+lastError()));
				}
			})
			.catch(function (error) {
				return Promise.reject(error);
			});
	};

	/**
	 * Update Operation
	 */
	export function doUpdate(module, valuemap) {
		__checkLogin();

		// Assign record to logged in user if not specified
		if (valuemap['assigned_user_id'] == null) {
			valuemap['assigned_user_id'] = _userid;
		}

		// reqtype = 'POST';
		let postdata = 'operation=update&sessionName=' + _sessionid + '&elementType=' + module + '&element=' + JSON.stringify(valuemap);
		fetchOptions.body = postdata;
		fetchOptions.method = 'post';
		return fetch(_serviceurl, fetchOptions)
			.then(status)
			.then(getData)
			.then(function (data) {
				if (hasError(data) == false) {
					return Promise.resolve(data['result']);
				} else {
					return Promise.reject(new Error('incorrect response: '+lastError()));
				}
			})
			.catch(function (error) {
				return Promise.reject(error);
			});
	};

	/**
	 * Revise Operation
	 */
	export function doRevise(module, valuemap) {
		__checkLogin();

		// reqtype = 'POST';
		let postdata = 'operation=revise&sessionName=' + _sessionid + '&elementType=' + module + '&element=' + JSON.stringify(valuemap);
		fetchOptions.body = postdata;
		fetchOptions.method = 'post';
		return fetch(_serviceurl, fetchOptions)
			.then(status)
			.then(getData)
			.then(function (data) {
				if (hasError(data) == false) {
					return Promise.resolve(data['result']);
				} else {
					return Promise.reject(new Error('incorrect response: '+lastError()));
				}
			})
			.catch(function (error) {
				return Promise.reject(error);
			});
	};

	/**
	 * Delete Operation
	 */
	export function doDelete(id) {
		__checkLogin();

		// reqtype = 'POST';
		let postdata = 'operation=delete&sessionName=' + _sessionid + '&id=' + id;
		fetchOptions.body = postdata;
		fetchOptions.method = 'post';
		return fetch(_serviceurl, fetchOptions)
			.then(status)
			.then(getData)
			.then(function (data) {
				if (hasError(data) == false) {
					return Promise.resolve(data['result']);
				} else {
					return Promise.reject(new Error('incorrect response: '+lastError()));
				}
			})
			.catch(function (error) {
				return Promise.reject(error);
			});
	};

	/**
	 * Invoke custom operation
	 */
	export function doInvoke(method, params, type) {
		__checkLogin();

		if (typeof(params) == 'undefined') {
			params = {};
		}

		var reqtype = 'post';
		if (typeof(type) != 'undefined') {
			reqtype = type.toUpperCase();
		}

		let postdata = 'operation=' + method + '&sessionName=' + _sessionid;
		for (let key in params) {
			postdata += '&' + key + '=' + params[key];
		}
		let getparams = '';
		if (reqtype.toLowerCase()=='post') {
			fetchOptions.body = postdata;
		} else {
			delete fetchOptions.body;
			getparams = '?' + postdata;
		}
		fetchOptions.method = reqtype;
		return fetch(_serviceurl + getparams, fetchOptions)
			.then(status)
			.then(getData)
			.then(function (data) {
				if (hasError(data) == false) {
					return Promise.resolve(data['result']);
				} else {
					return Promise.reject(new Error('incorrect response: '+lastError()));
				}
			})
			.catch(function (error) {
				return Promise.reject(error);
			});
	};

	/**
	 * Retrieve related records.
	 */
	export function doGetRelatedRecords(record, module, relatedModule, queryParameters) {
		// Perform re-login if required.
		__checkLogin();

		// reqtype = 'POST';
		let postdata = 'operation=getRelatedRecords&sessionName=' + _sessionid + '&id=' + record + '&module=' + module;
		postdata += '&relatedModule=' + relatedModule + '&queryParameters=' + JSON.stringify(queryParameters);
		fetchOptions.body = postdata;
		fetchOptions.method = 'post';
		return fetch(_serviceurl, fetchOptions)
			.then(status)
			.then(getData)
			.then(function (data) {
				if (hasError(data) == false) {
					return Promise.resolve(data['result']);
				} else {
					return Promise.reject(new Error('incorrect response: '+lastError()));
				}
			})
			.catch(function (error) {
				return Promise.reject(error);
			});
	};

	/**
	 * Set relation between records.
	 * param relate_this_id string ID of record we want to related other records with
	 * param with_this_ids string/array either a string with one unique ID or an array of IDs to relate to the first parameter
	 */
	export function doSetRelated(relate_this_id, with_these_ids) {
		// Perform re-login if required.
		__checkLogin();

		// reqtype = 'POST';
		let postdata = 'operation=SetRelation&sessionName=' + _sessionid + '&relate_this_id=' + relate_this_id + '&with_these_ids=' + JSON.stringify(with_these_ids);
		fetchOptions.body = postdata;
		fetchOptions.method = 'post';
		return fetch(_serviceurl, fetchOptions)
			.then(status)
			.then(getData)
			.then(function (data) {
				if (hasError(data) == false) {
					return Promise.resolve(data['result']);
				} else {
					return Promise.reject(new Error('incorrect response: '+lastError()));
				}
			})
			.catch(function (error) {
				return Promise.reject(error);
			});
	};
</script>