# Bitespeed Identity Reconciliation API

A backend service that performs identity reconciliation by linking multiple contact records belonging to the same customer based on shared email or phone number.

This project was built as part of the Bitespeed Backend Task.

---

## -- Live API

**Base URL:**
https://bitespeed-backend-assessment-04gf.onrender.com

**Identify Endpoint:**
POST https://bitespeed-backend-assessment-04gf.onrender.com/identify

---

##  Tech Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- Hosted on Render

---

##  Problem Overview

Customers may place orders using:
- Different email addresses
- Different phone numbers
- Or combinations of both

The goal is to:
- Link related contacts
- Maintain one primary contact
- Convert newer linked records into secondary contacts
- Return consolidated identity data

---

##  Database Schema

```ts
Contact {
  id              Int
  phoneNumber     String?
  email           String?
  linkedId        Int?
  linkPrecedence  "primary" | "secondary"
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
}