
var knowledge = { training: []};

/*
 Obtener listados de nombres
 '' => literales
 `` => números
 */

// Obtener listado de nombres
jmespath.search(knowledge,"training[*].name");

// Preguntar por números
jmespath.search(knowledge,"training[?adictivo==`4`].name")

// Preguntar por literales
jmespath.search(knowledge,"training[?minedad=='10'].{NAME:name}")

// Sacar en forma de objeto
jmespath.search(knowledge,"training[?adictivo==`4`].{NAME:name}")

/*
 Obtener listados valores
*/

// Obtener valores extremos en números de jugadores
_.groupBy(jmespath.search(knowledge,"training[*].minjugadores"),parseInt)
_.groupBy(jmespath.search(knowledge,"training[*].minjugadores"),parseInt)

// Sacar tabla de cruces de jugadores (a partir de una edad mínima, las máximas)
_.groupBy(jmespath.search(knowledge,"training[?minjugadores=='2'].maxjugadores"),parseInt)
_.groupBy(jmespath.search(knowledge,"training[?minjugadores=='3'].maxjugadores"),parseInt)
_.groupBy(jmespath.search(knowledge,"training[?minjugadores=='4'].maxjugadores"),parseInt)
_.groupBy(jmespath.search(knowledge,"training[?minjugadores=='5'].maxjugadores"),parseInt)
_.groupBy(jmespath.search(knowledge,"training[?minjugadores=='6'].maxjugadores"),parseInt)
_.groupBy(jmespath.search(knowledge,"training[?minjugadores=='muchos'].maxjugadores"),parseInt)

// Más de una consulta :)
jmespath.search(knowledge,"training[?minedad=='10'] \| [?atmosfera=='medieval']")


// Sacar listado de juegos de una edad concreta
jmespath.search(knowledge,"training[?minedad=='4'].name")

// Conteo por edades mínimas
_.groupBy(jmespath.search(knowledge,"training[*].minedad"),parseInt)
