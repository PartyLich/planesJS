define(function (require) {
  var $ = require('jquery'),
      Ball = require('ball');


  /** Initialize plane sprites
   */
  function loadPlanes() {
    var index, plane;

    //Open synchronous GET request.
    $.ajax('json/planes.json', {
      async : false,
      dataType : 'json',
      success : function(result) {
        //Initialize plane list.
//        $.each(result.planes, function(index, plane) {
        for(index = 0, plane = null; plane = result.planes[index++]; ) {
          console.log('Adding plane', plane);

          imgPlanes.push({
            img : loadImage(plane.img),
            alpha : loadImage(plane.alpha),
            frameWidth : plane.frameWidth,
            frameHeight : plane.frameHeight
          });
//        });
        }
      }
    });
  }


  /** Loads the level specified by the [String] uri
   * @param {String} url
   * @param {Function} callback  The function to call once the image is loaded.
   */
    function loadLevel(url, callback) {
      var i, tmp = null,
          width, height,
          x, y,
          runway;

      //Open synchronous GET request.
      $.ajax(url, {
        async : false,
        dataType : 'json',
        success : function(result) {
          //Initialize runway(s) with start and end points
          runways.length = 0;

          for(i = 0; i < result.runways.length; i += 2) {
            tmp = new Path();

            tmp.add(new Coord({x: result.runways[i].x, y: result.runways[i].y}));
            tmp.add(new Coord({x: result.runways[i+1]['x'], y: result.runways[i+1]['y']}));

            runways.push(tmp);
          }

          //Initialize event list.
          for(i = 0, tmp = null; tmp = result.events[i++]; ) {
            console.log('Adding event', tmp);
            eventList.push(new Action(tmp));
          }

          //Initialize background image.
          bg.src = '';
          bg.src = result.bg;

          $(bg).one('load', drawBg);
        }
      });
    }


    /** Callback function to draw an image to the background canvas on image
     *  load.
     */
    function drawBg() {
      var bg = this,
          width, height,
          x, y,
          runway;

      console.log('this:', this);
      console.log('BG loaded2');
      ctxBg.fillStyle = '#0000EE';
      ctxBg.fillRect(0, 0, cX, cY);

      //Draw background image on the background canvas.
      ctxBg.save();

      width = bg.width/2;
      height = bg.height/2;
      x = (cX - width) / 2;
      y = (cY - height) / 2;

      ctxBg.drawImage(bg, x, y, Math.round(width), Math.round(height));
      ctxBg.restore();
      ctxBg.font = 'normal 9px sans-serif';

      //Draw runway markers.
      for(i = 0, runway = null; runway = runways[i++]; ) {
        ctxBg.fillStyle = '#00FF00';
        new Ball(runway[0].x, runway[0].y, 3).draw(ctxBg);
        ctxBg.fillStyle = '#FF0000';
        new Ball(runway[1].x, runway[1].y, 3).draw(ctxBg);
      }
    }


    return {
      loadLevel: loadlevel
    };
});