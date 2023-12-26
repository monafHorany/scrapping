const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.abiyefon.com/abiye-modelleri";
const baseURL = "https://www.abiyefon.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    const html = response.data;
    const $ = cheerio.load(html);
    const prodID = $("#proOptSku").attr("content");
    var productsDetails = [];
    const product_source = "Abiyefon";
    const group_url = link;
    const brand = "Abiyefon";
    const name = cheerio(".productdetails h1", html).text();
    let variants;
    try {
      for (let i = 0; i < $("script").length; i++) {
        const element = $("script")[i];
        if (element.children[0]?.data?.includes("var options = ")) {
          variants = JSON.parse(
            element?.children[0]?.data
              .split("var options = ")[1].split(";")[0]
          ).Renk
        }
      }
    } catch (error) {
      console.log(error);
    }
    if (variants === undefined) {
      return productsDetails
    }
    const strorjprice = cheerio(
      "#contents > div > section > div.product-section > div.salepricedetail > span > del",
      html
    )
      .first()
      .text();
    const strprice = cheerio(
      "#contents > div > section > div.product-section > div.salepricedetail > span > span",
      html
    )
      .first()
      .text();
    const price = strprice.split(",").join("");
    const orjprice = strorjprice.split(",").join("");
    const description = cheerio("#tab1 > div > div", html).text();
    const propiteam = "item";
    const images = [];
    $(`#gallery > ul > li.opt_${prodID}`).map((i, e) =>
      images.push("https://www.abiyefon.com" + $(e).find("a").data("z-image"))
    );
    const imageUrl = images[0]
    const colors = [];
    let size = Object.keys(variants).map(function (key) {
      return variants[key]
    });

    const sizes = []
    size.forEach(r => {
      if (r.id === prodID) {
        Object.keys(r.subOptions.Beden).map(function (key) {
          if (r.subOptions.Beden[key].stock > 0) {
            sizes.push(key)
          }
        });

      }
    })
    if (sizes.length === 0) {
      return productsDetails
    }
    productsDetails.push({
      name,
      brand,
      orjprice,
      price,
      description,
      imageUrl,
      images,
      prodURL,
      sizes,
      propiteam,
      colors,
      group_url,
      product_source,
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
