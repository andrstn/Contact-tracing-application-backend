const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
    const authorization = request.get('Authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      return authorization.substring(7)
    }
    return null
}

const decodeToken = (request) => {
    const token = getTokenFrom(request)

    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken) {
        return response.status(401).json({
        error: 'Token missing or invalid.'
        })
    }

    return decodedToken
}

module.exports = {
    decodeToken
}