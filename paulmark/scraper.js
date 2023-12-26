const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.paulmark.com.tr/yeni-gelenler-kadin";
const baseURL = "https://www.paulmark.com.tr";
async function getProductsData(link, urls = []) {
  var productsDetails = [];
  try {
    const response = await axios.get(link);
    const outerhtml = response.data;
    const $ = cheerio.load(outerhtml);
    let script;
    for (let i = 0; i < $("script").length; i++) {
      const element = $("script")[i];
      if (element.children[0]?.data?.includes("var NAV_ID				=	")) {
        script = Number(
          element?.children[0]?.data
            .split("var NAV_ID				=	")[1]
            .split("var")[0].replace(/['"]+/g, ''))
      }
    }
    let pageNum = 1;
    if (link.includes("?page=")) {
      pageNum = link.split('?page=')[1].split('&')[0]
    }
    const { data: { products } } = await axios.get(`https://farktorapi.com/new/?company=Fr-5500186&category=${script}&page=${pageNum}&pageSize=60&sort=photoUpdate,desc&v=4053`)
    for (let i = 0; i < products.length; i++) {
      const el = products[i];
      let discountPerc = null;
      if (el.campaigns.length > 0) {
        discountPerc = el.campaigns[0].discount
      }
      productsDetails.push({
        name: el.name,
        imageUrl: "https://images.farktorcdn.com/img/780x1170/Library/Upl/5500186/Product/" + el.photo,
        orjprice: (discountPerc ? el.priceSale : el.priceMarket).toFixed(2) + " TL",
        price: (discountPerc ? el.priceSale * (100 - discountPerc) / 100 : el.priceSale).toFixed(2) + " TL",
        description: el.desc,
        images: el.photos.map(i => ("https://images.farktorcdn.com/img/780x1170/Library/Upl/5500186/Product/" + i.photo)),
        prodURL: baseURL + "/" + el.seoUrl + "_" + el.productId,
        sizes: el.sizes.map(i => {
          if (i.qty > 0) {
            if (i.name === "") {
              return "STD"
            }
            return i.name
          }
        }).filter(n => n),
        colors: el.colors.map(i => i.name),
        group_url: link,
        product_source: "Paulmark",
      })
    }
    productsDetails = productsDetails.filter(e => (e.sizes.length !== 0))
    return productsDetails;
  } catch (error) {
    console.log(error);
    productsDetails = [];
    return productsDetails;
  }
}
module.exports = {
  getProductsData,
};
