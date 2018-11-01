'use strict'

const util = require('util');
const awscred = require('awscred');

let initialized = false;

let init = () => {
    if(initialized) {
        return;
    }

    //let cred = awscred.loadAsyncAll().credentials;

    process.env.restaurant_api= `https://6ztidabh5f.execute-api.ap-south-1.amazonaws.com/dev/restaurants`;
    process.env.cognito_user_pool_id = 'ap-south-1_3TfgnKe0b';
    process.env.cognito_client_id = '76equ7esk97r6b7slo09oqs7v3';
    process.env.cognito_server_client_id = 'j82dg8cn416drrkndumkhscgd';
    process.env.restaurants_table = 'restaurants';
    process.env.AWS_REGION = 'ap-south-1';
}

module.exports = {init};