import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AzureFunctionsProxyClient } from "../SharedCode/AzureFunctionsProxyClient";

const createKey: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const backendEnv = process.env["AZURE_KEYVAULT_BACKEND_HOST"];
  if (backendEnv == null) {
    throw new Error(
      "The required Azure Function Application Setting AZURE_KEYVAULT_BACKEND_HOST has not been set."
    );
  }
  const backendUrl = new URL(backendEnv);
  const proxyClient = new AzureFunctionsProxyClient();
  context.res = await proxyClient.post(backendUrl, req);
};

export default createKey;
