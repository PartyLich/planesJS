

/*************************************************************************************************/
var testPath = (function () {
  var c1 = new Coord(),
      c2 = new Coord({x:10, y:10});
      b1 = new Ball(10, 10),
      b2 = new Ball(5, 5, 5),
      p1 = new Path();

  console.log(c1, c2, b1, b2, p1);

  console.log('p1.isEmpty', p1.isEmpty(), p1.length);
  p1.push(c2);
  console.log('p1.isEmpty', p1.isEmpty(), p1.length);
  console.log(p1);
  p1.push(c2);
  console.log('p1.isEmpty', p1.isEmpty(), p1.length);
  console.log(p1);
})();

//main();