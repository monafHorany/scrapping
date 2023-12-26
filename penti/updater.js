const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.penti.com/tr/c/kadin";
const baseURL = "https://www.penti.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Penti";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    const brand = "Penti";
    const name = cheerio(
      "#site-main > div > div.pdp > div.pdp-body > div.pdp-block1.se-item > div.pdp-heading > h1",
      html
    )
      .first()
      .text()
      .trim();
    let orjprice =
      cheerio("#site-main > div > div.pdp > div.pdp-body > div.pdp-block1.se-item > div.pdp-prices > span.prc.prc-first", html)
        .first()
        .text()
        .trim()
    let price =
      cheerio("#site-main > div > div.pdp > div.pdp-body > div.pdp-block1.se-item > div.pdp-prices > span.prc.prc-last.discount", html)
        .first()
        .text()
        .trim()
    if (orjprice === "") {
      orjprice = cheerio("#site-main > div > div.pdp > div.pdp-body > div.pdp-block1.se-item > div.pdp-prices > span", html)
        .first()
        .text()
        .trim()
    }
    if (price === '') {
      price = orjprice
    }
    const colors = [];
    const sizes = []
    $("#site-main > div > div.pdp > div.pdp-body > div.pdp-block1.se-item > div.yCmsComponent.pdp-options > div > div.dropdown.size-dropdown > div > a.dropdown-item").map((index, v) => {
      if ($(v).data('stock') !== 0) {
        sizes.push($(v).text().trim())
      }
    });
    const description = cheerio("#site-main > div > div.pdp > div.pdp-body > div.pdp-block2 > div.pdp-description > div > div.pht-content.pdp-detail-desc", html)
      .text()
      .trim();
    $("#pdp-gallery-swiper > div.swiper-wrapper > div.swiper-slide").map((index, element) => {
      if ($(element).find("figure.responsive img").attr("src")) {
        images.push(
          $(element).find("figure.responsive img").attr("src")
        );
      } else {
        images.push(
          $(element).find("figure.responsive img").data("srcset")
        );
      }
    });
    if (sizes.filter((n) => n).length < 1) {
      return productsDetails
    }
    imageUrl = images[0];
    productsDetails.push({
      name,
      brand,
      orjprice: orjprice.replace("₺", "") + " TL",
      price: price.replace("₺", "") + " TL",
      description,
      imageUrl,
      prodURL,
      sizes: sizes.filter((n) => n),
      colors: colors.filter((n) => n),
      propiteam,
      group_url,
      product_source,
      images,
    });

    return productsDetails;
  } catch (error) {
    console.log(error);
    productsDetails = [];
    return productsDetails;
  }
}


async function getProductsData(link, urls = []) {
  try {
    console.log("Requesting : " + link);
    const productUrl = link;
    urls.push(productUrl);

    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
