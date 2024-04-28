const express = require("express");
const app = express(); //start express.js
const path = require("path");
const hbs = require("hbs");
const collection = require("./mongodb");
const fs = require('fs');
const bodyParser = require('body-parser');
const axios = require('axios');


const async = require("hbs/lib/async");
const tempelatePath = path.join(__dirname, '../tempelates')
app.use(express.json())
app.set("view engine", "hbs")
app.set("views", tempelatePath)
app.use(express.urlencoded({ extended: false }))


app.get("/", (req, res) => {
    res.render("login")
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.name,
        password: req.body.password
    }
    let jsonData = [];
    try {
        const existingData = fs.readFileSync('auth.json');
        jsonData = JSON.parse(existingData);
    } catch (error) {
        console.log(error)
    }

    jsonData.push(data);
    fs.writeFileSync('auth.json', JSON.stringify(jsonData, null, 2));
    res.render("login")

})

app.post("/login", (req, res) => {
    const username = req.body.name;
    const password = req.body.password;
    console.log(username + ": "+ password)
    let jsonData = [];
    try {
        const existingData = fs.readFileSync('auth.json');
        jsonData = JSON.parse(existingData);
    } catch (error) {
        res.status(500).send('Internal Server Error');
        return;
    }

    const user = jsonData.find(entry => entry.name === username && entry.password === password);
    if (user) {
        res.render("home");
    } else {
        res.render("login", { error: "Invalid username or password" });
    }
});

app.post("/loginReCaptcha", async (req, res) => {
    const { name, password, gRecaptchaResponse } = req.body;

    try {
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: '6Lf8G8opAAAAAOZvODJFyWHKLV3a7kd1_PiVcGtC',
                response: gRecaptchaResponse
            }
        });
        
        if (response.data.success) {
            let jsonData = [];
            try {
                const existingData = fs.readFileSync('auth.json');
                jsonData = JSON.parse(existingData);
            } catch (error) {
                res.status(500).send('Internal Server Error');
                return;
            }
        
            const user = jsonData.find(entry => entry.name === name && entry.password === password);
            if (user) {
                res.render("home");
            } else {
                res.render("login", { error: "Invalid username or password" });
            }
        } else {
            res.send("reCAPTCHA verification failed");
        }
    } catch (error) {
        console.error("Error verifying reCAPTCHA token:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(3000, () => {
    console.log("port connected");
})