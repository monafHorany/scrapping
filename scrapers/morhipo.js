const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.morhipo.com/erkek-kazak";
const baseURL = "https://www.morhipo.com";
async function getProduct(prodURL, link) {
  const response = await axios.get(prodURL);
  var productsDetails = [];
  const html = response.data;
  const $ = cheerio.load(html);
  let data;
  let variants;
  for (let i = 0; i < $("script").length; i++) {
    const element = $("script")[i];
    if (element.children[0]?.data?.includes("var viewed_product = [{")) {
      data = element?.children[0]?.data;
    }
  }
  if (data === undefined) {
    return productsDetails;
  }
  let prodID = $("head > title").text().split(" - ")[1].split("|")[0].trim();
  if (prodID === undefined) {
    return productsDetails;
  }
  try {
    for (let i = 0; i < $("script").length; i++) {
      const element = $("script")[i];
      if (element.children[0]?.data?.includes("var fullDetailsForSk=")) {
        variants = JSON.parse(
          element?.children[0]?.data
            .split("var fullDetailsForSk= ")[1]
            .replace(";", "")
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
  const name = $(
    ".col-600-12.col-xs-7.col-sm-6.col-md-7.col-lg-6 .product-detail-container .row.no-margin .col-xs-12.col-sm-12 h1 .prod-subtitle.text-muted"
  ).text();

  const product_source = "Morhipo";
  const group_url = link;
  let orjprice = "";

  let price = "";

  try {
    if ($(".actual-price.text-muted.bigger.push-right").first().text() == "") {
      orjprice = $(".final-price.push-right.text-danger").first().text();
    } else {
      orjprice = $(".actual-price.text-muted.bigger.push-right").first().text();
    }
    if (
      $(".final-price.push-right.text-danger").first().text() == "" &&
      $(".actual-price.text-muted.bigger.push-right").first().text() == ""
    ) {
      orjprice = $(
        "#product-price > div.row.no-margin > div > div.price-row > span > strong"
      ).text();
    }
  } catch (error) {
    console.log(error);
  }
  try {
    if ($(".final-price.push-right.text-muted.bigger").first().text() === "") {
      price = $(".final-price.push-right.text-danger").first().text();
    } else {
      price = $(".final-price.push-right.text-muted.bigger").first().text();
    }
    if (
      $(
        "#product-price > div.row.no-margin > div > div.price-row > div > span.badge-price"
      )
        .first()
        .text() !== ""
    ) {
      price = $(
        "#product-price > div.row.no-margin > div > div.price-row > div > span.badge-price"
      )
        .first()
        .text();
    }
  } catch (error) {
    console.log(error);
  }

  const colors = [];
  const sizes = [];
  const images = [];


  sizes.push(variants.Colors[0].AvailableSizes.map((s) => s.Name));
  colors.push(variants.Colors[0].Name);
  try {
    const description = $("#aboutprodtab > div > div > div > p:nth-child(3)").text();
    $(
      ".col-600-12.col-xs-5.col-sm-6.col-md-5.col-lg-6 #product-detail-image-con .prod-carousel-con.hidden-xs #carousel .slides li a"
    ).map((index, element) => {
      images.push($(element).attr("href"));
    });
    const imageUrl = $(
      ".col-600-12.col-xs-5.col-sm-6.col-md-5.col-lg-6 #product-detail-image-con .prod-carousel-con.hidden-xs #carousel .slides li a"
    )
      .first()
      .attr("href");
    if (sizes.length === 0) {
      return productsDetails;
    }
    (price = price === "" ? orjprice : price),
      productsDetails.push({
        name,
        imageUrl,
        orjprice,
        price,
        description,
        images,
        prodURL,
        sizes: sizes.filter((n) => n).flat(),
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
    const wrapper = dataTable(
      "#products > li.col-controlled.col-xxs-6.col-xs-6.col-sm-3.col-md-3.col-lg-3.column"
    );
    for (let i = 0; i < wrapper.length; i++) {
      const element = wrapper[i];
      const productUrl = dataTable(element).find("div a").attr("href");
      urls.push("https://www.morhipo.com" + productUrl);
    }
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
