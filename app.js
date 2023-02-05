const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); //adds static files to be returned

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/signup.html");
});

app.post("/", function (req, res) {
    const firstName = req.body.FirstName;
    const lastName = req.body.LastName;
    const email = req.body.Email;

    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);
    const listKey = process.env.listKey;
    const apiKey = process.env.apiKey;
    const url = `https://us21.api.mailchimp.com/3.0/lists/${listKey}`;
    const options = {
        method: "POST",
        auth: `erioll:${apiKey}`
    };

    const request = https.request(url, options, function (response) {
        if (response.statusCode === 200) {
            response.on("data", function (data) {
                const objData = JSON.parse(data);
                if (objData.error_count === 0) {
                    res.sendFile(__dirname + "/success.html");
                }
                else {
                    res.sendFile(__dirname + "/failure.html");
                }
            });
        }
        else {
            res.sendFile(__dirname + "/failure.html");
        }
    });

    request.write(jsonData);
    request.end();
});

app.post("/failure", function (req, res) {
    res.redirect("/");
});


// app.listen(3000, function () {
app.listen(process.env.PORT || 3000, function () { //port defined by heroku

    console.log(`Server started on port ${process.env.PORT || 3000}`);
});
