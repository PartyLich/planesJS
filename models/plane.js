define(['coord','ball', 'path', 'animation'], function(Coord, Ball, Path, Animation){

  /** Plane object.
   * @param {Coord} pos    Starting location
   * @param {Image} img    Sprite
   * @param {Image} alpha  Mask
   * @param frameWidth     width of each animation frame
   * @param frameHeight    height of each animation frame
   */
  function Plane(pos, img, alpha, frameWidth, frameHeight, opt) {
    this.frame = 0;
    this.waypoint = 0;
    this.vx = this.vy = 0;
    var ax, ay;
    this.path = null;
    //Drawing scale on interval [0,1]
    this.scale = 1;
    this.minScale = .125;

    //landing stuff
  //  bool landing;
  //  num a, shrinkRate;

    this.init(opt);


//    this.pos = new Ball(pos.x, pos.y, Math.round(Math.max(img.width, img.height) / 2));
    this.pos = new Ball(pos.x, pos.y, Math.round(Math.max(frameWidth, frameHeight) / 2));
    this.width = frameWidth;
    this.height = frameHeight;
    this.landing = this.selected = false;


    this.img = new Image();

    //Init the masked composite image.
//    this.initMask(alpha, img);
    console.log('opt',opt);
//    opt.mediator.publish('g:maskImg', {obj: this, alpha: alpha, img: img});
    opt.mediator.installTo(this);
    this.publish('g:maskImg', this, alpha, img);

    //Animation list
    this.animations = {};
    this.animations.crash = new Animation({
      firstFrame : 1,
      length : 1,
      repeat : 6
    });
    this.animations.flight = new Animation({
      firstFrame : 1,
      length : 1,
      repeat : -1
//      fps : 60
    });
/*    this.animations.flight = new Animation({
      firstFrame : 1,
      length : 8,
      repeat : -1
    });*/

//    this.curAnimation = this.animations.flight;
    this.setAnim(this.animations.flight);

    this.frameX = 0;    //x location of current frame.
    this.frameY = 0;    //y location of current frame.
    this.cols = Math.floor(img.width / frameWidth);
    this.rows = Math.floor(img.height / frameHeight);

    this.fCount = 0;    //number of times the current frame has been displayed.
//    this.loop = 0;

    this.crashing = false;
    this.dead = false;
  }

  Plane.prototype.init = function (opt) {

  };

  //  /**** Get/Set ****/
  //  int get x => pos.x;
  //  int get y => pos.y;
  //  int get r => pos.r;

  /** Check if this plane currently has a path assigned.
   * @returns {Boolean}
   */
  Plane.prototype.hasPath = function () {
    return this.path != null;
  };


  /** Get this plane's current heading.
   *  @returns {Number} Heading in radians.
   */
  Plane.prototype.getHeading = function () {
  //    //print('Heading atan2(${vy}/${vx}): ${Math.atan2(vy, vx)}');
    return Math.atan2(this.vy, this.vx);
  };

  /** Set this plane's current animation.
   * @param {Animation} animation The animation to use
   */
  Plane.prototype.setAnim = function (animation) {
    this.curAnimation = animation;
    this.frame = this.curAnimation.firstFrame;
    this.loop = animation.repeat;
  };

  /** Set this plane's heading.
   * @param {Number} angle Heading in radians.
   */
  Plane.prototype.setHeading = function (angle) {
    //Find size of velocity vector
    var v = this.velocity();

    //Find new x and y velocity components
    this.vx = v * Math.cos(angle);
    this.vy = v * Math.sin(angle);
//    console.log('Set heading v:'+ v +' angle:'+ angle +' vx:'+ this.vx +' vy:'+ this.vy);
  };


  /** Set the drawing scale of this plane on interval [0,1].
   * @param {Number} factor
   */
  Plane.prototype.setScale = function (factor) {
    this.scale = (factor <= this.minScale) ? this.minScale : factor;
    this.pos.r = Math.round(Math.max(this.width, this.height) / 2 * this.scale);
  };

  /**
   * @param {Path} path
   */
  Plane.prototype.setPath = function (path) {
    this.path = new Path().fromOther(path);
    this.waypoint = 1;
  };


  /**
   *
   */
  Plane.prototype.nextWaypoint = function () {
    if(this.hasPath())
      this.path.shift();
  };

  /** Get the plane's scalar velocity
   * @returns {Number}
   */
  //  num get velocity => Math.sqrt(vx * vx + vy * vy);
  Plane.prototype.velocity = function () {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  };


  /** Set the plane's scalar velocity
   * @param {Number} v  The new velocity.
   */
  Plane.prototype.setVelocity = function (v) {
    var angle = this.getHeading();

    //Find new x and y velocity components
    this.vx = v * Math.cos(angle);
    this.vy = v * Math.sin(angle);

    //console.log('Set velocity v:'+v+' angle:'+angle+' vx:'+vx+' vy:'+vy);
  };

  /** Calculate the top left corner of the current frame.
   *
   */
  Plane.prototype.updateFrame = function () {
    this.frameX = (this.frame - 1) * this.width - (Math.floor((this.frame - 1) / this.cols) * this.cols * this.width);
//    console.log('right', (this.frame / this.cols * this.cols * this.width));
//    console.log('this.frame / this.cols', (this.frame / this.cols));
//    console.log('this.cols', this.cols, 'this.height', this.height);
    this.frameY = Math.floor((this.frame - 1) / this.cols) * this.height;
  };


  /** Returns this plane's distance from coordinate b.
   * @param {Coord} b
   * @returns {Number}
   */
  Plane.prototype.dist = function (b) {
    return this.pos.dist(b);
  };


  /** Renders this object on the supplied 2d canvas rendering context
   *  @param {CanvasRenderingContext2D} ctx
   */
  Plane.prototype.draw = function (ctx) {
    //Update frame location
    this.updateFrame();
    //increment current frame draw counter
    this.fCount++;
//    console.log('fCount', this.fCount);

    //Save context state.
    ctx.save();
    //Rotate context to draw with proper heading.
  //  console.log('Translating ' + this.pos.x + ', ' + this.pos.y);
    ctx.translate(this.pos.x, this.pos.y);
  //  console.log('Rotating canvas to heading ' + (this.getHeading() * 180 / Math.PI) + 'deg');
    ctx.rotate(this.getHeading() + Math.PI/2);

    //Draw final image to the supplied context.
//    ctx.drawImage(this.img, -this.width * this.scale/2, -this.height * this.scale/2,
//        this.width * this.scale, this.height * this.scale);
    ctx.drawImage(this.img, this.frameX, this.frameY, this.width, this.height, -this.width * this.scale/2, -this.height * this.scale/2,
        this.width * this.scale, this.height * this.scale);
    console.log('frame', this.frame, 'frameX', this.frameX, 'frameY', this.frameY);

    //Draw circle around plane if selected.
    if(this.selected) {
      ctx.strokeStyle = 'yellow';
      ctx.beginPath();
      ctx.arc(0, 0, this.pos.r, 0, 2*Math.PI, false);
      ctx.stroke();
    }

    //Restore context state.
    ctx.restore();

  ////    print("filling text");
  //    //ctx.fillText("(${pos.x.round()}, ${pos.y.round()})", pos.x - (pos.r/2).round(), pos.y);
    //ctx.fillText("(${pos.x.round()}, ${pos.y.round()})", pos.x - (pos.r/2).round(), pos.y);

    //Advance animation frame.
    if(this.frame + 1 > this.curAnimation.firstFrame + this.curAnimation.length - 1) {
      //We've already hit the last frame in the animation. Check repeat
console.log('End of current animation loop');
      this.frame = this.curAnimation.firstFrame;

      if(this.curAnimation.repeat === -1) {
        this.frame = this.curAnimation.firstFrame;
      } else if(this.loop > 0) {
        this.loop--;
      }

      //Crash sequence complete?
      if(this.crashing) {
        console.log('Setting plane to DEAD');
        this.dead = true;
        return;
      }

      //reset current frame draw counter
      this.fCount = 0;
    } else {
//      console.log('this.curAnimation.fps', this.curAnimation.fps);
      if(this.fCount >= (60 / this.curAnimation.fps)) {  //check if we've repeated the current frame enough times
        this.frame++;

        //reset current frame draw counter
        this.fCount = 0;
      }
    }
  };

  /** Clears the rect currently occupied on the supplied context.
   * @param {CanvasRenderingContext2D} ctx
   */
  Plane.prototype.clear = function (ctx) {
    //Save context state.
    ctx.save();
    //Rotate context to draw with proper heading.
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.heading + Math.PI/2);

    //Clear the rect currently occupied.
    ctx.clearRect(-(this.pos.r+3), -(this.pos.r+3), (this.pos.r+3)*2, (this.pos.r+3)*2);

    //Restore context state.
    ctx.restore();
  };

  /** Crashes this plane.
   *
   */
  Plane.prototype.crash = function () {
    console.log('Beginning crash sequence');
    //Uh, crash image/animation
    this.crashing = true;
    this.setAnim(this.animations.crash);
    console.log('Animation set to', this.curAnimation);
    this.fCount = 0;
    this.updateFrame();
  };


  /** Move this plane to the specified [Coord]
   * @param {Coord} dest
   */
  Plane.prototype.move = function (dest) {
    this.pos.move(dest.x, dest.y);
  };


  /** Land this plane on the specified runway.
   * @param {Path} runway
   */
  Plane.prototype.land = function (runway) {
    this.setPath(runway);

    this.move(this.path[0]);

    this.heading = Math.atan2(runway[1].y - this.pos.y, runway[1].x - this.pos.x);
    console.log('Set heading  vx:' + this.vx + ' vy:' + this.vy + ' Dist(path0):' + this.dist(this.path[0]));

    this.landing = true;

    var v =  this.velocity();

    this.a = -v * v / this.dist(runway[1]) * .5;
    console.log('Lib 249: Set acceleration to ' + this.a + '. v: ' + v + ' dist:' + this.dist(runway[1]));
  };

  return Plane;
});