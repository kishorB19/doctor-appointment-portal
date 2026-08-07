# Doctor Appointment System

**A full-stack web application for booking doctor appointments, managing schedules, writing prescriptions, and handling clinic administration.**

---

## Features

| Role | Key Capabilities |
|------|-------------------|
| **Visitors** | Search & filter doctors by specialty, view doctor profiles, book appointments. |
| **Patients** | Register / Login, manage personal profile, view booked appointments, track appointments via Tracking ID, view prescriptions & invoices. |
| **Doctors** | Manage available time slots, view patient bookings, issue digital prescriptions, view earnings & invoices. |
| **Admins** | Full administrative control: oversee doctors, patients, appointments, specialties, reviews, and transaction metrics. |

---

## Tech Stack

- **Frontend**: React.js, Redux Toolkit, Ant Design, Bootstrap, React Router, Axios
- **Backend**: Node.js, Express.js, TypeScript
- **Database & ORM**: PostgreSQL (Supabase), Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) & Google OAuth

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/KishorBirajdar/doctor-appointment-portal.git
cd Doctor-Appointment
```

### 2. Backend Setup (`api/`)

```bash
cd api
# Configure .env with your DATABASE_URL and JWT credentials
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Frontend Setup

```bash
# Return to Doctor-Appointment directory
cd ..
npm install
npm start
```

---

## Author & Contact

**Kishor Birajdar**
- **Email:** [kishor1912.b@gmail.com](mailto:kishor1912.b@gmail.com)
- **GitHub:** [KishorBirajdar](https://github.com/KishorBirajdar)
- **Location:** Kolhapur, Maharashtra, India

---

## License

This project is licensed under the MIT License.
