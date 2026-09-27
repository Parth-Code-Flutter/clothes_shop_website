"""Shared FASHN VTON v1.5 loader used by the Gradio Space and the FastAPI server."""

import os

import torch
from huggingface_hub import hf_hub_download
from PIL import Image

WEIGHTS_DIR = os.environ.get("VTON_WEIGHTS_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "weights"))
CATEGORIES = ("tops", "bottoms", "one-pieces")
GARMENT_PHOTO_TYPES = ("model", "flat-lay")

_pipeline = None


def download_weights() -> None:
    dwpose_dir = os.path.join(WEIGHTS_DIR, "dwpose")
    os.makedirs(dwpose_dir, exist_ok=True)
    if not os.path.exists(os.path.join(WEIGHTS_DIR, "model.safetensors")):
        hf_hub_download(repo_id="fashn-ai/fashn-vton-1.5", filename="model.safetensors", local_dir=WEIGHTS_DIR)
    for filename in ("yolox_l.onnx", "dw-ll_ucoco_384.onnx"):
        if not os.path.exists(os.path.join(dwpose_dir, filename)):
            hf_hub_download(repo_id="fashn-ai/DWPose", filename=filename, local_dir=dwpose_dir)


def get_pipeline():
    """Loads the pipeline once. On ZeroGPU this must run inside a @spaces.GPU call."""
    global _pipeline
    if _pipeline is None:
        if not torch.cuda.is_available():
            raise RuntimeError("CUDA GPU not available. FASHN VTON v1.5 needs an NVIDIA GPU with about 8 GB of memory.")
        if torch.cuda.get_device_properties(0).major >= 8:
            torch.backends.cuda.matmul.allow_tf32 = True
            torch.backends.cudnn.allow_tf32 = True
        download_weights()
        from fashn_vton import TryOnPipeline

        _pipeline = TryOnPipeline(weights_dir=WEIGHTS_DIR, device="cuda")
    return _pipeline


def run_try_on(
    person_image: Image.Image,
    garment_image: Image.Image,
    category: str = "tops",
    garment_photo_type: str = "flat-lay",
    num_timesteps: int = 30,
    guidance_scale: float = 1.5,
    seed: int = 42,
    segmentation_free: bool = True,
) -> Image.Image:
    if category not in CATEGORIES:
        raise ValueError(f"category must be one of {CATEGORIES}")
    if garment_photo_type not in GARMENT_PHOTO_TYPES:
        raise ValueError(f"garment_photo_type must be one of {GARMENT_PHOTO_TYPES}")
    result = get_pipeline()(
        person_image=person_image.convert("RGB"),
        garment_image=flatten_on_white(garment_image),
        category=category,
        garment_photo_type=garment_photo_type,
        num_samples=1,
        num_timesteps=int(num_timesteps),
        guidance_scale=float(guidance_scale),
        seed=int(seed if seed is not None and seed >= 0 else 42),
        segmentation_free=bool(segmentation_free),
    )
    return result.images[0]


def flatten_on_white(image: Image.Image) -> Image.Image:
    """Transparent garment cut-outs become a clean white product shot."""
    if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
        rgba = image.convert("RGBA")
        background = Image.new("RGB", rgba.size, (255, 255, 255))
        background.paste(rgba, mask=rgba.getchannel("A"))
        return background
    return image.convert("RGB")
