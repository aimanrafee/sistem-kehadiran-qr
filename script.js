const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwiGGORvgzwkqOchj3Nwc3l4_kVK8uN61MvymCzN_9He15QaxKFCFw57842O1c8mq1r/exec';
const statusText = document.getElementById('status');
const userDisplay = document.getElementById('user-display');
const beepSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');

// 1. Kunci Sistem (Untuk menghalang data bertindih yang terlalu laju)
let isProcessing = false;

const databaseKeluarga = {
    "QRKELUARGA0001": "MOHAMAD RAFEE BIN WAGIMIN",
    "QRKELUARGA0002": "DAHLIA BINTI DALI",
    "QRKELUARGA0003": "MUHAMMAD AIMAN BIN MOHAMAD RAFEE",
    "QRKELUARGA0004": "MUHAMMAD HARITH BIN MOHAMAD RAFEE"
};

const OFFICE_LOCATION = {
    lat: 2.795175, 
    lng: 101.502714,
    radius: 250 
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

async function onScanSuccess(decodedText) {
    // 2. Jika sedang memproses, abaikan semua imbasan baru (Anti-Spam)
    if (isProcessing) return;

    const namaAhli = databaseKeluarga[decodedText] || "ID TIDAK DIKENALI";
    statusText.innerText = "Menyemak lokasi...";

    navigator.geolocation.getCurrentPosition(async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distance = calculateDistance(userLat, userLng, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);

        if (distance <= OFFICE_LOCATION.radius) {
            // 3. Kunci sistem serta-merta
            isProcessing = true;

            beepSound.play().catch(e => console.log("Audio disekat:", e));

            userDisplay.innerText = `SELAMAT DATANG: ${namaAhli}`;
            userDisplay.style.display = "block";
            statusText.innerText = `Berjaya! Rekod dihantar...`;
            
            const payload = {
                id: decodedText,
                location: `${userLat.toFixed(6)}, ${userLng.toFixed(6)}`
            };
            
            await sendData(payload);

            // 4. Masa bertenang selama 10 saat sebelum boleh imbas semula
            setTimeout(() => {
                isProcessing = false;
                userDisplay.style.display = "none";
                statusText.innerText = "Sedia untuk imbasan seterusnya...";
                statusText.style.color = "white";
            }, 10000); 

        } else {
            statusText.style.color = "#ff4444";
            statusText.innerText = `LUAR KAWASAN (${Math.round(distance)}m dari pusat)`;
            isProcessing = false; 
        }
    }, (err) => {
        statusText.innerText = "Sila aktifkan GPS.";
        isProcessing = false;
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
        statusText.innerText = `REKOD DISIMPAN!`;
    } catch (e) {
        statusText.innerText = "Ralat Rangkaian.";
        isProcessing = false;
    }
}

const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);
