
const Status            = require('@converseai/plugins-sdk').Status;
const ExternalResponse  = require('@converseai/plugins-sdk').Payloads.ExternalFunctionResponse;

module.exports = {
	challenge_handler: function challenge_handler(app, body, response) {
  		var challengeresponse = {}
  		challengeresponse.challenge = body.payload.bodyData.payload.message.text
      response.setBody(challengeresponse);
      app.send(Status.SUCCESS, response);
	},
  variableMapper: function variableMapper(variablearray) {
  	var variablemap = {}
  	var x
  	for (x in variablearray) {
    	var key = variablearray[x].key
    	var value = variablearray[x].value
    	variablemap[key] = value
  	}
  	return variablemap
	},
  sendToCustomChannel: function sendToCustomChannel(messageData, body, app) {
    var verification_token = body.payload.registrationData.verification_token
    var inbound_hook = body.payload.registrationData.inbound_hook
    var response = new ExternalResponse();
    var request = require('request');
    var requestbody = {}
    requestbody.action = "message"
    requestbody.verifyString = verification_token
    requestbody.payload = {}
    requestbody.payload.message = messageData

    // Configure the request
    var options = {
      url: inbound_hook,
      method: 'POST',
      json: requestbody,
    }
    request(options, function(error, internalresponse, body) {
      response.setBody(body);
      response.setHTTPStatus(internalresponse.statusCode);
      app.send(Status.SUCCESS, response);
    });
  },
  generate_auth: function generate_auth(caller) {
    var callerString = new Buffer(JSON.stringify(caller));
    var callerToken = callerString.toString('base64');
    return callerToken
  }
}

