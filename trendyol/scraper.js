const axios = require("axios");
var cheerio = require("cheerio");
const fs = require('fs');
const path = require("path");
let xlsx = require("json-as-xlsx")
const url = "https://www.trendyol.com/sr/kadin-t-shirt-x-g1-c73";
const baseURL = "https://www.trendyol.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  const prodID = prodURL.split("-").at("-1");
  const { data } = await axios.get(
    `https://www.tozlu.com/api/product/GetProductList?c=trtry0000&FilterJson=%7B%22CategoryIdList%22%3A%5B%5D%2C%22BrandIdList%22%3A%5B%5D%2C%22SupplierIdList%22%3A%5B%5D%2C%22TagIdList%22%3A%5B%5D%2C%22TagId%22%3A-1%2C%22FilterObject%22%3A%5B%5D%2C%22MinStockAmount%22%3A-1%2C%22IsShowcaseProduct%22%3A-1%2C%22IsOpportunityProduct%22%3A-1%2C%22FastShipping%22%3A-1%2C%22IsNewProduct%22%3A-1%2C%22IsDiscountedProduct%22%3A-1%2C%22IsShippingFree%22%3A-1%2C%22IsProductCombine%22%3A-1%2C%22MinPrice%22%3A0%2C%22MaxPrice%22%3A0%2C%22Point%22%3A0%2C%22SearchKeyword%22%3A%22%22%2C%22StrProductIds%22%3A%22${prodID}%22%2C%22IsSimilarProduct%22%3Afalse%2C%22RelatedProductId%22%3A0%2C%22ProductKeyword%22%3A%22%22%2C%22PageContentId%22%3A0%2C%22StrProductIDNotEqual%22%3A%22%22%2C%22IsVariantList%22%3A-1%2C%22IsVideoProduct%22%3A-1%2C%22ShowBlokVideo%22%3A-1%2C%22VideoSetting%22%3A%7B%22ShowProductVideo%22%3A0%2C%22AutoPlayVideo%22%3A-1%7D%2C%22ShowList%22%3A1%2C%22VisibleImageCount%22%3A6%2C%22ShowCounterProduct%22%3A-1%2C%22ImageSliderActive%22%3Afalse%2C%22ProductListPageId%22%3A0%2C%22ShowGiftHintActive%22%3Afalse%7D&PagingJson=%7B%22PageItemCount%22%3A4%2C%22PageNumber%22%3A1%2C%22OrderBy%22%3A%22uk.ID%22%2C%22OrderDirection%22%3A%22DESC%22%7D`
  );
  try {
    const response = await axios.get(prodURL);
    const productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "tozlu";
    const group_url = link;
    let script;
    for (let i = 0; i < $("script").length; i++) {
      const element = $("script")[i];
      if (element.children[0]?.data?.includes("var productDetailModel = ")) {
        script = JSON.parse(
          element?.children[0]?.data
            .split("var productDetailModel = ")[1]
            .split(";//]]")[0]
            .split(";")[0]
        );
      }
    }
    const colors = [script.productVariantData[0].tanim];
    const sizes = script.productVariantData.map((v) => {
      if (v.ekSecenekTipiTanim === "Beden" && v.stokAdedi > 0) {
        return v.tanim;
      }
    });
    const images = [];
    const name = script.productName;
    const orjprice = script.productPriceStr + " TL";
    const price = data?.products[0]?.opportunityProduct
      ? (
        +(+script.productPriceStr.replace(",", ".") * 0.8).toFixed(2) + " TL"
      ).replace(".", ",")
      : script.productPriceStr + " TL";
    const imageUrl = script.productImages[0].bigImagePath;
    const description = $(".detay_aciklama").text();
    $(".SmallImages .AltImgCapSmallImg").map((index, element) => {
      images.push(
        $(element).find("img").attr("src").replace("/thumb", "/buyuk")
      );
    });
    productsDetails.push({
      name,
      orjprice,
      price,
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
    const response = await axios.get(link);

    const outerhtml = response.data;

    const dataTable = cheerio.load(outerhtml);
    const script = dataTable('script:contains("window.__SEARCH_APP_INITIAL_STATE__")')[0].children[0].data
    const truncatedScript = eval(script.split("\"group\":\"BRAND\",\"type\":\"WebBrand\",\"title\":\"Marka\",\"filterKey\":\"WebBrand\"")[1].split(",\"id\":\"-103\"")[0].split("\"values\":")[1], (err) => { console.log(err) })
    const toJsonData = [{
      sheet: "num of product",
      columns: [
        { label: "Name", value: "Name" },
        { label: "Count", value: "Count" },
        { label: "URL", value: "URL" },
      ],
      content: [],
    }];
    for (let i = 0; i < truncatedScript.length; i++) {
      const element = truncatedScript[i];
      toJsonData[0].content.push({
        Name: element.text,
        Count: element.count,
        URL: baseURL + element.url,
      })
    }
    let settings = {
      fileName: link.split(baseURL + "/")[1].split("?")[0], // Name of the resulting spreadsheet
      extraLength: 6, // A bigger number means that columns will be wider
      writeMode: "writeFile", // The available parameters are 'WriteFile' and 'write'. This setting is optional. Useful in such cases https://docs.sheetjs.com/docs/solutions/output#example-remote-file
      writeOptions: {}, // Style options from https://docs.sheetjs.com/docs/api/write-options
      RTL: false, // Display the columns from right-to-left (the default value is false)
    }
    xlsx(toJsonData, settings)
    // console.log(toJsonData[0].content)
    // return await getProduct(urls[0], link);
    // return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
