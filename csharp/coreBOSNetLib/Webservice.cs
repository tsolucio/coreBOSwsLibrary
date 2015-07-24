/*
Copyright (c) 2014, David Fernández González, All rights reserved.

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 3.0 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library.
*/

using System;
using System.Net;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using System.Text;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace VtigerWebservice
{
    /// <summary>
    /// 
    /// </summary>
	public class WSClientException : Exception{
        private string _Message = "";

        public WSClientException(Dictionary<string, object> result){            
            if (result.ContainsKey("error")){
                Dictionary<string, object> _error = getDictionary(result["error"]) as Dictionary<string, object>;
                this._Message = _error["code"] + " - " + _error["message"];
            }            
		}

        private object getDictionary(object value){
            if (value != null){
                return JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(value.ToString());
            }
            return null;
        }

        public override string Message{
            get { return _Message; }
        }
	}

    /// <summary>
    /// Clase principal.
    /// </summary>
	public class WSClient 
	{
        private string ServiceBase = "webservice.php";
		private string ServiceUrl;
		private string Username;
		private string AccessKey;
		private string SessionId;
		private string UserId;
				
		public class ListTypeInfo{
			public bool isEntity;
			public string singular;
			public string label;
			public Dictionary<string, object> information;
		}
		
		public class DescribeTypeInfo{
			public string name;
			public Dictionary<string, object> information;
		}
		
		public class DescribeFieldInfo{
			public bool mandatory;
			public string name;
			public bool nullable;
			public bool editable;
			public string label;
			public DescribeTypeInfo type;
			public Dictionary<string, object> information;
		}
		
		public class DescribeInfo{
			public string labelFields;
			public string idPrefix;
			public string name;
			public bool deleteable;
			public bool retrieveable;
			public bool createable;
			public string label;
			public bool updateable;
			public bool isEntity;
			public Dictionary<string, object> information;
			public Dictionary<string, DescribeFieldInfo> fields;
		}

        /// <summary>
        /// Main.
        /// </summary>
        /// <param name="ServiceUrl"></param>
        public WSClient(String ServiceUrl){
			this.ServiceUrl = getWebServiceURL(ServiceUrl);
            if (this.ServiceUrl == "")
                throw new Exception("Invalid URL");
		}

        /// <summary>
        /// 
        /// </summary>
        /// <param name="parameters"></param>
        /// <returns></returns>
        private Dictionary<string, object> doGet(Dictionary<string, string> parameters)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(ServiceUrl + "?" + ParamString(parameters));
            request.Method = "GET";
            
            Stream stream = request.GetResponse().GetResponseStream();
            Dictionary<string, object> result;

            using (StreamReader sr = new StreamReader(stream)){
                result = DeserializeJSON(sr.ReadToEnd());                
            }                   
            
            return result;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="parameters"></param>
        /// <returns></returns>
        private Dictionary<string, object> doPost(Dictionary<string, string> parameters)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(ServiceUrl);
            request.Method = "POST";

            string paramString = ParamString(parameters);
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = paramString.Length;

            StreamWriter stOut = new StreamWriter(request.GetRequestStream(), System.Text.Encoding.ASCII);
            stOut.Write(paramString);
            stOut.Close();

            Stream stream = request.GetResponse().GetResponseStream();
            Dictionary<string, object> result;
            
            using (StreamReader sr = new StreamReader(stream)){
                result = DeserializeJSON(sr.ReadToEnd()) as Dictionary<string, object>;
            }
            
            return result;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="operation"></param>
        /// <param name="parameters"></param>
        /// <returns></returns>
		private Dictionary<string, object> Get(string operation, Dictionary<string, string> parameters)
        {
			parameters = new Dictionary<string, string>(parameters);
			parameters["operation"] = operation;
			parameters["sessionName"] = SessionId;

			var response = doGet(parameters) as Dictionary<string, object>;

            if (((bool)response["success"]) == true){
                var result = DeserializeJSON(response["result"].ToString()) as Dictionary<string, object>;
                return result;
            }
            else { throw new WSClientException(response); }
		}

        /// <summary>
        /// 
        /// </summary>
        /// <param name="operation"></param>
        /// <param name="parameters"></param>
        /// <returns></returns>
		private Dictionary<string, object> Post(string operation, Dictionary<string, string> parameters)
        {			
            parameters = new Dictionary<string, string>(parameters);
			parameters["operation"] = operation;
			parameters["sessionName"] = SessionId;
			
            var response = doPost(parameters) as Dictionary<string, object>;
			
            if(((bool)response["success"])==true){
				var result = DeserializeJSON(response["result"].ToString()) as Dictionary<string, object>;
				return result;
		 	}
            else { throw new WSClientException(response); }
		}

        /// <summary>
        /// 
        /// </summary>
        /// <param name="url"></param>
        /// <returns></returns>
        private string getWebServiceURL(string url = "")
        {
            if (Uri.IsWellFormedUriString(url, UriKind.RelativeOrAbsolute)){
                Uri l_strUri = new Uri(url);
                if (l_strUri.Scheme == Uri.UriSchemeHttp || l_strUri.Scheme == Uri.UriSchemeHttps){
                    if(url.IndexOf(this.ServiceBase)>=1){
                        return (url);
                    }
                    else{
                        if (url[url.Length - 1] == '/'){
                            url += this.ServiceBase;
                        }
                        else{ 
                            url += "/" + this.ServiceBase; 
                        }
                        return (url);
                    }
                }
            }
            return ("");
        }

        /// <summary>
        /// Check and perform login if requried.
        /// </summary>
        /// <returns></returns>
        private bool getCheckLogin(){
            if (this.SessionId != "")
                return (true);                        
            return (false);
        }

        /// <summary>
        /// Perform the challenge
        /// </summary>
        /// <param name="UserId"></param>
        /// <returns></returns>
        private Dictionary<string, object> doChallenge(string UserName)
        {
            Dictionary<string, object> response = doGet(new Dictionary<string, string>(){
				{"operation", "getchallenge"}, 
				{"username", UserName}
			}) as Dictionary<string, object>;
            
            if (((bool)response["success"]) == true){
                var result = DeserializeJSON(response["result"].ToString()) as Dictionary<string, object>;
                return result;
            }
            else { throw new WSClientException(response); }
        }
			
        /// <summary>
        /// Do Login Operation
        /// </summary>
        /// <returns></returns>
        public bool doLogin(string User = "", string AccessKey = "", bool withpassword = false)
        {
            if (User == "" || AccessKey == "")
                throw new Exception("User and key incorrect.");

            var resChallenge = doChallenge(User);
			string token = resChallenge["token"] as string;

            Dictionary<string, object> loginResponse = doPost(new Dictionary<string, string> {
                    {"operation", "login"}, 
				    {"username", User}, 
                    {"accessKey", (withpassword ? token+AccessKey : md5sum(token+AccessKey))}
                }
            ) as Dictionary<string, object>;
            	
            if(((bool)loginResponse["success"])==true)
            {
                dynamic loginResult = DeserializeJSON(loginResponse["result"].ToString()) as Dictionary<string, object>;
                this.SessionId = loginResult["sessionName"] as string;
                this.UserId = loginResult["userId"] as string;

                this.Username = User;
                this.AccessKey = AccessKey;

                return true;
            }
            else { throw new WSClientException(loginResponse); }        	            
		}
		
        /// <summary>
        /// List types available Modules.
        /// </summary>
        /// <returns></returns>
		public Dictionary<string, ListTypeInfo> doListTypes()
        {
            if (!getCheckLogin())
                throw new Exception("Login error.");

			var result = Get("listtypes", new Dictionary<string, string>());
			var info = DeserializeJSON(result["information"].ToString()) as Dictionary<string, object>;

            var types = new Dictionary<string, ListTypeInfo>();

            foreach(var val in info)
            {
				string key = val.Key;
				var data = DeserializeJSON(val.Value.ToString()) as Dictionary<string, object>;
				
                var listTypeInfo = new ListTypeInfo();
				listTypeInfo.isEntity   = (bool)data["isEntity"];
				listTypeInfo.label      = (string)data["label"];
				listTypeInfo.singular   = (string)data["singular"];
				listTypeInfo.information = data;

				types.Add(key, listTypeInfo);
			}
			
            return types;
		}
		
        /// <summary>
        /// Describe Module Fields.
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
		public DescribeInfo doDescribe(string name)
        {
            if (!getCheckLogin())
                throw new Exception("Login error.");

			var result = Get("describe", new Dictionary<string, string>{{"elementType", name}});
			var describeInfo = new DescribeInfo();
			
			describeInfo.labelFields = (string)result["labelFields"];
			describeInfo.idPrefix   = (string)result["idPrefix"];
			describeInfo.name       = (string)result["name"];
			describeInfo.deleteable = (bool)result["deleteable"];
			describeInfo.retrieveable = (bool)result["retrieveable"];
			describeInfo.createable = (bool)result["createable"];
			describeInfo.label      = (string)result["label"];
			describeInfo.updateable = (bool)result["updateable"];
			describeInfo.isEntity   = (bool)result["isEntity"];
			describeInfo.information = result;
			
			var fields = result["fields"] as List<object>;
			var fieldDict = new Dictionary<string, DescribeFieldInfo> ();

			foreach(var val in fields)
            {
				var field = val as Dictionary<string, object>;
				var fieldInfo = new DescribeFieldInfo();

				fieldInfo.mandatory = (bool)field["mandatory"];
				fieldInfo.name = (string)field["name"];
				fieldInfo.nullable = (bool)field["nullable"];
				fieldInfo.editable = (bool)field["editable"];
				fieldInfo.label = (string)field["label"];
				fieldInfo.information = field;
				
                var fieldType = new DescribeTypeInfo();
				var typeInfo = field["type"] as Dictionary<string, object>;
				
                fieldType.name = (string)typeInfo["name"];
				fieldType.information = typeInfo["type"] as Dictionary<string, object>;
				fieldInfo.type = fieldType;
				
                fieldDict.Add(fieldInfo.name, fieldInfo);
			}
			
            describeInfo.fields = fieldDict;
			return describeInfo;
		}
		
        /// <summary>
        /// Retrieve details of record.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
		public Dictionary<string, object> doRetrieve(string id)
        {
            if (!getCheckLogin())
                throw new Exception("Login error.");

			return Get("retrieve", new Dictionary<string, string>{
				{"id", id}
			});
		}

        /// <summary>
        /// Do Create Operation
        /// </summary>
        /// <param name="name"></param>
        /// <param name="data"></param>
        /// <returns></returns>        
		public Dictionary<string, object> Create(string name, Dictionary<string, object> data)
        {
            if (!getCheckLogin())
                throw new Exception("Login error.");

            if (data.Count >= 1){
                var items = JsonConvert.SerializeObject(data);
                return Post("create", new Dictionary<string, string>{
				    {"elementType",name}, {"element", items}
			    });
            }
            else { throw new Exception("Param incorrect."); }
		}
		
        /// <summary>
        /// Do Update Operation
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>        
		public Dictionary<string, object> doUpdate(Dictionary<string, object> data)
        {
            if (!getCheckLogin())
                throw new Exception("Login error.");

            if (data.Count >= 1){
                var items = JsonConvert.SerializeObject(data);
                return Post("update", new Dictionary<string, string>{
				    {"element", items.ToString()}
			    });
            }
            else { throw new Exception("Param incorrect."); }
		}
		
        /// <summary>
        /// Do Delete Operation
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
		public bool doDelete(string id)
        {
            if (!getCheckLogin())
                throw new Exception("Login error.");

			var response = Post("delete", new Dictionary<string, string>{
				{"id", id}
			});

            return true;
		}
		
        /// <summary>
        /// Do Query Operation
        /// </summary>
        /// <param name="query"></param>
        /// <returns></returns>
		public Dictionary<string, object> doQuery(string query)
        {
            if (!getCheckLogin())
                throw new Exception("Login error.");

			var response = Get("query", new Dictionary<string, string>{
				{"query", query}
			}) as Dictionary<string, object>;

            return response;
		}
			
		/// <summary>
		/// 
		/// </summary>
		/// <param name="val"></param>
		/// <returns></returns>
		private string Hexify(int val){
			List<string> hexMap = new List<string>{"0", "1", "2", "3", "4", "5", "6", "7", "8", "9","a", "b", "c", "d", "e", "f"};
			return hexMap[val/16 % 16]+hexMap[val%16];
		}
		
        /// <summary>
        /// 
        /// </summary>
        /// <param name="part"></param>
        /// <returns></returns>
		private string EncodeReserveds(string part){
			Regex re = new Regex(@":|/|\?|#|\[|\]|@|!|\$|&|'|\(|\)|\*|\+|,|;|=");
			return re.Replace(part, delegate (Match match){return "%"+Hexify(match.Value.ToCharArray()[0]);});
		}

        /// <summary>
        /// 
        /// </summary>
        /// <param name="parameters"></param>
        /// <returns></returns>
        private String ParamString(Dictionary<string, string> parameters)
        {
            List<string> parts = new List<string>();
            foreach (var param in parameters){
                parts.Add(EncodeReserveds(param.Key) + "=" + EncodeReserveds(param.Value));
            }
            return string.Join("&", parts.ToArray());
        }

	    /// <summary>
	    /// Generated MD5
	    /// </summary>
	    /// <param name="input"></param>
	    /// <returns></returns>
		private string md5sum(string input)
        {
    		var md5 = System.Security.Cryptography.MD5.Create();
    		byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
    		byte[] hash = md5.ComputeHash(inputBytes);
     		
    		StringBuilder sb = new StringBuilder();
    		for (int i = 0; i < hash.Length; i++){
        		sb.Append(hash[i].ToString("X2"));
    		}
    		return sb.ToString().ToLower();
		}

        /// <summary>
        /// Deserialize json string.
        /// </summary>
        /// <param name="json"></param>
        /// <returns></returns>
        private static Dictionary<string, object> DeserializeJSON(string json)
        {
            var dict = new Dictionary<string, object>();

            if (string.IsNullOrEmpty(json)) 
                return dict;

            JToken jsonType = JToken.Parse(json);

            if (jsonType.Type == JTokenType.Array){ 
                List<Dictionary<string, object>> ValueList = JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(json);
                for (int i = 0; i < ValueList.Count; i++){
                    dict.Add(i.ToString(), ValueList[i]);
                }                
            }
            else{
                var jsDict = JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
                if (jsDict != null)
                    dict = jsDict;
            }
         
            return dict;
        }
	}
}
