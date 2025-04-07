"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiHome, HiUser, HiBriefcase, HiLogout, HiMail } from "react-icons/hi";
import SidebarMenu from "../components/SidebarMenu";
import Sidebar from "../components/Sidebar";

export default function OportunidadesPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [vacantes, setVacantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

        console.log("Datos combinados del usuario:", combinedData);
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
        <SidebarMenu />
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
          <span className="text-2xl font-bold font-mono">Oportunidades</span>
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
            <div>
              <Link href="/para-ti">
                <button className="bg-gradient-to-r from-[#EE4266] to-[#5946C7] text-white font-bold  px-4 py-2 rounded-full hover:scale-105 transition-all duration-300 cursor-pointer">
                  Para ti ✨
                </button>
              </Link>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Todas las Oportunidades</h2>
                <span className="px-3 py-1 text-sm bg-[#EE4266] text-white rounded-full">
                  {
                    vacantes.filter((vacante) => {
                      const categoriasMatch =
                        vacante.descripcion.match(/Categorías: (.*)/);
                      if (!categoriasMatch || !categoriasMatch[1].trim())
                        return false;
                      if (searchTerm.trim() === "") return true;
                      const searchLower = searchTerm.toLowerCase();
                      const tituloLower = vacante.titulo.toLowerCase();
                      const descripcionLower =
                        vacante.descripcion.toLowerCase();
                      const categorias = categoriasMatch[1].toLowerCase();
                      return (
                        tituloLower.includes(searchLower) ||
                        descripcionLower.includes(searchLower) ||
                        categorias.includes(searchLower)
                      );
                    }).length
                  }
                </span>
              </div>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Buscar vacantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4266] focus:border-transparent"
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="grid max-h-[70vh] overflow-y-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vacantes
                .filter((vacante) => {
                  // Filtrar por categorías
                  const categoriasMatch =
                    vacante.descripcion.match(/Categorías: (.*)/);
                  if (!categoriasMatch || !categoriasMatch[1].trim())
                    return false;

                  // Filtrar por término de búsqueda
                  if (searchTerm.trim() === "") return true;

                  const searchLower = searchTerm.toLowerCase();
                  const tituloLower = vacante.titulo.toLowerCase();
                  const descripcionLower = vacante.descripcion.toLowerCase();
                  const categorias = categoriasMatch[1].toLowerCase();

                  return (
                    tituloLower.includes(searchLower) ||
                    descripcionLower.includes(searchLower) ||
                    categorias.includes(searchLower)
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

                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-300"
                      onClick={() => {
                        console.log(
                          "Información completa de la vacante:",
                          vacante
                        );
                      }}
                    >
                      <h3 className="text-lg font-semibold text-[#EE4266] mb-2">
                        {vacante.titulo}
                      </h3>
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
                        <span>Sueldo: ${vacante.sueldo}</span>
                        <span>Modalidad: {vacante.modalidad}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <span>Empresa: {vacante.empresa_nombre}</span>
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
