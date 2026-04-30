# Skincare API Project Context
- **Role:** Expert Full-Stack Developer (Chalice/React specialist)
- **Primary Tech:** Python 3.14 (Chalice), React (Front-end), Tailwind CSS
- **Environment:** macOS (M-series MacBook Pro), Homebrew, `.venv` at root
- **User Tone:** Technical, precise, and concise, friendly if possible.

## Architecture Guidelines
- **Backend:** AWS Chalice used to deploy backend as an AWS Lambda function which sets up an Amazon API Gateway to handle requests to and from a PostgreSQL database via SQLAlchemy.
- **Frontend:** React with functional components.
- **User Management:** AWS Cognito.
- **Core Domain:** Skincare product management, ingredient analysis, and vendor reporting.

## Coding Standards
- **Python:** Use strict type hints. Keep functions modular and under 50 lines.
- **React:** Use `shadcn/ui` components and Tailwind CSS for styling. No hard-coded colors.
Components should be reusable and modular.
CSS Should live in css modules.
- **Naming:** Follow PEP8 for Python and camelCase for React.

## Operational Commands
- **Install:** `pip install -r requirements.txt` (Backend) | `npm install` (Frontend)
- **Local Dev:** `chalice local` | `npm run dev`
- **Test:** `pytest` (Backend) | `npm test` (Frontend)

## Boundaries & Constraints
- **Ask First:** Before adding new heavy dependencies or deleting core database schemas.
- **Never Do:** Never commit `.env` files or AWS credentials.
- **Vendor Data:** Do not confuse Target BPD with Greenfield visualization data