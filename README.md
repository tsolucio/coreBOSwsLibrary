cbwsclib - coreBOS Web service client Library
=======

**core Business Operating System Webservice Development Libraries**

You can find additional information on the usage of the libraries in the [coreBOS documentation wiki](http://corebos.org/documentation) and tests and examples in the [coreBOS Webservice Development tool](https://github.com/tsolucio/coreBOSwsDevelopment).

The *coreBOS* team is actively maintaining the PHP, Javascript, Python(3) and Go versions of the library.

The java library is not being maintained. Any help is appreciated.

Set of functions
======

The normal set of functions most libraries implement is:

- setSession(logindata)
- getSession()
- getEntityId()
- getLanguage()
- getRecordId(id)
- hasError(resultdata)
- lastError ()
- doLogin(username, accesskey, withpassword)
- doLoginPortal(username, password, hashmethod, entity)
- doLogout()
- extendSession()
- doQuery(query)
- doQueryWithTotal(query)
- doListTypes()
- doDescribe(module)
- doRetrieve(record)
- doCreate(module, valuemap)
- doUpdate(module, valuemap)
- doUpsert($modulename, $createFields, $searchOn, $updateFields)
- doRevise(module, valuemap)
- doDelete(id)
- doMassUpsert(elements)
- doMassRetrieve(ids)
- doMassDelete(ids)
- doMassUpdate($elements)
- doGetRelatedRecords(record, module, relatedModule, queryParameters)
- doSetRelated(relate_this_id, with_these_ids)
- doInvoke(method, params, type)
- doValidateInformation(record, module, recordInformation)
- authorizationValidityDetector(error)
- sessionValidityDetector(error)
- __doChallenge(username)
- getResultColumns(result)
- getData(response)
- addcbWsOptions(operation, valueMap=null, resource='', valueMapParam = 'element')
- status(response)
- setURL(cburl, fetchingOptions=null)

**Follow us**
======

[coreBOS Website](http://corebos.org/)

[Google+ Community](https://plus.google.com/communities/109845486286232591652)

[LinkedIn Group](http://www.linkedin.com/groups/coreBOS-7479130?trk=my_groups-b-grp-v)


**Thank you** very much for your help and contribution.

*coreBOS Team*
