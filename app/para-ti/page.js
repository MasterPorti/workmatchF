"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiHome, HiUser, HiBriefcase, HiLogout, HiMail } from "react-icons/hi";
import Sidebar from "../components/Sidebar";

export default function ParaTiPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [vacantes, setVacantes] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] =
    useState(null);
  const [postulacionStatus, setPostulacionStatus] = useState({});

  const fetchVacantes = async () => {
    try {
      const response = await fetch(
        `https://bk.workmatch.ovh/api/vacantes?page=1&per_page=100`
      );
      const data = await response.json();
      setVacantes(data.vacantes);
    } catch (error) {
      console.error("Error al cargar las vacantes:", error);
    }
  };

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

        setUserData(combinedData);
        await fetchVacantes();
      } catch (error) {
        setError("Error al verificar el token");
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/ingresar");
  };

  const handleEspecialidadClick = (especialidad) => {
    setEspecialidadSeleccionada(
      especialidad === especialidadSeleccionada ? null : especialidad
    );
  };

  const handlePostular = async (vacante) => {
    try {
      const response = await fetch(
        `https://bk.workmatch.ovh/api/candidaturas/postular?token_user=${userData.token_user}&vacante_id=${vacante.id}&empresa_id=${vacante.empresa_id}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      console.log("Respuesta de la postulación:", data);

      setPostulacionStatus((prev) => ({
        ...prev,
        [vacante.id]: {
          success: data.success,
          message: data.message,
        },
      }));

      if (data.success) {
        // Actualizar el estado de la vacante para mostrar que ya está postulada
        setVacantes((prevVacantes) =>
          prevVacantes.map((v) =>
            v.id === vacante.id ? { ...v, postulada: true } : v
          )
        );
        // Redirigir a la página de postulaciones después de 1 segundo
        setTimeout(() => {
          router.push("/postulaciones");
        }, 1000);
      }
    } catch (error) {
      console.error("Error al postular:", error);
      setPostulacionStatus((prev) => ({
        ...prev,
        [vacante.id]: {
          success: false,
          message: "Error al postular",
        },
      }));
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
            <Link
              href="/home"
              className="w-10 h-10 rounded-full flex justify-center items-center hover:bg-red-100/50 cursor-pointer transition-all duration-300"
            >
              <HiHome className="text-2xl text-[#EE4266] cursor-pointer hover:text-[#d13a5c]" />
            </Link>
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
          <span className="text-2xl font-bold font-mono">Para Ti</span>
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
                  .map((especialidad, index) => (
                    <button
                      key={index}
                      onClick={() => handleEspecialidadClick(especialidad)}
                      className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
                        especialidad === especialidadSeleccionada
                          ? "bg-gradient-to-r from-[#EE4266] to-[#5946C7] text-white"
                          : "bg-gradient-to-r from-[#EE4266]/50 to-[#5946C7]/50 text-black hover:from-[#EE4266]/70 hover:to-[#5946C7]/70"
                      }`}
                    >
                      {especialidad}
                    </button>
                  ))}
              </div>
            )}
          </div>
          <div className="text-sm mt-4 text-gray-500">
            Con base a tu Información estas son tus especialidades
          </div>
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Vacantes para ti</h2>
                <span className="px-3 py-1 text-sm bg-[#EE4266] text-white rounded-full">
                  {
                    vacantes.filter((vacante) => {
                      const categoriasMatch =
                        vacante.descripcion.match(/Categorías: (.*)/);
                      if (!categoriasMatch || !categoriasMatch[1].trim())
                        return false;

                      if (!especialidadSeleccionada) return true;

                      const categorias = categoriasMatch[1].toLowerCase();
                      return categorias.includes(
                        especialidadSeleccionada.toLowerCase()
                      );
                    }).length
                  }
                </span>
              </div>
            </div>
            <div className="grid max-h-[70vh] overflow-y-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vacantes
                .filter((vacante) => {
                  const categoriasMatch =
                    vacante.descripcion.match(/Categorías: (.*)/);
                  if (!categoriasMatch || !categoriasMatch[1].trim())
                    return false;

                  if (!especialidadSeleccionada) return true;

                  const categorias = categoriasMatch[1].toLowerCase();
                  return categorias.includes(
                    especialidadSeleccionada.toLowerCase()
                  );
                })
                .map((vacante, index) => {
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

                  // Encontrar la categoría que coincide exactamente
                  const categoriaCoincidente = categorias.find((categoria) =>
                    userData?.especialidades
                      ?.split(",")
                      .map((esp) => esp.toLowerCase().trim())
                      .includes(categoria.toLowerCase().trim())
                  );

                  // Solo mostrar la vacante si tiene una categoría coincidente
                  if (!categoriaCoincidente) return null;

                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <h3 className="text-lg font-semibold text-[#EE4266] mb-2">
                        {vacante.titulo}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 whitespace-pre-line overflow-y-auto h-32">
                        {descripcionLimpia}
                      </p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Sueldo: ${vacante.sueldo}</span>
                        <span>Modalidad: {vacante.modalidad}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <span>Empresa: {vacante.empresa_nombre}</span>
                      </div>
                      <div className="mt-2 text-sm text-[#EE4266] font-medium">
                        <span>Coincide con tu especialidad: </span>
                        <span className="bg-[#EE4266]/10 px-2 py-1 rounded-full">
                          {categoriaCoincidente}
                        </span>
                      </div>
                      <div className="mt-4">
                        {postulacionStatus[vacante.id]?.success ? (
                          <div className="text-green-600 text-sm font-medium">
                            {postulacionStatus[vacante.id].message}
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePostular(vacante);
                            }}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-300 ${
                              vacante.postulada
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "bg-[#EE4266] text-white hover:bg-[#d13a5c]"
                            }`}
                            disabled={vacante.postulada}
                          >
                            {vacante.postulada ? "Postulado" : "Postularme"}
                          </button>
                        )}
                        {postulacionStatus[vacante.id]?.success === false && (
                          <div className="text-red-600 text-sm mt-1">
                            {postulacionStatus[vacante.id].message}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
