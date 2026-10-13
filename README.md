# Zenve Vet — The Professional Network for Veterinary Doctors

A professional networking platform designed for veterinary doctors to connect, share clinical knowledge, discuss veterinary cases, and grow their professional network.

## Project Structure

```text
zenve-vet/
├── Backend/                 # Django REST Framework APIs
│   ├── config/              # Django project configuration
│   ├── common/              # Shared backend utilities
│   ├── accounts/            # Authentication (planned)
│   ├── profiles/            # Doctor profiles (planned)
│   ├── posts/               # Feed and clinical cases (planned)
│   ├── connections/         # Doctor network (planned)
│   ├── messaging/           # Conversations and messages (planned)
│   ├── notifications/       # Notifications (planned)
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── Frontend/                # React frontend
│   ├── src/
│   │   ├── app/
│   │   ├── features/
│   │   └── shared/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

> Note: The module list describes the intended architecture. Modules marked as planned are not necessarily implemented yet.

## Technology Stack

### Frontend
- React
- JavaScript
- Vite
- React Router
- CSS

### Backend
- Python
- Django
- Django REST Framework
- JWT authentication planned
- SQLite for initial local development; PostgreSQL can be configured later

## Team Members and Responsibilities

### Frontend Team

| Developer | Module | Responsibilities |
|---|---|---|
| Ponnaarthi | Feed & Clinical Cases | Feed UI, post composer, clinical case UI, likes and comments integration |
| Muzzamil | Network & Discovery | Vet Network UI, doctor search, filters, doctor cards, dynamic doctor profile |
| Chandra Soodan | Messaging UI | Inbox, conversation list, chat window, message composer, messaging states |
| Pavitra | Shared UI | Topbar, sidebar, responsive navigation, shared application shell, active navigation states |

### Backend Team

| Developer | Module | Responsibilities |
|---|---|---|
| Soumya | Accounts & Profiles | Registration, login, current user, doctor profiles, qualifications and experience |
| Sathish | Posts & Content | Feed APIs, clinical cases, likes, comments, pagination |
| Srinath | Connections & Discovery | Doctor search, filtering, connection requests, accept/reject, connection status |
| Rohith | Messaging & Integration | Conversation APIs, message persistence, API contracts, integration, code review and backend coordination |


## Frontend-to-Backend Communication

| Frontend Owner | Backend Contact | Integration |
|---|---|---|
| Ponnaarthi | Sathish | Feed, posts, clinical cases |
| Muzzamil | Srinath and Soumya | Search, connections, doctor profiles |
| Chandra Soodan | Rohith | Conversations and messages |
| Pavitra | Rohith and Soumya | Current-user information and notification integration |

Frontend and backend developers should agree on endpoint paths, request payloads, response formats, authentication, and error handling before integration.

## Core Features

1. Doctor registration and authentication
2. Professional doctor profiles
3. Doctor discovery and search
4. Connection requests and networking
5. Community feed and clinical cases
6. Likes and comments
7. One-to-one messaging
8. Notifications
9. Short-video feed and additional professional features

Feature availability depends on implementation progress.

## Local Development Setup

### Backend

Open a terminal in the `Backend/` directory.

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows CMD:

```cmd
.venv\Scripts\activate.bat
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Create a local `.env` file based on `.env.example` and configure the required settings.

Run Django checks and migrations:

```bash
python manage.py check
python manage.py migrate
python manage.py runserver
```

Backend development server:

`http://127.0.0.1:8000/`

### Frontend

Open another terminal in `Frontend/`.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Use the local URL printed by Vite in your terminal.


Recommended workflow:

1. Pull the latest changes from the integration branch.
2. Create a feature branch.
3. Implement and test the assigned module.
4. Commit changes with a meaningful message.
5. Push the feature branch.
6. Open a pull request for review.
7. Merge after integration checks pass.

Do not commit `.env`, `.venv/`, `node_modules/`, database files, or secret credentials.

## Development Guidelines

- Keep frontend and backend responsibilities clearly separated.
- Use consistent API contracts.
- Avoid modifying shared models without coordinating with their owner.
- Validate requests and enforce permissions on the backend.
- Keep commits focused on the assigned module.
- Test features before marking them complete.
- Document API changes in `docs/api-contract.md` when available.

## Project Status

**Current phase:** Initial full-stack project setup and module development.

The frontend scaffold and Django project foundation have been committed. Individual modules and API integrations should be marked complete only after implementation and testing.

