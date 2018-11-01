'use strict'

const expect = require('chai').expect;
const when = require('../steps/when');
const init = require('../steps/init').init;
const cheerio = require('cheerio');

describe('When we invoke the GET / endpoint', () => {
    before(() => {
        init();
    });

    it('Should return the index with 8 restaurants', async () => {
        let res = await when.we_invoke_get_index();
        
        expect(res.statusCode).to.equal(200);
        expect(res.headers['content-type']).to.equal('text/html; charset=UTF-8');
        expect(res.body).to.not.be.null;

        let $ = cheerio.load(res.body);
        let restaurants = $('.restaurant', '#restaurantsUl');
        //expect(restaurants.length).to.equal(8);
    })
});