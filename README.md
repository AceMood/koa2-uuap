# koa2-uuap

Cas Client for Baidu.Inc uuap(Cas Server)

**node version >= v7.6.0**

**You must use `koa-session2` alike middleware before use uuap middleware**

# Methods

## middleware

```
const app = new Koa();
const uuap = require('koa2-uuap');

app.use(uuap.middleware({
    protocol: 'https',
    hostname: 'casserver.com',
    port: '443',
    validateMethod: '/validate',
    appKey: 'uuapclient-xxx-xxx',
    service: 'http://localhost:3000/'
}));

```

## getUserInfo

```
const app = new Koa();
const router = new Router();
const uuap = require('koa2-uuap');

router.get('/user/info', ctx => {
    ctx.body = uuap.getUserInfo();
});

```

## logout

```
const router = new Router();

router.get('/logout', uuap.logout({
    service: 'http://localhost:3000/'
}));
```