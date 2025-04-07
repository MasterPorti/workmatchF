"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CrearCuentaEmpresaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contra: "",
    ubicacion: "",
    telefono: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url = `https://bk.workmatch.ovh/api/empresas?nombre=${encodeURIComponent(
        formData.nombre
      )}&correo=${encodeURIComponent(
        formData.correo
      )}&contra=${encodeURIComponent(
        formData.contra
      )}&ubicacion=${encodeURIComponent(
        formData.ubicacion
      )}&telefono=${encodeURIComponent(formData.telefono)}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar la empresa");
      }

      // Redirigir a la página de ingreso de empresas
      router.push("/ingresar-empresas");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Registro de Empresa</h2>
          <p className="mt-2 text-sm text-gray-300">
            Crea tu cuenta para publicar ofertas de trabajo
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-300"
              >
                Nombre de la empresa
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </div>

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

            <div>
              <label
                htmlFor="ubicacion"
                className="block text-sm font-medium text-gray-300"
              >
                Ubicación
              </label>
              <input
                id="ubicacion"
                name="ubicacion"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
                value={formData.ubicacion}
                onChange={(e) =>
                  setFormData({ ...formData, ubicacion: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="telefono"
                className="block text-sm font-medium text-gray-300"
              >
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
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
              Registrarse
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-300">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/ingresar-empresas"
              className="font-medium text-[#EE4266] hover:text-[#d13a5c]"
            >
              Ingresa aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
