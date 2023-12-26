const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.bymfashion.com/tesettur-alt-giyim";
const baseURL = "https://www.bymfashion.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: {
        Cookie: "countryCode=TR",
      },
    });
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Bymfashion";
    const group_url = link;
    const propiteam = "";
    const final_sizes = [];
    const final_images = [];
    let images = [];
    let imageUrl = "";
    const brand = "Bymfashion";
    const name = cheerio("#product-title", html)
      .text()
      .trim();
    let orjprice = cheerio(
      "#product-right > div.w-100.p-1.pt-1.border-bottom > div > div > div > span",
      html
    )
      .first()
      .text()
      .trim();
    let price = cheerio(
      "#product-right > div.w-100.p-1.pt-1.border-bottom > div > div > div > span",
      html
    )
      .first()
      .text()
      .trim();
    if (orjprice === "") {
      orjprice = price;
    }
    if (price === "") {
      price = orjprice;
    }
    const description = cheerio(
      "#product-fullbody",
      html
    )
      .text()
      .trim();
    const size = $(".col-9.d-flex.flex-wrap.gap-1.mb-1.pr-0").html();
    $(size).each(function (i, elm) {
      final_sizes.push(
        $(elm).find("a.border:not(.passive) span").text()
      );
    });
    const sizes = final_sizes.filter(function (el) {
      return el != "";
    });

    const colors = [];
    const image = cheerio("#gallery-304", html).html();
    $(image).each(function (i, elm) {
      final_images.push(
        $(elm)
          .attr("href")
      );
    });
    images = final_images.filter(function (el) {
      if (el != null || el != "") {
        return el;
      }
    });
    imageUrl = images[0];
    if (sizes.length < 1) {
      return productsDetails
    }
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
