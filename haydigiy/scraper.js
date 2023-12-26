const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.haydigiy.com/alt-giyim";
const baseURL = "https://www.haydigiy.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Haydigiy";
    const group_url = link;
    const name = $("#product-details-form > div.product-details-container > div.overview > div.overview-head > div.product-name > h1").text();
    let orjprice = $("#product-details-form > div.product-details-container > div.overview > div.overview-head > div.prices > div.product-price > div.product-old-price > span").text()

    let price = $("#product-details-form > div.product-details-container > div.overview > div.overview-head > div.prices > div.product-price > div.product-price > span").text()

    if (price == "") {
      price = orjprice;
    }
    if (orjprice == "") {
      orjprice = price;
    }
    const description = $("#product-details-form > div.product-details-container > div.overview > div.accordion-container > div > section > div > div > table").text();
    const propiteam = "item";
    var images = [];
    $(
      "div.swiper-master.gallery-top div.swiper-wrapper div.swiper-slide"
    )
      .find("a")
      .map((index, element) => {
        images.push($(element).attr("href"));
      });
    var imageUrl = images[0];

    const colors = [];
    const sizes = [];
    $("ul.radio-list li").map((index, element) => {
      $(element)
        .find("input")
        .not(function (i, el) {
          // this === el
          return $(this).data("qty") === "0,0000";
        })
        .each((i, e) => {
          sizes.push($(e).next().text());
        });
    });
    if (sizes.filter((n) => n).length === 0) {
      return productsDetails
    }
    productsDetails.push({
      name,
      orjprice,
      price,
      description,
      imageUrl,
      prodURL,
      sizes,
      propiteam,
      colors,
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
  const response = await axios.get(link);
  const outerhtml = response.data;

  const dataTable = cheerio.load(
    outerhtml
  );

  let categotyId = 0
  try {
    for (let i = 0; i < dataTable("script").length; i++) {
      const element = dataTable("script")[i];
      // console.log(element)
      if (element.children[0]?.data?.includes("var categoryId = ")) {
        categotyId =
          element?.children[0]?.data
            .split("var categoryId = ")[1]
            .split(";")[0]
      }
    }
  } catch (error) {
    console.log(error);
  }
  try {
    let pageNumber = 1
    while (true) {
      if (link.includes("?f=")) {
        const sub = link.split("?f=")[1]
        const { data } = await axios.get(`https://www.haydigiy.com/Catalog/AjaxCategory/?f=${sub}&categoryId=${categotyId}&pageNumber=${pageNumber}&pageSize=24`)
        pageNumber++
        // console.log(data)
        const $ = cheerio.load(data);
        const dataTable = $(
          ".product-item",
        );
        dataTable.each(function () {
          const productUrl = cheerio(this)
            .find("a")
            .attr("href");
          urls.push(baseURL + productUrl);
        });
        if (data === '\r\n') {
          return Promise.all(urls.map((url) => getProduct(url, link)));
        }


      } else {
        const { data } = await axios.get(`https://www.haydigiy.com/Catalog/AjaxCategory/?categoryId=${categotyId}&pageNumber=${pageNumber}&pageSize=24`)
        pageNumber++
        const $ = cheerio.load(data);
        const dataTable = $(
          ".product-item",
        );
        dataTable.each(function () {
          const productUrl = cheerio(this)
            .find("a")
            .attr("href");
          urls.push(baseURL + productUrl);
        });
        if (data === '\r\n') {
          return Promise.all(urls.map((url) => getProduct(url, link)));
        }


      }
    }
  } catch (error) {
    console.log(error)
  }
}
module.exports = {
  getProductsData,
};
