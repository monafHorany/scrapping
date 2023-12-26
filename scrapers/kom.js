const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.kom.com.tr/erkek-ev-giyim";
const baseURL = "https://www.kom.com.tr";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Kom";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const name = $("h1.ProductTitle.fontsdarkgray.mb-0").text();
    let orjprice = $("body > div.clearfix.no-horizontalscrolling > div > div.bannerDiv > div > div > div:nth-child(1) > div.col-lg-4.pt-1 > div.d-none.d-lg-block > div:nth-child(4) > div:nth-child(1) > span > span").first().text();
    let price = $("span.font-weight-bold.font-size-24-pixels.fontmsred").first().text();
    const description = $("div.card-body.mainbgcolor.AdjustHtml.font-size-15-pixels > ul > :nth-child(n+4)").text();
    $("div.col-lg-6.d-flex.justify-content-center.my-2.px-2").map(
      (index, element) => {
        images.push($(element).find("a").attr("href"));
      }
    );
    $("div.col-4.border.mx-1.my-1.text-center.fontsdarkgray.ProductSizeItem.px-0").map((index, element) => {
      sizes.push($(element).text());
    });

    if (orjprice === "") {
      orjprice = $("body > div.clearfix.no-horizontalscrolling > div > div.bannerDiv > div > div > div:nth-child(1) > div.col-lg-4.pt-1 > div.d-none.d-lg-block > div:nth-child(4) > div > span").text()
    }
    if (price === "") {
      price = orjprice
    }
    if (sizes.filter((n) => n).length === 0) {
      return productsDetails
    }
    productsDetails.push({
      name,
      imageUrl: images[0],
      orjprice,
      price,
      description,
      images,
      prodURL,
      sizes: sizes.filter((n) => n),
      colors: colors.filter((n) => n),
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
    const wrapper = dataTable("div#PorductHolderData div.my-2.px-0.pr-s.col-6.col-md-4.productdiv.itemPromotionHolderDetail");
    console.log(wrapper.length);
    for (let i = 0; i < wrapper.length; i++) {
      const element = wrapper[i];
      const productUrl = dataTable(element).find("a").attr("href");
      urls.push(baseURL + productUrl);
    }
    console.log(urls)
    // return getProduct(urls[0], link);
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
