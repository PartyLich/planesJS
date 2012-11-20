/**
 *
 */

require.config({
  paths: {  //Configure library/module paths.
    /*'jquery' : 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min',*/
    'jquery' : 'lib/jquery-1.8.2.min'
//    'underscore' : 'lib/underscore-min',
  }
});

require(['jquery', 'engine'], function($, Engine) {
$(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  window.requestAnimationFrame = requestAnimationFrame;

  var engine = new Engine();
      engine.home();

  });
});