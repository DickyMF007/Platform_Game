import { RegistrationForm } from "@/components/forms/registration-form";

export default function RegisterPage() {
  return (
    <section className="space-y-4">
      <header className="ice-panel rounded-3xl p-5">
        <p className="text-xs tracking-[0.16em] text-cyan-200/80">
          RECRUITMENT FORM
        </p>
        <h1 className="mt-2 text-2xl font-bold">Pendaftaran Masuk State</h1>
        <p className="mt-2 text-sm text-slate-200">
          Isi data berikut untuk proses seleksi oleh tim recruiter. Upload foto
          power yang jelas agar review lebih cepat.
        </p>
      </header>

      <div className="ice-panel rounded-3xl p-5">
        <RegistrationForm />
      </div>
    </section>
  );
}
