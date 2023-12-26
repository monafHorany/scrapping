const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.kompedan.com.tr/kadin-ic-giyim-ev-giyim";
const baseURL = "https://www.kompedan.com.tr";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Kompedan";
    const brand = "Kompedan";

    const group_url = link;
    const name = $("#content > div > div > h1").text();
    const orjprice =
      $("div.mobileBasketButton.row > div.col-xs-4 > div > span > span.oldprice").first().text()
    const price = $("div.mobileBasketButton.row > div.col-xs-4 > div > span > span.price").first().text()
    const description = $("#tab-description > div > span").text().trim();
    const propiteam = "item";
    var images = [];
    $(
      "div.image-additional > ul > li"
    ).map((i, e) => {
      images.push($(e).find("a").attr("href"))
    })


    var imageUrl = $("#zoom1").attr('href')

    const colors = [];
    const sizes = [];
    $("div.holder > ul > li.optli:not(.disabled)").map((i, e) => {
      sizes.push($(e).text().trim())
    });
    if (sizes.filter((n) => n).length === 0) {
      return productsDetails
    }
    productsDetails.push({
      name,
      brand,
      orjprice: orjprice.replace("₺", "TL"),
      price: price.replace("₺", "TL"),
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
    const response = await axios.get(link);

    const outerhtml = response.data;

    const dataTable = cheerio(
      "div.product-grid div.item.product-item",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl = cheerio(this).find("div.details_wrap div.information_wrapper div.name a").attr("href");
      urls.push(productUrl);
    });
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }

}
module.exports = {
  getProductsData,
};
