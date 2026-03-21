<div align="center">
  <img src="./frontend/public/avatar.png" alt="NEXUS AI Logo" width="120" />
  <h1>NEXUS AI: Clinical Engine</h1>
  <p><strong>An advanced, RAG-powered AI assistant built specifically for medical students.</strong></p>
</div>

<p align="center">
  <a href="#about-the-project">About</a> •
  <a href="#key-features">Features</a> •
  <a href="#technology-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#contributing--sponsorship">Contribute & Sponsor</a>
</p>

---

## 🩺 About the Project

**NEXUS AI** (internally known as MB_ASSISTANT) is a specialized AI consultation engine designed to help medical students revise, analyze clinical cases, and augment their studies. 

> **Current Focus:** The platform's Retrieval-Augmented Generation (RAG) knowledge base is currently heavily focused on **Obstetrics and Gynaecology (O&G)** and **Paediatrics**. We aim to continuously expand this database to cover the full spectrum of medical specialties in the future.

The application serves as a clinical co-pilot, featuring an incredibly fast FastAPI backend, a sleek React frontend, and conversational memory powered by LangGraph to maintain context across patient cases.

## ✨ Key Features

- **Context-Aware Medical AI:** Powered by LangGraph agents and Groq inference to maintain deep conversational context during complex case discussions.
- **RAG Architecture:** Uses Pinecone and local HuggingFace embeddings (`BAAI/bge-large-en-v1.5`) to retrieve highly accurate medical literature and disease profiles.
- **Sleek Clinical UI:** A beautiful, responsive React dashboard featuring real-time markdown streaming, consultation history search, and a dark-mode inspired glassmorphism aesthetic.
- **Consultation Management:** Automatically saves chat sessions to a PostgreSQL database. Users can rename, delete, search, and manage concurrent consultation threads.
- **Share & Export:** Instantly generate shareable, read-only links for consultations to share with peers or professors, and export discussions directly to PDF.
- **Authentication:** Secure user authentication supporting both standard login and external providers.

## 🛠 Technology Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL with SQLModel / SQLAlchemy (Async)
- **AI & RAG:** LangChain, LangGraph, Groq API
- **Embeddings:** HuggingFace `sentence-transformers`
- **Vector DB:** Pinecone
- **Package Manager:** `uv`

### Frontend
- **Framework:** React + Vite
- **Styling:** TailwindCSS
- **Markdown:** `react-markdown`, `remark-gfm`

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.10+ and `uv` package manager
- Docker & Docker Compose (optional, but recommended)
- API Keys: Pinecone, Groq, (and optionally HuggingFace)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/nexus-ai-clinical-engine.git
cd nexus-ai-clinical-engine
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file based on `.env.example` and fill in your keys:
   ```env
   DATABASE_URL="postgresql+asyncpg://user:password@localhost:5432/nexus_db"
   GROQ_API_KEY="your-groq-api-key"
   PINECONE_API_KEY="your-pinecone-api-key"
   PINECONE_INDEX_NAME="nexus-medical-index"
   SECRET_KEY="your-secure-secret-key"
   ```
3. Install dependencies and run the server:
   ```bash
   uv venv
   uv pip install -e .
   uv run uvicorn main:app --reload --reload-dir src
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 4. Docker (Alternative)
You can build and spin up the entire backend and database stack using Docker:
```bash
cd backend
docker compose up --build
```

---

## 🤝 Contributing & Sponsorship

NEXUS AI is an ambitious project aiming to democratize access to high-quality clinical revision tools for medical students worldwide. 

**We welcome all contributions!** Whether you are:
- A developer looking to improve the React frontend or optimize the FastAPI/LangGraph backend.
- A medical student/professional willing to carefully curate and format high-yield O&G and Paediatrics data for our vector database.

**💖 Sponsorship & Compute Resources**
As the user base and the underlying medical database grow, so do the costs of cloud hosting and AI inference. 
We are actively seeking sponsorships or grants for:
- **Cloud Compute & Hosting** (e.g., AWS, Railway, Vercel)
- **LLM Inferencing Credits** (Specifically **Groq** for their model speeds)
- **Pinecone / Vector Database scaling**

If you'd like to collaborate, sponsor the project, or donate cloud credits, please reach out directly at [EMAIL_ADDRESS](olayiwolatheophilusayomide@gmail.com) or [LinkedIn](https://www.linkedin.com/in/theophilus-olayiwola-ab914a231/)!

---
*Disclaimer: NEXUS AI is an educational tool designed for medical students. It is NOT a substitute for professional medical advice, diagnosis, or treatment always verify clinical decisions.*
