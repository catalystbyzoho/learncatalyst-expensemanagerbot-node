'use strict'
const Cliq = require('zcatalyst-integ-cliq');
const installationValidator = Cliq.installationValidator();

installationValidator.validateInstallation(async (req, res) => {
    if(comp(req.user.first_name, '**INVALID_USER**') && comp(req.app_info.type, 'upgrade')) {
        res.status = 400;
        res.title = 'Update not allowed !';
        res.message = 'Sorry. Update not allowed for the current app. Please contact admin.';
    } else {
        res.status = 200;
    }
    return res;
});

function comp(var1, var2) {
    return var1.toUpperCase() === var2.toUpperCase();
}
