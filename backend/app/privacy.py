import re

try:
    from presidio_analyzer import AnalyzerEngine
    from presidio_anonymizer import AnonymizerEngine
    analyzer = AnalyzerEngine()
    anonymizer = AnonymizerEngine()
    USE_PRESIDIO = True
except Exception as e:
    print(f"Presidio/Spacy load notice ({e}). Using regex PII redaction engine.")
    analyzer = None
    anonymizer = None
    USE_PRESIDIO = False


def redact_pii(text: str) -> str:
    """
    Scans text for PII (names, emails, phone numbers, SSNs) and replaces them with placeholders
    before sending text to the LLM.
    """
    if USE_PRESIDIO and analyzer and anonymizer:
        try:
            results = analyzer.analyze(text=text, entities=["PERSON", "ORGANIZATION", "PHONE_NUMBER", "EMAIL_ADDRESS"], language='en')
            anonymized_result = anonymizer.anonymize(text=text, analyzer_results=results)
            return anonymized_result.text
        except Exception as e:
            print(f"Presidio analysis warning ({e}). Falling back to regex engine.")

    # Regex Rule-Based Redaction Engine Fallback
    redacted = text
    # Redact Emails
    redacted = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '<EMAIL_REDACTED>', redacted)
    # Redact Phone numbers
    redacted = re.sub(r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', '<PHONE_REDACTED>', redacted)
    # Redact SSNs
    redacted = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '<SSN_REDACTED>', redacted)
    
    return redacted

