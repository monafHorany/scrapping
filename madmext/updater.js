const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.madmext.com/Atlet";
const baseURL = "https://www.madmext.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: {
        Cookie: "CultureSettings=H4sIAAAAAAAEAAXB2ZZDMAAA0A%2fyoLbgsYhReyaWmDeqqJ3Sk%2fj6uVdUBssyQuEzhpjYW3nz1wCre5UhSdYSbChxhncmXof0adbp5uAQTWWVnV1EXNV7q%2faHv41nc%2fSr%2b8v8ub467I6SvhT%2bezzkjEQ9kOtr0VmLEvlel7rpuLpENDnGDBy7hh0CqPXYaV1naXFRa7wEJHA%2bI6S9JtFrd6rPea7mLe1449g4J6QzPIbuG3wLnZSVxQMh%2fV1rG2S6O7%2fYFt1DBk9bjaY2v2mxdqJA%2bush6030YAtrAlsQm21Ikz6lFJ4%2fisTfAS9Aw3YY4ftI2QEE3jv0O2ZMldd9T8VZX02coRb6SgcPWkJeOodzUYXZKx2w8U9rN%2fMryTgdCgV61qLTKBJ%2bGVxu%2fgNejIizYAEAAA%3d%3d",
      }
    });
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Madmext";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    const brand = "Madmext";
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
    if (cheerio("#fiyat > span.spanFiyat", html)
      .first()
      .text()
      .trim() === '') {
      orjprice =
        cheerio("#fiyat2 > span.spanFiyat", html)
          .first()
          .text()
          .trim()
    }
    let price =
      cheerio("#indirimliFiyat > span.spanFiyat", html)
        .first()
        .text()
        .trim()
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
    const colors = [
      script.productVariantData.find((e) => e.ekSecenekTipiTanim === "RENK")
        .tanim,
    ];
    const sizes = script.productVariantData.map((v) => {
      if (v.ekSecenekTipiTanim === "BEDEN" && v.stokAdedi > 0) {
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
    if (sizes.filter((n) => n).length < 1) {
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
