const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.suvari.com.tr/tr/gomlek";
const baseURL = "https://www.suvari.com.tr";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Suvari";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const name = $(".ProductHeader.product-name").text();
    const orjprice = $(".PriceOld.old-price").first().text();
    const price = $(".Price.sale-price").first().text();
    if (price == "") {
      price = orjprice;
    }
    const description = $(".product-information").text();
    $(".ProductDetailsMainImage.main-product-images ul.main-image-list li").map(
      (index, element) => {
        images.push($(element).attr("href"));
      }
    );
    $(".product-sizes .size-option-wrapper").map((index, element) => {
      sizes.push($(element).find("a").text());
    });
    $(
      ".ItemColorsContainer.product-colors .ColorOption.color-option-wrapper"
    ).map((index, element) => {
      colors.push($(element).find("a").attr("title"));
    });
    if (sizes.filter((n) => n).length === 0) {
      return productsDetails
    }
    const imageUrl = images[0]
    productsDetails.push({
      name,
      imageUrl,
      orjprice : orjprice.replace("₺", "TL"),
      price : price.replace("₺", "TL"),
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
    const wrapper = dataTable(".ProductList .Prd");
    console.log(wrapper.length);
    for (let i = 0; i < wrapper.length; i++) {
      const element = wrapper[i];
      const productUrl = dataTable(element).find("a").attr("href");
      urls.push(baseURL + productUrl);
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
