const SCRIPT_URL = 'URL_GOOGLE_APPS_SCRIPT_ANDA';
const statusText = document.getElementById('status');

// KONFIGURASI GEOFENCING (Contoh: Lokasi Pejabat)
const OFFICE_LOCATION = {
    lat: 3.1390, // Tukar ikut koordinat anda
    lng: 101.6869,
    radius: 100 // Radius dalam meter
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius bumi dalam meter
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

function onScanSuccess(decodedText, decodedResult) {
    // 1. Dapatkan Lokasi (Bekerja walaupun offline jika GPS aktif)
    navigator.geolocation.getCurrentPosition(async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distance = calculateDistance(userLat, userLng, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);

        if (distance <= OFFICE_LOCATION.radius) {
            statusText.innerText = `Menghantar: ${decodedText}...`;
            sendData(decodedText);
        } else {
            statusText.style.color = "#ff4444";
            statusText.innerText = "RALAT: Anda di luar kawasan!";
        }
    }, (err) => {
        statusText.innerText = "Sila aktifkan GPS peranti.";
    });
}

async function sendData(name) {
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ name: name })
        });
        statusText.style.color = "#00ff88";
        statusText.innerText = `BERJAYA: ${name}`;
    } catch (e) {
        // Simpan ke IndexedDB jika benar-benar tiada internet
        statusText.innerText = "Offline: Data disimpan dalam peranti.";
    }
}

const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);
