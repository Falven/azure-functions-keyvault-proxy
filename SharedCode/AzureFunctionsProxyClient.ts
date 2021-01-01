import { HttpRequest, Cookie } from "@azure/functions";
import { HttpClient } from "typed-rest-client/HttpClient";
import { IHttpClientResponse } from "typed-rest-client/Interfaces";

export class AzureFunctionsProxyClient {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(undefined);
  }

  private getProxyHref(proxyUrl: URL, request: HttpRequest): string {
    const requestUrl = new URL(request.url);
    return proxyUrl.origin + requestUrl.pathname + requestUrl.search;
  }

  /**
   * Sets the request's host header to the host and port number of the server to which the request is being sent (the proxy).
   * @param proxyUrl The Url to extract the proxy host and port from.
   * @param request The request whose host header to set.
   */
  private setHostHeader(proxyUrl: URL, request: HttpRequest): void {
    request.headers["host"] = proxyUrl.host;
  }

  /**
   *
   * @param proxyUrl
   * @param request
   */
  private setViaHeader(proxyUrl: URL, request: HttpRequest): void {
    request.headers["via"] = "";
  }

  private getProxyHeaders(
    proxyUrl: URL,
    request: HttpRequest
  ): { [key: string]: string } {
    // Given that the function will be running on the Azure Function runtime, the x-forwarded-for header will already be set for us.
    this.setHostHeader(proxyUrl, request);
    this.setViaHeader(proxyUrl, request);
    return request.headers;
  }

  private getProxyBody(request: HttpRequest): string {
    return request.body;
  }

  async request(
    verb: string,
    proxyUrl: URL,
    request: HttpRequest
  ): Promise<IHttpResponse> {
    if (verb == null) {
      throw new TypeError("Invalid parameter: verb.");
    }
    if (proxyUrl == null) {
      throw new TypeError("Invalid parameter: proxyUrl.");
    }
    if (request == null) {
      throw new TypeError("Invalid parameter: request.");
    }

    const response = await this.httpClient.request(
      verb,
      this.getProxyHref(proxyUrl, request),
      this.getProxyBody(request),
      this.getProxyHeaders(proxyUrl, request)
    );
    return await HttpResponse.fromHttpClientResponse(response);
  }
}

/**
 * Azure Functions HTTP response object.
 */
export interface IHttpResponse {
  /**
   * An object that contains the body of the response.
   */
  body?: any;
  /**
   * An object that contains the response headers.
   */
  headers: {
    [key: string]: string;
  };
  /**
   * Indicates that formatting is skipped for the response.
   */
  isRaw?: any;
  /**
   * The HTTP status code of the response.
   */
  status: number;
  /**
   * An array of HTTP cookie objects that are set in the response.
   * An HTTP cookie object has a name, value, and other cookie properties, such as maxAge or sameSite.
   */
  cookies: Cookie[];
}

/**
 * Azure Functions HTTP response object.
 */
export class HttpResponse implements IHttpResponse {
  /**
   * An object that contains the body of the response.
   */
  body?: any;
  /**
   * An object that contains the response headers.
   */
  headers: {
    [key: string]: string;
  };
  /**
   * Indicates that formatting is skipped for the response.
   */
  isRaw?: any;
  /**
   * The HTTP status code of the response.
   */
  status: number;
  /**
   * An array of HTTP cookie objects that are set in the response.
   * An HTTP cookie object has a name, value, and other cookie properties, such as maxAge or sameSite.
   */
  cookies: Cookie[];

  static async fromHttpClientResponse(
    httpClientResponse: IHttpClientResponse
  ): Promise<IHttpResponse> {
    return {
      body: await httpClientResponse.readBody(),
      headers: httpClientResponse.message.headers as { [key: string]: string },
      status: httpClientResponse.message.statusCode,
      cookies: undefined,
    };
  }
}
