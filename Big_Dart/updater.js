const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.bigdart.com.tr/yeni-urunler";
const baseURL = "https://www.bigdart.com.tr";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
const fs = require("fs");
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: {
        Cookie: "countryCode=TR",
      },
    });
    const html = response.data;
    const $ = cheerio.load(html);
    var productsDetails = [];
    const product_source = "Bigdart";
    const group_url = link;
    const brand = "Bigdart";
    const name = $("#productName").text();
    let orjprice = $("#price-flexer > div > div.fl.col-sm-12.text-custom-dark-gray.text-line.currencyPrice.discountedPrice").text()
    let price = $("#price-flexer > div > div.fl.text-bold.text-custom-pink.discountPrice").text()
    const description = cheerio("#productRight > div.fl.col-12.tabButtons > div > div:nth-child(2) > div", html).text();
    const propiteam = "item";
    const images = [];
    const sizes = [];
    if (orjprice === '') {
      const j = JSON.parse($("div.row .hideThis").text());
      // console.log(j)
      const vat = j.vat;
      orjprice = Number(Object.values(j.variant_prices)[0]) * 1.1 + " TL";
      price = Number(Object.values(j.variant_prices)[0]) * 1.1 + " TL";
    }
    $("#productImage li.col-12.fl").map((i, e) =>
      images.push($(e).find("img").attr("src"))
    );
    const imageUrl = $("#productImage > li:nth-child(1) > a > span > img").attr("src")
    const colors = []
    $("div.col.col-12.col-xs-12.variantBox.subTwo div.fl.col-12.ease.variantList > .col.box-border:not(.passive)").map((i, m) => {
      sizes.push($(m).text())
    })
    if (sizes.length === 0) {
      return productsDetails
    }
    if (price === '' || price === undefined) {
      price = orjprice
    }
    productsDetails.push({
      name,
      brand,
      orjprice,
      price,
      description,
      imageUrl,
      images,
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
