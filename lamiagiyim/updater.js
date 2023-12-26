const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.lamiagiyim.com/kategori/abiye";
const baseURL = "https://www.lamiagiyim.com";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Lamiagiyim";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const name = $("#product-detail-container > div.product-area-top > div > div:nth-child(2) > div > div.product-primary-info > div.product-title > h1").text().trim();
    let orjprice = $("#product-detail-container > div.product-area-top > div > div:nth-child(2) > div > div.product-primary-info > div.product-price-container.has-discount > div.product-price").text().trim();
    let price = $("#product-detail-container > div.product-area-top > div > div:nth-child(2) > div > div.product-primary-info > div.product-price-container.has-discount > div.product-discounted-price").first().text().trim();
    const imageUrl =
      $("#primary-image").attr("src");
    const description = $(
      "#product-detail-container > div.product-area-bottom > div.product-detail-tab > div.product-detail-tab-content > div.active > div"
    ).text().trim();
    $("#product-thumb-image > div.thumb-item").map((index, element) => {
      images.push(
        $(element).find("a").data("image")
      );
    });
    $("#product-detail-container > div.product-area-top > div > div:nth-child(2) > div > div.product-third-info > div.product-options > div.product-options-content > div > div > div.variant-list > span.variant-text:not(.variant-no-stock)").map((index, element) => {
      sizes.push($(element).text().trim());
    });

    if (orjprice.length > 6 || price.length > 6) {
      orjprice = orjprice.replace(".", "").split(",")[0] + " TL";
      price = price.replace(".", "").split(",")[0] + " TL";
    }

    if (sizes.length === 0) return productsDetails;
    productsDetails.push({
      name,
      imageUrl,
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
