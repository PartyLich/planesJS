define(function (require) {
  /**
   * 
   */
  function StopWatch() {
    this.elapsedMilliseconds = 0;
    //    this.start();
    this.start = Date.now();
  }
  
  
//  StopWatch.prototype.start = function start() {};
//  StopWatch.prototype.reset = function reset() {};
//  StopWatch.prototype.update = function update() {
//    this.elapsedMilliseconds = Date.now() - this.start;
//  };
  
  return {};
});