import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - ${ip}`);

  // Log response time
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusClass = Math.floor(statusCode / 100);
    
    let logLevel = 'info';
    if (statusClass === 4) logLevel = 'warn';
    if (statusClass === 5) logLevel = 'error';

    console.log(`[${timestamp}] ${method} ${url} - ${statusCode} - ${duration}ms - ${ip}`);
  });

  next();
};