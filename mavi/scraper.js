const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.mavi.com/kadin/c/1";
const baseURL = "https://www.mavi.com";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Mavi";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const name = $("#mainPageContent > section.product.product--wrapper > div > div > div.product__details > div.product__info > h1").text();
    let orjprice = $("#mainPageContent > section.product.product--wrapper > div > div > div.product__details > div.product__pricing-info.js-product-price > div > div > span.nodiscount-price").first().text();
    let price = $("#mainPageContent > section.product.product--wrapper > div > div > div.product__details > div.product__pricing-info.js-product-price > div > div > span.price").text();
    const imageUrl = $("#swiper-wrapper > a:nth-child(1) > img").attr("src");
    const description = $(
      "#mainPageContent > section.product.product--wrapper > div > div > div.product__details > div.product__features > div.accordion.js-accordion--full.active > div"
    ).text().trim();
    $("#swiper-wrapper > a").map((index, element) => {
      images.push($(element).find("img").attr("src")
      );
    });
    const productCode = $("#mainPageContent > div.product-detail-sticky.js-product-detail-sticky > div > div > div.p-sticky__right > div.button-icon.added.action-favorite.js-wishlist-add").data("code");
    const { data } = await axios.get(`https://www.mavi.com/plp/product/${productCode}/sizeAndLengthList`);
    // console.log(data)
    data.sizeList.forEach(element => {
      element.isAvailable === true && sizes.push(element.size)
    });
    $("#mainPageContent > section.product.product--wrapper > div > div > div.product__details > div.product__color-panel.js-tooltip-container > div.product__color-panel--inner.js-list-scroll > div.product__color-panel-list.js-list-content > a").map((index, element) => {
      colors.push($(element).data("title"));
    });
    if (orjprice === "") {
      orjprice = price
    }
    if (sizes.length < 1) {
      return productsDetails
    }
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
    const wrapper = dataTable(".product-list-cards-inner.js-product-list-cards > .product-item");
    for (let i = 0; i < wrapper.length; i++) {
      const element = wrapper[i];
      const productUrl = dataTable(element).find(".product-card.js-product-card .product-card-container .product-card-end a").attr("href");
      urls.push(baseURL + productUrl);
    }
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
