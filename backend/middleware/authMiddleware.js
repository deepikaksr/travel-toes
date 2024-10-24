const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('Auth middleware processing request:', {
    path: req.path,
    method: req.method,
    hasAuthHeader: !!req.headers.authorization
  });

  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', {
      userId: decoded.id,
      exp: new Date(decoded.exp * 1000)
    });
    
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};

module.exports = authMiddleware;
