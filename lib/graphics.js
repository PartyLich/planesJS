define(function (require) {
  var $ = require('jquery'),
      Ball = require('ball');


  /** Graphics Engine
   */
  function Graphics(mediator) {
    var sub = mediator.subscribe;

    sub('g:drawObject', this.drawObj);
    sub('g:clearObject', this.clearObj);
    sub('g:drawBg', this.drawBg);
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
    console.log('Graphic engine clearObj');
  };
  
  
  //Responds to $(bg).one('load', mediator.publish('g:drawBg', this, ctxBg);
  g.drawBg = function drawBg(/*bg, ctx, cX, cY*/args) {
    console.log('Graphic engine drawBg');
    var width, height,
        x, y,
        runway,
        bg = args[0], 
        ctx = args[1], 
        cX = args[2], 
        cY = args[3];

    console.log('this:', this);
    console.log('BG loaded2');
    ctx.fillStyle = '#0000EE';
    ctx.fillRect(0, 0, cX, cY);
    
    //Draw background image on the background canvas.
    ctx.save();
    
    width = bg.width/2;
    height = bg.height/2;
    x = (cX - width) / 2;
    y = (cY - height) / 2;
    
    console.log(bg, x, y, Math.round(width), Math.round(height));
    ctx.drawImage(bg, x, y, Math.round(width), Math.round(height));
    ctx.restore();
    ctx.font = 'normal 9px sans-serif';
    
//    //
//    for(i = 0, runway = null; runway = runways[i++]; ) {
//      ctx.fillStyle = '#00FF00';
//      new Ball(runway[0].x, runway[0].y, 3).draw(ctx);
//      ctx.fillStyle = '#FF0000';
//      new Ball(runway[1].x, runway[1].y, 3).draw(ctx);
//    }
  }


  return Graphics;
});
