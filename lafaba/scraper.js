const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.lafaba.com/kadin-buyuk-beden";
const baseURL = "https://www.lafaba.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' }
    });
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html, { xmlMode: true });
    const product_source = "Lafaba";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    const brand = "Lafaba";
    const name = cheerio(
      "h1.product-name",
      html
    )
      .first()
      .text()
      .trim();
    const orjprice =
      cheerio("div.product-detail-page-detail-price-box.flex.items-center.mt-4.mb-4 > div > div", html)
        .first()
        .text()
        .trim()
        .replace("₺", "") + " TL";
    let price =
      cheerio("div.product-detail-page-detail-price-box.flex.items-center.mt-4.mb-4 > div > div", html)
        .first()
        .text()
        .trim()
        .replace("₺", "") + " TL";

    const colors = [];
    const sizes = [];


    const description = cheerio("div.product-detail-tabs-main > div > div > div > div.tab-content", html)
      .text()
      .trim();

    $("div.items-center.product-detail-page-variants.flex.flex-wrap  > div.py-1.px-4.mr-2.mb-2.variant-types.relative.border-transparent:not(.text-gray-400)").map((i, el) => {
      sizes.push($(el).text())
    })
    $("div.swiper-wrapper > div.swiper-slide").map((index, element) => {
      images.push(
        $(element).find(" div > span > noscript > img").attr("src")
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
  console.log(link)
  try {
    const response = await axios.get(link, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' }
    });
    const outerhtml = response.data;

    const dataTable = cheerio(
      "div.infinite-scroll-component div div.grid.grid-cols-2.gap-4 > div",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl =
        baseURL +
        cheerio(this).find("a").first().attr("href");
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