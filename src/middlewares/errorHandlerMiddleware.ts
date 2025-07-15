import type { Request, Response, NextFunction } from 'express';

type ErrorHandlerMiddlewareParams = {
    viewBasePath?: string;
} | string;
export default function errorHandlerMiddleware(params?: ErrorHandlerMiddlewareParams) {
    let viewBasePath = typeof params === 'string' ? params : typeof params === 'object' &&
        params.viewBasePath || '';

    const view = viewBasePath ?`${viewBasePath}/error.html` : 'error.html';

    return function (err: Error, req: Request, res: Response, next: NextFunction) {
        console.error(err);
        res.status(500).render(view, {
            title: 'Error: 500',
            content: 'Server error'
        });
    };
}
