"use client";

import Image from "next/image";
import { Camera, Check, Download, ImagePlus, LoaderCircle, ScanLine, ShieldCheck, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAllProducts, getProductBySlug } from "@/features/catalog/data";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";
import { startLiveOverlay, type LiveOverlay, type OverlayStatus } from "./live-overlay";

const EVENT = "hob:try-on";
type Step = "intro" | "live" | "person" | "generating" | "result";
type LiveSource = { kind: "camera" } | { kind: "photo"; src: string };

export function openVirtualTryOn(product: CatalogProduct) { window.dispatchEvent(new CustomEvent(EVENT, { detail: { slug: product.slug } })); }
export function TryOnButton({ product, className, compact = false }: { product: CatalogProduct; className?: string; compact?: boolean }) {
  if (!product.tryOn) return null;
  return <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); openVirtualTryOn(product); }} className={cn("inline-flex items-center justify-center gap-2 border border-foreground bg-background text-[10px] font-bold tracking-[.12em] text-foreground uppercase transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent", compact ? "h-8 px-3" : "h-12 px-5", className)}><Sparkles size={compact ? 12 : 15}/>Try on</button>;
}

const STATUS_COPY: Record<OverlayStatus, string> = {
  loading: "Loading body tracking…",
  searching: "Step back so your head, shoulders, and hips are in the frame",
  tracking: "Live style preview",
  error: "Live preview is unavailable on this device. The realistic photo still works.",
};

export function VirtualTryOn() {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [step, setStep] = useState<Step>("intro");
  const [liveSource, setLiveSource] = useState<LiveSource | null>(null);
  const [overlayStatus, setOverlayStatus] = useState<OverlayStatus>("loading");
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [progress, setProgress] = useState("Preparing your fitting room…");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const overlayRef = useRef<LiveOverlay | null>(null);
  const cancelledRef = useRef(false);

  const stopCamera = useCallback(() => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; }, []);
  const reset = useCallback(() => { stopCamera(); setStep("intro"); setLiveSource(null); setPersonImage(null); setResultImage(null); setError(null); setConsent(false); }, [stopCamera]);
  const close = useCallback(() => { cancelledRef.current = true; reset(); setProduct(null); }, [reset]);

  useEffect(() => { const handler = (event: Event) => { const next = getProductBySlug((event as CustomEvent<{ slug: string }>).detail?.slug); if (next?.tryOn) { cancelledRef.current = false; reset(); setProduct(next); document.body.style.overflow = "hidden"; } }; window.addEventListener(EVENT, handler); return () => window.removeEventListener(EVENT, handler); }, [reset]);
  useEffect(() => { if (!product) document.body.style.overflow = ""; return () => { document.body.style.overflow = ""; }; }, [product]);
  useEffect(() => { if (!product) return; const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [product, close]);
  useEffect(() => stopCamera, [stopCamera]);

  const garment = product?.tryOn;
  const liveActive = step === "live" && Boolean(liveSource);
  useEffect(() => {
    if (!liveActive || !liveSource || !canvasRef.current || !garment) return;
    let overlay: LiveOverlay | null = null;
    let cancelled = false;
    const begin = (source: HTMLVideoElement | HTMLImageElement) => { if (!cancelled && canvasRef.current) overlay = overlayRef.current = startLiveOverlay({ canvas: canvasRef.current, source, mirrored: liveSource.kind === "camera", garment, onStatus: setOverlayStatus }); };
    setOverlayStatus("loading");
    if (liveSource.kind === "camera") {
      const video = videoRef.current;
      if (video && streamRef.current) { video.srcObject = streamRef.current; void video.play().then(() => begin(video)).catch(() => setError("The camera preview could not start. Upload a photo instead.")); }
    } else {
      const image = new window.Image();
      image.onload = () => begin(image);
      image.src = liveSource.src;
    }
    return () => { cancelled = true; overlay?.stop(); overlayRef.current = null; };
    // The garment is swapped in place by the effect below, without restarting tracking.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveActive, liveSource]);
  useEffect(() => { if (garment) overlayRef.current?.setGarment(garment); }, [garment]);

  async function startCamera() {
    setError(null);
    try {
      stopCamera();
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      setResultImage(null); setLiveSource({ kind: "camera" }); setStep("live");
    } catch { setError("Camera access was blocked or unavailable. Upload a photo instead."); }
  }

  function choosePhoto(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 10_000_000) { setError("Please choose a photo under 10 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { stopCamera(); setResultImage(null); setError(null); setLiveSource({ kind: "photo", src: String(reader.result) }); setStep("live"); };
    reader.readAsDataURL(file);
  }

  function makeRealisticPhoto() {
    const frame = liveSource?.kind === "photo" ? liveSource.src : overlayRef.current?.captureClean();
    if (!frame) { setError("Hold still for a moment, then try again."); return; }
    stopCamera(); setPersonImage(frame); setError(null); setStep("person");
  }

  async function generate() {
    if (!personImage || !product || !consent) return;
    setStep("generating"); setError(null); setProgress("Reading pose and garment shape…");
    try {
      const response = await fetch("/api/try-on/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ personImage, productSlug: product.slug, consent: true }) });
      const data = await response.json().catch(() => ({})) as { image?: string; id?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to start AI try-on.");
      if (data.image) { if (!cancelledRef.current) { setResultImage(data.image); setStep("result"); } return; }
      if (!data.id) throw new Error("Unable to start AI try-on.");
      setProgress("Draping the selected garment…");
      for (let attempt = 0; attempt < 30 && !cancelledRef.current; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const status = await fetch(`/api/try-on/status/${encodeURIComponent(data.id)}`, { cache: "no-store" });
        const poll = await status.json() as { status?: string; output?: string[]; error?: string };
        if (!status.ok) throw new Error(poll.error ?? "Unable to check try-on progress.");
        if (poll.status === "completed" && poll.output?.[0]) { setResultImage(poll.output[0]); setStep("result"); return; }
        if (poll.status === "failed") throw new Error(poll.error ?? "This photo could not be processed. Try a clearer front-facing image.");
        if (attempt > 4) setProgress("Preserving the face, pose, and product details…");
      }
      if (!cancelledRef.current) throw new Error("The fitting room took too long. Please try again.");
    } catch (caught) { if (!cancelledRef.current) { setError(caught instanceof Error ? caught.message : "Virtual try-on failed."); setStep("person"); } }
  }

  if (!product) return null;
  const garments = getAllProducts().filter((item) => item.tryOn);
  const statusTone = overlayStatus === "tracking" ? "bg-black/55" : overlayStatus === "error" ? "bg-[#7a1410]/85" : "bg-black/70";
  return <div className="fixed inset-0 z-[100] bg-[#100604] text-white" role="dialog" aria-modal="true" aria-label={`Try on ${product.name}`}>
    <div className="flex h-full flex-col"><header className="flex h-16 shrink-0 items-center justify-between border-b border-white/15 px-4 sm:px-6"><div><p className="text-[8px] font-bold tracking-[.25em] text-[#ff5148] uppercase">House fitting room</p><p className="mt-1 text-xs font-semibold">{product.name}</p></div><button onClick={close} className="flex size-10 items-center justify-center rounded-full border border-white/20" aria-label="Close fitting room"><X size={18}/></button></header>
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_370px] lg:grid-rows-1">
        <main className="relative min-h-0 overflow-hidden bg-[#211512]">
          {step === "intro" ? <Intro product={product} onCamera={startCamera} onPhoto={() => fileRef.current?.click()} error={error}/> : null}
          {step === "live" ? <>
            <video ref={videoRef} muted playsInline aria-hidden="true" className="pointer-events-none absolute size-px opacity-0"/>
            <canvas ref={canvasRef} className={cn("absolute inset-0 size-full", liveSource?.kind === "camera" ? "object-cover" : "object-contain p-4")} aria-label={`Live preview of ${product.name}`}/>
            <span className={cn("absolute top-4 left-1/2 flex max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-center text-[10px] font-semibold backdrop-blur", statusTone)} role="status">{overlayStatus === "loading" ? <LoaderCircle size={12} className="shrink-0 animate-spin"/> : <ScanLine size={12} className="shrink-0 text-[#ff5148]"/>}{STATUS_COPY[overlayStatus]}</span>
            <button onClick={makeRealisticPhoto} className="absolute bottom-6 left-1/2 flex h-14 -translate-x-1/2 items-center gap-2 rounded-full bg-white px-7 text-xs font-bold whitespace-nowrap text-black uppercase shadow-lg"><Sparkles size={16}/>Make realistic photo</button>
          </> : null}
          {step === "person" && personImage ? <LocalImage src={personImage} alt="Photo selected for the realistic try-on"/> : null}
          {step === "generating" ? <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#160907] px-6 text-center"><LoaderCircle className="size-12 animate-spin text-[#ff5148]"/><p className="mt-6 font-display text-5xl tracking-wide">Creating the real fit.</p><p className="mt-3 text-sm text-white/55">{progress}</p><p className="mt-2 text-[11px] text-white/35">Usually 10–60 seconds on the free GPU.</p></div> : null}
          {step === "result" && resultImage ? <><LocalImage src={resultImage} alt={`${product.name} virtually worn by the selected person`}/><span className="absolute top-5 left-5 rounded-full bg-black/60 px-3 py-2 text-[9px] font-bold tracking-wider uppercase backdrop-blur">AI generated photo</span></> : null}
        </main>
        <aside className="max-h-[42vh] overflow-y-auto border-t border-white/15 p-5 sm:p-6 lg:max-h-none lg:border-t-0 lg:border-l" data-lenis-prevent><div className="flex items-center gap-2 text-[9px] font-bold tracking-[.18em] text-[#ff5148] uppercase"><Sparkles size={13}/>Two ways to try</div><h2 className="mt-3 font-display text-4xl tracking-wide">Wear the product.</h2><p className="mt-2 text-xs leading-5 text-white/55"><strong className="text-white/80">Live preview</strong> places the garment on you in real time, right on your device. <strong className="text-white/80">Realistic photo</strong> uses AI to create a natural image of you wearing it.</p>
          <div className="mt-6"><p className="text-[9px] font-bold tracking-[.18em] uppercase">Selected garment</p><div className="mt-3 flex gap-3 border border-white/15 p-3"><div className="relative size-16 shrink-0 overflow-hidden"><Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover"/></div><div><p className="text-xs font-bold">{product.name}</p><p className="mt-1 text-[10px] text-white/45">{product.color} · {product.fit}</p></div></div></div>
          <div className="mt-5"><p className="text-[9px] font-bold tracking-[.18em] uppercase">Switch garment</p><div className="mt-3 flex gap-2 overflow-x-auto pb-2">{garments.map((item) => <button key={item.id} onClick={() => { setProduct(item); setResultImage(null); if (step === "result") setStep("person"); }} aria-label={item.name} aria-pressed={item.id === product.id} className={cn("relative size-16 shrink-0 overflow-hidden border bg-white/90", item.id === product.id ? "border-[#ff5148]" : "border-white/15")}><Image src={item.tryOn!.image} alt="" fill sizes="64px" className="object-contain p-1"/></button>)}</div></div>
          {step === "person" ? <div className="mt-6"><label className="flex cursor-pointer items-start gap-3 text-[10px] leading-5 text-white/60"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-[#ff5148]"/><span>I have permission to use this person’s photo. I agree it will be sent to the AI try-on service only to create this image.</span></label><button disabled={!consent} onClick={generate} className="mt-4 flex h-13 w-full items-center justify-center gap-2 bg-[#f2251c] text-xs font-bold tracking-wider uppercase disabled:cursor-not-allowed disabled:opacity-35"><Sparkles size={15}/>Generate realistic photo</button></div> : null}
          {step === "result" && resultImage ? <div className="mt-6 grid gap-2"><a href={resultImage} download={`house-fit-${product.slug}.${imageExtension(resultImage)}`} className="flex h-12 items-center justify-center gap-2 bg-[#f2251c] text-xs font-bold uppercase"><Download size={15}/>Save photo</a><button onClick={() => setStep("person")} className="h-11 border border-white/25 text-[10px] font-bold uppercase">Try another garment</button></div> : null}
          {step !== "generating" ? <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={startCamera} className={cn("flex h-11 items-center justify-center gap-2 border text-[10px] font-bold uppercase", liveSource?.kind === "camera" && step === "live" ? "border-[#ff5148] text-[#ff8a84]" : "border-white/20")}><Camera size={13}/>Live camera</button><button onClick={() => fileRef.current?.click()} className="flex h-11 items-center justify-center gap-2 border border-white/20 text-[10px] font-bold uppercase"><ImagePlus size={13}/>Upload photo</button></div> : null}
          {error ? <p className="mt-4 border border-[#ff5148]/30 bg-[#ff5148]/10 p-3 text-[11px] leading-5 text-[#ff8a84]" role="alert">{error}</p> : null}
          <div className="mt-6 flex gap-3 border-t border-white/15 pt-5"><ShieldCheck size={17} className="shrink-0 text-[#ff5148]"/><p className="text-[10px] leading-5 text-white/45">The live preview runs on your device and the camera feed stays with you (Google’s MediaPipe library shares anonymous usage metrics). A photo leaves your device only after you confirm consent. Previews show style, not an exact size fit.</p></div>
        </aside>
      </div><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { choosePhoto(event.target.files?.[0]); event.target.value = ""; }}/></div>
  </div>;
}

function Intro({ product, onCamera, onPhoto, error }: { product: CatalogProduct; onCamera: () => void; onPhoto: () => void; error: string | null }) { return <div className="absolute inset-0 flex items-center justify-center overflow-y-auto p-6"><div className="max-w-xl text-center"><span className="mx-auto flex size-16 items-center justify-center rounded-full border border-white/20"><Sparkles className="text-[#ff5148]"/></span><p className="mt-6 text-[9px] font-bold tracking-[.25em] text-[#ff5148] uppercase">Virtual fitting room</p><h2 className="mt-3 font-display text-5xl leading-[.9] tracking-wide sm:text-7xl">See {product.name}<br/>on you.</h2><p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/55">Start the live camera to see it follow you in real time, then turn any frame into a realistic AI photo.</p><div className="mx-auto mt-7 grid max-w-sm gap-2 sm:grid-cols-2"><button onClick={onCamera} className="flex h-12 items-center justify-center gap-2 bg-[#f2251c] text-xs font-bold uppercase"><Camera size={15}/>Live camera</button><button onClick={onPhoto} className="flex h-12 items-center justify-center gap-2 border border-white/25 text-xs font-bold uppercase"><ImagePlus size={15}/>Upload photo</button></div>{error ? <p className="mt-4 text-xs text-[#ff8a84]">{error}</p> : null}<p className="mt-6 inline-flex items-center gap-2 text-[10px] text-white/40"><Check size={12}/>Face the camera with shoulders and hips in view for the best fit</p></div></div>; }
function imageExtension(src: string) { const type = /^data:image\/(\w+)/.exec(src)?.[1] ?? /\.(png|webp|jpe?g)(?:\?|$)/i.exec(src)?.[1]?.toLowerCase(); return type === "png" || type === "webp" ? type : "jpg"; }
function LocalImage({ src, alt }: { src: string; alt: string }) {
  return <div className="absolute inset-0 flex items-center justify-center bg-[#211512] p-4">
    {/* Dynamic data/CDN URL from the try-on flow. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt={alt} className="size-full object-contain"/>
  </div>;
}
