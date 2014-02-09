define(function (require) {
  var /*$ = require('jquery'),*/
      Coord = require('coord');


  /** Physics Engine
   */
  function Physics(mediator) {
    var sub = mediator.subscribe;

    sub('p:reposition', this.reposition);
  }

  var p = Physics.prototype;


  /** Reposition an object according to its current velocity.
   * @param {Object} obj An object with a position and velocity
   */
  Physics.prototype.reposition = function reposition(/*obj*/ args) {
//  p.reposition = function reposition(obj) {
    console.log('Physics module reposition');
    var obj = args[0],
        cX = args[1],
        cY = args[2],
    //New position.
        x = obj.pos.x + Math.round(obj.vx),
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
  };


  return Physics;
});