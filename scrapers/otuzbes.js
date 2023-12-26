const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.otuzbesshoes.com/cizme-2/";
const baseURL = "https://www.otuzbesshoes.com/";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Otuzbesshoes";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const name = $("div.overview-head div.product-name h1").text();
    let orjprice = $("div.product-price div.product-old-price span")
      .first()
      .text()
      .trim();
    let price = $("div.product-price div.product-price span")
      .first()
      .text()
      .trim();
    if (orjprice === '') {
      orjprice = price
    }
    if (price == "") {
      price = orjprice;
    }
    const imageUrl = $("div.swiper-wrapper div.swiper-slide a").attr("href");
    const description = $(".full-description > p:nth-child(-n + 4)").text().trim();
    $("div.swiper-wrapper div.swiper-slide").map((index, element) => {
      images.push($(element).find("a").attr("href"));
    });
    $("ul.radio-list li").map((index, element) => {
      sizes.push($(element)
        .find("label:not(.attribute-value-out-of-stock)").text());
    });
    if (sizes.filter((n) => n).length === 0) {
      return productsDetails
    }
    productsDetails.push({
      name,
      imageUrl,
      orjprice,
      price,
      description,
      images: images.filter((n) => n),
      prodURL,
      sizes: sizes.length > 0 ? sizes.filter((n) => n) : [],
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
    const wrapper = dataTable(".item-grid > .product-item");
    console.log(wrapper.length);
    for (let i = 0; i < wrapper.length; i++) {
      const element = wrapper[i];
      const productUrl = dataTable(element).find("a").first().attr("href");
      urls.push(baseURL + productUrl);
    }

    // console.log(urls);
    // return getProduct(urls[0], link);
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
