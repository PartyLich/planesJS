/**
 * Hue object constructor.
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @returns {Hue}
 */
//class Hue {
function Hue(r, g, b, a) {
//int r, g, b, a;
  //
//    Hue([this.r = 0, this.g = 0, this.b = 0, this.a = 1]);
  //}
  this.r = (r || 0);
  this.g = (g || 0);
  this.b = (b || 0);
  this.a = (a || 1);
}

/** Returns string representation of this Hue.
 * @returns {String}
 */
Hue.prototype.toString = function () {
  return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a + ')';
};

/**
 * Path class. A spiffy [Coord] list with drawing functions and such.
 * @param {Number} length
 * @returns {Path}
 */
//class Path implements List<Coord> {
function Path(length) {
//  List _list;
//  Hue hue;
//  Coord topLeft, bottomRight;
  //Super
  Array.call(this);

//  /** Creates a list of the given length. */
//  Path([int length]) {
//    _list = new List<Coord>(length);

//    topLeft = new Coord.init(9000, 9000);
  this.topLeft = new Coord(9000, 9000);
//    bottomRight = new Coord.init(0, 0);
  this.bottomRight = new Coord(0, 0);
//    hue = new Hue(0, 0, 0);
  this.hue = new Hue();
//  }
}

//Inherit Array
Path.prototype = new Array();
//Correct the constructor pointer.
Path.prototype.constructor = Path;

//  /** Creates a list with the elements of other. The order in the list will be the order provided by the iterator of other. */
//  Path.from(Path other) {
//    _list = new List.from(other);
//    /*topLeft = new Coord.init(9000, 9000);
//    bottomRight = new Coord.init(0, 0);
//    hue = '#000000';
//    */
//    topLeft = other.topLeft;
//    bottomRight = other.bottomRight;
//    hue = other.hue;
//  }
//
/** Adds value at the end of the list, extending the length by one.
 * @param {Coord} element
 */
Path.prototype.add = function (element) {
  //Type checking. I don't really care if it's a Coord, as long as it has x and y.
//  if(element instanceof Coord) {
  if(element.hasOwnProperty('x') && element.hasOwnProperty('y')){
    //      _list.add(element);
    Array.prototype.push.call(this, element);

    //update loose boundary rect
    this.updateBounds(element.x, element.y);
  }
};

//  /**
//   * Check whether the collection contains an element equal to [element].
//   */
//  bool contains(Coord element) => _list.contains(element);

//  /** Returns the element at the given index in the list or throws an IndexOutOfRangeException if index is out of bounds. */
//  Coord operator [](int index) => _list[index];
//
//  /** Sets the entry at the given index in the list to value. Throws an IndexOutOfRangeException if index is out of bounds. */
//  void operator []=(int index, value) => _list[index] = value;
//
//  Iterator iterator() => _list.iterator();
//
//  void forEach(void f(element)) => _list.forEach(f);
//
//  Collection map(f(element)) => _list.map(f);
//
//  Collection filter(bool f(element)) => _list.filter(f);
//
//  bool every(bool f(element)) => _list.every(f);
//
//  bool some(bool f(element)) => _list.some(f);
//
//  bool get isEmpty           => _list.isEmpty;
/**
 * @returns {Boolean}
 */
Path.prototype.isEmpty = function () {
  return (this.length === 0);
};

//  /** Appends all elements of the collection to the end of list. Extends the
//   *  length of the list by the length of collection. Throws an UnsupportedOperationException
//   *  if the list is not extendable.
//   */
//  void addAll(Collection collection) => _list.addAll(collection);

/** Adds one or more elements to the end of an array and returns the new length of the array and
 *  updates loose boundary rect.
 */
Path.prototype.push = function (value) {
  this.add(value);
  return this.length;
};

/** Update loose boundary rect
 *  @param {Number} x
 *  @param {Number} y
 */
Path.prototype.updateBounds = function (x, y) {

  if(x < this.topLeft.x) {
    this.topLeft.x = x;
  } else if(x > this.bottomRight.x) {
    this.bottomRight.x = x;
  }
  if(y < this.topLeft.y) {
    this.topLeft.y = y;
  } else if(y > this.bottomRight.y) {
    this.bottomRight.y = y;
  }
};

/** Removes all elements in the list. The length of the list becomes zero.
 */
Path.prototype.clear = function () {
  this.length = 0;
};

//  /** Returns a sub list copy of this list, from start to start + length. Returns an empty list
//   * if length is 0. Throws an IllegalArgumentException if length is negative. Throws an IndexOutOfRangeException
//   * if start or start + length are out of range.
//   */
//  List getRange(int start, int length) => _list.getRange(start, length);

//  /**   Returns the first index of element in this list. Searches this list from index start to the length of the list.
//   * Returns -1 if element is not found.
//   */
//  int indexOf(element, [int start = 0]) => _list.indexOf(element, start);

//  /** Inserts a new range in the list, starting from start to start + length. The entries are filled with
//   *  initialValue. Throws an UnsupportedOperationException if the list is not extendable. If length is 0,
//   *  this method does not do anything. If start is the length of the array, this method inserts the range
//   *   at the end of the array. Throws an IllegalArgumentException if length is negative. Throws an IndexOutOfRangeException if start or start + length are out of range. */
//  void insertRange(int start, int length, [initialValue]) {
//    if(initialValue != null) _list.insertRange(start, length, initialValue);
//    else _list.insertRange(start, length);
//  }

/** Returns the last element of the list, or throws an out of bounds exception if the list is empty.
 * @returns {Coord}
 */
Path.prototype.last = function () {
  console.log('Path.last:', this[this.length - 1]);
  return new Coord({x: this[this.length - 1].x, y: this[this.length - 1].y});
};

//  /** Returns the last index of element in this list. Searches this list from index start to 0.
//   *  Returns -1 if element is not found.
//   */
//  int lastIndexOf(element, [int start]) {
//    if(start != null) return _list.lastIndexOf(element, start);
//    else return _list.lastIndexOf(element);
//  }

//  /**
//   * Reduce a collection to a single value by iteratively combining each element
//   * of the collection with an existing value using the provided function.
//   * Use [initialValue] as the initial value, and the function [combine] to
//   * create a new value from the previous one and an element.
//   *
//   * Example of calculating the sum of a collection:
//   *
//   *   collection.reduce(0, (prev, element) => prev + element);
//   */
//   reduce(var initialValue,
//                 combine(var previousValue, Coord element))
//      => _list.reduce(initialValue, combine);
//
//  /** Pops and returns the last element of the list. Throws a UnsupportedOperationException
//   *  if the length of the list cannot be changed.
//   */
//  removeLast() => _list.removeLast();

/** Removes the range in the list starting from start to start + length. Throws an UnsupportedOperationException
 *  if the list is not extendable. If length is 0, this method does not do anything. Throws an IllegalArgumentException if length is negative. Throws an IndexOutOfRangeException if start or start + length are out of range.
 */
//  void removeRange(int start, int length) => _list.removeRange(start, length);

/**
 * Removes the element at position[index] from the list.
 *
 * This reduces the length of the list by one and moves all later elements
 * down by one position.
 * Returns the removed element.
 * Throws an [ArgumentError] if [index] is not an [int].
 * Throws an [IndexOutOfRangeException] if the [index] does not point inside
 * the list.
 * Throws an [UnsupportedError], and doesn't remove the element,
 * if the length of the list cannot be changed.
 */
//  Coord removeAt(int index) => _list.removeAt(index);

//  /** Copies length elements of the from array, starting from startFrom, into this, starting at start.
//   *  Throws an UnsupportedOperationException if the list is not extendable. If length is 0, this method
//   *  does not do anything. Throws an IllegalArgumentException if length is negative. Throws an IndexOutOfRangeException
//   *  if start or start + length are out of range for this, or if startFrom is out of range for from.
//   */
//  void setRange(int start, int length, List from, [int startFrom]) {
//    if(startFrom != null) _list.setRange(start, length, from, startFrom);
//    else _list.setRange(start, length, from, startFrom);
//  }
//
//  /** Sorts the list according to the order specified by the comparator. The order specified by the comparator
//   * must be reflexive, anti-symmetric, and transitive.
//   */
//  void sort([Comparator compare = Comparable.compare]) => _list.sort(compare);


/** Renders this object on the supplied canvas rendering context.
 * @param {CanvasRenderingContext2D} ctx
 */
Path.prototype.draw = function (ctx) {
  var i;

  if(!this.length) return;

  ctx.save();

//  ctx.setStrokeColorRgb(this.hue.r, this.hue.g, this.hue.b, this.hue.a);
  ctx.strokeStyle = this.hue.toString();
  ctx.beginPath();

  //Move to first point.
  ctx.moveTo(this[0].x, this[0].y);

  //Draw lines connecting each point.
  for(i = 1; i < this.length; i++) {
    ctx.lineTo(this[i].x, this[i].y);
  }

  ctx.stroke();
  ctx.restore();
};

/** Clear the loose boundary rect occupied by this Path.
 * @param {CanvasRenderingContext2D} ctx
 */
//  void undraw(CanvasRenderingContext2D ctx) {
Path.prototype.undraw = function (ctx) {
  if(this.length > 0) {
      ctx.clearRect(this.topLeft.x-1, this.topLeft.y-1,
        this.bottomRight.x+1 - this.topLeft.x, this.bottomRight.y+1 - this.topLeft.y);
//      print('662: ctx4.clearRect(${topLeft.x}, ${topLeft.y}, ${bottomRight.x - topLeft.x}, ${bottomRight.y - topLeft.y}');
  }
};

/** Renders this object on the supplied canvas rendering context using Bezier curves.
 * @param {CanvasRenderingContext2D} ctx
 */
//Path.prototype.drawBez = function (ctx) {
    //Set up the drawing context.
//    ctx.setStrokeColorRgb(hue.r, hue.g, hue.b, hue.a);
//
    //Figure out how many cubic + quadratic curves to use
    //Draw cubics.
    //Draw Quadratics.
//}