
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0D1B2A]">
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/signup"
          redirectUrl="/"
          appearance={{
            elements: {
              formButtonPrimary:
                "w-full py-2 rounded bg-white text-black font-medium",
              card: "bg-zinc-900 border border-zinc-800 rounded-lg shadow",
              formFieldInput:
                "w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-white",
              footer: "hidden",
            },
          }}
        />
      
    </div>
  );
}
