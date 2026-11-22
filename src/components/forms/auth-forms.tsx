"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi, getErrorMessage } from "@/services/api";
import { useShop } from "@/context/shop-context";

function Field({
  label,
  type = "text",
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input type={type} {...props} />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

function AuthFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="auth-page">
      <div className="auth-aside">
        <span className="eyebrow">A FRESH START</span>
        <h2>
          Good things
          <br />
          start here.
        </h2>
        <p>Your everyday favorites are just a few clicks away.</p>
        <span className="auth-aside-decoration">✳</span>
      </div>
      <section className="auth-card">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="auth-description">{description}</p>
        {children}
      </section>
    </main>
  );
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
type LoginValues = z.infer<typeof loginSchema>;
export function LoginForm() {
  const { signIn, notify, token } = useShop();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const submit = handleSubmit(async (values) => {
    try {
      await signIn(values);
      notify("Welcome back to FreshCart.");
      router.push("/");
    } catch (error) {
      notify(getErrorMessage(error), "error");
    }
  });
  return (
    <AuthFrame
      eyebrow="WELCOME BACK"
      title="Sign in"
      description="Your good stuff is waiting for you."
    >
      {token && <p className="inline-success">You’re signed in already.</p>}
      <form className="form-stack" onSubmit={submit} noValidate>
        <Field
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Field
          label="Password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="form-between">
          <span /> <Link href="/forgot-password">Forgot password?</Link>
        </div>
        <button
          className="button button-primary button-wide"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing you in..." : "Sign in"}
        </button>
      </form>
      <p className="auth-bottom">
        New to FreshCart? <Link href="/register">Create an account</Link>
      </p>
    </AuthFrame>
  );
}

const registerSchema = z
  .object({
    name: z.string().min(2, "Please enter your name."),
    email: z.string().email("Enter a valid email address."),
    phone: z.string().min(10, "Enter a valid phone number."),
    password: z.string().min(8, "Use at least 8 characters."),
    rePassword: z.string(),
  })
  .refine((values) => values.password === values.rePassword, {
    message: "Passwords do not match.",
    path: ["rePassword"],
  });
type RegisterValues = z.infer<typeof registerSchema>;
export function RegisterForm() {
  const { signUp, notify } = useShop();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  const submit = handleSubmit(async (values) => {
    try {
      await signUp(values);
      notify("Your FreshCart account is ready.");
      router.push("/");
    } catch (error) {
      notify(getErrorMessage(error), "error");
    }
  });
  return (
    <AuthFrame
      eyebrow="JOIN THE GOOD LIFE"
      title="Create account"
      description="Make your everyday a little more delightful."
    >
      <form className="form-stack" onSubmit={submit} noValidate>
        <Field
          label="Full name"
          placeholder="Your name"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <Field
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Field
          label="Phone number"
          type="tel"
          placeholder="+20 100 000 0000"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Field
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Field
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.rePassword?.message}
          {...register("rePassword")}
        />
        <button
          className="button button-primary button-wide"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="auth-bottom">
        Already a member? <Link href="/login">Sign in</Link>
      </p>
    </AuthFrame>
  );
}

export function ForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [email, setEmail] = useState("");
  const emailForm = useForm<{ email: string }>({
    resolver: zodResolver(
      z.object({ email: z.string().email("Enter a valid email address.") }),
    ),
  });
  const codeForm = useForm<{ code: string }>({
    resolver: zodResolver(
      z.object({ code: z.string().min(4, "Enter your reset code.") }),
    ),
  });
  const passwordForm = useForm<{ password: string }>({
    resolver: zodResolver(
      z.object({ password: z.string().min(8, "Use at least 8 characters.") }),
    ),
  });
  const emailRegistration = emailForm.register("email", {
    onChange: (event) => setEmail(event.target.value),
  });
  const [busy, setBusy] = useState(false);
  const { notify } = useShop();
  const router = useRouter();
  const submitEmail = emailForm.handleSubmit(
    async ({ email: submittedEmail }) => {
      setBusy(true);
      try {
        const result = await authApi.forgotPassword(submittedEmail);
        notify(
          result.message ||
            "If your email is registered, a reset code is on its way.",
        );
        setStep("code");
      } catch (error) {
        notify(getErrorMessage(error), "error");
      } finally {
        setBusy(false);
      }
    },
  );
  const submitCode = codeForm.handleSubmit(async ({ code }) => {
    setBusy(true);
    try {
      await authApi.verifyResetCode(code);
      setStep("reset");
    } catch (error) {
      notify(getErrorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  });
  const submitPassword = passwordForm.handleSubmit(async ({ password }) => {
    setBusy(true);
    try {
      await authApi.resetPassword(email, password);
      notify("Password updated. Sign in with your new password.");
      router.push("/login");
    } catch (error) {
      notify(getErrorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  });
  return (
    <AuthFrame
      eyebrow="ACCOUNT RECOVERY"
      title="Forgot password?"
      description="We’ll help you get back to the good stuff."
    >
      {step === "email" && (
        <form className="form-stack" onSubmit={submitEmail} noValidate>
          <Field
            label="Email address"
            type="email"
            placeholder="you@example.com"
            error={emailForm.formState.errors.email?.message}
            {...emailRegistration}
          />
          <button className="button button-primary button-wide" disabled={busy}>
            {busy ? "Sending..." : "Send reset code"}
          </button>
        </form>
      )}
      {step === "code" && (
        <form className="form-stack" onSubmit={submitCode} noValidate>
          <Field
            label="Reset code"
            placeholder="Enter the code from your email"
            error={codeForm.formState.errors.code?.message}
            {...codeForm.register("code")}
          />
          <button className="button button-primary button-wide" disabled={busy}>
            {busy ? "Verifying..." : "Verify code"}
          </button>
        </form>
      )}
      {step === "reset" && (
        <form className="form-stack" onSubmit={submitPassword} noValidate>
          <Field
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            error={passwordForm.formState.errors.password?.message}
            {...passwordForm.register("password")}
          />
          <button className="button button-primary button-wide" disabled={busy}>
            {busy ? "Updating..." : "Set new password"}
          </button>
        </form>
      )}
      <p className="auth-bottom">
        <Link href="/login">← Back to sign in</Link>
      </p>
    </AuthFrame>
  );
}

const changeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    password: z.string().min(8, "Use at least 8 characters."),
    rePassword: z.string(),
  })
  .refine((values) => values.password === values.rePassword, {
    message: "Passwords do not match.",
    path: ["rePassword"],
  });
type ChangeValues = z.infer<typeof changeSchema>;
export function ChangePasswordForm() {
  const { token, notify, signOut, replaceToken } = useShop();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangeValues>({ resolver: zodResolver(changeSchema) });
  const submit = handleSubmit(async (values) => {
    try {
      const result = await authApi.changePassword(values);
      if (result.token) replaceToken(result.token);
      notify("Password changed successfully.");
      router.push("/");
    } catch (error) {
      notify(getErrorMessage(error), "error");
    }
  });
  if (!token && typeof window !== "undefined")
    return (
      <AuthFrame
        eyebrow="ACCOUNT SECURITY"
        title="Sign in required"
        description="Please sign in before changing your password."
      >
        <Link className="button button-primary button-wide" href="/login">
          Go to sign in
        </Link>
      </AuthFrame>
    );
  return (
    <AuthFrame
      eyebrow="ACCOUNT SECURITY"
      title="Change password"
      description="Keep your FreshCart account secure."
    >
      <form className="form-stack" onSubmit={submit} noValidate>
        <Field
          label="Current password"
          type="password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Field
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.rePassword?.message}
          {...register("rePassword")}
        />
        <button
          className="button button-primary button-wide"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
        <button type="button" className="text-button" onClick={signOut}>
          Sign out
        </button>
      </form>
    </AuthFrame>
  );
}
