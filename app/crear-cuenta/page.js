"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import pdfToText from "react-pdftotext";

export default function CrearCuentaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    terms: false,
  });
  const [error, setError] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/home");
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const extractText = (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Por favor, selecciona un archivo PDF.");
      return;
    }

    setIsExtracting(true);
    setError("");

    pdfToText(file)
      .then((text) => {
        setExtractedText(text);
        setIsExtracting(false);
        analyzeText(text); // Automatically analyze the text after extraction
      })
      .catch((error) => {
        console.error("Error al extraer el texto:", error);
        alert("No se pudo extraer el texto del PDF.");
        setIsExtracting(false);
      });
  };

  const analyzeText = async (text) => {
    setIsAnalyzing(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al analizar el texto");
      }

      setCategories(data.categories);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Verificar que el texto ha sido extraído y analizado
    if (!extractedText) {
      setError("Por favor, sube tu CV en formato PDF");
      return;
    }

    if (!categories || categories.length === 0) {
      setError("Por favor, espera a que se complete el análisis de tu CV");
      return;
    }

    if (isAnalyzing) {
      setError("El análisis de tu CV aún está en proceso, por favor espera");
      return;
    }

    try {
      // Construir la URL con los parámetros en la query string
      const url = `https://jossred.josprox.com/api/jossrednewuser?username=${encodeURIComponent(
        formData.username
      )}&first_name=${encodeURIComponent(
        formData.firstName
      )}&last_name=${encodeURIComponent(
        formData.lastName
      )}&email=${encodeURIComponent(formData.email)}&phone=${encodeURIComponent(
        formData.phone
      )}&contra=${encodeURIComponent(formData.password)}`;

      console.log(url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 422) {
        if (
          data.errors &&
          data.errors.username &&
          data.errors.username.includes("validation.unique")
        ) {
          setError(
            "El nombre de usuario ya está registrado. Por favor, elige otro."
          );
        } else {
          setError("Error en la validación de datos");
        }
        return;
      }

      if (!response.ok) {
        setError(data.message || "Error al crear la cuenta");
        return;
      }

      if (!data.token) {
        setError("No se recibió un token válido");
        return;
      }

      Cookies.set("token", data.token, { expires: 7 });

      try {
        // Convert categories array to comma-separated string
        const categoriesString = categories.join(", ");

        // Make second API call
        const url2 = `https://bk.workmatch.ovh/api/usuarios?token_user=${
          data.token
        }&especialidades=${encodeURIComponent(
          categoriesString
        )}&curriculum=${encodeURIComponent(extractedText)}`;

        console.log(url2);
        const response2 = await fetch(url2, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response2.ok) {
          throw new Error("Error al registrar el perfil");
        }

        router.push("/home");
      } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        setError("Error al registrar el perfil");
      }
    } catch (error) {
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">Crear Cuenta</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre de usuario
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                maxLength={100}
                required
                pattern="[a-zA-Z0-9_]+"
                title="Solo letras, números y guiones bajos (_) están permitidos"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.username.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.firstName.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.lastName.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.email.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.phone.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.password.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Subir CV (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={extractText}
                className="w-full p-2 border rounded"
                required
              />
              {isExtracting && (
                <p className="text-sm text-blue-600 mt-1">
                  Extrayendo texto del PDF...
                </p>
              )}
              {isAnalyzing && (
                <p className="text-sm text-blue-600 mt-1">
                  Analizando CV con Gemini...
                </p>
              )}
              {categories.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">
                    Categorías encontradas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <Link
                href="/crear-cuenta-empresa"
                className="text-sm text-[#EE4266] hover:underline font-bold"
              >
                ¿Eres una empresa?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#EE4266] text-white py-3 px-4 rounded-lg font-bold hover:bg-[#d13a5c] transition-colors"
            >
              Crear Cuenta
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center">
                {error}
              </div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/ingresar"
              className="text-[#EE4266] hover:underline font-bold"
            >
              Ingresar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
