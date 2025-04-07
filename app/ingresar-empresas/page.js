"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function IngresarEmpresasPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    correo: "",
    contra: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url = `https://bk.workmatch.ovh/api/empresas?correo=${encodeURIComponent(
        formData.correo
      )}&contra=${encodeURIComponent(formData.contra)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      // Guardar la información del usuario en las cookies
      Cookies.set(
        "empresaData",
        JSON.stringify({
          ...data,
          contra: formData.contra, // Guardar la contraseña sin encriptación
        })
      );
      Cookies.set("empresaToken", data.id.toString());

      // Redirigir a la página de inicio de empresas
      router.push("/home-empresas");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Ingreso de Empresas</h2>
          <p className="mt-2 text-sm text-gray-300">
            Accede a tu cuenta para gestionar tus ofertas de trabajo
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="correo"
                className="block text-sm font-medium text-gray-300"
              >
                Correo electrónico
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
                value={formData.correo}
                onChange={(e) =>
                  setFormData({ ...formData, correo: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="contra"
                className="block text-sm font-medium text-gray-300"
              >
                Contraseña
              </label>
              <input
                id="contra"
                name="contra"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
                value={formData.contra}
                onChange={(e) =>
                  setFormData({ ...formData, contra: e.target.value })
                }
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#EE4266] hover:bg-[#d13a5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EE4266]"
            >
              Ingresar
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-300">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/crear-cuenta-empresas"
              className="font-medium text-[#EE4266] hover:text-[#d13a5c]"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
