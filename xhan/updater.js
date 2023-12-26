const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.xhan.com.tr/yeni-urunler";
const baseURL = "https://www.xhan.com.tr";
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
    const product_source = "Xhan";
    const group_url = link;
    const brand = "Xhan";
    const name = $("#productName").text();
    const orjprice = $("#product-detail-indirimsiz-fiyat > div").text()
    const price = $("#product-detail-indirimli-fiyat > div").text()
    const description = $("#features-content").text();
    const propiteam = "item";
    const images = [];
    const sizes = [];
    $("#productImage li.col-12.fl").map((i, e) =>
      images.push($(e).find("img").attr("src"))
    );
    const imageUrl = $("#productImage > li:nth-child(1) > div > div > div > a > span > img").attr("src")
    const colors = []
    $("div.col.col-md-12.variantBox.subTwo div.fl.col-12.ease.variantList > .col.box-border:not(.passive)").map((i, m) => {
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
