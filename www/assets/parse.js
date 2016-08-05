/*

 CSV TO JSON

 Demo purpose file:
 usage:
 $ npm install csv-to-json
 $ node parse.js
 $
 */

var csv = require('csv-to-json');
var inputFile = { filename: "input.csv" || process.env.INPUT };

var parse = function(resolve,reject) {

  csv.parse( inputFile,
    function (err,json)  {
      if (err) { reject(err); }
      resolve(json);
    });
};

var save = function(input) {

  csv.writeJsonToFile({ filename: "training_data.json", json: input },
    function (err) {
      if (err) { fail(err); }
      else {
        console.log('No olvidar: ')
        console.log('* formatear')
        console.log('* quitar las dobles "')
        console.log('* quitar los popular vacio')
      }
  });
};

var fail = function(reason) {
  console.log('Handle rejected promise ('+reason+') here.');
}

var p1 = new Promise(parse);
p1.then(save)
  .catch(fail);


