# 🚀 Smart QR Attendance 2050 (Keluarga Rafee)

Sistem kehadiran berasaskan Web (PWA) yang menggunakan algoritma **Smartest 2050**. Sistem ini menggabungkan teknologi imbasan QR, Geofencing, dan fungsi Offline sepenuhnya untuk merekod kehadiran keluarga ke Google Sheets secara automatik.

## 🌟 Ciri-Ciri Utama
- **📍 Smart Geofencing**: Hanya membenarkan imbasan dalam radius 250 meter dari koordinat rumah (Sepang).
- **📶 Offline Capabilities**: Menggunakan Service Worker (PWA) supaya sistem tetap boleh dibuka tanpa internet.
- **🔊 Audio Feedback**: Bunyi "beep" nyaring sebagai pengesahan imbasan berjaya.
- **🛡️ Data Privacy**: Kod QR hanya menyimpan ID unik. Maklumat peribadi (Nama & IC) disimpan selamat dalam Google Sheets Database.
- **📊 Auto-Logging**: Data dihantar secara *real-time* ke Google Sheets menggunakan Google Apps Script (GAS).

---

## 🛠️ Arkitektur Sistem
1. **Frontend**: HTML5, CSS3 (Neon Style), dan JavaScript.
2. **Library**: [html5-qrcode](https://github.com/mebjas/html5-qrcode) untuk imbasan kamera yang pantas.
3. **Backend**: Google Apps Script (GAS) dengan fungsi `LockService` untuk mengelakkan ralat data bertindih.
4. **Hosting**: GitHub Pages.

---

## 📂 Struktur Fail
- `index.html`: Antaramuka scanner utama.
- `script.js`: Logik algoritma, geofencing, dan penghantaran data.
- `sw.js`: Pengurusan cache untuk fungsi offline (Versi v3).
- `manifest.json`: Fail konfigurasi untuk pemasangan aplikasi di telefon (PWA).
- `generator.html`: Alat untuk menjana kod QR unik ahli keluarga.

---

## 🚀 Cara Pemasangan (Setup)

### 1. Google Sheets & GAS
1. Cipta Google Sheets dengan dua tab: `Database` dan `Kehadiran`.
2. Masukkan maklumat keluarga (ID, Nama, IC) dalam tab `Database`.
3. Buka **Extensions > Apps Script** dan masukkan kod `doPost`.
4. Deploy sebagai **Web App** dan tetapkan akses kepada **"Anyone"**.
5. Salin URL Deployment dan masukkan ke dalam `script.js` pada pemalar `SCRIPT_URL`.

### 2. GitHub Pages
1. Muat naik semua fail ke repository GitHub anda.
2. Pergi ke **Settings > Pages** dan aktifkan GitHub Pages pada branch `main`.
3. Buka URL yang diberikan di telefon anda.

### 3. Pemasangan di Telefon (PWA)
1. Buka laman web tersebut di pelayar Chrome (Android) atau Safari (iOS).
2. Tekan butang menu dan pilih **"Add to Home Screen"**.
3. Aplikasi kini sedia digunakan terus dari skrin utama telefon.

---

## 👨‍👩‍👧‍👦 Senarai ID Keluarga
| ID | Nama Ahli |
| :--- | :--- |
| `QRKELUARGA0001` | MOHAMAD RAFEE BIN WAGIMIN |
| `QRKELUARGA0002` | DAHLIA BINTI DALI |
| `QRKELUARGA0003` | MUHAMMAD AIMAN BIN MOHAMAD RAFEE |
| `QRKELUARGA0004` | MUHAMMAD HARITH BIN MOHAMAD RAFEE |

---

## 📝 Lesen
Projek ini dibangunkan untuk kegunaan peribadi keluarga Mohamad Rafee di bawah visi **Smartest Algorithm 2050**.

---
*Dibangunkan dengan ❤️ menggunakan AI Gemini.*
