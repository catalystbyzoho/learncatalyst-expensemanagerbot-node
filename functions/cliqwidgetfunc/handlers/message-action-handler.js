'use strict';
const Cliq = require('zcatalyst-integ-cliq');
const messageActionHandler = Cliq.messageAction();

messageActionHandler.executionHandler(async (req, res) => {
    let text = '';

    const msgType = req.message.type;
    text = `Hey ${req.user ? req.user.first_name : 'user'}, You have performed an action on a *${msgType}*. `
            + 'Manipulate the message variable and perform your own action.';
    
    res.setText(text);
    return res;
});
