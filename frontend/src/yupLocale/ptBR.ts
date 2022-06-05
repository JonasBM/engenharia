/*eslint-disable no-template-curly-in-string*/

import { LocaleObject } from "yup/lib/locale";

export const mixed: LocaleObject["mixed"] = {
  default: "Não é válido.",
  required: "É um campo obrigatório",
  oneOf: "Deve ser um dos seguintes valores: ${values}",
  notOneOf: "Não deve ser um dos seguintes valores: ${values}",
  notType: ({ path, type, value, originalValue }: any) => {
    switch (type) {
      case "number":
        return "Deve ser um número";
      default:
        return `Deve ser ${type}`;
    }
  },
};

export const string: LocaleObject["string"] = {
  length: "Deve ser exatamente ${length} caracteres",
  min: "Deve ter pelo menos ${min} caracteres",
  max: "Deve ter no máximo ${max} caracteres",
  matches: 'Deve corresponder ao seguinte: "${regex}"',
  email: "Deve ser um email válido",
  url: "Deve ser um URL válido",
  trim: "Não deve conter espaços no começo ou fim",
  lowercase: "Deve conter apenas letras minúscula",
  uppercase: "Deve conter apenas letras maiúscula",
};

export const number: LocaleObject["number"] = {
  min: "Deve ser maior ou igual a ${min}",
  max: "Deve ser menor ou igual a ${max}",
  lessThan: "Deve ser menor que ${less}",
  moreThan: "Deve ser maior que ${more}",
  positive: "Deve ser um número positivo",
  negative: "Deve ser um número negativo",
  integer: "Deve ser um inteiro",
};

export const date: LocaleObject["date"] = {
  min: "Deve ser posterior à ${min}",
  max: "Deve ser anterior à ${max}",
};

export const boolean: LocaleObject["boolean"] = {};

export const object: LocaleObject["object"] = {
  noUnknown: "Não pode ter chaves não especificadas na forma do objeto",
};

export const array: LocaleObject["array"] = {
  min: "Deve ter pelo menos ${min} itens",
  max: "Deve ter menos de ${max} itens",
};
