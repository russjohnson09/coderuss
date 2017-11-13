 console.log('loaded fitbit.js',Date.now());

 /**
  *
  * @param opts
  * @returns router
  */
 module.exports = function(opts)
{
    let winston = opts.winston || require('winston');
    winston.info('loaded winston');
    let router = opts.router || require('express').Router();


    router.get('/',function(req,res,next) {
        return res.json({})
    });


    return router;
};


 if (require.main === module) {
     (function() {
         let express = require('express');
         let app = express();

         app.listen(3000, function () {
             let router = module.exports({});
             app.use('/v1/fitbit', router);

             let cp = require('child_process');
             let spawn = cp.spawn;

             let child = spawn("mocha", ['./**/*_spec.js'],
                 {cwd: __dirname, env: process.env});
             child.stdout.on('data', function(data) {
                 process.stdout.write(data);
             });

             child.stderr.on('data', function(data) {
                 process.stderr.write(data);
             });
             child.on('exit', function(exitcode) {
                 if (exitcode !== 0) {
                     process.exit(exitcode);
                 }
             });

         });
     })();



 } else {
     console.log('required as a module');
 }