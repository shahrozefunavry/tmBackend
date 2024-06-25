module.exports = (req , res  , next)=>{
  const token =  JSON.stringify(req.headers.authorization)
  try {
    if (token) {
      next()
    } else {
      res.status(406).send({message: 'No token provided. Please login.'})
    }
  } catch (err) {
    res.status(406).send({'message': err.message})
  }
}
