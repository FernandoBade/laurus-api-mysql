"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atualizarUsuarioSchema = exports.criarUsuarioSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
const dataSchema = zod_1.z
    .union([
    zod_1.z.string().refine((valor) => {
        const dataConvertida = new Date(valor);
        return !isNaN(dataConvertida.getTime());
    }, { message: "Formato inválido. Use uma string ISO 8601 válida." }),
    zod_1.z.number().refine((valor) => valor > 0, {
        message: "O timestamp deve ser um número positivo representando milissegundos desde 1970."
    }).transform((valor) => new Date(valor)),
    zod_1.z.date().refine((valor) => !isNaN(valor.getTime()), {
        message: "A data informada não é válida.",
    }),
])
    .transform((valor) => {
    if (typeof valor === "string" || typeof valor === "number") {
        const dataConvertida = new Date(valor);
        if (isNaN(dataConvertida.getTime())) {
            throw new zod_1.z.ZodError([
                {
                    code: "custom",
                    path: ["data"],
                    message: `Data inválida: ${valor}. Use ISO 8601 ou timestamp.`,
                },
            ]);
        }
        return dataConvertida;
    }
    return valor;
});
exports.criarUsuarioSchema = zod_1.z.object({
    nome: zod_1.z.string().min(2),
    sobrenome: zod_1.z.string().min(2),
    email: zod_1.z.string().toLowerCase().trim().email(),
    senha: zod_1.z.string().min(6),
    telefone: zod_1.z.string().optional(),
    dataNascimento: dataSchema.optional(),
    dataCadastro: dataSchema.optional(),
    ativo: zod_1.z.boolean().optional(),
    aparencia: zod_1.z.enum([enums_1.Aparencia.DARK, enums_1.Aparencia.LIGHT]).optional(),
    idioma: zod_1.z.enum([enums_1.Idioma.PT_BR, enums_1.Idioma.EN_US, enums_1.Idioma.ES_ES]).optional(),
    moeda: zod_1.z.enum([enums_1.Moeda.BRL, enums_1.Moeda.USD, enums_1.Moeda.EUR, enums_1.Moeda.ARS]).optional(),
    formatoData: zod_1.z.enum([enums_1.FormatoData.DD_MM_AAAA, enums_1.FormatoData.MM_DD_AAAA]).optional(),
}).strict();
exports.atualizarUsuarioSchema = zod_1.z.object({
    nome: zod_1.z.string().min(2).optional(),
    sobrenome: zod_1.z.string().min(2).optional(),
    email: zod_1.z.string().toLowerCase().trim().email().optional(),
    senha: zod_1.z.string().min(6).optional(),
    telefone: zod_1.z.string().optional(),
    dataNascimento: dataSchema.optional(),
    ativo: zod_1.z.boolean().optional(),
    aparencia: zod_1.z.enum([enums_1.Aparencia.DARK, enums_1.Aparencia.LIGHT]).optional(),
    idioma: zod_1.z.enum([enums_1.Idioma.PT_BR, enums_1.Idioma.EN_US, enums_1.Idioma.ES_ES]).optional(),
    moeda: zod_1.z.enum([enums_1.Moeda.BRL, enums_1.Moeda.USD, enums_1.Moeda.EUR, enums_1.Moeda.ARS]).optional(),
    formatoData: zod_1.z.enum([enums_1.FormatoData.DD_MM_AAAA, enums_1.FormatoData.MM_DD_AAAA]).optional(),
}).strict();
