const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.kip.com.tr/koleksiyon/gomlek";
const baseURL = "https://www.kip.com.tr";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    const productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "kip";
    const group_url = link;
    const name = $("h1#productName").text();
    const orjprice =
      $(".product-price-not-discounted").text().length === 0
        ? $("span.product-price").text()
        : $(".product-price-not-discounted").text();
    const price = $("span.product-price").text();
    const description = $("div.fl.col-12.product-tabs--content").text();
    const propiteam = "item";
    const imageUrl = $(
      "div.pos-r.fl.col-12.loaderWrapper .fl.col-12 .fl.col-12.product-detail-img-slider.productImage .fl.col-12 a"
    )
      .first()
      .attr("href");
    var images = [];
    $(
      "div.pos-r.fl.col-12.loaderWrapper .fl.col-12 .fl.col-12.product-detail-img-slider.productImage .fl.col-12"
    )
      .find("a")
      .map((index, element) => {
        images.push($(element).attr("href"));
      });
    const colors = [];
    const size = [];
    $(
      ".fl.col-12.variantBox.subTwo .pos-r.fl.col-12.ease.variantList .col.box-border:not(.passive)"
    ).map((index, element) => {
      size.push($(element).text());
    });

    var sizes = size.filter(onlyUnique);
    if (sizes.filter((n) => n).length === 0) {
      return productsDetails
    }
    productsDetails.push({
      name,
      orjprice: orjprice.includes(".") ? orjprice.replace(".", "") + " TL" : orjprice + " TL",
      price: price.includes(".") ? price.replace(".", "") + " TL" : price + " TL",
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
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
async function getProductsData(link, urls = []) {
  try {
    const response = await axios.get(link);

    const outerhtml = response.data;

    const dataTable = cheerio(
      "#list-slide1003 .fl.col-3.col-md-6.col-sm-6.col-xs-6.mb20.productItem.zoom.ease",
      outerhtml
    );
    // console.log(dataTable.length);

    dataTable.each(function () {
      const productUrl = cheerio(this)
        .find(".col.col-12.sh-inner .pos-r.fl.col-12 > .image-wrapper.fl.detailLink")
        .attr("href");
      urls.push(baseURL + productUrl);
    });
    // if (link.includes("ps=")) {
    //   const pageNumber = link.split("ps=")[1];
    //   if (+pageNumber > 1) {
    //     urls = urls.slice(15 * (+pageNumber - 1));
    //   }
    // }
    console.log(urls.length);
    // console.log(urls);
    // return await getProduct(urls[3]);
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
