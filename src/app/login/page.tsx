"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isRegister) {
      const result = await signUp(email, password, name);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Compte cree ! Verifiez votre email pour confirmer, puis connectez-vous.");
        setIsRegister(false);
      }
    } else {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/");
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 -mt-14">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-2xl font-extrabold text-emerald-700 tracking-tight">MAREF</span>
          <h2 className="text-xl font-bold mt-4">
            {isRegister ? "Creer votre compte" : "Connexion"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isRegister ? "Gratuit. Pour toujours." : "Retrouvez vos analyses et projets."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-semibold mb-1.5">Nom</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1.5">Email</label>
            <input
              type="email"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Mot de passe</label>
            <input
              type="password"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
              placeholder="6 caracteres minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-sm text-emerald-700">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Chargement..." : isRegister ? "Creer mon compte" : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          {isRegister ? "Deja un compte ?" : "Pas encore de compte ?"}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); setSuccess(""); }}
            className="text-emerald-700 font-semibold ml-1 hover:underline"
          >
            {isRegister ? "Se connecter" : "Creer un compte"}
          </button>
        </p>
      </div>
    </div>
  );
}