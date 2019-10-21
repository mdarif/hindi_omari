const request = require('request');
const cheerio = require('cheerio');
const officegen = require('officegen')
const fs = require('fs')

const url = 'https://quranenc.com/en/browse/hindi_omari/1';

request(url, function (error, response, body) {
  let ayahNo;
  let transHindi;
  let tafseerHindi;
  let ayahArabic;
  let surahName;

  function msOfficeSetup() {
    // Officegen calling this function to report errors:
    docx.on('error', function(err) {
      console.log(err)
    })

    // Create a new paragraph for ayah no
    let ayahObj = docx.createP()
    ayahObj.options.align = 'left'
    ayahObj.addText(ayahNo, {
      font_size: 14
    })

    // Create a new paragraph for Arabic
    let arabicObj = docx.createP()
    arabicObj.options.align = 'center'
    arabicObj.addText(ayahArabic, {
      font_size: 14
    })

    // Create a hindi translation paragraph
    let transTextObj = docx.createP()
    transTextObj.options.align = 'left'
    transTextObj.addText(transHindi, {
      font_face: 'Devanagari MT', font_size: 14
    })

    // Create a hindi tafseer paragraph
    let pObj1 = docx.createP()
    pObj1.options.align = 'left'
    pObj1.addText(tafseerHindi, {
      color: '000088', font_face: 'Devanagari MT', font_size: 14
    })
  }

  function getTheDataFromQuranEnc () {
    $('.panel-aya').each(function( index, elm ){
      ayahNo = $(elm).find('.panel-title a').text().trim()
      ayahArabic = $(elm).find('.aya_text').text().trim()
      transHindi = $(elm).find('.panel-body .trans_text .ttc').text().trim()
      tafseerHindi = $(elm).find('.panel-body .hamesh').text().trim()
      console.log(ayahArabic, transHindi, tafseerHindi)

      msOfficeSetup()
    })
  }

  function surahNamePara() {
    surahName = $('.toggle-content h4').text()

    let hObj = docx.createP()
    hObj.options.align = 'center'
    hObj.addText(surahName, 
      {
        border: 'dotted',
        borderSize: 12,
        borderColor: '88CCFF',
        font_face: 'Devanagari MT', 
        font_size: 20,
        bold: true
      })
  }
  
  // Create an empty Word object:
  let docx = officegen('docx')
  //console.log('error:', error); // Print the error if one occurred
  //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

  if (response && response.statusCode == 200) {
    //console.log('body:', responseBody); // Print the HTML for the Google homepage.
    var $ = cheerio.load(body)

    //Surah Name
    surahNamePara()
    
    //Get the data scriping from Quranenc
    getTheDataFromQuranEnc()

    //console.log(transHindi, tafseerHindi)

    // Let's generate the Word document into a file:
    let out = fs.createWriteStream('QuranHindiScraping.docx')

    out.on('error', function(err) {
      console.log(err)
    })

    // Officegen calling this function after finishing to generate the docx document:
    docx.on('finalize', function(written) {
      console.log(
        'Finish to create a Microsoft Word document.'
      )
    })

    // Async call to generate the output file:
    docx.generate(out)
    console.log("Scraping done...")
  }
});