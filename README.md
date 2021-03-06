# dweb-dns

Issue DNS lookups for DWeb archives using HTTPS requests to the target host. Keeps an in-memory cache of recent lookups.

## API

```js
var datDns = require('dweb-dns')()

// or, if you have a custom protocol
var datDns = require('dweb-dns')({
    recordName: /* name of .well-known file */
    protocolRegex: /* RegExp object for custom protocol */,
    hashRegex: /* RegExp object for custom hash i.e. */,
    txtRegex: /* RegExp object for DNS TXT record of custom protocol */,
})

// example: 
var cabalDns = require('dweb-dns')({
    recordName: 'dmessenger',
    hashRegex: /^[0-9a-f]{64}?$/i,
    protocolRegex: /^dmessenger:\/\/([0-9a-f]{64})/i,
    txtRegex: /^"?cabalkey=([0-9a-f]{64})"?$/i
})

// resolve a name: pass the hostname by itself
datDns.resolveName('foo.com', function (err, key) { ... })
datDns.resolveName('foo.com').then(key => ...)

// dont use cached 'misses'
datDns.resolveName('foo.com', {ignoreCachedMiss: true})

// dont use the cache at all
datDns.resolveName('foo.com', {ignoreCache: true})

// dont use dns-over-https
datDns.resolveName('foo.com', {noDnsOverHttps: true})

// dont use .well-known/dweb
datDns.resolveName('foo.com', {noWellknownDat: true})

// list all entries in the cache
datDns.listCache()

// clear the cache
datDns.flushCache()

// configure the DNS-over-HTTPS host used
var datDns = require('dweb-dns')({
  dnsHost: 'dns.google.com',
  dnsPath: '/resolve'
})

// use a persistent fallback cache
// (this is handy for persistent dns data when offline)
var datDns = require('dweb-dns')({
  persistentCache: {
    read: async (name, err) => {
      // try lookup
      // if failed, you can throw the original error:
      throw err
    },
    write: async (name, key, ttl) => {
      // write to your cache
    }
  }
})

// emits some events, mainly useful for logging/debugging
datDns.on('resolved', ({method, name, key}) => {...})
datDns.on('failed', ({method, name, err}) => {...})
datDns.on('cache-flushed', () => {...})
```

## Spec

[In detail.](https://www.dwebx.net/deps/0005-dns/)

**Option 1 (DNS-over-HTTPS).** Create a DNS TXT record witht he following schema:

```
datkey={key}
```

**Option 2 (.well-known/dweb).** Place a file at `/.well-known/dweb` with the following schema:

```
{dweb-url}
TTL={time in seconds}
```

TTL is optional and will default to `3600` (one hour). If set to `0`, the entry is not cached.
