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
      $(element)
        .find("input")
        .not(function (i, el) {
          // this === el
          return $(this).data("qty") === "0,0000";
        })
        .each((i, e) => {
          sizes.push($(e).next().text());
        });
    });
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
