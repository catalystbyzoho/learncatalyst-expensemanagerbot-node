const catalyst = require("zcatalyst-sdk-node");
const axios = require('axios');
const fs = require('fs');

module.exports = async (cronDetails, context) => {
    const catalystApp = catalyst.initialize(context);
    let days = 0;
    let queryResult = await catalystApp.zcql().executeZCQLQuery(`select zuid,zapikey,schedule from Settings`);

    for (var i = 0; i < queryResult.length; i++) {
        if (queryResult[i].Settings.schedule == 'Weekly') {
            days = 6;
        } else {
            days = 30;
        }
        let expenseDNameDetails = await getExpenseDetailsTable(catalystApp, days, queryResult[i].Settings.zuid);
        const result = postMessageToBot({
            "text": "Expense Details are as follows :-",
            "slides": [{
                "type": "table",
                "title": "Expense Details",
                "data": {
                    "headers": [
                        "name",
                        "amount",
                        "date",
                        "notes"
                    ],
                    "rows": expenseDNameDetails
                }
            }]
        }, queryResult[i].Settings.zapikey);
        if (result == 'error') {
            context.closeWithFailure();
        }
    }
    context.closeWithSuccess();
}

async function postMessageToBot(sendResponse, zapikey) {

    try {
        //You can get the appkey from https://cliq.zoho.com/integrations/ . click on the bot and toward the right you will have the details.
        var appkey = YOUR_APP_KEY;
        await axios.post(`https://cliq.zoho.com/api/v2/bots/cliqwidgetbotf/message?appkey=${appkey}&zapikey=${zapikey}`, sendResponse);
    } catch (error) {
        console.log(error);
    }
}

async function getExpenseDetailsTable(catalystApp, recurring_days, zuid) {
    try {
        let rowsJSON = [];
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        today = yyyy + '-' + mm + '-' + dd;
        var days = recurring_days;
        var date = new Date();
        var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
        var day = last.getDate();
        var month = last.getMonth() + 1;
        var year = last.getFullYear();
        var from_date = year + "-" + month + "-" + day;

        let queryResult = await catalystApp.zcql().executeZCQLQuery("select * from ExpenseDetails where zuid = " + zuid + " and DateOfPurchase > '" + from_date + "' and DateOfPurchase < '" + today + "'");
        const length = queryResult.length;
        for (let i = 0; i < length; i++) {
            var data = {
                'name': queryResult[i].ExpenseDetails.name,
                'amount': queryResult[i].ExpenseDetails.amount,
                'date': queryResult[i].ExpenseDetails.DateOfPurchase,
                'notes': queryResult[i].ExpenseDetails.Notes
            }
            rowsJSON.push(data);
        }
        return rowsJSON;
    } catch (e) {
        console.log('error', e);
    }
}