import { getGoogleLoginUrl } from "@/lib/api";

export default function LoginPage() {
  return (
    <>
      <h1 className="text-heading-lg font-black uppercase tracking-tight animate-fade-up">
        Log In
      </h1>
      <p
        className="text-body-lg text-gray-300 animate-fade-up delay-1"
        style={{ marginTop: "16px" }}
      >
        Sign in with your Google account to continue.
      </p>

      <div
        className="animate-fade-up delay-2"
        style={{ marginTop: "clamp(32px, 4vw, 56px)" }}
      >
        <a
          href={getGoogleLoginUrl()}
          className="group inline-flex items-center bg-black text-white font-bold uppercase tracking-[0.12em] hover:bg-accent transition-colors"
          style={{ padding: "22px 44px", fontSize: "14px" }}
        >
          Continue with Google
          <span
            className="inline-block ml-6 transition-transform group-hover:translate-x-1"
            style={{ fontSize: "20px" }}
          >
            &rarr;
          </span>
        </a>
      </div>

      <p
        className="text-body text-gray-300 animate-fade-up delay-3"
        style={{ marginTop: "clamp(24px, 3vw, 40px)" }}
      >
        Don&apos;t have an account? One will be created automatically.
      </p>
    </>
  );
}
