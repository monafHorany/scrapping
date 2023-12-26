const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.trendyol.com/erkek+ceket";
const baseURL = "https://www.abiyefon.com";
if (typeof (cheerio) != 'function') cheerio = require("cheerio").default;
async function getProduct(prodURL, link, productImage, productsizes) {
  try {
    const response = await axios.get(prodURL);
    const productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const PQ = cheerio.load(productsizes);
    const product_source = "Abiyefon";
    const group_url = link;
    const brand = "Abiyefon";
    const name = cheerio(".productdetails h1", html).text();
    const strorjprice = cheerio(".saleprice .TL-icon", html).first().text();
    const strprice = cheerio(".saleprice .TL-icon", html).first().text();
    const price = strprice.split(',').join("");
    const orjprice = strorjprice.split(',').join("");
    const description = "Dekolte:" + cheerio("#tab1 > div > div", html).text().split("Dekolte: ")[1].split("* Kalite Garantisi:")[0];
    const propiteam = "item";
    const imageUrl = productImage;
    const colors = cheerio(".tabscontainer #tab1 .product-content div em", html).first().text();
    const final_sizes = [];
    const size = PQ(".product-sizes").html();

    $(size).each(function (i, elm) {
      if ($(elm).attr('class') != 'out_of_stock') {
        final_sizes.push($(elm).contents().text());
      }
    });
    const sizes = final_sizes.filter(function (el) {
      return el != "";
    });
    productsDetails.push({
      name,
      brand,
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
    });

    return productsDetails;
  } catch (error) {
    console.log(error);
    productsDetails = [];
    return productsDetails;
  }
}
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
async function getProductsData(link, urls = []) {
  try {
    const response = await axios.get(link);
    const productImages = [];
    const productsizes = [];
    const outerhtml = response.data;
    const dataTable = cheerio("li", outerhtml.productsHtml);

    dataTable.each(function () {
      const productUrl = baseURL + cheerio(this).find("a").attr("href");
      productImages.push(baseURL + cheerio(this).find("a img").attr("src"));
      productsizes.push(cheerio(this).find("a.product-link").html());
      urls.push(productUrl);
    });

    return Promise.all(urls.map((url, index) => getProduct(url, link, productImages[index], productsizes[index])));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};