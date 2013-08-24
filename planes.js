/**
 *
 */

require.config({
  paths: {  //Configure library/module paths.
    /*'jquery' : 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min',*/
    'jquery' : 'lib/jquery-1.8.2.min',
    'action': 'models/action',
    'animation': 'models/animation',
    'ball': 'models/ball',
    'coord': 'models/coord',
    'hue': 'models/hue',
    'path': 'models/path',
    'plane': 'models/plane',
    'StopWatch': 'models/StopWatch',
    'mathLib': 'lib/mathLib'
//    'underscore' : 'lib/underscore-min',
  }
});

require(['jquery', 'engine'], function($, Engine) {
  $(function() {
    //RequestAnimationFrame shim
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
        //
        engine = new Engine();

    window.requestAnimationFrame = requestAnimationFrame;

    engine.home();
  });
});