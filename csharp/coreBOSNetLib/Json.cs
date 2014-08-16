using System;
using System.Collections.Generic;
using System.Collections;
using System.Text.RegularExpressions;

namespace VtigerWebservice
{
	delegate Object TranslateToken(String tokenValue);
	
	class JsonException :Exception
	{
		string msg;
		public JsonException(string message){
			this.msg = message;
		}
		
		public override string ToString(){
			return msg;
		}
	}
	
	class Token{
		public string Name;
		public string Value;
	}
	
	class JsonReader{
		List<string> tokens = new List<string> {
			"string", "number", "true", "false", "null", "open_square",
			"close_square", "open_curly", "close_curly", "comma", "colon"
		};
		Regex tokenPattern;
		IEnumerator it;
		Token currentToken;
		
		public JsonReader(){
			tokenPattern = constructTokenPattern();
		}
		
		public Object Read(string input){
			MatchCollection matches = tokenPattern.Matches(input);
			it = matches.GetEnumerator();
			NextToken();
			
			return ReadExpr();
		}
		
		private void NextToken(){
			if(it.MoveNext()){
				currentToken = TokenFromMatch((Match)it.Current);
			}else{
				currentToken=null;
			}
		}
		
		private Token TokenFromMatch(Match match){
			Token token = new Token();
			token.Name = GetTokenName(match);
			token.Value = match.Value;
			return token;
		}
		
		private string GetTokenName(Match match){
			foreach(var tokenName in tokens){
				if(match.Groups[tokenName].Value!=""){
					return tokenName;
				}
			}
			throw new JsonException("Couldn't figure out the token name");
		}
		
		
		private Object ReadExpr(){
			switch(currentToken.Name){
			case "string":
			case "number":
			case "true":
			case "false":
			case "null":
				return processToken();
			case "open_square":
				return ReadArray();
			case "open_curly":
				return ReadObject();
			default:
				throw new JsonException("Found an invalid token name");
			}
		}
		
		private object ReadArray(){
			List<object> list = new List<object>();
			NextToken();
			if(currentToken.Value=="]"){
				NextToken();
				return list;
			}
			while(true){
				object expr = ReadExpr();
				list.Add(expr);
				NextToken();
				if(currentToken.Value!=","){
					break;
				}
				NextToken();
			}
			if(currentToken.Value=="]"){
				return list;
			}else{
				throw new JsonException("Invalid end for a list");
			}
			
		}
		
		private object ReadObject(){
			NextToken();
			Dictionary<string, object> dict = new Dictionary<string, object>();
			if(currentToken.Value=="}"){
				return dict;
			}
			while(true){
				if(currentToken.Name!="string"){
					throw new JsonException("Was expecting a string as the key");
				}
				string key = (string)processToken();
				NextToken();
				if(currentToken.Value!=":"){
					throw new JsonException("Was expecting a colon as the separator between the key and the value");
				}
				NextToken();
				object val=ReadExpr();
				
				dict[key] = val;
				
				NextToken();
				if(currentToken.Value!=","){
					break;
				}
				NextToken();
			}
			if(currentToken.Value=="}"){
				return dict;
			}else{
				throw new JsonException("Invalid end for an object");
			}
			
		}
		
		private Regex constructTokenPattern(){
			IDictionary<string, string> tokens = new Dictionary<string, string>();
			tokens["string"] = @"[""]([^""\\]|\\[""\\/bfnrt])+[""]";
			tokens["number"] = @"-?[0-9]+([.][0-9]+)?([eE][0-9]+)?";
			tokens["true"] = "true";
			tokens["false"] = "false";
			tokens["null"] = "null";
			tokens["open_square"] = @"\[";
			tokens["close_square"] = "]";
			tokens["open_curly"] = @"\{";
			tokens["close_curly"] = "}";
			tokens["comma"] = ",";
			tokens["colon"] = ":";
			List<string> tokenPatterns = new List<String>();
			foreach(var token in tokens){
				tokenPatterns.Add(string.Format("(?<{0}>{1})", token.Key, token.Value));
			}
			string pattern = string.Join("|", tokenPatterns.ToArray());
			return new Regex(pattern);
		}
		
		private object processToken(){
			string name = currentToken.Name;
			string val = currentToken.Value;
			
			switch(name){
			case "string":
				var stringPattern = new Regex(@"\\[""\/bfnrt]");
				var escape = new Dictionary<string, string> {
					{@"\""", "\""},
					{@"\\", "\\"}, 
					{@"\/", "/"}, 
					{@"\b", "\b"}, 
					{@"\f", "\f"}, 
					{@"\n", "\n"}, 
					{@"\r", "\r"}, 
					{@"\t", "\t"}, 
					//{"\u"}
				};
				val = val.Substring(1, val.Length-2);
				return stringPattern.Replace(val, delegate(Match input){return escape[input.Value];});
			case "number":
				long num;
				if(long.TryParse(val, out num)){
					return num;
				}else{
					return double.Parse(val);
				}
			case "true":
				return true;
			case "false":
				return false;
			case "null":
				return null;
			default:
				return null;
			}
		}	
	}
	
	class JsonWriter{
		
        public string Write(object input){
			if(input==null){
				return "null";
			}else if(input is Dictionary<string, object>){
				return WriteObject(input as Dictionary<string, object>);
			}else if(input is List<object>){
				return WriteArray(input as List<object>);
			}else if(input is long || input is double || input is int){
				return Convert.ToString(input);
			}else if(input is bool){
				return ((bool)input)?"true":"false"; 
			}else if(input is string){
				return WriteString(input as string);
			}
			
			return null;
		}
		
        private string WriteObject(Dictionary<string, object> input){
			List<string> parts = new List<string>();
			foreach(var pair in input){
				parts.Add(Write(pair.Key)+":"+Write(pair.Value));
			}
			return "{"+String.Join(",", parts.ToArray())+"}";
		}
		
        private string WriteArray(List<object> input){
			List<string> parts = new List<string>();
			foreach(var obj in input){
				parts.Add(Write(obj));
			}
			return "["+String.Join(",", parts.ToArray())+"]";
		}

		private string WriteString(string val){
			var stringPattern = new Regex("\"|\\\\|\b|\f|\n|\r|\t");
			var escape = new Dictionary<string, string> {
				{"\"", @"\"""},
				{"\\", @"\\"}, 
				{"/", @"\/"}, 
				{"\b", @"\b"}, 
				{"\f", @"\f"}, 
				{"\n", @"\n"}, 
				{"\r", @"\r"}, 
				{"\t", @"\t"}, 
			};
			return "\""+stringPattern.Replace(val, delegate(Match input){return escape[input.Value];})+"\"";
		}
	}
	
	public class Json : IJson
	{
		public Object Read(string input){
			return new JsonReader().Read(input);
		}
		public string Write(object input){
			return new JsonWriter().Write(input);
		}
	}
}
