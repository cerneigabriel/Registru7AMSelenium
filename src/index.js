"use strict"

// Core Dependencies
const { Builder, By, until } = require("selenium-webdriver");

// Drivers
const { setDefaultService, ServiceBuilder } = require("selenium-webdriver/chrome");
const { chromedriverPATH } = require("chromedriver");

// Cron
const schedule = require('node-schedule');

// Config
const { scheduleTime, user } = require('../config/config');
const {
    service_id,
    idnp,
    school_code,
    location_id,
    firstname,
    lastname,
    phone,
    email,
    repeat_email
} = user;


setDefaultService(new ServiceBuilder(chromedriverPATH).build());

const checkFreeDays = async (driver, fields) => await driver.wait(until.elementsLocated(fields.datepicker_free_days), 2 * 1000).then(item => {
    for (const key in item) {
        if (item.hasOwnProperty(key)) {
            item[key].click();
            break;
        }
    }
});

const checkFreeHours = async (driver, fields) => await driver.wait(until.elementsLocated(fields.datepicker_free_hours), 5 * 1000).then(item => {
    for (const key in item) {
        if (item.hasOwnProperty(key)) {
            item[key].click();
            break;
        }
    }
});

exports.registerUser = async () => {
    // Init browser and open web page
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.get("https://programari.registru.md/");
    
    const available = "Disponibil";

    // Get Fields
    const fields = {
        service_id: By.name("ServiceId"),
        service_id_option: By.css(`select[name="ServiceId"] option[value="${ service_id }"]`),
        conditions: By.css("input[name='_conditions']"),
        idnp: By.id("IDNP"),
        school_code: By.id("SchoolFisa"),
        location_id: By.name("LocationId"),
        location_id_option: By.css(`select[name="LocationId"] option[value="${ location_id }"]`),
        datepicker_free_days: By.css(`#CalendarBloc td[title="${ available }"]`),
        datepicker_free_hours: By.css("a.hour_option"),
        datepicker_next: By.css('a.ui-datepicker-next'),
        firstname: By.name("FirstName"),
        lastname: By.name("LastName"),
        phone: By.name("Phone"),
        email: By.name("Email"),
        repeat_email: By.name("RepeatEmail")
    };

    // Set Fields
    await driver.findElement(fields.firstname).sendKeys(firstname);
    await driver.findElement(fields.lastname).sendKeys(lastname);
    await driver.findElement(fields.phone).sendKeys(phone);
    await driver.findElement(fields.email).sendKeys(email);
    await driver.findElement(fields.repeat_email).sendKeys(repeat_email);

    await driver.wait(until.elementLocated(fields.service_id_option), 5 * 1000).then(item => ( item.click() ));

    // Accept policy terms
    await driver.wait(until.elementsLocated(fields.conditions), 5 * 1000).then(item => {
        for (const key in item) {
            if (item.hasOwnProperty(key)) {
                item[key].click();
            }
        }
    });

    await driver.wait(until.elementLocated(fields.idnp), 5 * 1000).then(item => ( item.sendKeys(idnp) ));
    await driver.wait(until.elementLocated(fields.school_code), 5 * 1000).then(item => ( item.sendKeys(school_code) ));

    const scheduleUserExam = schedule.scheduleJob(scheduleTime, async function(){
        console.log("Schedule");
        await driver.wait(until.elementLocated(fields.location_id), 5 * 1000).then(() => ( driver.findElement(fields.location_id_option).click() ));

        await driver.sleep(1000);

        checkFreeDays(driver, fields)
            .catch(() => {
                driver.findElement(fields.datepicker_next).click();
                return checkFreeDays(driver, fields);
            }).catch(() => {
                driver.findElement(fields.datepicker_next).click();
                return checkFreeDays(driver, fields);
            }).catch(() => (console.log("Something went wrong")));
            
    
        checkFreeHours(driver, fields);
    });
}