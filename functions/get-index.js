'use strict';

const fs = require('fs');
const Mustache = require('mustache');
const axios = require('axios');
const aws4 = require('aws4');
const URL = require('url');

const awsRegion = process.env.AWS_REGION;
const cognitoUserPoolId = process.env.cognito_user_pool_id;
const cognitoClientId = process.env.cognito_client_id;

const getRestaurantsApiRoot = process.env.restaurant_api;

const days = ['Sunday','Monday','Tuesday','Wedesday','Thursday','Friday','Saturday'];
let dayOfWeek = days[new Date().getDay()];
let html;

async function loadHtml() {
  if(!html) {
    html = await fs.readFileSync('static/index.html','utf-8');
  }
  return html;
}

async function getRestaurants() {
  let url = URL.parse(getRestaurantsApiRoot);
  let opts = {
    host: url.hostname,
    path: url.pathname
  };
  
  aws4.sign(opts);
  
  let headers = {
    'Host': opts.headers['Host'],
    'X-Amz-Date': opts.headers['X-Amz-Date'],
    'Authorization': opts.headers['Authorization']
  }
  if (opts.headers['X-Amz-Security-Token']) {
    headers['X-Amz-Security-Token'] = opts.headers['X-Amz-Security-Token'];
  }

  return axios.get(getRestaurantsApiRoot,{
    headers
  })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {

    });
}

module.exports.handler = async (event, context) => {
  let template = await loadHtml();
  let restaurants = await getRestaurants();
  
  let view = {
    restaurants,
    dayOfWeek,
    awsRegion,
    cognitoUserPoolId,
    cognitoClientId,
    searchUrl: `${getRestaurantsApiRoot}/search`
  }
  let html = Mustache.render(template, view);

  return  {
    statusCode: 200,
    body: html,
    headers: {
      'content-type': 'text/html; charset=UTF-8'
    }
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
