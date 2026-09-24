import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "EvidenceFlow"
    DATA_DIR: str = os.getenv("EVIDENCE_DATA_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data")))
    CACHE_DIR: str = os.getenv("EVIDENCE_CACHE_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "cache")))
    REPO_DIR: str = os.getenv("EVIDENCE_REPO_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_repo")))
    PAYMENT_MAPPING_FILE: str = os.getenv("EVIDENCE_PAYMENT_MAPPING", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "payment_mapping.json")))
    
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "evidenceflow123")
    
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

settings = Settings()
