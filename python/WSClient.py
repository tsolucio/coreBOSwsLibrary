import urllib2
import urllib
import hashlib
import json
import re

def md5sum(s):
    m = hashlib.md5(s)
    return m.hexdigest()

class WebserviceException(Exception):
    def __init__(self, code, message):
        self.code = code
        self.message = message

    def __str__(self):
        return "VtigerWebserviceException(%s, %s)" % (self.code, self.message)

def exception(response):
    result = response['error']
    return WebserviceException(result['code'], result['message'])

class WSClient:
    """
    Connect to a vtiger instance.
    """

    def __init__(self, service_url):
        """
        @param service_url:
        """
        self.__servicebase = 'webservice.php'
        self.__service_url = self.get_webservice_url(service_url)

        self.__serviceuser = ''
        self.__servicekey = ''

        self.__servertime = 0
        self.__expiretime = 0
        self.__servicetoken = 0

        self.__sessionid = False
        self.__userid = False

    def __do_get(self, **params):
        """
        @param params:
        @return:
        """
        param_string = urllib.urlencode(params)
        f = urllib2.urlopen('%s?%s' % (self.__service_url, param_string))
        return json.read(f.read())

    def __do_post(self, **parameters):
        """
        @param params:
        @return:
        """
        data = urllib.urlencode(parameters)
        f = urllib2.urlopen(self.__service_url, data)
        return json.read(f.read())

    # Get the URL for sending webservice request.
    def get_webservice_url(self, url):
        """
        @param url:
        @return:
        """
        url = re.findall('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', url)

        if len(url) >= 1:
            url = url[0]
            if str(url).find(self.__servicebase) < 0:
                if str(url[len(url) - 1:]) != '/':
                    url += str('/')
                url += self.__servicebase
        else:
            raise 'Invalid URL'

        return url

    def get(self, operation, **parameters):
        """
        @param operation:
        @param parameters:
        @return: @raise exception:
        """
        response = self.__do_get(operation=operation, sessionName=self.__sessionid, **parameters)
        if response['success']:
            return response['result']
        else:
            raise exception(response)

    def post(self, operation, **parameters):
        """
        @param operation:
        @param parameters:
        @return: @raise exception:
        """
        response = self.__do_post(
            operation=operation,
            sessionName=self.__sessionid,
            **parameters)
        if response['success']:
            return response['result']
        else:
            raise exception(response)

    #Perform the challenge
    def __do_challenge(self):
        """
        @return: @raise exception:
        """
        response = self.__do_get(operation='getchallenge', username=self.__serviceuser)
        if response['success']:
            self.__servicetoken = response['result']['token']
            self.__servertime = response['result']['serverTime']
            self.__expiretime = response['result']['expireTime']
            return True
        else:
            raise exception(response)

    #Do Login Operation
    def do_login(self, user, user_accesskey):
        """
        @param user:
        @param user_accesskey:
        @return:
        """
        self.__serviceuser = user
        self.__servicekey = user_accesskey

        if not self.__do_challenge():
            return False

        key = md5sum(self.__servicetoken + user_accesskey)
        response = self.__do_post(operation='login', username=user, accessKey=key)

        if response['success']:
            self.__sessionid = response['result']['sessionName']
            self.__userid = response['result']['userId']
            return True
        else:
            raise exception(response)

    def logout(self):
        if self.__sessionid != 0:
            self.post('logout')

    #List types available Modules.
    @property
    def do_listtypes(self):
        return self.get('listtypes')

    #Describe Module Fields.
    def do_describe(self, name):
        """
        @param name:
        @return:
        """
        return self.get('describe', elementType=name)

    #Do Create Operation
    def do_create(self, entity, params):
        """
        @param entity:
        @param params:
        @return:
        """
        json_data = json.write(params)
        return self.post('create', elementType=entity, element=json_data)

    #Retrieve details of record.
    def do_retrieve(self, id):
        """
        @param id:
        @return:
        """
        return self.get('retrieve', id=id)

    #Do Update Operation
    def do_update(self, params):
        """
        @param obj:
        @return:
        """
        json_data = json.write(params)
        return self.post('update', element=json_data)

    #Do Delete Operation
    def do_delete(self, id):
        """
        @param id:
        @return:
        """
        return self.post('delete', id=id)

    #Do Query Operation
    def do_query(self, query):
        """
        @param query:
        @return:
        """
        return self.get('query', query=query)

    #Invoke custom operation
    def do_invoke(self, metod, params, metod_type='POST'):
        """
        @param metod:
        @param params:
        @param metod_type:
        @return:
        """
        if metod_type.upper() == 'POST':
            response = self.post(metod, **params)
        else:
            response = self.get(metod, **params)

        return response
