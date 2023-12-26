const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.skechers.com.tr/kadin-c-1";
const baseURL = "https://www.skechers.com.tr";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Skechers";
    const group_url = link;
    const colors = [$("#product-details-form > div.cl-product-colors > div.cl-flex-row > span:nth-child(2) > strong").text().trim()];
    const sizes = [];
    const images = [];
    const name = $("#product-details-form > div.cl-product-info-container > h1").text().trim();
    let orjprice = $("#product-details-form > div.cl-product-prices > div.cl-product-price > div > span:nth-child(1)").text().trim();
    let price = $("#product-details-form > div.cl-product-prices > div.cl-product-price > span").first().text().trim();
    let imageUrl;
    const description = $(
      "#product-details-form > div.accordion > section:nth-child(1) > div.accordion__content > div.pInfo > div"
    ).text().trim();
    $("body > main > div.container-fluid.page-container > div.cl-product-details-page > div.cl-flex-row.cl-product-row > div.cl-product-images-col > div.cl-product-gallery.swiper-container > div.swiper-wrapper > div.swiper-slide").map((index, element) => {
      images.push($(element).find("div a").attr("href")
      );
    });
    $("div.cl-size-input-container > ul > li").map((index, element) => {
      sizes.push($(element).find("label.sk-enabled-size").text().trim());
    });
    if (orjprice === "") {
      orjprice = price;
    }
    if (price === "") {
      price = orjprice;
    }
    imageUrl = images[0]
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
