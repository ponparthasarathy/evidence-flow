import hashlib
from typing import List, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance

COLLECTION_NAME = "evidence_chunks"

class VectorStoreWrapper:
    def __init__(self):
        self.client = None
        self.in_memory_docs: List[Dict[str, Any]] = []
        self._connect()

    def _connect(self):
        try:
            client = QdrantClient(host="localhost", port=6333, timeout=2.0)
            collections = client.get_collections().collections
            if not any(c.name == COLLECTION_NAME for c in collections):
                client.create_collection(
                    collection_name=COLLECTION_NAME,
                    vectors_config=VectorParams(size=64, distance=Distance.COSINE),
                )
            self.client = client
            print("Connected to Qdrant vector store.")
        except Exception as e:
            print(f"Qdrant vector store unreachable ({e}). Using in-memory vector store fallback.")
            self.client = None

    def _text_to_vector(self, text: str) -> List[float]:
        """Simple deterministic 64-dimensional feature vector generation."""
        vec = [0.0] * 64
        words = text.lower().split()
        for w in words:
            h = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16)
            idx = h % 64
            vec[idx] += 1.0
        norm = sum(v * v for v in vec) ** 0.5
        if norm > 0:
            vec = [v / norm for v in vec]
        return vec

    def upsert_chunk(self, chunk_id: str, text: str, payload: dict):
        vector = self._text_to_vector(text)
        payload["text"] = text
        if self.client:
            try:
                # Convert string ID to int hash if needed for Qdrant point ID integer requirement
                int_id = int(hashlib.md5(chunk_id.encode('utf-8')).hexdigest()[:8], 16)
                self.client.upsert(
                    collection_name=COLLECTION_NAME,
                    points=[
                        PointStruct(
                            id=int_id,
                            vector=vector,
                            payload=payload
                        )
                    ]
                )
            except Exception as e:
                print(f"Qdrant upsert error: {e}")
        
        # Store in-memory as well
        self.in_memory_docs.append({
            "id": chunk_id,
            "vector": vector,
            "payload": payload,
            "text": text
        })

    def search_similar(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        query_vec = self._text_to_vector(query)
        results = []
        
        if self.client:
            try:
                hits = self.client.search(
                    collection_name=COLLECTION_NAME,
                    query_vector=query_vec,
                    limit=limit
                )
                for hit in hits:
                    results.append({
                        "id": str(hit.id),
                        "score": round(float(hit.score), 3),
                        "payload": hit.payload
                    })
                if results:
                    return results
            except Exception as e:
                print(f"Qdrant search error: {e}")

        # Fallback to in-memory cosine similarity
        scored = []
        for doc in self.in_memory_docs:
            d_vec = doc["vector"]
            dot_product = sum(q * d for q, d in zip(query_vec, d_vec))
            scored.append((dot_product, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        for score, doc in scored[:limit]:
            results.append({
                "id": doc["id"],
                "score": round(float(score), 3),
                "payload": doc["payload"]
            })
        return results

vector_store = VectorStoreWrapper()

def initialize_qdrant():
    pass

def upsert_document_chunk(chunk_id: str, text: str, payload: dict):
    vector_store.upsert_chunk(chunk_id, text, payload)

def search_similar(query: str, limit: int = 5):
    return vector_store.search_similar(query, limit)

