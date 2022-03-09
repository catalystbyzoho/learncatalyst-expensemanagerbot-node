'use strict';

const cliq = require('zcatalyst-integ-cliq');
const command = cliq.command();

command.executionHandler(async (req, res) => {
    let text;
    const commandName = req.name;
    if (comp(commandName, 'catalystresource')) {
        const suggestions = req.selections;
        if(suggestions === undefined || suggestions.length === 0) {
            text = 'Please select a suggestion from the command';
        }
        else {
            const prefix = 'Take a look at our ';
            if(comp(suggestions[0].title, 'API doc')) {
                text = prefix + '[API Documentation](https://www.zoho.com/catalyst/help/api/introduction/overview.html)';
            }
            else if (comp(suggestions[0].title, 'CLI doc')) {
                text = prefix + '[CLI Documentation](https://www.zoho.com/catalyst/help/cli-command-reference.html)';
            }
            else {
                text = prefix + '[help documentation](https://www.zoho.com/catalyst/help/)';
            }
        }
    }
    else if(comp(commandName, 'getform')) {      
        return getForm();
    }
    else {
        text = 'Command executed successfully!';
    }
    res.text = text;
    return res;
});

command.suggestionHandler(async (req, res) => {
    if(comp(req.name,'catalystresource')) {
        const suggestion1 = command.newCommandSugestion();
        suggestion1.title = 'API doc';
        suggestion1.description = 'Catalyst API documentation';
        suggestion1.imageurl = 'https://www.zohowebstatic.com/sites/default/files/styles/product-home-page/public/catalyst-icon.png';

        const suggestion2 = command.newCommandSugestion();
        suggestion2.title = 'CLI doc';
        suggestion2.description = 'Catalyst CLI documentation';
        suggestion2.imageurl = 'https://www.zohowebstatic.com/sites/default/files/styles/product-home-page/public/catalyst-icon.png';

        const suggestion3 = command.newCommandSugestion();
        suggestion3.title = 'Help docs';
        suggestion3.description = 'Catalyst help documentation';
        suggestion3.imageurl = 'https://www.zohowebstatic.com/sites/default/files/styles/product-home-page/public/catalyst-icon.png';

        res.push(suggestion1,suggestion2,suggestion3);
        return res;
    }
});

function getForm() {
    const form = command.newHandlerResponse().newForm();
    form.title = 'Asset Request';
    form.hint = 'Raise your asset request';
    form.name = 'ID';
    form.button_label = 'Raise Request';
    form.version = 1;

    const actions = form.newFormActionsObject();
    actions.submit = actions.newFormAction('formFunctionLatest');// ** ENTER YOUR FORM FUNCTION NAME HERE **

    form.actions = actions;

    const userName = form.newFormInput();
    userName.type = 'text';
    userName.name = 'username';
    userName.label = 'Name';
    userName.hint = 'Please enter your name';
    userName.placeholder = 'John Reese';
    userName.mandatory = true;
    userName.value = 'Harold Finch';
    form.addInputs(userName);

    const email = form.newFormInput();
    email.type = 'text';
    email.format = 'email';
    email.name = 'email';
    email.label = 'Email';
    email.hint = 'Enter your email address';
    email.placeholder = "johnreese@poi.com";
    email.mandatory = true;
    email.value = "haroldfinch@samaritan.com";
    
    const assetType = form.newFormInput();
    assetType.type = 'select';
    assetType.trigger_on_change = true;
    assetType.name = 'asset-type';
    assetType.label = "Asset Type";
    assetType.hint = "Choose your request asset type";
    assetType.placeholder = "Mobile";
    assetType.mandatory = true;   
    assetType.addOption(assetType.newFormValue('Laptop', 'laptop'));
    assetType.addOption(assetType.newFormValue('Mobile', 'mobile'));
    
    form.addInputs(email, assetType);
    return form;
}

function comp(var1, var2) {
    return var1.toUpperCase() === var2.toUpperCase();
}
