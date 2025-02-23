"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atualizarUsuarioSchema = exports.criarUsuarioSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
exports.criarUsuarioSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    nome: zod_1.z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
    sobrenome: zod_1.z.string().min(2, { message: 'O sobrenome deve ter pelo menos 2 caracteres.' }),
    email: zod_1.z.string().toLowerCase().trim().email({ message: 'O e-mail deve ser um endereço de e-mail válido.' }),
    telefone: zod_1.z.string().optional(),
    senha: zod_1.z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
    dataNascimento: zod_1.z.string()
        .optional()
        .refine(data => !data || (data.length === 24 && new Date(data).toISOString() === data), {
        message: 'A data de nascimento deve estar no formato ISO 8601.'
    }),
    dataCadastro: zod_1.z.string()
        .optional()
        .refine(data => !data || (data.length === 24 && new Date(data).toISOString() === data), {
        message: 'A data de cadastro deve estar no formato ISO 8601.'
    }),
    ativo: zod_1.z.boolean().optional(),
    aparencia: zod_1.z.enum([enums_1.Aparencia.DARK, enums_1.Aparencia.LIGHT], { message: 'A aparência deve ser "dark" ou "light".' }),
    idioma: zod_1.z.enum([enums_1.Idioma.PT_BR, enums_1.Idioma.EN_US, enums_1.Idioma.ES_ES], { message: 'O idioma deve ser "pt-BR", "en-US" ou "es-ES".' }),
    moeda: zod_1.z.enum([enums_1.Moeda.BRL, enums_1.Moeda.USD, enums_1.Moeda.EUR, enums_1.Moeda.ARS], { message: 'A moeda deve ser "BRL", "USD", "EUR" ou "ARS".' }),
    formatoData: zod_1.z.enum([enums_1.FormatoData.DD_MM_AAAA, enums_1.FormatoData.MM_DD_YYYY], { message: 'O formato de data deve ser "DD/MM/AAAA" ou "MM/DD/YYYY".' }),
});
exports.atualizarUsuarioSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: 'O ID deve ser um UUID válido.' }),
    nome: zod_1.z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }).optional(),
    sobrenome: zod_1.z.string().min(2, { message: 'O sobrenome deve ter pelo menos 2 caracteres.' }).optional(),
    email: zod_1.z.string().toLowerCase().trim().email({ message: 'O e-mail deve ser um endereço de e-mail válido.' }).optional(),
    telefone: zod_1.z.string().optional(),
    senha: zod_1.z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }).optional(),
    dataNascimento: zod_1.z.string().optional().refine(data => !data || (data.length === 24 && new Date(data).toISOString() === data), {
        message: 'A data de nascimento deve estar no formato ISO 8601 e ter 24 caracteres.'
    }),
    aparencia: zod_1.z.enum([enums_1.Aparencia.DARK, enums_1.Aparencia.LIGHT], { message: 'A aparência deve ser "dark" ou "light".' }).optional(),
    idioma: zod_1.z.enum([enums_1.Idioma.PT_BR, enums_1.Idioma.EN_US, enums_1.Idioma.ES_ES], { message: 'O idioma deve ser "pt-BR", "en-US" ou "es-ES".' }).optional(),
    moeda: zod_1.z.enum([enums_1.Moeda.BRL, enums_1.Moeda.USD, enums_1.Moeda.EUR, enums_1.Moeda.ARS], { message: 'A moeda deve ser "BRL", "USD", "EUR" ou "ARS".' }).optional(),
    formatoData: zod_1.z.enum([enums_1.FormatoData.DD_MM_AAAA, enums_1.FormatoData.MM_DD_YYYY], { message: 'O formato de data deve ser "DD/MM/AAAA" ou "MM/DD/YYYY".' }).optional(),
});
