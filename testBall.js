

/*************************************************************************************************/
var testBall = (function main() {
  var c1 = new Coord(),
      c2 = new Coord({x:10, y:10});
      b1 = new Ball(10, 10),
      b2 = new Ball(5, 5, 5);

  console.log(c1, c2, b1, b2);

  console.log('c1.dist(c2): ' + c1.dist(c2));
  c1.move(30, 30);
  b1.move(10, 10);
  console.log(c1, c2, b1, b2);
  console.log('c1.dist(c2): ' + c1.dist(c2));
  console.log('c1.midpoint(c2)', c1.midpoint(c2));
  console.log('c1.scale(.5)', c1.scale(.5));
  console.log(c1, c2, b1, b2);
  console.log('c1.minus(c2)', c1.minus(c2));
  console.log('c1.plus(c2)', c1.plus(c2));
})();

//main();