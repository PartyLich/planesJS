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
  
  /** Reposition an object according to its current velocity.
   * @param {Object} obj An object with a position and velocity
   */
  p.reposition = function reposition(obj) {
    //New position.
    var x = obj.pos.x + Math.round(obj.vx),
        y = obj.pos.y + Math.round(obj.vy);

    //boundary looping
    if(x < -obj.pos.r) {
      x = cX + obj.pos.r;
    } else if(x > cX + obj.pos.r) {
      x = -obj.pos.r;
    }
    if(y > cY + obj.pos.r) {
      y = -obj.pos.r;
    } else if(y < -obj.pos.r) {
      y = cY + obj.pos.r;
    }

    obj.move(new Coord({
        x: Math.round(x), 
        y: Math.round(y)
      })
    );

    return obj;
  }


  return Physics;
});