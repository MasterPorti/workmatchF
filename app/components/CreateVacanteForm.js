"use client";

import { useState } from "react";

export default function CreateVacanteForm({ empresaData, onVacanteCreated }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [categorias, setCategorias] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  const analyzeDescription = async (descripcion) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: descripcion,
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta de la API");
      }

      const data = await response.json();
      const categories = data.categories.join(", ");
      const descripcionConCategorias = `${descripcion}\n\nCategorías: ${categories}`;
      document.getElementById("descripcion").value = descripcionConCategorias;
      setCategorias(data.categories);
    } catch (error) {
      console.error("Error al analizar la descripción:", error);
      setCategorias([
        "Error al analizar la descripción. Por favor, intente nuevamente.",
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const descripcion = formData.get("descripcion");

    const categoriasMatch = descripcion.match(/Categorías: (.*)/);
    const categorias = categoriasMatch ? categoriasMatch[1].split(", ") : [];

    const descripcionLimpia = descripcion
      .replace(/\n\nCategorías: .*/, "")
      .trim();

    const descripcionFinal =
      categorias.length > 0
        ? `${descripcionLimpia}\n\nCategorías: ${categorias.join(", ")}`
        : descripcionLimpia;

    const data = {
      correo: empresaData.correo,
      contra: empresaData.contra,
      titulo: formData.get("titulo"),
      descripcion: descripcionFinal,
      sueldo: formData.get("sueldo"),
      modalidad: formData.get("modalidad"),
    };

    try {
      const url = `https://bk.workmatch.ovh/api/vacantes?correo=${encodeURIComponent(
        data.correo
      )}&contra=${encodeURIComponent(data.contra)}&titulo=${encodeURIComponent(
        data.titulo
      )}&descripcion=${encodeURIComponent(
        data.descripcion
      )}&sueldo=${encodeURIComponent(
        data.sueldo
      )}&modalidad=${encodeURIComponent(data.modalidad)}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      setApiResponse(result);
      e.target.reset();
      if (onVacanteCreated) {
        onVacanteCreated();
      }
    } catch (error) {
      console.error("Error al crear la vacante:", error);
      setApiResponse({ error: "Error al crear la vacante" });
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-white">Crear Nueva Vacante</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="titulo"
            className="block text-sm font-medium text-gray-300"
          >
            Título de la vacante
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
          />
        </div>

        <div>
          <label
            htmlFor="descripcion"
            className="block text-sm font-medium text-gray-300"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            required
            rows="4"
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
          ></textarea>
          <button
            type="button"
            onClick={() => {
              const descripcion = document.getElementById("descripcion").value;
              if (descripcion.length > 0) {
                analyzeDescription(descripcion);
              }
            }}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#EE4266] hover:bg-[#d13a5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EE4266]"
          >
            {isAnalyzing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Analizando...
              </>
            ) : (
              "Analizar Descripción"
            )}
          </button>
          {categorias && !isAnalyzing && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-300">
                Categorías sugeridas:
              </h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {categorias.map((categoria, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium bg-[#EE4266]/10 text-[#EE4266] rounded-full"
                  >
                    {categoria}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="sueldo"
            className="block text-sm font-medium text-gray-300"
          >
            Sueldo
          </label>
          <input
            type="number"
            id="sueldo"
            name="sueldo"
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
          />
        </div>

        <div>
          <label
            htmlFor="modalidad"
            className="block text-sm font-medium text-gray-300"
          >
            Modalidad
          </label>
          <select
            id="modalidad"
            name="modalidad"
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
          >
            <option value="Presencial">Presencial</option>
            <option value="En linea">En línea</option>
            <option value="Hibrido">Híbrido</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#EE4266] hover:bg-[#d13a5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EE4266]"
          >
            Crear Vacante
          </button>
        </div>
      </form>

      {apiResponse && (
        <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-2">
            Respuesta de la API:
          </h3>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
