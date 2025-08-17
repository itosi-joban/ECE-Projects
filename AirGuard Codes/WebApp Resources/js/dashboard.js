// Function to update Indoor Chart
function updateIndoorChart() {
    fetch(`?fetch=indoor`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const timestamps = data.map(item =>
                    new Date(item.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    })
                );

                indoorChart.data.labels = timestamps;
                indoorChart.data.datasets[0].data = data.map(item => item.temperature);
                indoorChart.data.datasets[1].data = data.map(item => item.humidity);
                indoorChart.data.datasets[2].data = data.map(item => item.air_quality);
                indoorChart.data.datasets[3].data = data.map(item => item.heat_index);
                indoorChart.update();
            } else {
                console.warn("No data available for the Indoor Chart");
            }
        })
        .catch(err => console.error("Error updating Indoor Chart:", err));
}

// Function to update Outdoor Chart
function updateOutdoorChart() {
    fetch(`?fetch=outdoor`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const timestamps = data.map(item =>
                    new Date(item.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    })
                );

                outdoorChart.data.labels = timestamps;
                outdoorChart.data.datasets[0].data = data.map(item => item.temperature);
                outdoorChart.data.datasets[1].data = data.map(item => item.humidity);
                outdoorChart.data.datasets[2].data = data.map(item => item.air_quality);
                outdoorChart.data.datasets[3].data = data.map(item => item.heat_index);
                outdoorChart.update();
            } else {
                console.warn("No data available for the Outdoor Chart");
            }
        })
        .catch(err => console.error("Error updating Outdoor Chart:", err));
}

// Function to update Current Conditions dynamically
let lastIndoorReading = {}; // Keep track of the last successful reading
let lastOutdoorReading = {}; // For outdoor

function updateCurrentConditions(fetchType, containerId) {
    fetch(`?fetch=${fetchType}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const latest = data[0];

                // Update fields
                document.querySelector(`${containerId} .heat-index .value`).textContent = `${latest.heat_index} °C`;
                document.querySelector(`${containerId} .temperature .value`).textContent = `${latest.temperature} °C`;
                document.querySelector(`${containerId} .humidity .value`).textContent = `${latest.humidity} %`;
                document.querySelector(`${containerId} .aqi .value`).textContent = latest.air_quality;

                const formattedTime = new Date(latest.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });
                document.querySelector(`${containerId} .reading-time .value`).textContent = `${formattedTime}`;

                // Store the latest reading
                if (fetchType === 'indoor') lastIndoorReading = latest;
                if (fetchType === 'outdoor') lastOutdoorReading = latest;
            } else {
                // If no new data, fall back to the last reading
                console.warn(`No data available for ${fetchType}, using last reading.`);
                const fallback = fetchType === 'indoor' ? lastIndoorReading : lastOutdoorReading;

                if (Object.keys(fallback).length > 0) {
                    document.querySelector(`${containerId} .heat-index .value`).textContent = `${fallback.heat_index} °C`;
                    document.querySelector(`${containerId} .temperature .value`).textContent = `${fallback.temperature} °C`;
                    document.querySelector(`${containerId} .humidity .value`).textContent = `${fallback.humidity} %`;
                    document.querySelector(`${containerId} .aqi .value`).textContent = fallback.air_quality;

                    const formattedTime = new Date(fallback.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    });
                    document.querySelector(`${containerId} .reading-time .value`).textContent = `${formattedTime}`;
                } else {
                    // If no last reading, show placeholders
                    document.querySelector(`${containerId} .heat-index .value`).textContent = '--';
                    document.querySelector(`${containerId} .temperature .value`).textContent = '--';
                    document.querySelector(`${containerId} .humidity .value`).textContent = '--';
                    document.querySelector(`${containerId} .aqi .value`).textContent = '--';
                    document.querySelector(`${containerId} .reading-time .value`).textContent = '--';
                }
            }
        })
        .catch(err => console.error(`Error fetching data for ${fetchType}:`, err));
}

// Function to update Tips
function updateTips(fetchType, tipContainerId, getTipMessageFunction) {
    fetch(`?fetch=${fetchType}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const latest = data[0];
                const message = getTipMessageFunction(latest.heat_index, latest.air_quality);
                document.getElementById(tipContainerId).innerHTML = message;
            } else {
                document.getElementById(tipContainerId).innerHTML = "Walang available na datos sa ngayon.";
            }
        })
        .catch(err => {
            console.error(`Error updating ${fetchType} tips:`, err);
            document.getElementById(tipContainerId).innerHTML = "Nagkaroon ng error sa pagkuha ng datos.";
        });
}

// Event Listeners for Navigation Links
document.querySelector('a[href="#indoor"]').addEventListener('click', () => {
    updateIndoorChart();
    updateCurrentConditions('indoor', '#indoor-last-reading');
    updateTips('indoor', 'indoor-tip-message', getIndoorTipMessage);
});

document.querySelector('a[href="#outdoor"]').addEventListener('click', () => {
    updateOutdoorChart();
    updateCurrentConditions('outdoor', '#outdoor-last-reading');
    updateTips('outdoor', 'outdoor-tip-message', getOutdoorTipMessage);
});

// Initial Chart and Current Condition Updates
updateIndoorChart();
updateCurrentConditions('indoor', '#indoor-last-reading');
updateTips('indoor', 'indoor-tip-message', getIndoorTipMessage);

updateOutdoorChart();
updateCurrentConditions('outdoor', '#outdoor-last-reading');
updateTips('outdoor', 'outdoor-tip-message', getOutdoorTipMessage);

// Periodic Updates Every 5 Seconds
setInterval(() => {
    updateIndoorChart();
    updateCurrentConditions('indoor', '#indoor-last-reading');
    updateTips('indoor', 'indoor-tip-message', getIndoorTipMessage);
}, 5000);

setInterval(() => {
    updateOutdoorChart();
    updateCurrentConditions('outdoor', '#outdoor-last-reading');
    updateTips('outdoor', 'outdoor-tip-message', getOutdoorTipMessage);
}, 5000);
