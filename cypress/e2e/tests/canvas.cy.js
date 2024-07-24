

describe('Canvas demos', () => {
  it('Find the apple using OpenCV', function()  {
    cy.visit('/')
    cy.screenshot('before',{ overwrite: true }) //Full screen
    
    cy.get('#canvas').screenshot('canvasimage') //Write canvas image to disc

    // The location where screenshots are written to seems to be unstable by default.
    // This is a problem because in a moment I want to pass the path to the just captured screenshot to cy.task...


    //On initial run the files are written to cypress/e2e/screenshots/
    //But then if you switch browser the files are written to cypress/e2e/screenshots/cypress/e2e/tests/cavas.cy.js/
    //Headless runs save to cypress/e2e/screenshots/cavas.cy.js/

    // Documentation: https://docs.cypress.io/api/commands/screenshot#Naming-conventions
    // Maybe related to these issues:
    // https://github.com/cypress-io/cypress/issues/24052
    // https://github.com/cypress-io/cypress/issues/25258

    //To work around this and make this demo function reliably I have decided to make the screenshot folder deterministic as per https://docs.cypress.io/api/plugins/after-screenshot-api#Modify-screenshot-path
    //After a screenshot is captured it's path is determined and then the screenshot is moved back to /cypress/screenshots/
    //You may still see the left over folders in /cypress/screenshots/

    //One side effect of this is that you cannot now call cy.screenshot() without giving the screenshot a name. OK for this demo, but something you should be aware of if adapting this for your own tests.
    
    //task defined in cypress.config.js
    cy.task('cvFindTemplateLocationInImage',
      {
        templatePath: 'image.jpg', //file in Project root
        screenshotPath: 'cypress/screenshots/canvasimage.png' //Relative to project root - works initially but if you switch browser the screenshot is saved to a deeper folder
        
      })
      .then(appleLocation => {
        console.log(appleLocation)
        cy.get('canvas').click(appleLocation.maxLoc.x + appleLocation.templateSize.width / 2, appleLocation.maxLoc.y + appleLocation.templateSize.height / 2)
      })
    cy.screenshot('after',{ overwrite: true }) //Should show the apple has been clicked
  });
})