const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.flo.com.tr/giyim?cinsiyet=erkek";
const baseURL = "https://www.flo.com.tr";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Flo";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    const brand = "Flo";
    let script = JSON.parse($('script:contains("window.productDetail")').html().split("window.productDetail = ")[1].split("[]}};")[0] + "[]}}");
    const name = cheerio(
      "div.row > div.col-12.col-lg-4 > div.product.d-flex.flex-column.align-items-start > h1",
      html
    )
      .first()
      .text()
      .trim();
    let orjprice = script.price
    let price = script.filter_price || script.special_price
    if (price == "") {
      price = orjprice;
    }

    const colors = [];
    const sizes = [];
    $("div.js-product-detail.detail > div:nth-child(1) > div.row > div.col-12.col-lg-4 > div.js-choices-box.detail__choices-box.detail__section--full > div.detail__section > div > div > form > div").map((i, e) => {
      sizes.push($(e).find("label:not(.disabled)").text().trim())
    })
    const description = cheerio("#detail-description > div", html)
      .text()
      .trim();
    $("div.js-product-detail.detail > div:nth-child(1) > div.row > div.col-12.col-lg-8 > div.detail__images-wrapper > div.detail__images.d-none.d-lg-flex > .detail__images-item").map((index, element) => {
      images.push(
        $(element).attr("href")
      );
    });
    if (sizes.filter((n) => n).length === 0) {
      return productsDetails
    }
    imageUrl = images[0];
    productsDetails.push({
      name,
      brand,
      orjprice,
      price,
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
    const response = await axios.get(link);

    const outerhtml = response.data;

    const dataTable = cheerio(
      "div.js-product-vertical.listing__col-product div.product.product-list",
      outerhtml
    );
    dataTable.each(function () {
      const productUrl =
        baseURL +
        cheerio(this).find("div.product__image > a").attr("href");
      urls.push(productUrl.trim());
    });
    // return await getProduct(urls[0], link)
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
