define(['coord','ball', 'hue', 'path', 'plane', 'action'], function (Coord, Ball, Hue, Path, Plane, Action) {
  /**
   *
   */
  function Engine() {
  //  var self = this;
    var ctxFront, ctxBg,
        cX, cY, frameCount = 0, score = 0, collisions = 0, selected = null, curLevel = 0,
        loadQueue = 1,
        drag = false,
        path4 = new Path(),
  //  Stopwatch stpWatch4, stpFrame
        stpFrame = {},
        stpWatch4 = {},
        bg = new Image(),
  //  Plane leer
  //      leer = null,
  //  CanvasElement cvs4, cvsBg;
        cvsFront = $('#cvsFront')[0], cvsBg = $('#cvsBg')[0],
        objList = [], levels = [],
    //  imgPlanes = new List<ImageElement>()
        imgPlanes = [],
    //  eventList = new List<Action>()
        eventList = [],
    //  runways = new List<Path>()
        runways = [];


    //Get canvas contexts.
    ctxFront = cvsFront.getContext("2d");
    ctxFront.font = 'normal 12px sans-serif';

    ctxBg = cvsBg.getContext("2d");

    path4.hue = new Hue(0, 170, 0); //'#00AA00'

    //Initialize plane sprites
    //Leer jet
    imgPlanes.push({img : loadImage('img/Leer.jpg'),
                    alpha : loadImage('img/Leer.jpg')
                   });
    //Airliner
    imgPlanes.push({img : loadImage('img/AirlinerClr.jpg'),
                    alpha : loadImage('img/Airliner.jpg')
                   });
    //Cessna;
    imgPlanes.push({img : loadImage('img/CessnaClr.jpg'),
                    alpha : loadImage('img/Cessna.jpg')
                   });

    //Initialize level list
    levels.push('json/lvl1.json');
    levels.push('json/lvl2.json');


    //Add plane button
    $('btnAdd').click( function (ev) {
      addPlane();
    });


    /**
     *
     */
    function run() {
      console.log('Starting run.');
      cvsFront.width = cvsFront.width;
      cvsBg.width = cvsBg.width;
      cX = cvsFront.width;
      cY = cvsFront.height;
      ctxFront.font = 'normal 12px sans-serif';

      //
      frameCount = 0;
  //    stpFrame.reset();
      stpFrame.elapsedMilliseconds = 0;
  //    stpFrame.start();
      stpFrame.start = Date.now();

      //Reset scoring.
      if(curLevel == 0) score = 0;
      collisions = 0;


      //Place background canvas where it needs to be.
      $(cvsBg).css('left', $(cvsFront).position().left + 'px')
          .css('top', $(cvsFront).position().top + 'px');

      //Register some event handlers!
      $(cvsFront).mousedown(mDown4);
      $(cvsFront).mousedown(mDown4Path);
      $(cvsFront).mousemove(mMove4Path);
      $(cvsFront).mouseup(mUp4Path);

      //Request first frame.

      window.requestAnimationFrame(gameTick);
    }

    /**
     *
     */
    function write(message) {
      $('#status')[0].innerHTML += message + '<br />';
    }

    /**
     * @param {Number} time  When this animation frame is scheduled to run.
     */
    function gameTick(time) {

      //Make sure we're loaded.
      if(loadQueue < 1) {
        ctxFront.save();
        ctxFront.font = 'bold 30px sans-serif';
        var txtWidth = ctxFront.measureText('LOADING...').width;
        ctxFront.fillText('LOADING...', cX / 2 - txtWidth / 2, cY / 2);
        ctxFront.restore();
        console.log('loadQueue', loadQueue);
        return;
      }

      //update timer
      stpFrame.elapsedMilliseconds = time - stpFrame.start;

      //Clear displayed text
  //    ctx4.clearRect(cX/2+100-5, 0, cX/2-95, 20); //top right diag text
      ctxFront.clearRect(0, 0, 250, 20);              //top left diag text
      ctxFront.clearRect(0, cY-35, 150, 20);          //score

      //Process current event list item
      if(eventList.length) {
        if(eventList[0].time <= stpFrame.elapsedMilliseconds / 1000) {
          //Add all planes in this event.
          $.each(eventList[0].planes, function (index, plane) {
            addPlane(plane.type,
                new Coord({x: plane.location.x, y: plane.location.y}),
                plane.heading);
            console.log('plane.heading', plane.heading);
          });

          //Remove this event from the list.
          eventList.shift();
        }
      }

      //Process object list
      $.each(objList, function (index, obj) {
        if(!objList[index])  return;

        //Erase the foreground canvas.
        obj.clear(ctxFront);

        //remove landed planes
        if(obj.landing && Math.round(obj.velocity()) <= 0) {
            if(obj.selected) selected = null;

            console.log('objList.splice('+ index +', 1)');
            objList.splice(index, 1);

          //Update selected index
          if(selected != null) {
            if(selected >= index) selected--;
          }

          //Increase player's score.
          score++;

          //add a new, random plane.
          //addPlane();
          //continue;
          return;
        } else if(obj.landing) {
        //update plane location(s).
        // TODO: Integer movement only!?
          //Accelerate landing plane.
          obj.setVelocity(obj.velocity() + obj.a);
  //          //write('obj.velocity = obj.velocity ${obj.velocity} + obj.a ${obj.a}');
          obj.setScale(obj.scale * .975);
        }

        //Collision detection
        if(collisionDetection(index, obj))
          return;

        //New position.
        var x = obj.pos.x + Math.round(obj.vx),
            y = obj.pos.y + Math.round(obj.vy);

        //boundary looping
        if(x < -obj.pos.r) x = cX + obj.pos.r;
        else if(x > cX + obj.pos.r) x = -obj.pos.r;
        if(y > cY + obj.pos.r) y = -obj.pos.r;
        else if(y < -obj.pos.r) y = cY + obj.pos.r;

        obj.move(new Coord({x: Math.round(x), y: Math.round(y)}));
        ctxFront.fillStyle = '#FF0000';

        //Path stuff.
        if(!obj.hasPath() && path4.length) { //Plane has no path, but map does.
  //        ctxFront.fillText('obj.dist(path4[0]): '+obj.dist(path4[0])+' obj.r:'+obj.r, cX/2+100, 10);
          if(obj.dist(path4[0]) <= obj.pos.r) {
            //Plane has no path, path4 has a point, and plane is near the start of path4
            obj.path = path4;
  //          obj.path = new Path(path4);
  //          obj.path = (new Path()).concat(path4);
            obj.waypoint = 1;
          }
        }
        if(obj.hasPath()) {
          var waypoint = obj.waypoint;

          obj.path.undraw(ctxFront);
          obj.path.draw(ctxFront);

          if(waypoint >= obj.path.length) {  //Path complete.
            console.log('Path complete (obj).');
            obj.path.undraw(ctxFront);
            obj.path = null;

            //Check for runway proximity
            $.each(runways, function(index, runway) {
              if(obj.dist(runway[0]) <= obj.pos.r) {
                obj.land(runway);
              }
            });
          } else {
            //Redirect the plane.
            var head = Math.atan2(obj.path[waypoint].y - obj.pos.y, obj.path[waypoint].x - obj.pos.x);

  //          console.log('Adjusting heading to '+ head * 180/Math.PI +'deg.');
            obj.setHeading(head);

            if(obj.dist(obj.path[waypoint]) <= obj.pos.r * .75) { //We're near the waypoint. Great job!
              obj.waypoint++;
            }
          }
        }
      });

      //Draw the map path if it has any points.
      if(path4.length) path4.draw(ctxFront);

      //draw plane(s)
      $.each(objList, function(index, obj) {
        obj.draw(ctxFront);
      });

      //Framerate
      frameCount++;
      ctxFront.fillText('Framerate: '+ Math.round(frameCount/(stpFrame.elapsedMilliseconds/1000)) +'    Time:'+(stpFrame.elapsedMilliseconds/1000), 5, 10);

      //Display current score.
      ctxFront.fillText('Score: '+ score +'\r\nCollisions: ' + collisions, 5, cY-25);

      //Request the next animation frame or end the game.
      if(objList.length == 0 && eventList.length == 0) {
        console.log('Ending game loop.');
        //Empty the user drawn path
        path4.length = 0;
        //stop the game clock.
  //      stpFrame.stop();

        //Remove canvas event listeners
        $(cvsFront).off('mousedown', mDown4);
        $(cvsFront).off('mousedown', mDown4Path);
        $(cvsFront).off('mousemove', mMove4Path);
        $(cvsFront).off('mouseup', mUp4Path);

        levelEnd();       //inter level transition screen
      } else {
        window.requestAnimationFrame(gameTick);
      }
    }

    /** Display the home splash screen and such.
     */
    function home() {
      var $btnStart = $('#btnStart'),
          $btnScore = $('#btnScore');

      //Create nav buttons if they don't already exist.
      if(!$btnStart.length) {
        $btnStart = $('<button id="btnStart"></button>').text('START');

        $('body').append($btnStart);
      }
      if(!$btnScore.length) {
        $btnScore = $('<button id="btnScore"></button>').text('SCORES');

        $('body').append($btnScore);
      }

      //Show buttons
      $btnStart.show();
      $btnScore.show();

      //Hide the high score list.
      if($('#scoreTable').length) $('#scoreTable').hide();

      //Title
      cvsFront.width = cvsFront.width;
      cvsBg.width = cvsBg.width;
      ctxFront.font = 'bold 50px Courier';
      ctxFront.fillStyle = 'rgb(163, 188, 227)';
      ctxFront.fillText('AIRPLANE!', 250, 40);

      //Display buttons
      $btnStart.css('position', 'absolute')
          .css('top', $(cvsFront).height() * .75 + 'px')
          .css('left', $(cvsFront).width() *.33 + 'px')
          .css('z-index', '3');
      $btnScore.css('position', 'absolute')
          .css('top', $btnStart.css('top'))
          .css('left', $(cvsFront).width() *.33 + 100 + 'px')
          .css('z-index', '3');

      //Add some event handlers
      $btnStart.one('click', startClick);
      $btnScore.one('click', scoreClick);
    }

    /** Loads the level specified by the [String] uri
     * @param {String} url
     */
      function loadLevel(url) {
        //Open synchronous GET request.
        $.ajax(url, {
          async : false,
          dataType : 'json',
          success : function(result) {
            //Initialize runway(s) with start and end points
            runways.length = 0;

            for(var i = 0; i < result.runways.length; i += 2) {
              var tmp = new Path();

              tmp.add(new Coord({x: result.runways[i].x, y: result.runways[i].y}));
              tmp.add(new Coord({x: result.runways[i+1]['x'], y: result.runways[i+1]['y']}));

              runways.push(tmp);
            }

          //Initialize event list.
            $.each(result.events, function(index, event) {
              eventList.push(new Action(event));
            });

            //Initialize background image.
            bg.src = '';
            bg.src = result.bg;

            $(bg).one('load', function (ev) {
              console.log('BG loaded');
              ctxBg.fillStyle = '#0000EE';
              ctxBg.fillRect(0, 0, cX, cY);

              //Draw background image on the background canvas.
              ctxBg.save();

              //Rotate the image 90deg.
              //ctxBg.translate((cX-80), (-80));
              ctxBg.translate(820, -80);
              ctxBg.rotate(Math.PI / 2);

              ctxBg.drawImage(bg, 0, 0, 400, 800);
              ctxBg.restore();
              ctxBg.font = 'normal 9px sans-serif';

              //
              $.each(runways, function (index, runway) {
                ctxBg.fillStyle = '#00FF00';
                new Ball(runway[0].x, runway[0].y, 3).draw(ctxBg);
                ctxBg.fillStyle = '#FF0000';
                new Ball(runway[1].x, runway[1].y, 3).draw(ctxBg);
              });
            });
          }
        });
      }

    /** Loads the scores list specified by the [String] url.
     * @param {String} url
     */
      function loadScores(url) {
        var table, header, score;
        //TODO: make this a synchronous request.
        //Open asynchronous GET request.
        $.getJSON(url, function (result) {
          table = $('#scoreTable');

          //Create the table if it doesnt exist.
          if(!table.length) {
            table = $('<table id="scoreTable"></table>');
            //Add table to doc
            $('body').append(table);
          } else {  table.empty(); }

          //Table header row
          header = $('<tr></tr>')
              .append('<th>Name</th>')
              .append('<th>Date</th>')
              .append('<th>Level</th>')
              .append('<th>Score</th>');

          table.append(header);

          //Score row(s)
          $.each(result.scores, function(index, row) {
            score = $('<tr></tr>')
              .append('<td>' + row.name + '</td>')
              .append('<td>' + row.date + '</td>')
              .append('<td>' + row.level + '</td>')
              .append('<td>' + row.score + '</td>');

            table.append(score);
          });

          //TODO: just give it a canvas sized div and center the darn thing
          table.css('position', 'absolute')
              .css('top', $(cvsFront).height() * .35 + 'px')
              .css('left', $(cvsFront).width() *.25 + 'px')
              .css('z-index', '2');

          table.show();
      });
    }

    /** Submit a score to the server at location specified by {String} url
     * @param {String} url
     */
    function sendScore(url) {
      //Get user info?

      //Send POST request to server.
      $.post(url, {score : score, date : date}, function(data) {
        //Display result dialog.
        //alert('Server response: ' + data.response);
        $('#dialog-modal').text(data.response);
        $('#dialog-modal').dialog('open');
      }, 'JSON');
    }

    /** Inter-level transition screen. Re-uses home screen nav buttons */
    function levelEnd() {
      var btnHome = $('#btnStart'),
          btnNext = $('#btnScore');

      //Create nav buttons if they don't already exist.
      if(btnHome == null) {
        btnHome = $('<button id="btnHome"></button>');

      $('body').append(btnHome);
      }
      if(btnNext == null) {
        btnNext = $('<button id="btnNext"></button>');

        $('body').append(btnNext);
      }

      //Show buttons
      btnHome.show();
      btnHome.text('HOME');

      btnNext.show();
      btnNext.text('NEXT LEVEL');

      //Display buttons
      btnHome.css('position', 'absolute')
          .css('top', $(cvsFront).height() * .75 + 'px')
          .css('left', $(cvsFront).width() *.33 + 'px')
          .css('z-index', '3');
      btnNext.css('position', 'absolute')
          .css('top', btnHome.css('top'))
          .css('left', $(cvsFront).width() * .33 + 100 + 'px')
          .css('z-index', '3');

      //New event handlers
      btnHome.one('click', homeClick);
      btnNext.one('click', nextClick);
    }

    /** Canvas4 mouseDown event handler. Directs leer object toward the click */
    function mDown4(ev) {
      //Redirect the plane
      /*
      var head = Math.atan2(ev.offsetY - leer.pos.y, ev.offsetX - leer.pos.x);
  //    print('Adjusting heading to ${head * 180/Math.PI}deg.');
      leer.setHeading(head);
      */
    }

    /** Canvas 4 mouseDown event handler for path drawing. */
    function mDown4Path(ev) {
      //Toggle click n drag flag.
      drag = true;
      /*************************************************************************/
      var click = new Coord({x : ev.offsetX, y : ev.offsetY});

      selected = null;

      //Check object list for a plane at this location and select if found.
      $.each(objList, function(index, obj) {
        if(obj instanceof Plane) {
          if(obj.selected = (obj.pos.dist(click) <= obj.pos.r+3)) {
            selected = index;

            //Clear or create path
            if(obj.hasPath()) {
              obj.path.undraw(ctxFront);
              obj.path.clear();
            } else {
              obj.path = new Path();
              obj.path.hue = new Hue(getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255));
            }
  //
            //Add first point at current plane (!mouse) location.
            obj.path.add(new Coord({x : obj.pos.x, y : obj.pos.y}));
            obj.waypoint = 0;
          }
        }
      });
      /*************************************************************************/

      if(selected != null) {  //A specific plane is selected

      } else {
        //Clear any existing generic path.
        path4.undraw(ctxFront);
        path4.clear();

        //Add start point to path.
  //      path4.add(new Coord.init(ev.offsetX, ev.offsetY));
        path4.add(new Coord({x : ev.offsetX, y : ev.offsetY}));
      }

      //Start the stopwatch.
  //    stpWatch4.start();
      stpWatch4.start = Date.now();
      stpWatch4.elapsedMilliseconds = 0;
    }

    /** Canvas 4 mouseMove event handler for path drawing. */
  //  void mMove4Path(ev) {
    function  mMove4Path(ev) {
      var next;
      stpWatch4.elapsedMilliseconds = Date.now() - stpWatch4.start;

      if(drag && stpWatch4.elapsedMilliseconds > 6) {  //We're in the midst of a click n' drag.
        next = new Coord({x : ev.offsetX, y : ev.offsetY});

        if(selected == null) {
          //Add intermediate point to path
          if(path4.last().dist(next) > 5)
            path4.add(next);
        } else if(objList[selected].hasPath()) {
          if(objList[selected].path.last().dist(next) > 5) {
            //Add intermediate point to path
            objList[selected].path.push(next);
          }
        }

        //Reset the path stopwatch.
  //      stpWatch4.reset();
        stpWatch4.start = Date.now();
        stpWatch4.elapsedMilliseconds = 0;
      }
    }

    /** Canvas 4 mouseUp event handler for path drawing. */
  //  void mUp4Path(ev) {
    function mUp4Path(ev) {
      //Toggle click n drag flag.
      drag = false;

      //Stop and reset the path stopwatch.
  //    stpWatch4.stop();
  //    stpWatch4.reset();
      stpWatch4.start = Date.now();
      stpWatch4.elapsedMilliseconds = 0;

      if(selected != null  && objList[selected].hasPath()) {
        //Add end point to specific path.
        objList[selected].path.add(new Coord({x : ev.offsetX, y : ev.offsetY}));
        objList[selected].selected = false;
  //      selected = null;
      } else {
        //Add end point to generic path.
        path4.push(new Coord({x : ev.offsetX, y : ev.offsetY}));
        //Diagnostic text.
  //      print('Path size: ${path4.length}');
      }
    }

    /** Start button event */
    function startClick(ev) {
      console.log('startClick');
      var btnStart = $('#btnStart'),
          btnScore = $('#btnScore');

      //hide buttons.
      btnStart.hide();
      btnScore.hide();

      //Load level
      curLevel = 0;
      loadLevel(levels[curLevel]);

      //Remove event handler so we don't end up with multiples.
      //btnStart.off('click', startClick);
      btnScore.off('click', scoreClick);

      //Start the game!
      run();
    }

    /** Score button event */
    function scoreClick(ev) {
      console.log('scoreClick');
      var btnHome = $('#btnStart'),
          btnScore = $('#btnScore');

      //Adjust nav buttons
      btnScore.hide();
      btnHome.text('HOME');

      //Adjust event handlers.
  //    btnScore.on.click.remove(scoreClickHandler);
  //    btnScore.off('click', scoreClick);
      btnHome.off('click', startClick);
      btnHome.one('click', homeClick);

      //Show the score table
      loadScores('json/scores.json');
    }

    /** Home button event */
    function homeClick(ev) {
      console.log('homeClick');
      var btnHome = $('#btnStart'),
          btnNext = $('#btnScore');

      btnHome.text('START');
      btnNext.text('SCORES');

      //Remove event handler so we don't end up with multiples.
  //    btnHome.off('click', homeClick);
      btnNext.off('click', nextClick);

      //
      home();
    }

    /** Next level button event */
  //  void nextClick(ev) {
    function nextClick(ev) {
      console.log('nextClick');
      var btnHome = $('#btnStart'),
          btnNext = $('#btnScore');

      if(curLevel < levels.length-1) {    //More levels!
        //Remove event handler(s).
  //      btnNext.off('click', nextClick);
        btnHome.off('click', homeClick);

        //hide buttons.
        btnHome.hide();
        btnNext.hide();

        //Load the next level
        loadLevel(levels[++curLevel]);

        //Start the game!
        run();
      } else {    //No mas.
      }
    }
  //
    /** Add a new plane, optionally specifying type and location
     * @param {int} type
     * @param {Coord} pos
     * @param {Number} heading
     */
    function addPlane(type, pos, heading) {
        if(type == null)
          type = getRandomInt(0, imgPlanes.length);

        pos || (pos = new Coord({x: getRandomInt(0, cX), y: getRandomInt(0, cY)}));

        if(heading == null)
          heading = getRandom(0, 2 * Math.PI);

      try {
        var plane = new Plane(pos, imgPlanes[type].img, imgPlanes[type].alpha);
      } catch(e) {
        console.log(imgPlanes);
        console.log(e);
        return;
      }

      //Alter plane heading/velocity/etc.
      plane.setScale(1/4);
      switch(type) {
        case 1:
          plane.setVelocity(6);
          break;
        case 2:
          plane.setVelocity(4);
          break;
        case 0:
          plane.setVelocity(8);
          break;
      }

      plane.setHeading(heading);

      //Add to object list.
      objList.push(plane);
    }


    /**
     * @param {Number} index  Objectlist index.
     * @param {Plane} obj   Plane referenced by index.
     * @returns {Boolean} True if collision detected.
     */
    function collisionDetection(index, obj) {
    //Collision detection
      for(var i = index+1; i < objList.length; i++) {
  //      console.log('i='+ i, ' obj.dist(objList['+i+'].pos)='+ obj.dist(objList[i].pos)
  //          +' max(r=)'+ Math.max(obj.pos.r, objList[i].pos.r));
        if(obj.dist(objList[i].pos) <= Math.max(obj.pos.r, objList[i].pos.r)
            && !(objList[i].landing || obj.landing)) {  //Collision! oh noes!
          //Canvas cleanup
          objList[i].clear(ctxFront);

          //Update index of selected plane.
          if(obj.selected || objList[i].selected) selected = null;
          if(selected != null) {
            if(selected >= i) selected -= 2;
            else selected--;
          }

          //Remove crashed planes.
          console.log('objList.splice('+ i +', 1)');
          objList.splice(i, 1);
          console.log('objList.splice('+ index +', 1)');
          objList.splice(index, 1);

          i--;

          //Scoring
          collisions++;
          score--;

          return true;
        }
      }

      return false;
    }

    /**
     * @param {String}
     * @returns {Image}
     */
    function loadImage(src) {
      var imgTmp = new Image();

      loadQueue--;
      $(imgTmp).one('load', resourceLoad);
      imgTmp.src = src;

      return imgTmp;
    }

    /** Increments the resource loaded counter so we know everything is ready. */
    function resourceLoad() {
      loadQueue++;
      console.log('Resource loaded:', this, 'complete: ', this.complete);
    }


    /** Returns a random integer between min and max
     * Using Math.round() will give you a non-uniform distribution!
     * From MDN
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    function getRandomInt(min, max) {
     return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /** Returns a random number between min and max
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    function getRandom(min, max) {
      return Math.random() * (max - min) + min;
    }

    /**
     *  Returns the control point for a quadratic bezier from p0 to p2 passing through onCurve.
     *  @param {Coord} p0
     *  @param {Coord} onCurve
     *  @param {Coord} p2
     *  @returns {Coord}
     */
  //  Coord ctrlPointQ(Coord p0, Coord onCurve, Coord p2) {
  //    int c1, c2, t, x1, y1;

  //    //Calculate chord lengths.
  //    c1 = p0.dist(onCurve);
  //    c2 = onCurve.dist(p2);

  //    //Approximate t (as proportion of total arc).
  //    t = c1 ~/ (c1 + c2);

  //    //Solve quadratic bezier for control point p1
  //    x1 = (onCurve.x - /*Math.pow((1-t), 2)*/(1-t)*(1-t) * p0.x - t * t * p2.x)
  //        ~/ (2 * t * (1-t))/*).floor()*/;
  //    y1 = (onCurve.y - /*Math.pow((1-t), 2)*/(1-t)*(1-t) * p0.y - t * t * p2.y)
  //        ~/ (2 * t * (1-t))/*).floor()*/;

  //    return new Coord.init(x1, y1);
  //  }

    /**
     *  Returns the control points for a cubic bezier from p0 to p3 passing through p4 and p5.
     */
  //  List<Coord> ctrlPointC(Coord p0, Coord p4, Coord p5, Coord p3) {
  //    int c1, c2, c3, t1, t2;
  //    Coord xs, ys;

      /** Returns solution [Coord] for system of linear equations
       *  ax + by = c
       *  dx + ey = f
       */
  //    Coord solveLinear(a, b, c, d, e, f) {
  //      num x, y;

  //      x = (d * c - f * a) / (b * d - a * e);
  //      y = (c - b * x) / a;

  ////      return new Coord.init(x, y);
  //      return new Coord.init(y, x);
  //    }

  //    //Calculate chord lengths.
  //    c1 = p0.dist(p4);
  //    c2 = p4.dist(p5);
  //    c3 = p5.dist(p3);

  //    //Approximate t1 and t2 (as proportion of total arc).
  //    t1 = c1 ~/ (c1 + c2 + c3);
  //    t2 = (c1 + c2) ~/ (c1 + c2 + c3);

  //    //Bezier helper functions.
  //    int b0(t) => Math.pow((1 - t), 3);
  //    int b1(t) => 3 * t * Math.pow((1 - t), 2);
  //    int b2(t) => 3 * t * t  * (1 - t);
  //    int b3(t) => Math.pow(t, 3);

      //Solve linear equations for control points
  //    xs = solveLinear(b1(t1), b2(t1), p4.x - (p0.x * b0(t1)) - p3.x * b3(t1), b1(t2), b2(t2), p5.x - (p0.x * b0(t2)) - p3.x * b3(t2));
  //    ys = solveLinear(b1(t1), b2(t1), p4.y - (p0.y * b0(t1)) - p3.y * b3(t1), b1(t2), b2(t2), p5.y - (p0.y * b0(t2)) - p3.y * b3(t2));

  //    return [new Coord.init(xs.x, ys.x), new Coord.init(xs.y, ys.y)];
  //  }
  //}

    return {
      home : home
    };
  }

  return Engine;
});