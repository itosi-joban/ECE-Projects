// Indoor Chart
const indoorChart = new Chart(document.getElementById('indoorChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [], // Will be dynamically updated
        datasets: [
            {
                label: 'Temperature (°C)',
                data: [],
                borderColor: 'blue',
                fill: false,
            },
            {
                label: 'Humidity (%)',
                data: [],
                borderColor: 'green',
                fill: false,
            },
            {
                label: 'Air Quality Index (AQI)',
                data: [],
                borderColor: 'red',
                fill: false,
            },
            {
                label: 'Heat Index (°C)',
                data: [],
                borderColor: 'orange',
                fill: false,
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'category', // Use category for formatted labels
                ticks: {
                    callback: function(value, index, values) {
                        // Format labels for display
                        const date = new Date(this.getLabelForValue(value));
                        return date.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                        });
                    },
                    autoSkip: true,
                    maxTicksLimit: 5, // Adjust for readability
                },
            },
            y: {
                beginAtZero: true,
            },
        },
    },
});

// Outdoor Chart
const outdoorChart = new Chart(document.getElementById('outdoorChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [], // Will be dynamically updated
        datasets: [
            {
                label: 'Temperature (°C)',
                data: [],
                borderColor: 'blue',
                fill: false,
            },
            {
                label: 'Humidity (%)',
                data: [],
                borderColor: 'green',
                fill: false,
            },
            {
                label: 'Air Quality Index (AQI)',
                data: [],
                borderColor: 'red',
                fill: false,
            },
            {
                label: 'Heat Index (°C)',
                data: [],
                borderColor: 'orange',
                fill: false,
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'category',
                ticks: {
                    callback: function(value, index, values) {
                        const date = new Date(this.getLabelForValue(value));
                        return date.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                        });
                    },
                    autoSkip: true,
                    maxTicksLimit: 5,
                },
            },
            y: {
                beginAtZero: true,
            },
        },
    },
});
