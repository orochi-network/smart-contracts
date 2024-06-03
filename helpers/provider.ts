import {
  FetchRequest,
  JsonRpcApiProvider,
  JsonRpcApiProviderOptions,
  JsonRpcPayload,
  JsonRpcProvider,
  JsonRpcResult,
  Networkish,
  Provider,
} from 'ethers';
import { Fill } from 'noqueue';
import axios, { AxiosResponse } from 'axios';

export class EthJsonRpc extends JsonRpcApiProvider implements Provider {
  #connect: FetchRequest;

  private url: string = '';

  constructor(url?: string | FetchRequest, network?: Networkish, options?: JsonRpcApiProviderOptions) {
    if (url == null) {
      url = 'http://localhost:8545';
    }
    super(network, options);

    if (typeof url === 'string') {
      this.url = url;
      this.#connect = new FetchRequest(url);
    } else {
      this.#connect = url.clone();
    }
  }

  public static _getConnection(): FetchRequest {
    throw new Error('This was by passed');
  }

  async _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult>> {
    const payloadArray = Array.isArray(payload) ? payload : [payload];
    return (await Fill(...payloadArray.map((p) => async () => this._sendInternal(p)))).map((e) => e.result);
  }

  async _sendInternal(payload: JsonRpcPayload): Promise<JsonRpcResult> {
    const headers = {
      'Content-Type': 'application/json',
    };
    const result: AxiosResponse<JsonRpcResult> = await axios.request({
      method: 'POST',
      headers,
      url: this.url,
      data: payload,
    });
    console.log(`Request to: ${this.url} payload:`, payload, result.data);
    return result.data;
  }
}

export default EthJsonRpc;
