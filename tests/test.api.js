var assert = require('assert');
var express = require('express');
var status = require('http-status');
var superagent = require('superagent');
var wagner = require('wagner-core');
var app = require('./../app');

var URL_ROOT = 'http://localhost:7001/api/v1';
 
describe('Should be able to test api', () => {

  var server;

  before(function() {
      server = app().listen(7001);
  });

  after(( done ) =>  {
    // Shutdown the server down when done
    server.close();
    done()
  });

  describe('Testting Product Api ', () => {

    it('Get Product Durand', ( done ) =>  {
      
      superagent.get(URL_ROOT + "/product/product-durand", (error, res) => {
        assert.equal(res.status, 200);
        var response;
        assert.doesNotThrow(() => {
          response = res.body
        });
        assert.equal(response.status, 'SUCCESS');
        assert.equal(response.data[0].product.slug, 'product-durand');
        assert.equal(response.data[0].product.title, 'Product Durand');
        done()
      })  

    }); 

    it('Get Product Not Found', ( done ) =>  {
      
      superagent.get(URL_ROOT + "/product/test", (error, res) => {
        assert.equal(res.status, 200);
        var result;
        assert.doesNotThrow(() => {
          result = res.body
        });
        assert.equal(result.status, 'SUCCESS');
        assert.equal(result.data.length, 0);
        done()
      })

    }); 

    it('Get images from Product Durand', ( done ) =>  {
      
      superagent.get(URL_ROOT + "/product/product-durand/images", (error, res) => {
        assert.equal(res.status, 200);
        var response;
        assert.doesNotThrow(() => {
          response = res.body
        });
        assert.equal(response.status, 'SUCCESS');
        assert.equal(response.data.product.slug, 'product-durand');
        assert.equal(response.data.product.title, 'Product Durand');
        assert.equal(response.data.images.length, 2);
        done()
      })  

    }); 

    it('Upload image to Produtct Durand ', function (done) {
      superagent.post(URL_ROOT + "/product/product-durand/images/add")
        .set('Authorization', 'Token eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.IjkxMTg3NTk1ODg2MCI.gq32xfcOhv5AiZXJup5al1DGG0piyGWnrjZ5NouauCU')
        .field('Content-Type', 'multipart/form-data')
        .attach('image', 'assets/test.png')
        .end(function (err, res) {
          if (err) {
              console.log(err);
          } else assert.equal(res.status,200);
          done();
        });
    });

    it('Remove first image from Product Durand', ( done ) =>  {
      
      superagent.get(URL_ROOT + "/product/product-durand/images", (error, res) => {
        assert.equal(res.status, 200);
        var response;
        assert.doesNotThrow(() => {
          response = res.body
        });
        assert.equal(response.status, 'SUCCESS');
        assert.equal(response.data.product.slug, 'product-durand');
        assert.equal(response.data.product.title, 'Product Durand');
        
        superagent.del(URL_ROOT + "/product/product-durand/images/remove/" + response.data.images[0].id, (error, res) => {
          assert.equal(res.status, 200);
          var response;
          assert.doesNotThrow(() => {
            response = res.body
          });
          assert.equal(response.status, 'SUCCESS');
          done()
        })  
      })  

    }); 

    it('Get product detail without images', ( done ) =>  {
      
      superagent.get(URL_ROOT + "/product/product-durand/?images=no", (error, res) => {
        assert.equal(res.status, 200);
        var response;
        assert.doesNotThrow(() => {
          response = res.body
        });
        assert.equal(response.status, 'SUCCESS');
        assert.equal(response.data[0].product.slug, 'product-durand');
        assert.equal(response.data[0].product.title, 'Product Durand');
        assert.equal(response.data[0].product.images,undefined);
        done()
         
      })  

    }); 

    it('Get product detail with images', ( done ) =>  {
      
      superagent.get(URL_ROOT + "/product/product-durand/?images=yes", (error, res) => {
        assert.equal(res.status, 200);
        var response;
        assert.doesNotThrow(() => {
          response = res.body
        });
        assert.equal(response.status, 'SUCCESS');
        assert.equal(response.data[0].product.slug, 'product-durand');
        assert.equal(response.data[0].product.title, 'Product Durand');
        assert.notDeepEqual(response.data[0].product.images,undefined);
        done()
         
      })  

    }); 

  }); 

  describe('Testting User Api ', () => {

    it('Get User Durand', ( done ) =>  {
      
      superagent.get(URL_ROOT + "/user/durand.neto@gmail.com", (error, res) => {
        assert.equal(res.status, 200);
        var response;
        assert.doesNotThrow(() => {
          response = res.body
        });
        assert.equal(response.status, 'SUCCESS');
        assert.equal(response.data.email, 'durand.neto@gmail.com');
        done()
      })  

    }); 

    it('Get User Not Found', ( done ) =>  {
      
      superagent.get(URL_ROOT + "/user/durand.test@gmail.com", (error, res) => {
        assert.equal(res.status, 200);
        var result;
        assert.doesNotThrow(() => {
          result = res.body
        });
        assert.equal(result.status, 'SUCCESS');
        assert.ifError(result.data);
        done()
      })

    }); 
  }); 

});