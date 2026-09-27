"""FastAPI try-on server for any NVIDIA GPU machine (Colab, Kaggle, or a rented GPU).

Start:  VTON_SHARED_SECRET=... uvicorn server:app --host 0.0.0.0 --port 8000
Call:   POST /tryon with header `X-Vton-Secret` and JSON
        {"person_image": "<data URL or base64>", "garment_image": "...", "category": "tops"}
Reply:  {"image": "data:image/jpeg;base64,..."}
"""

import base64
import hmac
import io
import os
import threading

from fastapi import FastAPI, Header, HTTPException
from PIL import Image
from pydantic import BaseModel, Field

from pipeline import get_pipeline, run_try_on

SECRET = os.environ.get("VTON_SHARED_SECRET", "")
MAX_IMAGE_CHARS = 15_000_000

app = FastAPI(title="House of Bollywood try-on")
_gpu_lock = threading.Lock()


class TryOnRequest(BaseModel):
    person_image: str = Field(max_length=MAX_IMAGE_CHARS)
    garment_image: str = Field(max_length=MAX_IMAGE_CHARS)
    category: str = "tops"
    garment_photo_type: str = "flat-lay"
    num_timesteps: int = Field(30, ge=10, le=50)
    guidance_scale: float = Field(1.5, ge=1.0, le=3.0)
    seed: int = 42


def decode_image(value: str) -> Image.Image:
    payload = value.split(",", 1)[1] if value.startswith("data:") else value
    try:
        image = Image.open(io.BytesIO(base64.b64decode(payload)))
        image.load()
        return image
    except Exception as error:
        raise HTTPException(status_code=400, detail="Invalid image data.") from error


@app.on_event("startup")
def warm_up() -> None:
    if not SECRET:
        raise RuntimeError("Set VTON_SHARED_SECRET before starting the server.")
    get_pipeline()


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/tryon")
def try_on(body: TryOnRequest, x_vton_secret: str = Header(default="")) -> dict:
    if not hmac.compare_digest(x_vton_secret, SECRET):
        raise HTTPException(status_code=401, detail="Unauthorised.")
    person = decode_image(body.person_image)
    garment = decode_image(body.garment_image)
    try:
        with _gpu_lock:
            result = run_try_on(person, garment, body.category, body.garment_photo_type, body.num_timesteps, body.guidance_scale, body.seed)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    buffer = io.BytesIO()
    result.convert("RGB").save(buffer, format="JPEG", quality=92)
    return {"image": "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode()}
