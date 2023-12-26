const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.paulmark.com.tr/yeni-gelenler-kadin";
const baseURL = "https://www.paulmark.com.tr";
async function getProductsData(link) {
  var productsDetails = [];
  try {
    const response = await axios.get(link);
    const outerhtml = response.data;
    const $ = cheerio.load(outerhtml);
    let script;
    for (let i = 0; i < $("script").length; i++) {
      const element = $("script")[i];
      if (element.children[0]?.data?.includes("var PRODUCT_ID			    = ")) {
        script = Number(
          element?.children[0]?.data
            .split("var PRODUCT_ID			    = ")[1].split("var")[0].split(";")[0].replace(/['"]+/g, ''))
      }
    }
    const { data: el } = await axios.get(`https://farktorapi.com/new/Fr-5500186/${script}`)

    productsDetails.push({
      name: el.name,
      imageUrl: "https://images.farktorcdn.com/img/780x1170/Library/Upl/5500186/Product/" + el.photo,
      orjprice: (el.priceMarket).toFixed(2) + " TL",
      price: (el.priceSale).toFixed(2) + " TL",
      description: el.desc,
      images: el.photos.map(i => ("https://images.farktorcdn.com/img/780x1170/Library/Upl/5500186/Product/" + i.photo)),
      prodURL: baseURL + "/" + el.seoUrl + "_" + el.productId,
      sizes: el.sizes.map(i => {
        if (i.qty > 0) {
          return i.name
        }
      }).filter(n => n),
      colors: el.colors.map(i => i.name),
      group_url: link,
      product_source: "Paulmark",
    })


    if (productsDetails[0].sizes.length === 0) {
      return productsDetails = []
    }

    return productsDetails;
  } catch (error) {
    console.log(error)
    productsDetails = [];
    return productsDetails;
  }
}
module.exports = {
  getProductsData,
};
