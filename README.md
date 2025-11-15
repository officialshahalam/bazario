# 🚀 Bazario - Multi-Tenant SaaS Commerce Infrastructure

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()
[![Docker](https://img.shields.io/badge/docker-containerized-blue.svg)]()

> **A production-ready SaaS platform that enables businesses to launch and scale their own digital commerce infrastructure with real-time analytics, multi-party payments, and microservices architecture.**

## 🎥 Live Demo

**Watch the complete project walkthrough:** [View Demo Video on LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7359124840928235521/)

_See Bazario in action - from backend architecture to real-time admin dashboard and API documentation._

## 🎯 Project Overview

Bazario is **not just an e-commerce platform** — it's a fully functional **SaaS-based multi-tenant commerce infrastructure** that provides businesses with the tools to create, manage, and scale their digital storefronts without writing a single line of code.

### 🏗️ Architecture Highlights

- **Multi-Domain Architecture**: Three dedicated domains serving different user types
- **Microservices Design**: 15 independent services for maximum scalability
- **Event-Driven Communication**: Real-time data flow using Apache Kafka
- **Performance Optimized**: Redis caching for lightning-fast responses
- **Production Ready**: Fully Dockerized and deployed on AWS EC2

## 🌐 Multi-Tenant Domain Structure

| Domain                                       | Purpose                       | Target Users          |
| -------------------------------------------- | ----------------------------- | --------------------- |
| `https://bazario.officialshahala.me`         | Main shopping portal          | End customers         |
| `https://seller.bazario.officialshahalam.me` | Seller dashboard & management | Vendors/Merchants     |
| `https://admin.bazario.officialshahalam.me`  | Platform administration       | System administrators |

## ⚡ Key Features

### 🏛️ **Microservices Architecture**

- **12 Express.js Backend Services**: Authentication, Orders, Payments, Products, Users, Analytics, and more
- **3 Next.js Frontend Applications**: Optimized user experiences for each domain
- **Nx Monorepo**: Unified codebase management with shared libraries and consistent tooling

### 📊 **Real-Time Analytics Engine**

- User activity tracking with **Apache Kafka**
- Live behavioral analytics pipeline
- Event-driven architecture for scalable data processing

### 💰 **Advanced Payment Infrastructure**

- **Stripe Connect** integration for marketplace payments
- Multi-party payment splitting (sellers + platform commission)
- Secure transaction handling with automated reconciliation

### 💬 **Integrated Communication System**

- Real-time chat between users and sellers
- Message queuing with Kafka for reliable delivery

### 🎛️ **Smart Admin Dashboard**

- Real-time revenue analytics and trends
- Global user/seller distribution mapping
- Device usage monitoring and insights
- Live transaction status tracking with color-coded indicators
- Comprehensive platform health monitoring

### 📚 **Developer Experience**

- **Swagger UI**: Interactive API documentation
- RESTful API design with standardized responses
- Comprehensive endpoint testing and validation

### ⚡ **Performance & Scalability**

- **Redis Caching**: Optimized data access for frequent queries
- **Docker Containerization**: Consistent deployment across environments
- **AWS EC2 Deployment**: Scalable cloud infrastructure

## 🛠️ Technology Stack

### **Backend**

- **Node.js** with **Express.js** (12 microservices)
- **Apache Kafka** for event streaming
- **Redis** for caching and session management
- **PostgreSQL/MongoDB** for data persistence
- **Swagger** for API documentation

### **Frontend**

- **Next.js** (3 applications)
- **React** with modern hooks and context
- **Tailwind CSS** for responsive design
- **TypeScript** for type safety

### **DevOps & Infrastructure**

- **Docker** for containerization
- **Nx** for monorepo management
- **AWS EC2** for deployment
- **Stripe Connect** for payments

## 🔧 API Documentation

Access the interactive Swagger documentation for each microservice:

- **Authentication endpoints**: [https://api.bazario.officialshahalam.me/auth/](https://api.bazario.officialshahalam.me/auth/)
- **Admin endpoints**: [https://api.bazario.officialshahalam.me/admin/](https://api.bazario.officialshahalam.me/admin/)
- **Seller endpoints**: [https://api.bazario.officialshahalam.me/seller/](https://api.bazario.officialshahalam.me/seller/)
- **User endpoints**: [https://api.bazario.officialshahalam.me/user/](https://api.bazario.officialshahalam.me/user/)
- **Product endpoints**: [https://api.bazario.officialshahalam.me/product/](https://api.bazario.officialshahalam.me/product/)
- **Order endpoints**: [https://api.bazario.officialshahalam.me/order/](https://api.bazario.officialshahalam.me/order/)
- **Notification endpoints**: [https://api.bazario.officialshahalam.me/notification/](https://api.bazario.officialshahalam.me/notification/)
- **Chatting endpoints**: [https://api.bazario.officialshahalam.me/chatting/](https://api.bazario.officialshahalam.me/chatting/)
- **Logger endpoints**: [https://api.bazario.officialshahalam.me/logger/](https://api.bazario.officialshahalam.me/logger/)

Each documentation provides interactive API testing, request/response examples, authentication requirements, error handling, and parameter validation.

## 📞 Contact

**Shahalam** - Full Stack Developer  
📧 Email: officialshahalam855@gmail.com
💼 LinkedIn: [linkedin.com/in/yourprofile](https://www.linkedin.com/in/mohdshahalam855/)  
🐙 GitHub: [github.com/yourusername](https://github.com/officialshahalam)

---

**⭐ If this project interests you or demonstrates the kind of scalable architecture you're looking for, I'd love to discuss it further!**
