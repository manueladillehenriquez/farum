import "server-only";
import {
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  WebpayPlus,
} from "transbank-sdk";
import { serverEnv } from "@/lib/server/env";

/**
 * Transacción de Webpay Plus según el ambiente configurado.
 *
 *  - "integration" (por defecto): sandbox de Transbank. El SDK trae las
 *    credenciales públicas de prueba, así que no hace falta configurar nada
 *    y NUNCA se cobra dinero real.
 *  - "production": exige TRANSBANK_COMMERCE_CODE y TRANSBANK_API_KEY
 *    (credenciales reales entregadas por Transbank al validar el comercio).
 */
export function getWebpayTransaction() {
  if (serverEnv.transbankEnvironment === "production") {
    return WebpayPlus.Transaction.buildForProduction(
      serverEnv.transbankCommerceCode,
      serverEnv.transbankApiKey,
    );
  }
  return WebpayPlus.Transaction.buildForIntegration(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
  );
}

/** ¿Estamos en sandbox? (se muestra un aviso en el checkout) */
export function isWebpaySandbox(): boolean {
  return serverEnv.transbankEnvironment !== "production";
}

/** Forma de la respuesta de commit/status que usamos (el SDK devuelve any). */
export interface WebpayCommitResult {
  status?: string;
  response_code?: number;
  amount?: number;
  buy_order?: string;
  authorization_code?: string;
}
