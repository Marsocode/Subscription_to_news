//jshint esversion:6

const express = require("express");
const body_parser = require("body-parser");
const https = require('https');
const app = express();
app.use(express.static("public")); 

app.use(body_parser.urlencoded({
  extended: true
}));


app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res) {
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var email = req.body.email;

  var data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: first_name,
          LNAME: last_name
        }
      }
    ]
  };
  var json_data = JSON.stringify(data);

  const listid = 'xxxxxxxxxx';
  const url = 'https://usX.api.mailchimp.com/3.0/lists/'+ listid;
  const options = {
    method: "POST",
    auth: "lika:apikey"
  };

  const request = https.request(url, options, function(response) {

    response.on("data", function(data) {
      console.log(JSON.parse(data));

      if (JSON.parse(data).error_count === 0) {
        res.sendFile(__dirname + '/success.html');
      } else if (JSON.parse(data).errors[0].error_code === "ERROR_CONTACT_EXISTS") {
        res.sendFile(__dirname + "/already_sub.html");
      } else {
        res.sendFile(__dirname + '/failure.html');
      }

    });
  });

  request.write(json_data); // make request to mailchimp server
  request.end();
});

app.post("/failure", function(req, res) {
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running");
});
