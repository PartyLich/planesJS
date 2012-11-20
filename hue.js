define(function () {
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
//      Hue([this.r = 0, this.g = 0, this.b = 0, this.a = 1]);
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

  return Hue;
});