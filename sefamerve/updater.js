const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.sefamerve.com/k/tesettur-giyim/elbise";
const baseURL = "https://www.sefamerve.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: {
        Cookie: "geo=TR; goip=TR; currency=TRY;",
      },
    });
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Sefamerve";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    let sizes = [];
    let colors = [];
    const brand = "Sefamerve";
    const name = cheerio("div.detail_container > h1", html).text().trim();
    let orjprice = $("#product-data > div.price_block_div > div.product_price_cont > div.price_market").text().trim();
    let price = $("#product-data > div.price_block_div > div.product_price_cont > div.price_our").text().trim();
    if (orjprice == "") {
      orjprice = price;
    }
    if (orjprice.length > 7 || price.length > 7) {
      orjprice = orjprice.replace(",", "");
      price = price.replace(",", "");
    }
    const description = $("#tab_content_attr > div.detail_scroll_cont > :not(:nth-child(-n + 3))").text().trim();
    $("div.image_container div.zoom_gallery a.gallery_thumb").map((i, e) => images.push($(e).attr("href")))
    imageUrl = images[0];
    $("#select_an_option .option_div.option_selectable").map((i, e) => sizes.push($(e).text().trim()))

    $("div.pd_similar div.pd_similar_cont").map((i, e) => colors.push($(e).text().trim()))
    // if (sizes.filter((n) => n).length < 1) {
    //   return productsDetails
    // }
    productsDetails.push({
      name,
      brand,
      orjprice,
      price,
      description,
      imageUrl,
      prodURL,
      sizes,
      propiteam,
      colors,
      group_url,
      product_source,
      images,
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
