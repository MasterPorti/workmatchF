"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { HiLogout, HiMail } from "react-icons/hi";
import CreateVacanteForm from "../components/CreateVacanteForm";
import SidebarEmpresas from "../components/SidebarEmpresas";

export default function HomeEmpresasPage() {
  const router = useRouter();
  const [empresaData, setEmpresaData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [vacantes, setVacantes] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchVacantes = async (empresaData) => {
    try {
      const response = await fetch(
        `https://bk.workmatch.ovh/api/vacantes?page=1&per_page=100`
      );
      const data = await response.json();
      // Filtrar las vacantes por empresa_id
      const vacantesFiltradas = data.vacantes.filter(
        (vacante) => vacante.empresa_id === empresaData.id
      );
      setVacantes(vacantesFiltradas);
    } catch (error) {
      console.error("Error al cargar las vacantes:", error);
    }
  };

  const handleDeleteVacante = async (vacanteId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta vacante?")) {
      return;
    }

    try {
      const params = new URLSearchParams({
        correo: empresaData.correo,
        contra: empresaData.contra,
      });

      const response = await fetch(
        `https://bk.workmatch.ovh/api/vacantes/${vacanteId}?${params.toString()}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Actualizar el estado eliminando la vacante
        setVacantes(vacantes.filter((vacante) => vacante.id !== vacanteId));
      } else {
        const errorData = await response.json();
        setError(
          `Error al eliminar la vacante: ${
            errorData.message || "Error desconocido"
          }`
        );
      }
    } catch (error) {
      console.error("Error al eliminar la vacante:", error);
      setError("Error al eliminar la vacante");
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = Cookies.get("empresaToken");
      const data = Cookies.get("empresaData");

      if (!token || !data) {
        router.push("/ingresar-empresas");
        return;
      }

      try {
        const empresaData = JSON.parse(data);
        setEmpresaData(empresaData);
        await fetchVacantes(empresaData);
      } catch (error) {
        setError("Error al cargar los datos de la empresa");
        router.push("/ingresar-empresas");
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("empresaToken");
    Cookies.remove("empresaData");
    router.push("/ingresar-empresas");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <SidebarEmpresas />
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EE4266]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <SidebarEmpresas />
      <div className="w-full h-full bg-gray-900">
        <div className="w-full h-16 border-b flex justify-between items-center px-10 border-gray-700">
          <span className="text-2xl font-bold font-mono text-white">
            Inicio
          </span>
          <div className="relative">
            <div
              className="w-10 h-10 bg-gradient-to-r from-[#EE4266] to-[#2339ff] rounded-full flex justify-center items-center cursor-pointer"
              onMouseEnter={() => setShowMenu(true)}
              onMouseLeave={() => setShowMenu(false)}
            ></div>
            {showMenu && (
              <div
                className="absolute right-0 mt-0 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50"
                onMouseEnter={() => setShowMenu(true)}
                onMouseLeave={() => setShowMenu(false)}
              >
                <div className="px-4 py-2 border-b border-gray-700">
                  <div className="flex items-center gap-2 text-gray-300">
                    <HiMail className="text-[#EE4266]" />
                    <span className="text-sm truncate">
                      {empresaData?.correo || "No disponible"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                >
                  <HiLogout className="text-[#EE4266]" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-10">
          <span className="text-2xl font-bold text-white">
            ¡Hola, {empresaData?.nombre || "Empresa"}!
          </span>

          <div className="mt-8">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setShowForm(false)}
                className={`text-xl font-bold px-4 py-2 rounded-lg transition-colors duration-300 ${
                  !showForm
                    ? "bg-[#EE4266] text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Tus Vacantes Publicadas
              </button>
              <button
                onClick={() => setShowForm(true)}
                className={`text-xl font-bold px-4 py-2 rounded-lg transition-colors duration-300 ${
                  showForm
                    ? "bg-[#EE4266] text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Crear Nueva Vacante
              </button>
            </div>

            {!showForm && (
              <div className="grid max-h-[70vh] overflow-y-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vacantes.map((vacante, index) => {
                  const categoriasMatch =
                    vacante.descripcion.match(/Categorías: (.*)/);
                  const categorias = categoriasMatch
                    ? categoriasMatch[1].split(", ").slice(0, 3)
                    : [];

                  const descripcionLimpia = categoriasMatch
                    ? vacante.descripcion
                        .replace(/\n\nCategorías: .*/, "")
                        .trim()
                    : vacante.descripcion;

                  return (
                    <div
                      key={index}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-sm"
                    >
                      <h3 className="text-lg font-semibold text-[#EE4266] mb-2">
                        {vacante.titulo}
                      </h3>
                      <p className="text-gray-300 text-sm mb-2 whitespace-pre-line overflow-y-auto h-32">
                        {descripcionLimpia}
                      </p>
                      {categorias.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {categorias.map((categoria, catIndex) => (
                            <span
                              key={catIndex}
                              className="px-2 py-1 text-xs font-medium bg-[#EE4266]/10 text-[#EE4266] rounded-full"
                            >
                              {categoria}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Sueldo: ${vacante.sueldo}</span>
                        <span>Modalidad: {vacante.modalidad}</span>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleDeleteVacante(vacante.id)}
                          className="px-3 py-1 text-sm text-white bg-[#EE4266] rounded-lg hover:bg-[#d13a5c] transition-colors duration-300"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {showForm && (
              <CreateVacanteForm
                empresaData={empresaData}
                onVacanteCreated={() => {
                  fetchVacantes(empresaData);
                  setShowForm(false);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
