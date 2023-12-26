const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.pazarium.com.tr/yelek";
const baseURL = "https://www.pazarium.com.tr";
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
    const product_source = "Pazarium";
    const group_url = link;
    const brand = "Pazarium";
    const name = $("#productName").text();
    const orjprice = $("#price-flexer > div > div.fl.col-sm-12.text-bold.text-custom-pink.discountPrice").text()
    const price = $("#price-flexer > div > div.fl.col-sm-12.text-bold.text-custom-pink.discountPrice").text()
    const description = $("#productDetailTab").text();
    const propiteam = "item";
    const images = [];
    const sizes = [];
    $("#productImage li.col-12.fl").map((i, e) =>
      images.push($(e).find("img").attr("src"))
    );
    const imageUrl = $("#productImage > li:nth-child(1) > a > span > img").attr("src")
    const colors = []
    $("div.fl.col-8.col-xs-12.variantBox.subTwo div.pos-r.fl.col-12.ease.variantList > .col.box-border:not(.passive)").map((i, m) => {
      sizes.push($(m).text())
    })
    if (sizes.length === 0) {
      return productsDetails
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
