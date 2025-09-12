import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { asyncHandler } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface JWTPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export const generateToken = (user: IUser): string => {
  const payload: JWTPayload = {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'mini-games-platform',
    audience: 'mini-games-users'
  });
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'mini-games-platform',
    audience: 'mini-games-users'
  }) as JWTPayload;
};

// Authentication middleware
export const authenticate = asyncHandler(async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  let token: string | undefined;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies (if using cookie-based auth)
  else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
    }
  }
  // Check for token in X-Access-Token header
  else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'] as string;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated.'
      });
    }

    // Update last active timestamp
    user.stats.lastActive = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
        expiredAt: error.expiredAt
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed.'
    });
  }
});

// Optional authentication (doesn't fail if no token)
export const optionalAuth = asyncHandler(async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
    }
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        user.stats.lastActive = new Date();
        await user.save();
        req.user = user;
      }
    } catch (error) {
      // Silently ignore token errors for optional auth
      console.log('Optional auth token error:', error);
    }
  }

  next();
});

// Authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// Check if user owns resource
export const checkResourceOwnership = (resourceField: string = 'userId') => {
  return asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const resourceUserId = req.params[resourceField] || req.body[resourceField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: `Missing ${resourceField} in request.`
      });
    }

    if (req.user._id.toString() !== resourceUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  });
};

// Rate limiting per user
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(userId)) {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId)!;
    
    // Remove old requests
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    validRequests.push(now);
    requests.set(userId, validRequests);

    next();
  };
};

export default {
  authenticate,
  optionalAuth,
  authorize,
  checkResourceOwnership,
  userRateLimit,
  generateToken,
  verifyToken
};