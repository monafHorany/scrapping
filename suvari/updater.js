const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.suvari.com.tr/tr/gomlek";
const baseURL = "https://www.suvari.com.tr";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Suvari";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const name = $(".ProductHeader.product-name").text();
    const orjprice = $(".PriceOld.old-price").first().text().split(" ")[0];
    const price = $(".Price.sale-price").first().text().split(" ")[0];
    const main_image = $(
      ".ProductDetailsMainImage.main-product-images ul.main-image-list li"
    )
      .first()
      .attr("src");
    const description = $(".product-information").text();
    $(".ProductDetailsMainImage.main-product-images ul.main-image-list li").map(
      (index, element) => {
        images.push($(element).attr("href"));
      }
    );
    $(".product-sizes .size-option-wrapper").map((index, element) => {
      sizes.push($(element).find("a").text());
    });
    $(
      ".ItemColorsContainer.product-colors .ColorOption.color-option-wrapper"
    ).map((index, element) => {
      colors.push($(element).find("a").attr("title"));
    });

    productsDetails.push({
      name,
      main_image,
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
