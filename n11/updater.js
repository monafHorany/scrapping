const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.n11.com/erkek-giyim-aksesuar/takim-elbise";
const baseURL = "https://www.n11.com";

async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "N11";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const name = $("h1.proName").text();


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
    const priceScript = JSON.parse($('script:contains(ecommerceGA4 = {"detail")')[0].children[0].data.split('ecommerceGA4 = {"detail":')[1].split("}.detail;")[0])
    let orjprice = priceScript.items[0].price;
    let price = priceScript.value;
    if (orjprice === '') {
      orjprice = price
    }
    if (price == "") {
      price = orjprice;
    }
    // return
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
      orjprice: orjprice + " TL",
      price: price + " TL",
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
