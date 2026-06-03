# 🚨 ResQLink

**ResQLink** is a full-stack emergency response platform designed to provide instant assistance during critical situations. Users can manage emergency contacts, trigger SOS alerts, share live location data, and automatically notify designated contacts through SMS-based emergency notifications.

Built with a focus on reliability, accessibility, and real-world usability, ResQLink bridges the gap between emergency situations and immediate communication.

![Status](https://img.shields.io/badge/Status-Working-brightgreen)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen)
![Express.js](https://img.shields.io/badge/Framework-Express.js-black)

---

## 🌐 Live Deployment

Experience ResQLink in action:

**🔗 Live Application:** https://resqlink-production-070f.up.railway.app/

> Note: SMS notifications depend on the configured SMS provider and available API credits.

---

## 🎥 Demo Video

[▶️ Watch Full Demo](https://youtu.be/fG26f5-OScQ)

---

## ✨ Key Features

### 🆘 Smart SOS Alert System

* One-click emergency alert activation
* Automatic SMS notification dispatch
* Real-time location sharing through Google Maps links
* Alert history tracking and logging

### 👥 Emergency Contact Management

* Add, edit, and remove emergency contacts
* Personal emergency contact network
* Dedicated contact management dashboard

### 📍 Live Location Sharing

* Captures the user's current location during an SOS event
* Generates a Google Maps link for responders
* Enables faster emergency response

### 👨‍👩‍👧 Family Safety Network

* Create private family groups
* Join using secure invite codes
* Family member synchronization
* Location sharing controls

### 🔐 User Management

* Secure authentication system
* User profile management
* Medical information storage
* Blood group and emergency details management

### 📜 Alert History

* Complete timeline of previous SOS alerts
* Timestamped emergency records
* Activity tracking and review

---

## 🚀 How the SOS System Works

```text
User Presses SOS
        ↓
User Authenticated
        ↓
Emergency Contacts Retrieved
        ↓
Current Location Captured
        ↓
SOS Message Generated
        ↓
SMS Notifications Sent
        ↓
Alert Stored in History
```

### Example SMS

```text
🚨 RESQLINK SOS ALERT

Ashwin Aggarwal needs immediate help.

Phone: +91XXXXXXXXXX

Map:
https://maps.google.com/?q=latitude,longitude
```

---

## 📱 SMS Alert Proof

<p align="center">
  <img src="Proof.jpg" alt="ResQLink SOS Alert Proof" width="280">
</p>

---

## 🛠 Tech Stack

**Frontend:** HTML5, CSS3, JavaScript, Tailwind CSS

**Backend:** Node.js, Express.js

**Database:** MongoDB, Mongoose

**APIs & Services:** Notilify SMS API, Browser Geolocation API, Google Maps Location Links

**Authentication:** Session-Based Authentication, Express Middleware

---

## 📂 Project Structure

```bash
ResQLink/
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   └── server.js
│
├── frontend/
│   ├── css/
│   ├── js/
│   └── pages/
│
├── Proof.jpg
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/ashwinagg3/ResQLink.git
cd ResQLink
```

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment Variables

Create a `.env` file inside the backend directory:

```env
NOTILIFY_API_KEY=YOUR_API_KEY
NOTILIFY_SENDER_ID=YOUR_SENDER_ID
```

### Start Server

```bash
node server.js
```

Application will run at:

```text
http://localhost:5000
```

---

## 📸 Core Functionalities

✅ User Registration & Login

✅ Emergency Contact Management

✅ Family Safety Network

✅ Live Location Tracking

✅ SOS Alert System

✅ SMS Emergency Notifications

✅ Alert History Logging

✅ Responsive Mobile Interface

---

## 🔮 Future Enhancements

* Push Notifications
* WhatsApp Emergency Alerts
* Email Fallback Notifications
* Emergency Contact Verification
* Real-Time Family Location Dashboard
* Mobile Application Version

---

## 🎯 Motivation

ResQLink was built to explore how modern web technologies can be combined with real-world emergency communication systems. The project focuses on reducing response time during emergencies by enabling users to instantly notify trusted contacts with actionable location information.

---

## 👨‍💻 Developer

**Ashwin Aggarwal**

Built as a full-stack safety and emergency response solution combining location intelligence, contact management, and automated emergency notifications.
