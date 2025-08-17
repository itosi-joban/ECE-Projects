// Function to generate tips for Indoor conditions
function getIndoorTipMessage(heatIndex, airQuality) {
    const tips = [];

    // Heat Index Tips (High and Low)
    if (heatIndex >= 45) {
        tips.push("🔥 Napakataas ng heat index! Delikado ang init. Panatilihin ang bentilasyon, gumamit ng air conditioning o electric fan, at siguraduhing hydrated.");
    } else if (heatIndex >= 38) {
        tips.push("☀️ Mataas ang heat index. Panatilihing maaliwalas ang paligid. Uminom ng tubig at magpahinga kung kinakailangan.");
    } else if (heatIndex < 27) {
        tips.push("❄️ Malamig sa pakiramdam. Gumamit ng jacket, kumot, o magpainit upang manatiling komportable.");
    } else {
        tips.push("✅ Ang heat index ay nasa komportableng antas. Panatilihing presko ang paligid.");
    }

    // Air Quality Tips
    if (airQuality > 1000) {
        tips.push("🚨 Hindi maganda ang kalidad ng hangin! Panatilihing sarado ang mga bintana at gumamit ng air purifier kung kaya.");
    } else if (airQuality > 200) {
        tips.push("⚠️ Moderate ang kalidad ng hangin. Kung sensitibo sa polusyon, gumamit ng mask.");
    } else {
        tips.push("✅ Maganda ang kalidad ng hangin! Tangkilikin ang sariwang hangin.");
    }

    return `<ul>${tips.map(tip => `<li>${tip}</li>`).join("")}</ul>`;
}

// Function to generate tips for Outdoor conditions
function getOutdoorTipMessage(heatIndex, airQuality) {
    const tips = [];

    // Heat Index Tips (High and Low)
    if (heatIndex >= 50) {
        tips.push("🚨 Napakataas ng heat index! Iwasan ang outdoor activities kung hindi kinakailangan. Magdala ng tubig at manatili sa lilim.");
    } else if (heatIndex >= 42) {
        tips.push("🔥 Mataas ang heat index! Magdala ng tubig, gumamit ng sunscreen, at iwasan ang strenuous activities sa labas.");
    } else if (heatIndex >= 35) {
        tips.push("☀️ Mainit sa pakiramdam. Gumamit ng proteksyon laban sa init tulad ng sumbrero at sunscreen.");
    } else if (heatIndex < 27) {
        tips.push("❄️ Malamig sa labas! Magsuot ng makapal na damit at magdala ng jacket para protektahan mula sa lamig.");
    } else {
        tips.push("✅ Ang heat index ay nasa ligtas na antas. Magandang mamasyal sa labas.");
    }

    // Air Quality Tips
    if (airQuality > 150) {
        tips.push("🚨 Hindi ligtas ang kalidad ng hangin! Magsuot ng mask at limitahan ang outdoor activities.");
    } else if (airQuality > 100) {
        tips.push("⚠️ Moderate ang kalidad ng hangin. Mag-ingat kung sensitibo ka sa polusyon.");
    } else {
        tips.push("✅ Maganda ang kalidad ng hangin! Masarap maglakad-lakad sa labas.");
    }

    return `<ul>${tips.map(tip => `<li>${tip}</li>`).join("")}</ul>`;
}

// Update the tips dynamically
function updateIndoorTips() {
    fetch(`?fetch=indoor`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const latest = data[0];
                const message = getIndoorTipMessage(
                    latest.heat_index,
                    latest.air_quality
                );
                document.getElementById('indoor-tip-message').innerHTML = message;
            } else {
                document.getElementById('indoor-tip-message').innerHTML = "Walang available na datos sa ngayon.";
            }
        })
        .catch(err => {
            console.error("Error updating Indoor tips:", err);
            document.getElementById('indoor-tip-message').innerHTML = "Nagkaroon ng error sa pagkuha ng datos.";
        });
}

function updateOutdoorTips() {
    fetch(`?fetch=outdoor`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const latest = data[0];
                const message = getOutdoorTipMessage(
                    latest.heat_index,
                    latest.air_quality
                );
                document.getElementById('outdoor-tip-message').innerHTML = message;
            } else {
                document.getElementById('outdoor-tip-message').innerHTML = "Walang available na datos sa ngayon.";
            }
        })
        .catch(err => {
            console.error("Error updating Outdoor tips:", err);
            document.getElementById('outdoor-tip-message').innerHTML = "Nagkaroon ng error sa pagkuha ng datos.";
        });
}

// Periodically update tips
setInterval(() => {
    updateIndoorTips();
    updateOutdoorTips();
}, 5000);
