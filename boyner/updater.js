const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.boyner.com.tr/kadin-elbise-modelleri-c-100101";
const baseURL = "https://www.boyner.com.tr";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL);
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Boyner";
    const group_url = link;
    let script = JSON.parse($('script:contains("{"props":{"pageProps"")')[0].children[0].data);
    const colors = [];
    const sizes = script.props.pageProps.initialState.products.detail.data.SelectionList[0].OptionList?.map(m => {
      if (m.NoStock === false) {
        return m.ValueText
      }
    })
    const images = script.props.pageProps.initialState.products.detail.data.ImageSetList.map(m => m.ImageList[0].Path);
    const name = script.props.pageProps.initialState.products.detail.data.DisplayName
    const orjprice = script.props.pageProps.initialState.products.detail.data.StrikeThroughPriceToShowOnScreen ? script.props.pageProps.initialState.products.detail.data.StrikeThroughPriceToShowOnScreen : script.props.pageProps.initialState.products.detail.data.ActualPriceToShowOnScreen ? script.props.pageProps.initialState.products.detail.data.ActualPriceToShowOnScreen : script.props.pageProps.initialState.products.detail.data.CampaignPrice;
    const price = script.props.pageProps.initialState.products.detail.data.ActualPriceToShowOnScreen ? script.props.pageProps.initialState.products.detail.data.ActualPriceToShowOnScreen : script.props.pageProps.initialState.products.detail.data.CampaignPrice;
    const imageUrl = script.props.pageProps.initialState.products.detail.data.ImageSetList[0].ImageList[0].Path;
    const description = $("div.product-information-card_infoText__tuXRX").text()
    if (sizes.filter((n) => n).length < 1) {
      return productsDetails
    }
    productsDetails.push({
      name,
      orjprice: orjprice + " TL",
      price: price + " TL",
      description,
      imageUrl,
      prodURL,
      sizes: sizes.filter((n) => n),
      colors: colors.filter((n) => n),
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
