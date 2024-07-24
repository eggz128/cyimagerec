const { defineConfig } = require("cypress");
const jimp = require('jimp')
const cv = require('@techstark/opencv-js')
const fs = require('fs')
module.exports = defineConfig({
  e2e: {

    trashAssetsBeforeRuns: true, //Delete screenshots from previous runs when using npx cypress run
    setupNodeEvents(on, config) {
      // implement node event listeners here

      on('task', {
        
        /**
         * A function to find the location of a template image in another image.
         *
         * @param {string} templatePath - the path to the template image
         * @param {string} screenshotPath - the path to the screenshot image
         * @return {Object} an object containing the location of the template in the screenshot and template size
         */
        async cvFindTemplateLocationInImage({ templatePath, screenshotPath }) {
          //Target template to search for in canvas
          let templateImage = await jimp.read(templatePath)
          let templateCV = cv.matFromImageData(templateImage.bitmap)
          let templateSize = {
            width: templateImage.bitmap.width,
            height: templateImage.bitmap.height
          }
          //Load Cypress captured screenshot from disc
          let screenshotCanvas = await jimp.read(screenshotPath)
          let screenshotCV = cv.matFromImageData(screenshotCanvas.bitmap)

          // Perform template matching
          let result = new cv.Mat();
          cv.matchTemplate(screenshotCV, templateCV, result, cv.TM_CCOEFF_NORMED);
          cv.normalize(result, result, 0, 1, cv.NORM_MINMAX, -1);

          //Find the maximum value and its location
          let minMax = cv.minMaxLoc(result, new cv.Mat()); //Second param not needed to run, but IDE will complain of an error without it.
          let { maxLoc } = minMax

          console.log(`Apple found at location: (${maxLoc.x}, ${maxLoc.y})`); //Top left co-ords
          return { maxLoc, templateSize }
        }
      }),
      //Make screenshot location deterministic
      //Move the captured screenshot back in to the /cypress/screenshots/ folder if it was initially captured in a deeper folder
      //Documentation: https://docs.cypress.io/api/plugins/after-screenshot-api#Modify-screenshot-path
      //As is this unfortunately breaks if a filename is not specified for the screenshot
      on('after:screenshot', (details) => {
        console.log(details) // print all details to terminal

        const newPath = process.cwd() + '/cypress/screenshots/' + details.name + '.png'

        return new Promise((resolve, reject) => {
          // fs.rename moves the file to the existing directory 'new/path/to'
          // and renames the image to 'screenshot.png'
          fs.rename(details.path, newPath, (err) => {
            if (err) return reject(err)

            // because we renamed and moved the image, resolve with the new path
            // so it is accurate in the test results
            resolve({ path: newPath })
          })
        })
      });
    },
  },
});
