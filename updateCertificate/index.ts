import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AzureFunctionsProxyClient } from "../SharedCode/AzureFunctionsProxyClient";
import { Environment } from "../SharedCode/Environment";

const updateCertificate: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const backendUrl = Environment.getBackendUrl();
  const proxyClient = new AzureFunctionsProxyClient();
  context.res = await proxyClient.patch(backendUrl, req);
};

export default updateCertificate;
