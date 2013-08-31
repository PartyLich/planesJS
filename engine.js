define(['require','coord','ball', 'hue', 'path', 'plane', 'action', 'StopWatch',
        'Mediator', 'Graphics', 'Physics', 'mathLib',
        'text!tmpl/table.jshaml', 'text!tmpl/startButton.jshaml'],
function (require, Coord, Ball, Hue, Path, Plane, Action, StopWatch, Mediator, Graphics, Physics) {
  var getRandom = require('mathLib').getRandom,
      getRandomInt = require('mathLib').getRandomInt;

  /**
   *
   */
  function Engine() {
    var ctxFront, ctxBg,
        frameCount = 0, score = 0, collisions = 0,
        selected = null, curLevel = 0,
        loadQueue = 1,
        drag = false,
        path4 = new Path(),
  //  Stopwatch stpWatch4, stpFrame
        stpFrame = new StopWatch(),
        stpWatch4 = new StopWatch(),
        bg = new Image(),
  //  Plane leer
  //      leer = null,
  //  CanvasElement cvs4, cvsBg;
        cvsFront = $('#cvsFront')[0], cvsBg = $('#cvsBg')[0],
        cX = cvsFront.width,
        cY = cvsFront.height,
        objList = [], levels = [],
    //  imgPlanes = new List<ImageElement>()
        imgPlanes = [],
    //  eventList = new List<Action>()
        eventList = [],
    //  runways = new List<Path>()
        runways = [],

        mediator = new Mediator(),
        graphics = new Graphics(mediator),


    //templates
        tmplTable = Haml( require('text!tmpl/table.jshaml'),
                      {customEscape: "Haml.html_escape"});
        tmplStartBtn = Haml( require('text!tmpl/startButton.jshaml'),
                         {customEscape: "Haml.html_escape"});


    //Get canvas contexts.
    ctxFront = cvsFront.getContext("2d");
    ctxFront.font = 'normal 12px sans-serif';

    ctxBg = cvsBg.getContext("2d");

    path4.hue = new Hue(0, 170, 0); //'#00AA00'

    //Initialize plane sprites
    loadPlanes();

    //Initialize level list
    levels.push(
      'json/lvl1.json',
      'json/lvl2.json',
      'json/lvl3.json',
      'json/lvl4.json',
      'json/lvl5.json',
      'json/lvl6.json',
      'json/lvl7.json'
    );

    //Install mediator
    mediator.installTo(this);
    //test mediator
    var bs2 = function (args) {
      console.log('another bsEvent subscription!', args);
      console.log(args[2]);
    };
    this.subscribe('bsEvent', function (val) {
      console.log('bsEvent!', val, val.length, typeof val);
    });
    this.subscribe('bsEvent', bs2);
    this.publish('bsEvent', 'Thing one', 'Thing two', {rumble: 'thing three'});
    mediator.unsub('bsEvent', bs2);
    this.publish('bsEvent', 'Thing one', 'Thing two', {rumble: 'thing three'});


    //Add plane button
    $('btnAdd').click(function (ev) {
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
      stpFrame.reset();
      stpFrame.start();

      //Reset scoring.
      if(curLevel == 0) score = 0;
      collisions = 0;


      //Place background canvas where it needs to be.
      $(cvsBg).css({
          'left': $(cvsFront).position().left + 'px',
          'top': $(cvsFront).position().top + 'px'
      });

      //Register some event handlers!
      $(cvsFront).mousedown(mDown)
                 .mousedown(mDownPath)
                 .mousemove(mMove4Path)
                 .mouseup(mUp4Path);

      //Request first frame.
      console.log('about to gameTick');
      window.requestAnimationFrame(gameTick);
    }


    /**
     *
     */
    function write(message) {
      $('#status')[0].innerHTML += message + '<br />';
    }


    /** Main game loop
     * @param {Number} time  When this animation frame is scheduled to run.
     */
    function gameTick(time) {
      //Make sure we're loaded.
      if(loadQueue < 1) {
        var txtWidth;

        ctxFront.save();
        ctxFront.font = 'bold 30px sans-serif';
        txtWidth = ctxFront.measureText('LOADING...').width;
        ctxFront.fillText('LOADING...', cX / 2 - txtWidth / 2, cY / 2);
        ctxFront.restore();
        console.log('loadQueue', loadQueue);
        return;
      }

      //update timer
      stpFrame.update();

      //Clear displayed text
      ctxFront.clearRect(0, 0, 250, 20);              //top left diag text
      ctxFront.clearRect(0, cY - 35, 150, 20);          //score

      //Process current event list item
      if(eventList.length) {
        if(eventList[0].time <= stpFrame.elapsedMilliseconds / 1000) {
          //Add all planes in this event.
          for(var index = 0, plane; plane = eventList[0].planes[index++]; ) {
//          $.each(eventList[0].planes, function (index, plane) {
            console.log('adding plane');
            addPlane(plane.type,
                new Coord({x: plane.location.x, y: plane.location.y}),
                plane.heading);
            console.log('plane.heading', plane.heading);
//          });
          }

          //Remove this event from the list.
          eventList.shift();
        }
      }

      //Process object list
      //for(var index = 0, obj; obj = objList[i++]; ) {
      $.each(objList, function (index, obj) {
        if(!objList[index]) { return; }

        //Erase the foreground canvas.
        obj.clear(ctxFront);
        //this.publish('g:clearObj', obj, ctxFront);

        //remove dead planes
        console.log('obj.dead', obj.dead);
        if(obj.dead) {
          if(obj.selected) { selected = null; }

          console.log('objList.splice('+ index +', 1)');
          objList.splice(index, 1);

          //Update selected index
          if(selected != null) {
            if(selected >= index) { selected--; }
          }

          return;
        }

        //remove landed planes
        if(obj.landing && Math.round(obj.velocity()) <= 0) {
          if(obj.selected) { selected = null; }

            console.log('objList.splice('+ index +', 1)');
            objList.splice(index, 1);

          //Update selected index
          if(selected != null) {
            if(selected >= index) { selected--; }
          }

          //Increase player's score.
          score++;
          mediator.publish('score:land');

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
        if(collisionDetection(index, obj)) { return; }

        //New position and boundary looping
        reposition(obj);
        ctxFront.fillStyle = '#FF0000';

        //Path stuff.
        if(!obj.hasPath() && path4.length) { //Plane has no path, but map does.
          if(obj.dist(path4[0]) <= obj.pos.r) {
            //Plane has no path, path4 has a point, and plane is near the start of path4
            //obj.path = path4;
            obj.setPath(path4);

            //obj.waypoint = 1;
          }
        }

        if(obj.hasPath()) {
          var waypoint = obj.waypoint;

          //TODO: broadcast graphics message
          obj.path.undraw(ctxFront);
          //mediator.publish('g:drawObject', obj.path, ctxFront);
          obj.path.draw(ctxFront);

          if(waypoint >= obj.path.length) {  //Path complete.
            console.log('waypoint', waypoint, 'obj.path.length',  obj.path.length);
            console.log('Path complete (obj).');
            obj.path.undraw(ctxFront);
            obj.path = null;

            //Check for runway proximity
            for(var index = 0, runway; runway = runways[index]; index++) {
//            $.each(runways, function(index, runway) {
              if(obj.dist(runway[0]) <= obj.pos.r) {
                obj.land(runway);
              }
//            });
            }
          } else {
            //Redirect the plane.
            var head = Math.atan2(obj.path[waypoint].y - obj.pos.y, obj.path[waypoint].x - obj.pos.x);

            console.log('Adjusting heading to '+ head * 180/Math.PI +'deg.');
            obj.setHeading(head);

            if(obj.dist(obj.path[waypoint]) <= obj.pos.r * .75) {
            //We're near the waypoint. Great job!
              obj.nextWaypoint();
            }
          }
        }
      });

      //Draw the map path if it has any points.
      if(path4.length) {
        //TODO: broadcast graphics message
        //mediator.publish('g:drawObject', path4, ctxFront);
        path4.draw(ctxFront); 
      }

      //Draw plane(s) all objects.
//      for(var index = 0, obj; obj = objList[i]; i++) {
      $.each(objList, function(index, obj) {
        //TODO: broadcast graphics message
        //mediator.publish('g:drawObject', obj, ctxFront);
        obj.draw(ctxFront);
      });
//      }

      //Framerate
      frameCount++;
      ctxFront.fillText('Framerate: '+ Math.round(frameCount / (stpFrame.elapsedMilliseconds / 1000))
          +'    Time:'+(stpFrame.elapsedMilliseconds / 1000), 5, 10);

      //Display current score.
      ctxFront.fillText('Score: '+ score +'\r\nCollisions: ' + collisions, 5, cY - 25);

      //Request the next animation frame or end the game.
      if(objList.length === 0 && eventList.length === 0) {
        console.log('Ending game loop.');
        //Empty the user drawn path
        path4.length = 0;
        //stop the game clock.
        stpFrame.stop();

        //Remove canvas event listeners
        $(cvsFront).off('mousedown', mDown)
                   .off('mousedown', mDownPath)
                   .off('mousemove', mMove4Path)
                   .off('mouseup', mUp4Path);

        //TODO: broadcast level end message
        mediator.publish('sys:levelEnd');
        levelEnd();       //inter level transition screen
      } else {
        window.requestAnimationFrame(gameTick);
      }
    }


    /** Reposition an object according to its current velocity.
     * @param {Object} obj An object with a position and velocity
     */
    function reposition(obj) {
      //New position.
      var x = obj.pos.x + Math.round(obj.vx),
          y = obj.pos.y + Math.round(obj.vy);

      //boundary looping
      if(x < -obj.pos.r) {
        x = cX + obj.pos.r;
      } else if(x > cX + obj.pos.r) {
        x = -obj.pos.r;
      }
      if(y > cY + obj.pos.r) {
        y = -obj.pos.r;
      } else if(y < -obj.pos.r) {
        y = cY + obj.pos.r;
      }

      obj.move(new Coord({x: Math.round(x), y: Math.round(y)}));

      return obj;
    }


    /** Display the home splash screen and such.
     */
    function home() {
      var $btnStart = $('#btnStart'),
          $btnScore = $('#btnScore');

      //Create nav buttons if they don't already exist.
      if(!$btnStart.length) {
        $btnStart = $( tmplStartBtn({id: 'btnStart', text: 'START'}) );
        $('body').append($btnStart);
      }
      if(!$btnScore.length) {
        $btnScore = $( tmplStartBtn({id: 'btnScore', text: 'SCORE'}) );
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
      $btnStart.css({
          'position' : 'absolute',
          'top' : $(cvsFront).height() * .75 + 'px',
          'left' : $(cvsFront).width() *.33 + 'px',
          'z-index' : '3'
      });
      $btnScore.css({
          'position' : 'absolute',
          'top' : $btnStart.css('top'),
          'left' : $(cvsFront).width() *.33 + 100 + 'px',
          'z-index' : '3'
      });

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
              console.log('Adding event', event);
              eventList.push(new Action(event));
            });

            //Initialize background image.
            bg.src = '';
            bg.src = result.bg;
            //Set the background image's load event to draw it on the canvas.
            console.log('cX', cX);
            $(bg).one('load', drawBg2);
//            $(bg).one('load', drawBg);
          }
        });
      }

    function drawBg2() {
      mediator.publish('g:drawBg', this, ctxBg, cX, cY);
      
      //
      for(i = 0, runway = null; runway = runways[i++]; ) {
        ctxBg.fillStyle = '#00FF00';
        new Ball(runway[0].x, runway[0].y, 3).draw(ctxBg);
        ctxBg.fillStyle = '#FF0000';
        new Ball(runway[1].x, runway[1].y, 3).draw(ctxBg);
      }
    }
      
    /** Callback function to draw an image to the background canvas on image
     *  load.
     */
    function drawBg() {
      var bg = this,
          width, height,
          x, y,
          runway;

      console.log('this:', this);
      console.log('BG loaded2');
      ctxBg.fillStyle = '#0000EE';
      ctxBg.fillRect(0, 0, cX, cY);

      //Draw background image on the background canvas.
      ctxBg.save();

      //Rotate the image 90deg.
      //ctxBg.translate((cX-80), (-80));
//      ctxBg.translate(820, -80);
//      ctxBg.translate(820, 0);
//      ctxBg.rotate(Math.PI / 2);

      width = bg.width/2;
      height = bg.height/2;
      x = (cX - width) / 2;
      y = (cY - height) / 2;

      ctxBg.drawImage(bg, x, y, Math.round(width), Math.round(height));
      ctxBg.restore();
      ctxBg.font = 'normal 9px sans-serif';

      //
      for(i = 0, runway = null; runway = runways[i++]; ) {
        ctxBg.fillStyle = '#00FF00';
        new Ball(runway[0].x, runway[0].y, 3).draw(ctxBg);
        ctxBg.fillStyle = '#FF0000';
        new Ball(runway[1].x, runway[1].y, 3).draw(ctxBg);
      }
    }


    /** Loads the scores list specified by the [String] url.
     * @param {String} url
     */
    function loadScores(url) {
      var table;

      //TODO: make this a synchronous request.
      //Open asynchronous GET request.
      $.getJSON(url, function (result) {
        table = $('#scoreTable');

        //Create the table if it doesnt exist.
        if(!table.length) {
          table = $( tmplTable({scores: result.scores}) );
          //Add table to doc
          $('body').append(table);
        } else { table.html( tmplTable({scores: result.scores}) ); }

        //TODO: just give it a canvas sized div and center the darn thing
        table.css({
          'position' : 'absolute',
          'top' : $(cvsFront).height() * .35 + 'px',
          'left' : $(cvsFront).width() *.25 + 'px',
          'z-index' : '2'
        });

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
      btnHome.css({
          'position' : 'absolute',
          'top' : $(cvsFront).height() * .75 + 'px',
          'left' : $(cvsFront).width() *.33 + 'px',
          'z-index' : '3'
      });
      btnNext.css({
          'position' : 'absolute',
          'top' : btnHome.css('top'),
          'left' : $(cvsFront).width() * .33 + 100 + 'px',
          'z-index' : '3'
      });

      //New event handlers
      btnHome.one('click', homeClick);
      btnNext.one('click', nextClick);
    }

    /** Canvas4 mouseDown event handler. Directs leer object toward the click */
    function mDown(ev) {
      //Redirect the plane
      /*
      var head = Math.atan2(ev.offsetY - leer.pos.y, ev.offsetX - leer.pos.x);
  //    print('Adjusting heading to ${head * 180/Math.PI}deg.');
      leer.setHeading(head);
      */
    }

    /** Canvas 4 mouseDown event handler for path drawing. */
    function mDownPath(ev) {
      var click = new Coord({x : ev.offsetX, y : ev.offsetY});

      //Toggle click n drag flag.
      drag = true;

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

      if(selected != null) {  //A specific plane is selected

      } else {
        //Clear any existing generic path.
        path4.undraw(ctxFront);
        path4.clear();

        //Add start point to path.
        path4.add(new Coord({x : ev.offsetX, y : ev.offsetY}));
      }

      //Start the stopwatch.
      stpWatch4.start();
    }


    /** Canvas 4 mouseMove event handler for path drawing. */
    function mMove4Path(ev) {
      var next;

      stpWatch4.update();

      if(drag && stpWatch4.elapsedMilliseconds > 6) {  //We're in the midst of a click n' drag.
        next = new Coord({x : ev.offsetX, y : ev.offsetY});

        if(selected == null) {
          //Add intermediate point to path
          if(path4.last().dist(next) > 5) { path4.add(next); }
        } else if(objList[selected].hasPath()) {
          if(objList[selected].path.last().dist(next) > 5) {
            //Add intermediate point to path
            objList[selected].path.push(next);
          }
        }

        //Reset the path stopwatch.
        stpWatch4.reset();
      }
    }


    /** Canvas 4 mouseUp event handler for path drawing. */
    function mUp4Path(ev) {
      //Toggle click n drag flag.
      drag = false;

      //Stop and reset the path stopwatch.
      stpWatch4.stop();
      stpWatch4.reset();

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


    /** Add a new plane, optionally specifying type and location
     * @param {int} type
     * @param {Coord} pos
     * @param {Number} heading
     */
    function addPlane(type, pos, heading) {
      if(type == null) {
        type = getRandomInt(0, imgPlanes.length);
      }

      pos || (pos = new Coord({x: getRandomInt(0, cX), y: getRandomInt(0, cY)}));

      if(heading == null) {
        heading = getRandom(0, 2 * Math.PI);
      }

      try {
        var plane = new Plane(pos, imgPlanes[type].img, imgPlanes[type].alpha,
                      imgPlanes[type].frameWidth, imgPlanes[type].frameHeight);

        console.log(plane.animations.flight);

        if(type === 1) {
          plane.animations.flight.firstFrame = 1;
          plane.animations.flight.length = 8;
          plane.animations.flight.repeat = -1;
          plane.animations.flight.fps = 15;

          plane.animations.crash.firstFrame = 9;
          plane.animations.crash.length = 8;
          plane.animations.crash.repeat = 1;
          plane.animations.crash.fps = 15;

//          console.log(plane.animations.flight);
        }
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
      console.log('Heading set to', heading);

      //Add to object list.
      objList.push(plane);
    }


    /** Initialize plane sprites
     */
    function loadPlanes() {
      //Open synchronous GET request.
      $.ajax('json/planes.json', {
        async : false,
        dataType : 'json',
        success : function(result) {
          //Initialize plane list.
          $.each(result.planes, function(index, plane) {
            console.log('Adding plane', plane);

            imgPlanes.push({
              img : loadImage(plane.img),
              alpha : loadImage(plane.alpha),
              frameWidth : plane.frameWidth,
              frameHeight : plane.frameHeight
            });
          });
        }
      });
    }


    /** Collision detection
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
            && !(objList[i].landing || obj.landing)
            && !(objList[i].crashing || obj.crashing)) {  //Collision! oh noes!
          //Canvas cleanup
          objList[i].clear(ctxFront);

          //Update index of selected plane.
          if(obj.selected || objList[i].selected) selected = null;
          if(selected != null) {
            if(selected >= i) selected -= 2;
            else selected--;
          }


          //Start crash sequences
          obj.crash();
          objList[i].crash();


          //Scoring
          //TODO: Broadcast score event to scoring system
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



    return {
      home : home
    };
  }

  return Engine;
});
