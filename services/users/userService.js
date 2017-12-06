
var FirebaseAuth = require('firebaseauth');

var firebase = new FirebaseAuth('AIzaSyDNXsG1-EuE92Aj12UIg8cWxdo8tmTLliY');



function addUser(email, password, callback) {


}


function authenticate(email, password, callback) {

     firebase.signInWithEmail(email, password, function(err, result){

       callback(err, result);

      });


}

module.exports = {

    addUser : addUser,
    authenticate : authenticate

}
