const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.modatrend.com.tr/yeni-urunler";
const baseURL = "https://www.modatrend.com.tr";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: {
        Cookie: "CultureSettings=H4sIAAAAAAAEAAXBSaJDMAAA0ANZVExlSamk5qLFTqqJeSjfdPr%2fXp%2fLitlk24nTU%2fulGbppxMMrfXaYexv73eaP4EFCetoFDGWLeoCK7etTNt0WhJWviOU%2bTNO4AorwbB6LEHCELwRIYbtY4WQUBIuLOiukcEqbt0Kdvdn4Z1vJkqnr8N7QXPGF49IRAm7ZNkrZxqlLtmVrGHfwHbkz961i8YTrwETQVK84cnlarIALSz%2fwpvp6PnUV6koi12xsVbU%2boBjHfs0sWzr6VqyFRKh6SRqijL%2brQu%2bkUg7y7unjieEM%2fsh2rO9nhhnivdhM2%2bWql3MbbeDAUvAB6yfZz0T76td6QWE6HSXdTVYPan6euhNdRs0G6%2bhGU4N%2bj763K2KqkWa02yX%2bu2cW%2bAct9a%2bYYAEAAA%3d%3d",
      },
    });
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Modatrend";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    const brand = "Modatrend";
    const name = cheerio(
      "#ProductDetailMain > div > div.RightDetail > div.ProductName > h1 > span",
      html
    )
      .first()
      .text()
      .trim();
      const orjprice =
      cheerio("#fiyat > span.spanFiyat", html)
        .first()
        .text()
        .trim()
        .replace("₺", "") + " TL";
    console.log(orjprice)
    let price = 
    cheerio("#indirimliFiyat > span.spanFiyat", html)
      .first()
      .text()
      .trim()
      .replace("₺", "") + " TL";
    console.log(price)
    if (price == "") {
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
    const colors = [$("#divTabOzellikler > div > div > div.teknikDetayItem.renk > div.t2 > span").text()];
    const sizes = script.productVariantData.map((v) => {
      if (v.ekSecenekTipiTanim === "Numara" && v.stokAdedi > 0) {
        return v.tanim;
      }
    });
    const description = cheerio("div#divTabOzellikler > div.urunTabAlt", html)
      .text()
      .trim();
    $(".SmallImages .AltImgCapSmallImg").map((index, element) => {
      images.push(
        $(element).find("img").attr("src").replace("/thumb", "/buyuk")
      );
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
        Cookie: "TicimaxReferer=referer=https://www.modatrend.com.tr/bayan-sandalet----a051-siyah-11586?currency=try",
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
    console.log(urls.length)
    // return await getProduct(urls[0], link);
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
