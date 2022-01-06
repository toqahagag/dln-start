// const awsServerlessExpress = require('aws-serverless-express');
// const app = require('./app');

import awsServerlessExpress from 'aws-serverless-express';
import { app } from './app';

const server = awsServerlessExpress.createServer(app);

exports.handler = (event: any, context: any) => {
  awsServerlessExpress.proxy(server, event, context);
};
