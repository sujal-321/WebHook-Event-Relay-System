# WebHook-Event-Relay-System
🚀 Webhook Event Relay System  A full-stack, production-style Webhook Event Relay System designed to reliably deliver internal system events to external client endpoints using an asynchronous, event-driven architecture.  This project simulates how modern SaaS platforms  handle webhook delivery at scale with security, retries, and observability.
✨ Features
<img width="1915" height="808" alt="Screenshot" src="https://github.com/user-attachments/assets/316010c6-8413-4a36-934b-ababfd61dc0f" />

<img width="1906" height="808" alt="Screenshot (1)" src="https://github.com/user-attachments/assets/5f12098e-0e50-4a5c-86f7-535f21efcefe" />

🔁 Asynchronous Event Delivery using Redis queues and background workers

🔐 Secure Webhook Signing with HMAC SHA-256 signatures
<img width="1876" height="895" alt="Screenshot (2)" src="https://github.com/user-attachments/assets/a86a5c69-3fdc-4600-a50d-0090d8273b1c" />

♻️ Idempotent Event Processing to prevent duplicate deliveries

🔄 Retry Logic & Fault Tolerance for failed webhook deliveries

📊 Delivery Logs & Observability stored in PostgreSQL

🧠 Redis Caching for optimized subscription lookup

🖥️ React Dashboard to manage webhooks and monitor delivery status

🌙 Dark Mode UI using Tailwind CSS and shadcn/ui

🧠 System Architecture
Internal Event
     ↓
Event Ingestion API
     ↓
PostgreSQL (Events)
     ↓
Redis Queue (BullMQ)
     ↓
Background Worker
     ↓
Webhook Delivery (HMAC Signed)
     ↓
PostgreSQL (Delivery Logs)
     ↓
React Dashboard

🛠️ Tech Stack
Backend

Node.js, Express.js

PostgreSQL

Redis + BullMQ

Docker

Axios

Frontend

React (Vite)

Tailwind CSS (v4)

shadcn/ui

Axios

📦 Database Schema (Core Tables)

events – Stores incoming system events with idempotency keys

webhook_subscriptions – Registered client webhook endpoints

delivery_logs – Delivery status, retries, and response codes

🔐 Security

Each webhook payload is signed using HMAC SHA-256

Signature is sent via X-AlgoHire-Signature header

Clients can verify payload authenticity using the shared secret

🧪 How to Run Locally
1️⃣ Start Redis (Docker)
docker run -d -p 6379:6379 --name redis redis:7

2️⃣ Start Backend
cd webhook-relay
node src/server.js

3️⃣ Start Worker
cd webhook-relay
node src/workers/delivery.worker.js

4️⃣ Start Frontend
cd webhook-dashboard
npm install
npm run dev


Frontend runs at:

http://localhost:5173


Backend runs at:

http://localhost:4000

🔗 API Endpoints
Create Event
POST /events

Register Webhook
POST /webhooks

View Delivery Logs
GET /logs

🖥️ Dashboard Screens

Webhook registration form

Delivery logs with status & retry count

System overview page

Dark mode support

🎯 What This Project Demonstrates

Event-driven system design

Asynchronous processing with queues

Real-world webhook reliability patterns

Backend–frontend integration

Debugging and infrastructure handling

📌 Future Enhancements (Optional)

Manual retry from UI

Webhook disable/enable toggle

Metrics dashboard (success rate, failures)

Authentication for admin dashboard
