const assert = require('assert');
const expect = require('chai').expect
const request = require('supertest');


const userFile = require('../models/user.js')
//var storage = JSON.parse(fs.readFileSync('../myapp/storage/config.json', 'utf8'));

var firstLoginStorage = JSON.parse(JSON.stringify(fs.readFileSync('../myapp/storage/config.test.1.json', 'utf8')));

describe('firstLoginStorage login test', function () {
    it('should update correct values in storage', function () {

        user.authenticate('monoid', 'monoid',function(){})


        // 3. ASSERT
        expect(sum2).to.be.equal(sum1);
  
    });
  });