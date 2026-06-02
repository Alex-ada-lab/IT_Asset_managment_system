export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-700 mb-4">
          IT Asset Management System
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Track, manage, and monitor IT assets throughout their lifecycle.
        </p>
        <a
          href="/login"
          className="inline-block rounded-lg bg-primary-600 px-6 py-3 text-white font-semibold hover:bg-primary-700 transition-colors"
        >
          Sign In
        </a>
      </div>
    </main>
  );
}
