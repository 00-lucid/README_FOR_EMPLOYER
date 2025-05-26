const jwt = require('jsonwebtoken');

export default {
  // 모듈 함수의 특징: help... 형식의 함수명
  helpGetToken(req) {
    if (req.headers.authorization) {
      return req.headers.authorization.split('Bearer ')[1];
    } else {
      return undefined;
    }
  },
  // jwt 인증하고 유저 id 받아오는 함수
  helpGetUser(token) {
    return jwt.verify(token, 'salt', async (err, decoded) => {
      if (err) {
        console.log('🚀');
        console.log(err);
        throw 'invalid token';
      }

      return decoded;
    });
  },
  helpCreateToken(obj) {
    return jwt.sign(
      {
        ...obj,
      },
      'salt',
      {
        expiresIn: '24h',
      },
    );
  },
};
