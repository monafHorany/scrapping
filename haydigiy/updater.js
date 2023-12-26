const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.haydigiy.com/alt-giyim";
const baseURL = "https://www.haydigiy.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Haydigiy";
    const group_url = link;
    const name = $("#product-details-form > div.product-details-container > div.overview > div.overview-head > div.product-name > h1").text();
    const orjprice = $("#product-details-form > div.product-details-container > div.overview > div.overview-head > div.prices > div.product-price > div.product-old-price > span").text()

    const price = $("#product-details-form > div.product-details-container > div.overview > div.overview-head > div.prices > div.product-price > div.product-price > span").text()

    const description = $("#product-details-form > div.product-details-container > div.overview > div.accordion-container > div > section > div > div > table").text();
    const propiteam = "item";
    var images = [];
    $(
      "div.swiper-master.gallery-top div.swiper-wrapper div.swiper-slide"
    )
      .find("a")
      .map((index, element) => {
        images.push($(element).attr("href"));
      });
    var imageUrl = images[0];

    const colors = [];
    const sizes = [];
    $("ul.radio-list li").map((index, element) => {
      $(element)
        .find("input")
        .not(function (i, el) {
          // this === el
          return $(this).data("qty") === "0,0000";
        })
        .each((i, e) => {
          sizes.push($(e).next().text());
        });
    });
    if (sizes.filter((n) => n).length === 0) {
      return productsDetails
    }
    productsDetails.push({
      name,
      orjprice,
      price,
      description,
      imageUrl,
      prodURL,
      sizes,
      propiteam,
      colors,
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
