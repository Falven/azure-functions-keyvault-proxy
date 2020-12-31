import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AzureFunctionsProxyClient } from "../SharedCode/AzureFunctionsProxyClient";

const getDeletedKey: AzureFunction = async function (
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
  context.res = await proxyClient.get(backendUrl, req);
};

export default getDeletedKey;
