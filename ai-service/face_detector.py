"""Face detection module using OpenCV and face_recognition."""

from __future__ import annotations

from typing import Any
import numpy as np


def _load() -> tuple[Any, Any]:
    """Lazy-load face_recognition and cv2."""
    try:
        import face_recognition
        import cv2
        return face_recognition, cv2
    except ImportError:
        raise ImportError("Install required packages: pip install face_recognition opencv-python")


def detect_faces(image: np.ndarray, model: str = "hog") -> list[tuple[int, ...]]:
    """
    Detect faces in an image.

    Args:
        image: RGB numpy array image
        model: Detection model - 'hog' (faster) or 'cnn' (more accurate)

    Returns:
        List of face location tuples (top, right, bottom, left)
    """
    fr, _ = _load()
    face_locations = fr.face_locations(image, model=model)
    return face_locations


def detect_and_draw(image: np.ndarray, model: str = "hog") -> tuple[np.ndarray, list[tuple[int, ...]]]:
    """
    Detect faces and draw bounding boxes on the image.

    Args:
        image: RGB numpy array image
        model: Detection model

    Returns:
        Tuple of (annotated image, face locations)
    """
    _, cv2 = _load()
    face_locations = detect_faces(image, model)
    annotated = image.copy()

    for top, right, bottom, left in face_locations:
        cv2.rectangle(annotated, (left, top), (right, bottom), (0, 255, 0), 2)

        # Label
        cv2.rectangle(annotated, (left, bottom - 25), (right, bottom), (0, 255, 0), cv2.FILLED)
        cv2.putText(
            annotated,
            "Face Detected",
            (left + 6, bottom - 6),
            cv2.FONT_HERSHEY_DUPLEX,
            0.5,
            (255, 255, 255),
            1,
        )

    return annotated, face_locations
