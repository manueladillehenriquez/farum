import { z } from "zod";

// Mensajes de validación por defecto en español (los esquemas definen
// mensajes propios donde el usuario los ve; esto cubre el resto).
z.config(z.locales.es());
