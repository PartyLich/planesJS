

/*************************************************************************************************/
var testPath = (function () {
  var c1 = new Coord(),
      c2 = new Coord({x:10, y:10});
      b1 = new Ball(100, 210),
      b2 = new Ball(5, 5, 5),
      p1 = new Path(),
      img = new Image(),
      cvs = $('#cvsFront').get(0),
      ctx = cvs.getContext('2d');

  ctx.save();
  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, 400, 400);
  ctx.restore();

  $(img).load(function (ev) {
    //ctx.drawImage(img, 0, 0);

    var leer = new Plane(b1, img, img);
    leer.setScale(.25);
    leer.selected = true;

    leer.img.onload = function() {
      leer.draw(ctx);
      leer.clear(ctx);
      leer.move(new Coord({x:200, y:210}));
      leer.draw(ctx);
      console.log(leer);
    };

    console.log('leer instanceof Plane', leer instanceof Plane);
  });
//  img.src = 'img/AirlinerClr.jpg';
  img.src = 'img/Leer.jpg';

  ctx.fillStyle = 'red';
  b2.draw(ctx);

  console.log(c1, c2, b1, b2, p1);
  console.log('p1.isEmpty', p1.isEmpty(), p1.length);
  console.log('p1.isEmpty', p1.isEmpty(), p1.length);
  console.log(p1);
  console.log('p1.isEmpty', p1.isEmpty(), p1.length);
  console.log(p1);

})();