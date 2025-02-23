import { z } from 'zod';
import { Idioma, Aparencia, Moeda, FormatoData } from './enums';

export const criarUsuarioSchema = z.object({
    nome: z.
        string()
        .min(2, {
            message: `O nome deve ter pelo menos 2 caracteres`
        }),
    sobrenome: z.
        string()
        .min(2, {
            message: `O sobrenome deve ter pelo menos 2 caracteres`
        }),
    email: z.
        string()
        .toLowerCase()
        .trim()
        .email({
            message: `O e-mail deve ser um endereço de e-mail válido`
        }),
    telefone: z
        .string()
        .optional(),
    senha: z
        .string()
        .min(6, {
            message: `A senha deve ter pelo menos 6 caracteres`
        }),
    dataNascimento: z.
        string()
        .optional()
        .refine(data => !data || (new Date(data).toString() !== 'Invalid Date'), {
            message: `A data de nascimento deve estar no formato ISO 8601`,
        }),
    dataCadastro: z
        .string()
        .optional()
        .refine(data => !data || (data.length === 24 && new Date(data).toISOString() === data), {
            message: `A data de cadastro deve estar no formato ISO 8601`
        }),
    ativo: z
        .boolean()
        .optional(),
    aparencia: z
        .enum([Aparencia.DARK, Aparencia.LIGHT], {
            message: `A aparência deve ser 'dark' ou 'light'`
        }),
    idioma: z.
        enum([Idioma.PT_BR, Idioma.EN_US, Idioma.ES_ES], {
            message: `O idioma deve ser 'pt-BR', 'en-US' ou 'es-ES'`
        }),
    moeda: z
        .enum([Moeda.BRL, Moeda.USD, Moeda.EUR, Moeda.ARS], {
            message: `A moeda deve ser 'BRL', 'USD', 'EUR' ou 'ARS'`
        }),
    formatoData: z
        .enum([FormatoData.DD_MM_AAAA, FormatoData.MM_DD_YYYY], {
            message: `O formato de data deve ser 'DD/MM/AAAA' ou 'MM/DD/YYYY'`
        }),
}).strict();

export const atualizarUsuarioSchema = z.object({
    nome: z
        .string()
        .min(2, {
            message: `O nome deve ter pelo menos 2 caracteres`
        }).optional(),
    sobrenome: z
        .string()
        .min(2, {
            message: `O sobrenome deve ter pelo menos 2 caracteres`
        })
        .optional(),
    email: z
        .string()
        .toLowerCase()
        .trim()
        .email({
            message: `O e-mail deve ser um endereço de e-mail válido`
        }).optional(),
    telefone: z
        .string()
        .optional(),
    senha: z
        .string()
        .min(6, {
            message: `A senha deve ter pelo menos 6 caracteres`
        }).optional(),
    dataNascimento: z
        .string()
        .optional()
        .refine(data => !data || (data.length === 24 && new Date(data).toISOString() === data), {
            message: `A data de nascimento deve estar no formato ISO 8601 e ter 24 caracteres.`
        }),
    aparencia: z
        .enum([Aparencia.DARK, Aparencia.LIGHT], {
            message: `A aparência deve ser 'dark' ou 'light'`
        })
        .optional(),
    ativo: z
        .boolean()
        .optional(),
    idioma: z
        .enum([Idioma.PT_BR, Idioma.EN_US, Idioma.ES_ES], {
            message: `O idioma deve ser 'pt-BR', 'en-US' ou 'es-ES'`
        })
        .optional(),
    moeda: z
        .enum([Moeda.BRL, Moeda.USD, Moeda.EUR, Moeda.ARS], {
            message: `A moeda deve ser 'BRL', 'USD', 'EUR' ou 'ARS'`
        })
        .optional(),
    formatoData: z
        .enum([FormatoData.DD_MM_AAAA, FormatoData.MM_DD_YYYY], {
            message: `O formato de data deve ser 'DD/MM/AAAA' ou 'MM/DD/YYYY'`
        })
        .optional(),
}).strict();
