"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NomeDaTabela = exports.Operacoes = exports.FormatoData = exports.Moeda = exports.Aparencia = exports.Idioma = exports.HTTPStatus = exports.CategoriasDeLog = exports.TiposDeLog = void 0;
var TiposDeLog;
(function (TiposDeLog) {
    TiposDeLog["ERRO"] = "erro";
    TiposDeLog["ALERTA"] = "alerta";
    TiposDeLog["SUCESSO"] = "sucesso";
    TiposDeLog["INFO"] = "info";
    TiposDeLog["DEBUG"] = "debug";
})(TiposDeLog || (exports.TiposDeLog = TiposDeLog = {}));
var CategoriasDeLog;
(function (CategoriasDeLog) {
    CategoriasDeLog["USUARIO"] = "usuario";
    CategoriasDeLog["LOG"] = "log";
    CategoriasDeLog["BancoDeDados"] = "bancoDeDados";
})(CategoriasDeLog || (exports.CategoriasDeLog = CategoriasDeLog = {}));
var HTTPStatus;
(function (HTTPStatus) {
    HTTPStatus[HTTPStatus["OK"] = 200] = "OK";
    HTTPStatus[HTTPStatus["CREATED"] = 201] = "CREATED";
    HTTPStatus[HTTPStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HTTPStatus[HTTPStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HTTPStatus[HTTPStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HTTPStatus || (exports.HTTPStatus = HTTPStatus = {}));
var Idioma;
(function (Idioma) {
    Idioma["PT_BR"] = "pt-BR";
    Idioma["EN_US"] = "en-US";
    Idioma["ES_ES"] = "es-ES";
})(Idioma || (exports.Idioma = Idioma = {}));
var Aparencia;
(function (Aparencia) {
    Aparencia["DARK"] = "dark";
    Aparencia["LIGHT"] = "light";
})(Aparencia || (exports.Aparencia = Aparencia = {}));
var Moeda;
(function (Moeda) {
    Moeda["BRL"] = "BRL";
    Moeda["USD"] = "USD";
    Moeda["EUR"] = "EUR";
    Moeda["ARS"] = "ARS";
})(Moeda || (exports.Moeda = Moeda = {}));
var FormatoData;
(function (FormatoData) {
    FormatoData["DD_MM_AAAA"] = "DD/MM/AAAA";
    FormatoData["MM_DD_AAAA"] = "MM/DD/AAAA";
})(FormatoData || (exports.FormatoData = FormatoData = {}));
var Operacoes;
(function (Operacoes) {
    Operacoes["CRIACAO"] = "criacao";
    Operacoes["BUSCA"] = "busca";
    Operacoes["ATUALIZACAO"] = "atualizacao";
    Operacoes["LOGIN"] = "login";
    Operacoes["LOGOUT"] = "logout";
    Operacoes["EXCLUSAO"] = "exclusao";
})(Operacoes || (exports.Operacoes = Operacoes = {}));
var NomeDaTabela;
(function (NomeDaTabela) {
    NomeDaTabela["USUARIO"] = "Usuario";
    NomeDaTabela["CONTA"] = "Conta";
    NomeDaTabela["LOG"] = "Log";
})(NomeDaTabela || (exports.NomeDaTabela = NomeDaTabela = {}));
