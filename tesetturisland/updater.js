const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.tesetturisland.com/tesettur-giyim";
const baseURL = "https://www.tesetturisland.com";
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
    const product_source = "Tesetturisland";
    const group_url = link;
    const propiteam = "";
    const final_sizes = [];
    const final_colors = [];
    const final_images = [];
    const cart_discount = $("#productMobilePrices > div.fl.col.col-12.sepetteIndirim > span > span").text()
    let images = [];
    let imageUrl = "";
    const brand = "Tesetturisland";
    const name = cheerio("#productName", html)
      .text()
      .trim();
    let orjprice = cheerio(
      "#productMobilePrices > div > div:nth-child(1) > div",
      html
    )
      .first()
      .text()
      .trim();
    let price = cheerio(
      "#productMobilePrices > div > div:nth-child(2) > div.col.discountPrice > span",
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
    if (cart_discount !== "") {
      price = price.length < 6 ? Number(price.replace(",", ".") * (100 - +cart_discount) / 100) + " TL" : Number(price.replace(".", "").replace(",", ".") * (100 - +cart_discount) / 100) + " TL"
    } else {
      price = price + " TL"
    }


    const description = cheerio(
      "#productDetailTab",
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
            "li div.col.col-12.p-left.forDesktop > div > div > a > span > img"
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
