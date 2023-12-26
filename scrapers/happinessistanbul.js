const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://happinessistanbul.com/tum-urunler";
const baseURL = "https://happinessistanbul.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Happinessistanbul";
    const brand = "Happinessistanbul";

    const group_url = link;
    const name = $("#productDetailFormContainer > form > div:nth-child(3) > h1").text();
    const orjprice =
      $("#product_price > span").first().text()
    const price = orjprice
    const description = $("#page > section > div.container-fluid.product-detail-fluid.page-column > div.row.ajpr-form.ajpr-detail.product-detail-view > div.hidden-sm.hidden-xs.col-md-3.s-scroll.s-scroll-2 > div > div > ul").text();
    const propiteam = "item";
    var images = [];
    $(
      "div#productTmage > div.swiper-wrapper"
    )
      .find("div.swiper-slide img")
      .map((index, element) => {
        images.push(baseURL + $(element).attr("src").replace("/t/", "/l/"));
      });
    var imageUrl = images[0];

    const colors = [];
    const sizes = [];
    $("#productDetailFormContainer > form > div:nth-child(4) > div.clearfix.open.attribute.firstatt > div.dropdown-menu.dropdown-menu-attr div.attribute-option").map((i, e) => {

      if ($(e).prop("ng-class") === "{true:'',false:'stoktayok'}['1'=='1']") {
        sizes.push($(e).text())
      }
    });
    if (sizes.filter((n) => n).length === 0) {
      return productsDetails
    }
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
      "div.product_list div.product-grid-item",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl = baseURL + cheerio(this).find("div.product-wrapper div.product-meta div.product-content a").attr("href");
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
