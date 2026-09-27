"use client";

import Image from "next/image";
import { Camera, Check, Download, ImagePlus, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAllProducts, getProductBySlug } from "@/features/catalog/data";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

const EVENT = "hob:try-on";
type Step = "intro" | "camera" | "person" | "generating" | "result";

export function openVirtualTryOn(product: CatalogProduct) { window.dispatchEvent(new CustomEvent(EVENT, { detail: { slug: product.slug } })); }
export function TryOnButton({ product, className, compact = false }: { product: CatalogProduct; className?: string; compact?: boolean }) { return <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); openVirtualTryOn(product); }} className={cn("inline-flex items-center justify-center gap-2 border border-foreground bg-background text-[10px] font-bold tracking-[.12em] text-foreground uppercase transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent", compact ? "h-8 px-3" : "h-12 px-5", className)}><Sparkles size={compact ? 12 : 15}/>AI try-on</button>; }

export function VirtualTryOn() {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [step, setStep] = useState<Step>("intro");
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [progress, setProgress] = useState("Preparing your fitting room…");
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cancelledRef = useRef(false);

  const stopCamera = useCallback(() => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; }, []);
  const close = useCallback(() => { cancelledRef.current = true; stopCamera(); setProduct(null); setStep("intro"); setPersonImage(null); setResultImage(null); setError(null); setConsent(false); }, [stopCamera]);

  useEffect(() => { const handler = (event: Event) => { const next = getProductBySlug((event as CustomEvent<{ slug: string }>).detail?.slug); if (next) { cancelledRef.current = false; setProduct(next); setStep("intro"); setPersonImage(null); setResultImage(null); setError(null); setConsent(false); document.body.style.overflow = "hidden"; } }; window.addEventListener(EVENT, handler); return () => window.removeEventListener(EVENT, handler); }, []);
  useEffect(() => { if (!product) document.body.style.overflow = ""; return () => { document.body.style.overflow = ""; }; }, [product]);
  useEffect(() => { if (step === "camera" && videoRef.current && streamRef.current) { videoRef.current.srcObject = streamRef.current; void videoRef.current.play(); } }, [step]);

  async function startCamera() {
    setError(null);
    try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1440 } }, audio: false }); streamRef.current = stream; setStep("camera"); }
    catch { setError("Camera access was blocked or unavailable. Choose a clear portrait photo instead."); }
  }

  function capturePerson() {
    const video = videoRef.current; if (!video?.videoWidth) return;
    const canvas = document.createElement("canvas"); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const context = canvas.getContext("2d"); if (!context) return;
    context.translate(canvas.width, 0); context.scale(-1, 1); context.drawImage(video, 0, 0); stopCamera(); setPersonImage(canvas.toDataURL("image/jpeg", .88)); setStep("person");
  }

  function choosePhoto(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 10_000_000) { setError("Please choose a photo under 10 MB."); return; }
    const reader = new FileReader(); reader.onload = () => { setPersonImage(String(reader.result)); setStep("person"); setError(null); }; reader.readAsDataURL(file);
  }

  async function generate() {
    if (!personImage || !product || !consent) return;
    setStep("generating"); setError(null); setProgress("Reading pose and garment shape…");
    try {
      const start = await fetch("/api/try-on/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ personImage, productSlug: product.slug }) });
      const startData = await start.json() as { id?: string; error?: string };
      if (!start.ok || !startData.id) throw new Error(startData.error ?? "Unable to start AI try-on.");
      setProgress("Draping the selected garment…");
      for (let attempt = 0; attempt < 30 && !cancelledRef.current; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const response = await fetch(`/api/try-on/status/${encodeURIComponent(startData.id)}`, { cache: "no-store" });
        const data = await response.json() as { status?: string; output?: string[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Unable to check try-on progress.");
        if (data.status === "completed" && data.output?.[0]) { setResultImage(data.output[0]); setStep("result"); return; }
        if (data.status === "failed") throw new Error(data.error ?? "This photo could not be processed. Try a clearer front-facing image.");
        if (attempt > 4) setProgress("Preserving the face, pose, and product details…");
      }
      if (!cancelledRef.current) throw new Error("The fitting room took too long. Please try again.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Virtual try-on failed."); setStep("person"); }
  }

  if (!product) return null;
  const garments = getAllProducts().filter((item) => ["shirts", "t-shirts", "jackets"].includes(item.categoryId)).slice(0, 10);
  return <div className="fixed inset-0 z-[100] bg-[#100604] text-white" role="dialog" aria-modal="true" aria-label={`AI try-on for ${product.name}`}>
    <div className="flex h-full flex-col"><header className="flex h-16 shrink-0 items-center justify-between border-b border-white/15 px-4 sm:px-6"><div><p className="text-[8px] font-bold tracking-[.25em] text-[#ff5148] uppercase">House AI fitting room</p><p className="mt-1 text-xs font-semibold">{product.name}</p></div><button onClick={close} className="flex size-10 items-center justify-center rounded-full border border-white/20" aria-label="Close fitting room"><X size={18}/></button></header>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_370px]">
        <main className="relative min-h-[55vh] overflow-hidden bg-[#211512]">
          {step === "intro" ? <Intro product={product} onCamera={startCamera} onPhoto={() => fileRef.current?.click()} error={error}/> : null}
          {step === "camera" ? <><video ref={videoRef} muted playsInline className="absolute inset-0 size-full -scale-x-100 object-cover"/><FrameGuide/><button onClick={capturePerson} className="absolute bottom-6 left-1/2 flex h-14 -translate-x-1/2 items-center gap-2 rounded-full bg-white px-7 text-xs font-bold text-black uppercase"><Camera size={16}/>Use this frame</button></> : null}
          {step === "person" && personImage ? <LocalImage src={personImage} alt="Selected person"/> : null}
          {step === "generating" ? <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#160907] px-6 text-center"><LoaderCircle className="size-12 animate-spin text-[#ff5148]"/><p className="mt-6 font-display text-5xl tracking-wide">Creating the real fit.</p><p className="mt-3 text-sm text-white/55">{progress}</p><div className="mt-6 h-1 w-56 overflow-hidden bg-white/10"><span className="block h-full w-2/3 animate-pulse bg-[#ff5148]"/></div></div> : null}
          {step === "result" && resultImage ? <><LocalImage src={resultImage} alt={`${product.name} virtually worn by the selected person`}/><span className="absolute top-5 left-5 rounded-full bg-black/60 px-3 py-2 text-[9px] font-bold tracking-wider uppercase backdrop-blur">AI generated preview</span></> : null}
        </main>
        <aside className="overflow-y-auto border-l border-white/15 p-5 sm:p-6" data-lenis-prevent><div className="flex items-center gap-2 text-[9px] font-bold tracking-[.18em] text-[#ff5148] uppercase"><Sparkles size={13}/>Identity-preserving try-on</div><h2 className="mt-3 font-display text-4xl tracking-wide">Wear the product.</h2><p className="mt-2 text-xs leading-5 text-white/55">AI keeps the selected person, face, pose, and background while replacing their top with this product.</p>
          <div className="mt-6"><p className="text-[9px] font-bold tracking-[.18em] uppercase">Selected garment</p><div className="mt-3 flex gap-3 border border-white/15 p-3"><div className="relative size-16 shrink-0 overflow-hidden"><Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover"/></div><div><p className="text-xs font-bold">{product.name}</p><p className="mt-1 text-[10px] text-white/45">{product.color} · {product.fit}</p></div></div></div>
          <div className="mt-5"><p className="text-[9px] font-bold tracking-[.18em] uppercase">Switch garment</p><div className="mt-3 flex gap-2 overflow-x-auto pb-2">{garments.map((item) => <button key={item.id} onClick={() => { setProduct(item); setResultImage(null); if (step === "result") setStep("person"); }} aria-label={item.name} className={cn("relative size-16 shrink-0 overflow-hidden border", item.id === product.id ? "border-[#ff5148]" : "border-white/15")}><Image src={item.image} alt="" fill sizes="64px" className="object-cover"/></button>)}</div></div>
          {step === "person" ? <div className="mt-6"><label className="flex cursor-pointer items-start gap-3 text-[10px] leading-5 text-white/60"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-[#ff5148]"/><span>I have permission to use this person’s photo. I agree it will be securely sent to the AI try-on provider for generation and automatically expire.</span></label><button disabled={!consent} onClick={generate} className="mt-4 flex h-13 w-full items-center justify-center gap-2 bg-[#f2251c] text-xs font-bold tracking-wider uppercase disabled:cursor-not-allowed disabled:opacity-35"><Sparkles size={15}/>Generate real try-on</button></div> : null}
          {step === "result" && resultImage ? <div className="mt-6 grid gap-2"><a href={resultImage} download={`house-ai-fit-${product.slug}.jpg`} className="flex h-12 items-center justify-center gap-2 bg-[#f2251c] text-xs font-bold uppercase"><Download size={15}/>Save result</a><button onClick={() => setStep("person")} className="h-11 border border-white/25 text-[10px] font-bold uppercase">Try another garment</button></div> : null}
          {step !== "generating" ? <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={startCamera} className="flex h-11 items-center justify-center gap-2 border border-white/20 text-[10px] font-bold uppercase"><Camera size={13}/>Camera</button><button onClick={() => fileRef.current?.click()} className="flex h-11 items-center justify-center gap-2 border border-white/20 text-[10px] font-bold uppercase"><ImagePlus size={13}/>Photo</button></div> : null}
          {error ? <p className="mt-4 border border-[#ff5148]/30 bg-[#ff5148]/10 p-3 text-[11px] leading-5 text-[#ff8a84]" role="alert">{error}</p> : null}
          <div className="mt-6 flex gap-3 border-t border-white/15 pt-5"><ShieldCheck size={17} className="shrink-0 text-[#ff5148]"/><p className="text-[10px] leading-5 text-white/45">The person photo is transmitted only after consent. Generated previews are temporary. This visualises style and is not a size guarantee.</p></div>
        </aside>
      </div><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" capture="user" className="sr-only" onChange={(event) => choosePhoto(event.target.files?.[0])}/></div>
  </div>;
}

function Intro({ product, onCamera, onPhoto, error }: { product: CatalogProduct; onCamera: () => void; onPhoto: () => void; error: string | null }) { return <div className="absolute inset-0 flex items-center justify-center p-6"><div className="max-w-xl text-center"><span className="mx-auto flex size-16 items-center justify-center rounded-full border border-white/20"><Sparkles className="text-[#ff5148]"/></span><p className="mt-6 text-[9px] font-bold tracking-[.25em] text-[#ff5148] uppercase">Generative virtual try-on</p><h2 className="mt-3 font-display text-6xl leading-[.9] tracking-wide sm:text-7xl">Choose a person.<br/>Dress them in {product.name}.</h2><p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/55">No floating sticker. AI generates a new image where the selected person actually wears the garment.</p><div className="mx-auto mt-7 grid max-w-sm gap-2 sm:grid-cols-2"><button onClick={onCamera} className="flex h-12 items-center justify-center gap-2 bg-[#f2251c] text-xs font-bold uppercase"><Camera size={15}/>Take photo</button><button onClick={onPhoto} className="flex h-12 items-center justify-center gap-2 border border-white/25 text-xs font-bold uppercase"><ImagePlus size={15}/>Choose person</button></div>{error ? <p className="mt-4 text-xs text-[#ff8a84]">{error}</p> : null}<p className="mt-6 inline-flex items-center gap-2 text-[10px] text-white/40"><Check size={12}/>Front-facing, waist-up photos produce the best result</p></div></div>; }
function FrameGuide() { return <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="h-[82%] w-[min(72%,520px)] rounded-[48%_48%_30%_30%] border border-dashed border-white/60"/><span className="absolute top-5 rounded-full bg-black/55 px-4 py-2 text-[10px]">Keep head, shoulders, and waist inside the guide</span></div>; }
function LocalImage({ src, alt }: { src: string; alt: string }) {
  return <div className="absolute inset-0 flex items-center justify-center bg-[#211512] p-4">
    {/* Dynamic data/CDN URL from the try-on flow. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt={alt} className="size-full object-contain"/>
  </div>;
}
