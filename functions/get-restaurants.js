'use strict'

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const defaultResults = process.env.defaultResults || 8;
const tableName = process.env.restaurants_table;

async function getRestaurants(count) {

    let req = {
        TableName: tableName,
        Limit: count
    }
    console.log('req' + '-----' + req);
    let resp = await dynamodb.scan(req).promise();
    console.log('resp' + '-----' + resp);
    return resp.Items;
}

module.exports.handler = async (events,context) => {
    let restaurants =  await getRestaurants(defaultResults);
    return {
        statusCode: 200,
        body: JSON.stringify(restaurants)
    };
}