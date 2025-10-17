const axios = require('axios');
const cheerio = require('cheerio');

async function analyzePortfolio(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('title').text();
    const links = [];
    $('a').each((i, link) => {
      links.push({
        text: $(link).text(),
        href: $(link).attr('href'),
      });
    });

    const images = [];
    $('img').each((i, image) => {
      images.push({
        src: $(image).attr('src'),
        alt: $(image).attr('alt'),
      });
    });

    return { title, links, images };
  } catch (error) {
    console.error(`Error fetching URL: ${url}`, error);
    return { error: 'Could not fetch the portfolio URL. Please make sure it is a valid and accessible URL.' };
  }
}

module.exports = { analyzePortfolio };