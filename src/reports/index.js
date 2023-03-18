const fs = require('fs')
const path = require('path')
const utils = require('util')
const puppeteer = require('puppeteer')
const hb = require('handlebars')
const readFile = utils.promisify(fs.readFile)
const moment = require('moment')


const RMMReport = async (data, pathFile) => {
    const fileName = moment().format('DD-MM-YYYY-HH-mm-ss')
    
    try {
        const templatePath = path.join(__dirname, './templates/rmm-report/index.html');
        var fileRead = await readFile(templatePath, 'utf8');
    } catch (err) {
        throw new Error("Não foi possível carregar o modelo do relatório.");
    }

    const template = hb.compile(fileRead, { strict: true });
    const result = template(data);
    const html = result;
    const browser = await puppeteer.launch();
    const page = await browser.newPage()
    await page.goto(path.join(__dirname, './templates/rmm-report/index.html'), { waitUntil: 'networkidle0' });
    await page.setContent(html)
    await page.pdf({ path: `${pathFile}/${fileName}.pdf`, format: 'A4', printBackground: true })
    await browser.close();
}

module.exports = RMMReport