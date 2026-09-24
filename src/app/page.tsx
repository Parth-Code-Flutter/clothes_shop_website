import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-16 text-center sm:px-8 sm:py-24 lg:py-32">
      <div className="rounded-md bg-white px-4 py-3 sm:px-6">
        <Image
          src="/brand/house-of-bollywood-logo.jpg"
          alt=""
          width={1024}
          height={341}
          priority
          className="h-16 w-auto sm:h-24 lg:h-32"
        />
      </div>
      <h1 className="mt-8 max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:mt-10 sm:text-5xl lg:text-6xl">
        Hand-Picked Daily
      </h1>
      <span className="mt-6 h-1 w-16 rounded-full bg-accent" aria-hidden="true" />
      <p className="mt-4 text-sm font-medium tracking-wide text-gold sm:text-base">
        House of Bollywood
      </p>
    </main>
  );
}
