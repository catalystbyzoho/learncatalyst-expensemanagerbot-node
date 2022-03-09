'use strict';
const Cliq = require('zcatalyst-integ-cliq');
const functionHandler = Cliq.CliqFunction();

functionHandler.buttonFunctionHandler(async (req, res, catalystApp) => {

    let zapikey = req.arguments.input.token;
    let queryResult = await catalystApp.zcql().executeZCQLQuery(`select zuid, ROWID from Settings where zuid=${req.access.user_id}`);
    if (queryResult.length > 0) {
        await catalystApp.datastore().table.updateRow({
            zapikey: zapikey,
            ROWID: queryResult[0].Settings.ROWID
        });
    } else {
        await catalystApp.datastore().table.insertRow({
            zapikey: zapikey,
            zuid: req.access.user_id
        });
    }
    res.setText('Stored zuid and zapikey');
    return res;
});

functionHandler.formSubmitHandler(async (req, res, catalystApp) => {

    const values = req.form.values;
    if (req.form.name == 'expenseEntry') {
        let dateString = req.form.values.Date;
        let d = dateString.split("/");
        let modified_date = new Date(d[2] + '/' + d[1] + '/' + d[0]);
        await catalystApp.datastore().table('ExpenseDetails').insertRow({
            name: req.form.values.Name,
            amount: req.form.values.Amount,
            DateOfPurchase: modified_date,
            Notes: req.form.values.Notes,
            zuid: req.access.user_id
        });
        let banner = { "type": "banner", "status": "success", "text": "Expense Added" };
        res = banner;
        return res;
    }
    //Because you chose to address it as a Form Submit, you need to handle it here in formSubmitHandler
    //Had you made it into a WidgetButton Submit, then you would need to handle it in widgetButtonHandler
    if (req.form.name == 'Settings') {
        let queryResult = await catalystApp.zcql().executeZCQLQuery(`select zuid, ROWID from Settings where zuid= ${req.access.user_id}`);
        if (queryResult.length > 0) {
            await catalystApp.datastore().table('Settings').updateRow({
                currency: req.form.values.currency.value,
                schedule: req.form.values.schedule.label,
                ROWID: queryResult[0].Settings.ROWID
            });
        } else {
            await catalystApp.datastore().table('Settings').insertRow({
                currency: req.form.values.currency.value,
                schedule: req.form.values.schedule.label,
                zuid: req.access.user_id
            });
        }
        let banner = { "type": "banner", "status": "success", "text": "Settings changed" };
        res = banner;
        return res;
    }

    const type = values.type;
    if (type !== undefined) {
        if (comp(type, 'formtab')) {
            const widgetResponse = functionHandler.newWidgetResponse();
            widgetResponse.type = 'applet';

            const titleSection = widgetResponse.newWidgetSection();
            titleSection.id = '100';

            const editedBy = titleSection.newWidgetElement();
            editedBy.type = 'title';
            editedBy.text = 'Edited by ' + values.text + ' :wink:';

            const time = titleSection.newWidgetElement();
            time.type = 'subtext';
            time.text = 'Target:buttons\nTime : ' + new Date().toISOString().replace('T', ' ').replace('Z', '');

            titleSection.addElement(editedBy, time);
            widgetResponse.addSection(titleSection, getButtonSection());
            return widgetResponse;
        } else if (comp(type, 'formsection')) {
            const section = functionHandler.newWidgetResponse().newWidgetSection();
            section.id = '102';
            section.type = 'section';

            const editedBy = section.newWidgetElement();
            editedBy.type = 'title';
            editedBy.text = 'Edited by ' + values.text + ' :wink:';

            section.addElement(editedBy);

            return section;
        } else {
            const msg = functionHandler.newHandlerResponse().newMessage();
            msg.text = 'Applet Button executed successfully';
            msg.type = 'banner';
            msg.status = 'success';
            return msg;
        }
    }

    const text = `Hi ${values.username}, thanks for raising your request. Your request will be processed based on the device availability.`;
    res.setText(text);
    const card = res.newCard();
    card.title = 'Asset Request';
    res.card = card;

    const slide = res.newSlide();
    slide.type = 'label';
    slide.title = '';

    const dataArr = [];
    const obj1 = {
        'Asset type': values['asset-type'].label
    };
    dataArr.push(obj1);
    if (comp(values['asset-type'].value, 'mobile')) {
        const obj2 = {
            'Preferred OS': values['mobile-os'].label
        }
        dataArr.push(obj2);
        const obj3 = {
            'Preferred Devices': values['mobile-list'].label
        }
        dataArr.push(obj3);
    } else {
        const obj2 = {
            'Device Preferred': values['os-type'].label
        }
        dataArr.push(obj2);
    }
    slide.data = dataArr;
    res.addSlide(slide);
    return res;
});

functionHandler.formChangeHandler(async (req, res) => {
    const target = req.target.name;
    const values = req.form.values;
    const fieldValue = values['asset-type'].value;

    if (comp(target, 'asset-type')) {

        if (fieldValue !== undefined && comp(fieldValue, 'laptop')) {
            const selectBoxAction = res.newFormModificationAction();
            selectBoxAction.type = 'add_after';
            selectBoxAction.name = 'asset-type';

            const os = selectBoxAction.newFormInput();
            os.trigger_on_change = true;
            os.type = 'select';
            os.name = 'os-type';
            os.label = 'Laptop Type';
            os.hint = 'Choose your preferred OS type';
            os.placeholder = 'Ubuntu';
            os.mandatory = true;

            const mac = os.newFormValue();
            mac.label = 'Mac OS X';
            mac.value = 'mac';

            const windows = os.newFormValue();
            windows.label = 'Windows';
            windows.value = 'windows';

            const ubuntu = os.newFormValue();
            ubuntu.label = 'Ubuntu';
            ubuntu.value = 'ubuntu';

            os.addOption(mac, windows, ubuntu);
            selectBoxAction.input = os;

            const removeMobileOSAction = res.newFormModificationAction();
            removeMobileOSAction.type = 'remove';
            removeMobileOSAction.name = 'mobile-os';

            const removeMobileListAction = res.newFormModificationAction();
            removeMobileListAction.type = 'remove';
            removeMobileListAction.name = 'mobile-list';

            res.addAction(selectBoxAction, removeMobileOSAction, removeMobileListAction);

        } else if (fieldValue !== undefined && comp(fieldValue, 'mobile')) {
            const selectBoxAction = res.newFormModificationAction();
            selectBoxAction.type = 'add_after';
            selectBoxAction.name = 'asset-type';

            const os = selectBoxAction.newFormInput();
            os.trigger_on_change = true;
            os.type = 'select';
            os.name = 'mobile-os';
            os.label = 'Mobile OS';
            os.hint = 'Choose your preferred mobile OS';
            os.placeholder = 'Android';
            os.mandatory = true;

            const android = os.newFormValue();
            android.label = 'Android';
            android.value = 'android';

            const ios = os.newFormValue();
            ios.label = 'iOS';
            ios.value = 'ios';

            os.addOption(android, ios);
            selectBoxAction.input = os;

            const removeOSTypeAction = res.newFormModificationAction();
            removeOSTypeAction.type = 'remove';
            removeOSTypeAction.name = 'os-type';

            res.addAction(selectBoxAction, removeOSTypeAction);
        }
    } else if (comp(target, 'mobile-os')) {
        if (fieldValue !== undefined) {
            const mobileListAction = res.newFormModificationAction();
            mobileListAction.type = 'add_after';
            mobileListAction.name = 'mobile-os';

            const listInput = mobileListAction.newFormInput();
            listInput.type = 'dynamic_select';
            listInput.name = 'mobile-list';
            listInput.label = 'Mobile Device';
            listInput.placeholder = 'Choose your preferred mobile device';
            listInput.mandatory = true;
            mobileListAction.input = listInput;

            res.addAction(mobileListAction);
        } else {
            const removeMobileListAction = res.newFormModificationAction();
            removeMobileListAction.type = 'remove';
            removeMobileListAction.name = 'mobile-list';

            res.addAction(removeMobileListAction);
        }
    }

    return res;
});

functionHandler.formDynamicFieldHandler(async (req, res) => {
    const target = req.target;
    let query = target.query;
    const values = req.form.values;

    if (comp(target.name, 'mobile-list') && values['mobile-os'] !== undefined) {
        const device = values['mobile-os'].value;
        if (comp(device, 'android')) {
            const arr = ['One Plus 6T', 'One Plus 6', 'Google Pixel 3', 'Google Pixel 2XL'];
            arr.filter((phone) => phone.match(new RegExp(query, 'i'))).
                forEach((phone) => res.addOption(res.newFormValue(phone, phone.toLowerCase().replace(new RegExp(' ', 'g'), '_'))));
        } else if (comp(device, 'ios')) {
            const arr = ['IPhone XR', 'IPhone XS', 'IPhone X', 'IPhone 8 Plus'];
            arr.filter((phone) => phone.match(new RegExp(query, 'i')))
                .forEach((phone) => res.addOption(res.newFormValue(phone, phone.toLowerCase().replace(new RegExp(' ', 'g'), '_'))));
        }
    }
    return res;
});

functionHandler.widgetButtonHandler(async (req, res) => {
    //check for the name of the form/function and then launch the form
    if (req.name == 'settingsConfig') {
        var form = getConfigsForm();
    } else if (req.name == 'addThisExpense') {
        var form = getAddExpenseForm();
    }
    return form;
});



function getAddExpenseForm() {

    return form = {
        "name": "expenseEntry", //whatever name you give here, this will be used in the formSubmitHandler as we are about to submit a form
        "type": "form",
        "title": "Expense Details",
        "hint": "Provide details of what you spent on",
        "button_label": "Add Expense",
        "inputs": [{
            "name": "Name",
            "label": "Name",
            "placeholder": "Chicken",
            "min_length": "0",
            "max_length": "25",
            "mandatory": false,
            "type": "text"
        },
        {
            "name": "Amount",
            "label": "Amount",
            "placeholder": "12",
            "min": "0",
            "max": "10000",
            "mandatory": false,
            "type": "number"
        },
        {
            "name": "Date",
            "label": "Date",
            "placeholder": "2022-02-12",
            "mandatory": false,
            "type": "date"
        },
        {
            "name": "Notes",
            "label": "Notes",
            "placeholder": "Spent because friends forced me to ;-)",
            "mandatory": false,
            "type": "text"
        }
        ],
        "action": {
            "type": "invoke.function",
            "name": "addExpense" //register this in cliq.zoho.com/developer
        }
    };
}


function getConfigsForm() {
    return {
        "name": "Settings",
        "type": "form",
        "title": "Expense Mgr Settings",
        "hint": "Setup your Expense Manager Widget",
        "button_label": "Submit Config",
        "inputs": [

            { "type": "select", "name": "currency", "label": "currency", "hint": "Currency", "placeholder": "Choose currency", "mandatory": true, "value": "INR", "options": [{ "label": "INR", "value": "INR" }, { "label": "USD", "value": "USD" }, { "label": "GBP", "value": "GBP" }] },

            {
                "name": "schedule",
                "label": "schedule ",
                "mandatory": false,
                "type": "radio",
                "options": [{
                    "value": "Weekly",
                    "label": "Weekly"
                },
                {
                    "value": "Monthly",
                    "label": "Monthly"
                }
                ]
            }
        ],
        "action": {
            "type": "invoke.function",
            "name": "storeConfigDetails" // register this in cliq.zoho.com/developer
        }
    };
}

function getButtonSection() {
    const widgetResponse = functionHandler.newWidgetResponse();

    const buttonSection = widgetResponse.newWidgetSection();

    const title = buttonSection.newWidgetElement();
    title.type = 'title';
    title.text = 'Buttons';

    const buttonElement1 = buttonSection.newWidgetElement();
    buttonElement1.type = 'buttons';
    const buttonsList1 = [];

    const button1 = buttonElement1.newWidgetButton();
    button1.label = 'link';
    button1.type = 'open.url';
    button1.url = 'https://www.zoho.com';

    const button2 = buttonElement1.newWidgetButton();
    button2.label = 'Banner';
    button2.type = 'invoke.function';
    button2.name = 'appletFunction';
    button2.id = 'banner';

    const button3 = buttonElement1.newWidgetButton();
    button3.label = 'Open Channel';
    button3.type = 'system.api';
    button3.setApi('joinchannel/{{id}}', 'CD_1283959962893705602_14598233'); // ** ENTER YOUR CHANNEL ID HERE **

    const button4 = buttonElement1.newWidgetButton();
    button4.label = 'Preview';
    button4.type = 'preview.url';
    button4.url = 'https://www.zoho.com/catalyst/features.html';

    buttonsList1.push(button1, button2, button3, button4);

    buttonElement1.addWidgetButton(...buttonsList1);

    //Buttons - Row2

    const buttonElement2 = buttonSection.newWidgetElement();
    buttonElement2.type = 'buttons';

    const button5 = buttonElement2.newWidgetButton();
    button5.label = 'Edit Section';
    button5.type = 'invoke.function';
    button5.name = 'appletFunction';
    button5.id = 'section';

    const button6 = buttonElement2.newWidgetButton();
    button6.label = 'Form Edit Section';
    button6.type = 'invoke.function';
    button6.name = 'appletFunction';
    button6.id = 'formsection';

    const button7 = buttonElement2.newWidgetButton();
    button7.label = 'Banner';
    button7.type = 'invoke.function';
    button7.name = 'appletFunction';
    button7.id = 'banner';

    const button8 = buttonElement2.newWidgetButton();
    button8.label = 'Edit Whole Tab';
    button8.type = 'invoke.function';
    button8.name = 'appletFunction';
    button8.id = 'tab';

    const button9 = buttonElement2.newWidgetButton();
    button9.label = 'Form Edit Tab';
    button9.type = 'invoke.function';
    button9.name = 'appletFunction';
    button9.id = 'formTab';

    buttonElement2.addWidgetButton(button5, button6, button7, button8, button9);

    buttonSection.addElement(title, buttonElement1, buttonElement2);
    buttonSection.id = '101';

    return buttonSection;
}

function comp(var1, var2) {
    return var1.toUpperCase() === var2.toUpperCase();
}