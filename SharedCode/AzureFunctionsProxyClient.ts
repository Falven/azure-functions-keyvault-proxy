import { HttpRequest, Cookie } from "@azure/functions";
import { HttpClient } from "typed-rest-client/HttpClient";
import { IHttpClientResponse } from "typed-rest-client/Interfaces";
import { cloneDeep } from "lodash";

export class AzureFunctionsProxyClient {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(undefined);
  }

  private getRequestMethod(request: HttpRequest): string {
    return request.method;
  }

  private getProxyHref(proxyUrl: URL, request: HttpRequest): string {
    const requestUrl = new URL(request.url);
    return proxyUrl.origin + requestUrl.pathname + requestUrl.search;
  }

  private getProxyBody(request: HttpRequest): string {
    return request.body;
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

  /**
   * Proxies the given Azure Functions request to the provided proxyUrl
   * following [W3 Proxy guidelines.](https://www.w3.org/TR/ct-guidelines/#sec-introduction)
   * @param request The request to proxy.
   * @param endpointUrl The URL of the endpoint to proxy the request to.
   */
  async proxyRequest(
    request: HttpRequest,
    endpointUrl: URL
  ): Promise<IHttpResponse> {
    if (request == null) {
      throw new TypeError("Invalid parameter: request.");
    }
    if (endpointUrl == null) {
      throw new TypeError("Invalid parameter: proxyUrl.");
    }
    const proxyRequest = cloneDeep(request);
    const response = await this.httpClient.request(
      this.getRequestMethod(proxyRequest),
      this.getProxyHref(endpointUrl, proxyRequest),
      this.getProxyBody(proxyRequest),
      this.getProxyHeaders(endpointUrl, proxyRequest)
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
