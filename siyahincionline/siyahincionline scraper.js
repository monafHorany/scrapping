const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.siyahincionline.com/erkek";
const baseURL = "https://www.siyahincionline.com";
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
    const product_source = "Siyahincionline";
    const group_url = link;
    const brand = "Siyahincionline";
    const name = $("#productName").text();
    const orjprice = $("#price-flexer > div > div").text().trim()
    const price = $("#price-flexer > div > div").text().trim()
    const description = $("#productRight > div.fl.col-12.p-desc").text();
    const propiteam = "item";
    const images = [];
    const sizes = [];
    $("#productImagee li.col-6").map((i, e) =>
      images.push($(e).find("img").attr("src"))
    );
    const imageUrl = images[0]
    const colors = []
    $("div.col-12.variantBox.subTwo div.fl.col-12.ease.variantList span.pos-r.varyant-two").map((i, m) => {
      sizes.push($(m).find("a.col.box-border:not(.passive)").text().trim())
    })
    if (sizes.filter(n => n).length === 0) {
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
      sizes: sizes.filter(n => n),
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
      "div#list-slide1003 .col-4.col-md-4.col-sm-6.col-xs-6.productItem.ease",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl =
        baseURL +
        cheerio(this).find("a").first().attr("href");
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
