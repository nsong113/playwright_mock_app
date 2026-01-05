// Vercel 서버리스 함수 타입 선언
// Vercel 배포 시 자동으로 @vercel/node가 설치되므로 로컬 타입 체크용

declare module "@vercel/node" {
  export interface VercelRequest {
    method?: string;
    url?: string;
    query?: Record<string, string | string[] | undefined>;
    body?: any;
    headers?: Record<string, string | string[] | undefined>;
    on?(event: string, listener: (...args: any[]) => void): void;
  }

  export interface VercelResponse {
    status(code: number): VercelResponse;
    json(body: any): void;
    end(): void;
    writeHead(statusCode: number, headers?: Record<string, string>): void;
    write(chunk: string): boolean;
    end(chunk?: string): void;
    setHeader(name: string, value: string | string[]): void;
    writableEnded?: boolean;
    destroyed?: boolean;
    writable?: boolean;
    on?(event: string, listener: (...args: any[]) => void): void;
  }

  export type VercelRequestHandler = (
    req: VercelRequest,
    res: VercelResponse
  ) => void | Promise<void>;
}
