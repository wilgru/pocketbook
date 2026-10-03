import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
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

function SignUpIndexComponent(): React.JSX.Element {
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

    console.log(formData);
    // await signUp(formData);

    // redirect on successful sign up
    navigate({ to: ".." });
  };

  // useEffect(() => {
  //   if (user) {
  //     navigate({ to: ".." });
  //   }
  // }, [navigate, user]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-slate-100">
      {/* {!!signUpError && (
        // TODO: show actual error message
        <div className="p-6 border border-red-500 rounded-lg bg-red-100 text-red-500 max-w-sm w-full">
          Something went wrong. Please try again
        </div>
      )} */}
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-lg border border-slate-300 bg-white p-6 drop-shadow-sm">
        <h1 className="font-title text-4xl font-normal tracking-tight ">
          Sign Up
        </h1>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <div className="flex items-baseline justify-between">
              <label className="text-sm leading-6 font-medium ">Name</label>
            </div>
            <div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="given-name"
                onChange={onChange}
                required
                className="block w-full rounded-full border border-slate-300 bg-white p-2 text-sm placeholder:text-slate-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm leading-6 font-medium ">Email</label>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                onChange={onChange}
                required
                className="block w-full rounded-full border border-slate-300 bg-white p-2 text-sm placeholder:text-slate-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label className="text-sm leading-6 font-medium ">Password</label>
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                onChange={onChange}
                required
                className="block w-full rounded-full border border-slate-300 bg-white p-2 text-sm placeholder:text-slate-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label className="text-sm leading-6 font-medium ">
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
                className="block w-full rounded-full border border-slate-300 bg-white p-2 text-sm placeholder:text-slate-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            {/* <Button disabled={signUpLoading} type="submit">
              {signUpLoading ? "Loading..." : "Sign up"}
            </Button> */}
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
