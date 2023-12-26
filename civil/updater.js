const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.trendyol.com/erkek+ceket";
const baseURL = "https://www.trendyol.com";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    const productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const colors = [];
    const sizes = [];
    const imageUrl =
      "https://www.civilim.com" +
      $(".fb-triger").first().find("img").attr("src");

    const images = [];
    for (let i = 0; i < $(".fb-triger img").length; i++) {
      const element = $(".fb-triger img")[i];
      images.push("https://www.civilim.com" + $(element).attr("src"));
    }

    const name = $(".product-title").text();
    let price = $(
      "#ctl00_PortalContent_ctl00_TopPane > div.row.transitionfx > div.col-lg-12.col-md-12.col-sm-12.pdetail > div.product-price > div > div > span.price-sales"
    )
      .text()
      .split(" ")[0];
    let orjprice = $(
      "#ctl00_PortalContent_ctl00_TopPane > div.row.transitionfx > div.col-lg-12.col-md-12.col-sm-12.pdetail > div.product-price > div > span.price-standard"
    )
      .text()
      .split(" ")[0];
    if (orjprice === '') {
      orjprice = price
    }
    let script; //excute product info from script and json parse it
    for (let i = 0; i < $("script").length; i++) {
      const element = $("script")[i];
      if (element.children[0]?.data?.includes("var jspValue = ")) {
        script = JSON.parse(
          element?.children[0]?.data
            ?.split("var jspValue = ")[1]
            .replace(";", "")
        );
      }
    }

    //fetching colors
    const { data: colorResponse } = await axios.get(
      `https://www.civilim.com/skins/shared/svc/prd-detail.aspx?type=grp-items&prdid=${script.ProductID}&grp=${script.GroupCode}`
    );
    const $$ = cheerio.load(colorResponse);

    for (let c = 0; c < $$("#prd-group-items .item").length; c++) {
      const element = $$("#prd-group-items .item")[c];
      colors.push($$(element).find("span").text());
    }
    //fetching sizes
    const { data: sizeResponse } = await axios.get(
      `https://www.civilim.com/skins/shared/svc/prd-variant.aspx?type=variants&prdid=${script.ProductID}&defid=${script.VariantDefID}`
    );
    const $$$ = cheerio.load(sizeResponse);
    for (let s = 0; s < $$$("a").length; s++) {
      const element = $$$("a.vprp-enabled:not(.nostock)")[s];
      sizes.push($$$(element).data("value"));
    }
    productsDetails.push({
      name,
      orjprice,
      price,
      imageUrl,
      images,
      prodURL,
      sizes: sizes.filter((n) => n),
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
