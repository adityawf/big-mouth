'use strict'

const APP_ROOT = '../../';
const _ = require('lodash');
const http    = require('superagent-promise')(require('superagent'), Promise);
const aws4 = require('aws4');
const URL = require('url');
const mode = process.env.TEST_MODE;

let respondFrom = function (httpRes) {
    let contentType = _.get(httpRes, 'headers.content-type', 'application/json');
    let body = 
      contentType === 'application/json'
        ? httpRes.body
        : httpRes.text;
  
    return { 
      statusCode: httpRes.status,
      body: body,
      headers: httpRes.headers
    };
  }
  
  let signHttpRequest = (url, httpReq) => {
    let urlData = URL.parse(url);
    let opts = {
      host: urlData.hostname, 
      path: urlData.pathname
    };
    aws4.sign(opts);
    httpReq
      .set('Host', opts.headers['Host'])
      .set('X-Amz-Date', opts.headers['X-Amz-Date'])
      .set('Authorization', opts.headers['Authorization']);
  
    if (opts.headers['X-Amz-Security-Token']) {
      httpReq.set('X-Amz-Security-Token', opts.headers['X-Amz-Security-Token']);
    }
  }
  
  let viaHttp = async (relPath, method, opts) => {
    let root = process.env.TEST_ROOT;
    let url = `${root}/${relPath}`;
    console.log(`invoking via HTTP ${method} ${url}`);
  
    try {
      let httpReq = http(method, url);
        
      let body = _.get(opts, "body");
      
      if (body) {      
        httpReq.send(body);
      }
        
      if (_.get(opts, "iam_auth", false) === true) {
        signHttpRequest(url, httpReq);
      }

      let authHeader = _.get(opts,"auth");
      if(authHeader) {
        httpReq.set('Authorization',authHeader);
      }

      let res = await httpReq;
      return respondFrom(res);
    } catch (err) {
      if (err.status) {
        return {
          statusCode: err.status,
          headers: err.response.headers
        };
      } else {
        throw err;
      }
    }
  };

async function viaHandler(event, functionName) {console.log('handler' + '-----' + 'started');
    let handler = require(`${APP_ROOT}/functions/${functionName}`).handler;
    let context = {};
    try {
        let response = await handler(event,context);console.log('response' + '-----' + response);
        let contentType = _.get(response, 'headers.content-type', 'application/json');
        if (response.body && contentType === 'application/json') {
            response.body = JSON.parse(response.body);
            console.log('finish' + '-----' + response.body);
        }
        return response;
    } catch(err) {
      console.log('error' + '-----' + JSON.stringify(err));
        return err;
    }
}

let we_invoke_get_index = async () => {
    let res =
        mode === 'handler' 
        ? viaHandler({},'get-index')
        : viaHttp('', 'GET');
    return res;    
}; 

let we_invoke_get_restaurants = async () => {
    let res =
        mode == 'handler'
        ? viaHandler({},'get-restaurants')
        : viaHttp('restaurants', 'GET', { iam_auth: true });
    return res;    
};

let we_invoke_search_restaurants = (user,theme) => {
    let body = JSON.stringify({ theme });
    let auth = user.idToken;
    
    let res = 
        mode === 'handler'
        ? viaHandler({ body }, 'search-restaurants')
        : viaHttp('restaurants/search', 'POST', { body , auth})

    return res;
  }

module.exports = {
    we_invoke_get_index,
    we_invoke_get_restaurants,
    we_invoke_search_restaurants
}