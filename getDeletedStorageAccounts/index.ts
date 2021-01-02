import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AzureFunctionsProxyClient } from "../SharedCode/AzureFunctionsProxyClient";
import { Environment } from "../SharedCode/Environment";

const getDeletedStorageAccounts: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.res = await new AzureFunctionsProxyClient().request(
    context.bindings.req.method,
    Environment.getBackendUrl(),
    req
  );
};

export default getDeletedStorageAccounts;
