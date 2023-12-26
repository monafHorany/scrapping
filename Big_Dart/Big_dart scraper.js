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
    const orjprice = $("#price-flexer > div > div.fl.col-sm-12.text-custom-dark-gray.text-line.currencyPrice.discountedPrice").text()
    const price = $("#price-flexer > div > div.fl.text-bold.text-custom-pink.discountPrice").text()
    const description = cheerio("#productRight > div.fl.col-12.tabButtons > div > div:nth-child(2) > div", html).text();
    const propiteam = "item";
    const images = [];
    const sizes = [];
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
    const response = await axios.get(link, {
      headers: {
        Cookie: "countryCode=TR",
      },
    });
    const outerhtml = response.data;

    const dataTable = cheerio(
      "div.fl.col-12.catalogWrapper div.col.col-3.col-md-3.col-sm-6.col-xs-6.productItem.zoom.ease",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl =
        baseURL +
        cheerio(this).find("div.box.col-12.pre.whiteBg div.fl.col-12.pre a.image-wrapper.fl.detailLink").attr("href");
      urls.push(productUrl);
    });
    // return getProduct(urls[0], link)


    // console.log(urls)
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
