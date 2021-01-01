import { HttpRequest, Cookie } from "@azure/functions";
import { HttpClient } from "typed-rest-client/HttpClient";
import { IHttpClientResponse, IHeaders } from "typed-rest-client/Interfaces";

export class AzureFunctionsProxyClient {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(undefined);
  }

  private validateProxyRequest(proxyUrl: URL, request: HttpRequest) {
    if (proxyUrl == null) {
      throw new TypeError("Invalid parameter: proxyUrl.");
    }
    if (request == null) {
      throw new TypeError("Invalid parameter: request.");
    }
  }

  private getProxyHref(proxyUrl: URL, request: HttpRequest): string {
    this.validateProxyRequest(proxyUrl, request);
    const requestUrl = new URL(request.url);
    return proxyUrl.origin + requestUrl.pathname + requestUrl.search;
  }

  private setHostHeader(proxyUrl: URL, request: HttpRequest): void {
    this.validateProxyRequest(proxyUrl, request);
    request.headers["host"] = proxyUrl.host;
  }

  private getProxyHeaders(
    proxyUrl: URL,
    request: HttpRequest
  ): { [key: string]: string } {
    this.setHostHeader(proxyUrl, request);
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
    const response = await this.httpClient.request(
      verb,
      this.getProxyHref(proxyUrl, request),
      this.getProxyBody(request),
      this.getProxyHeaders(proxyUrl, request)
    );
    return await HttpResponse.fromHttpClientResponse(response);
  }

  async get(proxyUrl: URL, request: HttpRequest): Promise<IHttpResponse> {
    this.validateProxyRequest(proxyUrl, request);
    const response = await this.httpClient.get(
      this.getProxyHref(proxyUrl, request),
      this.getProxyHeaders(proxyUrl, request)
    );
    return await HttpResponse.fromHttpClientResponse(response);
  }

  async post(proxyUrl: URL, request: HttpRequest): Promise<IHttpResponse> {
    this.validateProxyRequest(proxyUrl, request);
    const response = await this.httpClient.post(
      this.getProxyHref(proxyUrl, request),
      this.getProxyBody(request),
      this.getProxyHeaders(proxyUrl, request)
    );
    return await HttpResponse.fromHttpClientResponse(response);
  }

  async patch(proxyUrl: URL, request: HttpRequest): Promise<IHttpResponse> {
    this.validateProxyRequest(proxyUrl, request);
    const response = await this.httpClient.patch(
      this.getProxyHref(proxyUrl, request),
      this.getProxyBody(request),
      this.getProxyHeaders(proxyUrl, request)
    );
    return await HttpResponse.fromHttpClientResponse(response);
  }

  async put(proxyUrl: URL, request: HttpRequest): Promise<IHttpResponse> {
    this.validateProxyRequest(proxyUrl, request);
    const response = await this.httpClient.put(
      this.getProxyHref(proxyUrl, request),
      this.getProxyBody(request),
      this.getProxyHeaders(proxyUrl, request)
    );
    return await HttpResponse.fromHttpClientResponse(response);
  }

  async delete(proxyUrl: URL, request: HttpRequest): Promise<IHttpResponse> {
    this.validateProxyRequest(proxyUrl, request);
    const response = await this.httpClient.del(
      this.getProxyHref(proxyUrl, request),
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
