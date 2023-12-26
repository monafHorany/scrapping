const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.ltbjeans.com/tr-TR/kadin-ust-giyim-c-112";
const baseURL = "https://www.ltbjeans.com";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Ltbjeans";
    const group_url = link;
    const colors = [$("#ltb--content > div > div:nth-child(2) > div:nth-child(2) > div > div.product__detail--color-select-area.v4 > h4").text()];
    const sizes = [];
    const images = [];
    const name = $("#ltb--content > div > div:nth-child(2) > div:nth-child(2) > div > div.product__detail--head > h1").text();
    let orjprice = $("#ltb--content > div > div.d-none > div > div.get__stock--content.js-stock-form > div.get__stock--product > div > div.get__stock--product-price").first().text().trim();
    let price = $("#ltb--content > div > div.d-none > div > div.get__stock--content.js-stock-form > div.get__stock--product > div > div.get__stock--product-price").first().text().trim();
    if (orjprice === "") {
      orjprice = $("#ltb--content > div > div:nth-child(2) > div:nth-child(2) > div > div.product__detail--point-area > div.prices > span.dis__new--price.new--price--black").text().trim()
      price = $("#ltb--content > div > div:nth-child(2) > div:nth-child(2) > div > div.product__detail--point-area > div.prices > span.dis__new--price.new--price--black").text().trim()
    }
    const description = $("#ltb--content > div > div:nth-child(4) > div > div > div.tab__item--content.active.mt-20 > div").text().trim();
    $("#ltb--content > div > div:nth-child(2) > div.col-md-12.col-sm-12.col-lg-6.col-x.gallery--area > div.thumb--gallery-area.mobile-none > div > img").map(
      (index, element) => {
        images.push($(element).data("product-src"));
      }
    );
    $("#ltb--content > div > div:nth-child(2) > div:nth-child(2) > div > div.product__detail--size-select > div.size--select.js-size-select > div.dropdown > ul > li:not(.stock--item)").map((index, element) => {
      sizes.push($(element).text().trim());
    });
    if (sizes.filter((n) => n).length === 0) {
      return productsDetails
    }
    productsDetails.push({
      name,
      imageUrl: images[0],
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
    const wrapper = dataTable("#ltb--content > div > div > div > div > div.col-lg-10.ltb__product-listing--list > div.ltb__product-listing > div.row.d-flex > div.yCmsComponent.product-grid > div.ltb__product-listing > div > div");
    for (let i = 0; i < wrapper.length; i++) {
      const element = wrapper[i];
      const productUrl = dataTable(element).find("a").first().attr("href");
      urls.push(baseURL + productUrl);
    }
    console.log(urls.length)
    // return getProduct(urls[0], link);
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
