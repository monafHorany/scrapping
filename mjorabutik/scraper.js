const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.mjorabutik.com/indirim";
const baseURL = "https://www.mjorabutik.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Mjorabutik";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    const brand = "Mjorabutik";
    const name = cheerio(
      "#ProductDetailMain > div > div.RightDetail > div.ProductName > h1 > span",
      html
    )
      .first()
      .text()
      .trim();
    let orjprice =
      cheerio("#fiyat > span.spanFiyat", html)
        .first()
        .text()
        .trim()
        .replace("₺", "") + " TL";
    if (cheerio("#fiyat > span.spanFiyat", html)
      .first()
      .text()
      .trim() === '') {
      orjprice =
        cheerio("#fiyat2 > span.spanFiyat", html)
          .first()
          .text()
          .trim()
          .replace("₺", "") + " TL";
    }
    let price =
      cheerio("#indirimliFiyat > span.spanFiyat", html)
        .first()
        .text()
        .trim()
        .replace("₺", "") + " TL";
    if (cheerio("#indirimliFiyat > span.spanFiyat", html)
        .first()
        .text()
        .trim() == "") {
      price = orjprice;
    }
    let script;
    for (let i = 0; i < $("script").length; i++) {
      const element = $("script")[i];
      if (element.children[0]?.data?.includes("var productDetailModel = ")) {
        script = JSON.parse(
          element?.children[0]?.data
            .split("var productDetailModel = ")[1]
            .split(";//]]")[0]
            .split(";")[0]
        );
      }
    }
    const colors = script.productVariantData.map((v) => {
      if (v.ekSecenekTipiTanim === "Renk") {
        return v.tanim;
      }
    });
    let sizes = script.productVariantData.map((v) => {
      if (v.ekSecenekTipiTanim === "beden " && v.stokAdedi > 0) {
        return v.tanim;
      }
    });
    if (sizes.filter(e => e).length === 0) {
      sizes = script.productVariantData.map((v) => {
        if (v.ekSecenekTipiTanim === "BEDEN " && v.stokAdedi > 0) {
          return v.tanim;
        }
      });
    }
    const description = cheerio("div#divTabOzellikler > div.urunTabAlt", html)
      .text()
      .trim();
    $(".SmallImages .AltImgCapSmallImg").map((index, element) => {
      images.push(
        $(element).find("img").attr("src").replace("/thumb", "/buyuk")
      );
    });
    imageUrl = images[0];
    if (sizes.filter(e => e).length === 0) {
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
      sizes: sizes.filter((n) => n),
      colors: [...new Set(colors)].filter((n) => n),
      propiteam,
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
      "div#ProductPageProductList .ItemOrj.col-lg-4.col-md-4.col-sm-6.col-xs-6",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl =
        baseURL +
        cheerio(this).find("div.productItem div.productImage a").attr("href");
      urls.push(productUrl);
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
