/**
 * Plane class
 */
//class Plane {
function Plane(pos, img, alpha, opt) {
//  ImageElement img;
//  int  width, height, frame, waypoint;
  this.frame = this.waypoint = 0;
//  num vx, vy, ax, ay;
  this.vx = this.vy = 0;
  var ax, ay;
  this.path = null;
//  num _scale, minScale;  //Drawing scale on interval [0,1]
  this.scale = 1;
  this.minScale = .125;

//  //landing stuff
//  bool landing;
//  num a, shrinkRate;

//  /**** Constructors ****/
  this.init(opt);
//  Plane(Coord pos, ImageElement img, ImageElement alpha) : ax = 0, ay = 0, vx = 0, vy = 0,
//      frame = 0, _scale = 1, path = null, minScale = .125 {

  this.pos = new Ball(pos.x, pos.y, Math.round(Math.max(img.width, img.height) / 2));
  this.width = img.width;
  this.height = img.height;
  this.landing = this.selected = false;

//    this.img = new ImageElement();
  this.img = new Image();

  //Init the masked composite image.
  this.initMask(alpha, img);
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
//  num get heading {
Plane.prototype.getHeading = function () {
//    //print('Heading atan2(${vy}/${vx}): ${Math.atan2(vy, vx)}');
//    return Math.atan2(vy, vx);
  return Math.atan2(this.vy, this.vx);
//  }
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
  console.log('Set heading v:'+ v +' angle:'+ angle +' vx:'+ this.vx +' vy:'+ this.vy);
};

//  num get scale => _scale;
/** Set the drawing scale of this plane on interval [0,1].
 * @param {Number} factor
 */
Plane.prototype.setScale = function (factor) {
  this.scale = (factor <= this.minScale) ? this.minScale : factor;
  this.pos.r = Math.round(Math.max(this.width, this.height) / 2 * this.scale);
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
  //Save context state.
  ctx.save();
  //Rotate context to draw with proper heading.
//  console.log('Translating ' + this.pos.x + ', ' + this.pos.y);
  ctx.translate(this.pos.x, this.pos.y);
//  console.log('Rotating canvas to heading ' + (this.getHeading() * 180 / Math.PI) + 'deg');
  ctx.rotate(this.getHeading() + Math.PI/2);

  //Draw final image to the supplied context.
//  console.log('draw(' + -this.width * this.scale/2+', '+-this.height * this.scale/2+', '+
//      this.width * this.scale+', '+this.height * this.scale);
  ctx.drawImage(this.img, -this.width * this.scale/2, -this.height * this.scale/2,
      this.width * this.scale, this.height * this.scale);

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
//    ctx.clearRect(-(pos.r+1), -(pos.r+1), (pos.r+1)*2, (pos.r+1)*2);
  ctx.clearRect(-(this.pos.r+1), -(this.pos.r+1), (this.pos.r+1)*2, (this.pos.r+1)*2);

  //Restore context state.
  ctx.restore();
};

/** Applies the (inverse) alpha mask and saves the composite [ImageElement] to img.
 * @param {Image} alpha
 * @param {Image} img
 */
Plane.prototype.initMask = function (alpha, img) {
  //Create a buffer for off screen drawing.
  var buffer = document.createElement('canvas');
  buffer.width = this.width;
  buffer.height = this.height;

  var ctxBuf = buffer.getContext('2d');

  //Draw alpha mask image to buffer.
  ctxBuf.drawImage(alpha, 0, 0);

  //Get imagedata
  var imgData = ctxBuf.getImageData(0, 0, this.width, this.height);
  var data = imgData.data;

    //Set alpha channel values for inverse alpha mask.
  for(var i = data.length - 1; i > 0; i -= 4) {
    data[i] = 255 - data[i - 3];
  }

  ctxBuf.clearRect(0, 0, this.width, this.height);
  ctxBuf.putImageData(imgData, 0, 0);

  //Combine image + mask on buffer.
  ctxBuf.globalCompositeOperation = 'xor';
  ctxBuf.drawImage(img, 0, 0);
////    print('198: buffer filled.');

  //Save final image.
  this.img.src = buffer.toDataURL('image/png');
};

/** Move this plane to the specified [Coord]
 * @param {Coord} dest
 */
Plane.prototype.move = function (dest) {
//    pos.x = dest.x;
//    pos.y = dest.y;
  this.pos.move(dest.x, dest.y);
};

/** Land this plane on the specified runway.
 * @param {Path} runway
 */
Plane.prototype.land = function (runway) {
//    path = new Path.from(runway);
//  this.path = new Path(runway);
  this.path = runway;

  this.move(this.path[0]);
  this.waypoint = 0;
  this.heading = Math.atan2(runway[1].y - this.pos.y, runway[1].x - this.pos.x);
//    print('Set heading  vx:${vx} vy:${vy}. Dist(path0):${dist(path[0])}');
  console.log('Set heading  vx:' + this.vx + ' vy:' + this.vy + ' Dist(path0):' + this.dist(this.path[0]));

  this.landing = true;

  var v =  this.velocity();

  this.a = -v * v / this.dist(runway[1]) * .5;
  console.log('Lib 249: Set acceleration to ' + this.a + '. v: ' + v + ' dist:' + this.dist(runway[1]));
};