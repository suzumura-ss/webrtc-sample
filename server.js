const connect = require('connect');
const serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8888, ()=>{
  console.log('Server running on 8888...');
});
