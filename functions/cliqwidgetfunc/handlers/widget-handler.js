'use strict';

const Cliq = require('zcatalyst-integ-cliq');
const widget = Cliq.widget();

widget.viewHandler(async (req, res, catalystApp) => {

    let id = "recentTab";
    if (typeof req.target.id !== "undefined") {
        id = req.target.id;
    }
    let widgetResponse = { "type": "applet", "tabs": [{ "label": "Recent Expense", "id": "recentTab" }, { "label": "All Expenses", "id": "allTab" }, { "label": "Widget Setup", "id": "settingsTab" }], "active_tab": id };
    if (id === "recentTab") {
        widgetResponse.data_type = "info"; //You are setting up a button in the Widget. So you need to follow this up in the function-handler widgetButtonHandler. Register this in cliq.zoho.com/developer
        widgetResponse.info = { "title": "Add what you spent on", "description": "Hope you spent on something interesting", "image_url": "https://cdn-icons-png.flaticon.com/128/4222/4222016.png", "button": { "label": "Add Your Expense", "type": "invoke.function", "name": "addThisExpense", "id": "addexpense" } };
    } else if (id === "settingsTab") {
        widgetResponse.data_type = "info"; //You are setting up a button in the Widget. SettingsConfig will be matched in the function-handler widgetButtonHandler.Register this in cliq.zoho.com/developer
        widgetResponse.info = { "title": "Expense Manager Widget Setup", "description": "Setup your Expense Manager Widget", "image_url": "https://cdn-icons-png.flaticon.com/128/4222/4222016.png", "button": { "label": "Configure Widget", "type": "invoke.function", "name": "settingsConfig", "id": "settingsConfig" } };
    } else if (id === "allTab") {
        const expensesData = await getExpenseDetailsTable(catalystApp);;
        let sections = [];
        let sectionId = 0;
        expensesData.forEach(expense => {
            let elements = [];
            elements.push({ "type": "text", "text": "Amount: " + expense.amount + " INR\nSpentOn: " + expense.name + " Date of Purchase: " + expense.date + " Notes: " + expense.notes });
            elements.push({ "type": "divider" });
            sections.push({ "id": sectionId, "elements": elements });
            sectionId = sectionId + 1;
        });
        widgetResponse.sections = sections;
    }
    res = widgetResponse;
    return res;
});



async function getExpenseDetailsTable(catalystApp) {

    let rowsJSON = [];
    let queryResult = await catalystApp.zcql().executeZCQLQuery(`select * from ExpenseDetails`);
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
}

function comp(var1, var2) {
    return var1.toUpperCase() === var2.toUpperCase();
}