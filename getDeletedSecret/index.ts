import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AzureFunctionsProxyClient } from "../SharedCode/AzureFunctionsProxyClient";
import { Environment } from "../SharedCode/Environment";

const getDeletedSecret: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.res = await new AzureFunctionsProxyClient().proxyRequest(
    req,
    Environment.getBackendUrl()
  );
};

export default getDeletedSecret;
