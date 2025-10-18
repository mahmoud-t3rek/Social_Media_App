# SocialNode (Backend)

A **social media backend** built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**, providing both **GraphQL** and **REST APIs**.  
This project is under active development and aims to deliver a real-time social media experience similar to Facebook — including posts, likes, comments, and chat — powered by **Socket.io**.

---

## 🚀 Features

- 🔐 **Authentication & Authorization** using JWT and Zod validation  
- 🧑‍🤝‍🧑 **User Management** (create, get all, get single user)  
- 📝 **Post System** (create, get, like/unlike, comment, reply)  
- ⚡ **Real-time updates** using Socket.io  
- ☁️ **Image upload** to AWS S3  
- 🧾 **GraphQL & REST API support**  
- 📧 **OTP email verification**  
- 🧰 **Global error handling** and rate limiting (Helmet, Express Rate Limit)

---

## 🧱 Tech Stack

| Technology | Purpose |
|-------------|----------|
| **Node.js / Express** | Backend server |
| **TypeScript** | Type-safe development |
| **MongoDB / Mongoose** | Database and ORM |
| **GraphQL** | API queries and mutations |
| **Socket.io** | Real-time communication |
| **AWS S3** | File uploads |
| **JWT** | Authentication |
| **Zod** | Input validation |
| **Nodemailer** | Send OTP via email |
| **Helmet + RateLimiter** | Security middleware |

---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/mahmoud-t3rek/Social_Media_App
cd socialnode

# Install dependencies
npm install

# Start the server
npm start
