const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwiGGORvgzwkqOchj3Nwc3l4_kVK8uN61MvymCzN_9He15QaxKFCFw57842O1c8mq1r/exec';
const statusText = document.getElementById('status');
const userDisplay = document.getElementById('user-display');

// Data Rujukan Keluarga (Mapping ID ke Nama Penuh)
const databaseKeluarga = {
    "QRKELUARGA0001": "MOHAMAD RAFEE BIN WAGIMIN",
    "QRKELUARGA0002": "DAHLIA BINTI DALI",
    "QRKELUARGA0003": "MUHAMMAD AIMAN BIN MOHAMAD RAFEE",
    "QRKELUARGA0004": "MUHAMMAD HARITH BIN MOHAMAD RAFEE"
};

// KONFIGURASI GEOFENCING
const OFFICE_LOCATION = {
    lat: 2.795175, 
    lng: 101.502714,
    radius: 100 // Radius 100 meter
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function onScanSuccess(decodedText) {
    // 1. Dapatkan nama dari database tempatan berdasarkan ID QR
    const namaAhli = databaseKeluarga[decodedText] || "ID TIDAK DIKENALI";
    
    statusText.innerText = "Menyemak lokasi...";
    statusText.style.color = "white";
    userDisplay.style.display = "none"; // Reset paparan nama

    navigator.geolocation.getCurrentPosition(async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distance = calculateDistance(userLat, userLng, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);

        if (distance <= OFFICE_LOCATION.radius) {
            // 2. Paparkan Nama Ahli Keluarga pada UI
            userDisplay.innerText = `SELAMAT DATANG: ${namaAhli}`;
            userDisplay.style.display = "block";
            statusText.innerText = `ID dikesan. Menghantar...`;
            
            const payload = {
                id: decodedText,
                location: `${userLat.toFixed(6)}, ${userLng.toFixed(6)}`
            };
            
            sendData(payload);
        } else {
            statusText.style.color = "#ff4444";
            statusText.innerText = `LUAR KAWASAN (${Math.round(distance)}m dari pusat)`;
            
            setTimeout(() => { 
                statusText.style.color = "white"; 
                statusText.innerText = "Sedia untuk imbasan..."; 
            }, 4000);
        }
    }, (err) => {
        statusText.innerText = "Sila aktifkan GPS (High Accuracy) pada peranti.";
    }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
}

async function sendData(payload) {
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        statusText.style.color = "#00ff88";
        statusText.innerText = `BERJAYA: Rekod Disimpan!`;
        
        setTimeout(() => {
            statusText.style.color = "white";
            statusText.innerText = "Sedia untuk imbasan seterusnya...";
            userDisplay.style.display = "none";
        }, 5000);
    } catch (e) {
        statusText.innerText = "Ralat Rangkaian. Data tidak dihantar.";
    }
}

const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);
