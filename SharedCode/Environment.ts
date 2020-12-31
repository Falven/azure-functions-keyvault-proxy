export class Environment {
  static getBackendUrl(): URL {
    const backendEnv = process.env["AZURE_KEYVAULT_BACKEND_HOST"];
    if (backendEnv == null) {
      throw new Error(
        "The required Azure Function Application Setting AZURE_KEYVAULT_BACKEND_HOST has not been set."
      );
    }
    return new URL(backendEnv);
  }
}
