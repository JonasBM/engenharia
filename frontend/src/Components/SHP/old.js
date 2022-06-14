/* eslint-disable eqeqeq */
/* eslint-disable no-redeclare */
/* eslint-disable no-undef */
/* eslint-disable no-new-wrappers */

var crt = 120;
var crm = 140;
var simhid = 4;
var H1 = new String();
var H2 = new String();
var H3 = new String();
var H4 = new String();
var Qt1 = new String();
var Qt2 = new String();
var Qt3 = new String();
var Qt4 = new String();
var A1Q = new String();
var B2Q = new String();
var C3Q = new String();
var D4Q = new String();
///////////////////////////////////
var RADs = new String();
var hidmin = new String();
var Hmg = new String();
var altQ = new String();
var altmin = new String();
var RTI = new String();
///////////////// RR0 X//////////////
var RR0Q = new String();
var RR0Jt = new String();
RR0Ds = new String();
var RR0Comt = new String();
var RR0St = new String();
var RR0P = new String();
///////////////// R0A//////////////
var R0AQ = new String();
var R0AJt = new String();
var R0ASt = new String();
var R0AP = new String();
var R0AComt = new String();
/////////////////// A1P/////////////
var A1Jt = new String();
var A1St = new String();
var A1Jm = new String();
var A1Sm = new String();
var A1P = new String();
var A1Comt = new String();
///////////////// AB//////////////
var ABQ = new String();
var ABJt = new String();
var ABSt = new String();
var ABP = new String();
var ABComt = new String();
/////////////////// B2P/////////////
var B2Jt = new String();
var B2St = new String();
var B2Jm = new String();
var B2Sm = new String();
var B2P = new String();
var B2Comt = new String();
///////////////// BC//////////////
var BCQ = new String();
var BCJt = new String();
var BCSt = new String();
var BCP = new String();
var BCComt = new String();
//////////////// C3P/////////////
var C3Jt = new String();
var C3St = new String();
var C3Jm = new String();
var C3Sm = new String();
var C3P = new String();
var C3Comt = new String();
///////////////// CD//////////////
var CDQ = new String();
var CDJt = new String();
var CDSt = new String();
var CDP = new String();
var CDComt = new String();
/////////////////// D4P/////////////
var D4Jt = new String();
var D4St = new String();
var D4Jm = new String();
var D4Sm = new String();
var D4P = new String();
var D4Comt = new String();

var equi_Array = new Array(
  [
    "Pecas  Diametro (pol)",
    '1/4"',
    '3/8"',
    '1/2"',
    '3/4"',
    '1"',
    '1,1/4"',
    '1,1/2"',
    '2"',
    '2,1/2"',
    '3"',
    '4"',
    '5"',
    '6"',
    '8"',
  ],
  [
    "Joelho 90",
    "0,23",
    "0,35",
    "0,47",
    "0,70",
    "0,94",
    "1,17",
    "1,41",
    "1,88",
    "2,35",
    "2,82",
    "3,76",
    "4,70",
    "5,64",
    "0",
  ],
  [
    "Joelho 45",
    "0",
    "0,16",
    "0,22",
    "0,32",
    "0,43",
    "0,54",
    "0,65",
    "0,86",
    "1,08",
    "1,30",
    "1,73",
    "2,16",
    "2,59",
    "0",
  ],
  [
    "Curva 90 F.F.",
    "0",
    "0",
    "0,27",
    "0,41",
    "0,55",
    "0,68",
    "0,82",
    "1,04",
    "1,37",
    "1,64",
    "2,18",
    "0",
    "0",
    "5,40",
  ],
  [
    "Curva 90 M.F.",
    "0,16",
    "0,24",
    "0,32",
    "0,48",
    "0,64",
    "0,79",
    "0,95",
    "1,27",
    "1,59",
    "1,91",
    "2,54",
    "0",
    "0",
    "0",
  ],
  [
    "Curva 90 M.M.",
    "0",
    "0,25",
    "0,34",
    "0,50",
    "0,67",
    "0,84",
    "1,01",
    "1,35",
    "1,68",
    "2,02",
    "2,69",
    "0",
    "4,04",
    "0",
  ],
  [
    "Curva 45 M.F.",
    "0,10",
    "0,15",
    "0,20",
    "0,30",
    "0,41",
    "0,51",
    "0,61",
    "0,81",
    "1,02",
    "1,22",
    "0",
    "0",
    "0",
    "3,45",
  ],
  [
    "Te Passagem Direta",
    "0,04",
    "0,06",
    "0,08",
    "0,12",
    "0,17",
    "0,21",
    "0,25",
    "0,33",
    "0,41",
    "0,50",
    "0,66",
    "0,83",
    "0,99",
    "1,33",
  ],
  [
    "Te Saida Lateral",
    "0,34",
    "0,51",
    "0,69",
    "1,03",
    "1,37",
    "1,71",
    "2,06",
    "2,74",
    "3,43",
    "4,11",
    "5,49",
    "6,86",
    "8,23",
    "10,97",
  ],
  [
    "Te Bilateral",
    "0,42",
    "0,62",
    "0,83",
    "1,25",
    "1,66",
    "2,08",
    "2,50",
    "3,33",
    "4,16",
    "4,99",
    "6,65",
    "8,32",
    "9,98",
    "0",
  ],
  [
    "Te 45 Direto",
    "0",
    "0",
    "0,09",
    "0,13",
    "0,18",
    "0,22",
    "0,27",
    "0,36",
    "0,44",
    "0,55",
    "0,73",
    "0",
    "0",
    "0",
  ],
  [
    "Te 45 Semi Lateral",
    "0",
    "0",
    "0,44",
    "0,66",
    "0,88",
    "1,10",
    "1,31",
    "1,75",
    "2,19",
    "2,70",
    "3,51",
    "0",
    "0",
    "0",
  ],
  [
    "Cruzeta Direta",
    "0,05",
    "0,08",
    "0,10",
    "0,15",
    "0,20",
    "0,25",
    "0,30",
    "0,41",
    "0,49",
    "0,59",
    "0",
    "0",
    "0",
    "0",
  ],
  [
    "Cruzeta Lateral",
    "0,34",
    "0,50",
    "0,67",
    "1,01",
    "1,35",
    "1,68",
    "2,02",
    "2,69",
    "3,36",
    "4,02",
    "0",
    "0",
    "0",
    "0",
  ],
  [
    "Luva",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,02",
    "0,02",
    "0,03",
    "0",
  ],
  [
    "Uniao",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0,01",
    "0",
    "0",
    "0",
  ],
  [
    "Saida da Canalizacao",
    "0",
    "0",
    "0,40",
    "0,50",
    "0,70",
    "0,90",
    "1,00",
    "1,50",
    "1,90",
    "2,20",
    "3,20",
    "4,00",
    "5,00",
    "7,00",
  ],
  [
    "Entrada Normal",
    "0",
    "0",
    "0,20",
    "0,20",
    "0,30",
    "0,40",
    "0,50",
    "0,70",
    "0,90",
    "1,10",
    "1,60",
    "2,00",
    "2,50",
    "0",
  ],
  [
    "Entrada de Borda",
    "0",
    "0",
    "0,40",
    "0,50",
    "0,70",
    "0,90",
    "1,00",
    "1,50",
    "1,90",
    "2,20",
    "3,20",
    "4,00",
    "5,00",
    "0",
  ],
  [
    "Registro de Gaveta Aberto",
    "0",
    "0",
    "0,10",
    "0,10",
    "0,20",
    "0,20",
    "0,30",
    "0,40",
    "0,40",
    "0,50",
    "0,70",
    "0,90",
    "1,10",
    "1,50",
  ],
  [
    "Registro de Globo Aberto",
    "0",
    "0",
    "4,90",
    "6,70",
    "8,20",
    "11,30",
    "13,40",
    "17,40",
    "21,00",
    "26,00",
    "34,00",
    "43,00",
    "51,00",
    "0",
  ],
  [
    "Registro de Angulo Aberto",
    "0",
    "0",
    "2,60",
    "3,60",
    "4,60",
    "5,60",
    "6,70",
    "8,50",
    "10,00",
    "13,00",
    "17,00",
    "21,00",
    "26,00",
    "0",
  ],
  [
    "Valvula de Pe e Crivo",
    "0",
    "0",
    "3,60",
    "5,60",
    "7,30",
    "10,00",
    "11,60",
    "17,00",
    "17,00",
    "20,00",
    "23,00",
    "30,00",
    "39,00",
    "0",
  ],
  [
    "Valvula Retencao Leve",
    "0",
    "0",
    "1,10",
    "1,60",
    "2,10",
    "2,70",
    "3,20",
    "4,20",
    "5,20",
    "6,30",
    "8,40",
    "10,40",
    "12,50",
    "0",
  ],
  [
    "Valvula Retencao Pesado",
    "0",
    "0",
    "1,60",
    "2,40",
    "3,20",
    "4,00",
    "4,80",
    "6,40",
    "8,10",
    "9,70",
    "12,90",
    "16,10",
    "19,30",
    "0",
  ],
  [
    "Reducao 200x150",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "2,00",
  ],
  [
    "Reducao 150x100",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "1,45",
    "0",
  ],
  [
    "Reducao 100x75",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "1,10",
    "0",
    "0",
    "0",
  ],
  [
    "Reducao 75x63",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0,90",
    "0",
    "0",
    "0",
    "0",
  ],
  [
    "Reducao 63x38",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0,60",
    "0",
    "0",
    "0",
    "0",
    "0",
  ]
);

var salvart = new Array("obra", "proc", "A1", "B2", "C3", "D4");

var salvar0 = new Array(
  "RR0Dt",
  "R0ADt",
  "A1Dt",
  "A1Dm",
  "A1Cm",
  "ABDt",
  "B2Dt",
  "B2Dm",
  "B2Cm",
  "BCDt",
  "C3Dt",
  "C3Dm",
  "C3Cm",
  "CDDt",
  "D4Dt",
  "D4Dm",
  "D4Cm",
  "hid",
  "altclass",
  "altbase"
);

var salvar2 = new Array(
  "req",
  "RR0Ct",
  "RR0Et",
  "R0ACt",
  "R0ADs",
  "R0AEt",
  "A1Ct",
  "A1Ds",
  "A1Et",
  "ABCt",
  "ABDs",
  "ABEt",
  "B2Ct",
  "B2Ds",
  "B2Et",
  "BCCt",
  "BCDs",
  "BCEt",
  "C3Ct",
  "C3Ds",
  "C3Et",
  "CDCt",
  "CDDs",
  "CDEt",
  "D4Ct",
  "D4Ds",
  "D4Et",
  "mca",
  "BomR0",
  "alt"
);

var valorest = new Array("obra", "proc", "A1", "B2", "C3", "D4", "hidmin");

var valores0 = new Array(
  "RR0Dt",
  "R0ADt",
  "A1Dt",
  "A1Dm",
  "A1Cm",
  "ABDt",
  "B2Dt",
  "B2Dm",
  "B2Cm",
  "BCDt",
  "C3Dt",
  "C3Dm",
  "C3Cm",
  "CDDt",
  "D4Dt",
  "D4Dm",
  "D4Cm",
  "hid",
  "althid",
  "altmin",
  "altclass",
  "altbase"
);

var valores2 = new Array(
  "req",
  "RR0Ct",
  "RR0Ds",
  "RR0Et",
  "RR0Q1",
  "RR0Comt",
  "RR0P",
  "R0ACt",
  "R0ADs",
  "R0AEt",
  "R0AQ1",
  "R0AComt",
  "R0AP",
  "A1Ct",
  "A1Ds",
  "A1Et",
  "A1Q1",
  "A1Comt",
  "A1P",
  "ABCt",
  "ABDs",
  "ABEt",
  "ABQ1",
  "ABComt",
  "ABP",
  "B2Ct",
  "B2Ds",
  "B2Et",
  "B2Q1",
  "B2Comt",
  "B2P",
  "BCCt",
  "BCDs",
  "BCEt",
  "BCQ1",
  "BCComt",
  "BCP",
  "C3Ct",
  "C3Ds",
  "C3Et",
  "C3Q1",
  "C3Comt",
  "C3P",
  "CDCt",
  "CDDs",
  "CDEt",
  "CDQ1",
  "CDComt",
  "CDP",
  "D4Ct",
  "D4Ds",
  "D4Et",
  "D4Q1",
  "D4Comt",
  "D4P",
  "mca",
  "BomR0",
  "Hmg",
  "BomR0Q1",
  "BomR0Q2",
  "BomR0Q3",
  "alt",
  "altQ",
  "altrti",
  "RADs"
);

var valores6 = new Array(
  "RR0Q",
  "RR0Jt",
  "RR0St",
  "R0AQ",
  "R0AJt",
  "R0ASt",
  "A1Q",
  "A1Jt",
  "A1St",
  "A1Jm",
  "A1Sm",
  "ABQ",
  "ABJt",
  "ABSt",
  "B2Q",
  "B2Jt",
  "B2St",
  "B2Jm",
  "B2Sm",
  "BCQ",
  "BCJt",
  "BCSt",
  "C3Q",
  "C3Jt",
  "C3St",
  "C3Jm",
  "C3Sm",
  "CDQ",
  "CDJt",
  "CDSt",
  "D4Q",
  "D4Jt",
  "D4St",
  "D4Jm",
  "D4Sm",
  "BomR0Q"
);

var equivalentes = new Array(
  "RR0Et",
  "R0AEt",
  "A1Et",
  "ABEt",
  "B2Et",
  "BCEt",
  "C3Et",
  "CDEt",
  "D4Et"
);

/*
hid,mca,req

hidA1,hidB2,hidC3,hidD4

RR0Dt,RR0Ct,RR0Ds,RR0Et,RR0Q,RR0Comt,RR0Jt,RR0St,RR0P,
R0ADt,R0ACt,R0ADs,R0AEt,R0AQ,R0AComt,R0AJt,R0ASt,R0AP,

A1Dt,A1Ct,A1Ds,A1Et,A1Dm,A1Cm,A1Q,A1Comt,A1Jt,A1St,A1Jm,A1Sm,A1P,

ABDt,ABCt,ABDs,ABEt,ABQ,ABComt,ABJt,ABSt,ABP,

B2Dt,B2Ct,B2Ds,B2Et,B2Dm,B2Cm,B2Q,B2Comt,B2Jt,B2St,B2Jm,B2Sm,B2P,

BCDt,BCCt,BCDs,BCEt,BCQ,BCComt,BCJt,BCSt,BCP,

C3Dt,C3Ct,C3Ds,C3Et,C3Dm,C3Cm,C3Q,C3Comt,C3Jt,C3St,C3Jm,C3Sm,C3P,

CDDt,CDCt,CDDs,CDEt,CDQ,CDComt,CDJt,CDSt,CDP,

D4Dt,D4Ct,D4Ds,D4Et,D4Dm,D4Cm,D4Q,D4Comt,D4Jt,D4St,D4Jm,D4Sm,D4P,


BomR0,Hmg,BomR0Q

alt,altQ,althid,altmin,altrti
*/

function vl(i) {
  if (document.getElementById(i).value) {
    var v = document.getElementById(i).value;
    var v = parseFloat(v.replace(",", "."));
    if (i == "RR0Ds" || i == "RADs") {
      var v = -v;
    }
  } else {
    var v = 0;
  }
  return v;
}

function vlt(i) {
  if (document.getElementById(i).value) {
    var v = encodeURI(document.getElementById(i).value);
  } else {
    var v = "";
  }
  return v;
}

function vl0(i) {
  if (document.getElementById(i).value) {
    var v = document.getElementById(i).value;
    var v = parseFloat(v.replace(",", "."));
    var v = v.toFixed(0);
    var v = v.replace(".", ",");
  } else {
    var v = "0";
  }
  return v;
}

function vl2(i) {
  if (document.getElementById(i).value) {
    var v = document.getElementById(i).value;
    var v = parseFloat(v.replace(",", "."));
    //if (i == 'RR0Ds' ||  i == 'RADs'){var v = -v;}
    var v = v.toFixed(2);
    var v = v.replace(".", ",");
  } else {
    var v = "0,00";
  }
  return v;
}

function vl6(i) {
  if (document.getElementById(i).value) {
    var v = document.getElementById(i).value;
    var v = parseFloat(v.replace(",", "."));
    var v = v.toFixed(6);
    var v = v.replace(".", ",");
  } else {
    var v = "0,000000";
  }
  return v;
}

function mudahid(hidid, obj) {
  vd(hidid, obj.value);
  if (obj.hidmin) {
    vd("hidmin", obj.value);
  }
}

function hidrantes() {
  var hid = vl("hid");
  for (var i = 0; i < 9; i++) {
    document.getElementById("linha" + i).style.display = "";
  }
  document.getElementById("hidB2").style.display = "";
  document.getElementById("hidC3").style.display = "";
  document.getElementById("hidD4").style.display = "";

  if (hid == 1) {
    simhid = 1;
  }
  if (hid >= 2) {
    simhid = 2;
  }
  if (hid >= 5) {
    simhid = 3;
  }
  if (hid > 6) {
    simhid = 4;
  }

  if (simhid == 1) {
    document.getElementById("linha8").style.display = "none";
    document.getElementById("linha7").style.display = "none";
    document.getElementById("linha6").style.display = "none";
    document.getElementById("linha5").style.display = "none";
    document.getElementById("linha4").style.display = "none";
    document.getElementById("linha3").style.display = "none";
    document.getElementById("hidB2").style.display = "none";
    document.getElementById("hidC3").style.display = "none";
    document.getElementById("hidD4").style.display = "none";
  }
  if (simhid == 2) {
    document.getElementById("linha8").style.display = "none";
    document.getElementById("linha7").style.display = "none";
    document.getElementById("linha6").style.display = "none";
    document.getElementById("linha5").style.display = "none";
    document.getElementById("hidC3").style.display = "none";
    document.getElementById("hidD4").style.display = "none";
  }
  if (simhid == 3) {
    document.getElementById("linha8").style.display = "none";
    document.getElementById("linha7").style.display = "none";
    document.getElementById("hidD4").style.display = "none";
  }
  document.getElementById("imghid").src = "shp0" + simhid + ".gif";
  //alert (document.getElementById('imghid').src);
}

function vd(i, v) {
  if (i == "RR0Ds" || i == "RADs") {
    var v = -v;
  }
  document.getElementById(i).value = v;
}

function m(n) {
  n = Math.pow(Math.pow(n, 2), 0.5);
  return n;
}

function pcu(Q, C, D) {
  var J =
    (10.641 * Math.pow(Q, 1.85)) / (Math.pow(C, 1.85) * Math.pow(D, 4.87));
  return J;
}

function pce(Q, de) {
  A = Math.PI * Math.pow(de / 2000, 2);
  V = Q / A;
  Je1 = 1 / Math.pow(0.98, 2) - 1;
  Je2 = Math.pow(V, 2) / (2 * 9.81);
  Je = Je1 * Je2;
  if (document.getElementById("calcesg").checked == true) {
    return Je;
  }
  return 0;
}

function vz(d, H) {
  var Q = 0.2046 * Math.pow(d, 2) * Math.pow(m(H), 0.5);
  var Q = Q / 60000;
  return Q;
}

function calcularP() {
  /////////////////CALCULO RR0//////////////
  RR0Q = Qt1;
  vd("RR0Q", RR0Q);
  vd("RR0Q1", RR0Q * 60000);
  RR0Comt = vl("RR0Ct") + m(vl("RR0Ds")) + vl("RR0Et");
  vd("RR0Comt", RR0Comt);
  RR0Jt = pcu(RR0Q, crt, vl("RR0Dt") / 1000);
  vd("RR0Jt", RR0Jt);
  RR0St = RR0Comt * RR0Jt;
  vd("RR0St", RR0St);
  RR0P = -vl("RR0Ds") - RR0St;
  vd("RR0P", RR0P);
  /////////////////CALCULO R0A//////////////
  R0AQ = Qt1;
  vd("R0AQ", R0AQ);
  vd("R0AQ1", R0AQ * 60000);
  R0AComt = vl("R0ACt") + vl("R0AEt");
  vd("R0AComt", R0AComt);
  R0AJt = pcu(R0AQ, crt, vl("R0ADt") / 1000);
  vd("R0AJt", R0AJt);
  R0ASt = R0AComt * R0AJt;
  vd("R0ASt", R0ASt);
  R0AP = -vl("R0ADs") + RR0P - R0ASt;
  vd("R0AP", R0AP);
  /////////////////CALCULO A1//////////////
  A1Comt = vl("A1Ct") + vl("A1Et");
  vd("A1Comt", A1Comt);
  A1Jt = pcu(A1Q, crt, vl("A1Dt") / 1000);
  vd("A1Jt", A1Jt);
  A1St = A1Comt * A1Jt;
  vd("A1St", A1St);
  A1Jm = pcu(A1Q, crm, vl("A1Dm") / 1000);
  vd("A1Jm", A1Jm);
  A1Sm = vl("A1Cm") * A1Jm;
  vd("A1Sm", A1Sm);

  A1Je = pce(A1Q, vl("req"));

  A1P = -vl("A1Ds") + R0AP - A1St - A1Sm - A1Je;
  vd("A1P", A1P);
  if (vl("hid") >= 2) {
    /////////////////CALCULO AB//////////////
    ABQ = Qt2;
    vd("ABQ", ABQ);
    vd("ABQ1", ABQ * 60000);
    ABComt = vl("ABCt") + vl("ABEt");
    vd("ABComt", ABComt);
    ABJt = pcu(ABQ, crt, vl("ABDt") / 1000);
    vd("ABJt", ABJt);
    ABSt = ABComt * ABJt;
    vd("ABSt", ABSt);
    ABP = -vl("ABDs") + R0AP - ABSt;
    vd("ABP", ABP);
    ///////////////////CALCULO B2P/////////////
    B2Comt = vl("B2Ct") + vl("B2Et");
    vd("B2Comt", B2Comt);
    B2Jt = pcu(B2Q, crt, vl("B2Dt") / 1000);
    vd("B2Jt", B2Jt);
    B2St = B2Comt * B2Jt;
    vd("B2St", B2St);
    B2Jm = pcu(B2Q, crm, vl("B2Dm") / 1000);
    vd("B2Jm", B2Jm);
    B2Sm = vl("B2Cm") * B2Jm;
    vd("B2Sm", B2Sm);

    B2Je = pce(B2Q, vl("req"));

    B2P = -vl("B2Ds") + ABP - B2St - B2Sm - B2Je;
    vd("B2P", B2P);
    if (vl("hid") >= 5) {
      /////////////////CALCULO BC//////////////
      BCQ = Qt3;
      vd("BCQ", BCQ);
      vd("BCQ1", BCQ * 60000);
      BCComt = vl("BCCt") + vl("BCEt");
      vd("BCComt", BCComt);
      BCJt = pcu(BCQ, crt, vl("BCDt") / 1000);
      vd("BCJt", BCJt);
      BCSt = BCComt * BCJt;
      vd("BCSt", BCSt);
      BCP = -vl("BCDs") + ABP - BCSt;
      vd("BCP", BCP);
      ////////////////CALCULO C3P/////////////
      C3Comt = vl("C3Ct") + vl("C3Et");
      vd("C3Comt", C3Comt);
      C3Jt = pcu(C3Q, crt, vl("C3Dt") / 1000);
      vd("C3Jt", C3Jt);
      C3St = C3Comt * C3Jt;
      vd("C3St", C3St);
      C3Jm = pcu(C3Q, crm, vl("C3Dm") / 1000);
      vd("C3Jm", C3Jm);
      C3Sm = vl("C3Cm") * C3Jm;
      vd("C3Sm", C3Sm);

      C3Je = pce(C3Q, vl("req"));

      C3P = -vl("C3Ds") + BCP - C3St - C3Sm - C3Je;
      vd("C3P", C3P);
      if (vl("hid") > 6) {
        /////////////////CALCULO CD//////////////
        CDQ = Qt4;
        vd("CDQ", CDQ);
        vd("CDQ1", CDQ * 60000);
        CDComt = vl("CDCt") + vl("CDEt");
        vd("CDComt", CDComt);
        CDJt = pcu(CDQ, crt, vl("CDDt") / 1000);
        vd("CDJt", CDJt);
        CDSt = CDComt * CDJt;
        vd("CDSt", CDSt);
        CDP = -vl("CDDs") + BCP - CDSt;
        vd("CDP", CDP);
        ///////////////////CALCULO D4P/////////////
        D4Comt = vl("D4Ct") + vl("D4Et");
        vd("D4Comt", D4Comt);
        D4Jt = pcu(D4Q, crt, vl("D4Dt") / 1000);
        vd("D4Jt", D4Jt);
        D4St = (vl("D4Ct") + vl("D4Et")) * D4Jt;
        vd("D4St", D4St);
        D4Jm = pcu(D4Q, crm, vl("D4Dm") / 1000);
        vd("D4Jm", D4Jm);
        D4Sm = vl("D4Cm") * D4Jm;
        vd("D4Sm", D4Sm);

        D4Je = pce(D4Q, vl("req"));

        D4P = -vl("D4Ds") + CDP - D4St - D4Sm - D4Je;
        vd("D4P", D4P);
      }
    }
  }
}

function calcularQ() {
  ///////////////////CALCULO A1P/////////////
  A1Jt = pcu(A1Q, crt, vl("A1Dt") / 1000);
  A1St = (vl("A1Ct") + vl("A1Et")) * A1Jt;
  A1Jm = pcu(A1Q, crm, vl("A1Dm") / 1000);
  A1Sm = vl("A1Cm") * A1Jm;

  A1Je = pce(A1Q, vl("req"));

  A1P = vl("mca") + A1St + A1Sm + vl("A1Ds") + A1Je;

  if (vl("hid") >= 2) {
    ///////////////////CALCULO B2P/////////////
    B2Jt = pcu(B2Q, crt, vl("B2Dt") / 1000);
    B2St = (vl("B2Ct") + vl("B2Et")) * B2Jt;
    B2Jm = pcu(B2Q, crm, vl("B2Dm") / 1000);
    B2Sm = vl("B2Cm") * B2Jm;

    B2Je = pce(B2Q, vl("req"));

    B2P = vl("mca") + B2St + B2Sm + vl("B2Ds") + B2Je;
    if (vl("hid") >= 5) {
      ////////////////CALCULO C3P/////////////
      C3Jt = pcu(C3Q, crt, vl("C3Dt") / 1000);
      C3St = (vl("C3Ct") + vl("C3Et")) * C3Jt;
      C3Jm = pcu(C3Q, crm, vl("C3Dm") / 1000);
      C3Sm = vl("C3Cm") * C3Jm;

      C3Je = pce(C3Q, vl("req"));

      C3P = vl("mca") + C3St + C3Sm + vl("C3Ds") + C3Je;
      if (vl("hid") > 6) {
        ///////////////////CALCULO D4P/////////////
        D4Jt = pcu(D4Q, crt, vl("D4Dt") / 1000);
        D4St = (vl("D4Ct") + vl("D4Et")) * D4Jt;
        D4Jm = pcu(D4Q, crm, vl("D4Dm") / 1000);
        D4Sm = vl("D4Cm") * D4Jm;

        D4Je = pce(D4Q, vl("req"));

        D4P = vl("mca") + D4St + D4Sm + vl("D4Ds") + D4Je;
        ///////////////////////////////////////////
      }
    }
  }
  if (simhid == 1) {
    Qt1 = A1Q;
  }
  if (simhid == 2) {
    Qt1 = A1Q + B2Q;
    Qt2 = B2Q;
  }
  if (simhid == 3) {
    Qt1 = A1Q + B2Q + C3Q;
    Qt2 = B2Q + C3Q;
    Qt3 = C3Q;
  }
  if (simhid == 4) {
    Qt1 = A1Q + B2Q + C3Q + D4Q;
    Qt2 = B2Q + C3Q + D4Q;
    Qt3 = C3Q + D4Q;
    Qt4 = D4Q;
  }

  //////////////////////////////////////////
  /////////////////CALCULO R0A//////////////
  R0AQ = Qt1;
  R0AJt = pcu(R0AQ, crt, vl("R0ADt") / 1000);
  R0ASt = (vl("R0ACt") + vl("R0AEt")) * R0AJt;
  R0AP = A1P + R0ASt + vl("R0ADs");
  /////////////////CALCULO RR0 X//////////////
  RR0Q = Qt1;
  RR0Jt = pcu(RR0Q, crt, vl("RR0Dt") / 1000);

  //H1 = (R0AP+(vl('RR0Ct')+vl('RR0Et'))*RR0Jt)*(1+RR0Jt);
  H1 = (R0AP + (vl("RR0Ct") + vl("RR0Et")) * RR0Jt) / (1 - RR0Jt);
  ////////////////////////////////////////////
  ////////////////////////////////////////////

  if (vl("hid") >= 2) {
    //////////////////////////////////////////
    /////////////////CALCULO AB//////////////
    ABQ = Qt2;
    ABJt = pcu(ABQ, crt, vl("ABDt") / 1000);
    ABSt = (vl("ABCt") + vl("ABEt")) * ABJt;
    ABP = B2P + ABSt + vl("ABDs");
    /////////////////CALCULO R0A//////////////
    R0AQ = Qt1;
    R0AJt = pcu(R0AQ, crt, vl("R0ADt") / 1000);
    R0ASt = (vl("R0ACt") + vl("R0AEt")) * R0AJt;
    R0AP = ABP + R0ASt + vl("R0ADs");
    /////////////////CALCULO RR0 X//////////////
    RR0Q = Qt1;
    RR0Jt = pcu(RR0Q, crt, vl("RR0Dt") / 1000);
    //H2 = (R0AP+(vl('RR0Ct')+vl('RR0Et'))*RR0Jt)*(1+RR0Jt);
    H2 = (R0AP + (vl("RR0Ct") + vl("RR0Et")) * RR0Jt) / (1 - RR0Jt);
    ////////////////////////////////////////////
    ////////////////////////////////////////////

    if (vl("hid") >= 5) {
      //////////////////////////////////////////
      /////////////////CALCULO BC//////////////
      BCQ = Qt3;
      BCJt = pcu(BCQ, crt, vl("BCDt") / 1000);
      BCSt = (vl("BCCt") + vl("BCEt")) * BCJt;
      BCP = C3P + BCSt + vl("BCDs");
      /////////////////CALCULO AB//////////////
      ABQ = Qt2;
      ABJt = pcu(ABQ, crt, vl("ABDt") / 1000);
      ABSt = (vl("ABCt") + vl("ABEt")) * ABJt;
      ABP = BCP + ABSt + vl("ABDs");
      /////////////////CALCULO R0A//////////////
      R0AQ = Qt1;
      R0AJt = pcu(R0AQ, crt, vl("R0ADt") / 1000);
      R0ASt = (vl("R0ACt") + vl("R0AEt")) * R0AJt;
      R0AP = ABP + R0ASt + vl("R0ADs");
      /////////////////CALCULO RR0 X//////////////
      RR0Q = Qt1;
      RR0Jt = pcu(RR0Q, crt, vl("RR0Dt") / 1000);
      //H3 = (R0AP+(vl('RR0Ct')+vl('RR0Et'))*RR0Jt)*(1+RR0Jt);
      H3 = (R0AP + (vl("RR0Ct") + vl("RR0Et")) * RR0Jt) / (1 - RR0Jt);
      ////////////////////////////////////////////
      ////////////////////////////////////////////

      if (vl("hid") > 6) {
        //////////////////////////////////////////
        /////////////////CALCULO CD//////////////
        CDQ = Qt4;
        CDJt = pcu(CDQ, crt, vl("CDDt") / 1000);
        CDSt = (vl("CDCt") + vl("CDEt")) * CDJt;
        CDP = D4P + CDSt + vl("CDDs");
        /////////////////CALCULO BC//////////////
        BCQ = Qt3;
        BCJt = pcu(BCQ, crt, vl("BCDt") / 1000);
        BCSt = (vl("BCCt") + vl("BCEt")) * BCJt;
        BCP = CDP + BCSt + vl("BCDs");
        /////////////////CALCULO AB//////////////
        ABQ = Qt2;
        ABJt = pcu(ABQ, crt, vl("ABDt") / 1000);
        ABSt = (vl("ABCt") + vl("ABEt")) * ABJt;
        ABP = BCP + ABSt + vl("ABDs");
        /////////////////CALCULO R0A//////////////
        R0AQ = Qt1;
        R0AJt = pcu(R0AQ, crt, vl("R0ADt") / 1000);
        R0ASt = (vl("R0ACt") + vl("R0AEt")) * R0AJt;
        R0AP = ABP + R0ASt + vl("R0ADs");
        /////////////////CALCULO RR0 X//////////////
        RR0Q = Qt1;
        RR0Jt = pcu(RR0Q, crt, vl("RR0Dt") / 1000);
        //H4 = (R0AP+(vl('RR0Ct')+vl('RR0Et'))*RR0Jt)*(1+RR0Jt);
        H4 = (R0AP + (vl("RR0Ct") + vl("RR0Et")) * RR0Jt) / (1 - RR0Jt);
        ////////////////////////////////////////////
        ////////////////////////////////////////////
      }
    }
  }

  HmaxBck = Hmax;

  if (simhid == 1) {
    Hmax = H1;
  }
  if (simhid == 2) {
    Hmax = Math.max(H1, H2);
  }
  if (simhid == 3) {
    H12 = Math.max(H1, H2);
    Hmax = Math.max(H12, H3);
  }
  if (simhid == 4) {
    H12 = Math.max(H1, H2);
    H34 = Math.max(H3, H4);
    Hmax = Math.max(H12, H34);
  }

  RR0Ds = -Hmax;
  vd("RR0Ds", RR0Ds);

  document.getElementById("hidA1").hidmin = false;
  document.getElementById("hidB2").hidmin = false;
  document.getElementById("hidC3").hidmin = false;
  document.getElementById("hidD4").hidmin = false;

  if (H1 == Hmax) {
    hidmin = vlt("A1");
    document.getElementById("hidA1").hidmin = true;
    RADs = RR0Ds + vl("R0ADs") + vl("A1Ds");
  }
  if (H2 == Hmax) {
    hidmin = vlt("B2");
    document.getElementById("hidB2").hidmin = true;
    RADs = RR0Ds + vl("R0ADs") + vl("ABDs") + vl("B2Ds");
  }
  if (H3 == Hmax) {
    hidmin = vlt("C3");
    document.getElementById("hidC3").hidmin = true;
    RADs = RR0Ds + vl("R0ADs") + vl("ABDs") + vl("BCDs") + vl("C3Ds");
  }
  if (H4 == Hmax) {
    hidmin = vlt("D4");
    document.getElementById("hidD4").hidmin = true;
    RADs =
      RR0Ds + vl("R0ADs") + vl("ABDs") + vl("BCDs") + vl("CDDs") + vl("D4Ds");
  }

  vd("RADs", RADs);
  vd("hidmin", hidmin);
}

function calcularBom() {
  Hmg = vl("RR0P") + vl("BomR0") + (vl("RR0Ct") + vl("RR0Et")) * vl("RR0Jt");
  vd("Hmg", Hmg);
  vd("BomR0Q1", RR0Q * 60000);
  vd("BomR0Q", RR0Q);
  vd("BomR0Q2", RR0Q * 3600);
  vd("BomR0Q3", RR0Q * 3600000);
}

function calcularRTI() {
  calcular();
  if (vl("hid") > 4) {
    exd = vl("hid") - 4;
  } else {
    exd = 0;
  }
  vd("althid", exd);
  if (vlt("altclass") == "1") {
    altQ = vz(vl("req"), vl("alt")) * 60000;
    vd("altQ", altQ);
  } else if (vlt("altclass") == "2") {
    if (simhid == 1) {
      altQ = vl("A1Q1");
      vd("altQ", altQ);
    }
    if (simhid == 2) {
      altQ = vl("A1Q1") + vl("B2Q1");
      vd("altQ", altQ);
    }
    if (simhid == 3) {
      altQ = vl("A1Q1") + vl("B2Q1") + vl("C3Q1");
      vd("altQ", altQ);
    }
    if (simhid == 4) {
      altQ = vl("A1Q1") + vl("B2Q1") + vl("C3Q1") + vl("D4Q1");
      vd("altQ", altQ);
    }
  }
  altmin = vl("altbase") + exd * 2;
  vd("altmin", altmin);
  RTI = altQ * altmin;
  vd("altrti", RTI);
}

function calcular(H) {
  //$trecho = array('RR0','R0A','A1','AB','B2','BC','C3','CD','D4');
  //$tipo = array('Dt','Ct','Ds','Et','Dm','Cm','Q','Jt','St','Jm','Sm','P');
  /////////DETERMINANDO VAZÕES////////

  Hmax = 0;

  DsR1 = -vl("R0ADs") - vl("A1Ds");
  Dsmin = DsR1;
  if (vl("hid") >= 2) {
    DsR2 = -vl("R0ADs") - vl("ABDs") - vl("B2Ds");
    Dsmin = Math.max(DsR1, DsR2);
    if (vl("hid") >= 5) {
      DsR3 = -vl("R0ADs") - vl("ABDs") - vl("BCDs") - vl("C3Ds");
      DsR1R2 = Math.max(DsR1, DsR2);
      Dsmin = Math.max(DsR1R2, DsR3);
      if (vl("hid") > 6) {
        DsR4 = -vl("R0ADs") - vl("ABDs") - vl("BCDs") - vl("CDDs") - vl("D4Ds");
        DsR1R2 = Math.max(DsR1, DsR2);
        DsR3R4 = Math.max(DsR3, DsR4);
        Dsmin = Math.max(DsR1R2, DsR3R4);
      }
    }
  }

  if (simhid == 1) {
    R01 = vl("mca") + DsR1 - Dsmin;

    A1Q = vz(vl("req"), R01);
    vd("A1Q", A1Q);
    vd("A1Q1", A1Q * 60000);
  }
  if (simhid == 2) {
    R01 = vl("mca") + DsR1 - Dsmin;
    R02 = vl("mca") + DsR2 - Dsmin;

    A1Q = vz(vl("req"), R01);
    vd("A1Q", A1Q);
    vd("A1Q1", A1Q * 60000);
    B2Q = vz(vl("req"), R02);
    vd("B2Q", B2Q);
    vd("B2Q1", B2Q * 60000);
  }
  if (simhid == 3) {
    R01 = vl("mca") + DsR1 - Dsmin;
    R02 = vl("mca") + DsR2 - Dsmin;
    R03 = vl("mca") + DsR3 - Dsmin;

    A1Q = vz(vl("req"), R01);
    vd("A1Q", A1Q);
    vd("A1Q1", A1Q * 60000);
    B2Q = vz(vl("req"), R02);
    vd("B2Q", B2Q);
    vd("B2Q1", B2Q * 60000);
    C3Q = vz(vl("req"), R03);
    vd("C3Q", C3Q);
    vd("C3Q1", C3Q * 60000);
  }
  if (simhid == 4) {
    R01 = vl("mca") + DsR1 - Dsmin;
    R02 = vl("mca") + DsR2 - Dsmin;
    R03 = vl("mca") + DsR3 - Dsmin;
    R04 = vl("mca") + DsR4 - Dsmin;

    A1Q = vz(vl("req"), R01);
    vd("A1Q", A1Q);
    vd("A1Q1", A1Q * 60000);
    B2Q = vz(vl("req"), R02);
    vd("B2Q", B2Q);
    vd("B2Q1", B2Q * 60000);
    C3Q = vz(vl("req"), R03);
    vd("C3Q", C3Q);
    vd("C3Q1", C3Q * 60000);
    D4Q = vz(vl("req"), R04);
    vd("D4Q", D4Q);
    vd("D4Q1", D4Q * 60000);
  }

  calcularQ();
  calcularP();

  while (HmaxBck.toFixed(3) != Hmax.toFixed(3)) {
    //alert (HmaxBck.toFixed(3) +'='+ Hmax.toFixed(3));
    if (simhid == 1) {
      Qt1 = A1Q;
      A1Q = vz(vl("req"), vl("A1P"));
      vd("A1Q", A1Q);
      vd("A1Q1", A1Q * 60000);
    }
    if (simhid == 2) {
      Qt1 = A1Q + B2Q;
      Qt2 = B2Q;
      A1Q = vz(vl("req"), vl("A1P"));
      vd("A1Q", A1Q);
      vd("A1Q1", A1Q * 60000);
      B2Q = vz(vl("req"), vl("B2P"));
      vd("B2Q", B2Q);
      vd("B2Q1", B2Q * 60000);
    }
    if (simhid == 3) {
      Qt1 = A1Q + B2Q + C3Q;
      Qt2 = B2Q + C3Q;
      Qt3 = C3Q;
      A1Q = vz(vl("req"), vl("A1P"));
      vd("A1Q", A1Q);
      vd("A1Q1", A1Q * 60000);
      B2Q = vz(vl("req"), vl("B2P"));
      vd("B2Q", B2Q);
      vd("B2Q1", B2Q * 60000);
      C3Q = vz(vl("req"), vl("C3P"));
      vd("C3Q", C3Q);
      vd("C3Q1", C3Q * 60000);
    }
    if (simhid == 4) {
      Qt1 = A1Q + B2Q + C3Q + D4Q;
      Qt2 = B2Q + C3Q + D4Q;
      Qt3 = C3Q + D4Q;
      Qt4 = D4Q;
      A1Q = vz(vl("req"), vl("A1P"));
      vd("A1Q", A1Q);
      vd("A1Q1", A1Q * 60000);
      B2Q = vz(vl("req"), vl("B2P"));
      vd("B2Q", B2Q);
      vd("B2Q1", B2Q * 60000);
      C3Q = vz(vl("req"), vl("C3P"));
      vd("C3Q", C3Q);
      vd("C3Q1", C3Q * 60000);
      D4Q = vz(vl("req"), vl("D4P"));
      vd("D4Q", D4Q);
      vd("D4Q1", D4Q * 60000);
    }

    calcularQ();
    calcularP();
  }

  calcularBom();
}

function eq(obj, id) {
  MainDiv = document.getElementById("MainDiv");
  if (MainDiv) {
    MainDiv.parentNode.removeChild(MainDiv);
  }
  /////////////background////////////////
  var BackgroundDiv = document.createElement("DIV");
  BackgroundDiv.id = "MainDiv";
  BackgroundDiv.style.visibility = "visible";
  BackgroundDiv.style.zIndex = "666";
  BackgroundDiv.style.position = "absolute";
  BackgroundDiv.style.background = "#000";
  BackgroundDiv.style.opacity = "0.30";
  BackgroundDiv.style.filter = "alpha(opacity=30)";
  BackgroundDiv.style.width = "100%";
  BackgroundDiv.style.height = "100%";
  BackgroundDiv.style.left = 0 + "px";
  BackgroundDiv.style.top = 0 + "px";
  document.body.appendChild(BackgroundDiv);
  ////////////main///////////////////////////
  var MainDiv = document.createElement("DIV");
  MainDiv.id = "MainDiv";
  MainDiv.style.visibility = "visible";
  MainDiv.style.zIndex = "999";
  MainDiv.style.position = "absolute";
  MainDiv.style.background = "#FFF";
  MainDiv.style.width = "812px";
  MainDiv.style.height = "612px";
  document.body.appendChild(MainDiv);
  //////////////div left////////////////
  var calDivL = document.createElement("DIV");
  calDivL.id = "LDiv";
  calDivL.style.cssFloat = "left";
  calDivL.style.styleFloat = "left";
  calDivL.style.border = "solid";
  calDivL.style.width = "500px";
  calDivL.style.height = "550px";

  var LtopDiv = document.createElement("DIV");
  LtopDiv.style.cssFloat = "left";
  LtopDiv.style.borderBottom = "solid";
  LtopDiv.style.width = "500px";
  LtopDiv.style.height = "50px";

  var calTable = document.createElement("TABLE");
  calTable.cellSpacing = "0";

  var calTHead = document.createElement("THEAD");

  var calTLine = document.createElement("TR");
  calTLine.style.width = "500px";
  calTLine.style.height = "50px";

  var calTCell = document.createElement("TD");
  calTCell.style.width = "105px";
  calTCell.innerHTML = equi_Array[0][0];
  calTLine.appendChild(calTCell);

  for (var i = 7; i < equi_Array[0].length; i++) {
    var calTCell = document.createElement("TD");
    calTCell.style.borderLeft = "solid";
    calTCell.style.borderWidth = "1px";
    calTCell.align = "center";
    calTCell.style.width = "44px";
    calTCell.innerHTML = equi_Array[0][i];
    calTLine.appendChild(calTCell);
  }

  calTHead.appendChild(calTLine);

  calTable.appendChild(calTHead);

  LtopDiv.appendChild(calTable);

  calDivL.appendChild(LtopDiv);

  var LmidDiv = document.createElement("DIV");
  LmidDiv.style.cssFloat = "left";
  LmidDiv.style.overflowY = "scroll";
  LmidDiv.style.borderBottom = "solid";
  LmidDiv.style.width = "500px";
  LmidDiv.style.height = "450px";

  var calTable = document.createElement("TABLE");
  calTable.cellSpacing = "0";

  var calTBody = document.createElement("TBODY");

  for (var i = 1; i < equi_Array.length; i++) {
    var calTLine = document.createElement("TR");
    calTLine.style.width = "500px";
    calTLine.style.height = "30px";

    var calTCell = document.createElement("TD");
    calTCell.style.width = "130px";
    calTCell.style.borderBottom = "solid";
    calTCell.style.borderWidth = "1px";
    calTCell.innerHTML = equi_Array[i][0];
    calTLine.appendChild(calTCell);

    for (var j = 7; j < equi_Array[i].length; j++) {
      var calTCell = document.createElement("TD");
      calTCell.id = i + "," + j;
      calTCell.style.cursor = "pointer";
      calTCell.style.cursor = "hand";
      calTCell.style.borderLeft = "solid";
      calTCell.style.borderBottom = "solid";
      calTCell.style.borderWidth = "1px";
      calTCell.align = "center";
      calTCell.style.width = "50px";
      calTCell.tx = i;
      calTCell.ty = j;
      calTCell.onclick = function () {
        AddCon(this.tx, this.ty);
      };
      calTCell.innerHTML = equi_Array[i][j];
      calTLine.appendChild(calTCell);
    }

    calTBody.appendChild(calTLine);
  }

  calTable.appendChild(calTBody);

  LmidDiv.appendChild(calTable);

  calDivL.appendChild(LmidDiv);

  MainDiv.appendChild(calDivL);

  ///////////////////div right//////////////
  var calDivR = document.createElement("DIV");
  calDivR.id = "RDiv";
  calDivR.style.cssFloat = "left";
  calDivR.style.styleFloat = "left";
  calDivR.style.border = "solid";
  calDivR.style.width = "300px";
  calDivR.style.height = "550px";

  var RtopDiv = document.createElement("DIV");
  RtopDiv.style.cssFloat = "left";
  RtopDiv.style.borderBottom = "solid";
  RtopDiv.style.height = "50px";

  var calTable = document.createElement("TABLE");
  calTable.cellSpacing = "0";

  var calTHead = document.createElement("THEAD");

  var calTLine = document.createElement("TR");
  calTLine.style.height = "50px";

  var calTCell = document.createElement("TD");
  calTCell.align = "center";
  calTCell.style.width = "130px";
  calTCell.innerHTML = "Conexão";
  calTLine.appendChild(calTCell);

  var calTCell = document.createElement("TD");
  calTCell.style.borderLeft = "solid";
  calTCell.style.borderWidth = "1px";
  calTCell.align = "center";
  calTCell.style.width = "55px";
  calTCell.innerHTML = "&empty;";
  calTLine.appendChild(calTCell);

  var calTCell = document.createElement("TD");
  calTCell.style.borderLeft = "solid";
  calTCell.style.borderWidth = "1px";
  calTCell.align = "center";
  calTCell.style.width = "55px";
  calTCell.innerHTML = "Comp.<br>Equi.";
  calTLine.appendChild(calTCell);

  var calTCell = document.createElement("TD");
  calTCell.style.borderLeft = "solid";
  calTCell.style.borderWidth = "1px";
  calTCell.align = "center";
  calTCell.style.width = "30px";
  calTLine.appendChild(calTCell);

  calTHead.appendChild(calTLine);

  calTable.appendChild(calTHead);

  RtopDiv.appendChild(calTable);

  calDivR.appendChild(RtopDiv);

  var RmidDiv = document.createElement("DIV");
  RmidDiv.style.cssFloat = "left";
  RmidDiv.style.overflowY = "scroll";
  RmidDiv.style.borderBottom = "solid";
  RmidDiv.style.height = "450px";

  var calTable = document.createElement("TABLE");
  calTable.cellSpacing = "0";

  var calTBody = document.createElement("TBODY");
  calTBody.id = "TBodyCon";

  var calTLine = document.createElement("TR");
  calTLine.style.height = "1px";

  var calTCell = document.createElement("TD");
  calTCell.style.borderBottom = "solid";
  calTCell.style.borderWidth = "1px";
  calTCell.align = "center";
  calTCell.style.width = "130px";
  calTLine.appendChild(calTCell);

  var calTCell = document.createElement("TD");
  calTCell.style.borderLeft = "solid";
  calTCell.style.borderBottom = "solid";
  calTCell.style.borderWidth = "1px";
  calTCell.align = "center";
  calTCell.style.width = "55px";
  calTLine.appendChild(calTCell);

  var calTCell = document.createElement("TD");
  calTCell.style.borderLeft = "solid";
  calTCell.style.borderBottom = "solid";
  calTCell.style.borderWidth = "1px";
  calTCell.align = "center";
  calTCell.style.width = "55px";
  calTLine.appendChild(calTCell);

  var calTCell = document.createElement("TD");
  calTCell.style.borderLeft = "solid";
  calTCell.style.borderBottom = "solid";
  calTCell.style.borderWidth = "1px";
  calTCell.align = "center";
  calTCell.style.width = "30px";

  calTLine.appendChild(calTCell);

  calTBody.appendChild(calTLine);

  calTable.appendChild(calTBody);

  RmidDiv.appendChild(calTable);

  calDivR.appendChild(RmidDiv);

  var RbotDiv = document.createElement("DIV");
  RbotDiv.align = "center";

  var input = document.createElement("INPUT");
  input.type = "button";
  input.value = "Limpar";
  input.style.marginTop = "5px";
  input.style.marginLeft = "5px";
  input.style.width = "100px";
  input.style.height = "25px";
  input.onclick = function () {
    LimCon();
  };
  RbotDiv.appendChild(input);

  calDivR.appendChild(RbotDiv);

  MainDiv.appendChild(calDivR);

  //////////div botton/////////////////
  var calDivB = document.createElement("DIV");
  calDivB.id = "BDiv";
  calDivB.style.cssFloat = "left";
  calDivB.align = "center";
  calDivB.style.border = "solid";
  calDivB.style.width = "806px";
  calDivB.style.height = "50px";

  var input = document.createElement("INPUT");
  input.type = "button";
  input.value = "OK";
  input.style.marginTop = "10px";
  input.style.width = "100px";
  input.style.height = "30px";
  input.onclick = function () {
    ok_eq(obj, MainDiv, BackgroundDiv);
  };
  calDivB.appendChild(input);

  var input = document.createElement("INPUT");
  input.type = "button";
  input.value = "Cancelar";
  input.style.marginTop = "10px";
  input.style.marginLeft = "10px";
  input.style.width = "100px";
  input.style.height = "30px";
  input.onclick = function () {
    canc_eq(MainDiv, BackgroundDiv);
  };
  calDivB.appendChild(input);

  var input = document.createElement("INPUT");
  input.type = "text";
  input.value = "Comprimento Equivalente Total =";
  input.style.marginLeft = "10px";
  input.style.width = "200px";
  calDivB.appendChild(input);

  var input = document.createElement("INPUT");
  input.id = "EqTotal";
  input.type = "text";
  input.value = "";
  input.style.marginLeft = "5px";
  input.style.width = "100px";
  calDivB.appendChild(input);

  MainDiv.appendChild(calDivB);

  posBox(MainDiv, obj);

  Obj = obj.parentNode.childNodes.item(0);
  if (Obj.array) {
    for (var i = 0; i < Obj.array.length; i++) {
      AddCon(Obj.array[i][0], Obj.array[i][1]);
    }
  }
}

function LimCon() {
  var TBody = document.getElementById("TBodyCon");
  var num = TBody.rows.length;
  for (var i = 1; i < num; i++) {
    linha = TBody.rows.item(1);
    linha.parentNode.removeChild(linha);
  }
  CalCon();
}

function AddCon(X, Y) {
  TBody = document.getElementById("TBodyCon");

  var calTLine = document.createElement("TR");
  calTLine.style.height = "30px";
  calTLine.tx = X;
  calTLine.ty = Y;

  var calTCell = document.createElement("TD");
  calTCell.style.borderBottom = "solid";
  calTCell.style.borderWidth = "1px";
  calTCell.align = "center";
  calTCell.style.width = "130px";
  calTCell.innerHTML = equi_Array[X][0];
  calTLine.appendChild(calTCell);

  var calTCell = document.createElement("TD");
  calTCell.style.borderLeft = "solid";
  calTCell.style.borderBottom = "solid";
  calTCell.style.borderWidth = "1px";
  calTCell.align = "center";
  calTCell.style.width = "55px";
  calTCell.innerHTML = equi_Array[0][Y];
  calTLine.appendChild(calTCell);

  var calTCell = document.createElement("TD");
  calTCell.style.borderLeft = "solid";
  calTCell.style.borderBottom = "solid";
  calTCell.style.borderWidth = "1px";
  calTCell.align = "center";
  calTCell.style.width = "55px";
  calTCell.innerHTML = equi_Array[X][Y];
  calTLine.appendChild(calTCell);

  var calTCell = document.createElement("TD");
  calTCell.style.borderLeft = "solid";
  calTCell.style.borderBottom = "solid";
  calTCell.style.borderWidth = "1px";
  calTCell.align = "center";
  calTCell.style.width = "30px";

  var input = document.createElement("INPUT");
  input.type = "button";
  input.value = "X";
  input.style.width = "20px";
  input.style.height = "20px";
  input.onclick = function () {
    objetoDel = this.parentNode.parentNode;
    objetoDel.parentNode.removeChild(objetoDel);
    CalCon();
  };
  calTCell.appendChild(input);

  calTLine.appendChild(calTCell);

  TBody.appendChild(calTLine);

  CalCon();
}

function CalCon() {
  ObjEqTotal = document.getElementById("EqTotal");
  var EqTotal = 0;
  var TBody = document.getElementById("TBodyCon");
  var num = TBody.rows.length;
  var count = new Array();
  for (var i = 1; i < num; i++) {
    linha = TBody.rows.item(i);
    x = linha.tx;
    y = linha.ty;
    count[i - 1] = new Array(x, y);
    EqTotal += parseFloat(equi_Array[x][y].replace(",", "."));
  }
  ObjEqTotal.value = EqTotal.toFixed(2);
  ObjEqTotal.EqTotal = EqTotal;
  ObjEqTotal.array = new Array();
  ObjEqTotal.array = count;
}

function ok_eq(obj, Div, BackDiv) {
  CalCon();
  Obj = obj.parentNode.childNodes.item(0);
  Obj.array = new Array();
  Obj.array = ObjEqTotal.array;
  Obj.value = ObjEqTotal.EqTotal.toFixed(2);
  objetoDel = Div;
  objetoDel.parentNode.removeChild(objetoDel);
  objetoDel = BackDiv;
  objetoDel.parentNode.removeChild(objetoDel);
}

function canc_eq(Div, BackDiv) {
  objetoDel = Div;
  objetoDel.parentNode.removeChild(objetoDel);
  objetoDel = BackDiv;
  objetoDel.parentNode.removeChild(objetoDel);
}

function posBox(Div, objeto) {
  calDiv = Div;
  altura_total = document.body.clientHeight;
  altura_objeto = calDiv.offsetHeight;
  af_top = 30;
  distancia_top = getTopPos(objeto) + af_top - 10;
  if (altura_total > 750) {
    if (altura_total < distancia_top + altura_objeto + 5) {
      distancia_top = altura_total - altura_objeto - 5;
    }
  }
  af_left = -500;
  //calDiv.style.left = getleftPos(objeto)+af_left+'px';
  //calDiv.style.top = distancia_top+'px';
  calDiv.style.left = 150 + "px";
  calDiv.style.top = 100 + "px";
}

function getTopPos(inputObj) {
  var returnValue = inputObj.offsetTop + inputObj.offsetHeight;
  while ((inputObj = inputObj.offsetParent) != null)
    returnValue += inputObj.offsetTop;
  return returnValue;
}

function getleftPos(inputObj) {
  var returnValue = inputObj.offsetLeft;
  while ((inputObj = inputObj.offsetParent) != null)
    returnValue += inputObj.offsetLeft;
  return returnValue;
}

function print_input(nome, valor) {
  var input = document.createElement("input");
  input.name = nome;
  input.value = valor;
  return input;
}

function imprimir() {
  calcularRTI();

  var form = document.createElement("form");

  url = location.href.replace(/[^/]*$/, "");
  while (url.charAt(url.length - 1) == "/") {
    url = url.slice(0, -1);
  }
  url += "/imprimir.php";

  form.action = url;
  form.method = "post";
  form.target = "print";

  form.appendChild(print_input("simhid", simhid));
  if (document.getElementById("printele").checked == true) {
    form.appendChild(print_input("printele", "true"));
  }
  if (document.getElementById("printbom").checked == true) {
    form.appendChild(print_input("printbom", "true"));
  }
  if (document.getElementById("printrti").checked == true) {
    form.appendChild(print_input("printrti", "true"));
  }
  if (vl("altrti") < 5000) {
    form.appendChild(print_input("obsrti", "true"));
  }
  for (var i = 0; i < valorest.length; i++) {
    form.appendChild(print_input(valorest[i], decodeURI(vlt(valorest[i]))));
  }
  for (var i = 0; i < valores0.length; i++) {
    form.appendChild(print_input(valores0[i], vl0(valores0[i])));
  }
  for (var i = 0; i < valores2.length; i++) {
    form.appendChild(print_input(valores2[i], vl2(valores2[i])));
  }
  for (var i = 0; i < valores6.length; i++) {
    form.appendChild(print_input(valores6[i], vl6(valores6[i])));
  }
  for (var i = 0; i < equivalentes.length; i++) {
    if (document.getElementById(equivalentes[i]).array) {
      var array = new Array();
      array = document.getElementById(equivalentes[i]).array;
      for (var j = 0; j < array.length; j++) {
        form.appendChild(
          print_input(equivalentes[i] + "ar[" + j + "]", array[j])
        );
      }
    }
  }
  form.style.display = "none";
  document.body.appendChild(form);
  form.submit();
}

function salvar() {
  var string = "";
  //string += '1=1';
  for (var i = 0; i < salvart.length; i++) {
    string += "&" + salvart[i] + "=" + vlt(salvart[i]);
  }
  for (var i = 0; i < salvar0.length; i++) {
    string += "&" + salvar0[i] + "=" + vl0(salvar0[i]);
  }
  for (var i = 0; i < salvar2.length; i++) {
    string += "&" + salvar2[i] + "=" + vl2(salvar2[i]);
  }
  for (var i = 0; i < equivalentes.length; i++) {
    if (document.getElementById(equivalentes[i]).array) {
      var array = new Array();
      array = document.getElementById(equivalentes[i]).array;
      for (var j = 0; j < array.length; j++) {
        string += "&" + equivalentes[i] + "ar[" + j + "]=" + array[j];
      }
    }
  }
  var arquivo = vlt("obra");

  url = location.href.replace(/[^/]*$/, "");
  while (url.charAt(url.length - 1) == "/") {
    url = url.slice(0, -1);
  }
  url += "/salvar.php";

  window.open(url + "?arquivo=" + arquivo + "&str=" + escape(string));
}
