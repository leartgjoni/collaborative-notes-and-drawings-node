/**
 * Created by leart on 17-05-04.
 */

module.exports = function(app){
    app.get('/',function(res, res){
        res.render('home');
    });
};