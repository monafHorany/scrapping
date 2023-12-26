const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.sense.com.tr/Ceketler";
const baseURL = "https://www.sense.com.tr/";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    const productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "sense";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const name = $(".dAdi h1 span").text();
    const orjprice = $(".dFyt span span").text();
    const price = $(".divdiscountprice span").first().text();
    const main_image =
      "https://www.sense.com.tr/" + $(".product_imagesplaceholder").attr("src");
    $(".dOnizleme li").map((index, element) => {
      images.push(
        "https://www.sense.com.tr/" + $(element).find("a").attr("href")
      );
    });
    $(".varriant_weight li").map((index, element) => {
      sizes.push($(element).find("a.beden:not(.passive)").text());
    });
    $(".varriant_color li").map((index, element) => {
      colors.push($(element).find("a.vc_white").text());
    });
    productsDetails.push({
      name,
      orjprice,
      price,
      main_image,
      images,
      prodURL,
      sizes: sizes.filter((n) => n),
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
