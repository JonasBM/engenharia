/*eslint-disable no-template-curly-in-string*/

// import { FormatErrorParams, LocaleObject } from "yup";

import { LocaleObject } from "yup/lib/locale";
import printValue from "./utils";

export const mixed: LocaleObject["mixed"] = {
  default: "${path} é inválido.",
  required: "${path} é um campo obrigatório",
  oneOf: "${path} deve ser um dos seguintes valores: ${values}",
  notOneOf: "${path} não deve ser um dos seguintes valores: ${values}",
  notType: ({ path, type, value, originalValue }: any) => {
    const isCast = originalValue != null && originalValue !== value;
    let msg =
      `${path} deve ser um tipo de \`${type}\`, ` +
      `Mas o valor final foi: \`${printValue(value, true)}\`` +
      (isCast
        ? ` (Elenco do valor \`${printValue(originalValue, true)}\`).`
        : ".");

    if (value === null) {
      msg +=
        `\n Se "null" pretender como um valor vazio, certifique-se de marcar o esquema como` +
        " `.nullable()`";
    }

    return msg;
  },
};

export const string: LocaleObject["string"] = {
  length: "${path} deve ser exatamente ${length} caracteres",
  min: "${path} deve ter pelo menos ${min} caracteres",
  max: "${path} deve ter no máximo ${max} caracteres",
  matches: '${path} deve corresponder ao seguinte: "${regex}"',
  email: "${path} deve ser um email válido",
  url: "${path} deve ser um URL válido",
  trim: "${path} não deve conter espaços no começo ou fim",
  lowercase: "${path} deve conter apenas letras minúscula",
  uppercase: "${path} deve conter apenas letras maiúscula",
};

export const number: LocaleObject["number"] = {
  min: "${path} deve ser maior ou igual a ${min}",
  max: "${path} deve ser menor ou igual a ${max}",
  lessThan: "${path} deve ser menor que ${less}",
  moreThan: "${path} deve ser maior que ${more}",
  positive: "${path} deve ser um número positivo",
  negative: "${path} deve ser um número negativo",
  integer: "${path} deve ser um inteiro",
};

export const date: LocaleObject["date"] = {
  min: "Campo ${path} deve ser posterior à ${min}",
  max: "${path} deve ser anterior à ${max}",
};

export const boolean: LocaleObject["boolean"] = {};

export const object: LocaleObject["object"] = {
  noUnknown:
    "Campo ${path} não pode ter chaves não especificadas na forma do objeto",
};

export const array: LocaleObject["array"] = {
  min: "O campo ${path} deve ter pelo menos ${min} itens",
  max: "O campo ${path} deve ter menos de ${max} itens",
};
