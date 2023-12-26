const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.modaselvim.com/tesettur-abiye-elbise";
const baseURL = "https://www.modaselvim.com";
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
    const product_source = "Modaselvim";
    const group_url = link;
    const propiteam = "";
    const final_sizes = [];
    const final_images = [];
    let images = [];
    let imageUrl = "";
    const brand = "Modaselvim";
    const name = cheerio("#productName", html).text().trim();
    let orjprice = cheerio(
      "#productMobilePrices > div > div > div > div.col.currencyPrice.discountedPrice.p-left.col-6 > span",
      html
    )
      .first()
      .text()
      .trim();
    let price = cheerio(
      "#productMobilePrices > div > div > div > div.box.discountPrice.p-left.col-sm-6 > span",
      html
    )
      .first()
      .text()
      .trim();
    if (price == "") {
      price = orjprice;
    }
    if (orjprice == "") {
      orjprice = price;
    }
    const description = cheerio("#detail-tabs > div > div:nth-child(1) > div > div.box.col-12.tabContent > div", html).contents()
      .filter(function () {
        return this.type === "text";
      })
      .text()
      .trim();
    const size = $("div.fl.col-12.ease.variantList").html();
    $(size).each(function (i, elm) {
      final_sizes.push($(elm).find("a.col.box-border:not(.passive) p").text());
    });
    const sizes = final_sizes.filter(function (el) {
      return el != "";
    });
    const image = cheerio("ul.fl.col-12.fade", html).html();
    $(image).each(function (i, elm) {
      final_images.push($("li img", elm).attr("src"));
    });
    images = final_images.filter(function (el) {
      if (el != null || el != "") {
        return el;
      }
    });
    if (sizes.filter((n) => n).length < 1) {
      return productsDetails
    }
    imageUrl = images[0];
    productsDetails.push({
      name,
      brand,
      orjprice: orjprice + " TL",
      price: price + " TL",
      description,
      imageUrl,
      prodURL,
      sizes,
      propiteam,
      colors: [],
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
