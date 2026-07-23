import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-20 sm:px-10">
      <p className="mb-4 text-sm font-medium tracking-[0.16em] text-neutral-500 uppercase">
        FormMuse
      </p>
      <h1 className="max-w-4xl text-5xl leading-[0.95] font-semibold tracking-[-0.05em] text-balance sm:text-7xl">
        Beautiful forms, ready to make your own.
      </h1>
      <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-600">
        A curated open-source library of premium Form Templates with accessible
        validation, thoughtful animation, and a backend-agnostic submission API.
      </p>
      <p className="mt-10 text-sm text-neutral-500">
        The Hanging Gifts vertical slice is now in development.
      </p>
      <Link
        href="/templates/hanging-gifts-contact/"
        className="mt-6 inline-flex min-h-11 w-fit items-center rounded-full bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-neutral-700 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Open Hanging Gifts template route
      </Link>
    </main>
  );
}
