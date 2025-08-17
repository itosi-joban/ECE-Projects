<?php
include 'database.php'; // Include database connection

function calculateHeatIndex($temperature, $humidity) {
    // Convert temperature to Fahrenheit
    $tempF = ($temperature * 9 / 5) + 32;

    // Heat Index formula
    $HI = -42.379 
        + 2.04901523 * $tempF 
        + 10.14333127 * $humidity 
        - 0.22475541 * $tempF * $humidity 
        - 0.00683783 * $tempF * $tempF 
        - 0.05481717 * $humidity * $humidity 
        + 0.00122874 * $tempF * $tempF * $humidity 
        + 0.00085282 * $tempF * $humidity * $humidity 
        - 0.00000199 * $tempF * $tempF * $humidity * $humidity;

    // Convert back to Celsius
    return round(($HI - 32) * 5 / 9, 2);
}

// Handle POST requests for inserting data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if ($data && isset($_GET['endpoint'])) {
        $endpoint = $_GET['endpoint'];
        if ($endpoint === 'indoor') {
            $stmt = $conn->prepare("INSERT INTO indoor_data (temperature, humidity, air_quality) VALUES (?, ?, ?)");
            $stmt->bind_param("ddi", $data['temperature'], $data['humidity'], $data['air_quality']);
        } elseif ($endpoint === 'outdoor') {
            $stmt = $conn->prepare("INSERT INTO outdoor_data (temperature, humidity, air_quality) VALUES (?, ?, ?)");
            $stmt->bind_param("ddi", $data['temperature'], $data['humidity'], $data['air_quality']);
        }

        if ($stmt->execute()) {
            echo "Data inserted successfully!";
        } else {
            http_response_code(500);
            echo "Error inserting data: " . $stmt->error;
        }
        $stmt->close();
        exit;
    } else {
        http_response_code(400);
        echo "Invalid data or endpoint.";
        exit;
    }
}

// Handle GET requests for AJAX or ESP fetching
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['fetch'])) {
    $fetch = $_GET['fetch'];
    $query = "";

    // Determine which table to query
    if ($fetch === 'indoor') {
        $query = "SELECT temperature, humidity, air_quality, created_at FROM indoor_data ORDER BY created_at DESC LIMIT 4";
    } elseif ($fetch === 'outdoor') {
        $query = "SELECT temperature, humidity, air_quality, created_at FROM outdoor_data ORDER BY created_at DESC LIMIT 4";
    } else {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "Invalid fetch type."]);
        exit;
    }

    // Execute the query and build the response
    $result = $conn->query($query);
    $data = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Calculate Heat Index
            $row['heat_index'] = calculateHeatIndex($row['temperature'], $row['humidity']);

            // Append to response array
            $data[] = $row;
        }
        echo json_encode($data);
    } else {
        // No data found
        echo json_encode(["error" => "No data found."]);
    }
    exit;
}


// Fetch initial data for page load (indoor and outdoor)
function fetchData($conn, $query) {
    $result = $conn->query($query);
    $data = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Calculate heat index
            $row['heat_index'] = calculateHeatIndex($row['temperature'], $row['humidity']);
            $data[] = $row;
        }
    }
    return $data;
}

$indoorQuery = "SELECT temperature, humidity, air_quality, created_at FROM indoor_data ORDER BY created_at DESC LIMIT 4";
$indoorData = fetchData($conn, $indoorQuery);

$outdoorQuery = "SELECT temperature, humidity, air_quality, created_at FROM outdoor_data ORDER BY created_at DESC LIMIT 4";
$outdoorData = fetchData($conn, $outdoorQuery);

// Fetch the last recorded data for indoor
$lastIndoorQuery = "SELECT temperature, humidity, air_quality, created_at FROM indoor_data ORDER BY created_at DESC LIMIT 1";
$lastIndoorData = $conn->query($lastIndoorQuery)->fetch_assoc();

if ($lastIndoorData) {
    // Ensure humidity is fetched from the database for the latest indoor data
    $lastIndoorData['heat_index'] = calculateHeatIndex($lastIndoorData['temperature'], $lastIndoorData['humidity']);
}

// Fetch the last recorded data for outdoor
$lastOutdoorQuery = "SELECT temperature, humidity, air_quality, created_at FROM outdoor_data ORDER BY created_at DESC LIMIT 1";
$lastOutdoorData = $conn->query($lastOutdoorQuery)->fetch_assoc();

if ($lastOutdoorData) {
    // Ensure humidity is fetched from the database for the latest outdoor data
    $lastOutdoorData['heat_index'] = calculateHeatIndex($lastOutdoorData['temperature'], $lastOutdoorData['humidity']);
}

$conn->close();

?>


<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" type="x-icon" href="AGLogo.png">
    <title>AirGuard</title>
    <link rel="stylesheet" href="css/stylesAG.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>

<body>
    <nav>
        <div class="nav-logo">
            <img src="AGLogo.png" alt="AirGuard Logo" class="logo">
        </div>
        <div class="nav-links">
            <ul>
                <li><a href="#indoor">Indoor Dashboard</a></li>
                <li><a href="#outdoor">Outdoor Dashboard</a></li>
            </ul>
        </div>
    </nav>

    <div class="dashboard">
        <!-- Indoor Section -->
        <section id="indoor">
            <h2>Indoor Monitoring</h2>
            <div class="content">
               <div id="indoor-last-reading" class="card last-reading">
                    <h3>Latest Conditions</h3>
                    <div class="reading-item heat-index">
                        <span class="label">🔥 Heat Index:</span>
                        <span class="value">--</span>
                    </div>
                    <div class="reading-item temperature">
                        <span class="label">🌡️ Temperature:</span>
                        <span class="value">--</span>
                    </div>
                    <div class="reading-item humidity">
                        <span class="label">💧 Humidity:</span>
                        <span class="value">--</span>
                    </div>
                    <div class="reading-item aqi">
                        <span class="label">🌬️ AQI:</span>
                        <span class="value">--</span>
                    </div>
                    <p class="reading-time">
                        <span class="label">🕒 Time:</span>
                        <span class="value">--</span>
                    </p>
                </div>



                <div class="tips">
                        <h3>AIRGUARD Indoor Tips</h3>
                        <p id="indoor-tip-message"></p>
                    </div>

                <div class="chart-container">
                    <canvas id="indoorChart"></canvas>
                </div>

                <div class="card summary">
                    <h3>Average (Last 4 Readings)</h3>
                    <div class="reading-item">
                        <span class="label">🔥 Heat Index:</span>
                        <span class="value"><?php echo count($indoorData) ? round(array_sum(array_column($indoorData, 'heat_index')) / count($indoorData), 2) : '--'; ?> °C</span>
                    </div>
                    <div class="reading-item">
                        <span class="label">🌡️ Temperature:</span>
                        <span class="value"><?php echo count($indoorData) ? round(array_sum(array_column($indoorData, 'temperature')) / count($indoorData), 2) : '--'; ?> °C</span>
                    </div>
                    <div class="reading-item">
                        <span class="label">💧 Humidity:</span>
                        <span class="value"><?php echo count($indoorData) ? round(array_sum(array_column($indoorData, 'humidity')) / count($indoorData), 2) : '--'; ?> %</span>
                    </div>
                    <div class="reading-item">
                        <span class="label">🌬️ AQI:</span>
                        <span class="value"><?php echo count($indoorData) ? round(array_sum(array_column($indoorData, 'air_quality')) / count($indoorData), 2) : '--'; ?></span>
                    </div>
                </div>

                
            </div>
        </section>

        <!-- Outdoor Section -->
        <section id="outdoor">
            <h2>Outdoor Monitoring</h2>
            <div class="content">
                <div id="outdoor-last-reading" class="card last-reading">
                    <h3>Latest Conditions</h3>
                    <div class="reading-item heat-index">
                        <span class="label">🔥 Heat Index:</span>
                        <span class="value">--</span>
                    </div>
                    <div class="reading-item temperature">
                        <span class="label">🌡️ Temperature:</span>
                        <span class="value">--</span>
                    </div>
                    <div class="reading-item humidity">
                        <span class="label">💧 Humidity:</span>
                        <span class="value">--</span>
                    </div>
                    <div class="reading-item aqi">
                        <span class="label">🌬️ AQI:</span>
                        <span class="value">--</span>
                    </div>
                    <p class="reading-time">
                        <span class="label">🕒 Time:</span>
                        <span class="value">--</span>
                    </p>
                </div>

                <div class="tips">
                    <h3>AIRGUARD Outdoor Tips</h3>
                    <p id="outdoor-tip-message"></p>
                </div>

                <div class="chart-container">
                    <canvas id="outdoorChart"></canvas>
                </div>

                <div class="card summary">
                    <h3>Average (Last 4 Readings)</h3>
                    <div class="reading-item">
                        <span class="label">🔥 Heat Index:</span>
                        <span class="value"><?php echo count($outdoorData) ? round(array_sum(array_column($outdoorData, 'heat_index')) / count($outdoorData), 2) : '--'; ?> °C</span>
                    </div>
                    <div class="reading-item">
                        <span class="label">🌡️ Temperature:</span>
                        <span class="value"><?php echo count($outdoorData) ? round(array_sum(array_column($outdoorData, 'temperature')) / count($outdoorData), 2) : '--'; ?> °C</span>
                    </div>
                    <div class="reading-item">
                        <span class="label">💧 Humidity:</span>
                        <span class="value"><?php echo count($outdoorData) ? round(array_sum(array_column($outdoorData, 'humidity')) / count($outdoorData), 2) : '--'; ?> %</span>
                    </div>
                    <div class="reading-item">
                        <span class="label">🌬️ AQI:</span>
                        <span class="value"><?php echo count($outdoorData) ? round(array_sum(array_column($outdoorData, 'air_quality')) / count($outdoorData), 2) : '--'; ?></span>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <script src="js/charts.js"></script>
    <script src="js/tips.js"></script>
    <script src="js/dashboard.js"></script>
    <script>
        // Pass initial tips based on last readings
        document.getElementById('indoor-tip-message').textContent = getTipMessage(
            <?php echo $indoorData[0]['temperature'] ?? 'null'; ?>,
            <?php echo $indoorData[0]['humidity'] ?? 'null'; ?>,
            <?php echo $indoorData[0]['air_quality'] ?? 'null'; ?>
        );

        document.getElementById('outdoor-tip-message').textContent = getTipMessage(
            <?php echo $outdoorData[0]['temperature'] ?? 'null'; ?>,
            <?php echo $outdoorData[0]['humidity'] ?? 'null'; ?>,
            <?php echo $outdoorData[0]['air_quality'] ?? 'null'; ?>
        );
    </script>
    <script>
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    </script>
    <script>
    document.addEventListener('keydown', (e) => {
        // Disable F12
        if (e.key === "F12") {
            e.preventDefault();
        }
        // Disable Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.key === "I") {
            e.preventDefault();
        }
        // Disable Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && e.key === "J") {
            e.preventDefault();
        }
        // Disable Ctrl+U
        if (e.ctrlKey && e.key === "u") {
            e.preventDefault();
        }
    });
    </script>

</body>
</html>
