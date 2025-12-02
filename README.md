# KG-CE

**KG-CE** is a research framework for exploring and generating **Counterfactual Explanations on Knowledge Graphs**. This tool integrates a Python-based backend for handling knowledge graph embeddings with a Vue.js frontend for interactive visualization and analysis.

## 📂 Repository Structure

The project is organized into three main modules:

* **`kgce_frontend/`**: A **Vue.js** web application that provides the user interface for visualizing graphs and explanations.
* **`server/`**: A **Python** backend server that handles API requests, processes graph data, and communicates with the embedding models.
* **`kg_embeddings/`**: Core logic and scripts for training, loading, and managing Knowledge Graph embeddings.

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Ensure you have the following installed on your machine:
* **Node.js** (v16+ recommended) & **npm**
* **Python** (v3.8+) & **pip**
* **Git**

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/danielwalke/KG-CE.git](https://github.com/danielwalke/KG-CE.git)
    cd KG-CE
    ```

2.  **Set up the Backend:**
    Navigate to the server directory and install the required Python dependencies.
    ```bash
    cd server
    pip install -r requirements.txt
    ```

3.  **Set up the Frontend:**
    Navigate to the frontend directory and install the JavaScript dependencies.
    ```bash
    cd ../kgce_frontend
    npm install
    ```

## 🏃 Usage

To use the application, you need to run both the backend server and the frontend client simultaneously.

### 1. Start the Backend
From the `server/` directory:
```bash
python main.py
```

### 2. Start the Frontend
From the `kgce_frontend/` directory:
```bash
npm run serve
```

Open your browser and navigate to the local frontend URL (typically `http://localhost:8080`) to start using KG-CE.

## 📄 License

This project is licensed under the **Apache-2.0 License**. See the [LICENSE](LICENSE) file for more details.

## 👥 Author

**Daniel Walke**
