# Integromat Integration

**coreBOS** counts with a very powerful and flexible integration with [Integromat](https://www.integromat.com) thanks to [Mikel Kasneci](https://github.com/Mikel1995). This integration will permit you to plugin your coreBOS with an [inmense set of applications](https://www.integromat.com/en/integrations).

You can add the coreBOS/Integromat application to your inventory [using this link](https://www.integromat.com/en/apps/invite/corebos-177516/687a9e813e7d0004c330bac080669286)

The coreBOS team would appreciate you created your Integromat account [using this affiliate link](https://www.integromat.com/?pc=corebos) as that will help support the project and keep us creating all this awesome software!

The code is open source and you can see the application inside Integromat and also on [the GitHub repository](https://github.com/Mikel1995/coreBosToIntegromat).

### Basic Explain

Corebos is a CRM added to Integromat platform using JSON technique, a technique that allow to integrate all application which work with API. 
Steps to create a new App on integromat are very well explaind on their site here https://integromat.github.io/apps/articles/getting-started.html
so i will jump to our specific case!

## Base 
Base structure all modules and remote procedures inherits from.
For example here we have 
```JSON
"qs": {
  "sessionName": "{{connection.sessionName}}"
},
"baseUrl": "{{connection.corebosurl}}/webservice.php",
.....
```
`qs`- Default query string parameters that every module will use </br>`baseUrl` If you want to use this base URL in a request, you need to start the URL of an endpoint with / character</br> Both those which are declared on Base section, will be not necessary to declared on other modules, because thei are inhert from base.

## Connections
Specifies the account validation process. This specification does not inherit from base.

Connection make the authentication part, this make a API request and save the sessionName, which will be used on another requests
Our case:</br>
```JSON
....
"response": {
  "data": {
    "userID": "{{body.result.userId}}",
    "sessionName": "{{body.result.sessionName}}"
  },
....
```
we get the sessionName, and we use on Base with this format `"sessionName": "{{connection.sessionName}}"`

## Modules 

### Communication

Communications is the part when you prepare the request</br>
In order to make a request you have to specify at least a url. All other directives are not required</br>
https://integromat.github.io/apps/action.html#communication
### Static Parameters

[https://integromat.github.io/apps/action.html#parameters] - Parameters describe what your module or connection will receive as input from the user.

### Mappable Parameters 
Array of mappable parameters user can fill while configuring the module. Mappable parameters can contain variables from other modules. Parameters are accessible via  `{{parameters.paramName}}`

### Interface
[https://integromat.github.io/apps/action.html#interface] - Describes structure of output bundles. Specification is the same as Parameters.

#### PS: In  Static Parameters, Mappable Parameters and Interface you can use Remote Procedures
Remote procedures has more or less the same logic as Modules, they have Communication and parameters and does inherit from **Base**. We can use output of a remote procedures as input on a communication module.

Example: </br>
We have the Create Object module, we use the **Get List Types** Remote procedure on Mappable Parameters

```JSON
[
	{
		"name": "elementType",
		"type": "select",
		"label": "Element type",
		"options": {
			"store": "rpc://RpcListTypes",
			"nested": [
				"rpc://RpcGetTypeFields"
			]
		},
		"editable": true,
		"required": true
	}
]
````
What does this? This make e request and return all list types and validate on the formt that Integromat knows, and create inputs 

```JSON
{
	"qs": {
		"operation": "listtypes"
	},
	"url": "/",
	"method": "GET",
	"response": {
		"output": {
			"label": "{{item}}",
			"value": "{{item}}"
		},
		"iterate": "{{body.result.types}}"
	}
}
```

## Functions 
https://integromat.github.io/apps/articles/functions.html - IML Functions is a powerful feature, that allows you to write your own JavaScript functions and execute them inside IML expressions to process data.
Those are well explained on their site, so i will explain a specific case.

This is a function that create a query on base of Filter on integromat:</br>

```JAVASCRIPT
function transformFilterInput(filter, objectName) {
            var conditionForOr = "";

            for (var i = 0; i < filter.length; i++) {
                var conditionForAnd = "";
                if (i === 0) {
                    conditionForOr += "where ( ";
                } else {
                    conditionForOr += "or ( "
                }
                for (let j = 0; j < filter[i].length; j++) {
                    var element = filter[i][j];
                    condition = "";
                    if (j > 0) {
                        conditionForAnd += " and "
                    }
                    switch (element.o) {
					   case "number:eq":
                        case "text:equals":
                            condition = " = ";
                            break;
						case "number:ne":
                        case "text:notEquals":
                            condition = " <> ";
                            break;
                        case "text:startsWith":
                            condition = " like ";
                            element.b = element.b + "%";
                            break;
                        case "text:endsWith":
                            condition = " like ";
                            element.b = "%" + element.b
                            break;
                        case "text:contains":
                            condition = " like ";
                            element.b = "%" + element.b + "%"
                            break;
                        case "number:lt":
                            condition = " < ";
                            break;
                        case "Greater then":
                            condition = " > ";
                            break;
                        case "number:gte":
                            condition = " >= ";
                            break;
                        case "number:lte":
                            condition = " =< ";
                            break;
                        default:
                            break;
                    }
                    conditionForAnd += element.a + " " + condition + " " + element.b;
                }
                conditionForOr += conditionForAnd + " ) ";
            }
            var query = 'select * from ' + objectName + ' ' + conditionForOr + ';';
            return query;
        }
```

this is used on Search Object module: </br>

```JSON
{
	"qs": {
		"query": "{{transformFilterInput(parameters.filter, parameters.elementType)}}",
		"operation": "query"
	},
	"url": "/",
	"method": "POST",
	"response": {
		"output": "{{body.result}}"
	}
}
```

**Enjoy!!**
