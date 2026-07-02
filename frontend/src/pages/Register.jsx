import React from "react";
import { Link } from "react-router-dom";
import { UserX } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Register() {
  return (
    <AuthLayout
      icon={UserX}
      title="Registration Disabled"
      subtitle="Public registration is disabled on this platform."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <div className="text-center py-6">
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
          Registration disabled. Contact Super Admin.
        </p>
        <Link
          to="/login"
          className="inline-flex w-full justify-center items-center h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
        >
          Go to Log In
        </Link>
      </div>
    </AuthLayout>
  );
}
