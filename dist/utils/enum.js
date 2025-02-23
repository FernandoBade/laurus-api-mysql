"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPStatus = exports.TiposDeLog = void 0;
var TiposDeLog;
(function (TiposDeLog) {
    TiposDeLog["ERRO"] = "erro";
    TiposDeLog["ALERTA"] = "alerta";
    TiposDeLog["SUCESSO"] = "sucesso";
    TiposDeLog["INFO"] = "info";
    TiposDeLog["DEBUG"] = "debug";
})(TiposDeLog || (exports.TiposDeLog = TiposDeLog = {}));
var HTTPStatus;
(function (HTTPStatus) {
    HTTPStatus[HTTPStatus["OK"] = 200] = "OK";
    HTTPStatus[HTTPStatus["CREATED"] = 201] = "CREATED";
    HTTPStatus[HTTPStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HTTPStatus[HTTPStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HTTPStatus[HTTPStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HTTPStatus || (exports.HTTPStatus = HTTPStatus = {}));
