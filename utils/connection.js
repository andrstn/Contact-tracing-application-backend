const mongoose = require('mongoose');
const config = require('../utils/config')
require('dotenv').config()
const multer = require("multer");
const Grid = require('gridfs-stream')
const {
    GridFsStorage
  } = require("multer-gridfs-storage");
   


function makeNewConnection(uri) {
    const db = mongoose.createConnection(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    db.on('error', function (error) {
        console.log(`MongoDB :: connection ${this.name} ${JSON.stringify(error)}`);
        db.close().catch(() => console.log(`MongoDB :: failed to close connection ${this.name}`));
    });

    db.on('connected', function () {
        mongoose.set('debug', function (col, method, query, doc) {
            console.log(`MongoDB :: ${this.conn.name} ${col}.${method}(${JSON.stringify(query)},${JSON.stringify(doc)})`);
        });
        console.log(`MongoDB :: connected ${this.name}`);
    });

    db.on('disconnected', function () {
        console.log(`MongoDB :: disconnected ${this.name}`);
    });

    return db;
}

const userConnection = makeNewConnection(process.env.MONGODB_USER_URI)
const transactionConnection = makeNewConnection(process.env.MONGODB_TRANSACTION_URI)
const individualConnection = makeNewConnection(process.env.MONGODB_INDIVIDUAL_URI)
const establishmentConnection = makeNewConnection(process.env.MONGODB_ESTABLISHMENT_URI)
const preRegisteredConnection = makeNewConnection(process.env.MONGODB_PREREGISTERED_URI)
const uploadConnection = makeNewConnection(process.env.MONGODB_UPLOAD_URI)
const adminConnection = makeNewConnection(process.env.MONGODB_ADMIN_URI)

module.exports = {
    userConnection,
    transactionConnection,
    individualConnection,
    establishmentConnection,
    preRegisteredConnection,
    uploadConnection,
    adminConnection
};
