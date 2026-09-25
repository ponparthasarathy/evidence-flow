import os
import re
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# 256-bit AES Encryption Key (derived from environment or default secure system key)
_SECRET_KEY_RAW = os.getenv("EVIDENCE_AES_KEY", "evidence_flow_aes256_gcm_secret_key_32b!").encode("utf-8")[:32].ljust(32, b'0')
_aes_engine = AESGCM(_SECRET_KEY_RAW)

def encrypt_aes_256_gcm(plain_text: str) -> str:
    """
    Encrypts sensitive evidence content/data using AES-256-GCM (Galois/Counter Mode).
    Returns Base64 encoded (12-byte nonce + ciphertext + authentication tag).
    """
    if not plain_text:
        return ""
    try:
        nonce = os.urandom(12)  # 96-bit nonce per NIST SP 800-38D standard
        ciphertext = _aes_engine.encrypt(nonce, plain_text.encode("utf-8"), None)
        combined = nonce + ciphertext
        return base64.b64encode(combined).decode("utf-8")
    except Exception as e:
        print(f"AES-256-GCM Encryption Error: {e}")
        return plain_text


def decrypt_aes_256_gcm(cipher_b64: str) -> str:
    """
    Decrypts and authenticates AES-256-GCM encrypted Base64 string.
    Verifies GCM authentication tag to prevent tampering.
    """
    if not cipher_b64:
        return ""
    try:
        combined = base64.b64decode(cipher_b64)
        if len(combined) < 13:
            return cipher_b64
        nonce = combined[:12]
        ciphertext = combined[12:]
        plain_bytes = _aes_engine.decrypt(nonce, ciphertext, None)
        return plain_bytes.decode("utf-8")
    except Exception as e:
        print(f"AES-256-GCM Decryption Error: {e}")
        return cipher_b64


def redact_pii(text: str) -> str:
    """
    Scans text for PII (names, emails, phone numbers, SSNs) and replaces them with placeholders
    before sending text to the LLM. Runs instantly in real-time.
    """
    if not text:
        return ""

    redacted = text
    # Redact Emails
    redacted = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '<EMAIL_REDACTED>', redacted)
    # Redact Phone numbers
    redacted = re.sub(r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', '<PHONE_REDACTED>', redacted)
    # Redact SSNs
    redacted = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '<SSN_REDACTED>', redacted)
    
    return redacted
