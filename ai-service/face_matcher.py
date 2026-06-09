"""Face matching module — compares face encodings for identity verification."""

from __future__ import annotations

from typing import Any, Optional
import numpy as np


def _load() -> Any:
    """Lazy-load face_recognition."""
    try:
        import face_recognition
        return face_recognition
    except ImportError:
        raise ImportError("Install required packages: pip install face_recognition")


def compare_faces(
    known_encoding: np.ndarray,
    unknown_encoding: np.ndarray,
    tolerance: float = 0.6,
) -> tuple[bool, float]:
    """
    Compare two face encodings.

    Args:
        known_encoding: The known (registered) face encoding
        unknown_encoding: The unknown (detected) face encoding
        tolerance: Distance threshold (lower = stricter)

    Returns:
        Tuple of (is_match, confidence_score)
    """
    fr = _load()
    distance = fr.face_distance([known_encoding], unknown_encoding)[0]
    confidence = max(0.0, 1.0 - distance)
    is_match = distance <= tolerance

    return is_match, round(float(confidence), 4)


def find_best_match(
    unknown_encoding: np.ndarray,
    known_encodings: list[dict[str, Any]],
    threshold: float = 0.6,
) -> Optional[dict[str, Any]]:
    """
    Find the best matching person from a list of known encodings.

    Args:
        unknown_encoding: The face encoding to match
        known_encodings: List of dicts with 'encoding', 'personId', 'personName'
        threshold: Minimum confidence threshold

    Returns:
        Best match dict with confidence, or None if no match
    """
    best_match: Optional[dict[str, Any]] = None
    best_confidence = 0.0

    for known in known_encodings:
        encoding = np.array(known["encoding"])
        _, confidence = compare_faces(encoding, unknown_encoding)

        if confidence > best_confidence:
            best_confidence = confidence
            if confidence >= (1.0 - threshold):
                best_match = {
                    "personId": known["personId"],
                    "personName": known["personName"],
                    "confidence": confidence,
                    "matched": True,
                }

    if best_match is None and best_confidence > 0:
        return {
            "matched": False,
            "confidence": best_confidence,
            "personId": None,
            "personName": None,
        }

    return best_match
