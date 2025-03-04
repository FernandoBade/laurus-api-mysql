export enum TiposDeLog {
    ERRO = 'erro',
    ALERTA = 'alerta',
    SUCESSO = 'sucesso',
    DEBUG = 'debug'
}

export enum CategoriasDeLog {
    USUARIO = 'usuario',
    LOG = "log",
    BancoDeDados = "bancoDeDados",
}

export enum HTTPStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export enum Idioma {
    PT_BR = 'pt-BR',
    EN_US = 'en-US',
    ES_ES = 'es-ES',
}

export enum Aparencia {
    DARK = 'dark',
    LIGHT = 'light',
}

export enum Moeda {
    BRL = 'BRL',
    USD = 'USD',
    EUR = 'EUR',
    ARS = 'ARS',
}

export enum FormatoData {
    DD_MM_AAAA = 'DD/MM/AAAA',
    MM_DD_AAAA = 'MM/DD/AAAA',
}

export enum Operacoes {
    CRIACAO = 'criacao',
    BUSCA = 'busca',
    ATUALIZACAO = 'atualizacao',
    LOGIN = 'login',
    LOGOUT = 'logout',
    EXCLUSAO = 'exclusao'
}

export enum NomeDaTabela {
    USUARIO = 'Usuario',
    CONTA = 'Conta',
    LOG = 'Log',
}
