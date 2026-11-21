'use strict';
// Express 4 async hataları yakalamaz; bu sarmalayıcı hatayı errorHandler'a iletir.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
