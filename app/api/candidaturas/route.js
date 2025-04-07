export async function POST(request) {
  // Obtener los datos del request
  const { searchParams } = new URL(request.url);

  // Construir URL para la API externa
  const apiUrl = `https://bk.workmatch.ovh/api/candidaturas?${searchParams.toString()}`;

  try {
    // Enviar solicitud a la API externa
    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Obtener la respuesta como JSON
    const data = await apiResponse.json();

    // Si la API externa devuelve un error
    if (!apiResponse.ok) {
      return Response.json(
        {
          success: false,
          message: data.message || "Error al enviar la candidatura",
          error: data.error,
        },
        { status: apiResponse.status }
      );
    }

    // Devolver la respuesta exitosa
    return Response.json({
      success: true,
      message: "Candidatura enviada correctamente",
      data,
    });
  } catch (error) {
    console.error("Error al procesar la candidatura:", error);

    // Devolver error en formato JSON
    return Response.json(
      {
        success: false,
        message: "Error interno al procesar la candidatura",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
