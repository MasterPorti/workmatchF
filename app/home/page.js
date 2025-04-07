"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { HiHome, HiUser, HiBriefcase, HiLogout, HiMail } from "react-icons/hi";
import Link from "next/link";
import SidebarMenu from "../components/SidebarMenu";
import Sidebar from "../components/Sidebar";

export default function HomePage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [vacantes, setVacantes] = useState([]);

  const fetchVacantes = async () => {
    try {
      const response = await fetch(
        `https://bk.workmatch.ovh/api/vacantes?page=1&per_page=10`
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
          <span className="text-2xl font-bold font-mono">Inicio</span>
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
          <div className="w-full mt-5 h-44 rounded-lg bg-[#f3f3f3] border border-gray-400/50">
            <div className="flex justify-between items-center">
              <div className="w-1/2 h-6 bg-[#297c3b] rounded-tl-lg"></div>
              <div className="w-1/2 h-6 bg-[#666666] rounded-tr-lg"></div>
            </div>
            <div className="flex justify-between border-b border-gray-400/50 items-center">
              <div className="w-1/2 h-6 mx-5 my-2 font-mono font-bold text-gray-500">
                Paso 1: Completar perfil
              </div>
              <div className="w-1/2 h-6 mx-5 my-2 font-mono text-gray-500 font-bold">
                Paso 2: Aplica a tu primer trabajo
              </div>
            </div>
            <div className="flex justify-between px-10 py-5 items-center w-full">
              <div className="flex gap-6">
                <svg
                  width="65"
                  height="55"
                  viewBox="4 6 65 55"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinejoin="round"
                >
                  <path d="M11.6233 21.8732C11.2266 22.0997 6.41579 32.1009 9.69673 39.9388C12.0199 45.4887 14.0031 50.8688 23.0693 52.9075C32.1354 54.9463 41.8815 52.2279 46.5279 43.45C51.1743 34.672 49.701 24.9879 45.168 19.438C40.6349 13.8881 30.7835 8.8111 21.4827 12.982C14.2647 16.2189 11.6233 21.8732 11.6233 21.8732Z"></path>
                  <path d="M18.3392 25.6815C18.0559 25.7948 15.1061 32.1388 17.0359 37.1778C18.3392 40.5803 19.8691 44.1435 25.8754 45.3894C31.8817 46.6353 38.2847 44.993 41.3445 39.3864C44.4043 33.7799 43.441 27.6636 40.4379 24.0958C37.4347 20.528 31.4263 17.7999 24.8555 20.0183C20.228 21.5806 18.3392 25.6815 18.3392 25.6815Z"></path>
                  <path d="M25.6803 30.1031C25.567 30.1597 24.3767 32.6609 25.1098 34.3586C25.7821 35.9154 26.3036 36.9555 28.5135 37.4086C30.7234 37.8617 33.1032 37.2387 34.2932 35.1433C35.4264 33.0479 35.0864 30.7827 33.9532 29.4801C32.8199 28.1776 30.2432 26.7275 28.1466 27.8601C26.0501 28.9928 25.6803 30.1031 25.6803 30.1031Z"></path>
                  <path d="M30.3037 32.4995L48.4555 25.9893"></path>
                  <path d="M60.7666 16.5742L60.4021 17.7766C59.8944 19.451 59.3861 21.0821 58.8367 22.7502L65.0687 25.1032L51.2939 29.6702L45.8856 27.0994L47.4983 22.4574L47.5039 22.4434C47.7841 21.7432 48.2953 21.1396 49.056 20.8354L49.0628 20.8328L49.0641 20.8323C50.6922 20.2024 52.3234 19.5713 54.0005 18.94C53.9081 19.2174 53.8094 19.5128 53.7099 19.8095C53.5047 20.4213 53.2965 21.0365 53.1329 21.5085C53.051 21.745 52.9812 21.9426 52.929 22.085C52.9027 22.1567 52.8824 22.2103 52.868 22.2462L52.8596 22.2667C52.7044 22.5581 52.7925 22.9254 53.073 23.1125C53.3716 23.3117 53.7752 23.2311 53.9744 22.9324C54.0101 22.879 54.034 22.8256 54.0408 22.8103L54.0415 22.8087C54.053 22.7831 54.0644 22.7556 54.0749 22.7293C54.0962 22.676 54.1216 22.6088 54.1495 22.5326C54.2058 22.3792 54.2785 22.1729 54.3613 21.9342C54.527 21.4559 54.7368 20.8358 54.9424 20.2229C55.1481 19.6096 55.3502 19.0018 55.5009 18.5475C55.5206 18.4881 55.5394 18.4312 55.5573 18.3774C55.6306 18.3512 55.7038 18.325 55.777 18.2988L55.777 18.2988C57.0536 17.8422 58.3154 17.3909 59.5746 16.9713L60.7666 16.5742ZM52.8555 22.2763C52.8529 22.2821 52.8533 22.2807 52.8564 22.2743L52.8555 22.2763Z"></path>
                  <path d="M10.0421 40.7658C12.2349 46.0159 14.4545 50.97 23.0693 52.9073C32.1354 54.946 41.8815 52.2277 46.5279 43.4497C49.1479 38.5 49.8221 33.2622 49.0991 28.6399L49.8263 28.5498C51.6692 39.4405 48.9852 43.9307 44.4656 48.8877C38.8956 54.9964 31.2879 54.8809 27.5154 54.8193C21.3145 54.7278 16.936 51.7979 12.9418 46.7939C11.5227 45.016 10.6183 42.8368 10.0421 40.7658Z"></path>
                </svg>
                <div className="w-full h-full flex flex-col justify-center r">
                  <span className="text-lg font-bold">
                    Aplica a tu primera oportunidad
                  </span>
                  <span className="text-sm text-gray-500">
                    Descubre las posiciones que tenemos para tí y da el primer
                    paso hacia tu próximo empleo.
                  </span>
                </div>
              </div>
              <Link
                href="/oportunidades"
                className="bg-[#EE4266] text-white px-4 py-2 rounded-full hover:bg-[#d13a5c] transition-all duration-300 cursor-pointer font-bold"
              >
                Ver oportunidades
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-0 mx-10">
          <h2 className="text-xl font-bold mb-4">
            Explora las oportunidades laborales
          </h2>
          <div className="grid  max-h-[55vh] overflow-y-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vacantes
              .filter((vacante) => {
                const categoriasMatch =
                  vacante.descripcion.match(/Categorías: (.*)/);
                return categoriasMatch && categoriasMatch[1].trim() !== "";
              })
              .slice(0, 4)
              .map((vacante, index) => {
                const descripcionLimpia = vacante.descripcion
                  .replace(/\n\nCategorías: .*/, "")
                  .trim();
                const categoriasMatch =
                  vacante.descripcion.match(/Categorías: (.*)/);
                const categorias = categoriasMatch
                  ? categoriasMatch[1].split(", ").slice(0, 3)
                  : [];

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
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
