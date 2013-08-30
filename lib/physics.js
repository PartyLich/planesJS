define(function (require) {
  var $ = require('jquery'),
      Coord = require('coord');


  /** Physics Engine
   */
  function Physics(mediator) {
    var sub = mediator.subscribe;

//    sub('g:drawObject', this.drawObj);
//    sub('g:clearObject', this.clearObj);
  }

  var p = Physics.prototype;

  /**
   */
//  g.drawObj = function drawObj(obj, ctx) {
//    console.log('Graphic engine drawObj');
//  };


  /**
   */
//  g.clearObj = function clearObj(obj, ctx) {
//    console.log('Graphic engine drawObj');
//  };


  return Physics;
});