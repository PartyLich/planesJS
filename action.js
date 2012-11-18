//class Action {
function Action(json) {
//  num time; //When the even should happen, in seconds.
  this.time = 0;  //When the even should happen, in seconds.
//  List<Map> planes; //Plane type(s) that should be added.
  this.planes = [];     //Plane type(s) that should be added.

  if(json) {
    Action.prototype.fromJson.call(this, json);
  }
}

Action.prototype.fromJson = function (json) {
//this.time = json['time'];
  this.time = json['time'];
//  this.planes = new List.from(json['planes']);
  this.planes = new Array().concat(json['planes']);
////this.planes.addAll(json['planes']);
};

//class Level {
//  String bg;
//  List<Coord> runways;
//  List<Action> events;
//}