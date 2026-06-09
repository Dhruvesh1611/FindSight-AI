"""
FindSight AI — Face Recognition Service
FastAPI server for face detection, encoding, and matching.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Any
import base64
import numpy as np

app = FastAPI(
    title="FindSight AI Service",
    description="Face detection, encoding, and matching API",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy imports for face_recognition and cv2
_face_recognition: Any = None
_cv2: Any = None
MOCK_MODE: bool = False


def load_dependencies() -> tuple[Any, Any]:
    """Lazy-load heavy dependencies. Returns (face_recognition, cv2)."""
    global _face_recognition, _cv2, MOCK_MODE
    if _face_recognition is None and not MOCK_MODE:
        try:
            import face_recognition as fr
            import cv2 as opencv
            _face_recognition = fr
            _cv2 = opencv
        except ImportError as e:
            print(f"\n[!] WARNING: Required packages not installed: {e}")
            print("[!] FindSight AI is falling back to MOCK MODE for the Hackathon MVP.")
            print("[!] Face detection and recognition will be simulated.\n")
            MOCK_MODE = True
    return _face_recognition, _cv2


def decode_base64_image(image_data: str) -> np.ndarray:
    """Decode a base64-encoded image to a numpy array."""
    load_dependencies()
    if MOCK_MODE:
        # Return a dummy image array in mock mode
        return np.zeros((100, 100, 3), dtype=np.uint8)

    _, cv2 = load_dependencies()

    # Remove data URL prefix if present
    if "," in image_data:
        image_data = image_data.split(",")[1]

    image_bytes = base64.b64decode(image_data)
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image data")

    # Convert BGR to RGB (face_recognition expects RGB)
    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)



# ──────────────────────────────────────────
# Request / Response Models
# ──────────────────────────────────────────


class EncodeRequest(BaseModel):
    image: str  # base64-encoded image


class EncodeResponse(BaseModel):
    encoding: Optional[list[float]] = None
    success: bool
    error: Optional[str] = None
    faces_found: int = 0


class StoredEncoding(BaseModel):
    personId: str
    personName: str
    encoding: list[float]


class MatchRequest(BaseModel):
    captured_image: str  # base64-encoded frame
    stored_encodings: list[StoredEncoding]


class MatchResponse(BaseModel):
    matched: bool
    confidence: float = 0.0
    person_id: Optional[str] = None
    person_name: Optional[str] = None
    faces_detected: int = 0
    message: Optional[str] = None


# ──────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────


@app.get("/")
async def root():
    return {
        "service": "FindSight AI Face Recognition Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "/encode": "POST - Generate face encoding from image",
            "/match": "POST - Match captured face against stored encodings",
            "/health": "GET - Health check",
        },
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "FindSight AI"}


@app.post("/encode", response_model=EncodeResponse)
async def encode_face(request: EncodeRequest):
    """
    Generate a 128-dimensional face encoding from an uploaded image.
    """
    load_dependencies()

    if MOCK_MODE:
        # Generate a mock 128-dimensional encoding (deterministic for demo purposes)
        # Using a list of floats
        mock_encoding = [0.1] * 128
        return EncodeResponse(
            encoding=mock_encoding,
            success=True,
            faces_found=1,
        )

    fr, _ = load_dependencies()

    try:
        image = decode_base64_image(request.image)

        # Detect faces
        face_locations = fr.face_locations(image, model="hog")

        if len(face_locations) == 0:
            return EncodeResponse(
                encoding=None,
                success=False,
                error="No face detected in the image. Please upload a clear, front-facing photo.",
                faces_found=0,
            )

        # Generate encoding for the first (largest) face
        face_encodings = fr.face_encodings(image, face_locations)

        if len(face_encodings) == 0:
            return EncodeResponse(
                encoding=None,
                success=False,
                error="Could not generate face encoding",
                faces_found=len(face_locations),
            )

        encoding = face_encodings[0].tolist()

        return EncodeResponse(
            encoding=encoding,
            success=True,
            faces_found=len(face_locations),
        )

    except HTTPException:
        raise
    except Exception as e:
        return EncodeResponse(
            encoding=None,
            success=False,
            error=f"Error processing image: {str(e)}",
        )


@app.post("/match", response_model=MatchResponse)
async def match_face(request: MatchRequest):
    """
    Compare a captured frame against stored face encodings.
    Returns the best match if confidence exceeds the threshold.
    """
    load_dependencies()

    if MOCK_MODE:
        # In mock mode, if there are stored encodings, match with the first one for the demo
        if len(request.stored_encodings) > 0:
            best = request.stored_encodings[0]
            return MatchResponse(
                matched=True,
                confidence=0.88,
                person_id=best.personId,
                person_name=best.personName,
                faces_detected=1,
                message=f"Match found (MOCK): {best.personName}",
            )
        return MatchResponse(
            matched=False,
            confidence=0.0,
            faces_detected=0,
            message="No stored encodings to match (MOCK)",
        )

    fr, _ = load_dependencies()

    CONFIDENCE_THRESHOLD = 0.6

    try:
        image = decode_base64_image(request.captured_image)

        # Detect faces in the captured frame
        face_locations = fr.face_locations(image, model="hog")

        if len(face_locations) == 0:
            return MatchResponse(
                matched=False,
                confidence=0.0,
                faces_detected=0,
                message="No face detected in frame",
            )

        # Generate encodings for detected faces
        captured_encodings = fr.face_encodings(image, face_locations)

        if len(captured_encodings) == 0:
            return MatchResponse(
                matched=False,
                confidence=0.0,
                faces_detected=len(face_locations),
                message="Could not encode detected faces",
            )

        best_match = None
        best_confidence = 0.0

        # Compare each detected face against all stored encodings
        for captured_encoding in captured_encodings:
            for stored in request.stored_encodings:
                stored_encoding = np.array(stored.encoding)

                # Calculate face distance (lower = more similar)
                distance = fr.face_distance(
                    [stored_encoding], captured_encoding
                )[0]

                # Convert distance to confidence (0-1 scale)
                confidence = max(0.0, 1.0 - distance)

                if confidence > best_confidence:
                    best_confidence = confidence
                    best_match = stored

        if best_match and best_confidence >= CONFIDENCE_THRESHOLD:
            return MatchResponse(
                matched=True,
                confidence=round(best_confidence, 4),
                person_id=best_match.personId,
                person_name=best_match.personName,
                faces_detected=len(face_locations),
                message=f"Match found: {best_match.personName}",
            )

        return MatchResponse(
            matched=False,
            confidence=round(best_confidence, 4),
            faces_detected=len(face_locations),
            message="No match above confidence threshold",
        )

    except HTTPException:
        raise
    except Exception as e:
        return MatchResponse(
            matched=False,
            confidence=0.0,
            message=f"Error during matching: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
