const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.nike.com/tr/w/yeni-cikanlar-3n82y";
const baseURL = "https://www.nike.com/tr";

async function getProduct(prodURL, link) {
  // console.log(encodeURI(prodURL))
  try {
    const response = await axios.get(encodeURI(prodURL));
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const variants = JSON.parse($('script:contains("props")').html());
    if (!variants) return productsDetails;
    const product_source = "Nike";
    const group_url = link;
    const colors = [];
    const sizes = [];
    const images = [];
    const name = variants.props.pageProps.initialState.Threads.products[variants.props.pageProps.initialState.App.styleColor].fullTitle
    const orjprice = variants.props.pageProps.initialState.Threads.products[variants.props.pageProps.initialState.App.styleColor].fullPrice
    const price = variants.props.pageProps.initialState.Threads.products[variants.props.pageProps.initialState.App.styleColor].currentPrice
    const imageUrl = $("#pdp_6up-hero").attr("src");
    const description = $(
      "#RightRail > div > span > div > div > p"
    ).text();
    $(".dOnizleme li").map((index, element) => {
      images.push(
        "https://www.sense.com.tr/" + $(element).find("a").attr("href")
      );
    });

    if (variants.props.pageProps.initialState.Threads.products[variants.props.pageProps.initialState.App.styleColor].skus.length > 0) {
      variants.props.pageProps.initialState.Threads.products[variants.props.pageProps.initialState.App.styleColor].skus.forEach(element => {
        if (variants.props.pageProps.initialState.Threads.products[variants.props.pageProps.initialState.App.styleColor].availableSkus.findIndex(i => i.id === element.skuId) !== -1) {
          sizes.push(element.localizedSize);
        }
      });
    }
    else {
      return productsDetails;
    }

    variants.props.pageProps.initialState.Threads.products[variants.props.pageProps.initialState.App.styleColor].nodes[0].nodes.forEach(element => {
      if (element.subType === 'image') {
        images.push((element.properties.squarishURL).replace("t_default", "t_PDP_1280_v1"))
      }
    });
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
    const response = await axios.get(link);
    const outerhtml = response.data; const dataTable = cheerio.load(outerhtml);
    const wrapper = dataTable("div#skip-to-products div.product-card.product-grid__card");
    for (let i = 0; i < wrapper.length; i++) {
      const element = wrapper[i];
      const productUrl = dataTable(element).find("div.product-card__body figure a").attr("href");
      urls.push(productUrl);
    }
    console.log(urls.length)
    // return getProduct(urls[3], link);
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
