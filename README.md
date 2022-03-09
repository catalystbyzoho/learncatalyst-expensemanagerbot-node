A code sample for connection between Cliq and Catalyst and vice versa using Integration functions.

Catalyst Requirements :

Kindly create the following tables in the Catalyst Console.

Table Name : "ExpenseDetails" 

Columns :

name - text

amount - text

DateOfPurchase - date

Notes - text

zuid - text


Table Name : "Settings" 

Columns :

currency - text

schedule - text

zuid - text

zapikey - text


Cliq Requirements :

Visit cliq.zoho.com/developer create a extension named "ExpenseManagerExtension" and enter the following details :

Name : ExpenseManagerExtension

Description : Description of your Extension

Execution Type : Catalyst Function 

Select your project and the integration function you had created.


Add the components as follows :

1. Component Type - Function 
Name - settingsConfig
Description - settingsConfig
Function Type - Widget Button
Widget Button Handler - Select User alone

2. Component Type - Function 
Name - addThisExpense
Description - addThisExpense
Function Type - Form
Form Handler - Select None

3. Component Type - Function 
Name - addExpense
Description - addExpense
Function Type - Form
Form Handler - Select None

4. Component Type - Function 
Name - storeConfigDetails
Description - storeConfigDetails
Function Type - Button
Form Handler - Select None

5. Component Type - Function 
Name - authentication
Description - authentication
Function Type - Button
Form Handler - Select None

6. Component Type - Bot 
Name - cliqwidget-postvac
Description - cliqwidget-postvac
Enable Welcome Handler alone

7. Component Type - Widget 
Name - ExpenseMgrWidget
Description - ExpenseMgrWidget
View Handler - Select chat alone

Generating App Key - You can get the appkey from https://cliq.zoho.com/integrations/ . Click on the bot and toward the right you will have the details. Replace the same in expenseMgrWeeklyCronFunc index.js file line 44.

Once the above process is complete, clone the code and deploy the code using the command "catalyst deploy" to the Catalyst Console.




















