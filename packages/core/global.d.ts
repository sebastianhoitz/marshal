declare module 'uuid';
declare module 'mongo-uuid';
declare module 'get-parameter-names';
declare module 'fs';

declare module '@nestjs/common' {
    import {Paramtype} from './paramtype.interface';
    export declare type Transform<T = any> = (value: T, metadata: ArgumentMetadata) => any;

    export interface ArgumentMetadata {
        readonly type: Paramtype;
        readonly metatype?: new (...args) => any | undefined;
        readonly data?: string | undefined;
    }

    export interface PipeTransform<T = any, R = any> {
        transform(value: T, metadata: ArgumentMetadata): R;
    }

    export declare class HttpException extends Error {
        private readonly response;
        private readonly status;
        readonly message: any;

        /**
         * The base Nest Application exception, which is handled by the default Exceptions Handler.
         * If you throw an exception from your HTTP route handlers, Nest will map them to the appropriate HTTP response and send to the client.
         *
         * When `response` is an object:
         * - object will be stringified and returned to the user as a JSON response,
         *
         * When `response` is a string:
         * - Nest will create a response with two properties:
         * ```
         * message: response,
         * statusCode: X
         * ```
         */
        constructor(response: string | object, status: number);

        getResponse(): string | object;

        getStatus(): number;
    }

    export declare class BadRequestException extends HttpException {
        constructor(message?: string | object | any, error?: string);
    }
}
