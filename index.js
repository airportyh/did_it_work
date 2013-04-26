var child_process = require('child_process')

module.exports = function(command){
  return new Process(command)
}

function Process(command){
  this.command = command
  this.options = {}
  this.successDetermined = false
  process.nextTick(function(){
    this.start()
  }.bind(this))
}

Process.prototype = {
  good: function(callback){
    this.options.good = callback
    return this
  },

  bad: function(callback){
    this.options.bad = callback
    return this
  },

  goodIfMatches: function(pattern, timeout){
    this.options.goodIfMatches = pattern
    this.options.goodIfMatchesTimeout = timeout
    return this
  },

  badIfMatches: function(pattern){
    return this
  },

  foundGoodMatch: function(stdout){
    var lines = stdout.split('\n')
    var pattern = this.options.goodIfMatches
    return lines.some(function(line){
      return !!line.match(pattern)
    }, this)
  },

  start: function(){
    this.options.__proto__ = {
      good: function(){},
      bad: function(){},
      complete: function(){}
    }
    
    if (this.options.goodIfMatchesTimeout){
      setTimeout(function(){
        if (this.successDetermined) return
        this.options.bad(new Error('Timed out without seeing ' + 
          this.options.goodIfMatches))
        this.successDetermined = true
      }.bind(this), this.options.goodIfMatchesTimeout)
    }

    var process = child_process.exec(this.command, function(err, stdout, stderr){
      if (this.successDetermined) return
      if (err){
        this.options.bad(err, stderr)
      }
      this.options.complete(err, stdout, stderr)
      this.successDetermined = true
    }.bind(this))

    process.stdout.on('data', function(data){
      if (this.successDetermined) return
      if (!this.options.goodIfMatches || this.foundGoodMatch(data)){
          this.options.good(data)
          this.successDetermined = true
      }
    }.bind(this))
  },

  complete: function(callback){
    this.options.complete = callback
    return this
  }
}
