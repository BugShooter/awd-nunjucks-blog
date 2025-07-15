import type { Request, Response, NextFunction } from 'express';

// this middleware should be used after the body parser middleware
// and before the route handlers
export default function methodOverrideMiddleware(req: Request, res: Response, next: NextFunction) {
    const allowedMethods = ['PUT', 'DELETE', 'PATCH'];
    const forbiddenOriginalMethods = ['GET', 'HEAD', 'OPTIONS'];
    let method: string | undefined;

    // Don't allow override for safe methods
    if (forbiddenOriginalMethods.includes(req.method)) {
        return next();
    }

    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        const candidate = req.body._method;
        if (typeof candidate === 'string') {
            method = candidate.toUpperCase();
            if (allowedMethods.includes(method)) {
                req.method = method;
            } else {
                // Log or handle forbidden override attempts
                console.warn(`Attempted method override to disallowed method: ${method}`);
            }
        }
        delete req.body._method;
    } else if (req.query && typeof req.query === 'object' && '_method' in req.query) {
        const candidate = req.query._method;
        if (typeof candidate === 'string') {
            method = candidate.toUpperCase();
            if (allowedMethods.includes(method)) {
                req.method = method;
            } else {
                // Optionally log or handle forbidden override attempts
                console.warn(`Attempted method override to disallowed method: ${method}`);
            }
        }
        delete req.query._method;
    }
    next();
}
