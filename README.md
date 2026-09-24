# EvidenceFlow (v0 Baseline)

**EvidenceFlow** traces business decisions through approval → purchase order → invoice → payment → to the exact code function that executed it. It flags when a policy stated in business documents does not match the threshold hardcoded in payment processing code. Every finding is backed by explicit evidence (source file path, page/line reference, and exact snippet).

---

## 🚀 Key Capabilities

- **Multi-Document Fact Ingestion**: Text-native PDF parsing with page tracking (`pdfplumber`) and `.eml`/`.txt` policy & approval extraction.
- **LLM Fact Extraction**: Anthropic Claude powered JSON schema extraction with Pydantic validation, retry logic, and deterministic disk caching (`/cache`).
- **AST & Git History Code Analysis**: Tree-sitter parsing of Python repositories to discover threshold constants and GitPython commit history tracking.
- **Idempotent Neo4j Graph Database**: Graph model tracking decisions, policies, approvals, purchase orders, invoices, payments, code functions, and commits linked via `EVIDENCED_BY` edges.
- **Policy Drift Detection**: Automatic identification of stale code where financial policy thresholds changed after the last code commit.
- **Interactive UI**: React + Cytoscape.js visualization with Dagre left-to-right layout, node color coding, warning highlights, and side-panel evidence inspection.

---

## 🛠 Project Structure

```
evidence-flow/
├── backend/
│   ├── app/
│   │   ├── config.py           # Application settings & environment configuration
│   │   ├── ingest.py           # PDF and plain text ingestion module
│   │   ├── extract.py          # LLM fact extraction & disk caching module
│   │   ├── code_analysis.py    # Tree-sitter & GitPython AST code parser
│   │   ├── graph_load.py       # Neo4j Graph loading & fallback store
│   │   ├── queries.py          # Extra line-items & policy-drift engine
│   │   ├── pipeline.py         # End-to-end pipeline runner
│   │   └── main.py             # FastAPI web application endpoints
│   └── tests/
│       ├── test_extraction.py
│       ├── test_code_analysis.py
│       ├── test_api.py
│       └── test_acceptance.py  # Comprehensive acceptance tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GraphView.jsx      # Cytoscape.js graph canvas
│   │   │   ├── EvidencePanel.jsx  # Audit & evidence inspection panel
│   │   │   └── QueryControl.jsx   # Top query action bar
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── data/                       # Synthetic demo documents (Tender, Policy, Approval, PO, Invoices)
├── sample_repo/                # Toy Python repository with Git history
├── cache/                      # Disk cache for deterministic offline runs
├── payment_mapping.json        # Payment type to code function configuration
├── docker-compose.yml          # Neo4j Community docker compose manifest
├── scripts/
│   └── generate_demo_data.py   # Synthetic data generation script
└── README.md
```

---

## ⚙️ Quickstart & Setup

### 1. Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional; fallback in-memory graph engine activates automatically if Docker/Neo4j is not running)

### 2. Backend Setup
```bash
# Create virtual environment & install dependencies
python -m venv .venv
.venv\Scripts\activate

pip install -r backend/requirements.txt
```

### 3. Generate Synthetic Demo Data & Git Repo
```bash
python scripts/generate_demo_data.py
```

### 4. Run Neo4j (Optional)
```bash
docker-compose up -d
```

### 5. Run Backend Server
```bash
$env:PYTHONPATH="backend"
uvicorn app.main:app --reload --port 8000
```
Backend API will be available at: `http://localhost:8000` (Swagger UI at `/docs`).

### 6. Run Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Running Acceptance Tests

Run all unit and integration tests covering the 5 core acceptance criteria:

```bash
$env:PYTHONPATH="backend"
.venv\Scripts\pytest backend/tests
```

---

## 🔍 API Endpoints

- `POST /ingest/run` — Triggers complete data ingestion, fact extraction, code parsing, and graph loading.
- `GET /graph` — Returns `{nodes, edges}` formatted for Cytoscape UI rendering.
- `GET /queries/extra-line-items` — Identifies unapproved invoice line items missing from the PO.
- `GET /queries/policy-drift` — Identifies threshold mismatches and flags stale code (policy changed after last commit).
- `GET /evidence/{node_id}` — Retrieves exact source file path, page/line reference, and snippet for any graph node.

---

## ⚠️ Known Limitations (v0 Baseline)

1. **Hardcoded Thresholds Only**: Code analysis currently extracts numeric assignments matching naming patterns (`LIMIT`, `THRESHOLD`, `APPROVAL`) in top-level or module constants. Dynamic database-driven or remote configuration thresholds are out of scope for v0.
2. **Config-Based Payment Mapping**: The link between payment types and code function names (`Payment` → `CodeFunction`) is defined via `payment_mapping.json`. Automatic static call-graph inference is deferred to future versions.
3. **Synthetic Demo Data**: Pre-generated synthetic PDF and email artifacts for demonstration.
4. **No OCR**: Ingestion expects text-native PDFs (generated via ReportLab) and plaintext `.eml` documents. Scanned image PDF OCR (e.g. Tesseract) is omitted in v0.
5. **No ABAP / Legacy ERP Parsing**: Code analysis supports Python repositories. ABAP, Java, or C# AST parsing will be added in subsequent phases.
