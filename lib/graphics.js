define(function (require) {
  var $ = require('jquery'),
      Ball = require('ball');


  /** Graphics Engine
   */
  function Graphics(mediator) {
    var sub = mediator.subscribe;

    sub('g:drawObject', this.drawObj);
    sub('g:clearObject', this.clearObj);
  }

  var g = Graphics.prototype;

  /**
   */
  g.drawObj = function drawObj(obj, ctx) {
    console.log('Graphic engine drawObj');
  };


  /**
   */
  g.clearObj = function clearObj(obj, ctx) {
    console.log('Graphic engine drawObj');
  };


  return Graphics;
});