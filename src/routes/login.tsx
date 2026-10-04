import { createFileRoute, redirect } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState, type FormEvent } from "react";
import { Button } from "src/common/components/Button/Button";
import { Input } from "src/common/components/Input/Input";
import { getSessionServerFn } from "src/credentials/serverFunctions/getSession";
import { getPocketbooksServerFn } from "src/pocketbooks/serverFunctions/getPocketbooks";
import { requestLoginCodeServerFn } from "src/credentials/serverFunctions/requestLoginCode";
import { verifyLoginCodeServerFn } from "src/credentials/serverFunctions/verifyLoginCode";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === "string" && search.redirect.startsWith("/")
        ? search.redirect
        : undefined,
  }),
  beforeLoad: async ({ search }) => {
    const { isAuthenticated } = await getSessionServerFn();
    if (!isAuthenticated) {
      return;
    }

    if (search.redirect) {
      throw redirect({ href: search.redirect });
    }

    const { pocketbooks } = await getPocketbooksServerFn({ data: {} });
    const lastUsedId =
      typeof window !== "undefined"
        ? localStorage.getItem("lastUsedPocketbookId")
        : null;
    const pocketbook =
      pocketbooks.find((item) => item.id === lastUsedId) ?? pocketbooks[0];

    if (!pocketbook) {
      throw redirect({ to: "/create-pocketbook" });
    }

    throw redirect({
      to: "/$pocketbookId/planner",
      params: { pocketbookId: pocketbook.id },
      search: { view: "daily", date: dayjs().format("YYYY-MM-DD") },
    });
  },
  component: LoginIndexComponent,
});

function LoginIndexComponent(): React.JSX.Element {
  const { redirect } = Route.useSearch();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitEmail = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await requestLoginCodeServerFn({ data: { email } });
      setStep("code");
    } catch {
      setError("Couldn't send a code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitCode = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { ok } = await verifyLoginCodeServerFn({ data: { email, code } });
      if (!ok) {
        setError("That code is incorrect or has expired.");
        return;
      }

      // Full navigation so every route loads with the new session cookie.
      window.location.replace(redirect ?? "/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-slate-100">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-lg border border-slate-300 bg-white p-6 drop-shadow-sm">
        <h1 className="font-title text-4xl font-normal tracking-tight">
          Pocketbook
        </h1>

        {error && (
          <div className="rounded-lg border border-red-500 bg-red-100 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {step === "email" ? (
          <form className="space-y-6" onSubmit={onSubmitEmail}>
            <div>
              <label className="text-sm leading-6 font-medium" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send login code"}
            </Button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={onSubmitCode}>
            <div>
              <label className="text-sm leading-6 font-medium" htmlFor="code">
                Enter the 6-digit code sent to {email}
              </label>
              <Input
                id="code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Log in"}
              </Button>
              <Button
                variant="link"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                }}
              >
                Use a different email
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
