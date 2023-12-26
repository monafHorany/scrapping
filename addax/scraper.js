const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.addax.com.tr/yeni-urunler/";
const baseURL = "https://www.addax.com.tr";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Addax";
    const group_url = link;
    const propiteam = "";
    const final_sizes = [];
    const final_colors = [];
    const final_images = [];
    let images = [];
    let imageUrl = "";
    const brand = "Addax";
    const name = cheerio(".ProductHeader", html).text().trim();
    const orjprice = cheerio("div > div.Prices > div.row > div.col-md-24.col-xs-24.AmountArea > div > div", html).first().text().replace(/\s+/g, ' ').trim()
    let price = cheerio(" div.Prices > div.row > div.col-md-24.col-xs-24.AmountArea > div.AmountCost > span", html).first().text().replace(/\s+/g, ' ').trim()
    if (price == "") {
      price = orjprice
    }
    const description = cheerio("#collapseOne > div > p", html).text().trim();
    const size = $("div.SizeOptions > a");
    $(size).each(function (i, elm) {
      if ($(elm).attr("class") != "outer") {
        final_sizes.push($(elm).text());
      }
    });
    const sizes = final_sizes.filter(function (el) {
      return el != "";
    });
    const color = cheerio(".ItemColorsContainer", html).html();

    $(color).each(function (i, elm) {
      final_colors.push($("a", elm).attr("title"));
    });
    const colors = final_colors.filter(function (el) {
      if (el != null || el != "") {
        return el;
      }
    });
    const image = cheerio(
      ".ProductDetailImages .ProductDetailsMainImage ul",
      html
    ).html();
    $(image).each(function (i, elm) {
      final_images.push($("li img", elm).data("src"));
    });
    images = final_images.filter(function (el) {
      if (el != null || el != "") {
        return el;
      }
    });
    imageUrl = images[0];

    if (sizes.length < 1) {
      return productsDetails;
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
    const response = await axios.get(link);

    const outerhtml = response.data;

    const dataTable = cheerio(".ProductList .Prd", outerhtml);

    dataTable.each(function () {
      const productUrl = baseURL + cheerio(this).find("a").attr("href");
      urls.push(productUrl);
    });
    // if (link.includes("&p=")) {
    //   const pageNumber = link.split("&p=")[1].split("&")[0];
    //   console.log(pageNumber);
    //   if (+pageNumber > 1) {
    //     urls = urls.slice(48 * (+pageNumber - 1));
    //   }
    // }
    console.log(urls.length);
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
