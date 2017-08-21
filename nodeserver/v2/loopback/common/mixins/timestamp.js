module.exports = function(Model, options) {
    'use strict';

    Model.defineProperty('created', {type: "number"});
    Model.defineProperty('modified', {type: "number"});

    Model.observe('before save', function event(ctx, next) { //Observe any insert/update event on Model
        console.log(ctx);
        if (ctx.instance) {
            if (ctx.isNewInstance) {
                ctx.instance.created = Date.now();
            }
            ctx.instance.modified = Date.now();
        }
        next();
    });

    // Model is the model class
    // options is an object containing the config properties from model definition
    // Model.defineProperty('created', {type: "number", default: function(){Date.now()}});
    // Model.defineProperty('modified', {type: "number", default: function(){Date.now()}});
}