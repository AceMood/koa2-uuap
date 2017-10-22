# koa2-uuap

Cas Client for Baidu.Inc uuap(Cas Server)

# Methods

## middleware

```
const app = new Koa();
const uuap = require('koa2-uuap');

app.use(uuap.middleware({
    protocol: 'https',
    hostname: 'itebeta.baidu.com',
    port: '443',
    validateMethod: '/serviceValidate',
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