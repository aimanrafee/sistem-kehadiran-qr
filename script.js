const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwiGGORvgzwkqOchj3Nwc3l4_kVK8uN61MvymCzN_9He15QaxKFCFw57842O1c8mq1r/exec';
const statusText = document.getElementById('status');
const userDisplay = document.getElementById('user-display');
const beepSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');

// 1. Kunci Utama Global
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
    radius: 300 
};

// Inisialisasi Scanner
const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

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
    // LANGKAH 1: Kunci serta-merta untuk mengelakkan "Race Condition"
    if (isProcessing) return;
    isProcessing = true;

    // LANGKAH 2: Hentikan kamera serta-merta (Brek Kecemasan)
    html5QrcodeScanner.pause();

    const namaAhli = databaseKeluarga[decodedText] || "ID TIDAK DIKENALI";
    statusText.innerText = "Mengesahkan lokasi...";
    statusText.style.color = "yellow";

    navigator.geolocation.getCurrentPosition(async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distance = calculateDistance(userLat, userLng, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);

        // LANGKAH 3: Pengesahan Geofencing
        if (distance <= OFFICE_LOCATION.radius) {
            
            try {
                // LANGKAH 4: Bunyi Beep sebagai syarat wajib sebelum hantar data
                await beepSound.play(); 

                // LANGKAH 5: Kemaskini UI selepas bunyi disahkan
                userDisplay.innerText = `PENGESAHAN: ${namaAhli}`;
                userDisplay.style.display = "block";
                statusText.innerText = "Beep OK. Menghantar rekod tunggal...";
                statusText.style.color = "#00ff88";

                const payload = {
                    id: decodedText,
                    location: `${userLat.toFixed(6)}, ${userLng.toFixed(6)}`
                };

                // LANGKAH 6: Hantar data ke Google Sheets
                await sendData(payload);

            } catch (err) {
                console.error("Ralat Audio/Data:", err);
            }

            // LANGKAH 7: Masa bertenang (Cooldown) selama 10 saat
            setTimeout(() => {
                isProcessing = false;
                userDisplay.style.display = "none";
                statusText.innerText = "Sedia untuk imbasan seterusnya...";
                statusText.style.color = "white";
                html5QrcodeScanner.resume(); // Hidupkan semula kamera
            }, 10000);

        } else {
            // Jika Luar Radius
            statusText.style.color = "#ff4444";
            statusText.innerText = `GAGAL: Luar Kawasan (${Math.round(distance)}m)`;
            
            // Beri peluang imbas semula selepas 3 saat
            setTimeout(() => {
                isProcessing = false;
                html5QrcodeScanner.resume();
            }, 3000);
        }
    }, (err) => {
        statusText.innerText = "Sila aktifkan GPS.";
        isProcessing = false;
        html5QrcodeScanner.resume();
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
        statusText.innerText = "BERJAYA: Rekod masuk ke Google Sheets ✅";
    } catch (e) {
        statusText.innerText = "Ralat Rangkaian. Sila cuba lagi.";
        // Jika ralat rangkaian, buka semula kunci lebih awal
        isProcessing = false;
        html5QrcodeScanner.resume();
    }
}

// Mulakan Scanner
html5QrcodeScanner.render(onScanSuccess);
