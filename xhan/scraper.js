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
    const description = $("#productDetailTab").text();
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
    const response = await axios.get(link, {
      headers: {
        Cookie: "countryCode=TR",
      },
    });
    const outerhtml = response.data;

    const dataTable = cheerio(
      "div#list-slide1003 .col.col-4.col-md-4.col-sm-6.col-xs-6.productItem.ease",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl =
        baseURL +
        cheerio(this).find("div#product-list-topRow a").attr("href");
      urls.push(productUrl);
    });
    // return getProduct(urls[0], link)


    console.log(urls)
    // return
    return Promise.all(
      urls.map((url, index) =>
        getProduct(url, link)
      )
    );
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
