"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function IngresarPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/home");
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const url = `https://jossred.josprox.com/api/jossredauth?correo=${formData.email}&contra=${formData.password}`;
      console.log("URL de la API:", url);

      const response = await fetch(url);
      console.log("Status de la respuesta:", response.status);
      console.log(
        "Headers de la respuesta:",
        Object.fromEntries(response.headers.entries())
      );

      const data = await response.json();
      console.log("Datos de la respuesta:", data);

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      // Verificar si la respuesta contiene un token
      if (!data.token) {
        throw new Error("No se recibió un token válido");
      }

      // Guardar el token en cookies
      Cookies.set("token", data.token, { expires: 7 }); // Expira en 7 días

      // Redirigir a la página de home
      router.push("/home");
    } catch (error) {
      console.error("Error completo:", error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">Ingresar</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE4266] focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE4266] focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  className="h-4 w-4 text-[#EE4266] focus:ring-[#EE4266] border-gray-300 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Recordarme
                </label>
              </div>
              <Link
                href="/crear-cuenta-empresa"
                className="text-sm text-[#EE4266] hover:underline"
              >
                ¿Eres una empresa?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-[#EE4266] text-white py-3 px-4 rounded-lg font-bold hover:bg-[#d13a5c] transition-colors"
            >
              Ingresar
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/crear-cuenta"
              className="text-[#EE4266] hover:underline font-bold"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
