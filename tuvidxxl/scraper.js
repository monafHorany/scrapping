const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.tuvidxxl.com/dis-giyim";
const baseURL = "https://www.tuvidxxl.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: {
        Cookie: "CultureSettings=H4sIAAAAAAAEAAXBybZDMAAA0A%2byaNCmLCkxNqbXBDukRShHDS1f%2f%2b41JGR9ULqt30m%2fFbSm6PfcY2Yv1z5nF7xF4qERHBXU%2bT4BOo3JxJCGQQdkPG7QJHHBTfAChgItr7cI2pQPdiWFNOBPN9SkdjNxXkXilywfaceLCpX9BLseWJFGK30uoIj0Qct9pFOnqbfEfmt9eIgcBixsu3Ri9f6KU%2bHwB%2b%2b2dwPA463lD9UX1H2mheGNwetQMglrWU9iwQylQRLelNX9XFQ0N6DTRJXW7DAPPOqj9NeQ2PQx4o%2fRTuX1JplXvHRHop5cyUOB6vChYdFZr%2bUhjNL5%2bo1lpjdoySJRX9oy4mJ7YTCw7mqQnD7S%2bnQ7eLbzUn5ng5ik%2fD5mNiSHwImdg7ru%2fgEZUbIOYAEAAA%3d%3d",
      },
    });
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Tuvidxxl";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    const brand = "Tuvidxxl";
    const name = cheerio(
      "#ProductDetailMain > div > div.RightDetail > div.ProductName > h1 > span",
      html
    )
      .first()
      .text()
      .trim();
    let orjprice =
      cheerio("#fiyat2 > span.spanFiyat", html)
        .first()
        .text()
        .trim()
        .replace("₺", "") + " TL";
    let price =
      cheerio("#fiyat2 > span.spanFiyat", html)
        .first()
        .text()
        .trim()
        .replace("₺", "") + " TL";
    if (price == "") {
      price = orjprice;
    }
    if (orjprice.includes(".")) {
      orjprice = orjprice.replace(".", "")
    }
    if (price.includes(".")) {
      price = price.replace(".", "")
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
    const colors = [$("#divTabOzellikler > div > div > div.teknikDetayItem.renk > div.t2 > span").text()];
    const sizes = script.productVariantData.map((v) => {
      if (v.ekSecenekTipiTanim === "Beden" && v.stokAdedi > 0) {
        return v.tanim;
      }
    });
    const description = cheerio("#divTabOzellikler > div > table > tbody", html).text()
      .trim() + cheerio("#divTabOzellikler > div > ul", html).text()
        .trim()

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
    const response = await axios.get(link, {
      headers: {
        Cookie: "CultureSettings=H4sIAAAAAAAEAAXBybZDMAAA0A%2byaNCmLCkxNqbXBDukRShHDS1f%2f%2b41JGR9ULqt30m%2fFbSm6PfcY2Yv1z5nF7xF4qERHBXU%2bT4BOo3JxJCGQQdkPG7QJHHBTfAChgItr7cI2pQPdiWFNOBPN9SkdjNxXkXilywfaceLCpX9BLseWJFGK30uoIj0Qct9pFOnqbfEfmt9eIgcBixsu3Ri9f6KU%2bHwB%2b%2b2dwPA463lD9UX1H2mheGNwetQMglrWU9iwQylQRLelNX9XFQ0N6DTRJXW7DAPPOqj9NeQ2PQx4o%2fRTuX1JplXvHRHop5cyUOB6vChYdFZr%2bUhjNL5%2bo1lpjdoySJRX9oy4mJ7YTCw7mqQnD7S%2bnQ7eLbzUn5ng5ik%2fD5mNiSHwImdg7ru%2fgEZUbIOYAEAAA%3d%3d",
      },
    });

    const outerhtml = response.data;

    const dataTable = cheerio(
      "div#ProductPageProductList .ItemOrj",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl =
        baseURL +
        cheerio(this).find("div.productItem div.productImage a").attr("href");
      urls.push(productUrl);
    });
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
