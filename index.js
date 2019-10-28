const request = require('request')
const cheerio = require('cheerio')
const officegen = require('officegen')
const fs = require('fs')

let count = 1

const url = 'https://quranenc.com/en/browse/hindi_omari/'

let $
let data = []
let hObj
const headingOptions = {
  border: 'single',
  borderSize: 24,
  borderColor: '88CCFF',
  font_face: 'Devanagari MT',
  font_size: 15,
  bold: false,
}
const paragraphOptions = {
  align: 'left',
  font_face: 'Devanagari MT',
  font_size: 14,
}

fetchUrl()

function fetchUrl() {
  if (count > 1) {
    saveDataToWord()
  } else {
    request(`${url}${count}`, function(error, response, body) {
      if (response && response.statusCode == 200) {
        scrapData(body)
      }
    })
  }
}

function scrapData(body) {
  $ = cheerio.load(body)
  getSurahNamePara()
  getTheDataFromQuranEnc()
  count++
  fetchUrl()
}

function saveDataToWord() {
  const docx = officegen('docx')
  docx.on('error', function(err) {
    console.log(err)
  })

  data.map(({ text, options }) => {
    hObj = docx.createP()
    console.log('text', text, 'options', options)
    hObj.addText(text, options)
  })

  let out = fs.createWriteStream('QuranHindiScraping.docx')

  out.on('error', function(err) {
    console.log(err)
  })

  docx.on('finalize', function(written) {
    console.log('Finish to create a Microsoft Word document.')
  })

  // Async call to generate the output file:
  docx.generate(out)
  console.log('Scraping done...')
}

function getSurahNamePara() {
  data.push({
    text: $('.toggle-content h4').text(),
    options: headingOptions,
  })
}

function getTheDataFromQuranEnc() {
  $('.panel-aya').each(function(index, elm) {
    //Get the ayah & no
    data.push({
      text: $(elm)
        .find('.panel-title a')
        .text()
        .trim(),
      options: paragraphOptions,
    })

    //Get the arabic ayah text
    data.push({
      text: $(elm)
        .find('.aya_text')
        .text()
        .trim(),
      options: paragraphOptions,
    })

    //Get the Hindi translation
    data.push({
      text: $(elm)
        .find('.panel-body .trans_text .ttc')
        .text()
        .trim(),
      options: paragraphOptions,
    })

    //Get the Hindi Tafseer
    data.push({
      text: $(elm)
        .find('.panel-body .hamesh')
        .text()
        .trim(),
      options: paragraphOptions,
    })
  })
}
