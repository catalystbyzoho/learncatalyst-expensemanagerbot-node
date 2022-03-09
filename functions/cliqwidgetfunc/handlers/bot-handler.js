'use strict';
const Cliq = require('zcatalyst-integ-cliq');
const botHandler = Cliq.bot();

botHandler.welcomeHandler(async (req, res, catalystApp) => {

    if (req.newuser) {
        await catalystApp.datastore().table('Settings').insertRow({
            zuid: req.access.user_id
        });
        let response = {
            "text": "Click on the token generation button below!",
            "buttons": [{
                "label": "Create Webhook",
                "type": "+",
                "action": {
                    "type": "invoke.function",
                    "data": {
                        "name": "authentication"
                    },
                    "confirm": {
                        "title": "Generate Webhook to update the Expense Mgr Bot",
                        "description": "Generate Webhook to update the Expense Mgr Bot",
                        "input": {
                            "type": "user_webhook_token"
                        }
                    }
                }
            }]
        };
        res = response;
    } else {
        await catalystApp.datastore().table('Settings').insertRow({
            zuid: req.access.user_id
        });
        res.text = "Add your expenses ";
    };
})

botHandler.messageHandler(async (req, res) => {
    try {
        const msg = req.message;
        let text = '';
        if (msg === undefined) {
            text = 'Please enable \'Message\' in bot settings';
        } else if (comp(msg, 'hi') || comp(msg, 'hey')) {
            text = `Hi ${req.user.first_name} :smile: . How are you doing ??`;
            const suggestion = res.newSuggestionList();
            const suggestionArray = [suggestion.newSuggestionObject('Good')];
            suggestionArray.push(suggestion.newSuggestionObject('Not Bad'));
            suggestionArray.push(suggestion.newSuggestionObject('meh'));
            suggestionArray.push(suggestion.newSuggestionObject('worst'));
            suggestion.addSuggestion(...suggestionArray);
            res.suggestions = suggestion;
        } else if (comp(msg, 'good') || comp(msg, 'not bad')) {
            text = 'That\'s glad to hear :smile:'
        } else if (comp(msg, 'meh') || comp(msg, 'worst')) {
            text = `Oops! Don't you worry. Your day is definitely going to get better. :grinning:`;
        } else if (comp(msg, 'details')) {
            text = 'welcome to details collection center :wink:';
            const context = res.newContext();
            context.id = 'personal_details';
            context.timeout = 300;

            const param1 = context.newParam();
            param1.name = 'name';
            param1.question = 'Please enter your name: ';

            const param2 = context.newParam();
            param2.name = 'dept';
            param2.question = 'Please enter your department: ';
            param2.addSuggestion('CSE');
            param2.addSuggestion('IT');
            param2.addSuggestion('MECH');

            context.addParams(param1, param2);
            res.context = context;
        } else if (comp(msg, 'button')) {
            const response = botHandler.newHandlerResponse(); // You can construct a new response object instead of using the default one(res).
            response.text = 'Here\'s your button';
            const button = response.newButton();
            button.type = '-';
            button.label = 'Button1';
            const action = button.newActionObject();
            action.type = 'invoke.function';
            const actionData = action.newActionDataObject();
            actionData.name = 'btnFunction'; // ** ENTER YOUR BUTTON FUNCTION NAME HERE **
            action.data = actionData;
            button.action = action;
            response.addButton(button);
            return response;
        } else {
            text = `Oops! Sorry, I'm not programmed yet to do this :sad:`;
        }

        res.setText(text);
        return res;
    } catch (error) {
        console.error('Error in message handler. ', error);
        return;
    }
});

botHandler.contextHandler(async (req, res) => {
    if (req.context_id === 'personal_details') {
        const answer = req.answers;
        const department = answer.dept.text;
        const str = `Name: ${answer.name.text}\nDepartment: ${department}\n`;

        res.setText('Nice ! I have collected your info: \n' + str);
    }
    return res;
});

botHandler.mentionHandler(async (req, res) => {
    const text = `Hey *${req.user.first_name}*, thanks for mentioning me here. I'm from Catalyst city `;
    res.setText(text);
    return res;
});

botHandler.menuActionHandler(async (req, res) => {
    let text = '';
    if (req.action_name === 'Say Hi') {
        text = 'Hi';
    } else if (req.action_name === 'Look Angry') {
        text = ':angry:';
    } else {
        text = 'Menu action triggered :fist:'
    }

    res.setText(text);
    return res;
});

botHandler.webHookHandler(async (req, res) => {
    // Sample handler for incoming mails in ZohoMail
    // Please configure the bot in ZohoMail's outgoing webhooks
    const reqBody = JSON.parse(req.body);
    const summary = reqBody.summary || '';
    const bodyStr = `*From*: ${reqBody.fromAddress} \n *Subject*: ${reqBody.subject} \n *Content*: ${summary.length > 100 ? summary.substring(0, 100) : summary}`;

    res.bot = res.newBotDetails('PostPerson', 'https://www.zoho.com/sites/default/files/catalyst/functions-images/icon-robot.jpg');

    const card = res.newCard();
    card.title = 'New Mail';
    card.thumbnail = 'https://www.zoho.com/sites/default/files/catalyst/functions-images/mail.svg';
    res.card = card;

    const button = res.newButton();
    button.label = 'open mail';
    button.type = '+';
    button.hint = 'Click to open the mail in a new tab';

    const action = button.newActionObject();
    action.type = 'open.url';

    const actionData = action.newActionDataObject();
    actionData.web = `https://mail.zoho.com/zm/#mail/folder/inbox/p/${reqBody.messageId}`;

    action.data = actionData;
    button.action = action;

    res.addButton(button);

    const gifSlide = res.newSlide();
    gifSlide.type = 'images';
    gifSlide.title = '';
    gifSlide.data = ['https://media.giphy.com/media/efyEShk2FJ9X2Kpd7V/giphy.gif'];
    res.addSlide(gifSlide);

    return res;
});

botHandler.participationHandler(async (req, res) => {
    let text = '';
    if (comp(req.operation, 'added')) {
        text = 'Hi. Thanks for adding me to the channel :smile:';
    } else if (comp(req.operation, 'removed')) {
        text = 'Bye-Bye :bye-bye:';
    } else {
        text = 'I\'m too a participant of this chat :wink:'
    }
    res.setText(text);
    return res;
});

function comp(var1, var2) {
    return var1.toUpperCase() === var2.toUpperCase();
}