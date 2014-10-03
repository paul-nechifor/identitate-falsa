moment = require 'moment'

main = ->
  $.getJSON window.staticPath + '/data.json', (data) ->
    generator = new Generator data
    page = new Page generator
    page.setup()

Generator = (data) ->
  @familie = new ChoicePool data.familie
  @masculine = new ChoicePool data.masculine
  @feminine = new ChoicePool data.feminine
  @localitati = new ChoicePool data.localitati
  @strazi = new ChoicePool data.strazi
  @prefixe = data.prefixe
  @nrAvatare = 1361

Persoana = (generator) ->
  @generator = generator
  @prenume = null
  @nume = null
  @sexMasculin = true
  @dataNasterii = null
  @telefon = null
  @localitate = null
  @judetSector = null
  @codPostal = null
  @adresaMica = null
  @avatar = null

Persoana::reseteaza = ->
  @sexNou()
  @prenumeNou()
  @numeNou()
  @dataNasteriiNoua()
  @telefonNou()
  @localitateSiJudetNou()
  @adresaNoua()
  @avatarNou()

Persoana::sexNou = (propaga) ->
  @sexMasculin = Math.random() > 0.5

Persoana::sexOpus = (propaga) ->
  @sexMasculin = not @sexMasculin

Persoana::prenumeNou = (propaga) ->
  if @sexMasculin
    @prenume = @generator.masculine.pick()
  else
    @prenume = @generator.feminine.pick()
  if Math.random() < 0.2
    if @sexMasculin
      @prenume += " " + @generator.masculine.pick()
    else
      @prenume += " " + @generator.feminine.pick()
  return

Persoana::numeNou = (propaga) ->
  @nume = @generator.familie.pick()

Persoana::dataNasteriiNoua = (propaga) ->
  varsta = 18.3 + Math.random() * 22
  varstaMilli = varsta * 365 * 24 * 60 * 60 * 1000
  @dataNasterii = new Date Date.now() - varstaMilli

Persoana::telefonNou = ->
  @telefon = "07"
  @telefon += randInt(2, 6)
  @telefon += 1000000 + ((Math.random() * 9000000) | 0)

Persoana::localitateSiJudetNou = (propaga) ->
  p = @generator.localitati.pick().split("|")
  @localitate = p[0]
  if p[1].length > 0
    @judetSector = p[1]
  else
    @judetSector = "Sector " + ((1 + Math.random() * 6) | 0)
  prefix = @generator.prefixe[@judetSector]
  rest = String(randInt(10000, 19999)).substring(1)
  @codPostal = prefix + rest

Persoana::adresaNoua = ->
  str = "Str. " + @generator.strazi.pick()
  nr = randInt 1, 19
  bl = randInt(4, 15) + String.fromCharCode 65 + randInt(0, 20)
  sc = String.fromCharCode 65 + randInt(0, 1)
  et = randInt 1, 6
  ap = et * 3 + randInt 0, 3
  @adresaMica = "#{str} nr. #{nr}, bl. #{bl}, sc. #{sc}, et. #{et}, ap. #{ap}"

Persoana::avatarNou = ->
  @avatar = (Math.random() * @generator.nrAvatare) | 0

Persoana::getSex = ->
  if @sexMasculin then "masculin" else "feminin"

Persoana::getDataNasterii = ->
  moment(@dataNasterii).format "DD.MM.YYYY"

Persoana::getVarsta = ->
  moment().diff moment(@dataNasterii), "years"

Persoana::getAdresa = ->
  "#{@adresaMica}, cod poștal #{@codPostal}, #{@localitate}, #{@judetSector}"

Persoana::getAvatar = ->
  window.staticPath + "/avatare/" + @avatar + ".jpg"

Page = (generator) ->
  @persoana = new Persoana generator
  @ids = [
    "prenume"
    "nume"
    "sex"
    "dataNasterii"
    "varsta"
    "telefon"
    "localitate"
    "judetSector"
    "adresa"
    "avatar"
  ]
  @elems = {}
  that = this
  i = 0
  len = @ids.length

  while i < len
    elem = $("#" + @ids[i])
    @elems[@ids[i]] = elem
    elem.next().click ((id, elem) ->
      ->
        that.onClick id, elem
        return
    )(@ids[i], elem)
    i++
  $("button.reset").click @changeAll.bind @
  return

Page::setup = ->
  @changeAll()

Page::onClick = (id, elem) ->
  p = @persoana
  switch id
    when "prenume"
      p.prenumeNou()
    when "nume"
      p.numeNou()
    when "sex"
      p.sexOpus()
      p.prenumeNou()
    when "dataNasterii", "varsta"
      p.dataNasteriiNoua()
    when "telefon"
      p.telefonNou()
    when "localitate", "judetSector"
      p.localitateSiJudetNou()
    when "adresa"
      p.adresaNoua()
    when "avatar"
      p.avatarNou()
  @setPersoana()

Page::changeAll = ->
  @persoana.reseteaza()
  @setPersoana()

Page::setPersoana = ->
  e = @elems
  p = @persoana
  e.prenume.attr "value", p.prenume
  e.nume.attr "value", p.nume
  e.sex.attr "value", p.getSex()
  e.dataNasterii.attr "value", p.getDataNasterii()
  e.varsta.attr "value", p.getVarsta()
  e.telefon.attr "value", p.telefon
  e.localitate.attr "value", p.localitate
  e.judetSector.attr "value", p.judetSector
  e.adresa.text p.getAdresa()
  e.avatar.attr "src", p.getAvatar()

ChoicePool = (map) ->
  @weights = []
  @choices = []
  @sum = 0
  @fillWithMap map

ChoicePool::addChoice = (weight, choice) ->
  @weights.push weight
  @choices.push choice
  @sum += weight

ChoicePool::fillWithMap = (map) ->
  array = []
  for key of map
    array.push [
      map[key]
      key
    ]
  array.sort (a, b) ->
    b[0] - a[0]

  i = 0
  len = array.length

  while i < len
    @addChoice array[i][0], array[i][1]
    i++
  return

ChoicePool::pick = ->
  r = Math.floor(Math.random() * @sum) + 1
  runningSum = 0
  i = 0
  len = @weights.length

  while i < len
    runningSum += @weights[i]
    return @choices[i] if runningSum >= r
    i++
  null # Impossible.

randInt = (a, b) ->
  a + ((1 + b - a) * Math.random()) | 0

$(document).ready main
