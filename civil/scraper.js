const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.civilim.com/cocuk-giyim";
const baseURL = "https://www.civilim.com/";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    const productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Civil";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const imageUrl =
      $(".fb-triger").first().find("img").attr("src");

    const images = [];
    for (let i = 0; i < $(".fb-triger img").length; i++) {
      const element = $(".fb-triger img")[i];
      images.push($(element).attr("src"));
    }
    const name = $(".product-title").text();
    let price = $(
      "#ctl00_PortalContent_ctl00_TopPane > div.row.transitionfx > div.col-lg-12.col-md-12.col-sm-12.pdetail > div.product-price > div > div > span.price-sales"
    )
      .text();
    let orjprice = $(
      "#ctl00_PortalContent_ctl00_TopPane > div.row.transitionfx > div.col-lg-12.col-md-12.col-sm-12.pdetail > div.product-price > div > span.price-standard"
    )
      .text();
    if (orjprice === '') {
      orjprice = price
    }
    const description = $(".tab-pane.active").text();
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
    const brand = script.Brand;

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
      brand,
      orjprice,
      price,
      description,
      imageUrl,
      images,
      prodURL,
      sizes: sizes.filter((n) => n),
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

async function getProductsData(link, urls = []) {
  try {
    const response = await axios.get(link);

    const outerhtml = response.data;
    const dataTable = cheerio.load(outerhtml);
    const wrapper = dataTable(".listitempage .item.itemauto");
    for (let i = 0; i < wrapper.length; i++) {
      const element = wrapper[i];
      const productUrl =
        "https://www.civilim.com" + dataTable(element).data("dlurl");
      urls.push(productUrl);
    }
    // return await getProduct(urls[0], link);
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getProductsData,
};
