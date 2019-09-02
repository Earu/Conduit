class HttpResult {
    private code: number;
    private innerContent: string;

    constructor(httpCode: number, content: string) {
        this.code = httpCode;
        this.innerContent = content;
    }

    public get httpCode(): number {
        if (!this.code) {
            return -1;
        }

        return this.code;
    }

    public get content(): string {
        if (this.innerContent) {
            return "";
        }

        return this.innerContent;
    }

    public readAs<T>(): T {
        if (!this.content) return null;

        return JSON.parse(this.content) as T;
    }

    public isSuccess(): boolean {
        return this.code === 200;
    }
}

export class HttpClient {
    private httpRequest(method: string, url: string, body?: string, headers?: any): Promise<HttpResult> {
        return new Promise((resolve, reject) => {
            try {
                let req = new XMLHttpRequest();
                req.onreadystatechange = () => {
                    if (req.readyState === 4) {
                        resolve(new HttpResult(req.status, req.response));
                    }
                };

                if (headers) {
                    for (let property in Object.keys(headers)) {
                        req.setRequestHeader(property, headers[property]);
                    }
                }

                req.open(method, url);

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