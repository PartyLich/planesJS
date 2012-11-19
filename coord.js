/*
 * Coordinate object. Represents a point in 2-space.
 */
function Coord(opt) {
//function Coord(x, y) {
  this.x = 0;
  this.y = 0;
  this.initialize(opt);
//  this.x = (x || 0);
//  this.y = (y || 0);
}

//  /**** Constructors ****/
Coord.prototype.initialize = function (opt) {
//  Coord() : _x = 0, _y = 0 {}
//  Coord.init(int this._x, int this._y) {}
  var key = null,
      default_args = {
        x : 0,
        y : 0
      };

  opt = (opt || default_args);

  for(key in default_args) {
    if(typeof opt[key] == "undefined") opt[key] = default_args[key];
  }

  // opt[] has all the data - user provided and optional.
  for(key in opt) {
    //console.log(key + " = " + opt[key]);
    this[key] = opt[key];
  }
};


/** Move this Coord to a new (x, y) location. */
//  void move(int x, int y) {
Coord.prototype.move = function (x, y) {
  this.x = x;
  this.y = y;

  return this;
};

/** Add [Coord] other to this and return the result. */
//  Coord operator +(Coord other) {
Coord.prototype.plus = function (other) {
//    return new Coord.init(this.x + other.x, this.y + other.y);
  return new Coord({x : this.x + other.x, y : this.y + other.y});
};

/** Subtracts [Coord] other from this and return the result. */
//  Coord operator -(Coord other) {
Coord.prototype.minus = function (other) {
//    return new Coord.init(this.x - other.x, this.y - other.y);
  return new Coord({x : this.x - other.x, y : this.y - other.y});
};

/** Scales this [Coord] by the factor specified. */
//  Coord operator *(num scale) {
Coord.prototype.scale = function (scale) {
//    return new Coord.init((this.x * scale).round().toInt(), (this.y * scale).round().toInt());
  return new Coord({x : this.x * scale, y : this.y * scale});
};

/** Returns distance from this [Coord] to [Coord] b. */
//  /*static*/ int dist(Coord b)
Coord.prototype.dist = function (b) {
//      => (Math.sqrt((this.x - b.x)*(this.x - b.x) + (this.y - b.y)*(this.y - b.y))).round().toInt();
  return Math.sqrt((this.x - b.x)*(this.x - b.x) + (this.y - b.y)*(this.y - b.y));
};

/** Returns the midpoint of this [Coord] and [Coord] b. */
Coord.prototype.midpoint = function (b) {
//Coord midpoint(Coord b) => new Coord.init((x + b.x) ~/ 2, ((y + b.y) / 2).round().toInt());
  return new Coord({x : (this.x + b.x) / 2, y : (this.y + b.y) / 2});
//  return new Coord((this.x + b.x) / 2, (this.y + b.y) / 2);
};