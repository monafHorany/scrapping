const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.n11.com/erkek-giyim-aksesuar/takim-elbise";
const baseURL = "https://www.n11.com";

async function getProduct(prodURL, link, priceContainer) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "N11";
    const PQ = cheerio.load(priceContainer);
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const name = $("h1.proName").text();
    let orjprice = PQ("span.oldPrice")
      .first()
      .text()
      .trim();
    let price = PQ("span.newPrice")
      .first()
      .text()
      .trim();
    if (orjprice === '') {
      orjprice = price
    }
    if (price == "") {
      price = orjprice;
    }

    let script;
    for (let i = 0; i < $("script").length; i++) {
      const element = $("script")[i];
      if (element.children[0]?.data?.includes("var skuList = ")) {
        script = JSON.parse(
          element?.children[0]?.data
            .split("var skuList = ")[1]
            .split(";")[0]
        );
      }
    }
    if (!script) {
      return productsDetails
    }
    if (script.properties === undefined) {
      return productsDetails
    }
    if (script.properties.find(n => n.name === 'Beden')) {
      sizes.push(...script.properties.find(n => n.name === 'Beden').values)
    } else if (script.properties.find(n => n.name === 'Numara')) {
      sizes.push(...script.properties.find(n => n.name === 'Numara').values)
    }
    else {
      sizes.push("One Size")
    }
    const description = $("#unf-info > div.unf-info-context").text();
    $("#thumbSlider > div").each((i, elm) => {
      images.push($(elm).data("full"))
    })
    const imageUrl = images[0]
    colors.push($("span#js-product-variant__attributeName").first().text().trim())
    if (sizes.filter((n) => n).length < 1) {
      return productsDetails
    }
    productsDetails.push({
      name,
      imageUrl,
      orjprice,
      price,
      description,
      images: images.filter((n) => n),
      prodURL,
      sizes: sizes.length > 0 ? sizes.filter((n) => n) : [],
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
    const categoryId = Number(dataTable("#categoryId").attr("value"))
    if (link.includes("?ipg=")) {
      const pageNumber = link.split("?ipg=")[1];
      const response = await axios.get(`https://www.n11.com/searchCategoryForPagination/${categoryId}?pg=${pageNumber}`);

      const outerhtml = response.data;

      const dataTable = cheerio.load(outerhtml);
      const priceContainer = [];
      const wrapper = dataTable("#listingInfiniteScrollResult > .column");

      for (let i = 0; i < wrapper.length; i++) {
        const element = wrapper[i];
        const productUrl = dataTable(element).find("a").first().attr("href");
        priceContainer.push(dataTable(element).find("div.priceContainer").html())
        urls.push(productUrl);
      }
      return Promise.all(urls.map((url, index) => getProduct(url, link, priceContainer[index])));

    } else {
      const response = await axios.get(link);

      const outerhtml = response.data;

      const dataTable = cheerio.load(outerhtml);
      const priceContainer = [];
      const wrapper = dataTable("#listingUl > .column");

      for (let i = 0; i < wrapper.length; i++) {
        const element = wrapper[i];
        const productUrl = dataTable(element).find("a").first().attr("href");
        priceContainer.push(dataTable(element).find("div.priceContainer").html())
        urls.push(productUrl);
      }
      return Promise.all(urls.map((url, index) => getProduct(url, link, priceContainer[index])));
    }
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
