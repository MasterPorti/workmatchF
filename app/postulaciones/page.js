"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { HiHome, HiUser, HiBriefcase, HiLogout, HiMail } from "react-icons/hi";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

export default function PostulacionesPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [postulaciones, setPostulaciones] = useState([]);
  const [filterStatus, setFilterStatus] = useState("todas");

  const filteredPostulaciones = postulaciones.filter((postulacion) => {
    if (filterStatus === "todas") return true;
    return postulacion.estado === filterStatus;
  });

  const fetchPostulaciones = useCallback(async () => {
    if (!userData?.token_user) return;

    try {
      const response = await fetch(
        `https://bk.workmatch.ovh/api/candidaturas/usuario?token_user=${userData.token_user}`
      );
      const data = await response.json();
      if (data.success) {
        setPostulaciones(data.data.data);
      }
    } catch (error) {
      console.error("Error al cargar las postulaciones:", error);
    }
  }, [userData]);

  useEffect(() => {
    const checkToken = async () => {
      const token = Cookies.get("token");
      if (!token) {
        router.push("/ingresar");
        return;
      }

      try {
        const response = await fetch(
          `https://jossred.josprox.com/api/jossredcheck?token=${token}`
        );
        const data = await response.json();

        const response2 = await fetch(
          `https://bk.workmatch.ovh/api/usuarios/${token}`
        );
        const data2 = await response2.json();

        if (!data2 || !data2.token_user) {
          setError("Token no válido");
          setTimeout(() => {
            Cookies.remove("token");
            router.push("/ingresar");
          }, 1000);
          return;
        }

        if (data.message === "Usuario no encontrado") {
          setError("Token no válido");
          setTimeout(() => {
            Cookies.remove("token");
            router.push("/ingresar");
          }, 1000);
          return;
        }

        if (!data.exists) {
          setError("Token no válido");
          Cookies.remove("token");
          router.push("/ingresar");
          return;
        }

        const combinedData = {
          ...data.user,
          ...data2,
        };

        console.log("Datos combinados del usuario:", combinedData);
        setUserData(combinedData);
      } catch (error) {
        setError("Error al verificar el token");
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [router]);

  useEffect(() => {
    if (userData?.token_user) {
      fetchPostulaciones();
    }
  }, [userData, fetchPostulaciones]);

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/ingresar");
  };

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "aceptado":
        return "bg-green-100 text-green-800";
      case "rechazado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-16 h-full flex flex-col items-center py-4 border-r border-gray-400/50">
          <svg
            width="29"
            height="29"
            viewBox="0 0 29 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-8"
          >
            <path
              d="M7.36938 22.7361V13.2665C8.01668 6.84553 19.2982 4.07392 21.61 13.2665C21.9799 16.0689 20.9719 21.7014 13.9811 21.8123C12.3628 21.5351 12.3166 18.163 13.9811 18.163C18.7615 18.163 20.0842 11.2339 14.4897 10.9106C13.565 0.9106 11.8285 11.145 10.9758 13.5436C10.9758 14.837 10.7292 20.3495 10.9758 22.5052C11.284 23.583 12.5848 25.6833 15.3219 25.4615C18.7434 25.1844 25.9561 21.7661 25.2626 14.1903C24.5691 6.61457 19.8993 4.07391 14.4897 3.61198C9.0801 3.15004 3.20817 9.06283 3.62429 15.0218C3.20817 16.1766 1.42348 17.4239 0.017911 15.0218C-0.244099 10.3562 2.26387 0.437464 14.4897 0.00887692C25.0314 -0.360675 29.7012 10.9106 28.9152 14.6984C28.9152 19.3178 25.0129 28.8984 15.3219 28.9723C12.9793 29.1878 8.10913 28.2424 7.36938 22.7361Z"
              fill="#EE4266"
            />
          </svg>
          <div className="flex flex-col items-center gap-6">
            <div className="w-10 h-10 rounded-full flex justify-center items-center hover:bg-red-100/50 cursor-pointer transition-all duration-300">
              <HiHome className="text-2xl text-[#EE4266] cursor-pointer hover:text-[#d13a5c]" />
            </div>
            <div className="w-10 h-10 rounded-full flex justify-center items-center hover:bg-red-100/50 cursor-pointer transition-all duration-300">
              <HiUser className="text-2xl text-[#EE4266] cursor-pointer hover:text-[#d13a5c]" />
            </div>
            <div className="w-10 h-10 rounded-full flex justify-center items-center hover:bg-red-100/50 cursor-pointer transition-all duration-300">
              <HiBriefcase className="text-2xl text-[#EE4266] cursor-pointer hover:text-[#d13a5c]" />
            </div>
          </div>
        </div>
        <div className="w-full h-full bg-[#fcfcfc] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EE4266]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="w-full h-full bg-[#fcfcfc]">
        <div className="w-full h-16 border-b flex justify-between items-center px-10 border-gray-400/50">
          <span className="text-2xl font-bold font-mono">
            Mis Postulaciones
          </span>
          <div className="relative">
            <div
              className="w-10 h-10 bg-gradient-to-r from-[#EE4266] to-[#2339ff] rounded-full flex justify-center items-center cursor-pointer"
              onMouseEnter={() => setShowMenu(true)}
              onMouseLeave={() => setShowMenu(false)}
            ></div>
            {showMenu && (
              <div
                className="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                onMouseEnter={() => setShowMenu(true)}
                onMouseLeave={() => setShowMenu(false)}
              >
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <HiMail className="text-[#EE4266]" />
                    <span className="text-sm truncate">
                      {userData?.email || "No disponible"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <HiLogout className="text-[#EE4266]" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-10">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold">
              ¡Hola, {userData?.username || "Usuario"}!
            </span>
            {userData?.especialidades && (
              <div className="flex gap-2">
                {userData.especialidades
                  .split(",")
                  .map((esp) => esp.trim())
                  .slice(0, 4)
                  .map((especialidad, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-[#EE4266]/10 text-[#EE4266] rounded-full"
                    >
                      {especialidad}
                    </span>
                  ))}
              </div>
            )}
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Mis Postulaciones</h2>

            <div className="mb-6 flex gap-4">
              <button
                onClick={() => setFilterStatus("todas")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterStatus === "todas"
                    ? "bg-[#EE4266] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus("pendiente")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterStatus === "pendiente"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFilterStatus("Aceptado")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterStatus === "Aceptado"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Aceptadas
              </button>
              <button
                onClick={() => setFilterStatus("Rechazado")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterStatus === "Rechazado"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Rechazadas
              </button>
            </div>

            <div className="mt-8">
              <div className="grid max-h-[65vh] overflow-y-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPostulaciones.map((postulacion, index) => {
                  const categoriasMatch =
                    postulacion.vacante.descripcion.match(/Categorías: (.*)/);
                  const categorias = categoriasMatch
                    ? categoriasMatch[1].split(", ").slice(0, 3)
                    : [];
                  const descripcionLimpia = categoriasMatch
                    ? postulacion.vacante.descripcion
                        .replace(/\n\nCategorías: .*/, "")
                        .trim()
                    : postulacion.vacante.descripcion;

                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-[#EE4266]">
                          {postulacion.vacante.titulo}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(
                            postulacion.estado
                          )}`}
                        >
                          {postulacion.estado}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 whitespace-pre-line overflow-y-auto h-32">
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
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Sueldo: ${postulacion.vacante.sueldo}</span>
                        <span>Modalidad: {postulacion.vacante.modalidad}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <span>Empresa: {postulacion.empresa.nombre}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        <span>
                          Postulado el:{" "}
                          {new Date(
                            postulacion.created_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
