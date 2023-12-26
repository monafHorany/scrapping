const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.hepsiburada.com/erkek-gomlekleri-c-12087280";
const baseURL = "https://www.hepsiburada.com";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Hepsiburada";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const name = $("h1.product-name").text().trim();
    let orjprice = $("#originalPrice")
      .first()
      .text()
      .trim();
    let price = '';
    if (orjprice === '') {
      orjprice = price
    }
    if (price == "") {
      price = orjprice;
    }
    $(".variant-container.left.overflow > .radio-variant").each((i, elm) => {
      sizes.push($(elm).text().trim())
    })
    const description = $("#productTechSpecContainer").text().replace(/[\n\t\r]/g, "").trim();
    $("div#productDetailsCarousel > .cloudzoom.extendable ").map((index, element) => {
      images.push($(element).find("img").data("src"));
    });
    const imageUrl = $("#productDetailsCarousel > a:nth-child(1) > picture > img").attr("src")
    $("div.variant-container > .radio-variant").each((i, elm) => {
      colors.push($(elm).find("img").attr("alt")
      )
    })
    productsDetails.push({
      name,
      imageUrl,
      orjprice,
      price,
      description,
      images: images.filter((n) => n),
      prodURL,
      sizes: sizes.length > 0 ? sizes.filter((n) => n) : [],
      colors: colors.filter((n) => n),
      group_url,
      product_source,
    });
    console.log(productsDetails)

    return productsDetails;
  } catch (error) {
    console.log(error);
    productsDetails = [];
    return productsDetails;
  }
}

async function getProductsData(link, urls = []) {
  try {
    if (link.includes("?sayfa=")) {
      const pageNumber = link.split("?sayfa=")[1];
      const response = await axios.get(link + "?sayfa=" + pageNumber);

      const outerhtml = response.data;

      const dataTable = cheerio.load(outerhtml);
      const wrapper = dataTable(`#${pageNumber} > .productListContent-zAP0Y5msy8OHn5z7T_K_`);

      for (let i = 0; i < wrapper.length; i++) {
        const element = wrapper[i];
        const productUrl = dataTable(element).find("a").first().attr("href");
        urls.push(productUrl);
      }
      console.log(urls.length)
      // return Promise.all(urls.map((url, index) => getProduct(url, link)));

    } else {
      const response = await axios.get(link);

      const outerhtml = response.data;

      const dataTable = cheerio.load(outerhtml);
      const wrapper = dataTable("#1 > .productListContent-zAP0Y5msy8OHn5z7T_K_");

      for (let i = 0; i < wrapper.length; i++) {
        const element = wrapper[i];
        const productUrl = dataTable(element).find("a").first().attr("href");
        // console.log(productUrl)
        if (productUrl.startsWith("https://")) {
          urls.push(productUrl)
        } else {
          urls.push(baseURL + productUrl);
        }
      }
      // console.log(urls[0]);
      // return getProduct(urls[0], link);

      return Promise.all(urls.map((url, index) => getProduct(url, link)));

    }

    console.log(link);
    // return getProduct(urls[0], link, priceContainer[0]);
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
