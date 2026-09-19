import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState, type FormEvent } from "react";
import { Button } from "src/common/components/Button/Button";
import { Input } from "src/common/components/Input/Input";

type FormData = {
  email: string;
  password: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === "string" && search.redirect.startsWith("/")
        ? search.redirect
        : undefined,
  }),
  component: LoginIndexComponent,
});

function LoginIndexComponent(): React.JSX.Element {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const navigateAfterAuth = useCallback(() => {
    if (redirect) {
      window.location.replace(redirect);
      return;
    }

    navigate({ to: ".." });
  }, [navigate, redirect]);

  const onChange = (e: { target: { name: string; value: string } }) => {
    const name = e.target.name;
    const value = e.target.value;

    setFormData((currentFormData) => ({ ...currentFormData, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // await login({ email: formData.email, password: formData.password });

    // redirect on successful login
    navigateAfterAuth();
  };

  // useEffect(() => {
  //   if (user) {
  //     navigateAfterAuth();
  //   }
  // }, [navigateAfterAuth, user]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-slate-100">
      {/* {!!loginError && (
        <div className="p-6 border border-red-500 rounded-lg bg-red-100 text-red-500 max-w-sm w-full">
          Incorrect email or password.
        </div>
      )} */}
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-lg border border-slate-300 bg-white p-6 drop-shadow-sm">
        <h1 className="font-title text-4xl font-normal tracking-tight ">
          Pocketbook
        </h1>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label className="text-sm leading-6 font-medium ">Email</label>
            <div>
              <Input
                onChange={onChange}
                id="email"
                type="email"
                value={formData.email}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label className="text-sm leading-6 font-medium ">Password</label>
              {/*<Button styleType="link">Forgot password?</Button>*/}
            </div>
            <div>
              <Input
                onChange={onChange}
                id="password"
                type="password"
                value={formData.password}
                required
              />
            </div>
          </div>

          <div>
            {/* <Button disabled={loginLoading} type="submit">
              {loginLoading ? "Loading..." : "Log in"}
            </Button> */}
          </div>

          <div className="flex items-baseline">
            <p className="text-sm">New to Pocketbook?&nbsp;</p>
            <Button
              variant="link"
              onClick={() => {
                navigate({ to: "/signup" });
              }}
            >
              Create an account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
