import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, useEffect } from "react";
import { useSignUp } from "src/Users/hooks/useSignUp";
import { useUser } from "src/Users/hooks/useUser";
import { Button } from "src/common/components/Button/Button";

type FormData = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export const Route = createFileRoute("/signup")({
  component: SignUpIndexComponent,
});

function SignUpIndexComponent(): JSX.Element {
  const { signUp, signUpLoading, signUpError } = useSignUp();
  const { user } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const onChange = (e: { target: { name: string; value: string } }) => {
    const name = e.target.name;
    const value = e.target.value;

    setFormData((currentFormData) => ({ ...currentFormData, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await signUp(formData);

    // redirect on successful sign up
    navigate({ to: ".." });
  };

  useEffect(() => {
    if (user) {
      navigate({ to: ".." });
    }
  }, [navigate, user]);

  return (
    <div className="flex flex-col gap-6 justify-center items-center h-screen w-screen bg-slate-100">
      {!!signUpError && (
        // TODO: show actual error message
        <div className="p-6 border border-red-500 rounded-lg bg-red-100 text-red-500 max-w-sm w-full">
          Something went wrong. Please try again
        </div>
      )}
      <div className="flex flex-col gap-6 p-6 border bg-white border-slate-300 rounded-lg max-w-sm w-full drop-shadow">
        <h1 className="text-4xl font-normal font-title tracking-tight ">
          Sign Up
        </h1>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-medium leading-6 ">Name</label>
            </div>
            <div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="given-name"
                onChange={onChange}
                required
                className="block w-full p-2 bg-white border border-slate-300 rounded-full placeholder:text-slate-500 focus:border-orange-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium leading-6 ">Email</label>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                onChange={onChange}
                required
                className="block w-full p-2 bg-white border border-slate-300 rounded-full placeholder:text-slate-500 focus:border-orange-500 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-medium leading-6 ">Password</label>
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                onChange={onChange}
                required
                className="block w-full p-2 bg-white border border-slate-300 rounded-full placeholder:text-slate-500 focus:border-orange-500 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-medium leading-6 ">
                Confirm Password
              </label>
            </div>
            <div>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                onChange={onChange}
                required
                className="block w-full p-2 bg-white border border-slate-300 rounded-full placeholder:text-slate-500 focus:border-orange-500 text-sm"
              />
            </div>
          </div>

          <div>
            <Button disabled={signUpLoading} type="submit">
              {signUpLoading ? "Loading..." : "Sign up"}
            </Button>
          </div>
        </form>

        <div className="flex items-baseline">
          <p className="text-sm">Already have an account?&nbsp;</p>
          <Button
            variant="link"
            onClick={() => {
              navigate({ to: "/login", search: { redirect: undefined } });
            }}
          >
            Log in
          </Button>
        </div>
      </div>
    </div>
  );
}
