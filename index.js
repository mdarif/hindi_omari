const request = require('request')
const cheerio = require('cheerio')
const officegen = require('officegen')
const fs = require('fs')

let count = 1

const url = 'https://quranenc.com/en/browse/hindi_omari/'

let $,
  data = [],
  hObj,
  isArabicAyah = false,
  isHamesh = false,
  IsAyaNo = false,
  transHindi

const headingOptions = {
  align: 'left',
  font_face: 'Mangal',
  font_size: 20,
}
const paragraphOptionsAyaNo = {
  align: 'right',
  font_face: 'Arial',
  font_size: 14,
}
const paragraphOptions = {
  align: 'right',
  font_face: 'Walkman-Chanakya-901 Normal',
  font_size: 14,
}
const paragraphHameshOptions = {
  align: 'right',
  color: '000088',
  font_face: 'Walkman-Chanakya-901 Normal',
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

  data.map(({ text, options }, index) => {
    hObj = docx.createP()
    //console.log('text', text, 'options', options, 'index', index)
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
    if (IsAyaNo) {
      data.push({
        text: $(elm)
          .find('.panel-title a')
          .text()
          .trim(),
        options: paragraphOptionsAyaNo,
      })
    }

    if (isArabicAyah) {
      //Get the arabic ayah text
      data.push({
        text: $(elm)
          .find('.aya_text')
          .text()
          .trim(),
        options: paragraphOptions,
      })
    }

    //Get the Hindi translation
    let transHindi = $(elm)
      .find('.panel-body .trans_text .ttc')
      .text()
      .trim()
    transHindi = index + 1 + ') ' + transHindi.replace(/ *\[[^\]]*]/g, '')
    data.push({
      text: transHindi,
      options: paragraphOptions,
    })

    //Get the Hindi Hamesh
    if (isHamesh) {
      data.push({
        text: $(elm)
          .find('.panel-body .hamesh')
          .text()
          .trim(),
        options: paragraphHameshOptions,
      })
    }
  })
}
