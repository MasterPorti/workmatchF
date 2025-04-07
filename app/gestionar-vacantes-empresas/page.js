"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { HiLogout, HiMail } from "react-icons/hi";
import SidebarEmpresas from "../components/SidebarEmpresas";

export default function GestionarVacantesEmpresasPage() {
  const router = useRouter();
  const [empresaData, setEmpresaData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [candidaturas, setCandidaturas] = useState([]);
  const [isLoadingCandidaturas, setIsLoadingCandidaturas] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todas");

  const filteredCandidaturas = candidaturas.filter((candidatura) => {
    if (filterStatus === "todas") return true;
    if (filterStatus === "pendientes")
      return candidatura.estado === "pendiente";
    if (filterStatus === "aceptadas") return candidatura.estado === "Aceptado";
    if (filterStatus === "rechazadas")
      return candidatura.estado === "Rechazado";
    return true;
  });

  const fetchCandidaturas = async (empresaData) => {
    try {
      const response = await fetch(
        `https://bk.workmatch.ovh/api/candidaturas/obtener?correo=${empresaData.correo}&contra=${empresaData.contra}`
      );
      const data = await response.json();
      if (data.success) {
        setCandidaturas(data.data);
      } else {
        setError("Error al cargar las candidaturas");
      }
    } catch (error) {
      console.error("Error al cargar las candidaturas:", error);
      setError("Error al cargar las candidaturas");
    } finally {
      setIsLoadingCandidaturas(false);
    }
  };

  const handleUpdateStatus = async (candidaturaId, nuevoEstado) => {
    if (!empresaData) return;

    setIsUpdating(true);
    try {
      const apiUrl = `https://bk.workmatch.ovh/api/candidaturas/actualizar-estado?correo=${empresaData.correo}&contrasena=${empresaData.contra}&candidatura_id=${candidaturaId}&nuevo_estado=${nuevoEstado}`;

      console.log("API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "PUT",
      });

      const data = await response.json();
      if (data.success) {
        // Actualizar el estado local
        setCandidaturas((prevCandidaturas) =>
          prevCandidaturas.map((candidatura) =>
            candidatura.id === candidaturaId
              ? { ...candidatura, estado: nuevoEstado }
              : candidatura
          )
        );
      } else {
        setError("Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      setError("Error al actualizar el estado");
    } finally {
      setIsUpdating(false);
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
        await fetchCandidaturas(empresaData);
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
            Gestionar Vacantes
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
            <h2 className="text-xl font-bold mb-4 text-white">
              Candidaturas Recibidas
            </h2>

            <div className="mb-6 flex gap-4">
              <button
                onClick={() => setFilterStatus("todas")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterStatus === "todas"
                    ? "bg-[#EE4266] text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus("pendientes")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterStatus === "pendientes"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFilterStatus("aceptadas")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterStatus === "aceptadas"
                    ? "bg-green-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Aceptadas
              </button>
              <button
                onClick={() => setFilterStatus("rechazadas")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterStatus === "rechazadas"
                    ? "bg-red-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Rechazadas
              </button>
            </div>

            {isLoadingCandidaturas ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#EE4266]"></div>
              </div>
            ) : error ? (
              <div className="text-red-400">{error}</div>
            ) : (
              <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Candidato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Vacante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredCandidaturas.map((candidatura) => (
                      <tr key={candidatura.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {candidatura.first_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {candidatura.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {candidatura.vacante_titulo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              candidatura.estado === "pendiente"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : candidatura.estado === "Aceptado"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {candidatura.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleUpdateStatus(candidatura.id, "pendiente")
                              }
                              disabled={isUpdating}
                              className="px-3 py-1 text-xs font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600 disabled:opacity-50"
                            >
                              Pendiente
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(candidatura.id, "Aceptado")
                              }
                              disabled={isUpdating}
                              className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(candidatura.id, "Rechazado")
                              }
                              disabled={isUpdating}
                              className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
