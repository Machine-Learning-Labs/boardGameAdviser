/*

                        _              _
                       | |            (_)
   ___ _____   ________| |_ ___ ______ _ ___  ___  _ __
  / __/ __\ \ / /______| __/ _ \______| / __|/ _ \| '_ \
 | (__\__ \\ V /       | || (_) |     | \__ \ (_) | | | |
  \___|___/ \_/         \__\___/      | |___/\___/|_| |_|
                                     _/ |
                                    |__/
Demo purpose file:
usage:
	$ npm install csv-to-json
	$ node parse.js
*/

var csv = require('csv-to-json');
var inputFile = { filename: "input.csv" || process.env.INPUT };

var parse = function(resolve,reject) {

	csv.parse( { filename:"training_data.csv"},
		(err,json) => {
			if (err) { reject(err); }
			resolve(json);
		});
};

var save = function(input) {

	csv.writeJsonToFile({ filename: "training_data.json", json: input }, (err) => { if (err) { fail(err); }  });
};

var fail = function(reason) {

    console.log('Handle rejected promise ('+reason+') here.');
}

var p1 = new Promise(parse);
	p1.then(save)
	  .catch(fail);

console.log('No olvidar: ')
console.log('* formatear')
console.log('* quitar las dobles "')
console.log('* quitar los popular vacio')
