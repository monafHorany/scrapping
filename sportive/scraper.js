const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.sportive.com.tr/kadin-sweatshirt";
const baseURL = "https://www.sportive.com.tr";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
const fs = require("fs");
async function getProduct(prodURL, link) {
  try {
    const { data } = await axios.get(prodURL);
    // console.log(data)
    if (data.in_stock) {
      var productsDetails = [];
      const product_source = "Sportive";
      const group_url = link;
      const brand = "Sportive";
      const name = data.product.name;
      const orjprice = data.product.price;
      const price = data.product.price;
      const description = "";
      const propiteam = "item";
      const images = [];
      const sizes = [];
      data.product.productimage_set.map(i => images.push(i.image))
      const imageUrl = images[0]
      const colors = []

      data.variants.find(m => m.attribute_name === 'Renk').options.map(b => {
        if (b.is_selectable) { colors.push(b.label) }
      })
      data.variants.find(m => m.attribute_name === 'Beden').options.map(b => {
        if (b.is_selectable) { sizes.push(b.label) }
      })
      if (sizes.length === 0) {
        return productsDetails
      }
      productsDetails.push({
        name,
        brand,
        orjprice: orjprice + " TL",
        price: price + " TL",
        description,
        imageUrl,
        images,
        prodURL,
        sizes,
        propiteam,
        colors,
        group_url,
        product_source,
      });
      return productsDetails;
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
    productsDetails = [];
    return productsDetails;
  }
}
async function getProductsData(link, urls = []) {
  try {
    const response = await axios.get(link + "?format=html");
    const outerhtml = response.data;
    const dataTable = cheerio(
      "div.row.list__products.js-list-products.trio > div.col-sm-3.col-xs-6.product-item-box",
      outerhtml
    );
    dataTable.each(function () {
      const productUrl =
        baseURL +
        cheerio(this).find("a").attr("href");
      urls.push(productUrl);
    });
    // return getProduct(urls[0], link)
    // console.log(urls)
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
