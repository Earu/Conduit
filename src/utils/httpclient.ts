class HttpResult {
    public status: number;
    public content: string;
    public headers: any;

    constructor(req: XMLHttpRequest) {
        this.status = req.status;
        this.content = req.response;
        this.headers = this.getResponseHeaders(req);
    }

    private getResponseHeaders(req: XMLHttpRequest): any {
        let headers: any = {};
        let lines: string[] = req.getAllResponseHeaders().split('\r\n').filter(x => x.length > 0);
        for (let line of lines)
        {
            let pos: number = line.indexOf(':');
            let key: string = line.substring(0, pos + 1);
            let value: string = line.substring(pos + 1, line.length).trim();
            headers[key] = value;
        }

        return headers;
    }

    public asObject<T>(): T {
        if (!this.content) {
            return null;
        }

        return JSON.parse(this.content) as T;
    }

    public isSuccess(): boolean {
        if (!this.status) {
            return false;
        }

        return this.status === 200;
    }
}

export class HttpClient {
    private httpRequest(method: string, url: string, body?: string, headers?: any): Promise<HttpResult> {
        return new Promise((resolve, reject) => {
            try {
                let req = new XMLHttpRequest();
                req.timeout = 5000;
                req.onreadystatechange = () => {
                    if (req.readyState === 4) {
                        resolve(new HttpResult(req));
                    }
                };

                req.open(method, url);

                if (headers) {
                    for (let property in headers) {
                        req.setRequestHeader(property, headers[property]);
                    }
                }

                if (body) {
                    req.send(body);
                } else {
                    req.send(null);
                }
            } catch(err) {
                reject(err);
            }
        });
    }

    public get(url: string, headers?: any): Promise<HttpResult> {
        return this.httpRequest('GET', url, null, headers);
    }

    public patch(url: string, body: string, headers?: any): Promise<HttpResult> {
        return this.httpRequest('PATCH', url, body, headers);
    }

    public post(url: string, body: string, headers?: any): Promise<HttpResult> {
        return this.httpRequest('POST', url, body, headers);
    }
}