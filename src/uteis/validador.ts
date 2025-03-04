import { z } from 'zod';
import { Idioma, Aparencia, Moeda, FormatoData } from './enumeradores';

const dataSchema = z
    .union([
        z.string().refine((valor) => {
            const dataConvertida = new Date(valor);
            return !isNaN(dataConvertida.getTime());
        }, { message: "Formato inválido. Use uma string ISO 8601 válida." }),

        z.number().refine((valor) => valor > 0, {
            message: "O timestamp deve ser um número positivo representando milissegundos desde 1970."
        }).transform((valor) => new Date(valor)),

        z.date().refine((valor) => !isNaN(valor.getTime()), {
            message: "A data informada não é válida.",
        }),
    ])
    .transform((valor) => {
        if (typeof valor === "string" || typeof valor === "number") {
            const dataConvertida = new Date(valor);
            if (isNaN(dataConvertida.getTime())) {
                throw new z.ZodError([
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


export const criarUsuarioSchema = z.object({
    nome: z.string().min(2),
    sobrenome: z.string().min(2),
    email: z.string().toLowerCase().trim().email(),
    senha: z.string().min(6),
    telefone: z.string().optional(),
    dataNascimento: dataSchema.optional(),
    dataCadastro: dataSchema.optional(),
    ativo: z.boolean().optional(),
    aparencia: z.enum([Aparencia.DARK, Aparencia.LIGHT]).optional(),
    idioma: z.enum([Idioma.PT_BR, Idioma.EN_US, Idioma.ES_ES]).optional(),
    moeda: z.enum([Moeda.BRL, Moeda.USD, Moeda.EUR, Moeda.ARS]).optional(),
    formatoData: z.enum([FormatoData.DD_MM_AAAA, FormatoData.MM_DD_AAAA]).optional(),
}).strict();

export const atualizarUsuarioSchema = z.object({
    nome: z.string().min(2).optional(),
    sobrenome: z.string().min(2).optional(),
    email: z.string().toLowerCase().trim().email().optional(),
    senha: z.string().min(6).optional(),
    telefone: z.string().optional(),
    dataNascimento: dataSchema.optional(),
    ativo: z.boolean().optional(),
    aparencia: z.enum([Aparencia.DARK, Aparencia.LIGHT]).optional(),
    idioma: z.enum([Idioma.PT_BR, Idioma.EN_US, Idioma.ES_ES]).optional(),
    moeda: z.enum([Moeda.BRL, Moeda.USD, Moeda.EUR, Moeda.ARS]).optional(),
    formatoData: z.enum([FormatoData.DD_MM_AAAA, FormatoData.MM_DD_AAAA]).optional(),
}).strict();
