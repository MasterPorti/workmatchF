"use client";

import { useState } from "react";

export default function InyectarDatosPage() {
  const [formData, setFormData] = useState({
    correo: "",
    contra: "",
    titulo: "",
    descripcion: "",
    sueldo: "30000", // Sueldo por defecto
    modalidad: "En linea",
  });
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Estado para el JSON de vacantes
  const [jsonVacantes, setJsonVacantes] = useState("");
  const [vacantesArray, setVacantesArray] = useState([]);
  const [currentVacanteIndex, setCurrentVacanteIndex] = useState(-1);
  const [vacantesResults, setVacantesResults] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCategoria = () => {
    if (
      nuevaCategoria.trim() !== "" &&
      !categorias.includes(nuevaCategoria.trim())
    ) {
      setCategorias([...categorias, nuevaCategoria.trim()]);
      setNuevaCategoria("");
    }
  };

  const handleRemoveCategoria = (index) => {
    setCategorias(categorias.filter((_, i) => i !== index));
  };

  const handleJsonChange = (e) => {
    setJsonVacantes(e.target.value);
    try {
      const parsedJson = JSON.parse(e.target.value);
      if (Array.isArray(parsedJson)) {
        setVacantesArray(parsedJson);
        setError(null);
      } else {
        setVacantesArray([]);
        setError("El JSON debe ser un array de vacantes");
      }
    } catch (err) {
      setVacantesArray([]);
      if (e.target.value.trim() !== "") {
        setError("JSON inválido: " + err.message);
      } else {
        setError(null);
      }
    }
  };

  const loadVacante = (index) => {
    if (index >= 0 && index < vacantesArray.length) {
      const vacante = vacantesArray[index];

      // Actualizar el formulario con los datos de la vacante
      setFormData((prev) => ({
        ...prev,
        titulo: vacante.titulo || "",
        descripcion: vacante.descripcion || "",
      }));

      // Establecer las categorías
      if (vacante.categorias) {
        const categoriasArray = vacante.categorias
          .split(",")
          .map((cat) => cat.trim());
        setCategorias(categoriasArray);
      } else {
        setCategorias([]);
      }

      setCurrentVacanteIndex(index);
    }
  };

  const handleNextVacante = () => {
    if (currentVacanteIndex < vacantesArray.length - 1) {
      loadVacante(currentVacanteIndex + 1);
    }
  };

  const handlePrevVacante = () => {
    if (currentVacanteIndex > 0) {
      loadVacante(currentVacanteIndex - 1);
    }
  };

  const processJson = () => {
    if (vacantesArray.length > 0) {
      loadVacante(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Agregar categorías a la descripción
      const descripcionConCategorias =
        categorias.length > 0
          ? `${formData.descripcion}\n\nCategorías: ${categorias.join(", ")}`
          : formData.descripcion;

      // Construir la URL con parámetros de consulta para la API
      const params = new URLSearchParams();

      // Reemplazar la descripción original con la que incluye categorías
      const formDataConCategorias = {
        ...formData,
        descripcion: descripcionConCategorias,
      };

      Object.entries(formDataConCategorias).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      // Realizar la solicitud a la API externa
      const response = await fetch(
        `https://bk.workmatch.ovh/api/vacantes?${params.toString()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear la vacante");
      }

      setResponse(data);

      // Guardar el resultado para esta vacante
      if (currentVacanteIndex >= 0) {
        const updatedResults = [...vacantesResults];
        updatedResults[currentVacanteIndex] = {
          index: currentVacanteIndex,
          titulo: formData.titulo,
          response: data,
          success: true,
        };
        setVacantesResults(updatedResults);

        // Cargar la siguiente vacante automáticamente si existe
        if (currentVacanteIndex < vacantesArray.length - 1) {
          setTimeout(() => {
            handleNextVacante();
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Error al enviar los datos");

      // Guardar el error para esta vacante
      if (currentVacanteIndex >= 0) {
        const updatedResults = [...vacantesResults];
        updatedResults[currentVacanteIndex] = {
          index: currentVacanteIndex,
          titulo: formData.titulo,
          error: error.message || "Error al enviar los datos",
          success: false,
        };
        setVacantesResults(updatedResults);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <div className="w-full md:w-1/2 bg-white rounded-xl shadow-md overflow-hidden p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Crear Vacantes desde JSON
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa un JSON de vacantes y envíalas una por una
            </p>
          </div>

          {/* Sección para cargar JSON */}
          <div className="mb-8 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium mb-2">
              Paso 1: Cargar JSON de vacantes
            </h3>
            <textarea
              value={jsonVacantes}
              onChange={handleJsonChange}
              rows="6"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
              placeholder='[{"titulo": "Título de la vacante", "descripcion": "Descripción...", "categorias": "Categoría1, Categoría2"}]'
            ></textarea>
            <div className="mt-2 flex justify-between">
              <span className="text-xs text-gray-500">
                {vacantesArray.length} vacantes cargadas
              </span>
              <button
                type="button"
                onClick={processJson}
                disabled={vacantesArray.length === 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#EE4266] hover:bg-[#d13a5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EE4266] disabled:opacity-50"
              >
                Procesar JSON
              </button>
            </div>
          </div>

          {/* Controles de navegación entre vacantes */}
          {currentVacanteIndex >= 0 && (
            <div className="mb-4 flex justify-between items-center">
              <button
                type="button"
                onClick={handlePrevVacante}
                disabled={currentVacanteIndex <= 0}
                className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EE4266] disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm font-medium">
                Vacante {currentVacanteIndex + 1} de {vacantesArray.length}
              </span>
              <button
                type="button"
                onClick={handleNextVacante}
                disabled={currentVacanteIndex >= vacantesArray.length - 1}
                className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EE4266] disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="correo"
                className="block text-sm font-medium text-gray-700"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
                required
                placeholder="ejemplo@dominio.com"
              />
            </div>

            <div>
              <label
                htmlFor="contra"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="contra"
                name="contra"
                value={formData.contra}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="titulo"
                className="block text-sm font-medium text-gray-700"
              >
                Título de la Vacante
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="descripcion"
                className="block text-sm font-medium text-gray-700"
              >
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
                required
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="categorias"
                className="block text-sm font-medium text-gray-700"
              >
                Categorías
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  id="categorias"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
                  placeholder="Ej: Desarrollo Web Frontend"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategoria();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCategoria}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#EE4266] hover:bg-[#d13a5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EE4266]"
                >
                  +
                </button>
              </div>
              {categorias.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {categorias.map((categoria, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#EE4266]/10 text-[#EE4266]"
                    >
                      <span className="text-sm">{categoria}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategoria(index)}
                        className="text-[#EE4266] hover:text-[#b83451] focus:outline-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Las categorías se agregarán al final de la descripción en el
              </p>
            </div>

            <div>
              <label
                htmlFor="sueldo"
                className="block text-sm font-medium text-gray-700"
              >
                Sueldo
              </label>
              <input
                type="number"
                id="sueldo"
                name="sueldo"
                value={formData.sueldo}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="modalidad"
                className="block text-sm font-medium text-gray-700"
              >
                Modalidad
              </label>
              <select
                id="modalidad"
                name="modalidad"
                value={formData.modalidad}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#EE4266] focus:border-[#EE4266]"
                required
              >
                <option value="Presencial">Presencial</option>
                <option value="En linea">En línea</option>
                <option value="Hibrido">Híbrido</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || currentVacanteIndex < 0}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#EE4266] hover:bg-[#d13a5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EE4266] disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Crear Vacante"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 bg-white rounded-xl shadow-md overflow-hidden p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Respuestas</h2>
            <p className="mt-2 text-sm text-gray-600">
              Resultados de las vacantes procesadas
            </p>
          </div>

          {/* Respuesta actual */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EE4266]"></div>
            </div>
          ) : response ? (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Respuesta - Vacante {currentVacanteIndex + 1}
              </h3>
              <pre className="text-sm overflow-auto max-h-48 bg-white p-4 rounded border border-gray-200">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          ) : null}

          {/* Historial de respuestas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Historial de Vacantes Procesadas
            </h3>
            {vacantesResults && vacantesResults.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-auto pr-2">
                {vacantesResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result?.success
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">
                        {index + 1}. {result?.titulo || "Sin título"}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          result?.success
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result?.success ? "Éxito" : "Error"}
                      </span>
                    </div>
                    {result?.error && (
                      <p className="text-xs text-red-700 mt-1">
                        {result.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6">
                No hay vacantes procesadas aún
              </div>
            )}
          </div>

          {/* Ejemplo de JSON */}
          <div className="mt-8 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Ejemplo de JSON
            </h3>
            <pre className="text-xs text-blue-700 overflow-auto max-h-48 bg-white p-2 rounded border border-blue-100">
              {`[
  {
    "titulo": "Ingeniero/a DevOps – AWS + Kubernetes #71",
    "descripcion": "Estamos buscando un/a ingeniero/a DevOps con experiencia en AWS, CI/CD y Kubernetes. Tendrás a tu cargo la automatización de procesos de integración y despliegue continuo para el proyecto #71 proyectos en producción.",
    "categorias": "DevOps, Cloud Computing AWS, Contenedores Kubernetes, Automatización, Administración Servidores"
  },
  {
    "titulo": "Diseñador/a Web – WordPress + SEO #58",
    "descripcion": "Se requiere diseñador/a web con experiencia en WordPress y buenas prácticas SEO para el proyecto #58 crear sitios optimizados para el proyecto #58 buscadores. Se valoran conocimientos en UI.",
    "categorias": "Diseño Web, SEO, Diseño UI, Marketing Digital, Comercio Electrónico"
  }
]`}
            </pre>
            <button
              className="mt-2 text-xs font-medium text-blue-700 hover:text-blue-900"
              onClick={() => {
                setJsonVacantes(`[
  {
    "titulo": "Ingeniero/a DevOps – AWS + Kubernetes #71",
    "descripcion": "Estamos buscando un/a ingeniero/a DevOps con experiencia en AWS, CI/CD y Kubernetes. Tendrás a tu cargo la automatización de procesos de integración y despliegue continuo para el proyecto #71 proyectos en producción.",
    "categorias": "DevOps, Cloud Computing AWS, Contenedores Kubernetes, Automatización, Administración Servidores"
  },
  {
    "titulo": "Diseñador/a Web – WordPress + SEO #58",
    "descripcion": "Se requiere diseñador/a web con experiencia en WordPress y buenas prácticas SEO para el proyecto #58 crear sitios optimizados para el proyecto #58 buscadores. Se valoran conocimientos en UI.",
    "categorias": "Diseño Web, SEO, Diseño UI, Marketing Digital, Comercio Electrónico"
  },
  {
    "titulo": "Desarrollador/a iOS – Swift #15",
    "descripcion": "Incorporamos un/a desarrollador/a iOS con experiencia en Swift para el proyecto #15 el desarrollo de nuevas funcionalidades en nuestra app móvil de salud digital.",
    "categorias": "Desarrollo Móvil iOS, Swift, Salud Digital, Desarrollo Front-End, Desarrollo de APIs"
  },
  {
    "titulo": "Ingeniero/a DevOps – AWS + Kubernetes",
    "descripcion": "Buscamos un/a ingeniero/a DevOps con experiencia en AWS, CI/CD y Kubernetes. Tendrás a tu cargo la automatización de procesos de integración y despliegue continuo para proyectos en producción.",
    "categorias": "DevOps, Cloud Computing AWS, Contenedores Kubernetes, Automatización, Administración Servidores"
  }
]`);
                handleJsonChange({
                  target: {
                    value: `[
  {
    "titulo": "Ingeniero/a DevOps – AWS + Kubernetes #71",
    "descripcion": "Estamos buscando un/a ingeniero/a DevOps con experiencia en AWS, CI/CD y Kubernetes. Tendrás a tu cargo la automatización de procesos de integración y despliegue continuo para el proyecto #71 proyectos en producción.",
    "categorias": "DevOps, Cloud Computing AWS, Contenedores Kubernetes, Automatización, Administración Servidores"
  },
  {
    "titulo": "Diseñador/a Web – WordPress + SEO #58",
    "descripcion": "Se requiere diseñador/a web con experiencia en WordPress y buenas prácticas SEO para el proyecto #58 crear sitios optimizados para el proyecto #58 buscadores. Se valoran conocimientos en UI.",
    "categorias": "Diseño Web, SEO, Diseño UI, Marketing Digital, Comercio Electrónico"
  },
  {
    "titulo": "Desarrollador/a iOS – Swift #15",
    "descripcion": "Incorporamos un/a desarrollador/a iOS con experiencia en Swift para el proyecto #15 el desarrollo de nuevas funcionalidades en nuestra app móvil de salud digital.",
    "categorias": "Desarrollo Móvil iOS, Swift, Salud Digital, Desarrollo Front-End, Desarrollo de APIs"
  },
  {
    "titulo": "Ingeniero/a DevOps – AWS + Kubernetes",
    "descripcion": "Buscamos un/a ingeniero/a DevOps con experiencia en AWS, CI/CD y Kubernetes. Tendrás a tu cargo la automatización de procesos de integración y despliegue continuo para proyectos en producción.",
    "categorias": "DevOps, Cloud Computing AWS, Contenedores Kubernetes, Automatización, Administración Servidores"
  }
]`,
                  },
                });
              }}
            >
              Cargar este ejemplo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
