'use strict'
const AWS = require('aws-sdk')
module.exports = {
  create: async (event, context) => {
    let bodyObj = {}
    try {
      bodyObj = JSON.parse(event.body)
    } catch (jsonError) {
      console.log('There was an error parsing the body', jsonError)
      return {
        statusCode: 400
      }
    }

    if (typeof bodyObj.name === 'undefined' || typeof bodyObj.age === 'undefined') {
      console.log('Missing parameters')
      return {
        statusCode: 400
      }
    }

    let putParams = {
      TableName: process.env.DYNAMODB_KITTEN_TABLE,
      Item: {
        name: bodyObj.name,
        age: bodyObj.age
      }
    }

    let putResult = {}
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient()
      putResult = await dynamodb.put(putParams).promise()
    }
    catch(putError) {
      console.log('There was a problem putting the kitten')
      console.log('putError', putError);
      return {
        statusCode: 500
      }
    }

    return {
      statusCode: 200
    }
  },

  list: async (event, context) => {
    let scanParams = {
      TableName: process.env.DYNAMODB_KITTEN_TABLE
    }

    let scanResult = {}
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient();
      scanResult = await dynamodb.scan(scanParams).promise()
    }
    catch(scanError) {
      console.log('There was a problem scanning the kittens')
      console.log('scanError', scanError)
      return {
        statusCode: 500
      }
    }

    if (scanResult.Items === null || 
        !Array.isArray(scanResult.Items) || 
        scanResult.Items.lenght === 0) {
        return {
          statusCode: 404
        }
      }

    return {
      statusCode: 200,
      body: JSON.stringify(scanResult.Items.map(k => {
        return {
          name: k.name,
          age: k.age
        }
      }))
    }
  },

  get: async (event, context) => {
    let getParams = {
      TableName: process.env.DYNAMODB_KITTEN_TABLE,
      Key: {
        name: event.pathParameters.name
      }
    }

    let getResult = {}
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient()
      getResult = await dynamodb.get(getParams).promise()
    }
    catch(getError) {
      console.log('There was a problem getting the kitten')
      console.log('getError', getError)
      return {
        statusCode: 500
      }
    }

    if (getResult.Item === null)
    return {
      statusCode: 404
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        name: getResult.Item.name,
        age: getResult.Item.age
      })
    }
  },

  update: async (event, context) => {},

  delete: async (event, context) => {}
};
