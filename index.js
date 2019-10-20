const request = require('request');
const cheerio = require('cheerio');
const officegen = require('officegen')
const fs = require('fs')

var url = 'https://quranenc.com/en/browse/hindi_omari/1';

request(url, function (error, response, body) {
  var transHindi;
  var tafseerHindi;
  var ayahArabic;
  var surahName;
  
  // Create an empty Word object:
  let docx = officegen('docx')
  //console.log('error:', error); // Print the error if one occurred
  //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

  console.log("response.headers", response.headers)

  if (response && response.statusCode == 200) {
    //console.log('body:', responseBody); // Print the HTML for the Google homepage.
    var $ = cheerio.load(body)
    surahName = $('.toggle-content h4').text()

    let hObj = docx.createP()
    hObj.options.align = 'center'
    hObj.addText(surahName, {border: 'dotted',
    borderSize: 12,
    borderColor: '88CCFF'})
    
    $('.panel-aya').each(function( index, elm ){
        ayahArabic = $(elm).find('.aya_text').text().trim()
        transHindi = $(elm).find('.panel-body .trans_text .ttc').text().trim()
        //transHindi = $.trim(transHindi)
        tafseerHindi = $(elm).find('.panel-body .hamesh').text().trim()
        //tafseerHindi = $.trim(tafseerHindi)
        console.log(ayahArabic, transHindi, tafseerHindi)


        // Officegen calling this function to report errors:
        docx.on('error', function(err) {
          console.log(err)
        })

        // Create a new paragraph in Arabic:
        let arabicObj = docx.createP()
        arabicObj.options.align = 'center'
        arabicObj.addText(ayahArabic)
        
        // Create a new paragraph:
        let pObj = docx.createP()
        pObj.options.align = 'left'
        pObj.addText(transHindi)

        let pObj1 = docx.createP()
        pObj1.options.align = 'left'
        pObj1.addText(tafseerHindi, { color: '000088' })
    })

    console.log(transHindi, tafseerHindi)

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