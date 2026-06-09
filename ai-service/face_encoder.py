"""Face encoding module — generates 128-dimensional face embeddings."""

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


def encode_face(
    image: np.ndarray,
    face_locations: Optional[list[tuple[int, ...]]] = None,
) -> list[np.ndarray]:
    """
    Generate 128-dimensional face encodings.

    Args:
        image: RGB numpy array image
        face_locations: Optional pre-computed face locations

    Returns:
        List of face encoding numpy arrays
    """
    fr = _load()

    if face_locations is None:
        face_locations = fr.face_locations(image, model="hog")

    if len(face_locations) == 0:
        return []

    encodings = fr.face_encodings(image, face_locations)
    return encodings


def encode_single_face(image: np.ndarray) -> Optional[np.ndarray]:
    """
    Generate encoding for a single face (the most prominent one).

    Args:
        image: RGB numpy array image

    Returns:
        128-dimensional encoding or None if no face found
    """
    encodings = encode_face(image)

    if len(encodings) == 0:
        return None

    return encodings[0]
