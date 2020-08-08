var tape = require('tape')
var datDns = require('./index')()

var FAKE_DAT = 'f'.repeat(64)

tape('Successful test against dbrowser.com', function (t) {
  datDns.resolveName('dbrowser.com', function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    datDns.resolveName('dbrowser.com').then(function (name2) {
      t.equal(name, name2)
      t.end()
    })
  })
})

tape('Works for keys', function (t) {
  datDns.resolveName('40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9', function (err, name) {
    t.error(err)
    t.equal(name, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')
    t.end()
  })
})

tape('Works for versioned keys and URLs', function (t) {
    datDns.resolveName('40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9+5', function (err, name) {
      t.error(err)
      t.equal(name, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')

      datDns.resolveName('dbrowser.com+5', function (err, name) {
        t.error(err)
        t.ok(/[0-9a-f]{64}/.test(name))
        t.end()
      })
    })
})

tape('Works for non-numeric versioned keys and URLs', function (t) {
    datDns.resolveName('40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9+foo', function (err, name) {
      t.error(err)
      t.equal(name, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')

      datDns.resolveName('dbrowser.com+foo', function (err, name) {
        t.error(err)
        t.ok(/[0-9a-f]{64}/.test(name))
        t.end()
      })
    })
})

tape('Works for full URLs', function (t) {
  datDns.resolveName('dweb://40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9', function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    datDns.resolveName('dweb://dbrowser.com/foo.txt?bar=baz', function (err, name) {
      t.error(err)
      t.ok(/[0-9a-f]{64}/.test(name))
      t.end()
    })
  })
})

tape('A bad hostname fails gracefully', function (t) {
  datDns.resolveName('example.com', {ignoreCache: true}, function (err, name) {
    t.ok(err)
    t.notOk(name)

    datDns.resolveName(1234, function (err, name) {
      t.ok(err)
      t.notOk(name)

      datDns.resolveName('foo bar', {ignoreCache: true}, function (err, name) {
        t.ok(err)
        t.notOk(name)

        t.end()
      })
    })
  })
})

tape('A bad DNS record fails gracefully', function (t) {
  datDns.resolveName('bad-dweb-record1.dbrowser.com', {ignoreCache: true}, function (err, name) {
    t.ok(err)
    t.notOk(name)
    t.end()
  })
})

tape('Unqualified domain fails gracefully', function (t) {
  datDns.resolveName('bad-dweb-domain-name', {ignoreCache: true}, function (err, name) {
    t.ok(err)
    t.notOk(name)
    t.end()
  })
})

tape('Successful test against dbrowser.com', function (t) {
  datDns.resolveName('dbrowser.com', {ignoreCache: true}, function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    datDns.resolveName('dbrowser.com').then(function (name2) {
      t.equal(name, name2)
      t.end()
    }).catch(function (err) {
      t.error(err)
      t.end()
    })
  })
})

tape('Successful test against dbrowser.com (no dns-over-https)', function (t) {
  datDns.resolveName('dbrowser.com', {noDnsOverHttps: true, ignoreCache: true}, function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    datDns.resolveName('dbrowser.com').then(function (name2) {
      t.equal(name, name2)
      t.end()
    }).catch(function (err) {
      t.error(err)
      t.end()
    })
  })
})

tape('Successful test against dbrowser.com (no well-known/dweb)', function (t) {
  console.log('running...')
  datDns.resolveName('dbrowser.com', {noWellknownDat: true, ignoreCache: true}, function (err, name) {
    console.log('res', err, name)
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    datDns.resolveName('dbrowser.com').then(function (name2) {
      t.equal(name, name2)
      t.end()
    }).catch(function (err) {
      t.error(err)
      t.end()
    })
  })
})

tape('List cache', function (t) {
  t.is(Object.keys(datDns.listCache()).length, 6)
  t.end()
})

tape('Persistent fallback cache', function (t) {
  t.plan(8)

  var persistentCache = {
    read: function (name, err) {
      if (name === 'foo') return '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9'
      throw err
    },
    write: function (name, key, ttl) {
      t.deepEqual(name, 'dbrowser.com')
      t.ok(/[0-9a-f]{64}/.test(key))
    }
  }

  var datDns = require('./index')({persistentCache})

  datDns.resolveName('dbrowser.com', function (err, key) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(key))

    datDns.resolveName('foo', function (err, key) {
      t.error(err)
      t.deepEqual(key, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')

      datDns.resolveName('bar', function (err, key) {
        t.ok(err)
        t.notOk(key)

        t.end()
      })
    })
  })
})

tape('Persistent fallback cache doesnt override live results', function (t) {
  var persistentCache = {
    read: function (name, err) {
      if (name === 'dbrowser.com') return 'from-cache'
      throw err
    },
    write: function (name, key, ttl) {}
  }

  var datDns = require('./index')({persistentCache})

  datDns.resolveName('dbrowser.com', function (err, key) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(key))
    t.end()
  })
})
