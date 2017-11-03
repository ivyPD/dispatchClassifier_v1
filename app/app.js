
(function() {
  "use strict";
  return {
    displayText: function(thetext, target) {
      jQuery(this.$container).find('#' + target).text(thetext);
    },
    injectHTML: function(thehtml, target) {
      jQuery(this.$container).find('#' + target).html(thehtml);
    },
    initialize: function() {
      var _this = this;
      var monkeykey = '023e1a4e1dfc4ea6ae0a20e9cdff437d43d0d87a';
      console.log("Dispatch AI App Started");
      jQuery(".classify_option_div").hide();

      if(domHelper.ticket.getTicketInfo().helpdesk_ticket.group_id == "12000000687") {
        if(page_type == "ticket") {
        //place the app on the ticket screen
        appPlaceholder.ticket.requestorInfo(jQuery(this.$container));

        //read ticket variables
        var ticketSubject = domHelper.ticket.getTicketInfo().helpdesk_ticket.subject;
        var ticketDescription = domHelper.ticket.getTicketInfo().helpdesk_ticket.description;

        //run function on button click
        jQuery(this.$container).find("#classify_classify").on("click", function() {
          //set data for API call
          var taskClassifierURL = "https://api.monkeylearn.com/v2/classifiers/cl_T562n35M/classify/";
          var jsonHeaders = {"Authorization": "Token " + monkeykey, "Content-Type": "application/json" };
          var jsonBody = { "text_list": [ String(ticketSubject) , String(ticketDescription)] };
          var options = { headers: jsonHeaders, body: JSON.stringify(jsonBody) };

          //make API call and handle the results
          _this.$request.post(taskClassifierURL, options)
          .done(function(data){
                //response received, handle it
                var classification = JSON.parse(data.response);
                //place to do logic checking the probability before displaying the final Classification
                _this.injectHTML("<i><b>Subject = </b> " + classification.result[0][0].label + " <b> | Description = </b>" + classification.result[1][0].label+"</i>", "classify_info");

                var data_all = [String(ticketSubject),String(ticketDescription),classification];


                // Logics when you click the option buttons
                if( classification.result[0][0].label == classification.result[1][0].label ){
                 jQuery("#classify_classify").remove();
                 _this.injectHTML('<button type="button" class="btn btn-success" id="classify_correct">Correct</button>'+
                  '&nbsp;<button type="button" class="btn btn-danger" id="classify_wrong">Wrong</button>', "classify_button_div");
               }else{
                jQuery("#classify_button_div").empty();
                jQuery("#classify_classify").remove();
                jQuery(".classify_option_div").show();
              }

              jQuery("#classify_wrong").on("click", function() {
                jQuery("#classify_info").empty();
                jQuery("#classify_classify").remove();
                jQuery("#classify_button_div").empty();
                jQuery(".classify_option_div").show();
              });

              jQuery("#classify_correct").on("click", function() {
                jQuery("#classify_info").empty();
                jQuery("#classify_button_div").empty();
                _this.injectHTML('<b>PLEASE RUN THE '+classification.result[0][0].label.toUpperCase()+' DISPATCH SCENARIO </b>','classify_info');
                data_all.push(classification.result[0][0].label);
                output(data_all);
              });


              jQuery("#classify_correct_type").on("click",function() {
                data_all.push(jQuery("#classify_options").val());
                output(data_all);
                jQuery("#classify_info").empty();
                jQuery("#classify_button_div").empty();
                jQuery(".classify_option_div").hide();
                _this.injectHTML('<b>SAVE</b>','classify_info');
              });


              function output(data){
                var output_all = {
                  "subject":data[0],
                  "subject_classification":data[2].result[0][0].label,
                  "subject_confidence":data[2].result[0][0].probability,
                  "description":data[1],
                  "description_classification":data[2].result[1][0].label,
                  "description_confidence":data[2].result[1][0].probability,
                  "correct_classification":data[3]};

                  var zapUrl = 'https://hooks.zapier.com/hooks/catch/371578/ie3lqj/';
                  var jsonHeaders = { "Content-Type": "application/json" };
                  var jsonBody = { "text_list": output_all };
                  var options = {headers: jsonHeaders,body: JSON.stringify(jsonBody) };
                  _this.$request.post(zapUrl, options)
                  .done(function(){
                    console.log(JSON.stringify(jsonBody));
                  })
                  .fail(function(err){
                    console.log(err);
                  });
                }
              })
          .fail(function(err){ 

            console.log(err);
          }); 
        });
}
      } else {
        //if shouldn't display app, hide it
        jQuery(this.$container).find('#dispatch_app').hide();
      }  
    }
  };
})();

