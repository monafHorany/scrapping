const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.olalook.com.tr/yeniurunler";
const baseURL = "https://www.olalook.com.tr";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Olalook";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    const brand = "Olalook";
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
    orjprice === '' ? orjprice = cheerio("#kdvliFiyat > span.spanFiyat", html)
      .first()
      .text()
      .trim() : orjprice = cheerio("#fiyat > span.spanFiyat", html)
        .first()
        .text()
        .trim();
    let price =
      cheerio("#kdvliFiyat > span.spanFiyat", html)
        .first()
        .text()
        .trim() === "" ? cheerio("#indirimliFiyat > span.spanFiyat", html)
          .first()
          .text()
          .trim() : cheerio("#kdvliFiyat > span.spanFiyat", html)
            .first()
            .text()
            .trim();
    if (price === '') {
      price = cheerio("#fiyat2 > span.spanFiyat", html)
        .first()
        .text()
        .trim()
    }
    if (price == "") {
      price = orjprice;
    }
    if (orjprice == "") {
      orjprice = price;
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
      if (v.ekSecenekTipiTanim === "Renk" && v.stokAdedi > 0) {
        return v.tanim;
      }
    });
    const sizes = script.productVariantData.map((v) => {
      if (v.ekSecenekTipiTanim === "Beden" && v.stokAdedi > 0) {
        return v.tanim;
      }
    });
    const description = cheerio("div#divTabOzellikler > div.urunTabAlt", html)
      .text()
      .trim();
    $(".SmallImages .AltImgCapSmallImg").map((index, element) => {
      images.push(
        $(element).find("img").data("original").replace("/thumb", "/buyuk")
      );
    });
    imageUrl = images[0];
    if (sizes.filter((n) => n).length === 0) {
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
      colors: colors.filter((n) => n),
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
