const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.tommylife.com.tr/erkek-spor-giyim";
const baseURL = "https://www.tommylife.com.tr";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Tommylife";
    const group_url = link;
    const propiteam = "";
    const final_sizes = [];
    const final_colors = [];
    const final_images = [];
    let images = [];
    let imageUrl = "";
    const brand = "Tommylife";
    const name = cheerio("h1.fl.col-12.text-regular.m-top.m-bottom", html)
      .text()
      .trim();
    let orjprice = cheerio(
      "#price-flexer > div.fl.dtyFyt > div > span",
      html
    )
      .first()
      .text()
      .trim();
    let price = cheerio(
      "#price-flexer > div.fl.eiContent > div.fl.col-12.eicPrice > span.fl.eicpP",
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
      "#productLeft > div.fl.col-12.urunDetayBilgi > div.fl.col-12.udbIcerik > div.fl.col-12.udbiItem.urunAciklamasi > ul:nth-child(2)",
      html
    )
      .text()
      .trim();
    const size = $("#variantMain").html();
    // console.log(size)
    $(size).each(function (i, elm) {
      final_sizes.push(
        $(elm).find("a.col.sizeVariant.box-border:not(.passive) p").text()
      );
    });
    const sizes = final_sizes.filter(function (el) {
      return el != "";
    });

    const colors = [
      $(
        "#productLeft > div.fl.col-12.urunDetayBilgi > div.fl.col-12.udbIcerik > div.fl.col-12.udbiItem.urunAciklamasi > ul:nth-child(2) > li:nth-child(2)"
      )
        .first()
        .text()
        .split("Renk: ")[1],
    ];
    const image = cheerio("#productImage", html).html();
    $(image).each(function (i, elm) {
      final_images.push(
        $(elm)
          .find(
            "li.fl.bpLi:not(.pos-r.videoPanel) > a.image-wrapper.fl.product_Image span.imgInner img"
          )
          .attr("src")
      );
    });

    if (orjprice.length > 6 || price.length > 6) {
      orjprice = orjprice.replace(".", "").split(",")[0] + " TL";
      price = price.replace(".", "").split(",")[0] + " TL";
    }
    images = final_images.filter(function (el) {
      if (el != null || el != "") {
        return el;
      }
    });
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
