const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.camasircity.com/plaj-giyim-377";
const baseURL = "https://www.camasircity.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: {
        Cookie: "CultureSettings=H4sIAAAAAAAEAAXB3dpCMAAA4AtyMH8lh7Iov2Ot6IzGoicTm0%2bu%2fnvfvPCOLB2XghHbfMVFtVuTU7zsv5eyipXbU6k3vi8w6vvZ%2f9usqH0AFJzMHwtulHiRbAiTkWoo6W%2f2MxVLHp8P8EPUlvtFZh7c%2fGXVgZU60tQv5crX9IMxpl6lmYc6jBIXs25AfIO12xdNA0O9b7lAdLfrFe9IByatYdVFCsaNUAAZRL41vN1%2bzkJB8JAhQ5l8zzecCFXeqz8twm%2b%2bTxB2M57cZkkRktubkwC9GAM9h4TLyyfXplDOMHDz7o1gjvOLOF89FUYjDQ5RaNCp6rRSX9vu%2bNTzRWtpVY42BQtS1CsSjqgf%2ft3GC7b3gNwdbLGkFAyMEkTsnWTFpF7BQz3TOvHEP1WkiPpgAQAA",
      },
    });
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Camasircity";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    const brand = "Camasircity";
    const name = cheerio(
      "#ProductDetailMain > div > div.RightDetail > div.ProductName > h1 > span",
      html
    )
      .first()
      .text()
      .trim();
    const orjprice =
      cheerio("span.spanFiyat", html)
        .first()
        .text()
        .trim()
        .replace("₺", "") + " TL";
    let price =
      cheerio("#indirimliFiyat > span.spanFiyat", html)
        .first()
        .text()
        .trim()
        .replace("₺", "") + " TL";
    if (cheerio("#indirimliFiyat > span.spanFiyat", html)
      .first()
      .text()
      .trim() === "") {
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
    const colors = [script.productVariantData[0].tanim];
    const sizes = script.productVariantData.map((v) => {
      if (v.ekSecenekTipiTanim === "Beden" && v.stokAdedi > 0) {
        return v.tanim;
      }
    });
    const description = cheerio("div#divTabOzellikler > div.urunTabAlt", html)
      .text()
      .trim();
    const image = cheerio(
      "div.fl.col-12.carousel-wrapper div.product-main-carousel",
      html
    ).html();
    $(".SmallImages .AltImgCapSmallImg").map((index, element) => {
      images.push(
        $(element).find("img").attr("src").replace("/thumb", "/buyuk")
      );
    });
    if (sizes.filter((n) => n).length < 1) {
      return productsDetails
    }
    imageUrl = images[0];
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
        Cookie: "CultureSettings=H4sIAAAAAAAEAAXB3dpCMAAA4AtyMH8lh7Iov2Ot6IzGoicTm0%2bu%2fnvfvPCOLB2XghHbfMVFtVuTU7zsv5eyipXbU6k3vi8w6vvZ%2f9usqH0AFJzMHwtulHiRbAiTkWoo6W%2f2MxVLHp8P8EPUlvtFZh7c%2fGXVgZU60tQv5crX9IMxpl6lmYc6jBIXs25AfIO12xdNA0O9b7lAdLfrFe9IByatYdVFCsaNUAAZRL41vN1%2bzkJB8JAhQ5l8zzecCFXeqz8twm%2b%2bTxB2M57cZkkRktubkwC9GAM9h4TLyyfXplDOMHDz7o1gjvOLOF89FUYjDQ5RaNCp6rRSX9vu%2bNTzRWtpVY42BQtS1CsSjqgf%2ft3GC7b3gNwdbLGkFAyMEkTsnWTFpF7BQz3TOvHEP1WkiPpgAQAA",
      },
    });

    const outerhtml = response.data;

    const dataTable = cheerio(
      "div#ProductPageProductList .ItemOrj.col-lg-4.col-md-4.col-sm-6.col-xs-6",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl =
        baseURL +
        cheerio(this).find("div.productItem div.productImage a").first().attr("href");
      urls.push(productUrl);
    });
    // console.log(urls.length)
    // return await getProduct(urls[0], link);
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
