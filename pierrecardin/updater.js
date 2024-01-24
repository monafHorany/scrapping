const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.pierrecardin.com.tr/erkek-klasik-gomlek";
const baseURL = "https://www.pierrecardin.com.tr";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
      },
    });
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Pierrecardin";
    const group_url = link;
    const propiteam = "";
    const final_sizes = [];
    const final_images = [];
    let images = [];
    let imageUrl = "";
    const brand = "Pierrecardin";
    const name = cheerio(".product__facet--heading h1", html)
      .text()
      .trim();
    let orjprice = cheerio(
      " div.product__facet--payment.cf > div.product__payment--price > del",
      html
    )
      .first()
      .text()
      .trim();
    let price = cheerio(
      "div.product__primary > div > div > div.row.xl > div.col-xs-12.col-sm-5.col-md-5.product__detail-info > div > div.product__facet--payment.cf > div.product__payment--price > ins",
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


    if ($("body > div.application > main > section > div > div.product__primary > div > div > div.row.xl > div.col-xs-12.col-sm-5.col-md-5.product__detail-info > div > div.product__listing--basket-price.hidden-xs > p > span").text() !== "") {
      price = $("body > div.application > main > section > div > div.product__primary > div > div > div.row.xl > div.col-xs-12.col-sm-5.col-md-5.product__detail-info > div > div.product__listing--basket-price.hidden-xs > p > span").text()
    }
    if (orjprice.length > 6 || price.length > 6) {
      orjprice = orjprice.replace(".", "").split(",")[0] + " TL";
      price = price.replace(".", "").split(",")[0] + " TL";
    }

    const desc = $("body > div.application > main > section > div > div.product__secondary > div.helper__background.color--gray.hidden-xs > div > div > div > div > div:not(:last-child)").text();
    const description = desc.trim();
    const size = $("body > div.application > main > section > div > div.product__primary > div > div > div.row.xl > div.col-xs-12.col-sm-5.col-md-5.product__detail-info > div > div.product__facet--variants > ul > li[data-key=integration_size] > ul").html();
    $(size).each(function (i, elm) {
      final_sizes.push(
        $(elm).find("li > a.js-variant:not(.disabled)").data("value")
      );
    });
    const sizes = final_sizes.filter(n => n)

    const colors = [];
    const image = cheerio("#gallery > ul", html).html();
    $(image).each(function (i, elm) {
      final_images.push(
        $(elm)
          .find(
            "li > a"
          )
          .data("image")
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
    const category = JSON.parse($("body > div.application > main > section > div > div.analytics-data").text());
    if (category.productDetail.data.stock > 0 && sizes.length < 1) {
      sizes.push("STD");
    }
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
