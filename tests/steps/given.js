'use strict';

const AWS     = require('aws-sdk');
AWS.config.region = 'us-east-1';
const cognito = new AWS.CognitoIdentityServiceProvider({region:'ap-south-1'});
const chance  = require('chance').Chance();

let random_password = () => {
  // needs number, special char, upper and lower case
  return `${chance.string({ length: 8})}B!gM0uth`;
}

let an_authenticated_user = async () => {
  let userpoolId = process.env.cognito_user_pool_id;
  let clientId = process.env.cognito_server_client_id;

  let firstName = chance.first();
  let lastName  = chance.last();
  let username  = `test-${firstName}-${lastName}-${chance.string({length: 8})}`;
  let password  = random_password();
  let email     = `${firstName}-${lastName}@big-mouth.com`;

  let createReq = {
    UserPoolId        : userpoolId,
    Username          : username,
    MessageAction     : 'SUPPRESS',
    TemporaryPassword : password,
    UserAttributes    : [
      { Name: "given_name",  Value: firstName },
      { Name: "family_name", Value: lastName },
      { Name: "email",       Value: email }
    ]
  };

  try{
        await cognito.adminCreateUser(createReq);
        console.log(`[${username}] - user is created`);
  
  } catch(e) {
        throw e;
  }
};

module.exports = {
  an_authenticated_user
};