const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.sense.com.tr/Ceketler";
const baseURL = "https://www.sense.com.tr";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Sense";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const name = $(".dAdi h1 span").text();
    const orjprice = $(".dFyt span span").text();
    const price = $(".divdiscountprice span").first().text();
    const imageUrl =
      "https://www.sense.com.tr/" + $(".product_imagesplaceholder").attr("src");
    const description = $(
      "#fpshow > div > div.detayRight > div.dSekmeli > ul > li:nth-child(1) > ul"
    ).text();
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
      imageUrl,
      orjprice,
      price,
      description,
      images,
      prodURL,
      sizes: sizes.filter((n) => n),
      colors: colors.filter((n) => n),
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
    const response = await axios.get(link);

    const outerhtml = response.data;

    const dataTable = cheerio.load(outerhtml);
    const wrapper = dataTable(".category > .kurunListeleme");
    for (let i = 0; i < wrapper.length; i++) {
      const element = wrapper[i];
      const productUrl = dataTable(element).find("a").attr("href");
      urls.push(productUrl);
    }
    // return getProduct(urls[0], link);
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
