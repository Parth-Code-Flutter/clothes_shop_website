"""Hugging Face ZeroGPU Space for House of Bollywood try-on.

The `try_on` endpoint keeps the same inputs as the official
`fashn-ai/fashn-vton-1.5` Space, so the storefront can switch between the two
by changing VTON_SPACE_ID only.
"""

import gradio as gr
import spaces
from PIL import Image

from pipeline import CATEGORIES, GARMENT_PHOTO_TYPES, run_try_on


@spaces.GPU(duration=60)
def try_on(
    person_image: Image.Image,
    garment_image: Image.Image,
    category: str,
    garment_photo_type: str,
    num_timesteps: int,
    guidance_scale: float,
    seed: int,
    segmentation_free: bool,
) -> Image.Image:
    if person_image is None or garment_image is None:
        raise gr.Error("Both a person image and a garment image are required.")
    try:
        return run_try_on(person_image, garment_image, category, garment_photo_type, num_timesteps, guidance_scale, seed, segmentation_free)
    except (RuntimeError, ValueError) as error:
        raise gr.Error(str(error)) from error


with gr.Blocks(title="House of Bollywood try-on") as demo:
    gr.Markdown("### House of Bollywood try-on service\nFASHN VTON v1.5. Used by the storefront through the API.")
    with gr.Row():
        person = gr.Image(label="Person", type="pil")
        garment = gr.Image(label="Garment", type="pil", image_mode="RGBA")
        result = gr.Image(label="Result", type="pil", interactive=False)
    with gr.Row():
        category = gr.Dropdown(list(CATEGORIES), value="tops", label="Category")
        photo_type = gr.Dropdown(list(GARMENT_PHOTO_TYPES), value="flat-lay", label="Garment photo type")
        steps = gr.Slider(10, 50, value=30, step=5, label="Sampling steps")
        guidance = gr.Slider(1.0, 3.0, value=1.5, step=0.1, label="Guidance scale")
        seed = gr.Number(value=42, precision=0, label="Seed")
        seg_free = gr.Checkbox(value=True, label="Segmentation free")
    gr.Button("Try on", variant="primary").click(
        try_on,
        inputs=[person, garment, category, photo_type, steps, guidance, seed, seg_free],
        outputs=[result],
        api_name="try_on",
    )

demo.queue(default_concurrency_limit=1, max_size=20)

if __name__ == "__main__":
    demo.launch()
