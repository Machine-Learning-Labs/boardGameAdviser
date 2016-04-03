<?php


$file = "default.json";
$json = json_decode(file_get_contents($file));

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

/*
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");
*/

//print_r($json);
echo json_encode($json);


?>