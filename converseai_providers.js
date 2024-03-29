/**
 * @file converseai_providers.js
 * @author andrew.rapo@jibo.com
 *
 * Generated by the converse-cli tool for use with the Converse AI
 * Plugins SDK. https://developers.converse.ai/
 */

'use strict';

const Status                    = require('@converseai/plugins-sdk').Status;
const RegistrationDataResponse  = require('@converseai/plugins-sdk').Payloads.RegistrationDataResponse;
const Utilities                 = require('./converseai_externals/utilities/utilities')

var onProviderRegister = function(app, body) {
  
  /** @type {RegistrationDataResponse} response The Converse AI response to respond with. */
  var response = new RegistrationDataResponse();
  /*
  * Set the registrationData for the provider. It's important to return all
  * information that you wish to be stored on the provider.
  */
  /* Grab the External Webhook URL and return it in the registration Data */
  var registrationData = body.payload.registrationData
  if (body.payload.externalURI != null) {
    registrationData.inbound = body.payload.externalURI.inbound
    response.setRegistrationData(registrationData);
  }
  if (registrationData.inbound_hook != null) {
    /* We must be in the loopback, ignore and return */
      app.send(Status.SUCCESS);
  } else {
    /* Ok it's a new registration */ 


    /** Create Unique Hash for Internal Communication */
    var crypto = require("crypto");
    var verification_token = crypto.randomBytes(10).toString('hex');
    registrationData.verification_token = verification_token

    /** Setup Custom Channel Registration Structure */
    var request = require('request');
    var requestbody = {}
    requestbody.registrationData = {}
    requestbody.registrationData.outboundURL = body.payload.externalURI.webhook
    requestbody.registrationData.verifyString = verification_token

    /** Create Converse API Callback Token */
    var callerToken = Utilities.generate_auth(body.caller)
  
    var hostname = body.caller.provider.providerDomain

    // Configure the request
    var options = {
      url: "https://" + hostname + "/api/plugin/generic_channel/register/provider",
      method: 'POST',
      headers: { 
        "X-CONVERSE-PLUGIN-INVOKER": callerToken
      },
      json: requestbody,
    }
    /*
    * This will return a success status and response to the registration function.
    * It is important to always call `app.send` with a status and a response when
    * the method has finished computing and must always return the data to be
    * stored on the provider.
    */
    app.send(Status.SUCCESS, response);

    /* Now we pause and wait for the plugin to finish registering, so we can get the channel registered */
    setTimeout(function () {
      // Start the request to register the custom channel
      request(options, function (error, httpresponse, body) {
        if (!error && httpresponse.statusCode == 202) {
          /*If Successful then call back to *this* plugin to update it with the inbound hook from the registration */
          registrationData.inbound_hook = body.registrationData.inboundURL
          requestbody.registrationData = registrationData
          var pluginUUID = body.caller.pluginUUID
          var options = {
            url: "https://" + hostname + "/api/plugin/" + pluginUUID + "/register/provider",
            method: 'POST',
            headers: { 
              "X-CONVERSE-PLUGIN-INVOKER": callerToken
            },
            json: requestbody,
          }
          request(options, function (error, httpresponse, body) {
            console.log(error)
            console.log(httpresponse)
            console.log(body)
          })
        }
      })
    }, 3000); 
  }
}

var onProviderUnregister = function(app, body) {
  /**
  * Registration parameters assigned to body.payload.registrationData
  * and Module parameters assigned to body.payload.moduleData.
  * @example
  * var regOne = body.payload.registrationData.regOne;
  * var modOne = body.payload.moduleData.modOne;
  */

  /*
  * This will return a success status and response to the registration function.
  * It is important to always call `app.send` with a status when the method
  * has finished computing.
  */

  /* Unregister the custom channel as well */
  var request = require('request');

  /** Create Converse API Callback Token */
  var callerToken = Utilities.generate_auth(body.caller)
  

  /* Set Request Parameters */
  var hostname = body.caller.provider.providerDomain
  var pluginUUID = body.caller.pluginUUID

  var options = {
    url: "https://" + hostname + "/api/plugin/" + pluginUUID + "/register/provider",
    method: 'DELETE',
    headers: { 
      "X-CONVERSE-PLUGIN-INVOKER": callerToken
    }
  }
  request(options, function (error, httpresponse, body) {
    console.log(error)
    console.log(httpresponse)
    console.log(body)
  })
  app.send(Status.SUCCESS);
}

module.exports = {
  onProviderRegister: onProviderRegister,
  onProviderUnregister: onProviderUnregister
}