# Class Connect 2.0 — static, peer-to-peer, no server of your own

There is nothing to install or run. Put the files (index.html, teacher.html, admin.html, common.js, style.css) on any static HTTPS host
(GitHub Pages, Netlify, school web space) or just open them from a folder in Chrome/Edge (file:// counts as a secure context, so screen sharing works).

- Students: index.html · Teachers: teacher.html · Admin: admin.html (default password `skyblue`, change it in the page)
- The only outside piece is PeerJS's free public broker, used for the first handshake (like the original app). Screen video and messages go
  directly between computers; with no STUN/TURN configured, they stay on the local network.
- Screen sharing needs **Entire Screen** (Chrome/Edge). Previews ~560px/few fps; expanding a student switches that stream to up to 1920px.

## v2.1
- Admin can set focus / screen sharing / eyes-up / floating display for all classes and 🔒 lock them so teachers can't change them back.
- Floating display (Chrome/Edge document picture-in-picture): admin enables it, then teacher/admin turn it on per class. Eyes-up and messages show in a resizable always-on-top window that scales its text to its size. Students click once (or anywhere on the page) to open it.
- Admin closing the console pauses teachers and students with a message; it resumes automatically when the admin returns.

## v2.2
- **Present your screen** (teacher or admin): Students tab → "Share my screen" → Whole class or Selected students. Pick a window, browser tab (with tab audio) or entire screen. Students see it full-screen (they can minimize it). Admin switch: "Teachers can share their screen to students".
- **Webcams**: admin → "Webcams & recording": enable, choose who switches them on/off (teachers + admin, or admin only) and whether students may choose or must allow their camera. Switch on per class. Video goes device-to-device on the LAN only; students always see a "webcam is on" indicator.
- **Recording**: admin enables screen and/or webcam recording and picks "teachers + admin" or "admin only". The allowed person presses ⏺ Start recording, then ⏹ Stop, then **Download ZIP** or **Save to folder…** (Chrome/Edge asks which folder). A student gets their own subfolder only when both screen and webcam were recorded for them; otherwise files are `Name - screen.webm` / `Name - webcam.webm`. Recordings are held in the browser's memory until saved, so save before closing the tab (about 40-60 MB per student per hour). Students see a recording indicator.
- **Floating display (PiP)**: one-click button for admin/teacher. Browsers require a student click once before a window can open; after that it opens by itself, and Chrome can open it automatically when a student switches tabs while their camera is on.
- Phones/tablets now show "Please open this on a laptop".

## v2.3
- **Face detection** (admin switch, needs webcams on): uses face-api.js (loaded from the jsDelivr CDN, so student laptops need internet for it). If no face is seen for ~5 seconds the student gets a full-screen "Be visible to the camera" message and the same text in the floating display; teachers get an alert and the admin gets a pop-up and log entry. The status shows "Not visible to camera".
- **PNG photos**: admin chooses whether screens and/or webcams can be photographed and whether teachers+admin or admin only. Expand a student, press 📸 Photo; PNGs save to the Downloads folder of the computer you are using (screen and webcam are two files).
