require.config({
  paths: {  //Configure library/module paths.
//    'jquery' : 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min',
    'jquery' : '../lib/jquery-1.8.2.min',
    'mocha': 'mocha',
    'chai': 'chai'
  },
});


//require(['require', 'chai'],
//function(require, chai) {
define(function(require) {
  window.assert = require('chai').assert,
  window.expect = require('chai').expect;
//  window.expect = chai.expect;

  //
//  mocha.setup('bdd');
  mocha.setup('tdd');



  //include tests
//  require('test/Array');
  require(['test/ArrayTDD'], function(){
//  require(['test/ArrayBDD'], function(){
    mocha.run();
  });

  //
//  mocha.checkLeaks();
//  mocha.globals(['jQuery']);

//  mocha.run();
});