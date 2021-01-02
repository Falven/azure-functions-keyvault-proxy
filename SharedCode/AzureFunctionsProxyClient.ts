import { HttpRequest, Cookie } from "@azure/functions";
import { HttpClient } from "typed-rest-client/HttpClient";
import { IHttpClientResponse } from "typed-rest-client/Interfaces";
import { cloneDeep } from "lodash";

/**
 * A minimal transparent proxy client that processes Azure function requests and responses.
 */
export class AzureFunctionsProxyClient {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(undefined);
  }

  /**
   * Sets the request's host header to the host and port number of the server to which the request is being sent (the proxy).
   * @param request The request whose host header to set.
   * @param endpointUrl The Url to extract the proxy host and port from.
   */
  private setHostHeader(request: HttpRequest, endpointUrl: URL): void {
    request.headers["host"] = endpointUrl.host;
  }

  /**
   * Sets the via header in accordance with [RFC 2616/W3 Proxy guidelines 4.1.6.1.](https://www.w3.org/TR/ct-guidelines/#sec-via-headers)
   * @param request The request whose via header to set.
   * @param endpointUrl The URL of the proxy.
   */
  private setViaHeader(request: HttpRequest, endpointUrl: URL): void {
    let viaHeader = request.headers["via"].trim();
    if (viaHeader) {
      viaHeader += ", ";
    }
    request.headers["via"] = `${viaHeader}1.1 ${endpointUrl.hostname}`;
  }

  /**
   * Sets the Url to the endpoint.
   * @param request The request used to construct the Url.
   * @param endpointUrl The URL of the endpoint.
   */
  private setEndpointUrl(request: HttpRequest, endpointUrl: URL): void {
    const requestUrl = new URL(request.url);
    request.url = endpointUrl.origin + requestUrl.pathname + requestUrl.search;
  }

  /**
   * Proxies the given Azure Functions request to the provided endpointUrl
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
      throw new TypeError("Invalid parameter: endpointUrl.");
    }

    const proxyRequest = cloneDeep(request);
    // Given that the function will be running on the Azure Function runtime, the x-forwarded-for header will already be set for us.
    this.setHostHeader(proxyRequest, endpointUrl);
    this.setViaHeader(proxyRequest, endpointUrl);
    this.setEndpointUrl(proxyRequest, endpointUrl);
    const response = await this.httpClient.request(
      proxyRequest.method,
      proxyRequest.url,
      proxyRequest.body,
      proxyRequest.headers
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

  private static parseCookies(cookiesHeader: string): Cookie[] {
    const cookies = cookiesHeader.split("; ");
    return cookies.map((cookieString) => {
      const cookieAttributes = cookieString.split("=");
      return {
        name: cookieAttributes[0],
        value: cookieAttributes[1],
      };
    });
  }

  static async fromHttpClientResponse(
    httpClientResponse: IHttpClientResponse
  ): Promise<IHttpResponse> {
    const httpClientResponseMessage = httpClientResponse.message;
    return {
      body: await httpClientResponse.readBody(),
      headers: httpClientResponseMessage.headers as { [key: string]: string },
      status: httpClientResponseMessage.statusCode,
      cookies: this.parseCookies(httpClientResponseMessage.headers["cookie"]),
    };
  }
}
