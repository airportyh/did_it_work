var assert = require('chai').assert
var process = require('./index')

test('it executes command and calls good', function(done){
  process('echo hello')
    .good(function(stdout){
      assert.equal(stdout, 'hello\n')
    })
    .complete(function(){
      done()
    })
})

test('it calls bad if exit code is bad', function(done){
  process('blarg')
    .good(function(){
      assert.fail()
    })
    .bad(function(err, stderr){
      assert(err instanceof Error)
      assert.match(err.message, /blarg: command not found/)
      assert.match(stderr, /blarg: command not found/)
      done()
    })
})

test('looks for good pattern', function(done){
  process('echo hello')
    .goodIfMatches(/hello/)
    .good(function(){
      done()
    })
})

test('doesnt call good or bad if doesnt find good pattern', function(done){
  process('echo blah')
    .goodIfMatches(/hello/)
    .good(assert.fail)
    .bad(assert.fail)
    .complete(function(){
      done()
    })
})

test('calls bad if times out w/o finding good pattern', function(done){
  process('sleep 3')
    .goodIfMatches(/hello/, 100)
    .good(function(){
      assert.fail()
    })
    .bad(function(){
      done()
    })
})

test('matches bad pattern', function(done){
  process('echo bad')
    .badIfMatches(/bad/)
    .bad(function(){
      done()
    })
})

test('doesnt call good or bad if doent find bad pattern', function(done){
  process('echo good')
    .badIfMatches(/bad/)
    .bad(assert.fail)
    .good(assert.fail)
    .complete(function(){
      done()
    })
})

test('calls good if times out w/o finding bad pattern', function(done){
  process('sleep 3')
    .badIfMatches(/bad/, 100)
    .bad(assert.fail)
    .good(function(stdout){
      assert.equal(stdout, '')
      done()
    })
})

