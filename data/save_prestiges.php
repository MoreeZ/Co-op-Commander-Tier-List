<?php
// Set headers to allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Get the posted data
$postData = file_get_contents("php://input");
$data = json_decode($postData, true);

// Check if data is valid JSON
if ($data === null) {
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}

// Write the data to the file
try {
    $file = 'raw_prestiges.json';
    $result = file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
    
    if ($result === false) {
        echo json_encode(["success" => false, "message" => "Failed to write to file"]);
    } else {
        echo json_encode(["success" => true, "message" => "Data saved successfully"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
