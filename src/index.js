import moment from 'moment';

let main = () =>
  $.getJSON('data.json', function(data) {
    let generator = new Generator(data);
    let page = new Page(generator);
    page.setup();
  })
;

var Generator = function(data) {
  this.familie = new ChoicePool(data.familie);
  this.masculine = new ChoicePool(data.masculine);
  this.feminine = new ChoicePool(data.feminine);
  this.localitati = new ChoicePool(data.localitati);
  this.strazi = new ChoicePool(data.strazi);
  this.prefixe = data.prefixe;
  return this.nrAvatare = 1361;
};

let Persoana = function(generator) {
  this.generator = generator;
  this.prenume = null;
  this.nume = null;
  this.sexMasculin = true;
  this.dataNasterii = null;
  this.telefon = null;
  this.localitate = null;
  this.judetSector = null;
  this.codPostal = null;
  this.adresaMica = null;
  return this.avatar = null;
};

Persoana.prototype.reseteaza = function() {
  this.sexNou();
  this.prenumeNou();
  this.numeNou();
  this.dataNasteriiNoua();
  this.telefonNou();
  this.localitateSiJudetNou();
  this.adresaNoua();
  return this.avatarNou();
};

Persoana.prototype.sexNou = function(propaga) {
  return this.sexMasculin = Math.random() > 0.5;
};

Persoana.prototype.sexOpus = function(propaga) {
  return this.sexMasculin = !this.sexMasculin;
};

Persoana.prototype.prenumeNou = function(propaga) {
  if (this.sexMasculin) {
    this.prenume = this.generator.masculine.pick();
  } else {
    this.prenume = this.generator.feminine.pick();
  }
  if (Math.random() < 0.2) {
    if (this.sexMasculin) {
      this.prenume += ` ${this.generator.masculine.pick()}`;
    } else {
      this.prenume += ` ${this.generator.feminine.pick()}`;
    }
  }
};

Persoana.prototype.numeNou = function(propaga) {
  return this.nume = this.generator.familie.pick();
};

Persoana.prototype.dataNasteriiNoua = function(propaga) {
  let varsta = 18.3 + (Math.random() * 22);
  let varstaMilli = varsta * 365 * 24 * 60 * 60 * 1000;
  return this.dataNasterii = new Date(Date.now() - varstaMilli);
};

Persoana.prototype.telefonNou = function() {
  this.telefon = "07";
  this.telefon += randInt(2, 6);
  return this.telefon += 1000000 + ((Math.random() * 9000000) | 0);
};

Persoana.prototype.localitateSiJudetNou = function(propaga) {
  let p = this.generator.localitati.pick().split("|");
  this.localitate = p[0];
  if (p[1].length > 0) {
    this.judetSector = p[1];
  } else {
    this.judetSector = `Sector ${(1 + (Math.random() * 6)) | 0}`;
  }
  let prefix = this.generator.prefixe[this.judetSector];
  let rest = String(randInt(10000, 19999)).substring(1);
  return this.codPostal = prefix + rest;
};

Persoana.prototype.adresaNoua = function() {
  let str = `Str. ${this.generator.strazi.pick()}`;
  let nr = randInt(1, 19);
  let bl = randInt(4, 15) + String.fromCharCode(65 + randInt(0, 20));
  let sc = String.fromCharCode(65 + randInt(0, 1));
  let et = randInt(1, 6);
  let ap = (et * 3) + randInt(0, 3);
  return this.adresaMica = `${str} nr. ${nr}, bl. ${bl}, sc. ${sc}, et. ${et}, ap. ${ap}`;
};

Persoana.prototype.avatarNou = function() {
  return this.avatar = (Math.random() * this.generator.nrAvatare) | 0;
};

Persoana.prototype.getSex = function() {
  if (this.sexMasculin) { return "masculin"; } else { return "feminin"; }
};

Persoana.prototype.getDataNasterii = function() {
  return moment(this.dataNasterii).format("DD.MM.YYYY");
};

Persoana.prototype.getVarsta = function() {
  return moment().diff(moment(this.dataNasterii), "years");
};

Persoana.prototype.getAdresa = function() {
  return `${this.adresaMica}, cod poștal ${this.codPostal}, ${this.localitate}, ${this.judetSector}`;
};

Persoana.prototype.getAvatar = function() {
  return "avatare/" + this.avatar + ".jpg";
};

var Page = function(generator) {
  this.persoana = new Persoana(generator);
  this.ids = [
    "prenume",
    "nume",
    "sex",
    "dataNasterii",
    "varsta",
    "telefon",
    "localitate",
    "judetSector",
    "adresa",
    "avatar"
  ];
  this.elems = {};
  let that = this;
  let i = 0;
  let len = this.ids.length;

  while (i < len) {
    let elem = $(`#${this.ids[i]}`);
    this.elems[this.ids[i]] = elem;
    elem.next().click(((id, elem) =>
      function() {
        that.onClick(id, elem);
      }
    )(this.ids[i], elem)
    );
    i++;
  }
  $("button.reset").click(this.changeAll.bind(this));
};

Page.prototype.setup = function() {
  return this.changeAll();
};

Page.prototype.onClick = function(id, elem) {
  let p = this.persoana;
  switch (id) {
    case "prenume":
      p.prenumeNou();
      break;
    case "nume":
      p.numeNou();
      break;
    case "sex":
      p.sexOpus();
      p.prenumeNou();
      break;
    case "dataNasterii": case "varsta":
      p.dataNasteriiNoua();
      break;
    case "telefon":
      p.telefonNou();
      break;
    case "localitate": case "judetSector":
      p.localitateSiJudetNou();
      break;
    case "adresa":
      p.adresaNoua();
      break;
    case "avatar":
      p.avatarNou();
      break;
  }
  return this.setPersoana();
};

Page.prototype.changeAll = function() {
  this.persoana.reseteaza();
  return this.setPersoana();
};

Page.prototype.setPersoana = function() {
  let e = this.elems;
  let p = this.persoana;
  e.prenume.attr("value", p.prenume);
  e.nume.attr("value", p.nume);
  e.sex.attr("value", p.getSex());
  e.dataNasterii.attr("value", p.getDataNasterii());
  e.varsta.attr("value", p.getVarsta());
  e.telefon.attr("value", p.telefon);
  e.localitate.attr("value", p.localitate);
  e.judetSector.attr("value", p.judetSector);
  e.adresa.text(p.getAdresa());
  return e.avatar.attr("src", p.getAvatar());
};

var ChoicePool = function(map) {
  this.weights = [];
  this.choices = [];
  this.sum = 0;
  return this.fillWithMap(map);
};

ChoicePool.prototype.addChoice = function(weight, choice) {
  this.weights.push(weight);
  this.choices.push(choice);
  return this.sum += weight;
};

ChoicePool.prototype.fillWithMap = function(map) {
  let array = [];
  for (let key in map) {
    array.push([
      map[key],
      key
    ]);
  }
  array.sort((a, b) => b[0] - a[0]);

  let i = 0;
  let len = array.length;

  while (i < len) {
    this.addChoice(array[i][0], array[i][1]);
    i++;
  }
};

ChoicePool.prototype.pick = function() {
  let r = Math.floor(Math.random() * this.sum) + 1;
  let runningSum = 0;
  let i = 0;
  let len = this.weights.length;

  while (i < len) {
    runningSum += this.weights[i];
    if (runningSum >= r) { return this.choices[i]; }
    i++;
  }
  return null; // Impossible.
};

var randInt = (a, b) => (a + (((1 + b) - a) * Math.random())) | 0;

$(document).ready(main);
