const connection = require('../db.js')
const striptags = require('striptags')

const allWhiteSpaces = /^\s*$/
// Used to wait for query results
exports.runQuery = function (query) {
  return new Promise((resolve, reject) => {
    connection.query(query, function (err,rows) {
      if (!err) {
        return resolve(rows)
      } else {
        return reject(err)
      }
    })
  })
}
exports.runParameterQuery = function (query, parameters) {
  return new Promise((resolve, reject) => {
    connection.query(query, parameters, function (err,rows) {
      if (!err) {
        return resolve(rows)
      } else {
        return reject(err)
      }
    })
  })
}
exports.runTransactionQuery = function (query, con) {
  return new Promise((resolve, reject) => {
    con.query(query, function (err,rows) {
      if (!err) {
        return resolve(rows)
      } else {
        return reject(err)
      }
    })
  })
}
exports.runTransactionQueryWithParams = function (query, con, parameters) {
  return new Promise((resolve, reject) => {
    con.query(query, parameters, function (err,rows) {
      if (!err) {
        return resolve(rows)
      } else {
        return reject(err)
      }
    })
  })
}
exports.setSectionProperty =  function (object, property) {
  object[`${property}`] = object.options[`${property}`]
  delete object.options[`${property}`]
}

exports.stripHtml = function (html) {
  return striptags(html.trim(),[],'')
}

exports.sortSections = function (arr) {
  if (typeof(arr[0].properties) === 'string') {
    arr[0].properties = JSON.parse(arr[0].properties)
  }
  for (let i = 1; i < arr.length; i++) {
    if (typeof(arr[i].properties) === 'string') {
      arr[i].properties = JSON.parse(arr[i].properties)
    }
    if (arr[i].properties.index < arr[0].properties.index) {
      arr.unshift(arr.splice(i,1)[0])
    }
    else if (arr[i].properties.index > arr[i - 1].properties.index) {
      continue
    }
    else {
      for (let j = 1; j < i; j++) {
        if (arr[i].properties.index > arr[j - 1].properties.index && arr[i].properties.index < arr[j].properties.index) {
          arr.splice(j,0,arr.splice(i,1)[0])
        }
      }
    }
  }
  return arr
}

exports.isNil = function (obj) {
  return obj === undefined || obj === null
}

exports.isNullOrWhiteSpace = function (str) {
  return str === undefined || str === null || typeof str !== 'string' || isWhiteSpace(str)
}

function isWhiteSpace (str) {
  return allWhiteSpaces.test(str)
}
