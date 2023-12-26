const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.tesetturdunyasi.com.tr/triko";
const baseURL = "https://www.tesetturdunyasi.com.tr";
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
    const product_source = "Tesetturdunyasi";
    const group_url = link;
    const propiteam = "";
    const final_sizes = [];
    const final_images = [];
    let images = [];
    let imageUrl = "";
    const brand = "Tesetturdunyasi";
    const name = cheerio("#productName", html)
      .text()
      .trim();
    let orjprice = cheerio(
      "#price-flexer > div > div.fl.col-sm-12.text-custom-dark-gray.text-line.currencyPrice.discountedPrice > span",
      html
    )
      .first()
      .text()
      .trim();
    let price = cheerio(
      "#price-flexer > div > div.fl.col-12.text-bold.text-custom-pink.discountPrice > span",
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
      "#productRight > div:nth-child(6) > div.row.tabButtons > div > div:nth-child(2)",
      html
    )
      .text()
      .trim();
    const size = $("div.fl.col-12.ease.variantList").html();
    $(size).each(function (i, elm) {
      final_sizes.push(
        $(elm).find("a.col.box-border:not(.passive) p").text()
      );
    });
    const sizes = final_sizes.filter(function (el) {
      return el != "";
    });

    const colors = [];
    const image = cheerio("#productImage", html).html();
    $(image).each(function (i, elm) {
      final_images.push(
        $(elm)
          .find(
            "li.col-6.fl.col-sm-12 > a > span > img"
          )
          .attr("src")
      );
    });
    images = final_images.filter(function (el) {
      if (el != null || el != "") {
        return el;
      }
    });
    if (images.length === 0) {
      images.push($("#productImage > li > div > div > div > a > span > img").attr("src"));
      imageUrl = $("#productImage > li > div > div > div > a > span > img").attr("src");
    }
    if (sizes.length < 1) {
      return productsDetails
    }
    imageUrl = images[0];
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
