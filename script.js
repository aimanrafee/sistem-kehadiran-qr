const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwiGGORvgzwkqOchj3Nwc3l4_kVK8uN61MvymCzN_9He15QaxKFCFw57842O1c8mq1r/exec';
const statusText = document.getElementById('status');
const userDisplay = document.getElementById('user-display');
const beepSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');

// 1. Kunci Utama
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
    // Langkah 1: Jika sistem sedang memproses, abaikan imbasan baru serta-merta
    if (isProcessing) return;
    
    // Langkah 2: Kunci status proses
    isProcessing = true;

    const namaAhli = databaseKeluarga[decodedText] || "ID TIDAK DIKENALI";
    
    navigator.geolocation.getCurrentPosition(async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distance = calculateDistance(userLat, userLng, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);

        if (distance <= OFFICE_LOCATION.radius) {
            // Langkah 3: Berhenti scanner (Pause) supaya tiada imbasan kedua berlaku
            html5QrcodeScanner.pause();

            // Langkah 4: Tanda Pengesahan Beep (Indikator Utama)
            await beepSound.play(); 

            // Langkah 5: Paparan Antaramuka
            userDisplay.innerText = `PENGESAHAN: ${namaAhli}`;
            userDisplay.style.display = "block";
            statusText.innerText = "Beep disahkan. Menghantar rekod tunggal...";

            const payload = {
                id: decodedText,
                location: `${userLat.toFixed(6)}, ${userLng.toFixed(6)}`
            };

            // Langkah 6: Hantar data ke GAS (Hanya sekali selepas beep)
            await sendData(payload);

            // Langkah 7: Masa bertenang (Cooldown) 8 saat
            setTimeout(() => {
                isProcessing = false;
                userDisplay.style.display = "none";
                statusText.innerText = "Sedia untuk imbasan seterusnya...";
                html5QrcodeScanner.resume(); // Hidupkan semula scanner
            }, 8000);

        } else {
            statusText.style.color = "#ff4444";
            statusText.innerText = `LUAR KAWASAN (${Math.round(distance)}m)`;
            // Buka semula kunci selepas 3 saat jika ralat lokasi
            setTimeout(() => { isProcessing = false; }, 3000);
        }
    }, (err) => {
        statusText.innerText = "Sila aktifkan GPS.";
        isProcessing = false;
    }, { enableHighAccuracy: true });
}

async function sendData(payload) {
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        statusText.style.color = "#00ff88";
        statusText.innerText = "BERJAYA: Rekod masuk ke Google Sheets ✅";
    } catch (e) {
        statusText.innerText = "Ralat Rangkaian. Sila cuba lagi.";
        isProcessing = false;
        html5QrcodeScanner.resume();
    }
}

html5QrcodeScanner.render(onScanSuccess);
