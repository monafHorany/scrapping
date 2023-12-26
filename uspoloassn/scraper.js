const axios = require("axios");
var cheerio = require("cheerio");
const fs = require('fs')
const url = "https://tr.uspoloassn.com/kadin-basic-gomlek";
const baseURL = "https://tr.uspoloassn.com";
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
    const product_source = "Uspoloassn";
    const group_url = link;
    const propiteam = "";
    const final_sizes = [];
    const final_images = [];
    let images = [];
    let imageUrl = "";
    const brand = "Uspoloassn";
    const name = cheerio("div > div.product__facet--name-wrapper > div.product_facet--name > div > div:nth-child(1) > div > div > h1", html)
      .text()
      .trim();
    let orjprice = cheerio(
      "div.product__payment--price.hidden-xs > del",
      html
    )
      .first()
      .text()
      .trim();
    let price = cheerio(
      "div.product__facet--name-wrapper > div.product__payment--price.hidden-xs > ins",
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
    const description = cheerio(
      "div.helper__background.color--gray.hidden-xs > div > div > div > div > div:nth-child(4n+2)",
      html
    )
      .text()
      .trim() + cheerio(
        "div.helper__background.color--gray.hidden-xs > div > div > div > div > div:nth-child(4n+3)",
        html
      )
        .text()
        .trim();
    const size = $("ul > li.js-variant-area.js-product-sizes > ul").html();
    $(size).each(function (i, elm) {
      final_sizes.push(
        $(elm).find("li a.js-variant:not(.disabled)").data("value")
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
    if (category.productDetail.data.in_stock === "True" && sizes.length < 1) {
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
    const response = await axios.get(link, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
      },
    });

    const outerhtml = response.data;
    const dataTable = cheerio(
      ".js-product-list-container .js-product-list-item",
      outerhtml
    );
    dataTable.each(function () {
      const productUrl =
        cheerio(this)
          .find(
            "div > div > div.product__listing--image > figure > a"
          )
          .attr("href");
      urls.push(baseURL + productUrl);
    });
    // return await getProduct(urls[0], link);

    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};

