# Setup include path for dependent libraries
import sys, os, string
JSON_DIR = string.rstrip(__file__, (os.sep + os.path.basename(__file__)))
JSON_DIR += os.sep + '..' + os.sep + 'third-party' + os.sep + 'python'
# Include in sys path
if JSON_DIR not in sys.path:
    sys.path.append(JSON_DIR)

# Import required libraries
import json, urllib

# Vtiger Webservice Client
class Vtiger_WSClient:
    def __init__(self, url):
        # Webservice file
        self._servicebase = 'webservice.php'

        # Service URL to which client connects to
        self._serviceurl   = False

        # Webservice login validity
        self._servicetoken = False
        self._expiretime   = False
        self._servertime   = False

        # Webservice user credentials
        self._serviceuser  = False
        self._servicekey   = False

        # Webservice login credentials
        self._userid       = False
        self._sessionid    = False

        # Last operation error information
        self._lasterror    = False

        if url.endswith('/') == False: url += '/'
        if url.endswith(self._servicebase) == False: url += self._servicebase
        self._serviceurl  = url

    '''
    Perform GET request and return response
    @url URL to connect
    @parameters Parameter map (key, value pairs)
    @tojson True if response should be decoded as JSON
    '''    
    def __doGet(self, url, parameters=False, tojson=True):
        if not parameters: parameters = {}
        useurl = (url + '?%s') % urllib.urlencode(parameters);
        connection = urllib.urlopen(useurl)
        response = connection.read()
        if tojson == True: response = json.read(response)
        return response

    '''
    Perform POST request and return response
    @url URL to connect
    @parameters Parameter map (key, value pairs)
    @tojson True if response should be decoded as JSON
    '''  
    def __doPost(self, url, parameters=False, tojson=True):
        if not parameters: parameters = {}
        parameters = urllib.urlencode(parameters);
        connection = urllib.urlopen(url, parameters)
        response = connection.read()
        if tojson == True: response = self.toJSON(response)
        return response

    '''
    Convert input data to JSON
    '''
    def toJSON(self, indata):
        return json.read(indata)

    '''
    Convert input object to JSON String
    '''
    def toJSONString(self, indata):
        return json.write(indata)

    '''
    Check if webservice response was not successful
    '''
    def hasError(self, response):
        if not response or (response['success'] == False):
            self._lasterror = response['error']
            return True
        self._lasterror = False
        return False

    '''
    Get last operation error
    '''
    def lastError(self):
        return self._lasterror

    '''
    Check webservice login.
    '''
    def __checkLogin(self):
        # TODO: Perform Login Again?
        return (self._userid != False)

    '''
    Create MD5 value (hexdigest)
    '''
    def __md5(self, indata):
        import md5
        m = md5.new()
        m.update(indata)
        return m.hexdigest()

    '''
    Get record id sent from the server
    '''
    def getRecordId(self, record):
        ids = record.split('x')
        return ids[1] 

    '''
    Perform Challenge operation
    '''
    def __doChallenge(self, username):        
        parameters = {
            'operation' : 'getchallenge',
            'username' : username
        }
        response = self.__doGet(self._serviceurl, parameters)
        if not self.hasError(response):
            result = response['result']
            self._servicetoken = result['token']
            self._expiretime = result['expireTime']
            self._servertime = result['serverTime']
            return True
        return False

    '''
    Perform Login operation
    '''
    def doLogin(self, username, accesskey):
        if self.__doChallenge(username) == False: return False
        parameters = {
            'operation' : 'login',
            'username'  : username,
            'accessKey' : self.__md5(self._servicetoken + accesskey)
        }
        response = self.__doPost(self._serviceurl, parameters)
        if not self.hasError(response):
            result = response['result']
            self._serviceuser = username
            self._servicekey  = accesskey
            self._sessionid   = result['sessionName']
            self._userid      = result['userId']
            return True
        return False

    '''
    Perform ListTypes operation
    @return modules names list
    '''
    def doListTypes(self):
        if not self.__checkLogin(): return False
        parameters = {
            'operation'   : 'listtypes',
            'sessionName' : self._sessionid
        }
        response = self.__doGet(self._serviceurl, parameters)
        if self.hasError(response): return False
        result = response['result']
        modulenames = result['types']

        returnvalue = {}
        for modulename in modulenames:
            returnvalue[modulename] = {
                'name' : modulename
            }
        return returnvalue

    '''
    Perform Query operation
    '''
    def doQuery(self, query):
        if not self.__checkLogin(): return False

        # Make the query end with ;
        if not query.endswith(';'): query += ';'
        
        parameters = {
            'operation'   : 'query',
            'sessionName' : self._sessionid,
            'query'       : query
        }
        response = self.__doGet(self._serviceurl, parameters) 
        if self.hasError(response): return False
        result = response['result']
        return result

    '''
    Extract column names from the query operation result.
    '''
    def getResultColumns(self, result):
        if len(result) > 0:
            return result[0].keys()
        return False

    '''
    Perform Describe operation on the module
    '''
    def doDescribe(self, module):
        if not self.__checkLogin(): return False
        parameters = {
            'operation'   : 'describe',
            'sessionName' : self._sessionid,
            'elementType' : module
        }
        response = self.__doGet(self._serviceurl, parameters)
        if self.hasError(response): return False
        result = response['result']
        return result

    '''
    Perform Retrieve operation on the module record.
    '''
    def doRetrieve(self, record):
        if not self.__checkLogin(): return False
        parameters = {
            'operation'   : 'retrieve',
            'sessionName' : self._sessionid,
            'id'          : record
        }
        response = self.__doGet(self._serviceurl, parameters)
        if self.hasError(response): return False
        result = response['result']
        return result

    '''
    Perform create operation on the module.
    '''
    def doCreate(self, module, valuemap):
        if not self.__checkLogin(): return False

        if 'assigned_user_id' not in valuemap:
            valuemap['assigned_user_id'] = self._userid

        parameters = {
            'operation'   : 'create',
            'sessionName' : self._sessionid,
            'elementType' : module,
            'element'     : self.toJSONString(valuemap)
        }
                                
        response = self.__doPost(self._serviceurl, parameters)
        if self.hasError(response): return False
        result = response['result']
        return result

    '''
    Invoke webservice method
    '''
    def doInvoke(self, method, params = False, type = 'POST'):
        if not self.__checkLogin(): return False

        parameters = {
            'operation' : method,
            'sessionName': self._sessionid
        }

        if params is not False:
            for key in params:
                if not parameters.has_key(key):
                    parameters[key] = params[key]

        response = False
        if type.upper() == 'POST':
            response = self.__doPost(self._serviceurl, parameters)
        else:
            response = self.__doGet(self._serviceurl, parameters)
        if self.hasError(response): return False
        result = response['result']
        return result
    
        
