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
    const cart_discount = $("#price-flexer > div.fl.eiContent > div.fl.col-12.eicTxt > b").text().replace("%", "")
    let images = [];
    let imageUrl = "";
    const brand = "Tommylife";
    const name = cheerio("h1.fl.col-12.text-regular.m-top.m-bottom", html)
      .text()
      .trim();
    let orjprice = cheerio(
      "#price-flexer > div.fl.dtyFyt > div.fl.col-12.text-custom-dark-gray.text-line.currencyPrice.discountedPrice > span",
      html
    )
      .first()
      .text()
      .trim();
    let price = cheerio(
      "#price-flexer > div.fl.dtyFyt > div.fl.col-12.text-bold.text-custom-pink.discountPrice > span",
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
    console.log(cart_discount)
    if (cart_discount !== "") {
      price = Number(orjprice.replace(",", ".") * (100 - +cart_discount) / 100)
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
    const response = await axios.get(link);

    const outerhtml = response.data;

    const dataTable = cheerio(
      "div.fl.col-12.catalogWrapper div.box.col-4.col-md-4.col-sm-6.col-xs-6.productItem.ease",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl =
        baseURL +
        cheerio(this)
          .find(
            "div.fl.col-12.uListe div.fl.col-12.pos-r div.fl.col-12.pos-r a"
          )
          .attr("href");
      urls.push(productUrl);
    });
    console.log(urls);
    // return await getProduct(urls[0], link);

    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
