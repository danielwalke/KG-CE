# KG-CE

**KG-CE** (**K**nowledge **G**raph **C**ontext **E**ngineering) is a framework designed to enhance Large Language Model (LLM) interactions through **Knowledge Graph guided Context Engineering**. By leveraging structured knowledge from Neo4j graphs, the system dynamically constructs, refines, and visualizes the context used for LLM generation, ensuring responses are grounded in factual relationships.

## 📂 Repository Structure

The project is structured into three main components:

* **`kgce_frontend/`**: A **Vue.js**-based web interface that allows users to interactively explore the graph, visualize context paths, and chat with the system.
* **`server/`**: A **FastAPI** (Python) backend that manages the logic for context retrieval, handles WebSocket connections for streaming responses, and processes graph data.
* **`kg_embeddings/`**: Core modules for handling **Knowledge Graph embeddings**, context retrieval algorithms, and interactions with **Ollama** and **Neo4j**.

## 🚀 Getting Started

Follow these steps to set up the environment and run the application.

### Prerequisites

* **Node.js** (v16+) & **npm**
* **Python** (v3.9+) & **pip**
* **Neo4j Database** (Running instance)
* **Ollama** (For local embedding generation)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/danielwalke/KG-CE.git
    cd KG-CE
    ```

2.  **Backend Setup**
    Navigate to the server directory and install dependencies.
    ```bash
    cd server
    pip install -r requirements.txt
    fastapi dev server/main.py
    ```

3.  **Frontend Setup**
    Navigate to the frontend directory and install dependencies.
    ```bash
    cd ../kgce_frontend
    npm install
    ```

3.  **Sart ollama**
    Just start ollama on port 11434 
    ```bash
    ollama serve
    ```

    It might make sense to increase the context window before ollama serve, e.g., in windows temporarily: 
     ```bash
     $env:OLLAMA_CONTEXT_LENGTH="8192"
     ``` 

## 🏃 Usage

You must run both the backend API and the frontend application simultaneously.

### 1. Start the Backend
From the `server/` directory:
```bash
uvicorn server.main:app --reload
```

*This starts the FastAPI server, initializes the Neo4j connection, and loads the graph schema.*

### 2. Start the Frontend
From the `kgce_frontend/` directory:

```bash
npm run dev
```

*Access the interface at `http://localhost:5173` to begin engineering context and exploring the graph.*

## 🛠 Technology Stack

* **Frontend**: Vue.js, Pinia, VueFlow, Dagre
* **Backend**: Python, FastAPI, Pydantic
* **Data & AI**: Neo4j (Graph DB), Ollama (Embeddings/LLM)

## 📄 License

This project is licensed under the **Apache-2.0 License**.

## 👥 Author

**Daniel Walke**
