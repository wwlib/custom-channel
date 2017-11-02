
module.exports = {
	inbound_handler: function inbound_handler(body, callback) {
		/*  Replace the below with paths to the data from your inbound webhook
      	Details on available paths for form, query and JSON data are available
      	from https://get.converse.ai/docs/external_functions.

      	For further details on userID, threadID and message
      	please see: https://get.converse.ai/docs/custom-channel
  		*/
  
      var inboundData = {}

  		/* EDIT HERE */
    	
      inboundData.userID = body.payload.bodyData.userID
    	inboundData.threadID = body.payload.bodyData.threadID
    	inboundData.message = body.payload.bodyData.message
  
		  /******************
   		STOP EDITING HERE
   		*****************/

		/** Now send completed data structure to the Custom Channel */

    return callback(inboundData)
	},
	outbound_handler: function outbound_handler(outboundData, registrationData, callback) {

    /* outboundData is an object including 'userID', 'threadID' and 'text' for the outbound message */
    /* registrationData is an object containing the Plugin Registration data from the Plugin */
    /* with the variables array turned into a map */
  	
    /* Edit from here downwards to add your own mapping to your own API */





   
    /* Always leave this section in to enable a clean response and function close */
    return callback()
	}
}
