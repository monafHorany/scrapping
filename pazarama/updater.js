const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.pazarama.com/kadin-dis-giyim-k-K08100";
const baseURL = "https://www.pazarama.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
const fs = require("fs");
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    const html = response.data;
    const $ = cheerio.load(html);
    var productsDetails = [];
    const product_source = "Pazarama";
    const group_url = link;
    const brand = "Pazarama";
    const name = $("#app > div.pl-10 > div:nth-child(1) > div.mt-2.flex.justify-between > div:nth-child(1) > h1").text();
    let orjprice = $("#app > div.pl-10 > div:nth-child(1) > div:nth-child(3) > div.ml-6.flex-1.flex.flex-col > div.flex.justify-between > div:nth-child(1) > p.text-lg.text-gray-400.line-through").text()
    let price = $("#app > div.pl-10 > div:nth-child(1) > div:nth-child(3) > div.ml-6.flex-1.flex.flex-col > div.flex.justify-between > div:nth-child(1) > p.text-4xl.font-bold.text-gray-600").text()
    const description = $("div.border.rounded.px-3.pb-3.flex.justify-between.flex-wrap").text();
    const propiteam = "item";
    let images = [];
    const sizes = [];
    $("#app > div.pl-10 > div:nth-child(1) > div:nth-child(3) > div.w-147.overflow-hidden.flex-shrink-0 > div > div.relative > div > div > div.swiper-wrapper > div").map((i, e) =>
      images.push($(e).find("button > picture > img").data("src").replace("/150/150/", "/1200/1200/"))
    );
    //#app > div.pl-10 > div:nth-child(1) > div:nth-child(3) > div.w-147.overflow-hidden.flex-shrink-0 > div > div.relative > div > div > div.swiper-wrapper > div:nth-child(1) > button > picture > img
    //
    const imageUrl = $("div > div.w-full.h-147.border.rounded-md.overflow-hidden > picture > img").data("src").replace("/600/600/", "/1200/1200/")
    const colors = [$("#app > div.pl-10 > div:nth-child(1) > div:nth-child(3) > div.ml-6.flex-1.flex.flex-col > div.flex-1 > div:nth-child(1) > div:nth-child(1) > div > p > span").text().trim()]
    $("#app > div.pl-10 > div:nth-child(1) > div:nth-child(3) > div.ml-6.flex-1.flex.flex-col > div.flex-1 > div:nth-child(1) > div:nth-child(2) > div > div > span > div > div > div > div > div.multiselect__content-wrapper > ul > li.multiselect__element").map((i, m) => {

      sizes.push($(m).find("span.multiselect__option:not(.multiselect__option--disabled)").text())
    })
    if (sizes.filter((n) => n).length === 0) {
      return productsDetails
    }
    if (images.filter((n) => n).length === 0) {
      images = [imageUrl]
    }
    if (orjprice == "") {
      orjprice = price;
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
      sizes: sizes.filter((n) => n),
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
